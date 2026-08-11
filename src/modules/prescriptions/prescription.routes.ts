import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PatientRepository } from '../patients/patient.repository';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionRepository } from './prescription.repository';
import {
  createPrescriptionSchema,
  patientIdParamSchema,
  prescriptionIdParamSchema,
  prescriptionQuerySchema,
} from './prescription.schema';
import { PrescriptionService } from './prescription.service';

function controllerFor(db: Database): PrescriptionController {
  return new PrescriptionController(
    new PrescriptionService(new PrescriptionRepository(db), new PatientRepository(db)),
  );
}

/** The prescriptions of one patient, mounted under /patients. */
export function createPatientPrescriptionRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:patientId/prescriptions',
    validateRequest({ params: patientIdParamSchema, body: createPrescriptionSchema }),
    controller.create,
  );
  router.get(
    '/:patientId/prescriptions',
    validateRequest({ params: patientIdParamSchema, query: prescriptionQuerySchema }),
    controller.list,
  );

  return router;
}

export function createPrescriptionRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: prescriptionIdParamSchema }),
    controller.getById,
  );

  return router;
}
