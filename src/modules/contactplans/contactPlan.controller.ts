import type { Request, Response } from 'express';
import type { ContactPlanService } from './contactPlan.service';
import type { ContactPlanStatus } from './contactPlan.types';

export class ContactPlanController {
  constructor(private readonly service: ContactPlanService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.patientId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, limit, offset } = req.query as unknown as {
      status?: ContactPlanStatus;
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

  cancel = (req: Request, res: Response): void => {
    res.json(this.service.cancel(Number(req.params.id)));
  };
}
