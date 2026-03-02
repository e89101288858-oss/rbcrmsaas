import type { TenantEntity } from "../domain/types.js";

export class InMemoryRepository<T extends TenantEntity> {
  constructor(private readonly rows: T[]) {}

  list(where: { tenantId: string }): T[] {
    return this.rows.filter((row) => row.tenantId === where.tenantId);
  }

  getById(id: string): T | undefined {
    return this.rows.find((row) => row.id === id);
  }

  save(row: T): T {
    const idx = this.rows.findIndex((existing) => existing.id === row.id);
    if (idx >= 0) {
      this.rows[idx] = row;
    } else {
      this.rows.push(row);
    }

    return row;
  }
}
