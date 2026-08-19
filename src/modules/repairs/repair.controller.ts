import type { Request, Response } from 'express';
import type { RepairService } from './repair.service';

export class RepairController {
  constructor(private readonly service: RepairService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.patientId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { limit, offset } = req.query as unknown as {
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list(Number(req.params.patientId), {}, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
