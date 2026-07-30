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
