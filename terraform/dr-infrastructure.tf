# Multi-Region Disaster Recovery Infrastructure

# DR Region Configuration
locals {
  dr_regions = var.dr_regions
  dr_region_count = length(local.dr_regions)
}

# DR Region VPCs
module "dr_vpc" {
  for_each = toset(local.dr_regions)
  source   = "./modules/region"
  
  region              = each.key
  environment         = var.environment
  vpc_cidr            = "10.${index(local.dr_regions, each.key) + 10}.0.0/16"
  availability_zones  = data.aws_availability_zones.available.names
  enable_nat_gateway  = true
  enable_vpn_gateway  = true
  
  # DR-specific configurations
  dr_enabled          = true
  backup_retention_period = 7
  backup_window       = "03:00-04:00"
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# Cross-Region Replication for RDS
resource "aws_db_instance" "primary_rds_dr" {
  for_each = toset(local.dr_regions)
  
  identifier              = "slotify-rds-dr-${each.key}"
  engine                  = "postgres"
  engine_version          = "14.9"
  instance_class          = var.rds_instance_class
  allocated_storage       = 100
  max_allocated_storage   = 1000
  storage_type            = "gp2"
  storage_encrypted       = true
  kms_key_id             = aws_kms_key.rds.arn
  publicly_accessible     = false
  vpc_security_group_ids  = [module.dr_vpc[each.key].security_group_id]
  db_subnet_group_name    = module.dr_vpc[each.key].subnet_group_name
  
  username                = var.db_username
  password                = var.db_password
  port                    = 5432
  parameter_group_name    = aws_db_parameter_group.postgresql.name
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot     = false
  final_snapshot_identifier = "slotify-rds-dr-final-${each.key}-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# Cross-Region Replication for S3
resource "aws_s3_bucket_replication_configuration" "dr_replication" {
  for_each = toset(local.dr_regions)
  
  bucket = aws_s3_bucket.primary.id
  role   = aws_iam_role.s3_replication.arn

  rule {
    id     = "dr-replication-${each.key}"
    status = "Enabled"
    
    priority = 1
    
    filter {
      prefix = ""
    }
    
    destination {
      bucket        = aws_s3_bucket.dr[each.key].arn
      storage_class = "STANDARD_IA"
      
      replication_time {
        status = "Enabled"
        time {
          minutes = 15
        }
      }
      
      metrics {
        status = "Enabled"
        event_threshold {
          minutes = 15
        }
      }
    }
    
    delete_marker_replication {
      status = "Disabled"
    }
  }
}

# DR-specific S3 Buckets
resource "aws_s3_bucket" "dr" {
  for_each = toset(local.dr_regions)
  
  bucket = "slotify-dr-${each.key}-${random_string.bucket_suffix.result}"
  acl    = "private"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = aws_kms_key.s3.arn
      }
    }
  }
  
  lifecycle_rule {
    id      = "transition-to-glacier"
    enabled = true
    
    transition {
      days          = 30
      storage_class = "GLACIER"
    }
    
    transition {
      days          = 90
      storage_class = "DEEP_ARCHIVE"
    }
    
    expiration {
      days = 3650
    }
  }
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# DR-specific Redis Clusters
resource "aws_elasticache_replication_group" "dr_redis" {
  for_each = toset(local.dr_regions)
  
  replication_group_id       = "slotify-redis-dr-${each.key}"
  description               = "Slotify Redis DR Cluster - ${each.key}"
  
  node_type                 = var.redis_node_type
  port                      = 6379
  parameter_group_name      = "default.redis7"
  subnet_group_name         = module.dr_vpc[each.key].redis_subnet_group_name
  security_group_ids        = [module.dr_vpc[each.key].redis_security_group_id]
  
  num_cache_clusters        = 2
  automatic_failover_enabled = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  snapshot_retention_limit = 5
  snapshot_window         = "04:00-06:00"
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# DR-specific Load Balancers
resource "aws_lb" "dr_alb" {
  for_each = toset(local.dr_regions)
  
  name               = "slotify-alb-dr-${each.key}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [module.dr_vpc[each.key].alb_security_group_id]
  subnets            = module.dr_vpc[each.key].public_subnet_ids
  
  enable_deletion_protection = var.environment == "production"
  
  access_logs {
    bucket  = aws_s3_bucket.dr[each.key].id
    prefix  = "alb-logs"
    enabled = true
  }
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# DR-specific ECS Services
resource "aws_ecs_service" "dr_service" {
  for_each = toset(local.dr_regions)
  
  name            = "slotify-dr-service-${each.key}"
  cluster         = aws_ecs_cluster.dr_cluster[each.key].id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.dr_app[each.key].arn
    container_name   = "slotify-app"
    container_port   = 3000
  }
  
  network_configuration {
    security_groups  = [module.dr_vpc[each.key].ecs_security_group_id]
    subnets          = module.dr_vpc[each.key].private_subnet_ids
    assign_public_ip = false
  }
  
  depends_on = [aws_lb_listener.dr_app[each.key]]
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# DR-specific ECS Cluster
resource "aws_ecs_cluster" "dr_cluster" {
  for_each = toset(local.dr_regions)
  
  name = "slotify-dr-cluster-${each.key}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# Route53 Health Checks for DR
resource "aws_route53_health_check" "dr_health_check" {
  for_each = toset(local.dr_regions)
  
  fqdn              = aws_lb.dr_alb[each.key].dns_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health"
  failure_threshold = "3"
  request_interval  = "30"
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# Route53 Failover Records for DR
resource "aws_route53_record" "dr_failover_primary" {
  for_each = toset(local.dr_regions)
  
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "api.slotify.com"
  type    = "A"
  
  set_identifier = "dr-primary-${each.key}"
  ttl     = 60
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  health_check_id = aws_route53_health_check.dr_health_check[each.key].id
  
  alias {
    name                   = aws_lb.dr_alb[each.key].dns_name
    zone_id               = aws_lb.dr_alb[each.key].zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "dr_failover_secondary" {
  for_each = toset(local.dr_regions)
  
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "api.slotify.com"
  type    = "A"
  
  set_identifier = "dr-secondary-${each.key}"
  ttl     = 60
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  alias {
    name                   = aws_lb.primary_alb.dns_name
    zone_id               = aws_lb.primary_alb.zone_id
    evaluate_target_health = true
  }
}

# Backup Vault for DR
resource "aws_backup_vault" "dr_vault" {
  for_each = toset(local.dr_regions)
  
  name        = "slotify-dr-vault-${each.key}"
  kms_key_arn = aws_kms_key.backup.arn
  
  tags = {
    Environment = var.environment
    Region      = each.key
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# Backup Plan for DR
resource "aws_backup_plan" "dr_plan" {
  name = "slotify-dr-plan"
  
  rule {
    rule_name         = "daily-backup"
    target_vault_name = aws_backup_vault.dr_vault[local.dr_regions[0]].name
    schedule          = "cron(0 2 * * ? *)"
    start_window_minutes = 60
    completion_window_minutes = 120
    
    lifecycle {
      move_to_cold_storage_after_days = 30
      delete_after_days              = 365
    }
  }
  
  advanced_backup_setting {
    backup_vault_name = aws_backup_vault.dr_vault[local.dr_regions[0]].name
    resource_type     = "EC2"
    backup_options = {
      WindowsVSS = "enabled"
    }
  }
}

# Backup Selection for DR
resource "aws_backup_selection" "dr_selection" {
  name         = "slotify-dr-selection"
  iam_role_arn = aws_iam_role.backup.arn
  plan_id      = aws_backup_plan.dr_plan.id
  
  resources = [
    aws_db_instance.primary_rds.arn,
    aws_s3_bucket.primary.arn,
    aws_elasticache_replication_group.primary_redis.arn
  ]
  
  condition {
    string_equals = {
      "aws:ResourceTag/Environment" = var.environment
    }
  }
}

# CloudWatch Alarms for DR Monitoring
resource "aws_cloudwatch_metric_alarm" "dr_rds_failover" {
  for_each = toset(local.dr_regions)
  
  alarm_name          = "dr-rds-failover-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Failover"
  namespace           = "AWS/RDS"
  period              = "60"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "This metric monitors RDS failover events"
  alarm_actions       = [aws_sns_topic.dr_alerts.arn]
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.primary_rds.id
  }
}

resource "aws_cloudwatch_metric_alarm" "dr_redis_failover" {
  for_each = toset(local.dr_regions)
  
  alarm_name          = "dr-redis-failover-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CacheMisses"
  namespace           = "AWS/ElastiCache"
  period              = "60"
  statistic           = "Average"
  threshold           = "1000"
  alarm_description   = "This metric monitors Redis cache misses"
  alarm_actions       = [aws_sns_topic.dr_alerts.arn]
  
  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.primary_redis.id
  }
}

# SNS Topic for DR Alerts
resource "aws_sns_topic" "dr_alerts" {
  name = "slotify-dr-alerts"
  
  tags = {
    Environment = var.environment
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# SNS Topic Policy for DR
resource "aws_sns_topic_policy" "dr_alerts_policy" {
  arn = aws_sns_topic.dr_alerts.arn
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudwatch.amazonaws.com"
        }
        Action = "SNS:Publish"
        Resource = aws_sns_topic.dr_alerts.arn
      }
    ]
  })
}

# Lambda Function for DR Automation
resource "aws_lambda_function" "dr_automation" {
  filename         = "dr-automation.zip"
  function_name    = "slotify-dr-automation"
  role            = aws_iam_role.lambda_dr.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("dr-automation.zip")
  runtime         = "nodejs18.x"
  timeout         = 300
  
  environment {
    variables = {
      PRIMARY_REGION = var.primary_region
      DR_REGIONS     = join(",", local.dr_regions)
      SNS_TOPIC_ARN  = aws_sns_topic.dr_alerts.arn
    }
  }
  
  tags = {
    Environment = var.environment
    Purpose     = "Disaster Recovery"
    Terraform   = "true"
  }
}

# Lambda Role for DR
resource "aws_iam_role" "lambda_dr" {
  name = "slotify-lambda-dr-role"
  
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
}

resource "aws_iam_role_policy_attachment" "lambda_dr_policy" {
  role       = aws_iam_role.lambda_dr.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# EventBridge Rule for DR Automation
resource "aws_cloudwatch_event_rule" "dr_trigger" {
  name        = "slotify-dr-trigger"
  description = "Trigger DR automation on critical events"
  
  event_pattern = jsonencode({
    source      = ["aws.rds", "aws.ec2", "aws.elasticloadbalancing"]
    detail-type = ["RDS DB Instance Event", "EC2 Instance State-change Notification", "AWS Health Event"]
  })
}

resource "aws_cloudwatch_event_target" "dr_lambda_target" {
  rule      = aws_cloudwatch_event_rule.dr_trigger.name
  target_id = "DRAutomation"
  arn       = aws_lambda_function.dr_automation.arn
}

# IAM Policy for DR Operations
resource "aws_iam_policy" "dr_operations" {
  name        = "slotify-dr-operations"
  description = "Policy for DR operations"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:StartInstances",
          "ec2:StopInstances",
          "rds:DescribeDBInstances",
          "rds:ModifyDBInstance",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:ModifyLoadBalancerAttributes"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dr_operations_attachment" {
  role       = aws_iam_role.lambda_dr.name
  policy_arn = aws_iam_policy.dr_operations.arn
}