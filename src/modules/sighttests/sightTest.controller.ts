import type { Request, Response } from 'express';
import type { SightTestService } from './sightTest.service';

export class SightTestController {
  constructor(private readonly service: SightTestService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.patientId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { optometristId, limit, offset } = req.query as unknown as {
      optometristId?: number;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(
        Number(req.params.patientId),
        { optometristId },
        limit,
        offset,
      ),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
