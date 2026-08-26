# oakmere-opticians-api

The back office for a group of opticians: patients and their tests and
prescriptions, the frame and lens stock, the glasses dispensed, and the money
that follows.

A plain Express + TypeScript service over SQLite, no framework beyond that. Every
module is the same six files - types, schema, repository, service, controller,
routes - so once you have read one you know your way around them all.

```sh
npm install
npm run dev      # a watch server on the port in src/config/env.ts
npm run check    # typecheck, eslint, prettier, jest - all of it
```

## What is in it

A branch (`/practices`) has staff and sees patients (`/patients`). A patient is
sight-tested by an optometrist, issued a prescription, and dispensed glasses from
the frame and lens stock (`/frames`, `/lenses`); the pair goes to the lab and is
collected. Patients carry recalls for their next test, a contact-lens plan, and
any repairs. When they are billed, their glasses, tests and repairs are gathered
onto an invoice and paid off. Auth, API keys and the audit trail sit underneath
all of it.

See [docs/domain.md](docs/domain.md) for the conventions the whole codebase
holds to - they are assumed, not repeated, in each module.

## The shape of a request

Everything is JSON. A write answers `201` with the row it created, a read
answers `200`, a bad body answers `400`, something missing answers `404`, and a
rule broken answers `409`. Lists come back as `{ "items": [...] }` and take
`limit` and `offset`; unknown query keys are refused rather than ignored.
