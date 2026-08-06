import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { LensController } from './lens.controller';
import { LensRepository } from './lens.repository';
import {
  createLensSchema,
  lensIdParamSchema,
  lensQuerySchema,
  updateLensSchema,
} from './lens.schema';
import { LensService } from './lens.service';

function controllerFor(db: Database): LensController {
  return new LensController(new LensService(new LensRepository(db)));
}

export function createLensRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createLensSchema }), controller.create);
  router.get('/', validateRequest({ query: lensQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: lensIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: lensIdParamSchema, body: updateLensSchema }),
    controller.update,
  );

  return router;
}
