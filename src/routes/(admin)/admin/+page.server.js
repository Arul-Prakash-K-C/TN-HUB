import { loadAdminCatalog } from '$lib/server/catalog/repository';
import { getFirebaseAdminFirestore } from '$lib/server/firebase/admin';
export const load = async () => {
    const catalog = await loadAdminCatalog();
    // Fetch usage stats from Firestore
    const db = getFirebaseAdminFirestore();
    let stats = {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalUsers: 0,
        citizenUsers: 0,
        operatorUsers: 0,
        officerUsers: 0,
        pendingRegistrations: 0,
        totalQuestions: 0,
        pendingQuestions: 0,
        categoryBreakdown: {},
        departmentBreakdown: {},
        statusBreakdown: {},
    };
    try {
        // Applications stats
        const appsSnapshot = await db.collection('applications').get();
        stats.totalApplications = appsSnapshot.size;
        appsSnapshot.forEach(doc => {
            const data = doc.data();
            const status = data.status || 'UNKNOWN';
            stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
            if (status === 'SUBMITTED' || status === 'DOCUMENT_VERIFICATION' || status === 'OFFICER_REVIEW') {
                stats.pendingApplications++;
            }
            else if (status === 'APPROVED' || status === 'CERTIFICATE_GENERATED' || status === 'COMPLETED') {
                stats.approvedApplications++;
            }
            else if (status === 'REJECTED') {
                stats.rejectedApplications++;
            }
            const cat = data.category || data.serviceCategory || 'unknown';
            stats.categoryBreakdown[cat] = (stats.categoryBreakdown[cat] || 0) + 1;
            const dept = data.departmentId || 'unknown';
            stats.departmentBreakdown[dept] = (stats.departmentBreakdown[dept] || 0) + 1;
        });
        // Users stats
        const usersSnapshot = await db.collection('users').get();
        stats.totalUsers = usersSnapshot.size;
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.role === 'citizen')
                stats.citizenUsers++;
            else if (data.role === 'operator')
                stats.operatorUsers++;
            else if (data.role === 'department_user')
                stats.officerUsers++;
            if (data.approved === false)
                stats.pendingRegistrations++;
        });
        // Questions stats
        const questionsSnapshot = await db.collection('user_questions').get();
        stats.totalQuestions = questionsSnapshot.size;
        questionsSnapshot.forEach(doc => {
            const data = doc.data();
            if (!data.reply)
                stats.pendingQuestions++;
        });
    }
    catch {
        // Stats are best-effort — don't block page load
    }
    return { catalog, stats };
};
