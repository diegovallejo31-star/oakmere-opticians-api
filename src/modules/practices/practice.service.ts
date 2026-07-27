import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import type { PracticeFilter, PracticeRepository } from './practice.repository';
import type { NewPractice, Practice } from './practice.types';

/**
 * Practices.
 *
 * The code is the branch's own and unique across the group; two branches sharing
 * one would file a sight test against the wrong list.
 */
export class PracticeService {
  constructor(private readonly repo: PracticeRepository) {}

  create(input: NewPractice): Practice {
    if (this.repo.findByCode(input.code)) {
      throw new ConflictError(`practice ${input.code} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: PracticeFilter, limit?: number, offset?: number): Practice[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Practice {
    const practice = this.repo.findById(id);
    if (!practice) throw new NotFoundError('practice', id);
    return practice;
  }
}
