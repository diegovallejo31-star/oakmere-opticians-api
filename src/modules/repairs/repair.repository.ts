import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewRepair, Repair, RepairRow } from './repair.types';

export function toRepair(row: RepairRow): Repair {
  return {
    id: row.id,
    patientId: row.patient_id,
    broughtOn: row.brought_on,
    description: row.description,
    chargePence: row.charge_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Nothing to narrow a list of these by yet. */
export type RepairFilter = Record<string, never>;

export class RepairRepository {
  constructor(private readonly db: Database) {}

  create(input: NewRepair): Repair {
    const row = this.db
      .prepare(
        `INSERT INTO repairs (patient_id, brought_on, description, charge_pence)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientId,
        input.broughtOn,
        input.description,
        input.chargePence,
      ) as unknown as RepairRow;
    return toRepair(row);
  }

  findById(id: number): Repair | null {
    const row = this.db.prepare('SELECT * FROM repairs WHERE id = ?').get(id) as unknown as
      RepairRow | undefined;
    return row ? toRepair(row) : null;
  }

  list(patientId: number, page: Page, _filter: RepairFilter = {}): Repair[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('patient_id = ?');
    args.push(patientId);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM repairs ${where} ORDER BY brought_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as RepairRow[];
    return rows.map(toRepair);
  }

  count(patientId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM repairs WHERE patient_id = ?')
      .get(patientId) as unknown as { n: number };
    return row.n;
  }
}
