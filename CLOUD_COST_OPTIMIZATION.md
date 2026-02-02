# Cloud Cost Optimization Guide

## 🏆 Recommended (Best Price-Performance)

### Compute
| Service | Choice |
|---------|--------|
| Kubernetes | GKE Autopilot / EKS Fargate |
| Nodes | Spot + On-Demand mix |
| Scaling | HPA + Cluster Autoscaler |

### Database
| DB | Choice |
|----|--------|
| PostgreSQL | AWS RDS / Cloud SQL |
| Backups | Daily + PITR |
| Read replicas | Enabled |

### Cache
| Cache | Choice |
|-------|--------|
| Redis | AWS ElastiCache / Memorystore |

## 💰 Savings Tips
- [ ] Use Spot instances (up to 70% cheaper)
- [ ] Autoscaling only during peak hours
- [ ] CDN caching (reduces server load)
- [ ] DB read replicas
- [ ] Idle resource cleanup