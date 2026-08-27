<script>

  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { t } from '$lib/i18n';
  import {
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Download,
    Shield
  } from '@lucide/svelte';

let { data } = $props();
const user = $derived($currentUser);
const guard = $derived(canAccessRoute(user, '/department/reports'));
const applications = $derived(data.applications || []);
const metrics = $derived({
    total: applications.length,
    approved: applications.filter((application) => ['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(application.status)).length,
    slaBreached: applications.filter((application) => application.isSlaBreached).length
});
const completedApps = $derived(applications.filter((app) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(app.status)));
const avgResolutionTime = $derived(() => {
    if (completedApps.length === 0)
        return 'N/A';
    const totalMs = completedApps.reduce((acc, app) => {
        const start = new Date(app.createdAt).getTime();
        const end = new Date(app.updatedAt || app.createdAt).getTime();
        return acc + (end - start);
    }, 0);
    const avgDays = (totalMs / (1000 * 60 * 60 * 24)) / completedApps.length;
    return `${avgDays.toFixed(1)} Days`;
});
const totalClosedOrBreached = $derived(applications.filter((app) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(app.status) || app.isSlaBreached).length);
const slaCompliance = $derived(() => {
    if (totalClosedOrBreached === 0)
        return '100.0%';
    const onTime = applications.filter((app) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(app.status) && !app.isSlaBreached).length;
    const rate = (onTime / totalClosedOrBreached) * 100;
    return `${rate.toFixed(1)}%`;
});
let timeRange = $state('30_DAYS');
function downloadCSV() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Metric,Value,Target SLA,Status\n"
        + `Average Processing Time,${avgResolutionTime()},3.0 Days,${completedApps.length > 0 ? 'COMPLIANT' : 'N/A'}\n`
        + `SLA Compliance Rate,${slaCompliance()},95.0%,${totalClosedOrBreached > 0 ? 'COMPLIANT' : 'N/A'}\n`
        + `Total Received,${metrics.total},N/A,ON TRACK\n`
        + `Certificates Issued,${metrics.approved},N/A,COMPLETED\n`
        + `SLA Breaches,${metrics.slaBreached},0 Breaches,${metrics.slaBreached > 0 ? 'REQUIRES ACTION' : 'COMPLIANT'}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user?.departmentId || 'department'}_sla_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
</script>

<svelte:head>
  <title>{t('reports.title')} — {user?.departmentName || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface dark:bg-surface-container p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">Access Restricted</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Top Banner Header -->
    <div class="public-banner py-6 px-6 sm:px-8 shadow-md">
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-black text-white leading-none">{t('reports.title')}</h1>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <select 
            bind:value={timeRange}
            class="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white outline-none transition hover:bg-white/15 focus:ring-2 focus:ring-white/20"
          >
            <option value="7_DAYS" class="text-text">Last 7 Days</option>
            <option value="30_DAYS" class="text-text">Last 30 Days</option>
            <option value="90_DAYS" class="text-text">Quarter to Date</option>
          </select>
          <button 
            onclick={downloadCSV}
            class="adaptive-action-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
          >
            <Download class="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <!-- High Level Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-surface dark:bg-surface-container border border-border rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[11px] font-bold uppercase tracking-wider">Avg Resolution Time</span>
            <Clock class="h-4 w-4 text-primary" />
          </div>
          <div class="text-2xl font-extrabold text-text mt-2">{avgResolutionTime()}</div>
          <div class="text-[10px] text-text-muted font-bold mt-1">Target: 3.0 day SLA limit</div>
        </div>

        <div class="bg-surface dark:bg-surface-container border border-border rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[11px] font-bold uppercase tracking-wider">SLA Compliance</span>
            <TrendingUp class="h-4 w-4 text-success" />
          </div>
          <div class="text-2xl font-extrabold text-success mt-2">{slaCompliance()}</div>
          <div class="text-[10px] text-text-muted font-medium mt-1">Target: 95.0% compliance threshold</div>
        </div>

        <div class="bg-surface dark:bg-surface-container border border-border rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[11px] font-bold uppercase tracking-wider">Certificates Issued</span>
            <CheckCircle2 class="h-4 w-4 text-success" />
          </div>
          <div class="text-2xl font-extrabold text-text mt-2">{metrics.approved}</div>
          <div class="text-[10px] text-text-muted font-medium mt-1">Digital certificates generated</div>
        </div>

        <div class="bg-surface dark:bg-surface-container border border-border rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[11px] font-bold uppercase tracking-wider">SLA Breaches</span>
            <AlertTriangle class="h-4 w-4 text-danger" />
          </div>
          <div class="text-2xl font-extrabold text-danger mt-2">{metrics.slaBreached}</div>
          <div class="text-[10px] text-danger font-bold mt-1">Overdue resolution count</div>
        </div>
      </div>


    </div>
  </div>
{/if}
