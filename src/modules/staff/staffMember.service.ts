import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { PracticeRepository } from '../practices/practice.repository';
import type { StaffMemberFilter, StaffMemberRepository } from './staffMember.repository';
import type { NewStaffMember, StaffMember, StaffMemberPatch } from './staffMember.types';

/**
 * Staff.
 *
 * The GOC number is unique across the group because it is the council's - one
 * registration to one person, and a test can only be signed off against a real
 * one.
 */
export class StaffMemberService {
  constructor(
    private readonly repo: StaffMemberRepository,
    private readonly practices: PracticeRepository,
  ) {}

  create(practiceId: number, input: Omit<NewStaffMember, 'practiceId'>): StaffMember {
    if (!this.practices.findById(practiceId)) {
      throw new NotFoundError('practice', practiceId);
    }
    if (this.repo.findByGocNumber(input.gocNumber)) {
      throw new ConflictError(`GOC number ${input.gocNumber} is already on the system`);
    }
    return this.repo.create({ ...input, practiceId });
  }

  list(
    practiceId: number,
    filter: StaffMemberFilter,
    limit?: number,
    offset?: number,
  ): StaffMember[] {
    if (!this.practices.findById(practiceId)) {
      throw new NotFoundError('practice', practiceId);
    }
    return this.repo.list(practiceId, pageFrom(limit, offset), filter);
  }

  getById(id: number): StaffMember {
    const staff = this.repo.findById(id);
    if (!staff) throw new NotFoundError('staff member', id);
    return staff;
  }

  update(id: number, patch: StaffMemberPatch): StaffMember {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('staff member', id);
    return updated;
  }
}
