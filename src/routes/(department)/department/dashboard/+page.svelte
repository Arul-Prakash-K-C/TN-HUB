<script lang="ts">
  let { data } = $props();

  import { goto } from '$app/navigation';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { tt, locale } from '$lib/i18n';
  import {
    Building2,
    Inbox,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowRight,
    Shield,
    TrendingUp,
    Download,
    Search,
    Bell,
    FileText
  } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

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

  const filteredUrgent = $derived(
    urgentApps.filter(a => 
      !searchQuery || 
      a.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-[#f7f9fb]">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-slate-900">Access Restricted</h2>
      <p class="mt-2 text-xs text-slate-500">{guard.reason || 'You are not authorized to view this department workspace.'}</p>
      <a href={guard.redirectTo || '/login'} class="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#062206] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#143A14]">
        Go to Login
      </a>
    </div>
  </div>
{:else}
  <div class="bg-[#f7f9fb] min-h-screen pb-20 text-slate-900 font-sans">
    <!-- Top Header Bar -->
    <header class="flex justify-between items-center h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold text-slate-900 tracking-tight">{user?.departmentName || 'Revenue Department'}</h1>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F2FD] text-[#1565C0] border border-[#1565C0]/20">
          Official Operations
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative hidden sm:block">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            bind:value={searchQuery}
            class="pl-9 pr-4 py-1.5 h-8 bg-slate-100 border-none rounded-lg text-xs focus:ring-2 focus:ring-[#9df79e] w-64 text-slate-900 placeholder:text-slate-400" 
            placeholder="Search applications..." 
            type="text"
          />
        </div>
        <a href="/department/notifications" class="text-slate-600 p-2 hover:bg-slate-100 rounded-lg relative transition-colors">
          <Bell class="h-4 w-4" />
          {#if metrics.slaBreached > 0}
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full"></span>
          {/if}
        </a>
        <div class="w-8 h-8 rounded-full bg-[#062206] text-[#9df79e] border border-[#143A14] flex items-center justify-center font-bold text-xs shrink-0">
          {user?.name.charAt(0)}
        </div>
      </div>
    </header>

    <!-- Main Dashboard Body Canvas -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Application Processing Dashboard</h2>
          <p class="text-xs text-slate-500 mt-0.5">Real-time overview of departmental metrics and operational queue.</p>
        </div>
        <div class="flex gap-2">
          <button 
            onclick={exportReport}
            class="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs"
          >
            <Download class="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <!-- Total -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Queue</span>
          <span class="text-2xl font-extrabold text-slate-900 mt-3">{metrics.total}</span>
          <div class="flex items-center gap-1 mt-2 text-[#2E7D32] text-[11px] font-bold">
            <TrendingUp class="h-3.5 w-3.5" />
            <span>+12% vs last wk</span>
          </div>
        </div>

        <!-- New -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New</span>
            <span class="w-2 h-2 rounded-full bg-[#1565C0]"></span>
          </div>
          <span class="text-2xl font-extrabold text-slate-900 mt-3">{metrics.newApplications}</span>
          <span class="text-[10px] text-slate-400 font-medium mt-2">Unassigned/New</span>
        </div>

        <!-- Pending -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
            <span class="w-2 h-2 rounded-full bg-[#E65100]"></span>
          </div>
          <span class="text-2xl font-extrabold text-[#E65100] mt-3">{metrics.underReview + metrics.pendingVerification}</span>
          <span class="text-[10px] text-slate-400 font-medium mt-2">Officer Action Req</span>
        </div>

        <!-- Correction -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correction</span>
            <span class="w-2 h-2 rounded-full bg-[#C2185B]"></span>
          </div>
          <span class="text-2xl font-extrabold text-[#C2185B] mt-3">{metrics.correctionRequired}</span>
          <span class="text-[10px] text-slate-400 font-medium mt-2">Returned to Citizen</span>
        </div>

        <!-- Approved -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
            <span class="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
          </div>
          <span class="text-2xl font-extrabold text-[#2E7D32] mt-3">{metrics.approved}</span>
          <span class="text-[10px] text-slate-400 font-medium mt-2">Certificates Issued</span>
        </div>

        <!-- SLA Breached -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div class="flex justify-between items-start">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SLA Risk</span>
            <span class="w-2 h-2 rounded-full bg-[#C62828]"></span>
          </div>
          <span class="text-2xl font-extrabold text-[#C62828] mt-3">{metrics.slaBreached}</span>
          <span class="text-[10px] text-rose-600 font-bold mt-2">Breached Deadline</span>
        </div>
      </div>

      <!-- SLA Alert Banner -->
      {#if metrics.slaBreached > 0}
        <div class="rounded-xl border border-rose-200 bg-[#FFEBEE] p-4 text-[#C62828] flex items-center justify-between text-xs font-semibold">
          <div class="flex items-center gap-3">
            <AlertTriangle class="h-5 w-5 text-[#C62828] shrink-0" />
            <div>
              <strong>Critical SLA Alert:</strong> {metrics.slaBreached} application(s) in {user?.departmentName || 'your department'} have breached their SLA guaranteed resolution date.
            </div>
          </div>
          <a href="/department/applications?filter=sla_breached" class="underline font-bold hover:text-rose-900 shrink-0">
            View SLA Breaches →
          </a>
        </div>
      {/if}

      <!-- Urgent Work Queue Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Urgent Processing Queue</h3>
            <p class="text-xs text-slate-500 mt-0.5">Assigned applications requiring officer review or document verification.</p>
          </div>
          <a href="/department/applications" class="text-xs font-bold text-[#062206] hover:underline">
            View All Applications ({applications.length}) →
          </a>
        </div>

        {#if filteredUrgent.length === 0}
          <div class="p-12 text-center">
            <CheckCircle2 class="mx-auto h-10 w-10 text-[#2E7D32]/40" />
            <h4 class="mt-3 text-sm font-bold text-slate-800">All Caught Up!</h4>
            <p class="mt-1 text-xs text-slate-500">There are no urgent applications currently pending officer action in this view.</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#ECEEF0] text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Application No</th>
                  <th class="py-3 px-4">Service</th>
                  <th class="py-3 px-4">Applicant</th>
                  <th class="py-3 px-4">Submitted</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {#each filteredUrgent as app}
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-800">
                      {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                    </td>
                    <td class="py-3.5 px-4 text-slate-700">
                      {app.citizenName}
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td class="py-3.5 px-4">
                      {#if app.status === 'SUBMITTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3F2FD] text-[#1565C0]">New</span>
                      {:else if app.status === 'DOCUMENT_VERIFICATION'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#E65100]">Doc Verify</span>
                      {:else if app.status === 'OFFICER_REVIEW'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E5F5] text-[#7B1FA2]">In Review</span>
                      {:else}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{app.status}</span>
                      {/if}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <a 
                        href="/department/applications/{app.id}"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#062206] text-white font-bold text-[11px] hover:bg-[#143A14] transition shadow-2xs"
                      >
                        <span>Review</span>
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
