# Global resources module for multi-region deployment
# DNS, networking, and shared services

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Route53 Hosted Zone
resource "aws_route53_zone" "main" {
  name = var.domain_name
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-dns"
    }
  )
}

# Global SSL Certificate
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  
  subject_alternative_names = [
    "*.${var.domain_name}"
  ]
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ssl"
    }
  )
}

# Certificate validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# CloudWatch Log Group for global logs
resource "aws_cloudwatch_log_group" "global" {
  name              = "/aws/slotify/${var.environment}/global"
  retention_in_days = var.monitoring_retention_days
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-global-logs"
    }
  )
}

# SNS Topic for global alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-alerts"
    }
  )
}

# SNS Topic subscriptions
resource "aws_sns_topic_subscription" "email_subscriptions" {
  for_each = toset(var.alert_email_addresses)
  
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = each.key
}

# WAF Web ACL
resource "aws_wafv2_web_acl" "main" {
  count = var.enable_waf ? 1 : 0
  
  name        = "${var.project_name}-${var.environment}-waf"
  description = "WAF for Slotify application"
  scope       = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "commonruleset"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "waf"
    sampled_requests_enabled   = true
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-waf"
    }
  )
}

# WAF IP Set for allowed IPs
resource "aws_wafv2_ip_set" "allowed_ips" {
  count = var.enable_waf ? 1 : 0
  
  name               = "${var.project_name}-${var.environment}-allowed-ips"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"
  addresses          = var.allowed_cidr_blocks
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-allowed-ips"
    }
  )
}

# Cost allocation tags
resource "aws_ce_cost_category" "main" {
  name = "${var.project_name}-${var.environment}-cost-category"
  
  rule {
    rule {
      dimension {
        key           = "USAGE_TYPE"
        values        = ["*"]
        match_options = ["WILDCARD"]
      }
    }
    
    type = "INHERITED_VALUE"
    inherited_value {
      dimension_key = "CostCenter"
    }
  }
  
  rule {
    rule {
      dimension {
        key           = "SERVICE"
        values        = ["Amazon Elastic Compute Cloud - Compute"]
        match_options = ["EQUALS"]
      }
    }
    
    type = "REGULAR"
    value = "Compute"
  }
  
  effective_start = formatdate("YYYY-MM-DD'T'hh:mm:ss'Z'", timeadd(timestamp(), "-1d"))
}

# Budget alert
resource "aws_budgets_budget" "main" {
  name              = "${var.project_name}-${var.environment}-budget"
  budget_type       = "COST"
  limit_amount      = var.budget_amount
  limit_unit        = "USD"
  time_period_start = formatdate("YYYY-MM-01'00:00'", timestamp())
  time_unit         = "MONTHLY"
  
  cost_filters = {
    "UsageType" = ["*"]
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.alert_email_addresses
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-budget"
    }
  )
}

# Global IAM roles and policies
resource "aws_iam_role" "global_services" {
  name = "${var.project_name}-${var.environment}-global-services"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "events.amazonaws.com",
            "backup.amazonaws.com"
          ]
        }
      }
    ]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-global-services"
    }
  )
}

resource "aws_iam_policy" "global_services" {
  name        = "${var.project_name}-${var.environment}-global-services-policy"
  description = "Policy for global services"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.alerts.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "global_services" {
  role       = aws_iam_role.global_services.name
  policy_arn = aws_iam_policy.global_services.arn
}

# Outputs
output "zone_id" {
  description = "Route53 Zone ID"
  value       = aws_route53_zone.main.id
}

output "certificate_arn" {
  description = "SSL Certificate ARN"
  value       = aws_acm_certificate_validation.main.certificate_arn
}

output "alert_sns_topic" {
  description = "SNS Topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "waf_arn" {
  description = "WAF Web ACL ARN"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
}

output "common_tags" {
  description = "Common tags for all resources"
  value       = var.common_tags
}