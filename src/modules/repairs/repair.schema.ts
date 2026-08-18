import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createRepairSchema = z
  .object({
    broughtOn: dayString,
    description: z.string().min(1).max(120),
    chargePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const repairIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const repairQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
