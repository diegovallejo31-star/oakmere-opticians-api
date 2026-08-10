import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewPrescription, Prescription, PrescriptionRow } from './prescription.types';

export function toPrescription(row: PrescriptionRow): Prescription {
  return {
    id: row.id,
    patientId: row.patient_id,
    reference: row.reference,
    issuedOn: row.issued_on,
    expiresOn: row.expires_on,
    summary: row.summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PrescriptionFilter {
  reference?: string;
}

export class PrescriptionRepository {
  constructor(private readonly db: Database) {}

  create(input: NewPrescription): Prescription {
    const row = this.db
      .prepare(
        `INSERT INTO prescriptions (patient_id, reference, issued_on, expires_on, summary)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientId,
        input.reference,
        input.issuedOn,
        input.expiresOn,
        input.summary,
      ) as unknown as PrescriptionRow;
    return toPrescription(row);
  }

  findById(id: number): Prescription | null {
    const row = this.db
      .prepare('SELECT * FROM prescriptions WHERE id = ?')
      .get(id) as unknown as PrescriptionRow | undefined;
    return row ? toPrescription(row) : null;
  }

  findByReference(reference: string): Prescription | null {
    const row = this.db
      .prepare('SELECT * FROM prescriptions WHERE reference = ?')
      .get(reference) as unknown as PrescriptionRow | undefined;
    return row ? toPrescription(row) : null;
  }

  list(patientId: number, page: Page, filter: PrescriptionFilter = {}): Prescription[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('patient_id = ?');
    args.push(patientId);
    if (filter.reference !== undefined) {
      clauses.push('reference = ?');
      args.push(filter.reference);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM prescriptions ${where} ORDER BY issued_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as PrescriptionRow[];
    return rows.map(toPrescription);
  }

  count(patientId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM prescriptions WHERE patient_id = ?')
      .get(patientId) as unknown as { n: number };
    return row.n;
  }
}
