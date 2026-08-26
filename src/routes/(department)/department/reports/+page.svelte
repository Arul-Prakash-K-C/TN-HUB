<script lang="ts">
  let { data } = $props();

  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { t } from '$lib/i18n';
  import {
    BarChart3,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Download,
    Calendar,
    Filter,
    Shield,
    FileSpreadsheet,
    PieChart,
    Building2
  } from '@lucide/svelte';

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/department/reports'));
  const applications = $derived(data.applications || []);
  const metrics = $derived({
    total: applications.length,
    approved: applications.filter((application: any) => ['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(application.status)).length,
    slaBreached: applications.filter((application: any) => application.isSlaBreached).length
  });

  const completedApps = $derived(applications.filter((app: any) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(app.status)));
  const avgResolutionTime = $derived(() => {
    if (completedApps.length === 0) return 'N/A';
    const totalMs = completedApps.reduce((acc: number, app: any) => {
      const start = new Date(app.createdAt).getTime();
      const end = new Date(app.updatedAt || app.createdAt).getTime();
      return acc + (end - start);
    }, 0);
    const avgDays = (totalMs / (1000 * 60 * 60 * 24)) / completedApps.length;
    return `${avgDays.toFixed(1)} Days`;
  });

  const totalClosedOrBreached = $derived(applications.filter((app: any) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(app.status) || app.isSlaBreached).length);
  const slaCompliance = $derived(() => {
    if (totalClosedOrBreached === 0) return '100.0%';
    const onTime = applications.filter((app: any) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(app.status) && !app.isSlaBreached).length;
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
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-[#f7f9fb]">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-slate-900">Access Restricted</h2>
      <p class="mt-2 text-xs text-slate-500">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-slate-50 min-h-screen pb-20 text-slate-900 font-sans">
    <!-- Top Green Banner Header -->
    <div class="bg-[#316342] text-white py-6 px-6 sm:px-8 shadow-md">
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Performance Analytics
          </span>
          <div class="flex items-center gap-3 mt-2">
            <h1 class="text-xl font-black text-white leading-none">{t('reports.title')}</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
              {t('reports.slaOnTime')}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <select 
            bind:value={timeRange}
            class="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 focus:ring-2 focus:ring-white/20 focus:outline-hidden"
          >
            <option value="7_DAYS" class="text-slate-900">Last 7 Days</option>
            <option value="30_DAYS" class="text-slate-900">Last 30 Days</option>
            <option value="90_DAYS" class="text-slate-900">Quarter to Date</option>
          </select>
          <button 
            onclick={downloadCSV}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#316342] hover:bg-green-50 text-xs font-bold transition shadow-2xs"
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
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-bold uppercase tracking-wider">Avg Resolution Time</span>
            <Clock class="h-4 w-4 text-[#1565C0]" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">{avgResolutionTime()}</div>
          <div class="text-[10px] text-slate-500 font-bold mt-1">Target: 3.0 day SLA limit</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-bold uppercase tracking-wider">SLA Compliance</span>
            <TrendingUp class="h-4 w-4 text-[#2E7D32]" />
          </div>
          <div class="text-2xl font-extrabold text-[#2E7D32] mt-2">{slaCompliance()}</div>
          <div class="text-[10px] text-slate-500 font-medium mt-1">Target: 95.0% compliance threshold</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-bold uppercase tracking-wider">Certificates Issued</span>
            <CheckCircle2 class="h-4 w-4 text-[#2E7D32]" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">{metrics.approved}</div>
          <div class="text-[10px] text-slate-500 font-medium mt-1">Digital certificates generated</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-bold uppercase tracking-wider">SLA Breaches</span>
            <AlertTriangle class="h-4 w-4 text-[#C62828]" />
          </div>
          <div class="text-2xl font-extrabold text-[#C62828] mt-2">{metrics.slaBreached}</div>
          <div class="text-[10px] text-rose-600 font-bold mt-1">Overdue resolution count</div>
        </div>
      </div>


    </div>
  </div>
{/if}
