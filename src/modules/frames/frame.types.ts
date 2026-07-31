export interface Frame {
  id: number;
  /** The frame's stock code. */
  sku: string;
  brand: string;
  model: string;
  /** Trade cost, in whole pence. */
  costPence: number;
  /** Basis points added to the trade cost; 10000 doubles it. */
  markupBasisPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface FrameRow {
  id: number;
  sku: string;
  brand: string;
  model: string;
  cost_pence: number;
  markup_basis_points: number;
  created_at: string;
  updated_at: string;
}

export interface FrameDraft {
  sku: string;
  brand: string;
  model: string;
  costPence: number;
  markupBasisPoints: number;
}

export type NewFrame = FrameDraft;

export interface FramePatch {
  costPence?: number;
  markupBasisPoints?: number;
}
