import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Invoice, InvoiceRow, NewInvoice } from './invoice.types';

export function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    patientId: row.patient_id,
    number: row.number,
    raisedOn: row.raised_on,
    glassesPence: row.glasses_pence,
    testsPence: row.tests_pence,
    repairsPence: row.repairs_pence,
    totalPence: row.total_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface InvoiceFilter {
  patientId?: number;
  number?: string;
}

export class InvoiceRepository {
  constructor(private readonly db: Database) {}

  create(input: NewInvoice): Invoice {
    const row = this.db
      .prepare(
        `INSERT INTO invoices (patient_id, number, raised_on, glasses_pence, tests_pence, repairs_pence, total_pence)
         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientId,
        input.number,
        input.raisedOn,
        input.glassesPence,
        input.testsPence,
        input.repairsPence,
        input.totalPence,
      ) as unknown as InvoiceRow;
    return toInvoice(row);
  }

  findById(id: number): Invoice | null {
    const row = this.db
      .prepare('SELECT * FROM invoices WHERE id = ?')
      .get(id) as unknown as InvoiceRow | undefined;
    return row ? toInvoice(row) : null;
  }

  findByNumber(number: string): Invoice | null {
    const row = this.db
      .prepare('SELECT * FROM invoices WHERE number = ?')
      .get(number) as unknown as InvoiceRow | undefined;
    return row ? toInvoice(row) : null;
  }

  list(page: Page, filter: InvoiceFilter = {}): Invoice[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.patientId !== undefined) {
      clauses.push('patient_id = ?');
      args.push(filter.patientId);
    }
    if (filter.number !== undefined) {
      clauses.push('number = ?');
      args.push(filter.number);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM invoices ${where} ORDER BY raised_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as InvoiceRow[];
    return rows.map(toInvoice);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM invoices').get() as unknown as {
      n: number;
    };
    return row.n;
  }

  /** The invoice raised against one patient, if there is one. */
  findByPatientId(patientId: number): Invoice | null {
    const row = this.db
      .prepare('SELECT * FROM invoices WHERE patient_id = ?')
      .get(patientId) as unknown as InvoiceRow | undefined;
    return row ? toInvoice(row) : null;
  }
}
