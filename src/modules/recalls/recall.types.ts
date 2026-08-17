/** Whether the recall has gone out. */
export type RecallStatus = 'scheduled' | 'sent' | 'dismissed';

export const RECALL_STATUSES: RecallStatus[] = ['scheduled', 'sent', 'dismissed'];

export interface Recall {
  id: number;
  patientId: number;
  /** The day the patient is due back. */
  dueOn: string;
  /** What the recall is for. */
  note: string;
  status: RecallStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RecallRow {
  id: number;
  patient_id: number;
  due_on: string;
  note: string;
  status: RecallStatus;
  created_at: string;
  updated_at: string;
}

export interface RecallDraft {
  dueOn: string;
  note: string;
}

export interface NewRecall extends RecallDraft {
  patientId: number;
}
