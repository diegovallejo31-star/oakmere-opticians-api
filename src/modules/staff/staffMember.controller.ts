import type { Request, Response } from 'express';
import type { StaffMemberService } from './staffMember.service';

export class StaffMemberController {
  constructor(private readonly service: StaffMemberService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.practiceId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { gocNumber, limit, offset } = req.query as unknown as {
      gocNumber?: string;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(Number(req.params.practiceId), { gocNumber }, limit, offset),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  update = (req: Request, res: Response): void => {
    res.json(this.service.update(Number(req.params.id), req.body));
  };
}
