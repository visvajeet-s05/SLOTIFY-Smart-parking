# Regional module variables
# Variables for regional infrastructure

variable "region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
}

variable "db_allocated_storage" {
  description = "Database allocated storage"
  type        = number
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "14.9"
}

variable "db_backup_retention_period" {
  description = "Database backup retention period"
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for database"
  type        = bool
  default     = true
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
}

variable "node_instance_type" {
  description = "EC2 instance type for nodes"
  type        = string
}

variable "min_nodes" {
  description = "Minimum number of nodes"
  type        = number
}

variable "max_nodes" {
  description = "Maximum number of nodes"
  type        = number
}

variable "node_disk_size" {
  description = "Node disk size"
  type        = number
  default     = 50
}

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

variable "monitoring_retention_days" {
  description = "Log retention days"
  type        = number
  default     = 30
}

variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "KMS key ARN"
  type        = string
  default     = null
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
}