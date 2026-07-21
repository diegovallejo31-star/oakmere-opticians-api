/**
 * Money is held in pence throughout - integers only.
 *
 * A pair of glasses is a frame at a marked-up price and lenses at theirs, less
 * whatever NHS voucher the patient is entitled to. The voucher is a flat amount
 * off, not a percentage, so it comes off the total after the parts are added -
 * take it off the wrong number and a pensioner is charged for a voucher they
 * were owed.
 */
export const PENCE_IN_POUND = 100;

export function isWholePence(amount: number): boolean {
  return Number.isInteger(amount);
}

/** Formats pence as a plain decimal string, for logs and human-facing text. */
export function formatPence(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${Math.floor(abs / PENCE_IN_POUND)}.${String(abs % PENCE_IN_POUND).padStart(2, '0')}`;
}

/**
 * Splits an amount into shares that add back to exactly the amount.
 *
 * The remainder goes a penny at a time to the earlier shares, so no share is
 * more than a penny adrift of any other and the total is never short.
 */
export function splitEvenly(amount: number, parts: number): number[] {
  if (parts <= 0) throw new Error('splitEvenly needs at least one part');
  const base = Math.floor(amount / parts);
  const shares = Array.from({ length: parts }, () => base);
  let left = amount - base * parts;
  for (let index = 0; left > 0; index += 1, left -= 1) {
    shares[index % parts] = (shares[index % parts] ?? 0) + 1;
  }
  return shares;
}

/** A percentage of an amount in basis points, rounded down to the penny. */
export function bpsOf(amount: number, bps: number): number {
  return Math.floor((amount * bps) / 10_000);
}
