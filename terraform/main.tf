# Multi-Region Active-Active Infrastructure for Slotify
# Terraform configuration for global deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
  
  backend "s3" {
    bucket         = "slotify-terraform-state"
    key           = "multi-region/terraform.tfstate"
    region        = "us-east-1"
    encrypt       = true
    dynamodb_table = "terraform-locks"
  }
}

# Providers for each region
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu-west-1"
  region = "eu-west-1"
}

provider "aws" {
  alias  = "asia-south1"
  region = "asia-south1"
}

# Global resources
module "global" {
  source = "./modules/global"
  
  environment = var.environment
  project_name = var.project_name
  
  # DNS and networking
  domain_name = var.domain_name
  subdomain_pattern = var.subdomain_pattern
  
  # Security
  allowed_cidr_blocks = var.allowed_cidr_blocks
  enable_waf = var.enable_waf
}

# Regional modules
module "region_us" {
  source = "./modules/region"
  providers = {
    aws = aws.us-east-1
  }
  
  region = "us-east-1"
  environment = var.environment
  project_name = var.project_name
  
  # VPC Configuration
  vpc_cidr = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  # Database
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  
  # Kubernetes
  cluster_version = var.kubernetes_version
  node_instance_type = var.node_instance_type
  min_nodes = var.min_nodes
  max_nodes = var.max_nodes
  
  # Monitoring
  enable_monitoring = true
  monitoring_retention_days = 30
  
  # Dependencies
  vpc_id = module.global.vpc_id
  subnet_ids = module.global.subnet_ids
  security_group_ids = module.global.security_group_ids
}

module "region_eu" {
  source = "./modules/region"
  providers = {
    aws = aws.eu-west-1
  }
  
  region = "eu-west-1"
  environment = var.environment
  project_name = var.project_name
  
  # VPC Configuration
  vpc_cidr = "10.1.0.0/16"
  availability_zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  
  # Database
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  
  # Kubernetes
  cluster_version = var.kubernetes_version
  node_instance_type = var.node_instance_type
  min_nodes = var.min_nodes
  max_nodes = var.max_nodes
  
  # Monitoring
  enable_monitoring = true
  monitoring_retention_days = 30
  
  # Dependencies
  vpc_id = module.global.vpc_id
  subnet_ids = module.global.subnet_ids
  security_group_ids = module.global.security_group_ids
}

module "region_asia" {
  source = "./modules/region"
  providers = {
    aws = aws.asia-south1
  }
  
  region = "asia-south1"
  environment = var.environment
  project_name = var.project_name
  
  # VPC Configuration
  vpc_cidr = "10.2.0.0/16"
  availability_zones = ["asia-south1-a", "asia-south1-b", "asia-south1-c"]
  
  # Database
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  
  # Kubernetes
  cluster_version = var.kubernetes_version
  node_instance_type = var.node_instance_type
  min_nodes = var.min_nodes
  max_nodes = var.max_nodes
  
  # Monitoring
  enable_monitoring = true
  monitoring_retention_days = 30
  
  # Dependencies
  vpc_id = module.global.vpc_id
  subnet_ids = module.global.subnet_ids
  security_group_ids = module.global.security_group_ids
}

# Cross-region networking
module "vpc_peering" {
  source = "./modules/vpc-peering"
  
  environment = var.environment
  project_name = var.project_name
  
  regions = ["us-east-1", "eu-west-1", "asia-south1"]
  
  # VPC IDs from regional modules
  vpc_ids = {
    "us-east-1" = module.region_us.vpc_id
    "eu-west-1" = module.region_eu.vpc_id
    "asia-south1" = module.region_asia.vpc_id
  }
  
  # Subnet IDs for peering
  subnet_ids = {
    "us-east-1" = module.region_us.subnet_ids
    "eu-west-1" = module.region_eu.subnet_ids
    "asia-south1" = module.region_asia.subnet_ids
  }
}

# Global load balancer and DNS
module "global_load_balancer" {
  source = "./modules/global-load-balancer"
  
  environment = var.environment
  project_name = var.project_name
  
  # Regional endpoints
  region_endpoints = {
    "us-east-1" = module.region_us.load_balancer_dns
    "eu-west-1" = module.region_eu.load_balancer_dns
    "asia-south1" = module.region_asia.load_balancer_dns
  }
  
  # Health check configuration
  health_check_path = "/api/health"
  health_check_interval = 30
  health_check_timeout = 5
  healthy_threshold = 3
  unhealthy_threshold = 3
  
  # DNS configuration
  domain_name = var.domain_name
  subdomain_pattern = var.subdomain_pattern
}

# Global monitoring and alerting
module "global_monitoring" {
  source = "./modules/global-monitoring"
  
  environment = var.environment
  project_name = var.project_name
  
  # Regional metrics sources
  region_metrics = {
    "us-east-1" = module.region_us.cloudwatch_metrics
    "eu-west-1" = module.region_eu.cloudwatch_metrics
    "asia-south1" = module.region_asia.cloudwatch_metrics
  }
  
  # Alerting configuration
  alert_sns_topic = module.global.alert_sns_topic
  alert_email_addresses = var.alert_email_addresses
  
  # Retention and storage
  metrics_retention_days = 90
  logs_retention_days = 30
}

# Outputs
output "global_dns_name" {
  description = "Global DNS name for the application"
  value       = module.global_load_balancer.dns_name
}

output "region_endpoints" {
  description = "Regional endpoints"
  value = {
    us = module.region_us.load_balancer_dns
    eu = module.region_eu.load_balancer_dns
    asia = module.region_asia.load_balancer_dns
  }
}

output "database_endpoints" {
  description = "Regional database endpoints"
  value = {
    us = module.region_us.db_endpoint
    eu = module.region_eu.db_endpoint
    asia = module.region_asia.db_endpoint
  }
}

output "kubernetes_configs" {
  description = "Kubernetes configuration for each region"
  value = {
    us = module.region_us.kubeconfig
    eu = module.region_eu.kubeconfig
    asia = module.region_asia.kubeconfig
  }
  sensitive = true
}