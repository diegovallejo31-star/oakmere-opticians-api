import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type {
  ContactPlan,
  ContactPlanRow,
  ContactPlanStatus,
  NewContactPlan,
} from './contactPlan.types';

export function toContactPlan(row: ContactPlanRow): ContactPlan {
  return {
    id: row.id,
    patientId: row.patient_id,
    startedOn: row.started_on,
    monthlyPence: row.monthly_pence,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface ContactPlanFilter {
  status?: ContactPlanStatus;
}

export class ContactPlanRepository {
  constructor(private readonly db: Database) {}

  create(input: NewContactPlan): ContactPlan {
    const row = this.db
      .prepare(
        `INSERT INTO contact_plans (patient_id, started_on, monthly_pence)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientId,
        input.startedOn,
        input.monthlyPence,
      ) as unknown as ContactPlanRow;
    return toContactPlan(row);
  }

  findById(id: number): ContactPlan | null {
    const row = this.db
      .prepare('SELECT * FROM contact_plans WHERE id = ?')
      .get(id) as unknown as ContactPlanRow | undefined;
    return row ? toContactPlan(row) : null;
  }

  list(patientId: number, page: Page, filter: ContactPlanFilter = {}): ContactPlan[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('patient_id = ?');
    args.push(patientId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM contact_plans ${where} ORDER BY started_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as ContactPlanRow[];
    return rows.map(toContactPlan);
  }

  setStatus(id: number, next: ContactPlanStatus): ContactPlan | null {
    const row = this.db
      .prepare(`UPDATE contact_plans SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as ContactPlanRow | undefined;
    return row ? toContactPlan(row) : null;
  }

  count(patientId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM contact_plans WHERE patient_id = ?')
      .get(patientId) as unknown as { n: number };
    return row.n;
  }
}
