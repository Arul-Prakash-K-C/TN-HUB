<script lang="ts">
  let { data } = $props();

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

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  const restored = $derived($isRestored);

  const guard = $derived(canAccessRoute(user, '/department/applications'));
  const allDeptApps = $derived(data.applications);

  let searchQuery = $state('');
  let selectedStatus = $state<string>('ALL');

  // Read URL filter query parameter if present
  $effect(() => {
    const urlFilter = $page.url.searchParams.get('filter');
    if (urlFilter === 'sla_breached') {
      selectedStatus = 'SLA_RISK';
    }
  });

  const filteredApps = $derived(
    allDeptApps.filter(app => {
      const matchesSearch = 
        !searchQuery ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.citizenName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedStatus === 'ALL') return true;
      if (selectedStatus === 'NEW') return app.status === 'SUBMITTED';
      if (selectedStatus === 'PENDING') return ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'OFFICER_REVIEW'].includes(app.status);
      if (selectedStatus === 'CORRECTION') return app.status === 'CLARIFICATION_REQUESTED';
      if (selectedStatus === 'APPROVED') return ['APPROVED', 'COMPLETED', 'CERTIFICATE_GENERATED'].includes(app.status);
      if (selectedStatus === 'REJECTED') return app.status === 'REJECTED';
      if (selectedStatus === 'SLA_RISK') {
        const daysOld = (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysOld > 3 && !['APPROVED', 'COMPLETED', 'REJECTED'].includes(app.status);
      }

      return app.status === selectedStatus;
    })
  );

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
        <h1 class="text-base font-bold text-slate-900 tracking-tight">Applications Work Queue</h1>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#062206] text-[#9df79e]">
          {filteredApps.length} Application{filteredApps.length === 1 ? '' : 's'}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button 
          onclick={resetFilters}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
        >
          <RotateCcw class="h-3.5 w-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <!-- Search and Filter Control Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Search input -->
          <div class="relative w-full sm:w-96">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search Application ID, Service, Applicant..."
              class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-xs focus:ring-2 focus:ring-[#9df79e] text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <!-- Status Pill Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onclick={() => selectedStatus = 'ALL'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'ALL' ? 'bg-[#062206] text-[#9df79e]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              All ({allDeptApps.length})
            </button>

            <button
              onclick={() => selectedStatus = 'PENDING'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'PENDING' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#E65100]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              Pending Review
            </button>

            <button
              onclick={() => selectedStatus = 'CORRECTION'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'CORRECTION' ? 'bg-[#FCE4EC] text-[#C2185B] border border-[#C2185B]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              Correction Req
            </button>

            <button
              onclick={() => selectedStatus = 'APPROVED'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'APPROVED' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              Approved
            </button>

            <button
              onclick={() => selectedStatus = 'SLA_RISK'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {selectedStatus === 'SLA_RISK' ? 'bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              SLA Risk
            </button>
          </div>
        </div>
      </div>

      <!-- Work Queue Table or Empty State -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {#if filteredApps.length === 0}
          <!-- Stitch Empty State UI -->
          <div class="p-16 text-center max-w-md mx-auto">
            <div class="w-16 h-16 rounded-full bg-[#f2f4f6] text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Inbox class="h-8 w-8 text-slate-400" />
            </div>
            <h3 class="text-base font-bold text-slate-900">No Applications Found</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              {#if searchQuery || selectedStatus !== 'ALL'}
                No records match your active search filter "{searchQuery}" or status "{selectedStatus}".
              {:else}
                Your department processing queue is currently clear. Excellent job!
              {/if}
            </p>
            <div class="mt-6">
              <button
                onclick={resetFilters}
                class="px-4 py-2 bg-[#062206] text-white text-xs font-bold rounded-lg hover:bg-[#143A14] transition shadow-2xs"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#ECEEF0] text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Application Ref</th>
                  <th class="py-3 px-4">Service Required</th>
                  <th class="py-3 px-4">Citizen Applicant</th>
                  <th class="py-3 px-4">Submission Date</th>
                  <th class="py-3 px-4">SLA Deadline</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                {#each filteredApps as app}
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td class="py-3.5 px-4 text-slate-900 font-semibold">
                      {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                    </td>
                    <td class="py-3.5 px-4 text-slate-700">
                      <div>{app.citizenName}</div>
                      <div class="text-[10px] text-slate-400 font-mono">{app.formData?.phone || 'Aadhaar Verified'}</div>
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td class="py-3.5 px-4 font-mono">
                      {#if app.status === 'APPROVED' || app.status === 'COMPLETED'}
                        <span class="text-[#2E7D32] font-bold text-[10px]">Resolved</span>
                      {:else}
                        <span class="text-[#E65100] font-bold text-[10px]">3 Days Left</span>
                      {/if}
                    </td>
                    <td class="py-3.5 px-4">
                      {#if app.status === 'SUBMITTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3F2FD] text-[#1565C0]">New</span>
                      {:else if app.status === 'DOCUMENT_VERIFICATION'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#E65100]">Doc Verification</span>
                      {:else if app.status === 'OFFICER_REVIEW'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E5F5] text-[#7B1FA2]">Officer Review</span>
                      {:else if app.status === 'CLARIFICATION_REQUESTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FCE4EC] text-[#C2185B]">Correction Req</span>
                      {:else if app.status === 'APPROVED' || app.status === 'COMPLETED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">Approved</span>
                      {:else if app.status === 'REJECTED'}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBEE] text-[#C62828]">Rejected</span>
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
