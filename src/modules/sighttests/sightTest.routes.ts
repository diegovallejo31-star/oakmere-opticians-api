import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PatientRepository } from '../patients/patient.repository';
import { StaffMemberRepository } from '../staff/staffMember.repository';
import { SightTestController } from './sightTest.controller';
import { SightTestRepository } from './sightTest.repository';
import {
  createSightTestSchema,
  patientIdParamSchema,
  sightTestIdParamSchema,
  sightTestQuerySchema,
} from './sightTest.schema';
import { SightTestService } from './sightTest.service';

function controllerFor(db: Database): SightTestController {
  return new SightTestController(
    new SightTestService(
      new SightTestRepository(db),
      new PatientRepository(db),
      new StaffMemberRepository(db),
    ),
  );
}

/** The sighttests of one patient, mounted under /patients. */
export function createPatientSightTestRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:patientId/sight-tests',
    validateRequest({ params: patientIdParamSchema, body: createSightTestSchema }),
    controller.create,
  );
  router.get(
    '/:patientId/sight-tests',
    validateRequest({ params: patientIdParamSchema, query: sightTestQuerySchema }),
    controller.list,
  );

  return router;
}

export function createSightTestRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: sightTestIdParamSchema }),
    controller.getById,
  );

  return router;
}
