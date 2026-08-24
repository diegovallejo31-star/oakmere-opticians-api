import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { DispensingRepository } from '../dispensings/dispensing.repository';
import { PatientRepository } from '../patients/patient.repository';
import { RepairRepository } from '../repairs/repair.repository';
import { SightTestRepository } from '../sighttests/sightTest.repository';
import type { InvoiceFilter, InvoiceRepository } from './invoice.repository';
import type { Invoice, InvoiceDraft } from './invoice.types';

/** No patient has more of anything than this. */
const EVERYTHING = { limit: 1000, offset: 0 };

/**
 * Invoices.
 *
 * The three totals are read out of the dispensings, tests and repairs once and
 * stored. The glasses figure is already net of the patient's voucher - the
 * dispensing took it off - so it is not touched again here; double-counting the
 * voucher would credit it twice.
 */
export class InvoiceService {
  constructor(
    private readonly repo: InvoiceRepository,
    private readonly patients: PatientRepository,
    private readonly dispensings: DispensingRepository,
    private readonly tests: SightTestRepository,
    private readonly repairs: RepairRepository,
  ) {}

  create(input: InvoiceDraft): Invoice {
    if (!this.patients.findById(input.patientId)) {
      throw new NotFoundError('patient', input.patientId);
    }
    if (this.repo.findByPatientId(input.patientId)) {
      throw new ConflictError(`patient ${input.patientId} has already been invoiced`);
    }
    if (this.repo.findByNumber(input.number)) {
      throw new ConflictError(`invoice ${input.number} already exists`);
    }

    const glassesPence = this.dispensings
      .list(input.patientId, EVERYTHING, {})
      .reduce((total, pair) => total + pair.totalPence, 0);
    const testsPence = this.tests
      .list(input.patientId, EVERYTHING, {})
      .reduce((total, test) => total + test.feePence, 0);
    const repairsPence = this.repairs
      .list(input.patientId, EVERYTHING, {})
      .reduce((total, repair) => total + repair.chargePence, 0);

    return this.repo.create({
      ...input,
      glassesPence,
      testsPence,
      repairsPence,
      totalPence: glassesPence + testsPence + repairsPence,
    });
  }

  list(filter: InvoiceFilter, limit?: number, offset?: number): Invoice[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Invoice {
    const invoice = this.repo.findById(id);
    if (!invoice) throw new NotFoundError('invoice', id);
    return invoice;
  }
}
