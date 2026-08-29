import { afterEach, describe, expect, it, vi } from 'vitest';

const userA = {
    uid: 'citizen-a',
    id: 'citizen-a',
    role: 'citizen',
    email: 'a@example.test',
    displayName: 'Citizen A',
    name: 'Citizen A'
};

const departmentA = {
    uid: 'officer-a',
    id: 'officer-a',
    role: 'department_user',
    departmentId: 'dept-a',
    displayName: 'Officer A',
    name: 'Officer A'
};

function jsonRequest(body, method = 'POST') {
    return new Request('http://localhost/api/test', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    });
}

async function responsePayload(response) {
    return response.json().catch(() => null);
}

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
});

describe('Phase 1 application IDOR boundaries', () => {
    it('denies another citizen application on draft update, delete, submit, actions, upload, and document viewed APIs', async () => {
        vi.doMock('$lib/server/applications/repository', () => ({
            updateApplicationDraft: vi.fn(async () => {
                throw new Error('Application not found.');
            }),
            deleteApplicationDraft: vi.fn(async () => {
                throw new Error('Application not found.');
            }),
            submitCitizenDraft: vi.fn(async () => {
                throw new Error('Application not found.');
            }),
            transitionApplication: vi.fn(async () => {
                throw new Error('Application not found.');
            }),
            markApplicationDocumentViewed: vi.fn(async () => {
                throw new Error('Application not found.');
            })
        }));
        vi.doMock('$lib/server/documents/repository', () => ({
            uploadApplicationDocument: vi.fn(async () => {
                throw new Error('Application not found.');
            })
        }));

        const applicationRoute = await import('../../src/routes/api/applications/[id]/+server.js');
        const submitRoute = await import('../../src/routes/api/applications/[id]/submit/+server.js');
        const actionsRoute = await import('../../src/routes/api/applications/[id]/actions/+server.js');
        const uploadRoute = await import('../../src/routes/api/applications/[id]/documents/+server.js');
        const viewedRoute = await import('../../src/routes/api/applications/[id]/documents/[documentId]/viewed/+server.js');

        await expect(applicationRoute.PUT({
            locals: { user: userA },
            params: { id: 'app-b' },
            request: jsonRequest({ formData: { fullName: 'Citizen A' } }, 'PUT')
        })).rejects.toMatchObject({ status: 400 });

        await expect(applicationRoute.DELETE({
            locals: { user: userA },
            params: { id: 'app-b' }
        })).rejects.toMatchObject({ status: 404 });

        const submitResponse = await submitRoute.POST({ locals: { user: userA }, params: { id: 'app-b' } });
        expect(submitResponse.status).toBe(404);
        expect(await responsePayload(submitResponse)).toMatchObject({ message: 'Application not found.' });

        await expect(actionsRoute.POST({
            locals: { user: departmentA },
            params: { id: 'app-b' },
            request: jsonRequest({ transitionId: 'approve' })
        })).rejects.toMatchObject({ status: 404 });

        const form = new FormData();
        form.set('documentType', 'doc-address');
        form.set('file', new File(['%PDF-1.4'], 'address.pdf', { type: 'application/pdf' }));
        await expect(uploadRoute.POST({
            locals: { user: userA },
            params: { id: 'app-b' },
            request: new Request('http://localhost/api/upload', { method: 'POST', body: form })
        })).rejects.toMatchObject({ status: 404 });

        await expect(viewedRoute.POST({
            locals: { user: departmentA },
            params: { id: 'app-b', documentId: 'doc-b' }
        })).rejects.toMatchObject({ status: 404 });
    });

    it('lists operator applications by assisted operator ownership, not by citizen ownership', async () => {
        vi.doUnmock('$lib/server/applications/repository');
        const where = vi.fn(function () {
            return this;
        });
        const limit = vi.fn(function () {
            return this;
        });
        const get = vi.fn(async () => ({
            docs: [{
                id: 'operator-draft-1',
                data: () => ({
                    id: 'operator-draft-1',
                    trackingId: 'TNH-2026-00000099',
                    serviceId: 'svc-income-cert',
                    serviceSlug: 'income-certificate',
                    serviceName: { en: 'Income Certificate', ta: 'வருமானச் சான்றிதழ்' },
                    departmentId: 'dept-revenue',
                    departmentName: { en: 'Revenue Department', ta: 'வருவாய்த் துறை' },
                    citizenId: 'citizen-b',
                    citizenName: 'Citizen B',
                    assistedByOperatorId: 'operator-a',
                    workflowId: 'wf-income-cert',
                    status: 'DRAFT',
                    formData: { fullName: 'Citizen B' },
                    documents: [],
                    reviewedDocumentIds: [],
                    createdAt: { toDate: () => new Date('2026-01-01T00:00:00.000Z') },
                    updatedAt: { toDate: () => new Date('2026-01-01T00:00:00.000Z') }
                })
            }]
        }));
        const applicationsCollection = { where, limit, get };
        vi.doMock('$lib/server/firebase/admin', () => ({
            getFirebaseAdminFirestore: () => ({
                collection: () => applicationsCollection
            })
        }));
        const { listApplicationsForUser } = await import('../../src/lib/server/applications/repository.js');

        const applications = await listApplicationsForUser({
            uid: 'operator-a',
            role: 'operator',
            displayName: 'Operator A'
        });

        expect(where).toHaveBeenCalledWith('assistedByOperatorId', '==', 'operator-a');
        expect(where).not.toHaveBeenCalledWith('citizenId', '==', 'operator-a');
        expect(applications).toHaveLength(1);
        expect(applications[0].id).toBe('operator-draft-1');
    });
});

describe('Phase 1 document and notification IDOR boundaries', () => {
    it('denies another user document download', async () => {
        vi.doMock('$lib/server/documents/repository', () => ({
            getAuthorizedDocumentDownloadUrl: vi.fn(async () => {
                throw new Error('Document not found.');
            })
        }));
        const route = await import('../../src/routes/api/documents/[documentId]/download/+server.js');

        await expect(route.GET({
            locals: { user: userA },
            params: { documentId: 'doc-b' }
        })).rejects.toMatchObject({ status: 404 });
    });

    it('denies another user notification mutation', async () => {
        vi.doMock('$lib/server/notifications/repository', () => ({
            markNotificationRead: vi.fn(async () => {
                throw new Error('Notification not found.');
            })
        }));
        const route = await import('../../src/routes/api/notifications/[id]/+server.js');

        await expect(route.PATCH({
            locals: { user: userA },
            params: { id: 'notification-b' }
        })).rejects.toMatchObject({ status: 404 });
    });
});

describe('Phase 1 role escalation boundary', () => {
    it('rejects client attempts to mutate role, department, identity, and active state through profile API', async () => {
        const updateUserProfilePreferences = vi.fn();
        vi.doMock('$lib/server/users/profile', () => ({ updateUserProfilePreferences }));
        const route = await import('../../src/routes/api/profile/+server.js');

        await expect(route.PATCH({
            locals: { user: userA },
            request: jsonRequest({
                role: 'admin',
                departmentId: 'dept-admin',
                uid: 'attacker',
                isActive: true
            }, 'PATCH')
        })).rejects.toMatchObject({ status: 403 });

        expect(updateUserProfilePreferences).not.toHaveBeenCalled();
    });
});

describe('Phase 1 complaint department isolation', () => {
    it('rejects department/officer updates when the complaint belongs to another department', async () => {
        const update = vi.fn();
        const doc = vi.fn(() => ({
            get: vi.fn(async () => ({
                exists: true,
                data: () => ({ id: 'complaint-b', departmentId: 'dept-b', history: [], status: 'SUBMITTED' })
            })),
            update
        }));
        vi.doMock('$lib/server/firebase/admin', () => ({
            getFirebaseAdminFirestore: () => ({
                collection: () => ({ doc })
            })
        }));
        vi.doMock('$lib/server/audit/repository', () => ({
            recordAuditEvent: vi.fn()
        }));
        const { updateComplaintStatus } = await import('../../src/lib/server/complaints/repository.js');

        await expect(updateComplaintStatus(departmentA, 'complaint-b', 'IN_REVIEW', 'reviewing')).rejects.toThrow(
            'Unauthorized to update complaints for another department.'
        );
        expect(update).not.toHaveBeenCalled();
    });

    it('rejects department/officer updates when the complaint has no department scope', async () => {
        const update = vi.fn();
        const doc = vi.fn(() => ({
            get: vi.fn(async () => ({
                exists: true,
                data: () => ({ id: 'complaint-open', history: [], status: 'SUBMITTED' })
            })),
            update
        }));
        vi.doMock('$lib/server/firebase/admin', () => ({
            getFirebaseAdminFirestore: () => ({
                collection: () => ({ doc })
            })
        }));
        vi.doMock('$lib/server/audit/repository', () => ({
            recordAuditEvent: vi.fn()
        }));
        const { updateComplaintStatus } = await import('../../src/lib/server/complaints/repository.js');

        await expect(updateComplaintStatus(departmentA, 'complaint-open', 'IN_REVIEW', 'reviewing')).rejects.toThrow(
            'Unauthorized to update complaints for another department.'
        );
        expect(update).not.toHaveBeenCalled();
    });
});

describe('Phase 1 safe server error responses', () => {
    it('does not expose raw notification repository errors on 500 responses', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.doMock('$lib/server/notifications/repository', () => ({
            listNotificationsForUser: vi.fn(async () => {
                throw new Error('Firebase Admin private key parse failed at /secret/path.json');
            })
        }));
        const route = await import('../../src/routes/api/notifications/+server.js');

        await expect(route.GET({ locals: { user: userA } })).rejects.toMatchObject({
            status: 500,
            body: { message: 'Unable to list notifications.' }
        });
    });
});
