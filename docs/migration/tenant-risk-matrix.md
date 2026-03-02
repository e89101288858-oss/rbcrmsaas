# Tenant Risk Matrix (SaaS, e-bike rental, RU/RUB)

## Risk grading
- Severity: Critical / High / Medium
- Priority to mitigate: Critical first

## R1. Cross-tenant data leak in API reads
- Severity: Critical
- Scenario: list/detail endpoints return records from another tenant.
- Controls:
  - Mandatory tenant context in every request.
  - Query guardrails: tenant predicate required by default.
  - Negative tests: cross-tenant access must return deny/empty.

## R2. Cross-tenant writes/updates
- Severity: Critical
- Scenario: user updates/deletes bike/rental/payment of another tenant.
- Controls:
  - Authorization checks include tenant ownership.
  - Immutable tenant ownership for core entities.
  - Audit logs for write attempts with tenant mismatch.

## R3. Document storage leakage
- Severity: Critical
- Scenario: document URLs/paths allow access across tenants.
- Controls:
  - Tenant-scoped storage keys/path prefixes.
  - Signed URLs with short TTL and tenant claim checks.
  - Access policy tests for foreign tenant documents.

## R4. Background jobs process mixed-tenant data
- Severity: High
- Scenario: scheduler/report/export runs without tenant boundary.
- Controls:
  - Job payload requires `tenant_id`.
  - Worker rejects jobs without explicit tenant scope.
  - Per-tenant job metrics and alerts.

## R5. Reporting/export mixes tenant datasets
- Severity: High
- Scenario: financial reports/export include чужие rentals/payments/expenses.
- Controls:
  - Report builder enforces tenant filter first.
  - Export preflight validates row tenant consistency.
  - Synthetic cross-tenant test datasets in QA.

## R6. Profit-per-bike miscalculation
- Severity: High
- Scenario: incomplete mapping of payments/expenses/AKB events distorts KPI.
- Controls:
  - Canonical formula and data lineage documented.
  - Reconciliation checks: bike-level totals vs source transactions.
  - Test cases for edge scenarios (refunds, partial expenses, battery swaps).

## R7. RUB rounding/precision drift
- Severity: Medium
- Scenario: inconsistent rounding in totals and profit.
- Controls:
  - Single monetary type/policy for RUB.
  - Deterministic rounding standard applied platform-wide.
  - Snapshot tests for financial calculations.

## R8. Legacy franchise fields silently affect SaaS behavior
- Severity: Medium
- Scenario: hidden dependencies on removed franchise fields break flows.
- Controls:
  - Explicit deprecation map for removed fields.
  - Contract review for all affected read models.
  - Smoke checklist over rental/bike/payment/document flows.

## Mandatory go/no-go controls before coding
- No component may process business data without explicit tenant scope.
- No report/export/document access without tenant isolation check.
- Profit-per-bike and RUB rounding rules must be fixed and testable.
