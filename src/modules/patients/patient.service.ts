import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import type { PatientFilter, PatientRepository } from './patient.repository';
import type { NewPatient, Patient, PatientPatch } from './patient.types';

/**
 * Patients.
 *
 * The reference is the branch's own and unique; we only refuse to hold the same
 * one twice. The voucher amount lives here and is read by a dispensing when it
 * works out what the patient pays.
 */
export class PatientService {
  constructor(private readonly repo: PatientRepository) {}

  create(input: NewPatient): Patient {
    if (this.repo.findByPatientRef(input.patientRef)) {
      throw new ConflictError(`patient ${input.patientRef} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: PatientFilter, limit?: number, offset?: number): Patient[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Patient {
    const patient = this.repo.findById(id);
    if (!patient) throw new NotFoundError('patient', id);
    return patient;
  }

  update(id: number, patch: PatientPatch): Patient {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('patient', id);
    return updated;
  }
}
