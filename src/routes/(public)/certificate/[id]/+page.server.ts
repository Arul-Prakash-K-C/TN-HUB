import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebase';
import type { Application } from '$lib/types';
import { loadPublicServiceById } from '$lib/server/catalog/repository';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;

  try {
    const doc = await adminDb.collection('applications').doc(id).get();
    if (!doc.exists) {
      throw error(404, 'Certificate not found');
    }

    const data = doc.data();
    if (!data || !['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(data.status)) {
      throw error(404, 'Certificate not generated or application not approved');
    }

    const service = await loadPublicServiceById(data.serviceId);
    if (!service) {
      throw error(404, 'Service details not found');
    }

    return {
      application: { id: doc.id, ...data } as Application,
      service
    };
  } catch (err) {
    console.error('Error fetching certificate application:', err);
    throw error(404, 'Certificate not found');
  }
};
