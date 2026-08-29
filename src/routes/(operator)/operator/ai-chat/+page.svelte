<script>

  import { goto } from '$app/navigation';
  import { Bot, ChevronLeft, RefreshCcw, Route, ShieldCheck, Sparkles, ArrowRight, MessageSquare } from '@lucide/svelte';
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
const operations = $derived(actionOptions.filter(a => a.id !== 'back' && a.id !== 'startOver'));
const navigation = $derived(actionOptions.filter(a => a.id === 'back' || a.id === 'startOver'));
</script>

<svelte:head>
  <title>{t('ui.routes.operator.operator.ai.chat.fa04a4ed')}</title>
</svelte:head>

<div class="flex-grow w-full bg-background text-text min-h-screen font-sans">
  <!-- Operator-branded compact header -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-surface/15 rounded-xl">
          <MessageSquare class="h-5 w-5" />
        </div>
      </div>
      <h1 class="text-2xl font-black tracking-tight leading-tight">{t('chatbot.widget.title')}</h1>
      <p class="public-banner-subtitle mt-1 max-w-2xl text-sm leading-relaxed">{t('ui.routes.operator.operator.ai.chat.595dc36d')}</p>
    </div>
  </div>

  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-6">
    <!-- Hero Section -->
    <section class="flex flex-col md:flex-row gap-6 items-start">
      <div class="relative w-full flex-1 overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-sm">
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
              class="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-text-muted transition hover:bg-surface-container"
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
            <Bot class="w-7 h-7 text-primary hidden" />
          </div>
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-[22px] font-bold text-text leading-tight">{history.length > 1 ? resolveText(screen.title) : 'Thozhan AI'}</h2>
              <span class="bg-primary/15 text-primary text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck class="w-[12px] h-[12px]" /> {t('chatbot.controlled.badge')}
              </span>
            </div>
            <p class="text-[15px] text-text-muted mt-1">{history.length > 1 ? resolveText(screen.description) : 'Choose guided options to find services, start applications, track status, review document requirements, and get TN Kuviyam help.'}</p>
          </div>
          
          {#if history.length > 1}
            <button 
              onclick={startOver}
              class="mt-3 sm:mt-0 sm:ml-auto flex items-center gap-2 px-4 py-2 border border-border rounded-full text-[13px] font-medium hover:bg-muted transition-colors shrink-0"
            >
              <RefreshCcw class="w-[16px] h-[16px]" /> {t('chatbot.action.startOver')}
            </button>
          {/if}
        </div>

        <!-- Auth Required / Result Card logic -->
        {#if screen.authRequired}
          <div class="mt-4 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
            <div class="font-bold">{t('chatbot.authRequired.title')}</div>
            <div class="mt-1">{t('chatbot.authRequired.description')}</div>
          </div>
        {/if}

        {#if screen.resultCard}
          <div class="mt-4 rounded-2xl border border-border bg-muted/70 p-4">
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
      <div class="lg:col-span-2 bg-surface rounded-xl p-6 shadow-sm border border-border">
        
        {#if history.length === 1}
          <div class="flex items-start gap-4 mb-6">
            <div class="w-10 h-10 flex items-center justify-center shrink-0">
              <img src="/thozhan-logo.png" alt={t('ui.thozhan.ai.logo')} class="w-10 h-10 object-contain" onerror={(e) => { (e.currentTarget).style.display='none'; if (e.currentTarget?.nextElementSibling) (e.currentTarget.nextElementSibling).style.display='block'; }} />
              <Bot class="w-6 h-6 text-primary hidden" />
            </div>
            <div>
              <h3 class="text-[18px] font-bold text-text mb-1">{t('ui.routes.operator.operator.ai.chat.ac41698e')}</h3>
              <p class="text-[15px] text-text-muted">{t('ui.routes.operator.operator.ai.chat.68a39fa6')}</p>
            </div>
          </div>
        {/if}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each visibleOptions as option}
            <button
              type="button"
              disabled={option.disabled}
              onclick={() => handleOption(option)}
              class="text-left px-5 py-4 rounded-lg border bg-muted text-[14px] font-semibold transition-all group flex flex-col justify-center
                {option.disabled
                  ? 'cursor-not-allowed border-border bg-muted text-text-faint'
                  : 'border-border text-text hover:border-primary hover:bg-primary-soft'}"
            >
              <div class="flex items-center justify-between w-full gap-2">
                <span>{resolveText(option.label)}</span>
                {#if !option.disabled}
                  <ArrowRight class="w-5 h-5 shrink-0 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                {/if}
              </div>
              {#if resolveText(option.description)}
                <span class="mt-1 text-[12px] font-normal leading-relaxed {option.disabled ? 'text-text-faint' : 'text-text'}">{resolveText(option.description)}</span>
              {/if}
            </button>
          {/each}

          {#each operations as action}
            <button
              type="button"
              disabled={action.disabled}
              onclick={() => handleOption(action)}
              class="text-left px-5 py-4 rounded-lg border bg-muted text-[14px] font-semibold transition-all group flex flex-col justify-center
                {action.disabled
                  ? 'cursor-not-allowed border-border bg-muted text-text-faint'
                  : 'border-border text-text hover:border-primary hover:bg-primary-soft'}"
            >
              <div class="flex items-center justify-between w-full gap-2">
                <span>{resolveText(action.label)}</span>
                {#if !action.disabled}
                  <ArrowRight class="w-5 h-5 shrink-0 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                {/if}
              </div>
            </button>
          {/each}
        </div>

        {#if visibleOptions.length === 0 && operations.length === 0 && screen.emptyTitle}
          <div class="rounded-[1.75rem] border border-dashed border-border bg-muted px-6 py-8 text-center mt-4">
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
        <div class="bg-surface rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] border border-border">
          <h4 class="text-[12px] font-bold text-primary uppercase tracking-widest mb-3">{t('ui.routes.operator.operator.ai.chat.de1a99a3')}</h4>
          <div class="flex flex-col gap-3">
            <div class="bg-muted p-3 rounded-lg">
              <h5 class="text-[11px] font-bold text-text uppercase mb-1">{t('ui.routes.operator.operator.ai.chat.d6fd68c8')}</h5>
              <p class="text-[12px] text-text">{t('ui.routes.operator.operator.ai.chat.bef26d15')}</p>
            </div>
            <div class="bg-muted p-3 rounded-lg">
              <h5 class="text-[11px] font-bold text-text uppercase mb-1">{t('ui.routes.operator.operator.ai.chat.62bbcf25')}</h5>
              <p class="text-[12px] text-text">{t('ui.routes.operator.operator.ai.chat.263b91da')}</p>
            </div>
            <div class="bg-muted p-3 rounded-lg">
              <h5 class="text-[11px] font-bold text-text uppercase mb-1">{t('ui.routes.operator.operator.ai.chat.aab9ff59')}</h5>
              <p class="text-[12px] text-text">{t('ui.routes.operator.operator.ai.chat.bd903e27')}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="bg-surface rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] border border-border">
          <h4 class="text-[12px] font-bold text-primary uppercase tracking-widest mb-3">{t('ui.routes.operator.operator.ai.chat.5561b6f6')}</h4>
          <div class="flex flex-col gap-2">
            <a href="/services" class="w-full text-left px-4 py-2.5 rounded-lg border border-border bg-muted hover:bg-muted transition-colors text-[13px] font-semibold text-text block">{t('ui.routes.operator.operator.ai.chat.9fcf6b69')}</a>
            <a href="/applications" class="w-full text-left px-4 py-2.5 rounded-lg border border-border bg-muted hover:bg-muted transition-colors text-[13px] font-semibold text-text block">{t('ui.routes.operator.operator.ai.chat.efe93fbd')}</a>
            <a href="/operator/help" class="w-full text-left px-4 py-2.5 rounded-lg border border-border bg-muted hover:bg-muted transition-colors text-[13px] font-semibold text-text block">{t('ui.routes.operator.operator.ai.chat.200293c4')}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
