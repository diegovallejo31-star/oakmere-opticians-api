import { z } from 'zod';
import { dayString } from '../../lib/schemas';
import { LAB_ORDER_STATUSES } from './labOrder.types';

export const createLabOrderSchema = z
  .object({
    labRef: z.string().min(1).max(120),
    orderedOn: dayString,
  })
  .strict();

export const labOrderIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const dispensingIdParamSchema = z.object({
  dispensingId: z.coerce.number().int().positive(),
});

export const labOrderQuerySchema = z
  .object({
    status: z.enum(LAB_ORDER_STATUSES as [string, ...string[]]).optional(),
    labRef: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const labOrderStatusSchema = z
  .object({ status: z.enum(['received', 'collected']) })
  .strict();
