import type { Request, Response } from 'express';
import type { InvoiceService } from './invoice.service';

export class InvoiceController {
  constructor(private readonly service: InvoiceService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(req.body));
  };

  list = (req: Request, res: Response): void => {
    const { patientId, number, limit, offset } = req.query as unknown as {
      patientId?: number;
      number?: string;
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list({ patientId, number }, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
