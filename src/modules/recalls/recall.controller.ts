import type { Request, Response } from 'express';
import type { RecallService } from './recall.service';
import type { RecallStatus } from './recall.types';

export class RecallController {
  constructor(private readonly service: RecallService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.patientId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, limit, offset } = req.query as unknown as {
      status?: RecallStatus;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(Number(req.params.patientId), { status }, limit, offset),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  changeStatus = (req: Request, res: Response): void => {
    const { status } = req.body as { status: Exclude<RecallStatus, 'scheduled'> };
    res.json(this.service.changeStatus(Number(req.params.id), status));
  };
}
