# Beta Readiness Checklist v1 (SaaS backend skeleton)

## Technical
- [x] Tenant isolation guard enforced on API entry.
- [x] Plan-gating enforced on core create operations (bikes, rentals, documents, clients, payments).
- [x] Subscription lifecycle state machine + transition validation.
- [x] Idempotency support for subscription transition endpoint.
- [x] Persistence-path tests for billing lifecycle and usage integrity.

## Security
- [x] Distinct denied categories: tenant-denied vs plan-denied.
- [x] Security events for tenant context missing/mismatch.
- [ ] Rate limiting and abuse controls (next step).
- [ ] Audit trail persistence for admin/service mutations (next step).

## Operational
- [x] Storage abstraction defined (swap JSON adapter with DB adapter).
- [x] Billing data model + migration path v1 documented.
- [ ] Scheduled monthly usage reset job wired in runtime (next step).
- [ ] Production DB migrations and transactional boundaries (next step).

## Test/QA
- [x] Unit + integration coverage for lifecycle and gating paths.
- [x] E2E happy/negative paths for onboarding + operations.
- [ ] Concurrency tests for idempotency under parallel requests (next step).

## Exit criteria to Beta-API
- Keep current guarantees + close all unchecked items above.
