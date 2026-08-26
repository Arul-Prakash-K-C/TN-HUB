<script lang="ts">
  import { goto } from '$app/navigation';
  import { tt, locale } from '$lib/i18n';
  import { Bot, ChevronLeft, ArrowRight, X } from '@lucide/svelte';
  import { buildScreen, createInitialContext, type OptionText, type ThozhanContext, type ThozhanOption } from '$lib/thozhan/assistant';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  let isOpen = $state(false);
  let assistantData = $state<any>(null);
  let loading = $state(false);
  let loadError = $state('');

  let history = $state<ThozhanContext[]>([createInitialContext()]);
  const currentContext = $derived(history[history.length - 1]);
  const screen = $derived(assistantData ? buildScreen(currentContext, assistantData, currentLocale, t) : null);

  function resolveText(text?: OptionText): string {
    if (!text) return '';
    return text.type === 'key' ? t(text.key, text.params) : text.value;
  }

  function pushState(nextContext: ThozhanContext) {
    history = [...history, nextContext];
  }

  function goBack() {
    if (history.length === 1) return;
    history = history.slice(0, -1);
  }

  function startOver() {
    history = [createInitialContext()];
  }

  async function handleOption(option: ThozhanOption) {
    if (option.disabled) return;
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
      isOpen = false;
      await goto(action.href);
      return;
    }

    if (action.kind === 'external') {
      window.open(action.href, '_blank', 'noopener,noreferrer');
    }
  }

  const visibleOptions = $derived(screen?.options.filter((option) => !option.disabled || option.id === 'recentlyUsedServices') ?? []);
  const actionOptions = $derived(screen?.actions ?? []);
  const operations = $derived(actionOptions.filter(a => a.id !== 'back' && a.id !== 'startOver'));
  const navigation = $derived(actionOptions.filter(a => a.id === 'back' || a.id === 'startOver'));

  async function loadAssistantData() {
    if (assistantData || loading) return;
    loading = true;
    loadError = '';
    try {
      const res = await fetch('/api/thozhan', { credentials: 'same-origin' });
      if (!res.ok) {
        throw new Error(`Assistant request failed with status ${res.status}`);
      }
      const rawData = await res.json();
      assistantData = {
        user: rawData.user ?? null,
        services: rawData.catalog?.services ?? [],
        departments: rawData.catalog?.departments ?? [],
        applications: rawData.applications ?? [],
        documents: rawData.documents ?? []
      };
    } catch (err) {
      console.error('Failed to load assistant data', err);
      loadError = 'Unable to load Thozhan AI right now. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function toggleOpen() {
    isOpen = !isOpen;
    if (isOpen) {
      await loadAssistantData();
    }
  }
</script>

<!-- Floating Action Button -->
<div class="fixed bottom-6 right-6 z-40 flex flex-col items-end">
  <button 
    class="group flex h-16 w-16 items-center justify-center rounded-full bg-transparent shadow-none backdrop-blur-0 transition-all duration-300 hover:scale-110 active:scale-95" 
    onclick={toggleOpen}
    aria-label="Open Thozhan AI"
  >
    <img src="/thozhan-logo.png" alt="Thozhan AI" class="h-12 w-12 object-contain drop-shadow-md" onerror={(e) => { (e.currentTarget as HTMLElement).style.display='none'; if (e.currentTarget?.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='block'; }} />
    <Bot class="hidden h-8 w-8 text-primary" />
  </button>
</div>

<!-- AI Assistant Modal Overlay -->
<div class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center transition-opacity duration-300 {isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}" aria-hidden={!isOpen}>
  <!-- Modal Content -->
  <div class="flex h-[85vh] max-h-[800px] w-[90%] max-w-[500px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transform transition-transform duration-300 {isOpen ? 'scale-100' : 'scale-95'}">
    
    <!-- Header -->
    <div class="flex shrink-0 items-start justify-between border-b border-border bg-surface-container p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="/thozhan-logo.png" alt="Thozhan AI" class="w-10 h-10 object-contain" onerror={(e) => { (e.currentTarget as HTMLElement).style.display='none'; if (e.currentTarget?.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='block'; }} />
          <Bot class="hidden h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 class="text-[20px] font-bold leading-tight text-text">Thozhan AI</h3>
          <p class="text-[12px] font-medium text-text-muted">TN HUB Citizen Assistant</p>
        </div>
      </div>
      <button 
        class="rounded-full p-2 text-text-muted transition-colors hover:bg-muted hover:text-text" 
        onclick={toggleOpen}
        aria-label="Close chat"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Content Area (Scrollable) -->
    <div class="relative flex-1 overflow-y-auto bg-background">
      {#if loading}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-faint">
          <div class="flex gap-1">
            <span class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 0ms"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 150ms"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 300ms"></span>
          </div>
          <span class="text-sm font-medium">Loading assistant...</span>
        </div>
      {:else if loadError}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div class="rounded-2xl border border-danger/25 bg-danger-soft px-5 py-4 text-sm font-medium text-danger">
            {loadError}
          </div>
          <button
            type="button"
            onclick={loadAssistantData}
            class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Retry
          </button>
        </div>
      {:else if !screen}
        <div class="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-text-muted">
          Assistant is unavailable right now.
        </div>
      {/if}

      {#if screen}
        <div class="flex flex-col gap-6 p-5">
          
          <!-- Breadcrumbs and Back -->
          {#if history.length > 1}
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onclick={goBack}
                class="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-text transition hover:bg-surface-container"
              >
                <ChevronLeft class="h-4 w-4" />
                {t('chatbot.action.back')}
              </button>

              {#each screen.breadcrumbs as crumb, index}
                <span class="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                  {resolveText(crumb)}
                  {#if index < screen.breadcrumbs.length - 1}
                    <ChevronLeft class="h-3 w-3 rotate-180 opacity-50" />
                  {/if}
                </span>
              {/each}
            </div>
          {/if}

          <!-- Screen Title & Description -->
          <div class="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 class="flex items-center gap-2 text-xl font-bold leading-tight text-text">
              {history.length > 1 ? resolveText(screen.title) : 'What would you like help with?'}
            </h2>
            <p class="mt-2 text-[13px] leading-relaxed text-text-muted">
              {history.length > 1 ? resolveText(screen.description) : 'Thozhan AI guides you through approved TN HUB options.'}
            </p>
          </div>

          <!-- Auth Required -->
          {#if screen.authRequired}
            <div class="rounded-xl border border-warning/25 bg-warning-soft px-4 py-4 text-sm text-warning">
              <div class="font-bold">{t('chatbot.authRequired.title')}</div>
              <div class="mt-1">{t('chatbot.authRequired.description')}</div>
            </div>
          {/if}

          <!-- Result Card -->
          {#if screen.resultCard}
            <div class="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 class="text-lg font-bold text-text">{resolveText(screen.resultCard.title)}</h3>
                  {#if resolveText(screen.resultCard.subtitle)}
                    <p class="mt-1 text-xs font-medium text-text-muted">{resolveText(screen.resultCard.subtitle)}</p>
                  {/if}
                </div>
                {#if screen.resultCard.badges?.length}
                  <div class="flex gap-1.5">
                    {#each screen.resultCard.badges as badge}
                      <span class="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                        {resolveText(badge)}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>

              {#if screen.resultCard.sections?.length}
                <div class="grid gap-3">
                  {#each screen.resultCard.sections as section}
                    <div class="rounded-lg border border-border bg-muted p-3">
                      <h4 class="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">{resolveText(section.title)}</h4>
                      <div class="grid gap-2">
                        {#each section.items as item}
                          {#if resolveText(item.value)}
                            <div class="rounded border border-border bg-surface px-3 py-2">
                              <div class="text-[9px] font-bold uppercase text-text-faint">{resolveText(item.label)}</div>
                              <div class="mt-0.5 text-xs font-semibold text-text">{resolveText(item.value)}</div>
                            </div>
                          {/if}
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}

              {#if resolveText(screen.resultCard.notice)}
                <div class="mt-3 rounded-lg border border-border bg-surface-container px-3 py-2.5 text-[11px] font-medium text-text-muted">
                  {resolveText(screen.resultCard.notice)}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Options & Actions Combined Grid -->
          {#if visibleOptions.length > 0 || operations.length > 0}
            <div class="grid gap-3">
              {#each visibleOptions as option}
                <button
                  type="button"
                  disabled={option.disabled}
                  onclick={() => handleOption(option)}
                  class="text-left px-4 py-3 rounded-xl border bg-white shadow-sm transition-all group flex flex-col justify-center
                    {option.disabled
                      ? 'cursor-not-allowed border-border bg-muted opacity-60'
                      : 'border-border bg-surface hover:border-primary hover:bg-primary-soft/40 hover:shadow-md'}"
                >
                  <div class="flex w-full items-center justify-between gap-2">
                    <span class="text-[14px] font-semibold text-text">{resolveText(option.label)}</span>
                    {#if !option.disabled}
                      <ArrowRight class="h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    {/if}
                  </div>
                  {#if resolveText(option.description)}
                    <span class="mt-1 text-[11px] font-medium text-text-muted">{resolveText(option.description)}</span>
                  {/if}
                </button>
              {/each}

              {#each operations as action}
                <button
                  type="button"
                  disabled={action.disabled}
                  onclick={() => handleOption(action)}
                  class="text-left px-4 py-3 rounded-xl border transition-all group flex flex-col justify-center
                    {action.disabled
                      ? 'cursor-not-allowed border-border bg-muted text-text-faint'
                      : 'border-primary bg-primary text-white hover:bg-primary-hover'}"
                >
                  <div class="flex items-center justify-between w-full gap-2">
                    <span class="text-[14px] font-semibold">{resolveText(action.label)}</span>
                    {#if !action.disabled}
                      <ArrowRight class="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 text-white/80 transition-opacity" />
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          {:else if screen.emptyTitle}
            <div class="rounded-xl border border-dashed border-border-strong bg-surface px-5 py-8 text-center text-text-muted">
              <div class="text-sm font-bold text-text">{resolveText(screen.emptyTitle)}</div>
              <div class="mt-1 text-xs">{resolveText(screen.emptyDescription)}</div>
            </div>
          {/if}

          <!-- Navigation Pill Buttons -->
          {#if navigation.length > 0}
            <div class="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
              {#each navigation as action}
                <button
                  type="button"
                  disabled={action.disabled}
                  onclick={() => handleOption(action)}
                  class="rounded-full border px-4 py-2 text-[12px] font-bold transition flex-1 sm:flex-none text-center justify-center
                    {action.id === 'startOver'
                      ? 'border-border bg-surface text-text hover:bg-muted'
                      : 'border-border bg-muted text-text hover:bg-surface-container'}"
                >
                  {resolveText(action.label)}
                </button>
              {/each}
            </div>
          {/if}

        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="shrink-0 border-t border-border bg-surface-container p-3 text-center">
      <p class="text-[10px] text-text-muted">
        Thozhan AI answers general questions. It can't see your personal applications or live status unless you log in.
      </p>
    </div>

  </div>
</div>
