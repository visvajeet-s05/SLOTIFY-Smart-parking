# Multi-Region Active-Active Infrastructure Variables
# Terraform input variables for global deployment

# Environment Configuration
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "slotify"
}

# Domain and DNS Configuration
variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "slotify.com"
}

variable "subdomain_pattern" {
  description = "Subdomain pattern for regional endpoints"
  type        = string
  default     = "api"
}

# Network Configuration
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_waf" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = true
}

# Database Configuration
variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "14.9"
}

variable "db_backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment for database"
  type        = bool
  default     = true
}

# Kubernetes Configuration
variable "kubernetes_version" {
  description = "Kubernetes version for EKS clusters"
  type        = string
  default     = "1.28"
}

variable "node_instance_type" {
  description = "EC2 instance type for Kubernetes nodes"
  type        = string
  default     = "t3.medium"
}

variable "min_nodes" {
  description = "Minimum number of Kubernetes nodes per region"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of Kubernetes nodes per region"
  type        = number
  default     = 10
}

variable "node_disk_size" {
  description = "Disk size for Kubernetes nodes in GB"
  type        = number
  default     = 50
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable monitoring and logging"
  type        = bool
  default     = true
}

variable "monitoring_retention_days" {
  description = "Log retention period in days"
  type        = number
  default     = 30
}

variable "metrics_retention_days" {
  description = "Metrics retention period in days"
  type        = number
  default     = 90
}

# Load Balancer Configuration
variable "load_balancer_type" {
  description = "Type of load balancer (application, network)"
  type        = string
  default     = "application"
}

variable "load_balancer_idle_timeout" {
  description = "Load balancer idle timeout in seconds"
  type        = number
  default     = 60
}

variable "health_check_path" {
  description = "Health check path for load balancer"
  type        = string
  default     = "/api/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

# Security Configuration
variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all storage"
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
  default     = null
}

# Cost Management
variable "enable_cost_allocation_tags" {
  description = "Enable cost allocation tags"
  type        = bool
  default     = true
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
  default     = "engineering"
}

variable "budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 5000
}

# Alerting Configuration
variable "alert_email_addresses" {
  description = "Email addresses for alerts"
  type        = list(string)
  default     = []
}

variable "alert_sns_topic" {
  description = "SNS topic ARN for alerts"
  type        = string
  default     = null
}

variable "enable_slack_notifications" {
  description = "Enable Slack notifications"
  type        = bool
  default     = false
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = null
  sensitive   = true
}

# Application Configuration
variable "app_image_repository" {
  description = "Docker image repository for the application"
  type        = string
  default     = "public.ecr.aws/slotify/slotify-app"
}

variable "app_image_tag" {
  description = "Docker image tag for the application"
  type        = string
  default     = "latest"
}

variable "app_replica_count" {
  description = "Number of application replicas per region"
  type        = number
  default     = 3
}

variable "app_cpu_request" {
  description = "CPU request for application pods"
  type        = string
  default     = "100m"
}

variable "app_memory_request" {
  description = "Memory request for application pods"
  type        = string
  default     = "256Mi"
}

variable "app_cpu_limit" {
  description = "CPU limit for application pods"
  type        = string
  default     = "500m"
}

variable "app_memory_limit" {
  description = "Memory limit for application pods"
  type        = string
  default     = "1Gi"
}

# Redis Configuration
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_clusters" {
  description = "Number of Redis cache clusters"
  type        = number
  default     = 1
}

variable "redis_automatic_failover_enabled" {
  description = "Enable automatic failover for Redis"
  type        = bool
  default     = true
}

# Message Queue Configuration
variable "message_queue_type" {
  description = "Type of message queue (sqs, sns, kafka)"
  type        = string
  default     = "sqs"
}

variable "message_retention_period" {
  description = "Message retention period in seconds"
  type        = number
  default     = 345600  # 4 days
}

variable "max_message_size" {
  description = "Maximum message size in bytes"
  type        = number
  default     = 262144  # 256 KB
}

# Backup and Disaster Recovery
variable "enable_backups" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_schedule" {
  description = "Backup schedule (cron expression)"
  type        = string
  default     = "0 2 * * *"
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 30
}

variable "enable_cross_region_replication" {
  description = "Enable cross-region backup replication"
  type        = bool
  default     = true
}

# Development and Testing
variable "enable_debug_mode" {
  description = "Enable debug mode for development"
  type        = bool
  default     = false
}

variable "enable_profiling" {
  description = "Enable application profiling"
  type        = bool
  default     = false
}

variable "debug_log_level" {
  description = "Debug log level"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.debug_log_level)
    error_message = "Log level must be one of: debug, info, warn, error."
  }
}

# Feature Flags
variable "enable_feature_flags" {
  description = "Enable feature flag system"
  type        = bool
  default     = true
}

variable "feature_flags" {
  description = "Feature flags configuration"
  type = map(object({
    name        = string
    enabled     = bool
    description = string
  }))
  default = {}
}

# Compliance and Security
variable "enable_compliance_monitoring" {
  description = "Enable compliance monitoring"
  type        = bool
  default     = true
}

variable "compliance_frameworks" {
  description = "Compliance frameworks to monitor"
  type        = list(string)
  default     = ["SOC2", "GDPR"]
}

variable "enable_audit_logging" {
  description = "Enable audit logging"
  type        = bool
  default     = true
}

variable "audit_log_retention_days" {
  description = "Audit log retention period in days"
  type        = number
  default     = 365
}

# Outputs Configuration
variable "enable_outputs" {
  description = "Enable output variables"
  type        = bool
  default     = true
}

variable "sensitive_outputs" {
  description = "List of sensitive output variables"
  type        = list(string)
  default     = ["database_password", "api_keys", "secrets"]
}