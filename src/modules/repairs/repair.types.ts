export interface Repair {
  id: number;
  patientId: number;
  /** The day it was brought in. */
  broughtOn: string;
  /** What needed doing. */
  description: string;
  /** What the repair is charged at, in whole pence. */
  chargePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepairRow {
  id: number;
  patient_id: number;
  brought_on: string;
  description: string;
  charge_pence: number;
  created_at: string;
  updated_at: string;
}

export interface RepairDraft {
  broughtOn: string;
  description: string;
  chargePence: number;
}

export interface NewRepair extends RepairDraft {
  patientId: number;
}
