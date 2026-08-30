<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { currentUser, isAuthenticated, isRestored } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { Shield, UserCheck, PlusCircle, Search, FileText, CheckCircle2, Clock, Eye, AlertTriangle } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const user = $derived($currentUser);
const restored = $derived($isRestored);
const guard = $derived(canAccessRoute(user, '/operator/dashboard'));
const applications = $derived(data.applications || []);
const stats = $derived({
    total: applications.length,
    completed: applications.filter((a) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(a.status)).length,
    drafts: applications.filter((a) => a.status === 'DRAFT').length,
    pending: applications.filter((a) => !['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED', 'DRAFT', 'REJECTED'].includes(a.status)).length
});
const popularServices = $derived(data.catalog.services
    .filter((service) => service.implementationMode === 'NATIVE_WORKFLOW')
    .slice(0, 4));
</script>

<svelte:head>
  <title>{t('operator.kioskPortal')} — TN Kuviyam</title>
</svelte:head>

{#if !restored}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
{:else if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">{t('auth.accessRestricted')}</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || t('operator.accessOnly')}</p>
      <a href={guard.redirectTo || '/login'} class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow hover:bg-primary-hover transition">
        {t('operator.login')}
      </a>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-16 text-text">
    <!-- Operator Green Hero Section -->
    <div class="public-banner px-6 py-8 sm:px-8">
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black mt-2">{t('operator.servicesTitle')}</h1>
          <p class="public-banner-subtitle mt-1 text-xs">{t('operator.servicesSubtitle')}</p>
        </div>

        <div class="text-right">
          <div class="public-banner-subtitle font-mono text-xs font-bold">{t('operator.identityVerified')}</div>
          <div class="text-[11px] text-white font-semibold">{user?.name}</div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      <!-- Operator Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[10px] font-bold uppercase tracking-wider">{t('operator.stats.total')}</span>
            <FileText class="h-4 w-4 text-primary" />
          </div>
          <div class="text-2xl font-extrabold text-text mt-2">{stats.total}</div>
          <div class="text-[10px] text-text-faint font-semibold mt-1">{t('operator.stats.registered')}</div>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[10px] font-bold uppercase tracking-wider">{t('operator.stats.completed')}</span>
            <CheckCircle2 class="h-4 w-4 text-primary" />
          </div>
          <div class="text-2xl font-extrabold text-primary mt-2">{stats.completed}</div>
          <div class="text-[10px] text-text-faint font-semibold mt-1">{t('operator.stats.certificates')}</div>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[10px] font-bold uppercase tracking-wider">{t('operator.stats.drafts')}</span>
            <Clock class="h-4 w-4 text-amber-600" />
          </div>
          <div class="text-2xl font-extrabold text-amber-700 mt-2">{stats.drafts}</div>
          <div class="text-[10px] text-text-faint font-semibold mt-1">{t('operator.stats.pendingSubmission')}</div>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-text-muted">
            <span class="text-[10px] font-bold uppercase tracking-wider">{t('operator.stats.review')}</span>
            <AlertTriangle class="h-4 w-4 text-primary" />
          </div>
          <div class="text-2xl font-extrabold text-text mt-2">{stats.pending}</div>
          <div class="text-[10px] text-text-faint font-semibold mt-1">{t('operator.stats.officialVerification')}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 Cols: Launcher -->
        <div class="lg:col-span-2 space-y-6">
          <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 class="text-base font-bold text-text">{t('ui.routes.operator.operator.dashboard.027aa3ba')}</h2>
                <p class="text-xs text-text-muted">{t('ui.routes.operator.operator.dashboard.e9e655ef')}</p>
              </div>

              <a 
                href="/services" 
                class="text-xs font-bold text-primary hover:text-primary-hover transition underline"
              >
                {t('ui.browse.all.services')}
              </a>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              {#each popularServices as svc}
                <a
                  href={`/services/${svc.slug}`}
                  class="rounded-2xl border border-border bg-muted/60 p-4 flex flex-col justify-between hover:border-primary/30 hover:bg-primary-soft/40 transition-all group block"
                >
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-text-faint">{svc.departmentId.replace('dept-', '')}</span>
                      <span class="text-[11px] font-bold text-[#316342]">₹{svc.fee}</span>
                    </div>
                    <h3 class="text-sm font-bold text-text group-hover:text-primary mt-1 transition-colors">{currentLocale === 'ta' ? svc.nameTA : svc.name}</h3>
                    <p class="text-xs text-text-muted mt-1 line-clamp-2">{currentLocale === 'ta' ? (svc.descriptionTA || svc.shortDescriptionTA) : svc.description}</p>
                  </div>

                  <div
                    class="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm group-hover:bg-primary-hover transition-all"
                  >
                    <PlusCircle class="h-3.5 w-3.5" />
                    <span>{t('operator.startService')}</span>
                  </div>
                </a>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right Col: Recent Applications -->
        <div class="space-y-6">
          <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 class="text-base font-bold text-text mb-4">{t('operator.activities.recent')}</h2>
            
            {#if applications.length === 0}
              <p class="text-xs text-text-muted text-center py-6">{t('operator.activities.empty')}</p>
            {:else}
              <div class="space-y-3.5">
                {#each applications.slice(0, 5) as app}
                  <div class="p-3 bg-muted rounded-xl border border-border flex justify-between items-start gap-2 text-xs">
                    <div>
                      <span class="font-mono font-bold text-primary">{app.applicationNumber}</span>
                      <h4 class="font-bold text-text mt-0.5">{app.serviceName}</h4>
                      <p class="text-[10px] text-text-muted mt-0.5">{t('operator.citizen')}: {app.citizenName}</p>
                    </div>
                    <span class="rounded-full bg-surface px-2 py-0.5 text-[9px] font-bold border border-border uppercase tracking-wider text-text shrink-0">
                      {app.status}
                    </span>
                  </div>
                {/each}
                <a href="/applications" class="block text-center text-xs font-bold text-primary hover:text-primary-hover hover:underline mt-2">
                  {t('operator.viewAllServices')}
                </a>
              </div>
            {/if}
          </div>
        </div>

      </div>
    </div>
  </div>
{/if}
