export interface Patient {
  id: number;
  /** The branch's own patient reference. */
  patientRef: string;
  name: string;
  /** Date of birth, for the record. */
  bornOn: string;
  /** The NHS optical voucher they are entitled to, in whole pence; zero if none. */
  voucherPence: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRow {
  id: number;
  patient_ref: string;
  name: string;
  born_on: string;
  voucher_pence: number;
  created_at: string;
  updated_at: string;
}

export interface PatientDraft {
  patientRef: string;
  name: string;
  bornOn: string;
  voucherPence: number;
}

export type NewPatient = PatientDraft;

export interface PatientPatch {
  voucherPence?: number;
}
