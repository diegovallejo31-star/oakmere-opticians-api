import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PracticeRepository } from '../practices/practice.repository';
import { StaffMemberController } from './staffMember.controller';
import { StaffMemberRepository } from './staffMember.repository';
import {
  createStaffMemberSchema,
  practiceIdParamSchema,
  staffMemberIdParamSchema,
  staffMemberQuerySchema,
  updateStaffMemberSchema,
} from './staffMember.schema';
import { StaffMemberService } from './staffMember.service';

function controllerFor(db: Database): StaffMemberController {
  return new StaffMemberController(
    new StaffMemberService(new StaffMemberRepository(db), new PracticeRepository(db)),
  );
}

/** The staff of one practice, mounted under /practices. */
export function createPracticeStaffMemberRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:practiceId/staff',
    validateRequest({ params: practiceIdParamSchema, body: createStaffMemberSchema }),
    controller.create,
  );
  router.get(
    '/:practiceId/staff',
    validateRequest({ params: practiceIdParamSchema, query: staffMemberQuerySchema }),
    controller.list,
  );

  return router;
}

export function createStaffMemberRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: staffMemberIdParamSchema }),
    controller.getById,
  );
  router.patch(
    '/:id',
    validateRequest({ params: staffMemberIdParamSchema, body: updateStaffMemberSchema }),
    controller.update,
  );

  return router;
}
