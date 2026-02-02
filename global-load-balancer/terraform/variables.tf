# Global Load Balancer Variables
# Variables for global traffic management

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "region_endpoints" {
  description = "Regional endpoint mappings"
  type        = map(string)
}

variable "vpc_ids" {
  description = "VPC IDs by region"
  type        = map(string)
}

variable "subnet_ids" {
  description = "Subnet IDs by region"
  type        = map(list(string))
}

variable "zone_id" {
  description = "Route53 zone ID"
  type        = string
}

variable "certificate_arn" {
  description = "SSL certificate ARN"
  type        = string
}

variable "log_bucket" {
  description = "S3 bucket for logs"
  type        = string
}

variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/api/health"
}

variable "alert_sns_topic" {
  description = "SNS topic for alerts"
  type        = string
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}