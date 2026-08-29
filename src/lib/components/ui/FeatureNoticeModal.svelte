<script>
  import { featureNotice } from '$lib/stores/featureNotice';
  import { tt } from '$lib/i18n';
  import { ShieldAlert, CheckCircle2, ChevronRight, X } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';

  let state = $derived($featureNotice);
  const t = $derived($tt);

  const upcomingFeatures = [
    { nameKey: 'feature.upcoming.digilocker.name', descKey: 'feature.upcoming.digilocker.desc' },
    { nameKey: 'feature.upcoming.payment.name', descKey: 'feature.upcoming.payment.desc' },
    { nameKey: 'feature.upcoming.api.name', descKey: 'feature.upcoming.api.desc' },
    { nameKey: 'feature.upcoming.alerts.name', descKey: 'feature.upcoming.alerts.desc' },
    { nameKey: 'feature.upcoming.grievance.name', descKey: 'feature.upcoming.grievance.desc' }
  ];

  function close() {
    featureNotice.set({ isOpen: false, featureName: '' });
  }
</script>

{#if state.isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    transition:fade={{ duration: 150 }}
    class="fixed inset-0 z-[100] flex items-center justify-center bg-[#071A28]/85 p-4 backdrop-blur-md"
    onclick={close}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Modal Container -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      transition:scale={{ duration: 200, start: 0.95 }}
      class="w-full max-w-lg rounded-[2.5rem] bg-surface dark:bg-surface-container border border-border/50 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Glow Effect background -->
      <div class="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      
      <!-- Close Button -->
      <button
        onclick={close}
        class="absolute right-6 top-6 p-2 rounded-full border border-border bg-surface hover:bg-surface-container-high text-text-muted hover:text-text transition-all duration-150 active:scale-90 cursor-pointer"
        aria-label={t('a11y.closeDialog')}
      >
        <X class="h-4 w-4" />
      </button>

      <!-- Alert Icon & Title -->
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-500/20">
          <ShieldAlert class="h-6 w-6" />
        </div>
        <div>
          <h2 class="text-lg font-black text-text tracking-tight uppercase">{t('feature.notice.title')}</h2>
          <p class="text-xs text-text-faint font-semibold mt-0.5">{t('feature.notice.subtitle')}</p>
        </div>
      </div>

      <!-- Formal Message -->
      <div class="space-y-3">
        <p class="text-xs text-text leading-relaxed font-semibold">
          {t('feature.notice.message', { feature: state.featureName })}
        </p>
        <p class="text-xs text-text-muted leading-relaxed font-medium">
          {t('feature.notice.demo')}
        </p>
      </div>

      <!-- Upcoming Features List -->
      <div class="space-y-3 pt-2">
        <h3 class="text-[10px] font-black uppercase text-text-muted tracking-wider">{t('feature.notice.upcoming')}</h3>
        <div class="divide-y divide-border/60 bg-muted/40 rounded-3xl border border-border/50 overflow-hidden">
          {#each upcomingFeatures as feat}
            <div class="p-3.5 flex items-start gap-3 hover:bg-muted/65 transition-colors">
              <ChevronRight class="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span class="text-xs font-black text-text block">{t(feat.nameKey)}</span>
                <span class="text-[10px] text-text-muted mt-0.5 block leading-relaxed font-medium">{t(feat.descKey)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button
          onclick={close}
          class="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          {t('feature.notice.acknowledge')}
        </button>
      </div>
    </div>
  </div>
{/if}
