import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { bpsOf } from '../../lib/money';
import type { FrameFilter, FrameRepository } from './frame.repository';
import type { Frame, FramePatch, NewFrame } from './frame.types';

/**
 * Frames.
 *
 * `retailPence` is a function rather than a column, for the same reason a lens
 * price is copied at dispensing: two pairs glazed a month apart into the same
 * frame should each be priced at the markup that stood on the day, and the only
 * way to keep that honest is to make the caller ask for it.
 */
export class FrameService {
  constructor(private readonly repo: FrameRepository) {}

  static retailPence(frame: Frame): number {
    return frame.costPence + bpsOf(frame.costPence, frame.markupBasisPoints);
  }

  create(input: NewFrame): Frame {
    if (this.repo.findBySku(input.sku)) {
      throw new ConflictError(`frame ${input.sku} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: FrameFilter, limit?: number, offset?: number): Frame[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Frame {
    const frame = this.repo.findById(id);
    if (!frame) throw new NotFoundError('frame', id);
    return frame;
  }

  update(id: number, patch: FramePatch): Frame {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('frame', id);
    return updated;
  }
}
