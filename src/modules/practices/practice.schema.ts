import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createPracticeSchema = z
  .object({
    code: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    town: z.string().min(1).max(120),
    openedOn: dayString,
  })
  .strict();

export const practiceIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const practiceQuerySchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
