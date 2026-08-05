import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Lens, LensPatch, LensRow, NewLens } from './lens.types';

export function toLens(row: LensRow): Lens {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    kind: row.kind,
    pricePence: row.price_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface LensFilter {
  code?: string;
  kind?: 'single_vision' | 'bifocal' | 'varifocal';
}

export class LensRepository {
  constructor(private readonly db: Database) {}

  create(input: NewLens): Lens {
    const row = this.db
      .prepare(
        `INSERT INTO lenses (code, name, kind, price_pence)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(input.code, input.name, input.kind, input.pricePence) as unknown as LensRow;
    return toLens(row);
  }

  findById(id: number): Lens | null {
    const row = this.db.prepare('SELECT * FROM lenses WHERE id = ?').get(id) as unknown as
      LensRow | undefined;
    return row ? toLens(row) : null;
  }

  findByCode(code: string): Lens | null {
    const row = this.db
      .prepare('SELECT * FROM lenses WHERE code = ?')
      .get(code) as unknown as LensRow | undefined;
    return row ? toLens(row) : null;
  }

  list(page: Page, filter: LensFilter = {}): Lens[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.code !== undefined) {
      clauses.push('code = ?');
      args.push(filter.code);
    }
    if (filter.kind !== undefined) {
      clauses.push('kind = ?');
      args.push(filter.kind);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM lenses ${where} ORDER BY code ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as LensRow[];
    return rows.map(toLens);
  }

  update(id: number, patch: LensPatch): Lens | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(`UPDATE lenses SET price_pence = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(patch.pricePence ?? current.pricePence, id) as unknown as LensRow;
    return toLens(row);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM lenses').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
