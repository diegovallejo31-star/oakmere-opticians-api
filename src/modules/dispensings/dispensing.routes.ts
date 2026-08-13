import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { FrameRepository } from '../frames/frame.repository';
import { LensRepository } from '../lenses/lens.repository';
import { PatientRepository } from '../patients/patient.repository';
import { DispensingController } from './dispensing.controller';
import { DispensingRepository } from './dispensing.repository';
import {
  createDispensingSchema,
  dispensingIdParamSchema,
  dispensingQuerySchema,
  patientIdParamSchema,
} from './dispensing.schema';
import { DispensingService } from './dispensing.service';

function controllerFor(db: Database): DispensingController {
  return new DispensingController(
    new DispensingService(
      new DispensingRepository(db),
      new PatientRepository(db),
      new FrameRepository(db),
      new LensRepository(db),
    ),
  );
}

/** The dispensings of one patient, mounted under /patients. */
export function createPatientDispensingRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:patientId/dispensings',
    validateRequest({ params: patientIdParamSchema, body: createDispensingSchema }),
    controller.create,
  );
  router.get(
    '/:patientId/dispensings',
    validateRequest({ params: patientIdParamSchema, query: dispensingQuerySchema }),
    controller.list,
  );

  return router;
}

export function createDispensingRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: dispensingIdParamSchema }),
    controller.getById,
  );

  return router;
}
