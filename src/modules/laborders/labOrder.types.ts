/** Where the order has got to. */
export type LabOrderStatus = 'ordered' | 'received' | 'collected';

export const LAB_ORDER_STATUSES: LabOrderStatus[] = ['ordered', 'received', 'collected'];

export interface LabOrder {
  id: number;
  dispensingId: number;
  /** The lab's order reference. */
  labRef: string;
  /** The day it went to the lab. */
  orderedOn: string;
  status: LabOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LabOrderRow {
  id: number;
  dispensing_id: number;
  lab_ref: string;
  ordered_on: string;
  status: LabOrderStatus;
  created_at: string;
  updated_at: string;
}

export interface LabOrderDraft {
  labRef: string;
  orderedOn: string;
}

export interface NewLabOrder extends LabOrderDraft {
  dispensingId: number;
}
