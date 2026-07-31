import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PatientController } from './patient.controller';
import { PatientRepository } from './patient.repository';
import {
  createPatientSchema,
  patientIdParamSchema,
  patientQuerySchema,
  updatePatientSchema,
} from './patient.schema';
import { PatientService } from './patient.service';

function controllerFor(db: Database): PatientController {
  return new PatientController(new PatientService(new PatientRepository(db)));
}

export function createPatientRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createPatientSchema }), controller.create);
  router.get('/', validateRequest({ query: patientQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: patientIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: patientIdParamSchema, body: updatePatientSchema }),
    controller.update,
  );

  return router;
}
