export interface StaffMember {
  id: number;
  practiceId: number;
  /** The GOC registration number. */
  gocNumber: string;
  name: string;
  /** What they do at the branch. */
  role: 'optometrist' | 'dispensing_optician' | 'reception';
  createdAt: string;
  updatedAt: string;
}

export interface StaffMemberRow {
  id: number;
  practice_id: number;
  goc_number: string;
  name: string;
  role: 'optometrist' | 'dispensing_optician' | 'reception';
  created_at: string;
  updated_at: string;
}

export interface StaffMemberDraft {
  gocNumber: string;
  name: string;
  role: 'optometrist' | 'dispensing_optician' | 'reception';
}

export interface NewStaffMember extends StaffMemberDraft {
  practiceId: number;
}

export interface StaffMemberPatch {
  role?: 'optometrist' | 'dispensing_optician' | 'reception';
}
