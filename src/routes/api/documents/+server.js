import { error, json } from '@sveltejs/kit';
import { uploadCitizenDocument } from '$lib/server/documents/repository';
export const POST = async ({ request, locals }) => {
    if (!locals.user)
        throw error(401, 'Authentication required.');
    let formData;
    try {
        formData = await request.formData();
    }
    catch {
        throw error(400, 'A multipart document upload is required.');
    }
    const file = formData.get('file');
    const documentType = formData.get('documentType');
    if (!(file instanceof File) || typeof documentType !== 'string')
        throw error(400, 'A document file is required.');
    try {
        return json({ document: await uploadCitizenDocument(locals.user, { file, documentType }) }, { status: 201 });
    }
    catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Unable to upload the document.';
        throw error(400, message);
    }
};
