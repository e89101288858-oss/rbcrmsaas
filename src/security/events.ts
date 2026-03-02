export type SecurityEvent =
  | {
      type: "TENANT_CONTEXT_MISSING";
      operation: "read" | "write";
      entity: string;
      actorTenantId?: string;
      at: string;
      reason?: string;
    }
  | {
      type: "TENANT_MISMATCH";
      actorTenantId: string;
      resourceTenantId: string;
      operation: "read" | "write";
      entity: string;
      entityId?: string;
      at: string;
    };

export type SecurityEventLogger = {
  log: (event: SecurityEvent) => void;
};

export class InMemorySecurityEventLogger implements SecurityEventLogger {
  public readonly events: SecurityEvent[] = [];

  log(event: SecurityEvent): void {
    this.events.push(event);
  }
}
