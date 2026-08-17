import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewRecall, Recall, RecallRow, RecallStatus } from './recall.types';

export function toRecall(row: RecallRow): Recall {
  return {
    id: row.id,
    patientId: row.patient_id,
    dueOn: row.due_on,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface RecallFilter {
  status?: RecallStatus;
}

export class RecallRepository {
  constructor(private readonly db: Database) {}

  create(input: NewRecall): Recall {
    const row = this.db
      .prepare(
        `INSERT INTO recalls (patient_id, due_on, note)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.patientId, input.dueOn, input.note) as unknown as RecallRow;
    return toRecall(row);
  }

  findById(id: number): Recall | null {
    const row = this.db.prepare('SELECT * FROM recalls WHERE id = ?').get(id) as unknown as
      RecallRow | undefined;
    return row ? toRecall(row) : null;
  }

  list(patientId: number, page: Page, filter: RecallFilter = {}): Recall[] {
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
        `SELECT * FROM recalls ${where} ORDER BY due_on ASC, id ASC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as RecallRow[];
    return rows.map(toRecall);
  }

  setStatus(id: number, next: RecallStatus): Recall | null {
    const row = this.db
      .prepare(`UPDATE recalls SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as RecallRow | undefined;
    return row ? toRecall(row) : null;
  }

  count(patientId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM recalls WHERE patient_id = ?')
      .get(patientId) as unknown as { n: number };
    return row.n;
  }
}
