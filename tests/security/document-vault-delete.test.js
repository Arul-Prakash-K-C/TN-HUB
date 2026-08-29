import { afterEach, describe, expect, it, vi } from 'vitest';

const citizenA = {
    uid: 'citizen-123',
    id: 'citizen-123',
    role: 'citizen',
    email: 'citizen123@example.com',
    name: 'Citizen 123'
};

const citizenB = {
    uid: 'citizen-456',
    id: 'citizen-456',
    role: 'citizen',
    email: 'citizen456@example.com',
    name: 'Citizen 456'
};

afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
});

describe('Document Vault Delete Security Boundaries', () => {
    it('requires authentication to delete a document', async () => {
        const { DELETE } = await import('../../src/routes/api/documents/[documentId]/+server.js');
        await expect(
            DELETE({
                locals: { user: null },
                params: { documentId: 'doc-1' }
            })
        ).rejects.toMatchObject({ status: 401 });
    });

    it('requires a documentId parameter', async () => {
        const { DELETE } = await import('../../src/routes/api/documents/[documentId]/+server.js');
        await expect(
            DELETE({
                locals: { user: citizenA },
                params: { documentId: '' }
            })
        ).rejects.toMatchObject({ status: 400 });
    });

    it('successfully allows owner citizen to delete their vault document', async () => {
        vi.doMock('$lib/server/documents/repository', () => ({
            deleteCitizenDocument: vi.fn(async (user, docId) => {
                if (user.uid !== 'citizen-123') throw new Error('Document not found.');
                return { success: true, id: docId };
            })
        }));

        const { DELETE } = await import('../../src/routes/api/documents/[documentId]/+server.js');
        const response = await DELETE({
            locals: { user: citizenA },
            params: { documentId: 'doc-owner' }
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({ success: true, id: 'doc-owner' });
    });

    it('prevents IDOR: denies non-owner from deleting another citizen document', async () => {
        vi.doMock('$lib/server/documents/repository', () => ({
            deleteCitizenDocument: vi.fn(async (user, docId) => {
                if (user.uid !== 'citizen-123') throw new Error('Document not found.');
                return { success: true, id: docId };
            })
        }));

        const { DELETE } = await import('../../src/routes/api/documents/[documentId]/+server.js');
        await expect(
            DELETE({
                locals: { user: citizenB },
                params: { documentId: 'doc-owner' }
            })
        ).rejects.toMatchObject({ status: 404 });
    });

    it('denies deleting application-attached documents from vault', async () => {
        vi.doMock('$lib/server/documents/repository', () => ({
            deleteCitizenDocument: vi.fn(async () => {
                throw new Error('Application-attached documents cannot be deleted from the vault.');
            })
        }));

        const { DELETE } = await import('../../src/routes/api/documents/[documentId]/+server.js');
        await expect(
            DELETE({
                locals: { user: citizenA },
                params: { documentId: 'doc-app-attached' }
            })
        ).rejects.toMatchObject({ status: 403 });
    });
});
