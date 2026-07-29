import { z } from 'zod';

export const createStaffMemberSchema = z
  .object({
    gocNumber: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    role: z.enum(['optometrist', 'dispensing_optician', 'reception']),
  })
  .strict();

export const updateStaffMemberSchema = z
  .object({
    role: z.enum(['optometrist', 'dispensing_optician', 'reception']).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const staffMemberIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export const practiceIdParamSchema = z.object({
  practiceId: z.coerce.number().int().positive(),
});

export const staffMemberQuerySchema = z
  .object({
    gocNumber: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();
