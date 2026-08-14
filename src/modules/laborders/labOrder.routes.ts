import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { DispensingRepository } from '../dispensings/dispensing.repository';
import { LabOrderController } from './labOrder.controller';
import { LabOrderRepository } from './labOrder.repository';
import {
  createLabOrderSchema,
  dispensingIdParamSchema,
  labOrderIdParamSchema,
  labOrderQuerySchema,
  labOrderStatusSchema,
} from './labOrder.schema';
import { LabOrderService } from './labOrder.service';

function controllerFor(db: Database): LabOrderController {
  return new LabOrderController(
    new LabOrderService(new LabOrderRepository(db), new DispensingRepository(db)),
  );
}

/** The laborders of one dispensing, mounted under /dispensings. */
export function createDispensingLabOrderRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:dispensingId/lab-orders',
    validateRequest({ params: dispensingIdParamSchema, body: createLabOrderSchema }),
    controller.create,
  );
  router.get(
    '/:dispensingId/lab-orders',
    validateRequest({ params: dispensingIdParamSchema, query: labOrderQuerySchema }),
    controller.list,
  );

  return router;
}

export function createLabOrderRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: labOrderIdParamSchema }),
    controller.getById,
  );
  router.post(
    '/:id/status',
    validateRequest({ params: labOrderIdParamSchema, body: labOrderStatusSchema }),
    controller.advance,
  );

  return router;
}
