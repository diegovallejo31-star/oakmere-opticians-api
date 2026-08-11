import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createDispensingSchema = z
  .object({
    frameId: z.number().int().positive(),
    lensId: z.number().int().positive(),
    dispensedOn: dayString,
  })
  .strict();

export const dispensingIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const dispensingQuerySchema = z
  .object({
    frameId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
