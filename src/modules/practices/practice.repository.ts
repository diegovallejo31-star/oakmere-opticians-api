import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewPractice, Practice, PracticeRow } from './practice.types';

export function toPractice(row: PracticeRow): Practice {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    town: row.town,
    openedOn: row.opened_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PracticeFilter {
  code?: string;
}

export class PracticeRepository {
  constructor(private readonly db: Database) {}

  create(input: NewPractice): Practice {
    const row = this.db
      .prepare(
        `INSERT INTO practices (code, name, town, opened_on)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(input.code, input.name, input.town, input.openedOn) as unknown as PracticeRow;
    return toPractice(row);
  }

  findById(id: number): Practice | null {
    const row = this.db
      .prepare('SELECT * FROM practices WHERE id = ?')
      .get(id) as unknown as PracticeRow | undefined;
    return row ? toPractice(row) : null;
  }

  findByCode(code: string): Practice | null {
    const row = this.db
      .prepare('SELECT * FROM practices WHERE code = ?')
      .get(code) as unknown as PracticeRow | undefined;
    return row ? toPractice(row) : null;
  }

  list(page: Page, filter: PracticeFilter = {}): Practice[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.code !== undefined) {
      clauses.push('code = ?');
      args.push(filter.code);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM practices ${where} ORDER BY code ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as PracticeRow[];
    return rows.map(toPractice);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM practices').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
