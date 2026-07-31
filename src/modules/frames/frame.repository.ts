import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Frame, FramePatch, FrameRow, NewFrame } from './frame.types';

export function toFrame(row: FrameRow): Frame {
  return {
    id: row.id,
    sku: row.sku,
    brand: row.brand,
    model: row.model,
    costPence: row.cost_pence,
    markupBasisPoints: row.markup_basis_points,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface FrameFilter {
  sku?: string;
}

export class FrameRepository {
  constructor(private readonly db: Database) {}

  create(input: NewFrame): Frame {
    const row = this.db
      .prepare(
        `INSERT INTO frames (sku, brand, model, cost_pence, markup_basis_points)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.sku,
        input.brand,
        input.model,
        input.costPence,
        input.markupBasisPoints,
      ) as unknown as FrameRow;
    return toFrame(row);
  }

  findById(id: number): Frame | null {
    const row = this.db.prepare('SELECT * FROM frames WHERE id = ?').get(id) as unknown as
      FrameRow | undefined;
    return row ? toFrame(row) : null;
  }

  findBySku(sku: string): Frame | null {
    const row = this.db
      .prepare('SELECT * FROM frames WHERE sku = ?')
      .get(sku) as unknown as FrameRow | undefined;
    return row ? toFrame(row) : null;
  }

  list(page: Page, filter: FrameFilter = {}): Frame[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.sku !== undefined) {
      clauses.push('sku = ?');
      args.push(filter.sku);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM frames ${where} ORDER BY sku ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as FrameRow[];
    return rows.map(toFrame);
  }

  update(id: number, patch: FramePatch): Frame | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(
        `UPDATE frames SET cost_pence = ?, markup_basis_points = ?, ${TOUCHED} WHERE id = ? RETURNING *`,
      )
      .get(
        patch.costPence ?? current.costPence,
        patch.markupBasisPoints ?? current.markupBasisPoints,
        id,
      ) as unknown as FrameRow;
    return toFrame(row);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM frames').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
