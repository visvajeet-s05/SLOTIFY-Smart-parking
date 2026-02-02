#!/bin/bash

# Multi-Region Deployment Script for Slotify
# This script deploys the application across multiple AWS regions

set -euo pipefail

# Configuration
PROJECT_NAME="slotify"
ENVIRONMENT=${ENVIRONMENT:-"production"}
REGIONS=("us-east-1" "eu-west-1" "asia-south1")
AWS_PROFILE=${AWS_PROFILE:-"default"}
KUBECTL_CONTEXT_PREFIX="${PROJECT_NAME}-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        error "Helm is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
        error "AWS credentials are not valid for profile: $AWS_PROFILE"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Deploy global infrastructure
deploy_global_infrastructure() {
    log "Deploying global infrastructure..."
    
    cd terraform/global
    
    # Initialize and apply global infrastructure
    terraform init
    terraform plan -var="environment=$ENVIRONMENT" -var="project_name=$PROJECT_NAME"
    terraform apply -auto-approve -var="environment=$ENVIRONMENT" -var="project_name=$PROJECT_NAME"
    
    # Get outputs
    GLOBAL_DNS_ZONE_ID=$(terraform output -raw dns_zone_id)
    GLOBAL_CERTIFICATE_ARN=$(terraform output -raw certificate_arn)
    GLOBAL_LOG_BUCKET=$(terraform output -raw log_bucket_name)
    
    success "Global infrastructure deployed"
    cd ../..
}

# Deploy regional infrastructure
deploy_regional_infrastructure() {
    log "Deploying regional infrastructure..."
    
    for REGION in "${REGIONS[@]}"; do
        log "Deploying infrastructure for region: $REGION"
        
        cd "terraform/region-$REGION"
        
        # Initialize and apply regional infrastructure
        terraform init
        terraform plan \
            -var="region=$REGION" \
            -var="environment=$ENVIRONMENT" \
            -var="project_name=$PROJECT_NAME" \
            -var="global_dns_zone_id=$GLOBAL_DNS_ZONE_ID" \
            -var="global_certificate_arn=$GLOBAL_CERTIFICATE_ARN" \
            -var="global_log_bucket=$GLOBAL_LOG_BUCKET"
        
        terraform apply -auto-approve \
            -var="region=$REGION" \
            -var="environment=$ENVIRONMENT" \
            -var="project_name=$PROJECT_NAME" \
            -var="global_dns_zone_id=$GLOBAL_DNS_ZONE_ID" \
            -var="global_certificate_arn=$GLOBAL_CERTIFICATE_ARN" \
            -var="global_log_bucket=$GLOBAL_LOG_BUCKET"
        
        # Get regional outputs
        REGION_VPC_ID=$(terraform output -raw vpc_id)
        REGION_SUBNET_IDS=$(terraform output -raw subnet_ids)
        REGION_DB_ENDPOINT=$(terraform output -raw db_endpoint)
        REGION_REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
        
        # Store region-specific variables
        export "${REGION//-/_}_VPC_ID=$REGION_VPC_ID"
        export "${REGION//-/_}_SUBNET_IDS=$REGION_SUBNET_IDS"
        export "${REGION//-/_}_DB_ENDPOINT=$REGION_DB_ENDPOINT"
        export "${REGION//-/_}_REDIS_ENDPOINT=$REGION_REDIS_ENDPOINT"
        
        success "Regional infrastructure deployed for $REGION"
        cd ../../..
    done
}

# Configure Kubernetes contexts
configure_kubernetes() {
    log "Configuring Kubernetes contexts..."
    
    for REGION in "${REGIONS[@]}"; do
        log "Configuring kubectl for region: $REGION"
        
        # Update kubeconfig
        aws eks update-kubeconfig \
            --region "$REGION" \
            --name "${PROJECT_NAME}-${REGION}-${ENVIRONMENT}" \
            --profile "$AWS_PROFILE"
        
        # Set context name
        kubectl config rename-context \
            "arn:aws:eks:$REGION:$(aws sts get-caller-identity --query Account --output text):cluster/${PROJECT_NAME}-${REGION}-${ENVIRONMENT}" \
            "${KUBECTL_CONTEXT_PREFIX}-${REGION}"
        
        # Verify cluster access
        if ! kubectl cluster-info --context="${KUBECTL_CONTEXT_PREFIX}-${REGION}" &> /dev/null; then
            error "Cannot access cluster in region $REGION"
            exit 1
        fi
        
        success "Kubernetes configured for region: $REGION"
    done
}

# Deploy Kubernetes manifests
deploy_kubernetes_manifests() {
    log "Deploying Kubernetes manifests..."
    
    for REGION in "${REGIONS[@]}"; do
        log "Deploying manifests for region: $REGION"
        
        # Set context
        kubectl config use-context "${KUBECTL_CONTEXT_PREFIX}-${REGION}"
        
        # Create namespaces
        kubectl apply -f k8s/namespace.yaml
        
        # Create secrets (region-specific)
        REGION_DB_ENDPOINT_VAR="${REGION//-/_}_DB_ENDPOINT"
        REGION_REDIS_ENDPOINT_VAR="${REGION//-/_}_REDIS_ENDPOINT"
        
        kubectl create secret generic slotify-secrets \
            --from-literal=database-url="postgresql://postgres:password:${!REGION_DB_ENDPOINT_VAR}:5432/slotify" \
            --from-literal=redis-url="redis://${!REGION_REDIS_ENDPOINT_VAR}:6379" \
            --from-literal=jwt-secret="your-super-secret-jwt-key-change-this-in-production" \
            --from-literal=stripe-secret-key="sk_test_your_stripe_secret_key" \
            --namespace=slotify \
            --dry-run=client -o yaml | kubectl apply -f -
        
        # Deploy Redis cluster
        kubectl apply -f k8s/redis-cluster.yaml
        
        # Wait for Redis to be ready
        kubectl wait --for=condition=ready pod -l app=redis --timeout=300s
        
        # Deploy application
        kubectl apply -f k8s/deployment.yaml
        
        # Wait for deployment to be ready
        kubectl rollout status deployment/slotify-app --timeout=600s
        
        # Deploy monitoring
        kubectl apply -f monitoring/prometheus-config.yaml
        
        success "Kubernetes manifests deployed for region: $REGION"
    done
}

# Deploy Kafka cluster
deploy_kafka() {
    log "Deploying Kafka cluster..."
    
    # Use the first region for Kafka (can be configured differently)
    REGION="${REGIONS[0]}"
    kubectl config use-context "${KUBECTL_CONTEXT_PREFIX}-${REGION}"
    
    # Install Strimzi operator
    kubectl create namespace kafka
    kubectl apply -f https://strimzi.io/install/latest?namespace=kafka
    
    # Wait for operator to be ready
    kubectl wait --for=condition=ready pod -l name=strimzi-cluster-operator --timeout=300s -n kafka
    
    # Deploy Kafka cluster
    kubectl apply -f event-driven-sync/kafka-config.yaml
    
    # Wait for Kafka to be ready
    kubectl wait --for=condition=ready pod -l strimzi.io/name=slotify-kafka-kafka --timeout=600s
    
    success "Kafka cluster deployed"
}

# Deploy monitoring stack
deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    for REGION in "${REGIONS[@]}"; do
        log "Deploying monitoring for region: $REGION"
        
        kubectl config use-context "${KUBECTL_CONTEXT_PREFIX}-${REGION}"
        
        # Deploy Grafana
        helm repo add grafana https://grafana.github.io/helm-charts
        helm repo update
        
        helm upgrade --install grafana grafana/grafana \
            --namespace monitoring \
            --create-namespace \
            --set service.type=LoadBalancer \
            --set persistence.enabled=true \
            --set persistence.size=10Gi \
            --set adminPassword=admin123
        
        # Import dashboard
        GRAFANA_POD=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}')
        kubectl cp monitoring/grafana-dashboard.json monitoring/$GRAFANA_POD:/tmp/dashboard.json
        
        success "Monitoring deployed for region: $REGION"
    done
}

# Configure global load balancer
configure_global_load_balancer() {
    log "Configuring global load balancer..."
    
    cd global-load-balancer/terraform
    
    # Get regional load balancer endpoints
    declare -A REGION_ENDPOINTS
    for REGION in "${REGIONS[@]}"; do
        kubectl config use-context "${KUBECTL_CONTEXT_PREFIX}-${REGION}"
        REGION_LB_DNS=$(kubectl get svc -n slotify slotify-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        REGION_ENDPOINTS["$REGION"]="$REGION_LB_DNS"
    done
    
    # Deploy global load balancer
    terraform init
    terraform plan \
        -var="project_name=$PROJECT_NAME" \
        -var="environment=$ENVIRONMENT" \
        -var="region_endpoints={$(IFS=,; echo "${REGION_ENDPOINTS[*]}")}" \
        -var="zone_id=$GLOBAL_DNS_ZONE_ID" \
        -var="certificate_arn=$GLOBAL_CERTIFICATE_ARN" \
        -var="log_bucket=$GLOBAL_LOG_BUCKET"
    
    terraform apply -auto-approve \
        -var="project_name=$PROJECT_NAME" \
        -var="environment=$ENVIRONMENT" \
        -var="region_endpoints={$(IFS=,; echo "${REGION_ENDPOINTS[*]}")}" \
        -var="zone_id=$GLOBAL_DNS_ZONE_ID" \
        -var="certificate_arn=$GLOBAL_CERTIFICATE_ARN" \
        -var="log_bucket=$GLOBAL_LOG_BUCKET"
    
    success "Global load balancer configured"
    cd ../..
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    for REGION in "${REGIONS[@]}"; do
        log "Running health checks for region: $REGION"
        
        kubectl config use-context "${KUBECTL_CONTEXT_PREFIX}-${REGION}"
        
        # Check pod status
        kubectl get pods -n slotify
        
        # Check services
        kubectl get services -n slotify
        
        # Check ingress
        kubectl get ingress -n slotify
        
        # Run application health check
        INGRESS_IP=$(kubectl get ingress -n slotify slotify-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
        if curl -f "http://$INGRESS_IP/api/health" &> /dev/null; then
            success "Health check passed for region: $REGION"
        else
            warning "Health check failed for region: $REGION"
        fi
    done
}

# Generate deployment report
generate_report() {
    log "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Slotify Multi-Region Deployment Report

**Deployment Date:** $(date)
**Environment:** $ENVIRONMENT
**Regions:** ${REGIONS[*]}

## Global Infrastructure
- DNS Zone ID: $GLOBAL_DNS_ZONE_ID
- Certificate ARN: $GLOBAL_CERTIFICATE_ARN
- Log Bucket: $GLOBAL_LOG_BUCKET

## Regional Infrastructure
EOF

    for REGION in "${REGIONS[@]}"; do
        REGION_DB_VAR="${REGION//-/_}_DB_ENDPOINT"
        REGION_REDIS_VAR="${REGION//-/_}_REDIS_ENDPOINT"
        
        cat >> "$REPORT_FILE" << EOF

### Region: $REGION
- VPC ID: ${!REGION_DB_VAR}
- Database Endpoint: ${!REGION_DB_VAR}
- Redis Endpoint: ${!REGION_REDIS_VAR}
- Kubernetes Context: ${KUBECTL_CONTEXT_PREFIX}-${REGION}
EOF
    done
    
    cat >> "$REPORT_FILE" << EOF

## Access Information

### Global Load Balancer
- Domain: api.slotify.com
- CloudFront Distribution: $(terraform -chdir=global-load-balancer/terraform output -raw cloudfront_domain_name)

### Regional Endpoints
EOF

    for REGION in "${REGIONS[@]}"; do
        cat >> "$REPORT_FILE" << EOF
- $REGION: api.$REGION.slotify.com
EOF
    done
    
    cat >> "$REPORT_FILE" << EOF

### Monitoring
- Prometheus: Available in each region
- Grafana: Deployed in each region
- Alerts: Configured via Prometheus rules

## Next Steps
1. Update DNS records to point to the global load balancer
2. Configure SSL certificates for regional endpoints
3. Set up monitoring and alerting dashboards
4. Run load testing to validate performance
5. Configure backup and disaster recovery procedures

## Troubleshooting
- Check pod status: kubectl get pods -n slotify
- Check logs: kubectl logs -f deployment/slotify-app -n slotify
- Check events: kubectl get events -n slotify
EOF

    success "Deployment report generated: $REPORT_FILE"
}

# Main execution
main() {
    log "Starting Slotify multi-region deployment..."
    
    check_prerequisites
    deploy_global_infrastructure
    deploy_regional_infrastructure
    configure_kubernetes
    deploy_kubernetes_manifests
    deploy_kafka
    deploy_monitoring
    configure_global_load_balancer
    run_health_checks
    generate_report
    
    success "Slotify multi-region deployment completed successfully!"
    log "Please review the deployment report for access information and next steps."
}

# Error handling
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"