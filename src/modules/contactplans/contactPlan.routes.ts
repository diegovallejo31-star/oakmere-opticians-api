import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PatientRepository } from '../patients/patient.repository';
import { ContactPlanController } from './contactPlan.controller';
import { ContactPlanRepository } from './contactPlan.repository';
import {
  contactPlanCancelSchema,
  contactPlanIdParamSchema,
  contactPlanQuerySchema,
  createContactPlanSchema,
  patientIdParamSchema,
} from './contactPlan.schema';
import { ContactPlanService } from './contactPlan.service';

function controllerFor(db: Database): ContactPlanController {
  return new ContactPlanController(
    new ContactPlanService(new ContactPlanRepository(db), new PatientRepository(db)),
  );
}

/** The contactplans of one patient, mounted under /patients. */
export function createPatientContactPlanRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:patientId/contact-plans',
    validateRequest({ params: patientIdParamSchema, body: createContactPlanSchema }),
    controller.create,
  );
  router.get(
    '/:patientId/contact-plans',
    validateRequest({ params: patientIdParamSchema, query: contactPlanQuerySchema }),
    controller.list,
  );

  return router;
}

export function createContactPlanRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: contactPlanIdParamSchema }),
    controller.getById,
  );
  router.post(
    '/:id/cancel',
    validateRequest({ params: contactPlanIdParamSchema, body: contactPlanCancelSchema }),
    controller.cancel,
  );

  return router;
}
