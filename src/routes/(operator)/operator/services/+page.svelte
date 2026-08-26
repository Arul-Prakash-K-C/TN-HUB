<script lang="ts">
  import { page } from '$app/stores';
  import { locale, tt } from '$lib/i18n';
  import { Search, ExternalLink, ArrowRight, Grid } from '@lucide/svelte';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const catalogServices = $derived(data.catalog.services);
  const catalogDepartments = $derived(data.catalog.departments);

  let searchQuery = $state('');
  let selectedCategory = $state<string>('all');
  let selectedDepartment = $state<string>('all');

  const filteredServices = $derived.by(() => {
    let result = catalogServices.filter((s: any) => s.isActive);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s: any) =>
        s.name.toLowerCase().includes(q) ||
        s.nameTA.includes(searchQuery) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((s: any) => s.category === selectedCategory);
    }

    if (selectedDepartment !== 'all') {
      result = result.filter((s: any) => s.departmentId === selectedDepartment);
    }

    return result;
  });

  function getCatalogDepartmentName(departmentId: string, language: 'en' | 'ta'): string {
    const department = catalogDepartments.find((entry: any) => entry.id === departmentId);
    return department ? (language === 'ta' ? department.nameTA : department.name) : departmentId;
  }

  const categoryOptions = $derived([
    { value: 'all', label: t('services.filter.all') },
    { value: 'revenue', label: currentLocale === 'ta' ? 'வருவாய்' : 'Revenue' },
    { value: 'civil_supplies', label: currentLocale === 'ta' ? 'குடிமைப் பொருள் வழங்கல்' : 'Civil Supplies' },
    { value: 'social_welfare', label: currentLocale === 'ta' ? 'சமூக நலன்' : 'Social Welfare' },
    { value: 'local_government', label: currentLocale === 'ta' ? 'உள்ளாட்சி' : 'Local Government' },
    { value: 'health', label: currentLocale === 'ta' ? 'சுகாதாரம்' : 'Health' },
    { value: 'licences', label: currentLocale === 'ta' ? 'உரிமங்கள்' : 'Licences' }
  ].filter(opt => opt.value === 'all' || catalogServices.some((s: any) => s.category === opt.value)));
</script>

<svelte:head>
  <title>{t('operator.serviceCatalog')} — TN Hub</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-16 flex flex-col w-full font-sans">
  <!-- Hero Banner -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-white/10 rounded-xl">
          <Grid class="h-5 w-5" />
        </div>
        <div class="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          {t('operator.desk')}
        </div>
      </div>
      <h1 class="text-2xl font-black tracking-tight leading-tight">{t('operator.serviceCatalog')}</h1>
      <p class="public-banner-subtitle mt-1.5 max-w-2xl text-sm leading-relaxed">{t('operator.serviceCatalogDesc')}</p>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 w-full">
    <div class="max-w-7xl mx-auto w-full space-y-6">
      <!-- Search & Filters Bar -->
      <div class="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-sm md:flex-row">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
          <input
            bind:value={searchQuery}
            class="w-full rounded-xl border border-border bg-muted pl-10 pr-3.5 py-2.5 text-xs text-text outline-none transition-all placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder={t('services.search')}
            type="text"
          >
        </div>
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative min-w-[160px]">
            <select
              bind:value={selectedCategory}
              onchange={() => { if (selectedCategory !== 'all') { selectedDepartment = 'all'; } }}
              class="w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted py-2.5 pl-3.5 pr-8 text-xs font-medium text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 {selectedCategory !== 'all' ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : ''}"
            >
              {#each categoryOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
          <div class="relative min-w-[180px]">
            <select
              bind:value={selectedDepartment}
              onchange={() => { if (selectedDepartment !== 'all') { selectedCategory = 'all'; } }}
              class="w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted py-2.5 pl-3.5 pr-8 text-xs font-medium text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 {selectedDepartment !== 'all' ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : ''}"
            >
              <option value="all">{t('services.filter.department')}</option>
              {#each catalogDepartments.filter((d: any) => catalogServices.some((s: any) => s.departmentId === d.id)) as dept}
                <option value={dept.id}>{currentLocale === 'ta' ? dept.nameTA : dept.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <p class="text-xs font-semibold text-text-muted">{t('services.count', {count: filteredServices.length})}</p>
      </div>

      <!-- Services Grid -->
      {#if filteredServices.length === 0}
        <div class="rounded-2xl border border-border bg-surface p-12 text-center">
          <Search class="mx-auto h-10 w-10 text-text-faint" />
          <p class="mt-3 text-xs font-medium text-text-muted">{t('services.noResults')}</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredServices as service}
            <a
              href={`/services/${service.slug}`}
              class="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-primary-soft/20 hover:shadow-sm"
            >
              <div class="flex-grow min-w-0">
                <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  {#if service.fee === 0}
                    <span class="text-[9px] text-[#4a7c59] font-extrabold uppercase tracking-wider shrink-0">FREE</span>
                  {:else}
                    <span class="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider shrink-0">₹{service.fee}</span>
                  {/if}
                  <span class="text-slate-300 text-[10px] shrink-0">•</span>
                  <span class="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider truncate">
                    {getCatalogDepartmentName(service.departmentId, currentLocale).toUpperCase()}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-text group-hover:text-primary transition-colors truncate">
                  {currentLocale === 'ta' ? service.nameTA : service.name}
                </h3>
                <p class="text-xs text-text-muted mt-0.5 truncate">
                  {currentLocale === 'ta' ? service.shortDescriptionTA : service.shortDescription}
                </p>
              </div>
              
              <div class="shrink-0">
                {#if service.implementationMode === 'EXTERNAL_REDIRECT'}
                  <span class="inline-flex items-center gap-1 rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:bg-surface-container transition-colors">
                    <ExternalLink class="h-3 w-3" /> External
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                    <ArrowRight class="h-3 w-3" /> Apply
                  </span>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
