# Ready Criteria Before Coding (Franchise → SaaS)

## Goal
Define strict entry criteria before starting implementation in `rbcrm-saas`.

## A. Scope and architecture
- [ ] Migration scope approved: keep/remove/rewrite list is fixed.
- [ ] No dependency on modifying `rbike-crm` repo.
- [ ] Domain boundaries confirmed for rentals, clients, bikes, AKB, payments, expenses, documents, profit per bike.

## B. Tenant isolation baseline
- [ ] Tenant model defined (`tenant_id` ownership for all core entities).
- [ ] Access model defined (tenant-local roles, no franchise hierarchy).
- [ ] API boundary rules documented (tenant context required on all endpoints).
- [ ] Job/report/export/document access tenant rules documented.

## C. Finance and market specifics (RU/RUB)
- [ ] RUB monetary policy approved (precision + rounding).
- [ ] Canonical profit-per-bike formula approved.
- [ ] Source-of-truth mapping approved for payments/expenses/bike linkage.

## D. Migration safety
- [ ] Data migration mapping franchise→tenant approved.
- [ ] Risks and mitigations approved from tenant risk matrix.
- [ ] Go/no-go rollback principles documented for early rollout phases.

## E. Delivery governance
- [ ] Work breakdown into small, reviewable steps approved by Lead Agent.
- [ ] No coding starts before explicit "go" after document review.
- [ ] Definition of Done for phase-1 agreed (security + domain correctness first).

## Minimum gate to start coding
Coding may start only when all checkboxes in sections A–E are approved.
