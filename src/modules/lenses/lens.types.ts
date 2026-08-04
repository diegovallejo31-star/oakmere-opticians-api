export interface Lens {
  id: number;
  /** The lens code on the price list. */
  code: string;
  /** What it is called to the patient. */
  name: string;
  /** The lens type. */
  kind: 'single_vision' | 'bifocal' | 'varifocal';
  /** Price for the pair, in whole pence. */
  pricePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface LensRow {
  id: number;
  code: string;
  name: string;
  kind: 'single_vision' | 'bifocal' | 'varifocal';
  price_pence: number;
  created_at: string;
  updated_at: string;
}

export interface LensDraft {
  code: string;
  name: string;
  kind: 'single_vision' | 'bifocal' | 'varifocal';
  pricePence: number;
}

export type NewLens = LensDraft;

export interface LensPatch {
  pricePence?: number;
}
