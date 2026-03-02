# Operational Runbook v1 (SaaS backend skeleton)

## 1) Local start
1. `npm install`
2. `npm test`
3. Optional smoke: `npm run smoke`

## 2) Health checks (minimal)
- All test suites pass.
- Tenant isolation tests green.
- Billing lifecycle and usage persistence tests green.
- Beta readiness checklist reviewed.

## 3) Demo tenant bootstrap
- Use service endpoint/service flow: `createDemoSeedApi().seedDemoTenant(...)`
- Required role: `service_admin`
- Output: tenant created (or reused), subscription active, demo bike/rental/document seeded.

## 4) Rollback/recovery (minimal)
- Revert to last known good commit (`git revert` or checkout previous tag/commit).
- For file-backed persistence, backup/remove storage files under configured data directory.
- Re-run full test suite and smoke after recovery.

## 5) Incident quick actions
- Tenant access anomalies: inspect tenant mismatch events first.
- Plan denied anomalies: verify subscription state and usage counters.
- Data corruption suspicion: restore from backup and replay deterministic tests.
