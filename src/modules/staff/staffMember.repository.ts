import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type {
  NewStaffMember,
  StaffMember,
  StaffMemberPatch,
  StaffMemberRow,
} from './staffMember.types';

export function toStaffMember(row: StaffMemberRow): StaffMember {
  return {
    id: row.id,
    practiceId: row.practice_id,
    gocNumber: row.goc_number,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface StaffMemberFilter {
  gocNumber?: string;
}

export class StaffMemberRepository {
  constructor(private readonly db: Database) {}

  create(input: NewStaffMember): StaffMember {
    const row = this.db
      .prepare(
        `INSERT INTO staff (practice_id, goc_number, name, role)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.practiceId,
        input.gocNumber,
        input.name,
        input.role,
      ) as unknown as StaffMemberRow;
    return toStaffMember(row);
  }

  findById(id: number): StaffMember | null {
    const row = this.db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as unknown as
      StaffMemberRow | undefined;
    return row ? toStaffMember(row) : null;
  }

  findByGocNumber(gocNumber: string): StaffMember | null {
    const row = this.db
      .prepare('SELECT * FROM staff WHERE goc_number = ?')
      .get(gocNumber) as unknown as StaffMemberRow | undefined;
    return row ? toStaffMember(row) : null;
  }

  list(practiceId: number, page: Page, filter: StaffMemberFilter = {}): StaffMember[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('practice_id = ?');
    args.push(practiceId);
    if (filter.gocNumber !== undefined) {
      clauses.push('goc_number = ?');
      args.push(filter.gocNumber);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM staff ${where} ORDER BY goc_number ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as StaffMemberRow[];
    return rows.map(toStaffMember);
  }

  update(id: number, patch: StaffMemberPatch): StaffMember | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(`UPDATE staff SET role = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(patch.role ?? current.role, id) as unknown as StaffMemberRow;
    return toStaffMember(row);
  }

  count(practiceId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM staff WHERE practice_id = ?')
      .get(practiceId) as unknown as { n: number };
    return row.n;
  }
}
