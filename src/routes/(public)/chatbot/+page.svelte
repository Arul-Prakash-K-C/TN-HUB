<script>

  import { goto } from '$app/navigation';
  import { Bot, ChevronLeft, RefreshCcw, Route, ShieldCheck, Sparkles, ArrowRight } from '@lucide/svelte';
  import { locale, tt } from '$lib/i18n';
  import { buildScreen, createInitialContext } from '$lib/thozhan/assistant';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const assistantData = $derived({
    user: data.user ?? null,
    services: data.catalog?.services ?? [],
    departments: data.catalog?.departments ?? [],
    applications: data.applications ?? [],
    documents: data.documents ?? []
});
let history = $state([createInitialContext()]);
const currentContext = $derived(history[history.length - 1]);
const screen = $derived(buildScreen(currentContext, assistantData, currentLocale, t));
function resolveText(text) {
    if (!text)
        return '';
    return text.type === 'key' ? t(text.key, text.params) : text.value;
}
function pushState(nextContext) {
    history = [...history, nextContext];
}
function goBack() {
    if (history.length === 1)
        return;
    history = history.slice(0, -1);
}
function startOver() {
    history = [createInitialContext()];
}
async function handleOption(option) {
    if (option.disabled)
        return;
    if (option.id === 'back') {
        goBack();
        return;
    }
    if (option.id === 'startOver') {
        startOver();
        return;
    }
    const action = option.action;
    if (action.kind === 'state') {
        pushState({
            ...currentContext,
            ...(action.patch ?? {}),
            state: action.nextState
        });
        return;
    }
    if (action.kind === 'navigate') {
        await goto(action.href);
        return;
    }
    if (action.kind === 'external') {
        window.open(action.href, '_blank', 'noopener,noreferrer');
    }
}
const visibleOptions = $derived(screen.options.filter((option) => !option.disabled || option.id === 'recentlyUsedServices'));
const actionOptions = $derived(screen.actions ?? []);
// Split actions into operations and navigation
const operations = $derived(actionOptions.filter(a => a.id !== 'back' && a.id !== 'startOver'));
const navigation = $derived(actionOptions.filter(a => a.id === 'back' || a.id === 'startOver'));
</script>

<svelte:head>
  <title>{t('chatbot.controlled.pageTitle')} - TN Kuviyam</title>
</svelte:head>

<div class="flex-grow min-h-screen w-full bg-background font-sans text-text">
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-6">
    <!-- Hero Section -->
    <section class="flex flex-col md:flex-row gap-6 items-start">
      <div class="relative w-full flex-1 overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-vazhi-1)]">
        <!-- Background pattern/icon -->
        <div class="absolute -right-16 -top-16 opacity-5 pointer-events-none">
          <Sparkles class="w-[300px] h-[300px]" />
        </div>

        <!-- Breadcrumbs -->
        {#if history.length > 1}
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <button
              type="button"
              onclick={goBack}
              class="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-text transition hover:bg-surface-container"
            >
              <ChevronLeft class="h-4 w-4" />
              {t('chatbot.action.back')}
            </button>

            {#each screen.breadcrumbs as crumb, index}
              <span class="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                {resolveText(crumb)}
                {#if index < screen.breadcrumbs.length - 1}
                  <Route class="h-3.5 w-3.5" />
                {/if}
              </span>
            {/each}
          </div>
        {/if}

        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="w-14 h-14 flex items-center justify-center shrink-0">
            <img src="/thozhan-logo.png" alt={t('ui.thozhan.ai.logo')} class="w-14 h-14 object-contain" onerror={(e) => { (e.currentTarget).style.display='none'; if (e.currentTarget?.nextElementSibling) (e.currentTarget.nextElementSibling).style.display='block'; }} />
              <Bot class="hidden h-7 w-7 text-primary" />
          </div>
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-[22px] font-bold leading-tight text-text">{history.length > 1 ? resolveText(screen.title) : 'Thozhan AI'}</h2>
              <span class="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-[10px] font-bold uppercase text-primary">
                <ShieldCheck class="w-[12px] h-[12px]" /> {t('chatbot.controlled.badge')}
              </span>
            </div>
            <p class="mt-1 text-[15px] text-text-muted">{history.length > 1 ? resolveText(screen.description) : 'Choose guided options to find services, start applications, track status, review document requirements, and get TN Kuviyam help.'}</p>
          </div>
          
          {#if history.length > 1}
            <button 
              onclick={startOver}
              class="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-muted sm:ml-auto sm:mt-0"
            >
              <RefreshCcw class="w-[16px] h-[16px]" /> {t('chatbot.action.startOver')}
            </button>
          {/if}
        </div>

        <!-- Auth Required / Result Card logic -->
        {#if screen.authRequired}
          <div class="mt-4 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning">
            <div class="font-bold">{t('chatbot.authRequired.title')}</div>
            <div class="mt-1">{t('chatbot.authRequired.description')}</div>
          </div>
        {/if}

        {#if screen.resultCard}
          <div class="mt-4 rounded-2xl border border-border bg-surface-container p-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-black tracking-tight text-text">{resolveText(screen.resultCard.title)}</h3>
                {#if resolveText(screen.resultCard.subtitle)}
                  <p class="mt-1 text-xs font-semibold text-text-muted">{resolveText(screen.resultCard.subtitle)}</p>
                {/if}
              </div>

              {#if screen.resultCard.badges?.length}
                <div class="flex flex-wrap gap-2">
                  {#each screen.resultCard.badges as badge}
                    <span class="rounded-full bg-surface px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary shadow-sm">
                      {resolveText(badge)}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            {#if screen.resultCard.sections?.length}
              <div class="mt-4 grid gap-3">
                {#each screen.resultCard.sections as section}
                  <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <h4 class="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{resolveText(section.title)}</h4>
                    <div class="mt-3 grid gap-2">
                      {#each section.items as item}
                        {#if resolveText(item.value)}
                          <div class="rounded-xl bg-muted px-3 py-2">
                            <div class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-faint">{resolveText(item.label)}</div>
                            <div class="mt-1 text-sm font-semibold leading-relaxed text-text">{resolveText(item.value)}</div>
                          </div>
                        {/if}
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            {#if resolveText(screen.resultCard.notice)}
              <div class="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-xs font-medium leading-relaxed text-text-muted shadow-sm">
                {resolveText(screen.resultCard.notice)}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    <!-- Bento Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Primary Interaction -->
      <div class="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-vazhi-1)]">
        
        {#if history.length === 1}
          <div class="flex items-start gap-4 mb-6">
            <div class="w-10 h-10 flex items-center justify-center shrink-0">
              <img src="/thozhan-logo.png" alt={t('ui.thozhan.ai.logo')} class="w-10 h-10 object-contain" onerror={(e) => { (e.currentTarget).style.display='none'; if (e.currentTarget?.nextElementSibling) (e.currentTarget.nextElementSibling).style.display='block'; }} />
              <Bot class="hidden h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 class="mb-1 text-[18px] font-bold text-text">{t('ui.routes.public.chatbot.a070ad77')}</h3>
              <p class="text-[15px] text-text-muted">{t('ui.routes.public.chatbot.a529c234')}</p>
            </div>
          </div>
        {/if}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each visibleOptions as option}
            <button
              type="button"
              disabled={option.disabled}
              onclick={() => handleOption(option)}
              class="text-left px-5 py-4 rounded-lg border bg-[#f9f9f6] text-[14px] font-semibold transition-all group flex flex-col justify-center
                {option.disabled
                  ? 'cursor-not-allowed border-border bg-muted text-text-faint'
                  : 'border-border bg-surface-container text-text hover:border-primary hover:bg-primary-soft/50'}"
            >
              <div class="flex items-center justify-between w-full gap-2">
                <span>{resolveText(option.label)}</span>
                {#if !option.disabled}
                  <ArrowRight class="w-5 h-5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                {/if}
              </div>
              {#if resolveText(option.description)}
                <span class="mt-1 text-[12px] font-normal leading-relaxed {option.disabled ? 'text-text-faint' : 'text-text-muted'}">{resolveText(option.description)}</span>
              {/if}
            </button>
          {/each}

          {#each operations as action}
            <button
              type="button"
              disabled={action.disabled}
              onclick={() => handleOption(action)}
              class="text-left px-5 py-4 rounded-lg border bg-[#f9f9f6] text-[14px] font-semibold transition-all group flex flex-col justify-center
                {action.disabled
                  ? 'cursor-not-allowed border-border bg-muted text-text-faint'
                  : 'border-border bg-surface-container text-text hover:border-primary hover:bg-primary-soft/50'}"
            >
              <div class="flex items-center justify-between w-full gap-2">
                <span>{resolveText(action.label)}</span>
                {#if !action.disabled}
                  <ArrowRight class="w-5 h-5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                {/if}
              </div>
            </button>
          {/each}
        </div>

        {#if visibleOptions.length === 0 && operations.length === 0 && screen.emptyTitle}
          <div class="mt-4 rounded-[1.75rem] border border-dashed border-border-strong bg-muted px-6 py-8 text-center">
            <div class="text-lg font-black text-text">{resolveText(screen.emptyTitle)}</div>
            <div class="mt-2 text-sm font-medium leading-relaxed text-text-muted">{resolveText(screen.emptyDescription)}</div>
          </div>
        {/if}

        {#if navigation.length > 0}
          <div class="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
            {#each navigation as action}
              <button
                type="button"
                disabled={action.disabled}
                onclick={() => handleOption(action)}
                class="rounded-full border px-5 py-2 text-sm font-semibold transition
                  {action.id === 'startOver'
                    ? 'border-border bg-surface text-text hover:border-border-strong hover:bg-muted'
                    : 'border-border bg-muted text-text hover:bg-surface-container'}"
              >
                {resolveText(action.label)}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Right Column: Info & Actions -->
      <div class="lg:col-span-1 flex flex-col gap-6">
        <!-- How it works card -->
        <div class="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-vazhi-1)]">
          <h4 class="mb-3 text-[12px] font-bold uppercase tracking-widest text-primary">{t('ui.routes.public.chatbot.918d3667')}</h4>
          <div class="flex flex-col gap-3">
            <div class="rounded-lg bg-muted p-3">
              <h5 class="mb-1 text-[11px] font-bold uppercase text-text">{t('ui.routes.public.chatbot.f4bcdd6f')}</h5>
              <p class="text-[12px] text-text-muted">{t('ui.routes.public.chatbot.7eaa36e2')}</p>
            </div>
            <div class="rounded-lg bg-muted p-3">
              <h5 class="mb-1 text-[11px] font-bold uppercase text-text">{t('ui.routes.public.chatbot.01e6bb9b')}</h5>
              <p class="text-[12px] text-text-muted">{t('ui.routes.public.chatbot.0e9e0ab4')}</p>
            </div>
            <div class="rounded-lg bg-muted p-3">
              <h5 class="mb-1 text-[11px] font-bold uppercase text-text">{t('ui.routes.public.chatbot.4202323e')}</h5>
              <p class="text-[12px] text-text-muted">{t('ui.routes.public.chatbot.28933415')}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-vazhi-1)]">
          <h4 class="mb-3 text-[12px] font-bold uppercase tracking-widest text-primary">{t('ui.routes.public.chatbot.e1fc80d4')}</h4>
          <div class="flex flex-col gap-2">
            <a href="/services" class="block w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-left text-[13px] font-semibold text-text transition-colors hover:bg-surface-container">{t('ui.routes.public.chatbot.85e1f34a')}</a>
            <a href="/applications" class="block w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-left text-[13px] font-semibold text-text transition-colors hover:bg-surface-container">{t('ui.routes.public.chatbot.31daeaca')}</a>
            <a href="/help" class="block w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-left text-[13px] font-semibold text-text transition-colors hover:bg-surface-container">{t('ui.routes.public.chatbot.e3f838a4')}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
