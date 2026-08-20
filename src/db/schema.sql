-- oakmere: An opticians: patients, sight tests, prescriptions, dispensing and payments.
--
-- Every table carries created_at, and anything that can be corrected after the
-- fact carries updated_at as well. Money is in pence and time in whole days or
-- minutes, so that nothing in the schema is a float.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('reception', 'optometrist', 'dispensing', 'viewer')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS audit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  actor TEXT,
  took_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_entries (created_at);

CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket TEXT NOT NULL,
  at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit ON rate_limit_hits (bucket, at);

-- A branch of the opticians - a testing room, a dispensing bench and a
-- * front desk. The code is the one on the appointment card.
CREATE TABLE IF NOT EXISTS practices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  town TEXT NOT NULL,
  opened_on TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS practices_code_idx ON practices (code);

-- Somebody on the strength at one branch. The GOC number is the General
-- * Optical Council's and unique across the group, because it follows the person,
-- * not the branch - and it is what a sight test checks before it lets a test be
-- * signed off against them.
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id INTEGER NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  goc_number TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS staff_goc_number_idx ON staff (goc_number);

-- Somebody on the list. What matters to the till is their entitlement: a
-- * patient with an NHS voucher has a flat amount taken off a pair of glasses, and
-- * whether they have one is held here rather than asked at the counter, because a
-- * voucher missed is money a patient was owed.
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_ref TEXT NOT NULL,
  name TEXT NOT NULL,
  born_on TEXT NOT NULL,
  voucher_pence INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_ref_idx ON patients (patient_ref);

-- A frame in the display. It is bought in at a trade cost and sold at that
-- * plus a markup in basis points; the retail price is worked out from the two and
-- * never stored, so a trade price change reprices the display but not a pair of
-- * glasses already dispensed.
CREATE TABLE IF NOT EXISTS frames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  cost_pence INTEGER NOT NULL,
  markup_basis_points INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS frames_sku_idx ON frames (sku);

-- A lens type on the price list - single vision, bifocal, varifocal - at a
-- * flat price a pair. Unlike a frame there is no markup to apply; the price is
-- * the price, and a dispensing copies it so a later list change does not move a
-- * pair already glazed.
CREATE TABLE IF NOT EXISTS lenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  price_pence INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS lenses_code_idx ON lenses (code);

-- An eye examination on a patient. It is signed off by an optometrist -
-- * not a dispenser, not reception - and its outcome is what decides whether a
-- * prescription follows. The fee is what the test cost, whether the NHS or the
-- * patient pays it.
CREATE TABLE IF NOT EXISTS sight_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  optometrist_id INTEGER NOT NULL,
  tested_on TEXT NOT NULL,
  outcome TEXT NOT NULL,
  fee_pence INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- The prescription written up after a sight test. It runs for a fixed
-- * period - two years is usual - and lapses on its expiry day; a pair of glasses
-- * glazed to a prescription that has run out is glazed to the wrong numbers, so
-- * the expiry is held and checked rather than trusted.
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  issued_on TEXT NOT NULL,
  expires_on TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS prescriptions_reference_idx ON prescriptions (reference);

-- A pair of glasses made up for a patient. What they pay is the frame at
-- * its retail price, plus the lenses at theirs, less the flat NHS voucher the
-- * patient is entitled to - and never below nil, because a voucher worth more
-- * than the glasses does not pay money out. Every figure is worked out when the
-- * pair is dispensed and then held.
CREATE TABLE IF NOT EXISTS dispensings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  frame_id INTEGER NOT NULL,
  lens_id INTEGER NOT NULL,
  dispensed_on TEXT NOT NULL,
  frame_pence INTEGER NOT NULL,
  lens_pence INTEGER NOT NULL,
  voucher_pence INTEGER NOT NULL,
  total_pence INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- The order that goes to the glazing lab for a dispensed pair. It is
-- * ordered, then received back at the branch, then collected by the patient, and
-- * it only ever moves forward - a pair collected has gone home, and one still on
-- * order is not on the shelf to hand over.
CREATE TABLE IF NOT EXISTS lab_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dispensing_id INTEGER NOT NULL REFERENCES dispensings(id) ON DELETE CASCADE,
  lab_ref TEXT NOT NULL,
  ordered_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ordered',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- A reminder that a patient is due for another test. It is raised for a
-- * day ahead and sits scheduled until it goes out or is dismissed; the front
-- * desk works off the scheduled list, so one dealt with drops off it for good.
CREATE TABLE IF NOT EXISTS recalls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  due_on TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- A frame repair - a soldered hinge, a new arm. It is charged at whatever
-- * the bench quotes and hangs off the patient, because it goes on their bill
-- * whether or not the frame was one of ours.
CREATE TABLE IF NOT EXISTS repairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  brought_on TEXT NOT NULL,
  description TEXT NOT NULL,
  charge_pence INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- A monthly plan that covers a patient's contact lenses and checks. It
-- * runs at a flat monthly charge from the day it starts until it is cancelled,
-- * and it cancels once - a cancelled plan is one the direct debit has been
-- * stopped on, and it does not quietly start billing again.
CREATE TABLE IF NOT EXISTS contact_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  started_on TEXT NOT NULL,
  monthly_pence INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
