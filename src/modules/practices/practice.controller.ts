import type { Request, Response } from 'express';
import type { PracticeService } from './practice.service';

export class PracticeController {
  constructor(private readonly service: PracticeService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(req.body));
  };

  list = (req: Request, res: Response): void => {
    const { code, limit, offset } = req.query as unknown as {
      code?: string;
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list({ code }, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
