import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createPaymentSchema = z
  .object({
    invoiceId: z.number().int().positive(),
    paidOn: dayString,
    method: z.enum(['card', 'cash', 'bank_transfer']),
    amountPence: z.number().int().min(1).max(1000000000),
  })
  .strict();

export const paymentIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const paymentQuerySchema = z
  .object({
    invoiceId: z.coerce.number().int().positive().optional(),
    method: z.enum(['card', 'cash', 'bank_transfer']).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const invoiceIdOutstandingParamSchema = z
  .object({ invoiceId: z.coerce.number().int().positive() })
  .strict();
