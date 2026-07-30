import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewPatient, Patient, PatientPatch, PatientRow } from './patient.types';

export function toPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    patientRef: row.patient_ref,
    name: row.name,
    bornOn: row.born_on,
    voucherPence: row.voucher_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface PatientFilter {
  patientRef?: string;
}

export class PatientRepository {
  constructor(private readonly db: Database) {}

  create(input: NewPatient): Patient {
    const row = this.db
      .prepare(
        `INSERT INTO patients (patient_ref, name, born_on, voucher_pence)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientRef,
        input.name,
        input.bornOn,
        input.voucherPence,
      ) as unknown as PatientRow;
    return toPatient(row);
  }

  findById(id: number): Patient | null {
    const row = this.db
      .prepare('SELECT * FROM patients WHERE id = ?')
      .get(id) as unknown as PatientRow | undefined;
    return row ? toPatient(row) : null;
  }

  findByPatientRef(patientRef: string): Patient | null {
    const row = this.db
      .prepare('SELECT * FROM patients WHERE patient_ref = ?')
      .get(patientRef) as unknown as PatientRow | undefined;
    return row ? toPatient(row) : null;
  }

  list(page: Page, filter: PatientFilter = {}): Patient[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.patientRef !== undefined) {
      clauses.push('patient_ref = ?');
      args.push(filter.patientRef);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM patients ${where} ORDER BY patient_ref ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as PatientRow[];
    return rows.map(toPatient);
  }

  update(id: number, patch: PatientPatch): Patient | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(`UPDATE patients SET voucher_pence = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(patch.voucherPence ?? current.voucherPence, id) as unknown as PatientRow;
    return toPatient(row);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM patients').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
