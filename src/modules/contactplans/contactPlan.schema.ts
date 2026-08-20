import { z } from 'zod';
import { dayString } from '../../lib/schemas';
import { CONTACT_PLAN_STATUSES } from './contactPlan.types';

export const createContactPlanSchema = z
  .object({
    startedOn: dayString,
    monthlyPence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const contactPlanIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const contactPlanQuerySchema = z
  .object({
    status: z.enum(CONTACT_PLAN_STATUSES as [string, ...string[]]).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const contactPlanCancelSchema = z.object({ status: z.enum(['cancelled']) }).strict();
