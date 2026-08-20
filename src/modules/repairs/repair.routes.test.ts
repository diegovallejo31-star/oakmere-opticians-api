import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makePatient, makeRepair } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('repairs over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app).post(`/patients/${patientId}/repairs`).send({
      broughtOn: '2025-05-02',
      description: 'Re-solder left hinge',
      chargePence: 1500,
    });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/patients/${patientId}/repairs`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app).post(`/patients/${patientId}/repairs`).send({
      broughtOn: '2025-05-02',
      description: 'Re-solder left hinge',
      chargePence: 1500,
    });
    expect(Object.keys(made.body).sort()).toEqual([
      'broughtOn',
      'chargePence',
      'createdAt',
      'description',
      'id',
      'patientId',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app).post(`/patients/${patientId}/repairs`).send({
      broughtOn: '2025-05-02',
      description: 'Re-solder left hinge',
      chargePence: 1500,
    });
    const read = await api(app).get(`/repairs/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/repairs/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).post(`/patients/${patientId}/repairs`).send({
      broughtOn: '2025-05-02',
      description: 'Re-solder left hinge',
      chargePence: 1500,
      nonesuch: 1,
    });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/repairs?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the patient is not there', async () => {
    const app = buildApp();

    const res = await api(app).post('/patients/999999/repairs').send({
      broughtOn: '2025-05-02',
      description: 'Re-solder left hinge',
      chargePence: 1500,
    });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    await makeRepair(app, { patientId });
    await makeRepair(app, { patientId });

    const all = await api(app).get(`/patients/${patientId}/repairs`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/patients/${patientId}/repairs?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/repairs/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/repairs?limit=0`);
    expect(res.status).toBe(400);
  });
});
