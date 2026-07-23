export interface Practice {
  id: number;
  /** Short branch code. */
  code: string;
  name: string;
  /** Where the branch is. */
  town: string;
  /** The day the branch opened. */
  openedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeRow {
  id: number;
  code: string;
  name: string;
  town: string;
  opened_on: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeDraft {
  code: string;
  name: string;
  town: string;
  openedOn: string;
}

export type NewPractice = PracticeDraft;
