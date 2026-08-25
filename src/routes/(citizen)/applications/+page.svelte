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
  <title>{t('applications.title')} — Sympho Center</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-12 flex flex-col w-full">
  <!-- Page Header (Compact & Clean like Dept Portal) -->
  <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
    <div class="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{t('applications.title')}</h1>
        <p class="text-xs font-medium text-slate-500 mt-0.5">{t('applications.subtitle')}</p>
      </div>
    </div>
  </div>

  <!-- Content Canvas -->
  <div class="flex-1 px-6 sm:px-8 py-6 pb-24 w-full">
    <div class="max-w-[1000px] mx-auto flex flex-col gap-6 w-full">
      
      <!-- Toolbar: Search & Filters -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="relative w-full lg:w-[400px]">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            bind:value={searchFilter}
            placeholder="Search by ID or Service Name..."
            class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
        
        <div class="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
          <button
            onclick={() => statusFilter = 'all'}
            class="px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm transition-colors {statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            {t('applications.filter.all')}
          </button>
          <button
            onclick={() => statusFilter = 'active'}
            class="px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm transition-colors {statusFilter === 'active' ? 'bg-primary-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            {t('applications.filter.active')}
          </button>
          <button
            onclick={() => statusFilter = 'completed'}
            class="px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm transition-colors {statusFilter === 'completed' ? 'bg-primary-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            {t('applications.filter.completed')}
          </button>
          <button
            onclick={() => statusFilter = 'draft'}
            class="px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm transition-colors {statusFilter === 'draft' ? 'bg-primary-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}"
          >
            {t('applications.filter.draft')}
          </button>
        </div>
      </div>

      <!-- Application List -->
      {#if filteredApplications().length === 0}
        <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm flex flex-col items-center">
          <FileText class="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 class="text-base font-bold text-slate-900">{t('applications.empty')}</h3>
          <p class="mt-1 text-sm text-slate-500">Explore government services and submit your first application.</p>
          <a href="/services" class="mt-6 inline-flex rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-500">
            Browse Services
          </a>
        </div>
      {:else}
        <div class="flex flex-col gap-4">
          {#each filteredApplications() as app}
            <div class="bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden group">
              
              <div class="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:pl-2">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <span class="text-slate-500 font-bold font-mono text-xs">{app.applicationNumber}</span>
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border {getStatusBadge(app.status)}">
                      {t(`status.${app.status}`)}
                    </span>
                  </div>
                  <h3 class="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">
                    {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                  </h3>
                  <p class="text-slate-500 font-medium text-sm mt-1">
                    {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName}
                  </p>
                </div>
                
                <div class="flex flex-row md:flex-col gap-6 md:gap-1 text-sm md:text-right w-full md:w-auto md:min-w-[140px]">
                  <div class="flex flex-col">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{t('applications.submitted')}</span>
                    <span class="text-slate-900 font-bold text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div class="w-full md:w-auto flex justify-end md:justify-center border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                <a href="/applications/{app.id}" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors font-bold text-sm">
                  {t('applications.viewDetails')}
                  <ArrowRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
