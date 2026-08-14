import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { DispensingRepository } from '../dispensings/dispensing.repository';
import type { LabOrderFilter, LabOrderRepository } from './labOrder.repository';
import type { LabOrder, LabOrderStatus, NewLabOrder } from './labOrder.types';

const NEXT: Record<LabOrderStatus, LabOrderStatus[]> = {
  ordered: ['received'],
  received: ['collected'],
  collected: [],
};

/**
 * Lab orders.
 *
 * The order goes ordered, received, collected, and never skips or reverses: a
 * pair cannot be collected before it is back from the lab, and a collected one
 * is done with.
 */
export class LabOrderService {
  constructor(
    private readonly repo: LabOrderRepository,
    private readonly dispensings: DispensingRepository,
  ) {}

  create(dispensingId: number, input: Omit<NewLabOrder, 'dispensingId'>): LabOrder {
    if (!this.dispensings.findById(dispensingId)) {
      throw new NotFoundError('dispensing', dispensingId);
    }
    return this.repo.create({ ...input, dispensingId });
  }

  list(
    dispensingId: number,
    filter: LabOrderFilter,
    limit?: number,
    offset?: number,
  ): LabOrder[] {
    if (!this.dispensings.findById(dispensingId)) {
      throw new NotFoundError('dispensing', dispensingId);
    }
    return this.repo.list(dispensingId, pageFrom(limit, offset), filter);
  }

  getById(id: number): LabOrder {
    const order = this.repo.findById(id);
    if (!order) throw new NotFoundError('lab order', id);
    return order;
  }

  advance(id: number, next: Exclude<LabOrderStatus, 'ordered'>): LabOrder {
    const order = this.getById(id);
    if (!NEXT[order.status].includes(next)) {
      throw new ConflictError(`a lab order cannot go from ${order.status} to ${next}`);
    }
    const moved = this.repo.setStatus(id, next);
    if (!moved) throw new NotFoundError('lab order', id);
    return moved;
  }
}
