import { NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { PatientRepository } from '../patients/patient.repository';
import type { RepairFilter, RepairRepository } from './repair.repository';
import type { NewRepair, Repair } from './repair.types';

/**
 * Repairs.
 *
 * A plain charge against a patient - when, what, and what it cost. The figure is
 * whatever the bench quoted and is recorded as given.
 */
export class RepairService {
  constructor(
    private readonly repo: RepairRepository,
    private readonly patients: PatientRepository,
  ) {}

  create(patientId: number, input: Omit<NewRepair, 'patientId'>): Repair {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.create({ ...input, patientId });
  }

  list(patientId: number, filter: RepairFilter, limit?: number, offset?: number): Repair[] {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.list(patientId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Repair {
    const repair = this.repo.findById(id);
    if (!repair) throw new NotFoundError('repair', id);
    return repair;
  }
}
