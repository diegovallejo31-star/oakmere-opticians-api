export interface SightTest {
  id: number;
  patientId: number;
  /** The optometrist who did the test. */
  optometristId: number;
  /** The day of the test. */
  testedOn: string;
  /** What the test concluded. */
  outcome: 'spectacles' | 'no_change' | 'referred';
  /** What the test cost, in whole pence. */
  feePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface SightTestRow {
  id: number;
  patient_id: number;
  optometrist_id: number;
  tested_on: string;
  outcome: 'spectacles' | 'no_change' | 'referred';
  fee_pence: number;
  created_at: string;
  updated_at: string;
}

export interface SightTestDraft {
  optometristId: number;
  testedOn: string;
  outcome: 'spectacles' | 'no_change' | 'referred';
  feePence: number;
}

export interface NewSightTest extends SightTestDraft {
  patientId: number;
}
