import { ConflictError, NotFoundError, ValidationError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { PatientRepository } from '../patients/patient.repository';
import type { PrescriptionFilter, PrescriptionRepository } from './prescription.repository';
import type { NewPrescription, Prescription } from './prescription.types';

/**
 * Prescriptions.
 *
 * A prescription has to last past the day it is written, so a zero-length or
 * backwards validity is refused. Whether it is still live on a given day is a
 * string comparison against its expiry, which is what a dispensing checks.
 */
export class PrescriptionService {
  constructor(
    private readonly repo: PrescriptionRepository,
    private readonly patients: PatientRepository,
  ) {}

  create(patientId: number, input: Omit<NewPrescription, 'patientId'>): Prescription {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    if (input.expiresOn <= input.issuedOn) {
      throw new ValidationError(
        'a prescription cannot lapse on or before the day it is issued',
      );
    }
    if (this.repo.findByReference(input.reference)) {
      throw new ConflictError(`prescription ${input.reference} already exists`);
    }
    return this.repo.create({ ...input, patientId });
  }

  list(
    patientId: number,
    filter: PrescriptionFilter,
    limit?: number,
    offset?: number,
  ): Prescription[] {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.list(patientId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Prescription {
    const prescription = this.repo.findById(id);
    if (!prescription) throw new NotFoundError('prescription', id);
    return prescription;
  }
}
