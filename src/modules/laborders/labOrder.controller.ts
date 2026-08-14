import type { Request, Response } from 'express';
import type { LabOrderService } from './labOrder.service';
import type { LabOrderStatus } from './labOrder.types';

export class LabOrderController {
  constructor(private readonly service: LabOrderService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.dispensingId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, labRef, limit, offset } = req.query as unknown as {
      status?: LabOrderStatus;
      labRef?: string;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(
        Number(req.params.dispensingId),
        { status, labRef },
        limit,
        offset,
      ),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  advance = (req: Request, res: Response): void => {
    const { status } = req.body as { status: Exclude<LabOrderStatus, 'ordered'> };
    res.json(this.service.advance(Number(req.params.id), status));
  };
}
