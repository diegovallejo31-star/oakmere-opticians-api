import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { LabOrder, LabOrderRow, LabOrderStatus, NewLabOrder } from './labOrder.types';

export function toLabOrder(row: LabOrderRow): LabOrder {
  return {
    id: row.id,
    dispensingId: row.dispensing_id,
    labRef: row.lab_ref,
    orderedOn: row.ordered_on,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface LabOrderFilter {
  status?: LabOrderStatus;
  labRef?: string;
}

export class LabOrderRepository {
  constructor(private readonly db: Database) {}

  create(input: NewLabOrder): LabOrder {
    const row = this.db
      .prepare(
        `INSERT INTO lab_orders (dispensing_id, lab_ref, ordered_on)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.dispensingId, input.labRef, input.orderedOn) as unknown as LabOrderRow;
    return toLabOrder(row);
  }

  findById(id: number): LabOrder | null {
    const row = this.db
      .prepare('SELECT * FROM lab_orders WHERE id = ?')
      .get(id) as unknown as LabOrderRow | undefined;
    return row ? toLabOrder(row) : null;
  }

  list(dispensingId: number, page: Page, filter: LabOrderFilter = {}): LabOrder[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('dispensing_id = ?');
    args.push(dispensingId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    if (filter.labRef !== undefined) {
      clauses.push('lab_ref = ?');
      args.push(filter.labRef);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM lab_orders ${where} ORDER BY ordered_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as LabOrderRow[];
    return rows.map(toLabOrder);
  }

  setStatus(id: number, next: LabOrderStatus): LabOrder | null {
    const row = this.db
      .prepare(`UPDATE lab_orders SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as LabOrderRow | undefined;
    return row ? toLabOrder(row) : null;
  }

  count(dispensingId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM lab_orders WHERE dispensing_id = ?')
      .get(dispensingId) as unknown as { n: number };
    return row.n;
  }
}
