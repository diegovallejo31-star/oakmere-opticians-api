import { z } from 'zod';

export const createFrameSchema = z
  .object({
    sku: z.string().min(1).max(120),
    brand: z.string().min(1).max(120),
    model: z.string().min(1).max(120),
    costPence: z.number().int().min(0).max(10000000),
    markupBasisPoints: z.number().int().min(0).max(50000),
  })
  .strict();

export const updateFrameSchema = z
  .object({
    costPence: z.number().int().min(0).max(10000000).optional(),
    markupBasisPoints: z.number().int().min(0).max(50000).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const frameIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const frameQuerySchema = z
  .object({
    sku: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
