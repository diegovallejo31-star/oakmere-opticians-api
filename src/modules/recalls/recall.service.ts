import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { PatientRepository } from '../patients/patient.repository';
import type { RecallFilter, RecallRepository } from './recall.repository';
import type { NewRecall, Recall, RecallStatus } from './recall.types';

/**
 * Recalls.
 *
 * A recall leaves the scheduled state exactly once, to sent or dismissed, and
 * does not come back - re-sending is a new recall, not a revival, because the
 * scheduled list is what the desk chases and a handled one must drop off it.
 */
export class RecallService {
  constructor(
    private readonly repo: RecallRepository,
    private readonly patients: PatientRepository,
  ) {}

  create(patientId: number, input: Omit<NewRecall, 'patientId'>): Recall {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.create({ ...input, patientId });
  }

  list(patientId: number, filter: RecallFilter, limit?: number, offset?: number): Recall[] {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.list(patientId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Recall {
    const recall = this.repo.findById(id);
    if (!recall) throw new NotFoundError('recall', id);
    return recall;
  }

  changeStatus(id: number, next: Exclude<RecallStatus, 'scheduled'>): Recall {
    const recall = this.getById(id);
    if (recall.status !== 'scheduled') {
      throw new ConflictError(`recall ${id} is already ${recall.status}`);
    }
    const moved = this.repo.setStatus(id, next);
    if (!moved) throw new NotFoundError('recall', id);
    return moved;
  }
}
