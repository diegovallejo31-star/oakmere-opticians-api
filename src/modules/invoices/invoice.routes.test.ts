import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeFrame, makeInvoice, makeLens, makePatient } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('invoices over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 0 });
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);
    await api(app).post(`/patients/${patientId}/dispensings`).send({
      frameId,
      lensId,
      dispensedOn: '2025-04-12',
    });

    const made = await api(app)
      .post('/invoices')
      .send({ patientId: patientId, number: 'OINV-1000', raisedOn: '2025-04-30' });
    expect(made.status).toBe(201);

    const listed = await api(app).get('/invoices');
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 0 });
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);
    await api(app).post(`/patients/${patientId}/dispensings`).send({
      frameId,
      lensId,
      dispensedOn: '2025-04-12',
    });

    const made = await api(app)
      .post('/invoices')
      .send({ patientId: patientId, number: 'OINV-1000', raisedOn: '2025-04-30' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'glassesPence',
      'id',
      'number',
      'patientId',
      'raisedOn',
      'repairsPence',
      'testsPence',
      'totalPence',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 0 });
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);
    await api(app).post(`/patients/${patientId}/dispensings`).send({
      frameId,
      lensId,
      dispensedOn: '2025-04-12',
    });

    const made = await api(app)
      .post('/invoices')
      .send({ patientId: patientId, number: 'OINV-1000', raisedOn: '2025-04-30' });
    const read = await api(app).get(`/invoices/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/invoices/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 0 });
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);
    await api(app).post(`/patients/${patientId}/dispensings`).send({
      frameId,
      lensId,
      dispensedOn: '2025-04-12',
    });

    const res = await api(app).post('/invoices').send({
      patientId: patientId,
      number: 'OINV-1000',
      raisedOn: '2025-04-30',
      nonesuch: 1,
    });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();

    const res = await api(app).get('/invoices?nonesuch=1');
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same number', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 0 });
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);
    await api(app).post(`/patients/${patientId}/dispensings`).send({
      frameId,
      lensId,
      dispensedOn: '2025-04-12',
    });

    const first = await api(app)
      .post('/invoices')
      .send({ patientId: patientId, number: 'OINV-1000', raisedOn: '2025-04-30' });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post('/invoices')
      .send({ patientId: patientId, number: 'OINV-1000', raisedOn: '2025-04-30' });
    expect(again.status).toBe(409);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    await makeInvoice(app);
    await makeInvoice(app);

    const all = await api(app).get('/invoices');
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get('/invoices?limit=1');
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/invoices/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();

    const res = await api(app).get('/invoices?limit=0');
    expect(res.status).toBe(400);
  });

  it('adds up the glasses, tests and repairs', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 0 });

    const frame = await api(app).post('/frames').send({
      sku: 'FR-IV',
      brand: 'B',
      model: 'M',
      costPence: 5000,
      markupBasisPoints: 10000,
    });
    const lens = await api(app)
      .post('/lenses')
      .send({ code: 'LN-IV', name: 'SV', kind: 'single_vision', pricePence: 3000 });
    await api(app).post(`/patients/${patientId}/dispensings`).send({
      frameId: frame.body.id,
      lensId: lens.body.id,
      dispensedOn: '2025-04-12',
    });
    await api(app).post(`/patients/${patientId}/repairs`).send({
      broughtOn: '2025-04-20',
      description: 'Nose pads',
      chargePence: 800,
    });

    const raised = await api(app)
      .post('/invoices')
      .send({ patientId, number: 'OINV-1', raisedOn: '2025-04-30' });

    expect(raised.status).toBe(201);
    // frame 5000 + 100% = 10000, + lens 3000 = 13000 glasses
    expect(raised.body.glassesPence).toBe(13000);
    expect(raised.body.repairsPence).toBe(800);
    expect(raised.body.totalPence).toBe(13800);
  });

  it('invoices a patient once', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const first = await api(app)
      .post('/invoices')
      .send({ patientId, number: 'OINV-2', raisedOn: '2025-04-30' });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post('/invoices')
      .send({ patientId, number: 'OINV-3', raisedOn: '2025-04-30' });
    expect(again.status).toBe(409);
  });

  it('404s for a patient that is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/invoices')
      .send({ patientId: 999999, number: 'OINV-4', raisedOn: '2025-04-30' });
    expect(res.status).toBe(404);
  });
});
