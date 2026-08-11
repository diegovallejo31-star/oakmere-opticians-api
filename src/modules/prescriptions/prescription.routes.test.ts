import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makePatient, makePrescription } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('prescriptions over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
    });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/patients/${patientId}/prescriptions`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
    });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'expiresOn',
      'id',
      'issuedOn',
      'patientId',
      'reference',
      'summary',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
    });
    const read = await api(app).get(`/prescriptions/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/prescriptions/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
      nonesuch: 1,
    });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/prescriptions?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same reference', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const first = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
    });
    expect(first.status).toBe(201);

    const again = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
    });
    expect(again.status).toBe(409);
  });

  it('404s when the patient is not there', async () => {
    const app = buildApp();

    const res = await api(app).post('/patients/999999/prescriptions').send({
      reference: 'RX-5501',
      issuedOn: '2025-04-10',
      expiresOn: '2027-04-10',
      summary: 'SV both eyes, -1.25',
    });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    await makePrescription(app, { patientId });
    await makePrescription(app, { patientId });

    const all = await api(app).get(`/patients/${patientId}/prescriptions`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/patients/${patientId}/prescriptions?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/prescriptions/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/prescriptions?limit=0`);
    expect(res.status).toBe(400);
  });

  it('refuses a prescription that lapses on or before the day it is issued', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).post(`/patients/${patientId}/prescriptions`).send({
      reference: 'RX-BAD',
      issuedOn: '2025-04-10',
      expiresOn: '2025-04-10',
      summary: 'SV both eyes',
    });
    expect(res.status).toBe(400);
  });
});
