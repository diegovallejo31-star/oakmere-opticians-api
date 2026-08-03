import type { Request, Response } from 'express';
import type { FrameService } from './frame.service';

export class FrameController {
  constructor(private readonly service: FrameService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(req.body));
  };

  list = (req: Request, res: Response): void => {
    const { sku, limit, offset } = req.query as unknown as {
      sku?: string;
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list({ sku }, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  update = (req: Request, res: Response): void => {
    res.json(this.service.update(Number(req.params.id), req.body));
  };
}
