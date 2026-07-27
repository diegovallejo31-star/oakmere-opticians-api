import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { PracticeController } from './practice.controller';
import { PracticeRepository } from './practice.repository';
import {
  createPracticeSchema,
  practiceIdParamSchema,
  practiceQuerySchema,
} from './practice.schema';
import { PracticeService } from './practice.service';

function controllerFor(db: Database): PracticeController {
  return new PracticeController(new PracticeService(new PracticeRepository(db)));
}

export function createPracticeRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createPracticeSchema }), controller.create);
  router.get('/', validateRequest({ query: practiceQuerySchema }), controller.list);
  router.get(
    '/:id',
    validateRequest({ params: practiceIdParamSchema }),
    controller.getById,
  );

  return router;
}
