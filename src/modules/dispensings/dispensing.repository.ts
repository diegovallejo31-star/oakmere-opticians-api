import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Dispensing, DispensingRow, NewDispensing } from './dispensing.types';

export function toDispensing(row: DispensingRow): Dispensing {
  return {
    id: row.id,
    patientId: row.patient_id,
    frameId: row.frame_id,
    lensId: row.lens_id,
    dispensedOn: row.dispensed_on,
    framePence: row.frame_pence,
    lensPence: row.lens_pence,
    voucherPence: row.voucher_pence,
    totalPence: row.total_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface DispensingFilter {
  frameId?: number;
}

export class DispensingRepository {
  constructor(private readonly db: Database) {}

  create(input: NewDispensing): Dispensing {
    const row = this.db
      .prepare(
        `INSERT INTO dispensings (patient_id, frame_id, lens_id, dispensed_on, frame_pence, lens_pence, voucher_pence, total_pence)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientId,
        input.frameId,
        input.lensId,
        input.dispensedOn,
        input.framePence,
        input.lensPence,
        input.voucherPence,
        input.totalPence,
      ) as unknown as DispensingRow;
    return toDispensing(row);
  }

  findById(id: number): Dispensing | null {
    const row = this.db
      .prepare('SELECT * FROM dispensings WHERE id = ?')
      .get(id) as unknown as DispensingRow | undefined;
    return row ? toDispensing(row) : null;
  }

  list(patientId: number, page: Page, filter: DispensingFilter = {}): Dispensing[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('patient_id = ?');
    args.push(patientId);
    if (filter.frameId !== undefined) {
      clauses.push('frame_id = ?');
      args.push(filter.frameId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM dispensings ${where} ORDER BY dispensed_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as DispensingRow[];
    return rows.map(toDispensing);
  }

  count(patientId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM dispensings WHERE patient_id = ?')
      .get(patientId) as unknown as { n: number };
    return row.n;
  }
}
