import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { DispensingRepository } from '../dispensings/dispensing.repository';
import { PatientRepository } from '../patients/patient.repository';
import { RepairRepository } from '../repairs/repair.repository';
import { SightTestRepository } from '../sighttests/sightTest.repository';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import {
  createInvoiceSchema,
  invoiceIdParamSchema,
  invoiceQuerySchema,
} from './invoice.schema';
import { InvoiceService } from './invoice.service';

function controllerFor(db: Database): InvoiceController {
  return new InvoiceController(
    new InvoiceService(
      new InvoiceRepository(db),
      new PatientRepository(db),
      new DispensingRepository(db),
      new SightTestRepository(db),
      new RepairRepository(db),
    ),
  );
}

export function createInvoiceRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createInvoiceSchema }), controller.create);
  router.get('/', validateRequest({ query: invoiceQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: invoiceIdParamSchema }), controller.getById);

  return router;
}
