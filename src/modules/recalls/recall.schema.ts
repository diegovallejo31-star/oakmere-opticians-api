import { z } from 'zod';
import { dayString } from '../../lib/schemas';
import { RECALL_STATUSES } from './recall.types';

export const createRecallSchema = z
  .object({
    dueOn: dayString,
    note: z.string().min(1).max(120),
  })
  .strict();

export const recallIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const recallQuerySchema = z
  .object({
    status: z.enum(RECALL_STATUSES as [string, ...string[]]).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const recallStatusSchema = z
  .object({ status: z.enum(['sent', 'dismissed']) })
  .strict();
