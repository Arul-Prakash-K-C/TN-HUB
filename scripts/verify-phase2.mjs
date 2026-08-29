import { createServer, loadEnv } from 'vite';

const confirmation = process.env.CONFIRM_PHASE2_INTEGRATION_TEST;
if (confirmation !== 'SYMPHO_PHASE2_TEST') {
  throw new Error('Refusing to run integration tests. Set CONFIRM_PHASE2_INTEGRATION_TEST=SYMPHO_PHASE2_TEST for this one command.');
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.ALLOW_PRODUCTION_PHASE2_TEST !== 'SYMPHO_PRODUCTION_PHASE2_TEST'
) {
  throw new Error('Refusing to run Phase 2 integration tests with NODE_ENV=production without an explicit demo-environment override.');
}

const publicEnv = loadEnv('development', process.cwd(), 'PUBLIC_');
if (!publicEnv.PUBLIC_FIREBASE_API_KEY) throw new Error('PUBLIC_FIREBASE_API_KEY is required for Firebase Auth integration tests.');

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const results = [];
const cleanup = { applicationIds: new Set(), testUserId: null };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

try {
  const [adminModule, sessionModule, catalogModule, applicationsModule, notificationsModule, authSessionRoute, applicationsRoute, submitRoute, uploadRoute, actionRoute, reviewRoute, operatorRoute] = await Promise.all([
    server.ssrLoadModule('/src/lib/server/firebase/admin.js'),
    server.ssrLoadModule('/src/lib/server/auth/session.js'),
    server.ssrLoadModule('/src/lib/server/catalog/repository.js'),
    server.ssrLoadModule('/src/lib/server/applications/repository.js'),
    server.ssrLoadModule('/src/lib/server/notifications/repository.js'),
    server.ssrLoadModule('/src/routes/api/auth/session/+server.js'),
    server.ssrLoadModule('/src/routes/api/applications/+server.js'),
    server.ssrLoadModule('/src/routes/api/applications/[id]/submit/+server.js'),
    server.ssrLoadModule('/src/routes/api/applications/[id]/documents/+server.js'),
    server.ssrLoadModule('/src/routes/api/applications/[id]/actions/+server.js'),
    server.ssrLoadModule('/src/routes/api/applications/[id]/documents/[documentId]/+server.js'),
    server.ssrLoadModule('/src/routes/api/operator/applications/+server.js')
  ]);
  const { getFirebaseAdminAuth, getFirebaseAdminFirestore, getFirebaseAdminStorage } = adminModule;
  const db = getFirebaseAdminFirestore();
  const adminAuth = getFirebaseAdminAuth();
  const storage = getFirebaseAdminStorage();

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
    const session = await sessionModule.createSessionFromIdToken(token.idToken);
    assert(session.user.role === expectedRole, `${label} session role was ${session.user.role}, not ${expectedRole}`);
    users[label] = session.user;
    record(`${label} Firebase login and server session`, expectedRole);
  }

  const registration = await authRequest('accounts:signUp', {
    email: `phase2-audit-${Date.now()}@demo.invalid`,
    password: 'Phase2Audit!9',
    returnSecureToken: true
  });
  cleanup.testUserId = registration.localId;
  const registeredSession = await sessionModule.createSessionFromIdToken(registration.idToken);
  assert(registeredSession.user.role === 'citizen', 'new client registration did not receive least-privileged citizen role');
  assert((await db.collection('users').doc(registration.localId).get()).exists, 'server session did not create users/{uid}');
  record('citizen registration and profile creation', 'new account is least-privileged');

  const cookieWrites = [];
  const logoutResponse = await authSessionRoute.DELETE({
    cookies: { delete: (name, options) => cookieWrites.push({ name, options }) }
  });
  assert(logoutResponse.status === 204 && cookieWrites.some((cookie) => cookie.name === sessionModule.SESSION_COOKIE_NAME), 'logout route did not clear the server session cookie');
  record('logout endpoint', 'clears HttpOnly session cookie');

  const catalog = await catalogModule.loadPublicCatalog();
  assert(catalog.services.length > 0 && catalog.departments.length > 0, 'Firestore catalog is empty');
  assert(catalog.services.every((service) => service.name && service.nameTA && service.description && service.descriptionTA), 'catalog lacks bilingual service data');
  const revenueService = catalog.services.find((service) => service.departmentId === 'dept-revenue' && service.implementationMode === 'NATIVE_WORKFLOW');
  assert(revenueService, 'no native Revenue service available for application testing');
  record('Firestore departments and service catalog', `${catalog.departments.length} departments, ${catalog.services.length} active services`);

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
    assert(created.application.status === 'DRAFT', `${label} did not begin as a draft`);

    for (const document of revenueService.requiredDocuments.filter((entry) => entry.mandatory)) {
      const formData = new FormData();
      formData.set('documentType', document.id);
      formData.set('file', new File([new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52])], `${document.id}.pdf`, { type: 'application/pdf' }));
      const uploaded = await parseResponse(await uploadRoute.POST({
        locals: { user: users.citizen },
        params: { id: applicationId },
        request: new Request('http://localhost/api/upload', { method: 'POST', body: formData })
      }), `${label} document upload`);
      assert(uploaded.document?.id, `${label} document upload returned no metadata`);
    }

    const submitted = await parseResponse(await submitRoute.POST({ locals: { user: users.citizen }, params: { id: applicationId } }), `${label} submission`);
    assert(submitted.application.status === 'DOCUMENT_VERIFICATION', `${label} automatic workflow did not advance to document verification`);
    return applicationId;
  }

  const approvedApplicationId = await createSubmittedApplication('approval');
  record('citizen draft, application-document upload, and submission', 'Firestore application and status history created');

  const citizenApplication = await applicationsModule.getApplicationForUser(users.citizen, approvedApplicationId);
  assert(citizenApplication?.history.length >= 2, 'application status history was not recorded');
  assert(await applicationsModule.getApplicationForUser(users['department civil supplies'], approvedApplicationId) === null, 'foreign department accessed Revenue application');
  assert(await applicationsModule.getApplicationForUser(registeredSession.user, approvedApplicationId) === null, 'foreign citizen accessed another citizen application');
  assert(await applicationsModule.getApplicationForUser(users.operator, approvedApplicationId) === null, 'operator accessed a non-assisted application');
  assert(await applicationsModule.getApplicationForUser(users.admin, approvedApplicationId), 'admin could not access application');
  record('server application isolation', 'foreign citizen, foreign department, and operator denied');

  const approvedDocuments = await db.collection('documents').where('applicationId', '==', approvedApplicationId).get();
  assert(!approvedDocuments.empty, 'no application documents were stored');
  const firstDocumentId = approvedDocuments.docs[0].id;
  for (const document of approvedDocuments.docs) {
    await parseResponse(await reviewRoute.PATCH(handlerEvent({
      user: users['department revenue'],
      params: { id: approvedApplicationId, documentId: document.id },
      body: { status: 'verified', comment: 'Verified during Phase 2 audit.' }
    })), `department document review ${document.id}`);
  }
  const availableActions = await applicationsModule.getApplicationWorkflowActions(users['department revenue'], approvedApplicationId);
  const verifyTransition = availableActions.find((action) => action.toState === 'OFFICER_REVIEW');
  assert(verifyTransition, 'department verification action was unavailable');
  await parseResponse(await actionRoute.POST(handlerEvent({
    user: users['department revenue'],
    params: { id: approvedApplicationId },
    body: { transitionId: verifyTransition.id }
  })), 'department workflow action');
  let approved = await applicationsModule.getApplicationForUser(users['department revenue'], approvedApplicationId);
  for (let step = 0; step < 6 && approved?.status !== 'COMPLETED'; step += 1) {
    const approvalActions = await applicationsModule.getApplicationWorkflowActions(users['department revenue'], approvedApplicationId);
    const nextApprovalAction = approvalActions.find((action) =>
      !action.requiresReason && action.toState !== 'REJECTED' && action.toState !== 'CLARIFICATION_REQUESTED'
    );
    assert(nextApprovalAction, `no non-terminal approval action was available from ${approved?.status}`);
    const response = await parseResponse(await actionRoute.POST(handlerEvent({
      user: users['department revenue'],
      params: { id: approvedApplicationId },
      body: { transitionId: nextApprovalAction.id }
    })), `approval workflow transition ${step + 1}`);
    approved = response.application;
  }
  assert(approved?.status === 'COMPLETED', 'automatic completion after approval failed');
  record('department document review and approve workflow', 'history, audit log, and citizen notification path exercised');

  const rejectionApplicationId = await createSubmittedApplication('rejection');
  const rejectionActions = await applicationsModule.getApplicationWorkflowActions(users['department revenue'], rejectionApplicationId);
  const rejectionTransition = rejectionActions.find((action) => action.toState === 'CLARIFICATION_REQUESTED');
  assert(rejectionTransition, 'clarification action was unavailable');
  const clarification = await parseResponse(await actionRoute.POST(handlerEvent({
    user: users['department revenue'],
    params: { id: rejectionApplicationId },
    body: { transitionId: rejectionTransition.id, comment: 'Please provide a clearer supporting document.' }
  })), 'request correction');
  assert(clarification.application.status === 'CLARIFICATION_REQUESTED', 'correction request did not update the workflow');
  record('department correction request', 'reason-gated workflow action succeeded');

  const operatorDraft = await parseResponse(await operatorRoute.POST(handlerEvent({
    user: users.operator,
    body: { citizenId: users.citizen.uid, serviceId: revenueService.id, formData: { fullName: 'Phase 2 Operator Demo' } }
  })), 'operator assisted draft');
  cleanup.applicationIds.add(operatorDraft.application.id);
  const operatorApplications = await applicationsModule.listApplicationsForUser(users.operator);
  assert(operatorApplications.some((application) => application.id === operatorDraft.application.id), 'operator could not list own assisted draft');
  assert(await applicationsModule.getApplicationForUser(users['department civil supplies'], operatorDraft.application.id) === null, 'foreign department saw an operator assisted draft');
  record('operator assisted workflow', 'operator can create and list only own assisted draft');

  const citizenNotifications = await notificationsModule.listNotificationsForUser(users.citizen);
  const revenueNotifications = await notificationsModule.listNotificationsForUser(users['department revenue']);
  assert(citizenNotifications.some((notification) => notification.relatedEntityId === approvedApplicationId), 'citizen did not receive workflow notification');
  assert(revenueNotifications.some((notification) => notification.relatedEntityId === approvedApplicationId), 'department user did not receive submission notification');
  record('multilingual Firestore notifications', 'citizen and department recipients receive private application notifications');

  await applicationsModule.getApplicationForUser(users.citizen, approvedApplicationId);
  const ownDownload = await (await server.ssrLoadModule('/src/lib/server/documents/repository.js')).getAuthorizedDocumentDownloadUrl(users.citizen, firstDocumentId);
  assert(typeof ownDownload === 'string' && ownDownload.startsWith('https://'), 'authorized document access did not issue a signed URL');
  let foreignDocumentDenied = false;
  try {
    await (await server.ssrLoadModule('/src/lib/server/documents/repository.js')).getAuthorizedDocumentDownloadUrl(users['department civil supplies'], firstDocumentId);
  } catch {
    foreignDocumentDenied = true;
  }
  assert(foreignDocumentDenied, 'foreign department accessed application document');
  record('server document authorization', 'owner signed URL granted; foreign department denied');

  console.table(results);
} finally {
  try {
    const adminModule = await server.ssrLoadModule('/src/lib/server/firebase/admin.js');
    const db = adminModule.getFirebaseAdminFirestore();
    const storage = adminModule.getFirebaseAdminStorage();
    for (const applicationId of cleanup.applicationIds) await cleanupApplication(db, storage, applicationId);
    if (cleanup.testUserId) {
      await db.collection('users').doc(cleanup.testUserId).delete().catch(() => undefined);
      await adminModule.getFirebaseAdminAuth().deleteUser(cleanup.testUserId).catch(() => undefined);
    }
  } finally {
    await server.close();
  }
}
