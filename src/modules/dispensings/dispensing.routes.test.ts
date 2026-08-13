import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeDispensing, makeFrame, makeLens, makePatient } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('dispensings over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);

    const made = await api(app)
      .post(`/patients/${patientId}/dispensings`)
      .send({ frameId: frameId, lensId: lensId, dispensedOn: '2025-04-12' });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/patients/${patientId}/dispensings`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);

    const made = await api(app)
      .post(`/patients/${patientId}/dispensings`)
      .send({ frameId: frameId, lensId: lensId, dispensedOn: '2025-04-12' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'dispensedOn',
      'frameId',
      'framePence',
      'id',
      'lensId',
      'lensPence',
      'patientId',
      'totalPence',
      'updatedAt',
      'voucherPence',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);

    const made = await api(app)
      .post(`/patients/${patientId}/dispensings`)
      .send({ frameId: frameId, lensId: lensId, dispensedOn: '2025-04-12' });
    const read = await api(app).get(`/dispensings/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/dispensings/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    const frameId = await makeFrame(app);
    const lensId = await makeLens(app);

    const res = await api(app)
      .post(`/patients/${patientId}/dispensings`)
      .send({ frameId: frameId, lensId: lensId, dispensedOn: '2025-04-12', nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/dispensings?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the patient is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/patients/999999/dispensings')
      .send({ frameId: 1, lensId: 1, dispensedOn: '2025-04-12' });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);
    await makeDispensing(app, { patientId });
    await makeDispensing(app, { patientId });

    const all = await api(app).get(`/patients/${patientId}/dispensings`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/patients/${patientId}/dispensings?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/dispensings/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const patientId = await makePatient(app);

    const res = await api(app).get(`/patients/${patientId}/dispensings?limit=0`);
    expect(res.status).toBe(400);
  });

  it('adds frame retail and lenses, then takes the voucher off the total', async () => {
    const app = buildApp();
    // voucher 6900
    const patientId = await makePatient(app, { voucherPence: 6900 });
    // frame cost 4500 + 120% markup = 9900 retail
    const frame = await api(app).post('/frames').send({
      sku: 'FR-DX',
      brand: 'Ferndown',
      model: 'Ashcombe',
      costPence: 4500,
      markupBasisPoints: 12000,
    });
    const lens = await api(app)
      .post('/lenses')
      .send({ code: 'LN-DX', name: 'SV', kind: 'single_vision', pricePence: 3500 });

    const made = await api(app)
      .post(`/patients/${patientId}/dispensings`)
      .send({ frameId: frame.body.id, lensId: lens.body.id, dispensedOn: '2025-04-12' });
    expect(made.status).toBe(201);
    expect(made.body.framePence).toBe(9900);
    expect(made.body.lensPence).toBe(3500);
    expect(made.body.voucherPence).toBe(6900);
    // 9900 + 3500 - 6900 = 6500
    expect(made.body.totalPence).toBe(6500);
  });

  it('never pays out when the voucher is worth more than the glasses', async () => {
    const app = buildApp();
    const patientId = await makePatient(app, { voucherPence: 20000 });
    const frame = await api(app).post('/frames').send({
      sku: 'FR-CHEAP',
      brand: 'Basic',
      model: 'Plain',
      costPence: 1000,
      markupBasisPoints: 10000,
    });
    const lens = await api(app)
      .post('/lenses')
      .send({ code: 'LN-CHEAP', name: 'SV', kind: 'single_vision', pricePence: 2000 });

    const made = await api(app)
      .post(`/patients/${patientId}/dispensings`)
      .send({ frameId: frame.body.id, lensId: lens.body.id, dispensedOn: '2025-04-12' });
    expect(made.body.totalPence).toBe(0);
  });
});
