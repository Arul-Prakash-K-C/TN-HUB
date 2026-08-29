<script>

  import { page } from '$app/stores';
  import { currentUser, isAuthenticated, userRole, isRestored } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { tt, locale } from '$lib/i18n';
  import {
    Search,
    Filter,
    Clock,
    FileText,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowRight,
    Building2,
    Shield,
    Inbox,
    RotateCcw,
    Calendar,
  } from '@lucide/svelte';
  import GlassLoader from '$lib/components/ui/GlassLoader.svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const user = $derived($currentUser);
const authenticated = $derived($isAuthenticated);
const restored = $derived($isRestored);
const guard = $derived(canAccessRoute(user, '/department/applications'));
const allDeptApps = $derived(data.applications);
let searchQuery = $state('');
let selectedStatus = $state('ALL');
// Read URL filter query parameter if present
$effect(() => {
    const urlFilter = $page.url.searchParams.get('filter');
    if (urlFilter === 'sla_breached') {
        selectedStatus = 'SLA_RISK';
    }
});
const filteredApps = $derived(allDeptApps.filter(app => {
    const matchesSearch = !searchQuery ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch)
        return false;
    if (selectedStatus === 'ALL')
        return true;
    if (selectedStatus === 'NEW')
        return app.status === 'SUBMITTED';
    if (selectedStatus === 'PENDING')
        return ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'OFFICER_REVIEW'].includes(app.status);
    if (selectedStatus === 'CORRECTION')
        return app.status === 'CLARIFICATION_REQUESTED';
    if (selectedStatus === 'APPROVED')
        return ['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(app.status);
    if (selectedStatus === 'REJECTED')
        return app.status === 'REJECTED';
    if (selectedStatus === 'SLA_RISK') {
        const daysOld = (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysOld > 3 && !['APPROVED', 'COMPLETED', 'REJECTED'].includes(app.status);
    }
    return app.status === selectedStatus;
}));
function resetFilters() {
    searchQuery = '';
    selectedStatus = 'ALL';
}
</script>

<svelte:head>
  <title>Applications Work Queue — {user?.departmentName || 'Revenue Department'}</title>
</svelte:head>

{#if !restored}
  <GlassLoader message="Verifying access..." />
{:else if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">{t('ui.routes.department.department.applications.6b7afa2e')}</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Top Green Banner Header -->
    <div class="public-banner py-6 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl flex justify-between items-center">
        <div>
          <h1 class="text-xl font-black text-white">{t('ui.routes.department.department.applications.4ad13474')}</h1>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <!-- Search and Filter Control Bar -->
      <div class="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Search input -->
          <div class="relative w-full sm:w-96">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint h-4 w-4" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder={t('ui.search.application.id.service.applicant')}
              class="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-xs text-text focus:ring-2 focus:ring-primary/20 placeholder:text-text-faint"
            />
          </div>

          <!-- Status Pill Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onclick={() => selectedStatus = 'ALL'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'ALL' ? 'bg-primary text-white' : 'bg-muted text-text-muted hover:bg-surface-container'}"
            >
              All ({allDeptApps.length})
            </button>

            <button
              onclick={() => selectedStatus = 'PENDING'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'PENDING' ? 'bg-warning-soft text-warning border border-warning/30' : 'bg-muted text-text-muted hover:bg-surface-container'}"
            >
              {t('dashboard.stats.pending')}
            </button>

            <button
              onclick={() => selectedStatus = 'CORRECTION'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'CORRECTION' ? 'bg-danger-soft text-danger border border-danger/30' : 'bg-muted text-text-muted hover:bg-surface-container'}"
            >
              {t('ui.routes.department.department.applications.5c32d4b0')}
            </button>

            <button
              onclick={() => selectedStatus = 'APPROVED'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'APPROVED' ? 'bg-success-soft text-success border border-success/30' : 'bg-muted text-text-muted hover:bg-surface-container'}"
            >
              {t('status.APPROVED')}
            </button>

            <button
              onclick={() => selectedStatus = 'SLA_RISK'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'SLA_RISK' ? 'bg-danger-soft text-danger border border-danger/30' : 'bg-muted text-text-muted hover:bg-surface-container'}"
            >
              {t('ui.routes.department.department.dashboard.3398a37c')}
            </button>
          </div>
        </div>
      </div>

      <!-- Work Queue Table or Empty State -->
      <div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {#if filteredApps.length === 0}
          <!-- Stitch Empty State UI -->
          <div class="p-16 text-center max-w-md mx-auto">
            <div class="w-16 h-16 rounded-full bg-muted text-text-muted/80 flex items-center justify-center mx-auto mb-4 border border-border">
              <Inbox class="h-8 w-8 text-text-muted/80" />
            </div>
            <h3 class="text-base font-bold text-text">{t('ui.routes.department.department.applications.dcfe79ae')}</h3>
            <p class="text-xs text-text-muted mt-1 leading-relaxed">
              {#if searchQuery || selectedStatus !== 'ALL'}
                No records match your active search filter "{searchQuery}" or status "{selectedStatus}".
              {:else}
                Your department processing queue is currently clear. Excellent job
              {/if}
            </p>
            <div class="mt-6">
              <button
                onclick={resetFilters}
                class="adaptive-action-button px-4 py-2 text-xs font-bold rounded-lg transition"
              >
                {t('ui.clear.all.filters')}
              </button>
            </div>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-container dark:bg-surface-container-high text-text-muted uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th class="py-3 px-4">{t('ui.routes.department.department.applications.31e4b15e')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.applications.d9921e93')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.applications.81f7e9cd')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.applications.2be05a32')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.applications.2f314714')}</th>
                  <th class="py-3 px-4">{t('ui.routes.department.department.applications.78911fc4')}</th>
                  <th class="py-3 px-4 text-right">{t('ui.routes.department.department.applications.967ab48d')}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border font-medium">
                {#each filteredApps as app}
                  <tr class="hover:bg-surface-container/50 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-text">
                      {app.applicationNumber}
                    </td>
                    <td class="py-3.5 px-4 text-text font-semibold">
                      {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                    </td>
                    <td class="py-3.5 px-4 text-text-muted">
                      <div>{app.citizenName}</div>
                      <div class="text-[10px] text-text-muted/80 font-mono">{app.formData?.phone || 'Aadhaar Verified'}</div>
                    </td>
                    <td class="py-3.5 px-4 text-text-muted font-mono">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td class="py-3.5 px-4 font-mono">
                      {#if app.status === 'APPROVED' || app.status === 'COMPLETED'}
                        <span class="text-success font-bold text-[10px]">{t('ui.routes.department.department.applications.5accfa63')}</span>
                      {:else}
                        <span class="text-warning font-bold text-[10px]">{t('ui.routes.department.department.applications.ce697eb6')}</span>
                      {/if}
                    </td>
                    <td class="py-3.5 px-4">
                      {#if app.status === 'SUBMITTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary-soft-text border border-primary/20">{t('ui.routes.department.department.applications.2e40220f')}</span>
                      {:else if app.status === 'DOCUMENT_VERIFICATION'}
                        {#if app.isResubmitted || app.isReady}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#316342]/10 text-[#316342] border border-[#316342]/20">{t('ui.routes.department.department.applications.34125231')}</span>
                        {:else}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-warning-soft text-warning border border-warning/25">{t('ui.routes.department.department.applications.c3fa16af')}</span>
                        {/if}
                      {:else if app.status === 'OFFICER_REVIEW'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary-soft-text border border-primary/20">{t('ui.routes.department.department.applications.0921123e')}</span>
                      {:else if app.status === 'CLARIFICATION_REQUESTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-danger-soft text-danger border border-danger/25">{t('ui.routes.department.department.applications.5c32d4b0')}</span>
                      {:else if app.status === 'APPROVED' || app.status === 'COMPLETED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-success-soft text-success border border-success/25">{t('ui.routes.department.department.applications.a8d7a99f')}</span>
                      {:else if app.status === 'REJECTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-danger-soft text-danger border border-danger/25">{t('ui.routes.department.department.applications.ee9e2f19')}</span>
                      {:else}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-text-muted border border-border">{app.status}</span>
                      {/if}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <a
                        href="/department/applications/{app.id}"
                         class="adaptive-action-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition"
                      >
                        <span>{t('ui.routes.department.department.applications.28c11ac8')}</span>
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
