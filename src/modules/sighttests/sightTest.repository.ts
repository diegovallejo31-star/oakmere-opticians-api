import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewSightTest, SightTest, SightTestRow } from './sightTest.types';

export function toSightTest(row: SightTestRow): SightTest {
  return {
    id: row.id,
    patientId: row.patient_id,
    optometristId: row.optometrist_id,
    testedOn: row.tested_on,
    outcome: row.outcome,
    feePence: row.fee_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface SightTestFilter {
  optometristId?: number;
}

export class SightTestRepository {
  constructor(private readonly db: Database) {}

  create(input: NewSightTest): SightTest {
    const row = this.db
      .prepare(
        `INSERT INTO sight_tests (patient_id, optometrist_id, tested_on, outcome, fee_pence)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.patientId,
        input.optometristId,
        input.testedOn,
        input.outcome,
        input.feePence,
      ) as unknown as SightTestRow;
    return toSightTest(row);
  }

  findById(id: number): SightTest | null {
    const row = this.db
      .prepare('SELECT * FROM sight_tests WHERE id = ?')
      .get(id) as unknown as SightTestRow | undefined;
    return row ? toSightTest(row) : null;
  }

  list(patientId: number, page: Page, filter: SightTestFilter = {}): SightTest[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('patient_id = ?');
    args.push(patientId);
    if (filter.optometristId !== undefined) {
      clauses.push('optometrist_id = ?');
      args.push(filter.optometristId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM sight_tests ${where} ORDER BY tested_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as SightTestRow[];
    return rows.map(toSightTest);
  }

  count(patientId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM sight_tests WHERE patient_id = ?')
      .get(patientId) as unknown as { n: number };
    return row.n;
  }
}
