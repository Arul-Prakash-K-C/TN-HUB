<script lang="ts">
  import { t } from '$lib/i18n';
  import { Search, Clock, Trash2 } from '@lucide/svelte';

  let { data } = $props();

  let searchQuery = $state('');
  let statusFilter = $state('all');
  let selectedApp = $state<typeof data.applications[number] | null>(null);
  let deletingId = $state('');

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
        return 'bg-[#316342]/10 text-[#316342] border-[#316342]/20';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  async function deleteDraft(id: string) {
    const confirmed = window.confirm('Delete this assisted draft?');
    if (!confirmed) return;

    deletingId = id;
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(body?.message ?? 'Unable to delete this draft.');
      }
      window.location.reload();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Unable to delete this draft.');
    } finally {
      deletingId = '';
    }
  }
</script>

<svelte:head>
  <title>{t('operator.applications')} — TN Hub</title>
</svelte:head>

<div class="min-h-screen bg-background text-text flex flex-col w-full">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8">
    <div class="mx-auto flex max-w-6xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">{t('operator.applications')}</h1>
        <p class="mt-1 text-xs font-medium text-green-100 font-sans">{t('operator.servicesListDesc')}</p>
      </div>
      <a href="/operator/dashboard" class="inline-flex items-center justify-center rounded-xl bg-surface text-primary hover:bg-surface-container px-4 py-2.5 text-xs font-bold shadow-md transition">
        {t('operator.startService')}
      </a>
    </div>
  </div>

  <div class="flex-grow px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <!-- Search & Filter Bar -->
      <div class="mb-6 bg-surface rounded-2xl p-4 shadow-sm border border-border flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="relative w-full lg:w-[400px]">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder={t('operator.searchApplications')}
            class="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface text-xs text-text placeholder:text-text-faint transition"
          />
        </div>
        
        <div class="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
          <button
            onclick={() => statusFilter = 'all'}
            class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'all' ? 'bg-primary text-white' : 'bg-muted border border-border text-text-muted hover:bg-surface-container'}"
          >{t('common.all')}</button>
          <button
            onclick={() => statusFilter = 'active'}
            class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'active' ? 'bg-primary text-white' : 'bg-muted border border-border text-text-muted hover:bg-surface-container'}"
          >{t('operator.filter.active')}</button>
          <button
            onclick={() => statusFilter = 'completed'}
            class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'completed' ? 'bg-primary text-white' : 'bg-muted border border-border text-text-muted hover:bg-surface-container'}"
          >{t('operator.filter.completed')}</button>
          <button
            onclick={() => statusFilter = 'draft'}
            class="px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition {statusFilter === 'draft' ? 'bg-primary text-white' : 'bg-muted border border-border text-text-muted hover:bg-surface-container'}"
          >{t('operator.filter.drafts')}</button>
        </div>
      </div>

      {#if filteredApplications().length === 0}
        <div class="rounded-2xl border border-border bg-surface p-12 text-center text-sm text-text-muted">
          {t('operator.noApplicationsMatch')}
        </div>
      {:else}
        <div class="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
          <table class="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead class="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th scope="col" class="px-6 py-4">Application No</th>
                <th scope="col" class="px-6 py-4">Service</th>
                <th scope="col" class="px-6 py-4">Citizen</th>
                <th scope="col" class="px-6 py-4">Created Date</th>
                <th scope="col" class="px-6 py-4">Status</th>
                <th scope="col" class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white font-medium text-slate-700">
              {#each filteredApplications() as application}
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="whitespace-nowrap px-6 py-4">
                    <span class="inline-block rounded-lg bg-[#316342]/10 border border-[#316342]/20 px-2.5 py-0.5 font-mono text-xs font-bold text-[#316342]">
                      {application.applicationNumber}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-900">{application.serviceName}</div>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <div class="font-semibold text-slate-800">{application.citizenName}</div>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-slate-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span class="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border {getStatusBadge(application.status)}">
                      {application.status}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right font-bold">
                    <div class="flex items-center justify-end gap-2.5">
                      {#if application.status === 'DRAFT'}
                        <a 
                          href="/operator/applications/{application.id}/edit"
                          class="text-[#316342] hover:underline"
                        >
                          {t('operator.editDraft')}
                        </a>
                        <span class="text-slate-200">|</span>
                        <button
                          type="button"
                          onclick={() => deleteDraft(application.id)}
                          disabled={deletingId === application.id}
                          class="text-rose-700 hover:underline disabled:opacity-50"
                        >
                          {deletingId === application.id ? 'Deleting...' : 'Delete'}
                        </button>
                        <span class="text-slate-200">|</span>
                      {/if}
                      <button 
                        onclick={() => selectedApp = application}
                        class="text-slate-800 hover:text-[#316342] transition"
                      >
                        {t('operator.viewDetails')}
                      </button>
                    </div>
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

<!-- Application Detail Modal -->
{#if selectedApp}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span class="font-mono text-xs font-bold text-[#316342]">{selectedApp.applicationNumber}</span>
          <h2 class="text-base font-bold text-slate-900 leading-tight">{selectedApp.serviceName}</h2>
        </div>
        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border {getStatusBadge(selectedApp.status)}">
          {selectedApp.status}
        </span>
      </div>

      <div class="my-4 space-y-3 text-xs">
        <div class="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <span class="text-slate-500 block text-[9px] uppercase font-bold">{t('operator.assistedCitizen')}</span>
          <span class="font-bold text-slate-900 text-sm">{selectedApp.citizenName}</span>
        </div>

        <div class="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <span class="text-slate-500 block text-[9px] uppercase font-bold">{t('operator.workflowState')}</span>
          <span class="font-semibold text-slate-800">{selectedApp.status} ({t('operator.workflowManaged')})</span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button 
          onclick={() => selectedApp = null}
          class="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        >{t('common.close')}</button>
        {#if selectedApp.status === 'DRAFT'}
          <button
            type="button"
            onclick={() => deleteDraft(selectedApp!.id)}
            disabled={deletingId === selectedApp.id}
            class="rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
          >
            {deletingId === selectedApp.id ? 'Deleting...' : 'Delete Draft'}
          </button>
          <a href="/operator/applications/{selectedApp.id}/edit" class="inline-flex items-center justify-center rounded-xl bg-[#316342] px-4 py-2 text-xs font-bold text-white hover:bg-[#254b32] transition">
            {t('operator.resumeDraft')}
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}
