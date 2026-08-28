<script>

  import { tt, locale } from '$lib/i18n';
  import { Search, ArrowRight, FileText, AlertTriangle, X } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
let searchFilter = $state('');
let statusFilter = $state('all');
let deletingDraftId = $state('');
let draftToDelete = $state(null);
let deleteError = $state('');
const userApplications = $derived(data.applications);
const filteredApplications = $derived(() => {
    let list = userApplications;
    if (searchFilter) {
        const q = searchFilter.toLowerCase();
        list = list.filter(a => a.applicationNumber.toLowerCase().includes(q) ||
            a.serviceName.toLowerCase().includes(q) ||
            a.serviceNameTA.includes(searchFilter));
    }
    if (statusFilter === 'active') {
        list = list.filter(a => !['COMPLETED', 'REJECTED', 'DRAFT', 'CANCELLED'].includes(a.status));
    }
    else if (statusFilter === 'completed') {
        list = list.filter(a => a.status === 'COMPLETED');
    }
    else if (statusFilter === 'draft') {
        list = list.filter(a => a.status === 'DRAFT');
    }
    return list;
});
function getStatusBadge(status) {
    switch (status) {
        case 'COMPLETED':
        case 'APPROVED':
        case 'CERTIFICATE_GENERATED':
            return 'bg-success-soft text-success border-success/25';
        case 'REJECTED':
        case 'CANCELLED':
            return 'bg-danger-soft text-danger border-danger/25';
        case 'DRAFT':
            return 'bg-muted text-text-muted border-border';
        default:
            return 'bg-warning-soft text-warning border-warning/25';
    }
}
function requestDeleteDraft(application) {
    if (deletingDraftId)
        return;
    deleteError = '';
    draftToDelete = application;
}
async function deleteDraft() {
    if (!draftToDelete?.id || deletingDraftId)
        return;
    const applicationId = draftToDelete.id;
    if (deletingDraftId)
        return;
    deletingDraftId = applicationId;
    deleteError = '';
    try {
        const response = await fetch(`/api/applications/${applicationId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const body = await response.json().catch(() => null);
        if (!response.ok)
            throw new Error(body?.message ?? 'Unable to delete this draft.');
        window.location.reload();
    }
    catch (cause) {
        deleteError = cause instanceof Error ? cause.message : 'Unable to delete this draft.';
    }
    finally {
        deletingDraftId = '';
    }
}
</script>

<svelte:head>
  <title>{t('applications.title')} — TN Kuviyam</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col bg-background pb-12 text-text">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8">
    <div class="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">{t('applications.title')}</h1>
        <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">{t('applications.subtitle')}</p>
      </div>
    </div>
  </div>

  <!-- Content Canvas -->
  <div class="flex-1 px-4 py-7 pb-24 sm:px-6 lg:px-8 w-full">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <!-- Toolbar: Search & Filters -->
      <div class="flex flex-col items-stretch justify-between gap-4 rounded-[1.75rem] border border-border bg-surface p-5 shadow-vazhi-1 lg:flex-row lg:items-center">
        <div class="relative w-full lg:max-w-[500px]">
          <Search class="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            bind:value={searchFilter}
            placeholder="Search by ID or Service Name..."
            class="w-full rounded-2xl border border-border bg-muted py-3.5 pl-14 pr-4 text-sm font-medium text-text outline-none transition-all placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        
        <div class="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:justify-end lg:pb-0 hide-scrollbar">
          <button
            onclick={() => statusFilter = 'all'}
            class="min-w-24 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold shadow-sm transition-colors {statusFilter === 'all' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.all')}
          </button>
          <button
            onclick={() => statusFilter = 'active'}
            class="min-w-24 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold shadow-sm transition-colors {statusFilter === 'active' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.active')}
          </button>
          <button
            onclick={() => statusFilter = 'completed'}
            class="min-w-32 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold shadow-sm transition-colors {statusFilter === 'completed' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.completed')}
          </button>
          <button
            onclick={() => statusFilter = 'draft'}
            class="min-w-24 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold shadow-sm transition-colors {statusFilter === 'draft' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.draft')}
          </button>
        </div>
      </div>

      <!-- Application Table -->
      {#if filteredApplications().length === 0}
        <div class="flex flex-col items-center rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
          <FileText class="mx-auto mb-4 h-12 w-12 text-text-faint" />
          <h3 class="text-base font-bold text-text">{t('applications.empty')}</h3>
          <p class="mt-1 text-sm text-text-muted">Explore government services and submit your first application.</p>
          <a href="/services" class="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover">
            Browse Services
          </a>
        </div>
      {:else}
        <div class="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-vazhi-1">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[900px] text-left text-sm">
              <thead class="border-b border-border bg-surface-container text-[10px] font-black uppercase tracking-wider text-text-muted">
                <tr>
                  <th class="px-6 py-4">{t('applications.id')}</th>
                  <th class="px-6 py-4">{t('applications.service')}</th>
                  <th class="px-6 py-4">{t('applications.department')}</th>
                  <th class="px-6 py-4">{t('applications.status')}</th>
                  <th class="px-6 py-4">{t('applications.submitted')}</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                {#each filteredApplications() as app}
                  <tr class="transition-colors hover:bg-surface-container/70">
                    <td class="whitespace-nowrap px-6 py-5 align-middle">
                      <span class="font-mono text-xs font-black tracking-wide text-text">{app.applicationNumber}</span>
                    </td>
                    <td class="px-6 py-5 align-middle">
                      <div class="max-w-[260px]">
                        <p class="truncate text-base font-black leading-tight text-text">
                          {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                        </p>
                        {#if app.serviceSlug}
                          <p class="mt-1 truncate font-mono text-[10px] font-bold text-text-faint">{app.serviceSlug}</p>
                        {/if}
                      </div>
                    </td>
                    <td class="px-6 py-5 align-middle">
                      <span class="text-sm font-semibold text-text-muted">
                        {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-5 align-middle">
                      <span class="inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider {getStatusBadge(app.status)}">
                        {t(`status.${app.status}`)}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-5 align-middle">
                      <span class="font-mono text-xs font-bold text-text">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td class="px-6 py-5 align-middle">
                      <div class="flex justify-end gap-2">
                        {#if app.status === 'DRAFT' && app.serviceSlug}
                          <a href={`/services/${app.serviceSlug}/apply?draft=${app.id}`} class="inline-flex items-center justify-center rounded-xl border border-border bg-surface-container px-4 py-2 text-xs font-bold text-text transition-colors hover:bg-surface-container-high">
                            Edit
                          </a>
                          <a href={`/services/${app.serviceSlug}/apply?draft=${app.id}&step=5`} class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-vazhi-1 transition-colors hover:bg-primary-hover">
                            Submit
                          </a>
                          <button type="button" onclick={() => requestDeleteDraft(app)} disabled={deletingDraftId === app.id} class="inline-flex items-center justify-center rounded-xl border border-danger/30 bg-danger-soft px-4 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger-soft/80 disabled:opacity-50">
                            {deletingDraftId === app.id ? 'Deleting...' : 'Delete'}
                          </button>
                        {:else}
                          <a href="/applications/{app.id}" class="adaptive-action-button group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all">
                            {t('applications.viewDetails')}
                            <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </a>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if draftToDelete}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0 bg-background/80 backdrop-blur-sm"
      aria-label="Close delete confirmation"
      onclick={() => {
        if (!deletingDraftId) {
          draftToDelete = null;
          deleteError = '';
        }
      }}
    ></button>

    <div class="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-6 text-text shadow-vazhi-2">
      <button
        type="button"
        class="absolute right-4 top-4 rounded-full p-2 text-text-faint transition hover:bg-muted hover:text-text"
        aria-label="Close"
        disabled={Boolean(deletingDraftId)}
        onclick={() => {
          draftToDelete = null;
          deleteError = '';
        }}
      >
        <X class="h-4 w-4" />
      </button>

      <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/25 bg-danger-soft text-danger">
        <AlertTriangle class="h-6 w-6" />
      </div>

      <h2 class="text-lg font-black">Delete draft application?</h2>
      <p class="mt-2 text-sm leading-relaxed text-text-muted">
        This will permanently delete
        <strong class="text-text">{currentLocale === 'ta' ? draftToDelete.serviceNameTA : draftToDelete.serviceName}</strong>
        draft <strong class="font-mono text-text">{draftToDelete.applicationNumber}</strong> from the database.
      </p>

      {#if deleteError}
        <div class="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-xs font-bold text-danger">
          {deleteError}
        </div>
      {/if}

      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="rounded-2xl border border-border bg-muted px-5 py-3 text-sm font-bold text-text transition hover:bg-surface-container disabled:opacity-50"
          disabled={Boolean(deletingDraftId)}
          onclick={() => {
            draftToDelete = null;
            deleteError = '';
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-2xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm font-bold text-danger transition hover:bg-danger-soft/80 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(deletingDraftId)}
          onclick={deleteDraft}
        >
          {deletingDraftId ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
{/if}
