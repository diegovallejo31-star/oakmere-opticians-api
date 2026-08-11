export interface Dispensing {
  id: number;
  patientId: number;
  /** The frame chosen. */
  frameId: number;
  /** The lens chosen. */
  lensId: number;
  /** The day the pair was ordered up. */
  dispensedOn: string;
  /** The frame at retail, fixed here. */
  framePence: number;
  /** The lenses at list, fixed here. */
  lensPence: number;
  /** The NHS voucher taken off. */
  voucherPence: number;
  /** What the patient pays, never below nil. */
  totalPence: number;
  createdAt: string;
  updatedAt: string;
}

export interface DispensingRow {
  id: number;
  patient_id: number;
  frame_id: number;
  lens_id: number;
  dispensed_on: string;
  frame_pence: number;
  lens_pence: number;
  voucher_pence: number;
  total_pence: number;
  created_at: string;
  updated_at: string;
}

export interface DispensingDraft {
  frameId: number;
  lensId: number;
  dispensedOn: string;
}

export interface NewDispensing extends DispensingDraft {
  patientId: number;
  framePence: number;
  lensPence: number;
  voucherPence: number;
  totalPence: number;
}
