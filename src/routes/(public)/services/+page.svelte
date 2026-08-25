<script lang="ts">
  import { page } from '$app/stores';
  import { locale, tt } from '$lib/i18n';
  import { Search } from '@lucide/svelte';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const catalogServices = $derived(data.catalog.services);
  const catalogDepartments = $derived(data.catalog.departments);

  let searchQuery = $state('');
  let selectedCategory = $state<string>('all');
  let selectedDepartment = $state<string>('all');
  let selectedMode = $state<string>('all');

  // Read category and department from URL query params
  $effect(() => {
    const cat = $page.url.searchParams.get('category');
    if (cat) {
      selectedCategory = cat;
    } else {
      selectedCategory = 'all';
    }
    
    const dept = $page.url.searchParams.get('department');
    if (dept) {
      selectedDepartment = dept;
    } else {
      selectedDepartment = 'all';
    }
  });

  const filteredServices = $derived.by(() => {
    let result = catalogServices.filter(s => s.isActive);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.nameTA.includes(searchQuery) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory);
    }

    if (selectedDepartment !== 'all') {
      result = result.filter(s => s.departmentId === selectedDepartment);
    }

    if (selectedMode !== 'all') {
      result = result.filter(s => s.implementationMode === selectedMode);
    }

    return result;
  });

  function getCatalogDepartmentName(departmentId: string, language: 'en' | 'ta'): string {
    const department = catalogDepartments.find((entry) => entry.id === departmentId);
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
  ].filter(opt => opt.value === 'all' || catalogServices.some(s => s.category === opt.value)));
</script>

<svelte:head>
  <title>{t('services.title')} — TN Hub</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-16 flex flex-col w-full">
  <!-- Hero -->
  <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-emerald-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{t('services.title')}</h1>
      <p class="mt-3 text-base text-emerald-200/80 max-w-2xl leading-relaxed">{t('services.subtitle')}</p>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 px-6 sm:px-8 py-6 pb-24 w-full">
    <div class="max-w-7xl mx-auto w-full space-y-6">
      <!-- Search & Filters Bar -->
      <div class="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 flex flex-col md:flex-row gap-3">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            bind:value={searchQuery}
            class="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-xs outline-none placeholder:text-slate-400"
            placeholder={t('services.search')}
            type="text"
          >
        </div>
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative min-w-[160px]">
            <select
              bind:value={selectedCategory}
              class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer outline-none"
            >
              {#each categoryOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
          <div class="relative min-w-[180px]">
            <select
              bind:value={selectedDepartment}
              class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer outline-none"
            >
              <option value="all">{t('services.filter.department')}</option>
              {#each catalogDepartments.filter(d => catalogServices.some(s => s.departmentId === d.id)) as dept}
                <option value={dept.id}>{currentLocale === 'ta' ? dept.nameTA : dept.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <p class="text-xs font-bold text-slate-500">{t('services.count', {count: filteredServices.length})}</p>
      </div>

      <!-- Services Grid (Compact List Layout) -->
      {#if filteredServices.length === 0}
        <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Search class="mx-auto h-10 w-10 text-slate-300" />
          <p class="mt-3 text-xs font-medium text-slate-500">{t('services.noResults')}</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredServices as service}
            <a
              href={`/services/${service.slug}`}
              class="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all flex items-center gap-3 group"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  {#if service.fee === 0}
                    <span class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">FREE</span>
                  {:else}
                    <span class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">₹{service.fee}</span>
                  {/if}
                  <span class="text-slate-300">•</span>
                  <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider line-clamp-1">
                    {getCatalogDepartmentName(service.departmentId, currentLocale)}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {currentLocale === 'ta' ? service.nameTA : service.name}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {currentLocale === 'ta' ? service.shortDescriptionTA : service.shortDescription}
                </p>
              </div>
              
              <span class="shrink-0 bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-200 group-hover:bg-[#062206] group-hover:text-white group-hover:border-transparent transition-all">
                {#if service.implementationMode === 'EXTERNAL_REDIRECT'}
                  External
                {:else}
                  Apply
                {/if}
              </span>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
