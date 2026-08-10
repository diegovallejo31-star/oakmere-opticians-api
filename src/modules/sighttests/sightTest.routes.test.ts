import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import {
  makePatient,
  makePractice,
  makeSightTest,
  makeStaffMember,
} from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('sighttests over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const optometristId = await makeStaffMember(app);

    const made = await api(app).post(`/patients/${patientId}/sight-tests`).send({
      optometristId: optometristId,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
    });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/patients/${patientId}/sight-tests`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const optometristId = await makeStaffMember(app);

    const made = await api(app).post(`/patients/${patientId}/sight-tests`).send({
      optometristId: optometristId,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
    });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'feePence',
      'id',
      'optometristId',
      'outcome',
      'patientId',
      'testedOn',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const optometristId = await makeStaffMember(app);

    const made = await api(app).post(`/patients/${patientId}/sight-tests`).send({
      optometristId: optometristId,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
    });
    const read = await api(app).get(`/sight-tests/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/sight-tests/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const optometristId = await makeStaffMember(app);

    const res = await api(app).post(`/patients/${patientId}/sight-tests`).send({
      optometristId: optometristId,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
      nonesuch: 1,
    });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/sight-tests?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the patient is not there', async () => {
    const app = buildApp();

    const res = await api(app).post('/patients/999999/sight-tests').send({
      optometristId: 1,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
    });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    await makeSightTest(app, { patientId });
    await makeSightTest(app, { patientId });

    const all = await api(app).get(`/patients/${patientId}/sight-tests`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/patients/${patientId}/sight-tests?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/sight-tests/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/sight-tests?limit=0`);
    expect(res.status).toBe(400);
  });

  it('will not let anyone but an optometrist sign a test off', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const practiceId = await makePractice(app);
    const dispenser = await api(app).post(`/practices/${practiceId}/staff`).send({
      gocNumber: 'D-1',
      name: 'Dispenser',
      role: 'dispensing_optician',
    });

    const res = await api(app).post(`/patients/${patientId}/sight-tests`).send({
      optometristId: dispenser.body.id,
      testedOn: '2025-04-10',
      outcome: 'spectacles',
      feePence: 2500,
    });
    expect(res.status).toBe(409);
  });
});
