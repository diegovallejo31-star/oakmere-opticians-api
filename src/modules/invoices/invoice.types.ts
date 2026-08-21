export interface Invoice {
  id: number;
  /** The patient being billed. */
  patientId: number;
  /** The invoice number. */
  number: string;
  /** The day the invoice was raised. */
  raisedOn: string;
  /** Dispensings, net of voucher. */
  glassesPence: number;
  /** Sight test fees. */
  testsPence: number;
  /** Repairs. */
  repairsPence: number;
  /** What the patient owes. */
  totalPence: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRow {
  id: number;
  patient_id: number;
  number: string;
  raised_on: string;
  glasses_pence: number;
  tests_pence: number;
  repairs_pence: number;
  total_pence: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDraft {
  patientId: number;
  number: string;
  raisedOn: string;
}

export interface NewInvoice extends InvoiceDraft {
  glassesPence: number;
  testsPence: number;
  repairsPence: number;
  totalPence: number;
}
