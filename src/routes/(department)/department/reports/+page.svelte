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
  const applications = $derived(data.applications);
  const metrics = $derived({
    total: applications.length,
    approved: applications.filter((application) => ['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(application.status)).length,
    slaBreached: applications.filter((application) => application.isSlaBreached).length
  });

  let timeRange = $state('30_DAYS');

  function downloadCSV() {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value,Target SLA,Status\n"
      + `Average Processing Time,2.4 Days,3.0 Days,COMPLIANT\n`
      + `SLA Compliance Rate,94.2%,95.0%,NEAR TARGET\n`
      + `Total Received,${metrics.total},N/A,ON TRACK\n`
      + `Certificates Issued,${metrics.approved},N/A,COMPLETED\n`
      + `SLA Breaches,${metrics.slaBreached},0 Breaches,REQUIRES ACTION\n`;

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
  <div class="bg-[#f7f9fb] min-h-screen pb-20 text-slate-900 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold text-slate-900 tracking-tight">{t('reports.title')}</h1>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
          {t('reports.slaOnTime')}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <select 
          bind:value={timeRange}
          class="bg-slate-100 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-[#9df79e]"
        >
          <option value="7_DAYS">Last 7 Days</option>
          <option value="30_DAYS">Last 30 Days</option>
          <option value="90_DAYS">Quarter to Date</option>
        </select>
        <button 
          onclick={downloadCSV}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#062206] text-[#9df79e] text-xs font-bold hover:bg-[#143A14] transition shadow-2xs"
        >
          <Download class="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <!-- High Level Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-bold uppercase tracking-wider">Avg Resolution Time</span>
            <Clock class="h-4 w-4 text-[#1565C0]" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">2.4 Days</div>
          <div class="text-[10px] text-[#2E7D32] font-bold mt-1">✓ 0.6 days faster than 3.0 day SLA limit</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-bold uppercase tracking-wider">SLA Compliance</span>
            <TrendingUp class="h-4 w-4 text-[#2E7D32]" />
          </div>
          <div class="text-2xl font-extrabold text-[#2E7D32] mt-2">94.2%</div>
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

      <!-- Service Volume & Breakdown Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Service Category Distribution -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h3 class="text-sm font-bold text-slate-900 mb-4">Application Volume by Service Type</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs font-bold mb-1">
                <span>Community & Caste Certificate</span>
                <span class="text-slate-600">45% (562 applications)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-[#062206] h-2.5 rounded-full" style="width: 45%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-bold mb-1">
                <span>Income Certificate</span>
                <span class="text-slate-600">32% (400 applications)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-[#1565C0] h-2.5 rounded-full" style="width: 32%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-bold mb-1">
                <span>Nativity & Residence Certificate</span>
                <span class="text-slate-600">15% (187 applications)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-[#7B1FA2] h-2.5 rounded-full" style="width: 15%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-bold mb-1">
                <span>First Graduate Certificate</span>
                <span class="text-slate-600">8% (99 applications)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-[#E65100] h-2.5 rounded-full" style="width: 8%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Processing Performance -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h3 class="text-sm font-bold text-slate-900 mb-4">Department Officer Processing Speed</h3>
          <div class="space-y-4 text-xs">
            <div class="p-3.5 rounded-lg bg-[#f2f4f6] flex items-center justify-between border border-slate-200">
              <div>
                <strong class="text-slate-900 block">Revenue Inspector (RI) Verification</strong>
                <span class="text-slate-500 text-[10px]">Field document check stage</span>
              </div>
              <span class="font-bold text-[#2E7D32]">1.1 Days Avg</span>
            </div>

            <div class="p-3.5 rounded-lg bg-[#f2f4f6] flex items-center justify-between border border-slate-200">
              <div>
                <strong class="text-slate-900 block">Tahsildar Digital Sign & Approval</strong>
                <span class="text-slate-500 text-[10px]">Final certificate issuance stage</span>
              </div>
              <span class="font-bold text-[#2E7D32]">1.3 Days Avg</span>
            </div>

            <div class="p-3.5 rounded-lg bg-[#f2f4f6] flex items-center justify-between border border-slate-200">
              <div>
                <strong class="text-slate-900 block">Citizen Resubmission Handling</strong>
                <span class="text-slate-500 text-[10px]">Re-uploaded document verification</span>
              </div>
              <span class="font-bold text-[#E65100]">1.8 Days Avg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
