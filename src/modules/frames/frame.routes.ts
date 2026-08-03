import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { FrameController } from './frame.controller';
import { FrameRepository } from './frame.repository';
import {
  createFrameSchema,
  frameIdParamSchema,
  frameQuerySchema,
  updateFrameSchema,
} from './frame.schema';
import { FrameService } from './frame.service';

function controllerFor(db: Database): FrameController {
  return new FrameController(new FrameService(new FrameRepository(db)));
}

export function createFrameRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createFrameSchema }), controller.create);
  router.get('/', validateRequest({ query: frameQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: frameIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: frameIdParamSchema, body: updateFrameSchema }),
    controller.update,
  );

  return router;
}
