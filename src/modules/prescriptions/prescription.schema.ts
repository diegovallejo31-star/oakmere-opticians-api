import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createPrescriptionSchema = z
  .object({
    reference: z.string().min(1).max(120),
    issuedOn: dayString,
    expiresOn: dayString,
    summary: z.string().min(1).max(120),
  })
  .strict();

export const prescriptionIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const prescriptionQuerySchema = z
  .object({
    reference: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
