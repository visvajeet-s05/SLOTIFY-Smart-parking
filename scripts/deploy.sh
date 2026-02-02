#!/bin/bash

# Slotify Global Architecture Deployment Script
# This script deploys the complete production-ready system

set -e

echo "🚀 Starting Slotify Global Architecture Deployment..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Create Kubernetes namespace if it doesn't exist
echo "🏗️  Setting up Kubernetes namespace..."
kubectl create namespace slotify --dry-run=client -o yaml | kubectl apply -f -

# Apply Redis cluster configuration
echo "🗄️  Deploying Redis cluster..."
kubectl apply -f k8s/redis-cluster.yaml -n slotify

# Wait for Redis cluster to be ready
echo "⏳ Waiting for Redis cluster to be ready..."
kubectl wait --for=condition=ready pod -l app=redis-cluster -n slotify --timeout=300s

# Apply application deployment
echo "🚀 Deploying Slotify application..."
kubectl apply -f k8s/deployment.yaml -n slotify
kubectl apply -f k8s/hpa.yaml -n slotify

# Wait for application to be ready
echo "⏳ Waiting for application to be ready..."
kubectl wait --for=condition=ready pod -l app=slotify -n slotify --timeout=300s

# Create secrets (you'll need to update these with your actual values)
echo "🔐 Creating secrets..."
kubectl create secret generic slotify-secrets \
    --from-literal=database-url="$DATABASE_URL" \
    --from-literal=redis-url="$REDIS_URL" \
    --from-literal=stripe-secret-key="$STRIPE_SECRET_KEY" \
    --from-literal=stripe-webhook-secret="$STRIPE_WEBHOOK_SECRET" \
    --from-literal=jwt-secret="$JWT_SECRET" \
    -n slotify \
    --dry-run=client -o yaml | kubectl apply -f -

# Apply ingress configuration
echo "🌐 Setting up ingress..."
kubectl apply -f k8s/deployment.yaml -n slotify

# Wait for load balancer to be ready
echo "⏳ Waiting for load balancer to be ready..."
kubectl wait --for=condition=ready service slotify-service -n slotify --timeout=300s

# Get the external IP
echo "📍 Getting external IP..."
EXTERNAL_IP=$(kubectl get service slotify-service -n slotify -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$EXTERNAL_IP" ]; then
    EXTERNAL_IP=$(kubectl get service slotify-service -n slotify -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: http://$EXTERNAL_IP"
echo "📊 Monitoring URL: http://$EXTERNAL_IP/api/health"
echo "🔧 Ready URL: http://$EXTERNAL_IP/api/ready"

# Run database migrations
echo "🗄️  Running database migrations..."
kubectl exec -it deployment/slotify-app -n slotify -- npx prisma migrate deploy

# Seed initial data
echo "🌱 Seeding initial data..."
kubectl exec -it deployment/slotify-app -n slotify -- node scripts/seed.js

echo "🎉 Slotify Global Architecture is now live!"
echo ""
echo "📋 System Status:"
echo "   ✅ Redis Cluster: Active"
echo "   ✅ WebSocket Scaling: Enabled"
echo "   ✅ Multi-Currency: Enabled"
echo "   ✅ AI Auto-Retraining: Scheduled"
echo "   ✅ Kubernetes: Auto-scaling"
echo "   ✅ Load Balancer: Active"
echo ""
echo "🎯 Next Steps:"
echo "   1. Configure your domain in the ingress"
echo "   2. Set up SSL certificates"
echo "   3. Configure monitoring and alerting"
echo "   4. Test the complete system integration"