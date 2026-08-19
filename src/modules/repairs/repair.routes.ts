import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PatientRepository } from '../patients/patient.repository';
import { RepairController } from './repair.controller';
import { RepairRepository } from './repair.repository';
import {
  createRepairSchema,
  patientIdParamSchema,
  repairIdParamSchema,
  repairQuerySchema,
} from './repair.schema';
import { RepairService } from './repair.service';

function controllerFor(db: Database): RepairController {
  return new RepairController(
    new RepairService(new RepairRepository(db), new PatientRepository(db)),
  );
}

/** The repairs of one patient, mounted under /patients. */
export function createPatientRepairRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:patientId/repairs',
    validateRequest({ params: patientIdParamSchema, body: createRepairSchema }),
    controller.create,
  );
  router.get(
    '/:patientId/repairs',
    validateRequest({ params: patientIdParamSchema, query: repairQuerySchema }),
    controller.list,
  );

  return router;
}

export function createRepairRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: repairIdParamSchema }), controller.getById);

  return router;
}
