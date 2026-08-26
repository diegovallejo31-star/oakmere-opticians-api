# The house style

These hold everywhere. They are written down once, here, and assumed in every
module rather than restated - a task written against this repo is expected to
know them.

## Days

* A **day** is a `YYYY-MM-DD` string and nothing else, compared as a string
  because the format sorts. `src/lib/schemas.ts` has the shared `dayString`, and
  it refuses a date that never happened.
* Nothing reads the clock in a calculation - a day always arrives from the
  caller. A prescription's expiry is checked against a day it is given, not
  today.

## Money

* Money is **whole pence**, held as an integer everywhere. No floating point in a
  money path.
* A **frame is trade cost plus a markup in basis points**; its retail price is a
  function, not a stored column, so the display reprices when the trade price
  moves but a dispensed pair does not.
* A **dispensing is frame retail plus lens price, less the NHS voucher**, and
  never below nil. The voucher is a flat amount off the whole, not a percentage
  and not off one part; and a voucher worth more than the glasses does not pay
  money out.
* A figure worked out from others - a dispensing's total, an invoice's totals -
  is **fixed when the record is raised and then stored**, never recomputed on
  read. A price change makes a new record; it does not move an old one.
* Spectacles are zero-rated, so an optical invoice carries **no VAT line** - the
  total is simply the parts added up.

## Rules that live in the service

* Only an **optometrist** signs a sight test off - not a dispenser, not
  reception.
* A **prescription** has to last past the day it is issued.
* Records that move through states - a lab order, a recall, a contact plan -
  move forward only and settle once; re-doing one is a new record.

## Not built yet

There is no reminder run. Recalls are raised by hand one patient at a time;
nothing sweeps the patients whose prescriptions are about to lapse and raises a
recall for each. That sweep is the obvious next thing, and the first task against
this repo builds it.
