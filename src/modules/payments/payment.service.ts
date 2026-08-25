import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { InvoiceRepository } from '../invoices/invoice.repository';
import type { PaymentFilter, PaymentRepository } from './payment.repository';
import type { NewPayment, Payment } from './payment.types';

/**
 * Payments.
 *
 * The rule the schema cannot hold: the payments against an invoice may reach its
 * gross and never pass it. Overpayment is a refund waiting to happen, and the
 * office would rather turn the extra away than raise a credit note.
 */
export class PaymentService {
  constructor(
    private readonly repo: PaymentRepository,
    private readonly invoices: InvoiceRepository,
  ) {}

  create(input: NewPayment): Payment {
    const invoice = this.invoices.findById(input.invoiceId);
    if (!invoice) throw new NotFoundError('invoice', input.invoiceId);

    const alreadyPaid = this.repo
      .forInvoice(input.invoiceId)
      .reduce((total, payment) => total + payment.amountPence, 0);
    if (alreadyPaid + input.amountPence > invoice.totalPence) {
      const left = invoice.totalPence - alreadyPaid;
      throw new ConflictError(
        `only ${left} pence outstanding on invoice ${invoice.number}, ${input.amountPence} offered`,
      );
    }

    return this.repo.create(input);
  }

  list(filter: PaymentFilter, limit?: number, offset?: number): Payment[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Payment {
    const payment = this.repo.findById(id);
    if (!payment) throw new NotFoundError('payment', id);
    return payment;
  }

  /** Gross, received and remaining on one invoice. */
  outstanding(invoiceId: number): {
    invoiceId: number;
    grossPence: number;
    paidPence: number;
    outstandingPence: number;
  } {
    const invoice = this.invoices.findById(invoiceId);
    if (!invoice) throw new NotFoundError('invoice', invoiceId);
    const paidPence = this.repo
      .forInvoice(invoiceId)
      .reduce((total, payment) => total + payment.amountPence, 0);
    return {
      invoiceId,
      grossPence: invoice.totalPence,
      paidPence,
      outstandingPence: invoice.totalPence - paidPence,
    };
  }
}
