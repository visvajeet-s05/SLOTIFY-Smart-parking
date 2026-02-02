# SOC-2 Security Checklist

## 🔐 Identity & Access
- [ ] MFA for admins
- [ ] RBAC (Admin / Owner / Customer)
- [ ] Least-privilege IAM
- [ ] Session expiration

## 🔐 Data Protection
- [ ] HTTPS everywhere
- [ ] Encrypted DB (AES-256)
- [ ] Secrets via K8s Secrets / Vault
- [ ] No secrets in code

## 🔐 Application Security
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] SQL injection safe (Prisma)
- [ ] Input validation (Zod)

## 🔐 Infrastructure
- [ ] Private DB network
- [ ] No public DB access
- [ ] WAF (Cloudflare)
- [ ] Audit logs enabled

## 📄 Mandatory Logs
- [ ] Login events
- [ ] Admin actions
- [ ] Payment events
- [ ] Permission changes