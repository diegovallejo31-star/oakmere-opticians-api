import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PatientRepository } from '../patients/patient.repository';
import { RecallController } from './recall.controller';
import { RecallRepository } from './recall.repository';
import {
  createRecallSchema,
  patientIdParamSchema,
  recallIdParamSchema,
  recallQuerySchema,
  recallStatusSchema,
} from './recall.schema';
import { RecallService } from './recall.service';

function controllerFor(db: Database): RecallController {
  return new RecallController(
    new RecallService(new RecallRepository(db), new PatientRepository(db)),
  );
}

/** The recalls of one patient, mounted under /patients. */
export function createPatientRecallRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:patientId/recalls',
    validateRequest({ params: patientIdParamSchema, body: createRecallSchema }),
    controller.create,
  );
  router.get(
    '/:patientId/recalls',
    validateRequest({ params: patientIdParamSchema, query: recallQuerySchema }),
    controller.list,
  );

  return router;
}

export function createRecallRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: recallIdParamSchema }), controller.getById);
  router.post(
    '/:id/status',
    validateRequest({ params: recallIdParamSchema, body: recallStatusSchema }),
    controller.changeStatus,
  );

  return router;
}
