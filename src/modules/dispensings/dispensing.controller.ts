import type { Request, Response } from 'express';
import type { DispensingService } from './dispensing.service';

export class DispensingController {
  constructor(private readonly service: DispensingService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.patientId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { frameId, limit, offset } = req.query as unknown as {
      frameId?: number;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(Number(req.params.patientId), { frameId }, limit, offset),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
