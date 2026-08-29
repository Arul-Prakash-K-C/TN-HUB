<script>

  import { tt, locale } from '$lib/i18n';
  import { isAuthenticated } from '$lib/stores/auth';
  import { ArrowLeft, Clock, FileText, IndianRupee, CheckCircle, ExternalLink, Zap, ChevronDown, ChevronUp, AlertTriangle } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const authenticated = $derived($isAuthenticated);
const service = $derived(data.catalogService);
const departmentName = $derived.by(() => {
    const department = data.catalog.departments.find((entry) => entry.id === service?.departmentId);
    return department ? (currentLocale === 'ta' ? department.nameTA : department.name) : service?.departmentId ?? '';
});
let openFaqIndex = $state(null);
function toggleFaq(index) {
    openFaqIndex = openFaqIndex === index ? null : index;
}
</script>

<svelte:head>
  <title>{service ? (currentLocale === 'ta' ? service.nameTA : service.name) : 'Service'} — TN Kuviyam</title>
</svelte:head>

{#if service}
  <div class="bg-background min-h-screen">
    <!-- Breadcrumb -->
    <div class="bg-surface border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-sm text-text-muted">
          <a href="/services" class="hover:text-primary transition flex items-center gap-1">
            <ArrowLeft class="h-4 w-4" />
            {t('nav.services')}
          </a>
          <span>/</span>
          <span class="text-text font-medium">{currentLocale === 'ta' ? service.nameTA : service.name}</span>
        </nav>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title card -->
          <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-h1 text-text">
                  {currentLocale === 'ta' ? service.nameTA : service.name}
                </h1>
                <p class="mt-1 text-sm text-text-muted">
                  {departmentName}
                </p>
              </div>
              {#if service.implementationMode === 'NATIVE_WORKFLOW'}
                <span class="inline-flex items-center gap-1 rounded-full bg-success-light px-3 py-1 text-xs font-medium text-success-dark">
                  <CheckCircle class="h-3.5 w-3.5" /> {t('services.badge.native')}
                </span>
              {:else if service.implementationMode === 'API_INTEGRATED'}
                <span class="inline-flex items-center gap-1 rounded-full bg-info-light px-3 py-1 text-xs font-medium text-info-dark">
                  <Zap class="h-3.5 w-3.5" /> {t('services.badge.api')}
                </span>
              {:else}
                <span class="inline-flex items-center gap-1 rounded-full bg-warning-light px-3 py-1 text-xs font-medium text-warning-dark">
                  <ExternalLink class="h-3.5 w-3.5" /> {t('services.badge.external')}
                </span>
              {/if}
            </div>
            <p class="text-text-secondary leading-relaxed">
              {currentLocale === 'ta' ? service.descriptionTA : service.description}
            </p>
          </div>

          <!-- Eligibility -->
          <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 class="text-h3 text-text mb-4">{t('service.eligibility')}</h2>
            <ul class="space-y-2">
              {#each (currentLocale === 'ta' ? service.eligibilityTA : service.eligibility) as item}
                <li class="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle class="h-4 w-4 text-success mt-0.5 shrink-0" />
                  {item}
                </li>
              {/each}
            </ul>
            <div class="mt-4 pt-4 border-t border-border">
              <h3 class="text-sm font-medium text-text mb-1">{t('service.whoCanApply')}</h3>
              <p class="text-sm text-text-muted">{currentLocale === 'ta' ? service.whoCanApplyTA : service.whoCanApply}</p>
            </div>
          </div>

          <!-- Required Documents -->
          {#if service.requiredDocuments.length > 0}
            <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 class="text-h3 text-text mb-4">{t('service.requiredDocs')}</h2>
              <div class="space-y-3">
                {#each service.requiredDocuments as doc}
                  <div class="flex items-center justify-between rounded-lg border border-border p-3">
                    <div class="flex items-center gap-3">
                      <FileText class="h-5 w-5 text-primary" />
                      <div>
                        <div class="text-sm font-medium text-text">{currentLocale === 'ta' ? doc.nameTA : doc.name}</div>
                        <div class="text-xs text-text-muted">{currentLocale === 'ta' ? doc.descriptionTA : doc.description}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      {#if doc.digilockerAvailable}
                        <span class="rounded-full bg-info-light px-2 py-0.5 text-[10px] font-medium text-info-dark">{t('nav.digilocker')}</span>
                      {/if}
                      <span class="rounded-full px-2 py-0.5 text-[10px] font-medium {doc.mandatory ? 'bg-error-light text-error-dark' : 'bg-surface text-text-muted'}">
                        {doc.mandatory ? t('service.mandatory') : t('service.optional')}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Steps -->
          {#if service.applicationSteps.length > 0}
            <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 class="text-h3 text-text mb-4">{t('service.steps')}</h2>
              <div class="space-y-4">
                {#each service.applicationSteps as step}
                  <div class="flex gap-4">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                      {step.step}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-text">{currentLocale === 'ta' ? step.titleTA : step.title}</div>
                      <div class="text-sm text-text-muted">{currentLocale === 'ta' ? step.descriptionTA : step.description}</div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- FAQ -->
          {#if service.faqs.length > 0}
            <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 class="text-h3 text-text mb-4">{t('service.faq')}</h2>
              <div class="space-y-2">
                {#each service.faqs as faq, i}
                  <div class="border border-border rounded-lg">
                    <button onclick={() => toggleFaq(i)} class="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-text hover:bg-background transition">
                      {currentLocale === 'ta' ? faq.questionTA : faq.question}
                      {#if openFaqIndex === i}<ChevronUp class="h-4 w-4" />{:else}<ChevronDown class="h-4 w-4" />{/if}
                    </button>
                    {#if openFaqIndex === i}
                      <div class="border-t border-border px-4 py-3 text-sm text-text-muted animate-fade-in">
                        {currentLocale === 'ta' ? faq.answerTA : faq.answer}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Quick info card -->
          <div class="rounded-xl border border-border bg-surface p-6 shadow-sm sticky top-24">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">{t('service.fees')}</span>
                <span class="text-lg font-bold text-text">{service.fee === 0 ? t('services.free') : `₹${service.fee}`}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">{t('service.processingTime')}</span>
                <span class="text-sm font-medium text-text flex items-center gap-1">
                  <Clock class="h-4 w-4" />
                  {currentLocale === 'ta' ? service.processingTimeDescriptionTA : service.processingTimeDescription}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">{t('services.docs')}</span>
                <span class="text-sm font-medium text-text">{service.requiredDocuments.filter(d => d.mandatory).length} required</span>
              </div>
            </div>

            <div class="mt-6 border-t border-border pt-6">
              {#if service.implementationMode === 'EXTERNAL_REDIRECT'}
                <!-- External redirect warning -->
                <div class="rounded-lg bg-warning-light p-4 mb-4">
                  <div class="flex items-start gap-2">
                    <AlertTriangle class="h-5 w-5 text-warning-dark shrink-0 mt-0.5" />
                    <div class="text-xs text-warning-dark leading-relaxed">
                      {t('service.externalNotice')}
                    </div>
                  </div>
                </div>
                <a
                  href={service.externalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-light"
                >
                  <ExternalLink class="h-4 w-4" />
                  {t('service.goToPortal')}
                </a>
              {:else}
                <a
                  href={authenticated ? `/services/${service.slug}/apply` : '/login'}
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-light"
                >
                  {t('service.startApplication')}
                </a>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <h1 class="text-h2 text-text">{t('ui.routes.public.services.slug.e9171145')}</h1>
      <a href="/services" class="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft class="h-4 w-4" /> {t('ui.back.to.services')}
      </a>
    </div>
  </div>
{/if}
