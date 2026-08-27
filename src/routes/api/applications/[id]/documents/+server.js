import { error, json } from '@sveltejs/kit';
import { uploadApplicationDocument } from '$lib/server/documents/repository';
export const POST = async ({ request, locals, params }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    if (!params.id)
        throw error(400, 'Application ID is required.');
    let formData;
    try {
        formData = await request.formData();
    }
    catch {
        throw error(400, 'A multipart document upload is required.');
    }
    const file = formData.get('file');
    const documentType = formData.get('documentType');
    if (!(file instanceof File) || typeof documentType !== 'string' || !documentType.trim()) {
        throw error(400, 'A document file and type are required.');
    }
    try {
        return json({ document: await uploadApplicationDocument(locals.user, params.id, { file, documentType }) }, { status: 201 });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to upload the document.';
        throw error(message === 'Application not found.' ? 404 : 400, message);
    }
};
