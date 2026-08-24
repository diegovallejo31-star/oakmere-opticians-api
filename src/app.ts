import express, { type Express } from 'express';
import type { Database } from './db/client';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { auditLog } from './middleware/auditLog';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { createApiKeyRouter } from './modules/apikeys/apiKey.routes';
import { createAuditRouter } from './modules/audit/audit.routes';
import { createAuthRouter } from './modules/auth/auth.routes';
import {
  createContactPlanRouter,
  createPatientContactPlanRouter,
} from './modules/contactplans/contactPlan.routes';
import {
  createDispensingRouter,
  createPatientDispensingRouter,
} from './modules/dispensings/dispensing.routes';
import { createFrameRouter } from './modules/frames/frame.routes';
import { createInvoiceRouter } from './modules/invoices/invoice.routes';
import {
  createDispensingLabOrderRouter,
  createLabOrderRouter,
} from './modules/laborders/labOrder.routes';
import { createLensRouter } from './modules/lenses/lens.routes';
import { createPatientRouter } from './modules/patients/patient.routes';
import { createPracticeRouter } from './modules/practices/practice.routes';
import {
  createPatientPrescriptionRouter,
  createPrescriptionRouter,
} from './modules/prescriptions/prescription.routes';
import {
  createPatientRecallRouter,
  createRecallRouter,
} from './modules/recalls/recall.routes';
import {
  createPatientRepairRouter,
  createRepairRouter,
} from './modules/repairs/repair.routes';
import {
  createPatientSightTestRouter,
  createSightTestRouter,
} from './modules/sighttests/sightTest.routes';
import {
  createPracticeStaffMemberRouter,
  createStaffMemberRouter,
} from './modules/staff/staffMember.routes';

export function createApp(db: Database): Express {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimit(db));
  app.use(auditLog(db));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const { router: authRouter } = createAuthRouter(db);
  app.use('/auth', authRouter);

  const requireApiKey = apiKeyAuth(db);
  app.use('/api-keys', requireApiKey, createApiKeyRouter(db));
  app.use('/audit', requireApiKey, createAuditRouter(db));
  app.use('/practices', requireApiKey, createPracticeRouter(db));
  app.use('/practices', requireApiKey, createPracticeStaffMemberRouter(db));
  app.use('/staff', requireApiKey, createStaffMemberRouter(db));
  app.use('/patients', requireApiKey, createPatientRouter(db));
  app.use('/frames', requireApiKey, createFrameRouter(db));
  app.use('/lenses', requireApiKey, createLensRouter(db));
  app.use('/patients', requireApiKey, createPatientSightTestRouter(db));
  app.use('/sight-tests', requireApiKey, createSightTestRouter(db));
  app.use('/patients', requireApiKey, createPatientPrescriptionRouter(db));
  app.use('/prescriptions', requireApiKey, createPrescriptionRouter(db));
  app.use('/patients', requireApiKey, createPatientDispensingRouter(db));
  app.use('/dispensings', requireApiKey, createDispensingRouter(db));
  app.use('/dispensings', requireApiKey, createDispensingLabOrderRouter(db));
  app.use('/lab-orders', requireApiKey, createLabOrderRouter(db));
  app.use('/patients', requireApiKey, createPatientRecallRouter(db));
  app.use('/recalls', requireApiKey, createRecallRouter(db));
  app.use('/patients', requireApiKey, createPatientRepairRouter(db));
  app.use('/repairs', requireApiKey, createRepairRouter(db));
  app.use('/patients', requireApiKey, createPatientContactPlanRouter(db));
  app.use('/contact-plans', requireApiKey, createContactPlanRouter(db));
  app.use('/invoices', requireApiKey, createInvoiceRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
