import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createSightTestSchema = z
  .object({
    optometristId: z.number().int().positive(),
    testedOn: dayString,
    outcome: z.enum(['spectacles', 'no_change', 'referred']),
    feePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const sightTestIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const sightTestQuerySchema = z
  .object({
    optometristId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
