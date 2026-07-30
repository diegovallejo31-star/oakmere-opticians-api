import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createPatientSchema = z
  .object({
    patientRef: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    bornOn: dayString,
    voucherPence: z.number().int().min(0).max(100000),
  })
  .strict();

export const updatePatientSchema = z
  .object({
    voucherPence: z.number().int().min(0).max(100000).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const patientIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const patientQuerySchema = z
  .object({
    patientRef: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
