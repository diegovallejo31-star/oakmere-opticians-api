import { NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { FrameRepository } from '../frames/frame.repository';
import { FrameService } from '../frames/frame.service';
import { LensRepository } from '../lenses/lens.repository';
import { PatientRepository } from '../patients/patient.repository';
import type { DispensingFilter, DispensingRepository } from './dispensing.repository';
import type { Dispensing, DispensingDraft } from './dispensing.types';

/**
 * Dispensings.
 *
 * The sum is frame retail plus lens price, less the voucher, floored at nil. The
 * voucher is a flat amount and comes off the whole, not one part - taking it off
 * the frame or the lens alone would give the patient the wrong change. The frame
 * price is the retail on the day, the lens price the list on the day, and both
 * are stored so a later price change does not reopen a settled pair.
 */
export class DispensingService {
  constructor(
    private readonly repo: DispensingRepository,
    private readonly patients: PatientRepository,
    private readonly frames: FrameRepository,
    private readonly lenses: LensRepository,
  ) {}

  create(patientId: number, input: DispensingDraft): Dispensing {
    const patient = this.patients.findById(patientId);
    if (!patient) throw new NotFoundError('patient', patientId);

    const frame = this.frames.findById(input.frameId);
    if (!frame) throw new NotFoundError('frame', input.frameId);
    const lens = this.lenses.findById(input.lensId);
    if (!lens) throw new NotFoundError('lens', input.lensId);

    const framePence = FrameService.retailPence(frame);
    const lensPence = lens.pricePence;
    const voucherPence = patient.voucherPence;
    const totalPence = Math.max(0, framePence + lensPence - voucherPence);

    return this.repo.create({
      ...input,
      patientId,
      framePence,
      lensPence,
      voucherPence,
      totalPence,
    });
  }

  list(
    patientId: number,
    filter: DispensingFilter,
    limit?: number,
    offset?: number,
  ): Dispensing[] {
    if (!this.patients.findById(patientId)) {
      throw new NotFoundError('patient', patientId);
    }
    return this.repo.list(patientId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Dispensing {
    const dispensing = this.repo.findById(id);
    if (!dispensing) throw new NotFoundError('dispensing', id);
    return dispensing;
  }
}
