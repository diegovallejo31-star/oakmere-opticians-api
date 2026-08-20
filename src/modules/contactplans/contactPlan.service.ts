import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { PatientRepository } from '../patients/patient.repository';
import type { ContactPlanFilter, ContactPlanRepository } from './contactPlan.repository';
import type { ContactPlan, NewContactPlan } from './contactPlan.types';

/**
 * Contact plans.
 *
 * A plan is cancelled once and stays cancelled. Cancelling stops the direct
 * debit; letting it be cancelled twice, or reopened, would either stop a debit
 * already stopped or restart one the patient was told had ended.
 */
export class ContactPlanService {
  constructor(
    private readonly repo: ContactPlanRepository,
    private readonly patients: PatientRepository,
  ) {}

  create(patientId: number, input: Omit<NewContactPlan, 'patientId'>): ContactPlan {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.create({ ...input, patientId });
  }

  list(
    patientId: number,
    filter: ContactPlanFilter,
    limit?: number,
    offset?: number,
  ): ContactPlan[] {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.list(patientId, pageFrom(limit, offset), filter);
  }

  getById(id: number): ContactPlan {
    const plan = this.repo.findById(id);
    if (!plan) throw new NotFoundError('contact plan', id);
    return plan;
  }

  cancel(id: number): ContactPlan {
    const plan = this.getById(id);
    if (plan.status !== 'active') {
      throw new ConflictError(`plan ${id} is already cancelled`);
    }
    const moved = this.repo.setStatus(id, 'cancelled');
    if (!moved) throw new NotFoundError('contact plan', id);
    return moved;
  }
}
