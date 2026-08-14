import type { Express } from 'express';
import { api } from './apiClient';

/**
 * Makers for the tests.
 *
 * Each one creates the least it can get away with and hands back an id, so a
 * test that cares about charges does not have to know how a site is spelt.
 * Counters keep every generated code unique inside one run.
 */
let seq = 0;

function next(): number {
  seq += 1;
  return seq;
}

export async function makePractice(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/practices')
    .send({
      code: `OAK${n}`,
      name: 'Oakmere High Street',
      town: 'Oakmere',
      openedOn: '2012-06-11',
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makePractice: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeStaffMember(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { practiceId: parent, ...rest } = fields as { practiceId?: number };
  const practiceId = parent ?? (await makePractice(app));
  const res = await api(app)
    .post(`/practices/${practiceId}/staff`)
    .send({
      gocNumber: `01-31882${n}`,
      name: 'Sara Abebe',
      role: 'optometrist',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeStaffMember: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makePatient(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/patients')
    .send({
      patientRef: `P-7781${n}`,
      name: 'Gwen Talbot',
      bornOn: '1958-02-14',
      voucherPence: 6900,
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makePatient: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeFrame(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/frames')
    .send({
      sku: `FR-2201${n}`,
      brand: 'Ferndown',
      model: 'Ashcombe',
      costPence: 4500,
      markupBasisPoints: 12000,
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makeFrame: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeLens(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/lenses')
    .send({
      code: `LN-SV${n}`,
      name: 'Single vision, standard',
      kind: 'single_vision',
      pricePence: 3500,
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makeLens: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeSightTest(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { patientId: parent, ...rest } = fields as { patientId?: number };
  const patientId = parent ?? (await makePatient(app));
  const optometristId = await makeStaffMember(app);
  const res = await api(app)
    .post(`/patients/${patientId}/sight-tests`)
    .send({
      optometristId: optometristId,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeSightTest: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makePrescription(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { patientId: parent, ...rest } = fields as { patientId?: number };
  const patientId = parent ?? (await makePatient(app));
  const res = await api(app)
    .post(`/patients/${patientId}/prescriptions`)
    .send({
      reference: `RX-5501${n}`,
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makePrescription: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeDispensing(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { patientId: parent, ...rest } = fields as { patientId?: number };
  const patientId = parent ?? (await makePatient(app));
  const frameId = await makeFrame(app);
  const lensId = await makeLens(app);
  const res = await api(app)
    .post(`/patients/${patientId}/dispensings`)
    .send({
      frameId: frameId,
      lensId: lensId,
      dispensedOn: '2025-04-12',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeDispensing: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeLabOrder(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { dispensingId: parent, ...rest } = fields as { dispensingId?: number };
  const dispensingId = parent ?? (await makeDispensing(app));
  const res = await api(app)
    .post(`/dispensings/${dispensingId}/lab-orders`)
    .send({
      labRef: 'LAB-3300',
      orderedOn: '2025-04-12',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeLabOrder: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}
