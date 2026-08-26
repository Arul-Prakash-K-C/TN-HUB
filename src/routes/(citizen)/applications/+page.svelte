<script lang="ts">
  let { data } = $props();

  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { Search, Filter, Clock, ArrowRight, FileText, CheckCircle, AlertCircle, XCircle } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);

  let searchFilter = $state('');
  let statusFilter = $state('all');
  let deletingDraftId = $state('');

  const userApplications = $derived(data.applications);

  const filteredApplications = $derived(() => {
    let list = userApplications;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      list = list.filter(a =>
        a.applicationNumber.toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q) ||
        a.serviceNameTA.includes(searchFilter)
      );
    }

    if (statusFilter === 'active') {
      list = list.filter(a => !['COMPLETED', 'REJECTED', 'DRAFT', 'CANCELLED'].includes(a.status));
    } else if (statusFilter === 'completed') {
      list = list.filter(a => a.status === 'COMPLETED');
    } else if (statusFilter === 'draft') {
      list = list.filter(a => a.status === 'DRAFT');
    }

    return list;
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-[#316342]/10 text-[#316342] border-[#316342]/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'DRAFT':
        return 'bg-white/8 text-text-muted border-border';
      default:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    }
  }

  async function deleteDraft(applicationId: string) {
    if (deletingDraftId) return;
    const confirmed = window.confirm('Delete this draft application?');
    if (!confirmed) return;

    deletingDraftId = applicationId;
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(body?.message ?? 'Unable to delete this draft.');
      window.location.reload();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Unable to delete this draft.');
    } finally {
      deletingDraftId = '';
    }
  }
</script>

<svelte:head>
  <title>{t('applications.title')} — TN Hub</title>
</svelte:head>

<div class="flex min-h-screen w-full flex-col bg-background pb-12 text-text">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 shadow-md sm:px-8">
    <div class="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">{t('applications.title')}</h1>
        <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">{t('applications.subtitle')}</p>
      </div>
    </div>
  </div>

  <!-- Content Canvas -->
  <div class="flex-1 px-6 sm:px-8 py-6 pb-24 w-full">
    <div class="max-w-[1000px] mx-auto flex flex-col gap-6 w-full">
      
      <!-- Toolbar: Search & Filters -->
      <div class="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:flex-row">
        <div class="relative w-full lg:w-[400px]">
          <Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            bind:value={searchFilter}
            placeholder="Search by ID or Service Name..."
            class="w-full rounded-xl border border-border bg-muted py-3 pl-12 pr-4 text-sm text-text outline-none transition-all placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        
        <div class="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
          <button
            onclick={() => statusFilter = 'all'}
            class="whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-colors {statusFilter === 'all' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.all')}
          </button>
          <button
            onclick={() => statusFilter = 'active'}
            class="whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-colors {statusFilter === 'active' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.active')}
          </button>
          <button
            onclick={() => statusFilter = 'completed'}
            class="whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-colors {statusFilter === 'completed' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.completed')}
          </button>
          <button
            onclick={() => statusFilter = 'draft'}
            class="whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-colors {statusFilter === 'draft' ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-border bg-muted text-text-muted hover:bg-surface-container'}"
          >
            {t('applications.filter.draft')}
          </button>
        </div>
      </div>

      <!-- Application List -->
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
        <div class="flex flex-col gap-4">
          {#each filteredApplications() as app}
            <div class="group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary/30 hover:bg-surface-container md:flex-row md:items-center">
              
              <div class="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:pl-2">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <span class="font-mono text-xs font-bold text-text-muted">{app.applicationNumber}</span>
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border {getStatusBadge(app.status)}">
                      {t(`status.${app.status}`)}
                    </span>
                  </div>
                  <h3 class="text-lg font-bold leading-tight text-text transition-colors group-hover:text-primary">
                    {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                  </h3>
                  <p class="mt-1 text-sm font-medium text-text-muted">
                    {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName}
                  </p>
                </div>
                
                <div class="flex flex-row md:flex-col gap-6 md:gap-1 text-sm md:text-right w-full md:w-auto md:min-w-[140px]">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-text-faint">{t('applications.submitted')}</span>
                    <span class="text-xs font-bold text-text">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div class="flex w-full flex-wrap justify-end gap-2 border-t border-border pt-4 md:w-auto md:justify-center md:border-t-0 md:pt-0">
                {#if app.status === 'DRAFT' && app.serviceSlug}
                  <a href={`/services/${app.serviceSlug}/apply?draft=${app.id}`} class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-container px-4 py-2.5 text-sm font-bold text-text transition-colors hover:bg-surface-container-high">
                    Edit
                  </a>
                  <a href={`/services/${app.serviceSlug}/apply?draft=${app.id}&step=5`} class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover">
                    Pay & Submit
                  </a>
                  <button type="button" onclick={() => deleteDraft(app.id)} disabled={deletingDraftId === app.id} class="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50">
                    {deletingDraftId === app.id ? 'Deleting...' : 'Delete'}
                  </button>
                {:else}
                  <a href="/applications/{app.id}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-soft dark:bg-primary-soft px-5 py-2.5 text-sm font-bold text-primary dark:text-primary-soft-text transition-colors hover:bg-primary/20 dark:hover:bg-primary/20">
                    {t('applications.viewDetails')}
                    <ArrowRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

