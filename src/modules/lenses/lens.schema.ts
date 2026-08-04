import { z } from 'zod';

export const createLensSchema = z
  .object({
    code: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    kind: z.enum(['single_vision', 'bifocal', 'varifocal']),
    pricePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const updateLensSchema = z
  .object({
    pricePence: z.number().int().min(0).max(10000000).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const lensIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const lensQuerySchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    kind: z.enum(['single_vision', 'bifocal', 'varifocal']).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
