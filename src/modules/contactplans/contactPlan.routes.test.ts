import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeContactPlan, makePatient } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('contactplans over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app)
      .post(`/patients/${patientId}/contact-plans`)
      .send({ startedOn: '2025-01-15', monthlyPence: 2200 });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('active');

    const listed = await api(app).get(`/patients/${patientId}/contact-plans`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app)
      .post(`/patients/${patientId}/contact-plans`)
      .send({ startedOn: '2025-01-15', monthlyPence: 2200 });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'id',
      'monthlyPence',
      'patientId',
      'startedOn',
      'status',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const made = await api(app)
      .post(`/patients/${patientId}/contact-plans`)
      .send({ startedOn: '2025-01-15', monthlyPence: 2200 });
    const read = await api(app).get(`/contact-plans/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/contact-plans/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app)
      .post(`/patients/${patientId}/contact-plans`)
      .send({ startedOn: '2025-01-15', monthlyPence: 2200, nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/contact-plans?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the patient is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/patients/999999/contact-plans')
      .send({ startedOn: '2025-01-15', monthlyPence: 2200 });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    await makeContactPlan(app, { patientId });
    await makeContactPlan(app, { patientId });

    const all = await api(app).get(`/patients/${patientId}/contact-plans`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/patients/${patientId}/contact-plans?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/contact-plans/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/contact-plans?limit=0`);
    expect(res.status).toBe(400);
  });

  it('cancels a plan once and refuses to cancel it again', async () => {
    const app = buildApp();
    const planId = await makeContactPlan(app);

    const cancelled = await api(app)
      .post(`/contact-plans/${planId}/cancel`)
      .send({ status: 'cancelled' });
    expect(cancelled.status).toBe(200);

    const again = await api(app)
      .post(`/contact-plans/${planId}/cancel`)
      .send({ status: 'cancelled' });
    expect(again.status).toBe(409);
  });
});
