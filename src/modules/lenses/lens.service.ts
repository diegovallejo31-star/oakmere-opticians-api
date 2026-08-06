import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import type { LensFilter, LensRepository } from './lens.repository';
import type { Lens, LensPatch, NewLens } from './lens.types';

/**
 * Lenses.
 *
 * A flat price list. A dispensing reads a lens price off here at the moment it
 * is glazed and then holds it, so the list can move without repricing work
 * already done.
 */
export class LensService {
  constructor(private readonly repo: LensRepository) {}

  create(input: NewLens): Lens {
    if (this.repo.findByCode(input.code)) {
      throw new ConflictError(`lens ${input.code} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: LensFilter, limit?: number, offset?: number): Lens[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Lens {
    const lens = this.repo.findById(id);
    if (!lens) throw new NotFoundError('lens', id);
    return lens;
  }

  update(id: number, patch: LensPatch): Lens {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('lens', id);
    return updated;
  }
}
