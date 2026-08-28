<script>

  import { page } from '$app/stores';
  import { locale, tt } from '$lib/i18n';
  import { Search } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const catalogServices = $derived(data.catalog.services);
const catalogDepartments = $derived(data.catalog.departments);
let searchQuery = $state('');
let selectedCategory = $state('all');
let selectedDepartment = $state('all');
let selectedMode = $state('all');
// Read category and department from URL query params
$effect(() => {
    const cat = $page.url.searchParams.get('category');
    if (cat) {
        selectedCategory = cat;
    }
    else {
        selectedCategory = 'all';
    }
    const dept = $page.url.searchParams.get('department');
    if (dept) {
        selectedDepartment = dept;
    }
    else {
        selectedDepartment = 'all';
    }
});
const filteredServices = $derived.by(() => {
    let result = catalogServices.filter(s => s.isActive);
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(q) ||
            s.nameTA.includes(searchQuery) ||
            s.shortDescription.toLowerCase().includes(q) ||
            s.category.includes(q));
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
function getCatalogDepartmentName(departmentId, language) {
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
  <title>{t('services.title')} — TN Kuviyam</title>
</svelte:head>

<div class="bg-background min-h-screen pb-16 flex flex-col w-full font-sans text-text">
  <!-- Hero Banner -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-bold tracking-tight leading-tight">{t('services.title')}</h1>
      <p class="public-banner-subtitle mt-2 max-w-2xl text-sm leading-relaxed">{t('services.subtitle')}</p>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 w-full">
    <div class="max-w-7xl mx-auto w-full space-y-6">
      <!-- Search & Filters Bar -->
      <div class="bg-surface rounded-2xl p-3.5 shadow-xs border border-border flex flex-col md:flex-row gap-3">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
          <input
            bind:value={searchQuery}
            class="w-full pl-10 pr-3.5 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-xs outline-none placeholder:text-text-faint"
            placeholder={t('services.search')}
            type="text"
          >
        </div>
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative min-w-[160px]">
            <select
              bind:value={selectedCategory}
              onchange={() => { if (selectedCategory !== 'all') { selectedDepartment = 'all'; selectedMode = 'all'; } }}
              class="w-full appearance-none bg-muted border border-border rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer outline-none {selectedCategory !== 'all' ? 'ring-2 ring-primary border-primary bg-primary-soft' : ''}"
            >
              {#each categoryOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
          <div class="relative min-w-[180px]">
            <select
              bind:value={selectedDepartment}
              onchange={() => { if (selectedDepartment !== 'all') { selectedCategory = 'all'; selectedMode = 'all'; } }}
              class="w-full appearance-none bg-muted border border-border rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer outline-none {selectedDepartment !== 'all' ? 'ring-2 ring-primary border-primary bg-primary-soft' : ''}"
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
              class="bg-surface rounded-xl p-4 border border-border hover:border-primary/50 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
            >
              <div class="flex-grow min-w-0">
                <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  {#if service.fee === 0}
                    <span class="text-[9px] text-primary font-extrabold uppercase tracking-wider shrink-0">FREE</span>
                  {:else}
                    <span class="text-[9px] text-text-muted font-extrabold uppercase tracking-wider shrink-0">₹{service.fee}</span>
                  {/if}
                  <span class="text-border-strong text-[10px] shrink-0">•</span>
                  <span class="text-[9px] text-text-muted font-extrabold uppercase tracking-wider truncate">
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
                  <span class="inline-flex bg-muted text-text font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-surface-container transition-colors">
                    External
                  </span>
                {:else}
                  <span class="inline-flex bg-primary-soft text-primary font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-primary-soft transition-colors">
                    Apply
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

