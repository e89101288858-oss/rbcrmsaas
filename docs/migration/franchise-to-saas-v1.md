# Franchise → SaaS Migration Plan v1 (e-bike rental, RU/RUB)

## Scope / Constraints
- Work only in `rbcrm-saas`.
- No changes in `rbike-crm` repository.
- This document is planning-only (no runtime code changes).

## 1) KEEP (1:1)
Domain capabilities to preserve without business reinterpretation:
- Rentals (start/end/extension/cancellation, rental history).
- Clients (profiles, contacts, rental linkage).
- Bikes (inventory, status, utilization linkage with rentals).
- Batteries (AKB lifecycle, assignment to bikes, battery events/history).
- Payments (rental payments, refunds where applicable).
- Expenses (operational and bike-linked costs).
- Profit per bike (core KPI).
- Documents (contracts, acts, payment docs, attachments).

## 2) REMOVE (franchise-only contour)
Must not be ported into SaaS product:
- Franchisee hierarchy and cross-franchise governance model.
- Owner-franchise specific processes/permissions.
- Network royalties and franchise-network billing logic.
- Inter-franchise approvals/escalations/reporting.
- Any ACL/data filtering based on franchise tree.

## 3) REWRITE (for SaaS)
Areas requiring redesign for external multi-tenant SaaS:
- Identity model: franchise-centric entities → tenant/org model.
- Access model: network roles → tenant-local RBAC roles.
- Data model: all business rows become tenant-scoped (`tenant_id` mandatory).
- API contracts: tenant-aware reads/writes and consistent tenant context.
- Document storage: tenant-scoped object paths and access checks.
- Background jobs/reports/exports: tenant-bounded execution only.
- Financial layer for RU market: RUB-only calculations and deterministic rounding.

## 4) Core migration table (v1)
- Keep 1:1: Rentals, Clients, Bikes, AKB, Payments, Expenses, Documents, Profit per bike.
- Remove: Franchise hierarchy, owner-franchise billing/royalties, cross-franchise workflows.
- Rewrite: Identity/RBAC, tenancy boundaries, storage isolation, jobs/exports, RU/RUB finance normalization.

## 5) First safe execution step
- Create approved design baseline only:
  1. Domain inventory (keep/remove/rewrite mapping),
  2. Tenant risk matrix with controls,
  3. Readiness criteria before any coding.
- Output artifacts:
  - `docs/migration/franchise-to-saas-v1.md`
  - `docs/migration/tenant-risk-matrix.md`
  - `docs/migration/ready-criteria.md`
