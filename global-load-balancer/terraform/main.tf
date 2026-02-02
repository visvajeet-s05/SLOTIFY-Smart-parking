# Global Load Balancer and DNS Configuration
# Multi-region traffic management

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Global CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "${var.project_name}-${var.environment}-global-lb"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Global load balancer for Slotify"
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-global-lb"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.geo_redirect.arn
      include_body = false
    }
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "X-Forwarded-For"]
      cookies {
        forward = "all"
      }
    }
    
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  # Cache behavior for API endpoints
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-global-lb"
    compress               = false
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "X-Forwarded-For", "Content-Type"]
      cookies {
        forward = "all"
      }
    }
    
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }
  
  # Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-${var.environment}-global-lb"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      headers      = []
      cookies {
        forward = "none"
      }
    }
    
    min_ttl                = 86400
    default_ttl            = 86400
    max_ttl                = 31536000
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn            = var.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }
  
  logging_config {
    include_cookies = false
    bucket          = var.log_bucket
    prefix          = "cloudfront/"
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-cloudfront"
    }
  )
}

# Regional Application Load Balancers
resource "aws_lb" "main" {
  for_each = var.region_endpoints
  
  name               = "${var.project_name}-${each.key}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[each.key].id]
  subnets            = var.subnet_ids[each.key]
  
  enable_deletion_protection = var.environment == "production"
  
  access_logs {
    bucket  = var.log_bucket
    prefix  = "alb/${each.key}"
    enabled = true
  }
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${each.key}-${var.environment}-alb"
      Environment = var.environment
      Region      = each.key
    }
  )
}

# ALB Security Groups
resource "aws_security_group" "alb" {
  for_each = var.region_endpoints
  
  name        = "${var.project_name}-${each.key}-${var.environment}-alb-sg"
  description = "Security group for ALB in ${each.key}"
  vpc_id      = var.vpc_ids[each.key]
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${each.key}-${var.environment}-alb-sg"
      Environment = var.environment
      Region      = each.key
    }
  )
}

# ALB Target Groups
resource "aws_lb_target_group" "main" {
  for_each = var.region_endpoints
  
  name        = "${var.project_name}-${each.key}-${var.environment}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_ids[each.key]
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = var.health_check_path
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }
  
  deregistration_delay = 300
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${each.key}-${var.environment}-tg"
      Environment = var.environment
      Region      = each.key
    }
  )
}

# ALB Listeners
resource "aws_lb_listener" "main" {
  for_each = var.region_endpoints
  
  load_balancer_arn = aws_lb.main[each.key].arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main[each.key].arn
  }
}

# Route53 Records for Regional Endpoints
resource "aws_route53_record" "region_endpoints" {
  for_each = var.region_endpoints
  
  zone_id = var.zone_id
  name    = "api.${each.key}.slotify.com"
  type    = "A"
  
  alias {
    name                   = aws_lb.main[each.key].dns_name
    zone_id                = aws_lb.main[each.key].zone_id
    evaluate_target_health = true
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Route53 Record for Global Endpoint
resource "aws_route53_record" "global_endpoint" {
  zone_id = var.zone_id
  name    = "api.slotify.com"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
  
  lifecycle {
    create_before_destroy = true
  }
}

# Lambda Function for Geo-Redirect
resource "aws_lambda_function" "geo_redirect" {
  filename         = "${path.module}/lambda/geo_redirect.zip"
  function_name    = "${var.project_name}-${var.environment}-geo-redirect"
  role             = aws_iam_role.lambda_geo_redirect.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/lambda/geo_redirect.zip")
  runtime          = "nodejs18.x"
  timeout          = 10
  
  environment {
    variables = {
      US_REGION_ENDPOINT   = var.region_endpoints["us-east-1"]
      EU_REGION_ENDPOINT   = var.region_endpoints["eu-west-1"]
      ASIA_REGION_ENDPOINT = var.region_endpoints["asia-south1"]
    }
  }
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-geo-redirect"
      Environment = var.environment
    }
  )
}

# Lambda IAM Role
resource "aws_iam_role" "lambda_geo_redirect" {
  name = "${var.project_name}-${var.environment}-lambda-geo-redirect"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-lambda-geo-redirect"
      Environment = var.environment
    }
  )
}

resource "aws_iam_role_policy_attachment" "lambda_geo_redirect" {
  role       = aws_iam_role.lambda_geo_redirect.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Health Check for Regional Endpoints
resource "aws_cloudwatch_metric_alarm" "region_health" {
  for_each = var.region_endpoints
  
  alarm_name          = "${var.project_name}-${each.key}-${var.environment}-health"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "This metric monitors ALB health in ${each.key}"
  alarm_actions       = [var.alert_sns_topic]
  
  dimensions = {
    LoadBalancer = aws_lb.main[each.key].arn_suffix
  }
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${each.key}-${var.environment}-health"
      Environment = var.environment
      Region      = each.key
    }
  )
}

# CloudWatch Dashboard for Global Monitoring
resource "aws_cloudwatch_dashboard" "global_monitoring" {
  dashboard_name = "${var.project_name}-${var.environment}-global-monitoring"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "${var.project_name}-us-east-1-${var.environment}-alb", { yAxis: "left" }],
            [".", "RequestCount", ".", "${var.project_name}-eu-west-1-${var.environment}-alb", { yAxis: "left" }],
            [".", "RequestCount", ".", "${var.project_name}-asia-south1-${var.environment}-alb", { yAxis: "left" }]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "Request Count by Region"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "${var.project_name}-us-east-1-${var.environment}-alb", { yAxis: "left" }],
            [".", "TargetResponseTime", ".", "${var.project_name}-eu-west-1-${var.environment}-alb", { yAxis: "left" }],
            [".", "TargetResponseTime", ".", "${var.project_name}-asia-south1-${var.environment}-alb", { yAxis: "left" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "Response Time by Region"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 24
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.main.id, { yAxis: "left" }],
            [".", "BytesDownloaded", ".", ".", { yAxis: "right" }]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "CloudFront Global Metrics"
        }
      }
    ]
  })
  
  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-global-monitoring"
      Environment = var.environment
    }
  )
}

# Outputs
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_zone_id" {
  description = "CloudFront distribution zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "regional_lb_dns_names" {
  description = "Regional load balancer DNS names"
  value       = { for key, lb in aws_lb.main : key => lb.dns_name }
}

output "regional_lb_zone_ids" {
  description = "Regional load balancer zone IDs"
  value       = { for key, lb in aws_lb.main : key => lb.zone_id }
}