# Regional infrastructure module
# VPC, EKS, RDS, and other regional resources

terraform {
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
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-vpc"
      Type = "Regional"
    }
  )
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-igw"
    }
  )
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-public-${count.index}"
      Type = "Public"
    }
  )
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-private-${count.index}"
      Type = "Private"
    }
  )
}

# NAT Gateways
resource "aws_eip" "nat" {
  count = length(var.availability_zones)
  
  domain = "vpc"
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-nat-${count.index}"
    }
  )
}

resource "aws_nat_gateway" "main" {
  count = length(var.availability_zones)
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-nat-${count.index}"
    }
  )
  
  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-public-rt"
    }
  )
}

resource "aws_route_table" "private" {
  count = length(var.availability_zones)
  
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-private-rt-${count.index}"
    }
  )
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "eks_cluster" {
  name_prefix = "${var.project_name}-${var.region}-${var.environment}-eks-cluster-"
  vpc_id      = aws_vpc.main.id
  
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
      Name = "${var.project_name}-${var.region}-${var.environment}-eks-cluster"
    }
  )
}

resource "aws_security_group" "eks_nodes" {
  name_prefix = "${var.project_name}-${var.region}-${var.environment}-eks-nodes-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }
  
  ingress {
    from_port   = 1025
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
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
      Name = "${var.project_name}-${var.region}-${var.environment}-eks-nodes"
    }
  )
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.region}-${var.environment}-rds-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-rds"
    }
  )
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-${var.region}-${var.environment}-redis-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-redis"
    }
  )
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-${var.region}-${var.environment}"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.kubernetes_version
  
  vpc_config {
    subnet_ids              = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.eks_cluster.id]
  }
  
  encryption_config {
    provider {
      key_arn = var.kms_key_arn
    }
    resources = ["secrets"]
  }
  
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
  ]
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-eks"
    }
  )
}

# EKS Cluster IAM Role
resource "aws_iam_role" "eks_cluster" {
  name = "${var.project_name}-${var.region}-${var.environment}-eks-cluster"
  
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-eks-cluster"
    }
  )
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster.name
}

# EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-${var.region}-${var.environment}-nodes"
  node_role_arn   = aws_iam_role.eks_node_group.arn
  subnet_ids      = aws_subnet.private[*].id
  
  instance_types = [var.node_instance_type]
  
  scaling_config {
    desired_size = var.min_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }
  
  update_config {
    max_unavailable = 1
  }
  
  labels = {
    Environment = var.environment
    Project     = var.project_name
  }
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-nodes"
    }
  )
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ec2_container_registry_read_only,
  ]
}

# EKS Node Group IAM Role
resource "aws_iam_role" "eks_node_group" {
  name = "${var.project_name}-${var.region}-${var.environment}-eks-nodes"
  
  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-eks-nodes"
    }
  )
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_group.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_group.name
}

resource "aws_iam_role_policy_attachment" "ec2_container_registry_read_only" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_group.name
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.region}-${var.environment}-rds"
  subnet_ids = aws_subnet.private[*].id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-rds-subnet-group"
    }
  )
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier              = "${var.project_name}-${var.region}-${var.environment}-db"
  engine                  = "postgres"
  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_allocated_storage * 2
  storage_type            = "gp2"
  storage_encrypted       = var.enable_encryption_at_rest
  kms_key_id              = var.kms_key_arn
  publicly_accessible     = false
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  username                = "postgres"
  password                = random_password.db_password.result
  backup_retention_period = var.db_backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  multi_az                = var.db_multi_az
  skip_final_snapshot     = var.environment != "production"
  deletion_protection     = var.environment == "production"
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-db"
    }
  )
}

# Redis Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.region}-${var.environment}-redis"
  subnet_ids = aws_subnet.private[*].id
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-redis-subnet-group"
    }
  )
}

# Redis Cluster
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-${var.region}-${var.environment}-redis"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = var.redis_num_cache_clusters
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  parameter_group_name = "default.redis6.x"
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.region}-${var.environment}-redis"
    }
  )
}

# CloudWatch Log Group for region
resource "aws_cloudwatch_log_group" "region" {
  name              = "/aws/slotify/${var.environment}/${var.region}"
  retention_in_days = var.monitoring_retention_days
  
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-${var.region}-logs"
    }
  )
}

# IAM Policy for region
resource "aws_iam_policy" "region_services" {
  name        = "${var.project_name}-${var.region}-${var.environment}-region-services"
  description = "Policy for regional services"
  
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
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "region_services" {
  role       = aws_iam_role.eks_node_group.name
  policy_arn = aws_iam_policy.region_services.arn
}

# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = false
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "subnet_ids" {
  description = "Subnet IDs"
  value       = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
}

output "security_group_ids" {
  description = "Security Group IDs"
  value = {
    eks_cluster = aws_security_group.eks_cluster.id
    eks_nodes   = aws_security_group.eks_nodes.id
    rds         = aws_security_group.rds.id
    redis       = aws_security_group.redis.id
  }
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "load_balancer_dns" {
  description = "Load balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "cloudwatch_metrics" {
  description = "CloudWatch metrics configuration"
  value = {
    log_group_name = aws_cloudwatch_log_group.region.name
    retention_days = var.monitoring_retention_days
  }
}

output "kubeconfig" {
  description = "Kubernetes configuration"
  value       = data.aws_eks_cluster_auth.main[0].token
  sensitive   = true
}