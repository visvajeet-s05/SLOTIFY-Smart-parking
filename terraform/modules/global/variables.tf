# Global module variables
# Variables for global resources

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for DNS"
  type        = string
}

variable "allowed_cidr_blocks" {
  description = "Allowed CIDR blocks"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_waf" {
  description = "Enable WAF"
  type        = bool
  default     = true
}

variable "monitoring_retention_days" {
  description = "Log retention days"
  type        = number
  default     = 30
}

variable "alert_email_addresses" {
  description = "Email addresses for alerts"
  type        = list(string)
  default     = []
}

variable "budget_amount" {
  description = "Monthly budget amount"
  type        = number
  default     = 5000
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "Slotify"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}