import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { PatientRepository } from '../patients/patient.repository';
import { StaffMemberRepository } from '../staff/staffMember.repository';
import type { SightTestFilter, SightTestRepository } from './sightTest.repository';
import type { SightTest, SightTestDraft } from './sightTest.types';

/**
 * Sight tests.
 *
 * Only an optometrist may sign a test off - a dispensing optician or a
 * receptionist cannot, whatever the booking says - so the role is checked here
 * rather than trusted from the caller.
 */
export class SightTestService {
  constructor(
    private readonly repo: SightTestRepository,
    private readonly patients: PatientRepository,
    private readonly staff: StaffMemberRepository,
  ) {}

  create(patientId: number, input: SightTestDraft): SightTest {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    const optometrist = this.staff.findById(input.optometristId);
    if (!optometrist) throw new NotFoundError('staff member', input.optometristId);
    if (optometrist.role !== 'optometrist') {
      throw new ConflictError(`staff member ${input.optometristId} is not an optometrist`);
    }
    return this.repo.create({ ...input, patientId });
  }

  list(
    patientId: number,
    filter: SightTestFilter,
    limit?: number,
    offset?: number,
  ): SightTest[] {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.list(patientId, pageFrom(limit, offset), filter);
  }

  getById(id: number): SightTest {
    const test = this.repo.findById(id);
    if (!test) throw new NotFoundError('sight test', id);
    return test;
  }
}
