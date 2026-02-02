#!/bin/bash

# Install Prometheus and Grafana using Helm
echo "Adding Prometheus Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

echo "Installing kube-prometheus-stack..."
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

echo "Setting up Grafana port-forward..."
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring &

echo "Monitoring setup complete!"
echo "Grafana will be available at http://localhost:3001"
echo "Login: admin / prom-operator"