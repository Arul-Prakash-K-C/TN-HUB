import { describe, it, expect, afterAll } from 'vitest';
import { loadEnv } from 'vite';

const confirmation = process.env.CONFIRM_PHASE2_INTEGRATION_TEST;
const shouldRun = confirmation === 'SYMPHO_PHASE2_TEST';

const publicEnv = shouldRun ? loadEnv('development', process.cwd(), 'PUBLIC_') : {};

function logMem(label) {
  console.log(`[MEMORY ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB] ${label}`);
}

const results = [];
const cleanup = { applicationIds: new Set(), testUserId: null };

function record(name, details = '') {
  results.push({ test: name, status: 'passed', details });
}

async function authRequest(endpoint, body) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${publicEnv.PUBLIC_FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Firebase Auth ${endpoint} failed: ${payload?.error?.message ?? response.status}`);
  return payload;
}

async function parseResponse(response, label) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${label} failed: ${payload?.message ?? response.status}`);
  return payload;
}

function handlerEvent({ user, params = {}, body } = {}) {
  return {
    locals: user ? { user } : {},
    params,
    request: body instanceof Request
      ? body
      : new Request('http://localhost/api/test', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body)
        })
  };
}

async function cleanupApplication(db, storage, applicationId) {
  const applicationRef = db.collection('applications').doc(applicationId);
  const [documents, history, notifications] = await Promise.all([
    db.collection('documents').where('applicationId', '==', applicationId).get(),
    applicationRef.collection('statusHistory').get(),
    db.collection('notifications').where('applicationId', '==', applicationId).get()
  ]);
  const documentIds = documents.docs.map((document) => document.id);
  await Promise.all(documents.docs.map(async (document) => {
    const storagePath = document.get('storagePath');
    if (typeof storagePath === 'string' && storagePath) {
      await storage.bucket().file(storagePath).delete({ ignoreNotFound: true });
    }
  }));

  const auditSnapshots = await Promise.all(
    [applicationId, ...documentIds].map((entityId) => db.collection('auditLogs').where('entityId', '==', entityId).get())
  );
  const batch = db.batch();
  for (const document of documents.docs) batch.delete(document.ref);
  for (const entry of history.docs) batch.delete(entry.ref);
  for (const notification of notifications.docs) batch.delete(notification.ref);
  for (const snapshot of auditSnapshots) for (const auditLog of snapshot.docs) batch.delete(auditLog.ref);
  batch.delete(applicationRef);
  await batch.commit();
}

describe.runIf(shouldRun)('Phase 2 Integration Verification Suite', () => {
  it('executes full Phase 2 Firebase workflow end-to-end', async () => {
    logMem('Start of verification');
    const { getFirebaseAdminAuth, getFirebaseAdminFirestore, getFirebaseAdminStorage } = await import('$lib/server/firebase/admin');
    const { createSessionFromIdToken, SESSION_COOKIE_NAME } = await import('$lib/server/auth/session');
    const { loadPublicCatalog } = await import('$lib/server/catalog/repository');
    const {
      getApplicationForUser,
      getApplicationWorkflowActions,
      listApplicationsForUser
    } = await import('$lib/server/applications/repository');
    const { listNotificationsForUser } = await import('$lib/server/notifications/repository');
    const { getAuthorizedDocumentDownloadUrl } = await import('$lib/server/documents/repository');

    const authSessionRoute = await import('../../src/routes/api/auth/session/+server.js');
    const applicationsRoute = await import('../../src/routes/api/applications/+server.js');
    const submitRoute = await import('../../src/routes/api/applications/[id]/submit/+server.js');
    const paymentOtpRoute = await import('../../src/routes/api/applications/[id]/payment/otp/+server.js');
    const paymentConfirmRoute = await import('../../src/routes/api/applications/[id]/payment/confirm/+server.js');
    const uploadRoute = await import('../../src/routes/api/applications/[id]/documents/+server.js');
    const actionRoute = await import('../../src/routes/api/applications/[id]/actions/+server.js');
    const reviewRoute = await import('../../src/routes/api/applications/[id]/documents/[documentId]/+server.js');
    const viewedRoute = await import('../../src/routes/api/applications/[id]/documents/[documentId]/viewed/+server.js');
    const operatorRoute = await import('../../src/routes/api/operator/applications/+server.js');
    logMem('After module imports');

    const db = getFirebaseAdminFirestore();
    const adminAuth = getFirebaseAdminAuth();
    const storage = getFirebaseAdminStorage();
    logMem('After getFirebaseAdmin*');

    try {
      const credentials = [
        ['citizen', 'meena@demo.com', 'demo123', 'citizen'],
        ['department revenue', 'rajesh@demo.com', 'demo123', 'department_user'],
        ['department civil supplies', 'kavitha@demo.com', 'demo123', 'department_user'],
        ['operator', 'kannan@demo.com', 'demo123', 'operator'],
        ['admin', 'priya@demo.com', 'demo123', 'admin']
      ];
      const users = {};
      for (const [label, email, password, expectedRole] of credentials) {
        const token = await authRequest('accounts:signInWithPassword', { email, password, returnSecureToken: true });
        const session = await createSessionFromIdToken(token.idToken);
        expect(session.user.role).toBe(expectedRole);
        users[label] = session.user;
        record(`${label} Firebase login and server session`, expectedRole);
        logMem(`After auth: ${label}`);
      }

      const registration = await authRequest('accounts:signUp', {
        email: `phase2-audit-${Date.now()}@demo.invalid`,
        password: 'Phase2Audit!9',
        returnSecureToken: true
      });
      cleanup.testUserId = registration.localId;
      const registeredSession = await createSessionFromIdToken(registration.idToken);
      expect(registeredSession.user.role).toBe('citizen');
      expect((await db.collection('users').doc(registration.localId).get()).exists).toBe(true);
      record('citizen registration and profile creation', 'new account is least-privileged');
      logMem('After citizen registration');

      const cookieWrites = [];
      const logoutResponse = await authSessionRoute.DELETE({
        cookies: { delete: (name, options) => cookieWrites.push({ name, options }) }
      });
      expect(logoutResponse.status).toBe(204);
      expect(cookieWrites.some((cookie) => cookie.name === SESSION_COOKIE_NAME)).toBe(true);
      record('logout endpoint', 'clears HttpOnly session cookie');

      const catalog = await loadPublicCatalog();
      expect(catalog.services.length).toBeGreaterThan(0);
      expect(catalog.departments.length).toBeGreaterThan(0);
      expect(catalog.services.every((service) => service.name && service.nameTA && service.description && service.descriptionTA)).toBe(true);
      const revenueService = catalog.services.find((service) => service.departmentId === 'dept-revenue' && service.implementationMode === 'NATIVE_WORKFLOW');
      expect(revenueService).toBeDefined();
      const paidNativeService = catalog.services.find((service) => service.implementationMode === 'NATIVE_WORKFLOW' && Number(service.fee?.amount ?? service.fee ?? 0) > 0);
      expect(paidNativeService).toBeDefined();
      record('Firestore departments and service catalog', `${catalog.departments.length} departments, ${catalog.services.length} active services`);
      logMem('After loadPublicCatalog');

      function phase2ApplicationFormData(label) {
        return {
          fullName: `Phase 2 ${label} Demo`,
          fatherName: 'Phase 2 Guardian',
          dateOfBirth: '1990-01-01',
          gender: 'female',
          phone: '9876543210',
          aadhaarNumber: '123456789012',
          purpose: 'integration test',
          district: 'Chennai',
          taluk: 'Mambalam',
          village: 'Mambalam',
          surveyNumber: '142/3A',
          annualIncome: 120000,
          occupation: 'Farmer',
          religion: 'Hindu',
          communityCategory: 'BC',
          subCaste: 'Demo community',
          placeOfBirth: 'Chennai',
          residenceDurationYears: 15,
          doorNo: '12',
          street: 'Demo Street',
          area: 'Mambalam',
          pincode: '600040'
        };
      }

      async function createSubmittedApplication(label) {
        const created = await parseResponse(await applicationsRoute.POST(handlerEvent({
          user: users.citizen,
          body: { serviceId: revenueService.id, formData: phase2ApplicationFormData(label), submit: false }
        })), `${label} draft creation`);
        const applicationId = created.application.id;
        cleanup.applicationIds.add(applicationId);
        expect(created.application.status).toBe('DRAFT');

        for (const document of revenueService.requiredDocuments.filter((entry) => entry.mandatory)) {
          const formData = new FormData();
          formData.set('documentType', document.id);
          formData.set('file', new File([new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52])], `${document.id}.pdf`, { type: 'application/pdf' }));
          const uploaded = await parseResponse(await uploadRoute.POST({
            locals: { user: users.citizen },
            params: { id: applicationId },
            request: new Request('http://localhost/api/upload', { method: 'POST', body: formData })
          }), `${label} document upload`);
          expect(uploaded.document?.id).toBeDefined();
        }

        const submitted = await parseResponse(await submitRoute.POST({ locals: { user: users.citizen }, params: { id: applicationId } }), `${label} submission`);
        expect(submitted.application.status).toBe('DOCUMENT_VERIFICATION');
        return applicationId;
      }

      async function createPaymentDraft(label) {
        const created = await parseResponse(await applicationsRoute.POST(handlerEvent({
          user: users.citizen,
          body: { serviceId: paidNativeService.id, formData: phase2ApplicationFormData(label), submit: false }
        })), `${label} payment draft creation`);
        const applicationId = created.application.id;
        cleanup.applicationIds.add(applicationId);
        expect(created.application.status).toBe('DRAFT');

        for (const document of (paidNativeService.requiredDocuments || []).filter((entry) => entry.mandatory)) {
          const formData = new FormData();
          formData.set('documentType', document.id);
          formData.set('file', new File([new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52])], `${document.id}.pdf`, { type: 'application/pdf' }));
          const uploaded = await parseResponse(await uploadRoute.POST({
            locals: { user: users.citizen },
            params: { id: applicationId },
            request: new Request('http://localhost/api/upload', { method: 'POST', body: formData })
          }), `${label} document upload`);
          expect(uploaded.document?.id).toBeDefined();
        }

        return applicationId;
      }

      const failedPaymentApplicationId = await createPaymentDraft('payment failed');
      const failedOtp = await parseResponse(await paymentOtpRoute.POST({
        locals: { user: users.citizen },
        params: { id: failedPaymentApplicationId },
        request: new Request('http://localhost/api/payment-otp', { method: 'POST' })
      }), 'failed payment OTP request');
      expect(failedOtp.payment.status).toBe('OTP_SENT');
      const failedPayment = await parseResponse(await paymentConfirmRoute.POST(handlerEvent({
        user: users.citizen,
        params: { id: failedPaymentApplicationId },
        body: { otp: '1234', outcome: 'FAILED' }
      })), 'failed simulated payment confirmation');
      expect(failedPayment.payment.status).toBe('FAILED');

      const successfulPaymentApplicationId = await createPaymentDraft('payment success');
      const successfulOtp = await parseResponse(await paymentOtpRoute.POST({
        locals: { user: users.citizen },
        params: { id: successfulPaymentApplicationId },
        request: new Request('http://localhost/api/payment-otp', { method: 'POST' })
      }), 'successful payment OTP request');
      expect(successfulOtp.payment.status).toBe('OTP_SENT');
      const successfulPayment = await parseResponse(await paymentConfirmRoute.POST(handlerEvent({
        user: users.citizen,
        params: { id: successfulPaymentApplicationId },
        body: { otp: '1234', outcome: 'SUCCESS' }
      })), 'successful simulated payment confirmation');
      expect(successfulPayment.payment.status).toBe('SUCCESS');
      expect(successfulPayment.payment.referenceId).toBeDefined();
      record('payment and OTP simulation', `${paidNativeService.id} supports SUCCESS and FAILED outcomes`);
      logMem('After payment simulation');

      const approvedApplicationId = await createSubmittedApplication('approval');
      record('citizen draft, application-document upload, and submission', 'Firestore application and status history created');
      logMem('After createSubmittedApplication approval');

      const citizenApplication = await getApplicationForUser(users.citizen, approvedApplicationId);
      expect(citizenApplication?.history.length).toBeGreaterThanOrEqual(2);
      expect(await getApplicationForUser(users['department civil supplies'], approvedApplicationId)).toBeNull();
      expect(await getApplicationForUser(registeredSession.user, approvedApplicationId)).toBeNull();
      expect(await getApplicationForUser(users.operator, approvedApplicationId)).toBeNull();
      expect(await getApplicationForUser(users.admin, approvedApplicationId)).toBeDefined();
      record('server application isolation', 'foreign citizen, foreign department, and operator denied');

      const approvedDocuments = await db.collection('documents').where('applicationId', '==', approvedApplicationId).get();
      expect(approvedDocuments.empty).toBe(false);
      const firstDocumentId = approvedDocuments.docs[0].id;
      for (const document of approvedDocuments.docs) {
        await parseResponse(await viewedRoute.POST(handlerEvent({
          user: users['department revenue'],
          params: { id: approvedApplicationId, documentId: document.id }
        })), `department document viewed ${document.id}`);
        await parseResponse(await reviewRoute.PATCH(handlerEvent({
          user: users['department revenue'],
          params: { id: approvedApplicationId, documentId: document.id },
          body: { status: 'verified', comment: 'Verified during Phase 2 audit.' }
        })), `department document review ${document.id}`);
      }
      logMem('After document review');
      const availableActions = await getApplicationWorkflowActions(users['department revenue'], approvedApplicationId);
      const verifyTransition = availableActions.find((action) => action.toState === 'OFFICER_REVIEW');
      expect(verifyTransition).toBeDefined();
      await parseResponse(await actionRoute.POST(handlerEvent({
        user: users['department revenue'],
        params: { id: approvedApplicationId },
        body: { transitionId: verifyTransition.id }
      })), 'department workflow action');
      let approved = await getApplicationForUser(users['department revenue'], approvedApplicationId);
      for (let step = 0; step < 6 && approved?.status !== 'COMPLETED'; step += 1) {
        const approvalActions = await getApplicationWorkflowActions(users['department revenue'], approvedApplicationId);
        const nextApprovalAction = approvalActions.find((action) =>
          !action.requiresReason && action.toState !== 'REJECTED' && action.toState !== 'CLARIFICATION_REQUESTED'
        );
        expect(nextApprovalAction).toBeDefined();
        const response = await parseResponse(await actionRoute.POST(handlerEvent({
          user: users['department revenue'],
          params: { id: approvedApplicationId },
          body: { transitionId: nextApprovalAction.id }
        })), `approval workflow transition ${step + 1}`);
        approved = response.application;
      }
      expect(approved?.status).toBe('COMPLETED');
      record('department document review and approve workflow', 'history, audit log, and citizen notification path exercised');
      logMem('After approval workflow');

      const rejectionApplicationId = await createSubmittedApplication('rejection');
      const rejectionActions = await getApplicationWorkflowActions(users['department revenue'], rejectionApplicationId);
      const rejectionTransition = rejectionActions.find((action) => action.toState === 'CLARIFICATION_REQUESTED');
      expect(rejectionTransition).toBeDefined();
      const clarification = await parseResponse(await actionRoute.POST(handlerEvent({
        user: users['department revenue'],
        params: { id: rejectionApplicationId },
        body: { transitionId: rejectionTransition.id, comment: 'Please provide a clearer supporting document.' }
      })), 'request correction');
      expect(clarification.application.status).toBe('CLARIFICATION_REQUESTED');
      record('department correction request', 'reason-gated workflow action succeeded');
      logMem('After rejection/correction workflow');

      const operatorDraft = await parseResponse(await operatorRoute.POST(handlerEvent({
        user: users.operator,
        body: { citizenId: users.citizen.uid, serviceId: revenueService.id, formData: { fullName: 'Phase 2 Operator Demo' } }
      })), 'operator assisted draft');
      cleanup.applicationIds.add(operatorDraft.application.id);
      const operatorApplications = await listApplicationsForUser(users.operator);
      expect(operatorApplications.some((application) => application.id === operatorDraft.application.id)).toBe(true);
      expect(await getApplicationForUser(users['department civil supplies'], operatorDraft.application.id)).toBeNull();
      record('operator assisted workflow', 'operator can create and list only own assisted draft');
      logMem('After operator assisted workflow');

      const citizenNotifications = await listNotificationsForUser(users.citizen);
      const revenueNotifications = await listNotificationsForUser(users['department revenue']);
      expect(citizenNotifications.some((notification) => notification.relatedEntityId === approvedApplicationId)).toBe(true);
      expect(revenueNotifications.some((notification) => notification.relatedEntityId === approvedApplicationId)).toBe(true);
      record('multilingual Firestore notifications', 'citizen and department recipients receive private application notifications');
      logMem('After notifications verification');

      await getApplicationForUser(users.citizen, approvedApplicationId);
      const ownDownload = await getAuthorizedDocumentDownloadUrl(users.citizen, firstDocumentId);
      expect(typeof ownDownload).toBe('string');
      expect(ownDownload.startsWith('https://')).toBe(true);
      let foreignDocumentDenied = false;
      try {
        await getAuthorizedDocumentDownloadUrl(users['department civil supplies'], firstDocumentId);
      } catch {
        foreignDocumentDenied = true;
      }
      expect(foreignDocumentDenied).toBe(true);
      record('server document authorization', 'owner signed URL granted; foreign department denied');
      logMem('After signed URL check');

      console.table(results);
    } finally {
      logMem('Entering cleanup');
      await Promise.all(Array.from(cleanup.applicationIds).map((applicationId) => cleanupApplication(db, storage, applicationId)));
      if (cleanup.testUserId) {
        await db.collection('users').doc(cleanup.testUserId).delete().catch(() => undefined);
        await adminAuth.deleteUser(cleanup.testUserId).catch(() => undefined);
      }
      logMem('After cleanup completed');
    }
  }, 180000);
});
