<script lang="ts">
  import { t } from '$lib/i18n';
  import { Search, FileText, CheckCircle2, Clock, ShieldAlert, ArrowRight } from '@lucide/svelte';

  let { data } = $props();

  let searchQuery = $state('');
  let statusFilter = $state('all');
  let selectedApp = $state<typeof data.applications[number] | null>(null);

  const filteredApplications = $derived(() => {
    let list = data.applications || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(app => 
        app.applicationNumber.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        app.citizenName.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      list = list.filter(a => !['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED', 'DRAFT', 'REJECTED'].includes(a.status));
    } else if (statusFilter === 'completed') {
      list = list.filter(a => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(a.status));
    } else if (statusFilter === 'draft') {
      list = list.filter(a => a.status === 'DRAFT');
    }

    return list;
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
      case 'CERTIFICATE_GENERATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }
</script>

<svelte:head>
  <title>Assisted Applications — TN Hub</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-6xl">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900">{t('operator.assistedApplications')}</h1>
        <p class="mt-1 text-xs font-medium text-slate-500 font-sans">View, track, and filter applications processed via this kiosk portal.</p>
      </div>
      <a href="/operator/dashboard" class="inline-flex items-center justify-center rounded-xl bg-[#062206] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#143A14] shadow transition">
        Create Assisted Draft
      </a>
    </div>

    <!-- Search & Filter Bar -->
    <div class="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
      <div class="relative w-full lg:w-[400px]">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by ID, Citizen name, or service..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary-500 focus:bg-white text-xs placeholder:text-slate-400 transition"
        />
      </div>
      
      <div class="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
        <button
          onclick={() => statusFilter = 'all'}
          class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'all' ? 'bg-[#062206] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
        >
          All
        </button>
        <button
          onclick={() => statusFilter = 'active'}
          class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'active' ? 'bg-[#062206] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
        >
          Active
        </button>
        <button
          onclick={() => statusFilter = 'completed'}
          class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'completed' ? 'bg-[#062206] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
        >
          Completed
        </button>
        <button
          onclick={() => statusFilter = 'draft'}
          class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'draft' ? 'bg-[#062206] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
        >
          Drafts
        </button>
      </div>
    </div>

    {#if filteredApplications().length === 0}
      <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        No assisted applications match your filters.
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2">
        {#each filteredApplications() as application}
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#062206]">
            <div class="flex items-start justify-between gap-3">
              <div>
                <span class="inline-block rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-800">
                  {application.applicationNumber}
                </span>
                <h3 class="mt-2 text-base font-bold text-slate-900 leading-tight">{application.serviceName}</h3>
                <p class="mt-1 text-xs text-slate-500">Citizen: <span class="font-bold text-slate-800">{application.citizenName}</span></p>
              </div>
              <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border {getStatusBadge(application.status)}">
                {application.status}
              </span>
            </div>

            <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span class="flex items-center gap-1.5 font-medium text-[10px] text-slate-400 uppercase">
                <Clock class="h-3.5 w-3.5 text-slate-400" />
                Created: {new Date(application.createdAt).toLocaleDateString()}
              </span>
              <div class="flex items-center gap-2.5">
                {#if application.status === 'DRAFT'}
                  <a 
                    href="/operator/applications/{application.id}/edit"
                    class="font-bold text-[#062206] hover:underline"
                  >
                    Edit Draft
                  </a>
                  <span class="text-slate-300">|</span>
                {/if}
                <button 
                  onclick={() => selectedApp = application}
                  class="font-bold text-slate-800 hover:text-primary-700 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Assisted Application Detail Modal -->
{#if selectedApp}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="font-mono text-xs font-bold text-emerald-800">{selectedApp.applicationNumber}</span>
          <h2 class="text-base font-bold text-slate-900 leading-tight">{selectedApp.serviceName}</h2>
        </div>
        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border {getStatusBadge(selectedApp.status)}">
          {selectedApp.status}
        </span>
      </div>

      <div class="my-4 space-y-3 text-xs">
        <div class="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <span class="text-slate-500 block text-[9px] uppercase font-bold">Assisted Citizen</span>
          <span class="font-bold text-slate-900 text-sm">{selectedApp.citizenName}</span>
        </div>

        <div class="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <span class="text-slate-500 block text-[9px] uppercase font-bold">Workflow State</span>
          <span class="font-semibold text-slate-800">{selectedApp.status} (Managed via TN Hub Workflow Engine)</span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button 
          onclick={() => selectedApp = null}
          class="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >
          Close
        </button>
        {#if selectedApp.status === 'DRAFT'}
          <a
            href="/operator/applications/{selectedApp.id}/edit"
            class="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 transition"
          >
            Resume / Edit Draft
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}
