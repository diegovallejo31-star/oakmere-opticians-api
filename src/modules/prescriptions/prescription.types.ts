export interface Prescription {
  id: number;
  patientId: number;
  /** The prescription reference. */
  reference: string;
  /** The day it was issued. */
  issuedOn: string;
  /** The day it lapses. */
  expiresOn: string;
  /** The prescription in short, for the record. */
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionRow {
  id: number;
  patient_id: number;
  reference: string;
  issued_on: string;
  expires_on: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionDraft {
  reference: string;
  issuedOn: string;
  expiresOn: string;
  summary: string;
}

export interface NewPrescription extends PrescriptionDraft {
  patientId: number;
}
