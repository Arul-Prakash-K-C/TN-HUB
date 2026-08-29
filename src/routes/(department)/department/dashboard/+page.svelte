<script>

  import { currentUser, isRestored } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { locale } from '$lib/i18n';
  import {
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Shield,
    TrendingUp,
    Download
  } from '@lucide/svelte';

let { data } = $props();
const currentLocale = $derived($locale);
const user = $derived($currentUser);
const restored = $derived($isRestored);
const guard = $derived(canAccessRoute(user, '/department/dashboard'));
const applications = $derived(data.applications);
const metrics = $derived({
    total: applications.length,
    newApplications: applications.filter((application) => application.status === 'SUBMITTED').length,
    pendingVerification: applications.filter((application) => application.status === 'DOCUMENT_VERIFICATION').length,
    underReview: applications.filter((application) => ['OFFICER_REVIEW', 'FIELD_VERIFICATION'].includes(application.status)).length,
    correctionRequired: applications.filter((application) => application.status === 'CLARIFICATION_REQUESTED').length,
    approved: applications.filter((application) => ['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(application.status)).length,
    rejected: applications.filter((application) => application.status === 'REJECTED').length,
    slaBreached: applications.filter((application) => application.isSlaBreached).length
});
const urgentApps = $derived(applications.filter(a => ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'OFFICER_REVIEW'].includes(a.status)));
let searchQuery = $state('');
const filteredUrgent = $derived(urgentApps.filter(a => !searchQuery ||
    a.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.serviceName.toLowerCase().includes(searchQuery.toLowerCase())));
function exportReport() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Application Number,Service Name,Citizen,Status,Submitted Date\n"
        + applications.map(e => `"${e.applicationNumber}","${e.serviceName}","${e.citizenName}","${e.status}","${e.createdAt}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user?.departmentId || 'department'}_summary_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
</script>

<svelte:head>
  <title>{user?.departmentName || 'Revenue Department'} — Application Processing Dashboard</title>
</svelte:head>

{#if !restored}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
{:else if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">{t('ui.routes.department.department.dashboard.f20903f6')}</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || 'You are not authorized to view this department workspace.'}</p>
      <a href={guard.redirectTo || '/login'} class="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-sm hover:bg-primary-hover">
        {t('common.goToLogin')}
      </a>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Top Green Banner Header -->
    <div class="public-banner py-6 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl flex justify-between items-center">
        <div>
          <h1 class="text-xl font-black text-white">{user?.departmentName || 'Revenue Department'}</h1>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Body Canvas -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-2">
        <div>
          <h2 class="text-xl font-bold text-text tracking-tight">{t('ui.routes.department.department.dashboard.6f89f6e2')}</h2>
          <p class="text-xs text-text-muted mt-0.5">{t('ui.routes.department.department.dashboard.c01ccff2')}</p>
        </div>
        <div class="flex gap-2">
          <button 
            onclick={exportReport}
            class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold text-text transition-colors shadow-sm hover:bg-surface-container"
          >
            <Download class="h-3.5 w-3.5" />
            <span>{t('ui.routes.department.department.dashboard.312107a1')}</span>
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <!-- Total -->
        <div class="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('ui.routes.department.department.dashboard.b23e748b')}</span>
          <span class="text-2xl font-extrabold text-text mt-3">{metrics.total}</span>
          <div class="flex items-center gap-1 mt-2 text-primary text-[11px] font-bold">
            <TrendingUp class="h-3.5 w-3.5" />
            <span>{t('ui.routes.department.department.dashboard.68a8d6f5')}</span>
          </div>
        </div>

        <!-- New -->
        <div class="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('ui.routes.department.department.dashboard.2f0d7285')}</span>
            <span class="w-2 h-2 rounded-full bg-primary"></span>
          </div>
          <span class="text-2xl font-extrabold text-text mt-3">{metrics.newApplications}</span>
          <span class="text-[10px] text-text-faint font-medium mt-2">{t('ui.routes.department.department.dashboard.6d14dec6')}</span>
        </div>

        <!-- Pending -->
        <div class="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('ui.routes.department.department.dashboard.b4af13ca')}</span>
            <span class="w-2 h-2 rounded-full bg-warning"></span>
          </div>
          <span class="text-2xl font-extrabold text-warning mt-3">{metrics.underReview + metrics.pendingVerification}</span>
          <span class="text-[10px] text-text-faint font-medium mt-2">{t('ui.routes.department.department.dashboard.c7765a8c')}</span>
        </div>

        <!-- Correction -->
        <div class="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('ui.routes.department.department.dashboard.840022e8')}</span>
            <span class="w-2 h-2 rounded-full bg-danger"></span>
          </div>
          <span class="text-2xl font-extrabold text-danger mt-3">{metrics.correctionRequired}</span>
          <span class="text-[10px] text-text-faint font-medium mt-2">{t('ui.routes.department.department.dashboard.a8c51480')}</span>
        </div>

        <!-- Approved -->
        <div class="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('ui.routes.department.department.dashboard.14bf7695')}</span>
            <span class="w-2 h-2 rounded-full bg-success"></span>
          </div>
          <span class="text-2xl font-extrabold text-success mt-3">{metrics.approved}</span>
          <span class="text-[10px] text-text-faint font-medium mt-2">{t('ui.routes.department.department.dashboard.f7abf2d0')}</span>
        </div>

        <!-- SLA Breached -->
        <div class="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">{t('ui.routes.department.department.dashboard.3398a37c')}</span>
            <span class="w-2 h-2 rounded-full bg-danger"></span>
          </div>
          <span class="text-2xl font-extrabold text-danger mt-3">{metrics.slaBreached}</span>
          <span class="text-[10px] text-danger font-bold mt-2">{t('ui.routes.department.department.dashboard.b8118798')}</span>
        </div>
      </div>

      <!-- SLA Alert Banner -->
      {#if metrics.slaBreached > 0}
        <div class="rounded-xl border border-danger/30 bg-danger-soft p-4 text-danger flex items-center justify-between text-xs font-semibold">
          <div class="flex items-center gap-3">
            <AlertTriangle class="h-5 w-5 text-danger shrink-0" />
            <div>
              <strong>{t('ui.routes.department.department.dashboard.7cbffc3d')}</strong> {metrics.slaBreached} application(s) in {user?.departmentName || 'your department'} have breached their SLA guaranteed resolution date.
            </div>
          </div>
          <a href="/department/applications?filter=sla_breached" class="underline font-bold hover:text-danger shrink-0">
            {t('ui.view.sla.breaches')}
          </a>
        </div>
      {/if}

      <!-- Urgent Work Queue Table -->
      <div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-text">{t('ui.routes.department.department.dashboard.bc875705')}</h3>
            <p class="text-xs text-text-muted mt-0.5">{t('ui.routes.department.department.dashboard.d8a858aa')}</p>
          </div>
          <a href="/department/applications" class="text-xs font-bold text-primary hover:underline">
            View All Applications ({applications.length}) →
          </a>
        </div>

        {#if filteredUrgent.length === 0}
          <div class="p-12 text-center">
            <CheckCircle2 class="mx-auto h-10 w-10 text-success/60" />
            <h4 class="mt-3 text-sm font-bold text-text">{t('ui.routes.department.department.dashboard.20a9a45c')}</h4>
            <p class="mt-1 text-xs text-text-muted">{t('ui.routes.department.department.dashboard.7683a990')}</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-container text-text-muted uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th class="py-3 px-4">{t('ui.routes.department.department.dashboard.e07e1237')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.dashboard.2b09438f')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.dashboard.0910f711')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.dashboard.9378965a')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.dashboard.da459b77')}</th>
                  <th class="py-3 px-4 text-right">{t('ui.routes.department.department.dashboard.b37b0c34')}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#each filteredUrgent as app}
                  <tr class="hover:bg-surface-container/70 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-text">
                      {app.applicationNumber}
                    </td>
                    <td class="py-3.5 px-4 font-medium text-text">
                      {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                    </td>
                    <td class="py-3.5 px-4 text-text-muted">
                      {app.citizenName}
                    </td>
                    <td class="py-3.5 px-4 text-text-muted font-mono">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td class="py-3.5 px-4">
                      {#if app.status === 'SUBMITTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary-soft-text border border-primary/20">{t('ui.routes.department.department.dashboard.2f0d7285')}</span>
                      {:else if app.status === 'DOCUMENT_VERIFICATION'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-warning-soft text-warning border border-warning/25">{t('ui.routes.department.department.dashboard.ff9612e6')}</span>
                      {:else if app.status === 'OFFICER_REVIEW'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary-soft-text border border-primary/20">{t('ui.routes.department.department.dashboard.0a363edc')}</span>
                      {:else}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-text-muted border border-border">{app.status}</span>
                      {/if}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <a 
                        href="/department/applications/{app.id}"
                        class="adaptive-action-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition"
                      >
                        <span>{t('ui.routes.department.department.dashboard.12adf1b1')}</span>
                        <ArrowRight class="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
