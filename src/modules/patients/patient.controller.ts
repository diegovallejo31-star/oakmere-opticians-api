import type { Request, Response } from 'express';
import type { PatientService } from './patient.service';

export class PatientController {
  constructor(private readonly service: PatientService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(req.body));
  };

  list = (req: Request, res: Response): void => {
    const { patientRef, limit, offset } = req.query as unknown as {
      patientRef?: string;
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list({ patientRef }, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  update = (req: Request, res: Response): void => {
    res.json(this.service.update(Number(req.params.id), req.body));
  };
}
