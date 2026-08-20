/** Whether the plan is still running. */
export type ContactPlanStatus = 'active' | 'cancelled';

export const CONTACT_PLAN_STATUSES: ContactPlanStatus[] = ['active', 'cancelled'];

export interface ContactPlan {
  id: number;
  patientId: number;
  /** The day the plan started. */
  startedOn: string;
  /** The monthly charge, in whole pence. */
  monthlyPence: number;
  status: ContactPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPlanRow {
  id: number;
  patient_id: number;
  started_on: string;
  monthly_pence: number;
  status: ContactPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactPlanDraft {
  startedOn: string;
  monthlyPence: number;
}

export interface NewContactPlan extends ContactPlanDraft {
  patientId: number;
}
