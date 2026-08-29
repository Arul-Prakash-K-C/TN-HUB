<script>
const t = $derived($tt);

  import { HelpCircle, Phone, Mail, BookOpen, MessageSquare } from '@lucide/svelte';
  import { tt } from '$lib/i18n';

const translate = $derived($tt);
const faqs = $derived([
    {
        q: translate('operator.help.submitQuestion'),
        a: translate('operator.help.submitAnswer')
    },
    {
        q: translate('operator.help.printQuestion'),
        a: translate('operator.help.printAnswer')
    },
    {
        q: translate('operator.help.documentQuestion'),
        a: translate('operator.help.documentAnswer')
    }
]);
let activeFaqIndex = $state(null);
</script>

<svelte:head>
  <title>{t('ui.routes.operator.operator.help.0385d364')}</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-12 flex flex-col w-full">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-2xl font-black tracking-tight text-white">{t('ui.routes.operator.operator.help.b7ebf006')}</h1>
      <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">{t('ui.routes.operator.operator.help.b1dc80e9')}</p>
    </div>
  </div>

  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6 flex-grow w-full">
    <!-- Help Guides -->
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-start gap-4 hover:border-primary/30 transition">
        <div class="p-3 bg-primary-soft rounded-xl text-primary-soft-text shrink-0">
          <BookOpen class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-bold text-text text-sm">{t('ui.routes.operator.operator.help.52162002')}</h3>
          <p class="text-xs text-text-muted mt-1 leading-relaxed">{t('ui.routes.operator.operator.help.8f25e07d')}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-start gap-4 hover:border-warning/30 transition">
        <div class="p-3 bg-warning-soft rounded-xl text-warning shrink-0">
          <MessageSquare class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-bold text-text text-sm">{t('ui.routes.operator.operator.help.5ca01b59')}</h3>
          <p class="text-xs text-text-muted mt-1 leading-relaxed">{t('ui.routes.operator.operator.help.86dbc311')}</p>
          <a href="/operator/ai-chat" class="mt-2.5 inline-block text-xs font-bold text-warning hover:underline">{t('ui.routes.operator.operator.help.c2a84684')}</a>
        </div>
      </div>
    </div>

    <!-- FAQ Accordion -->
    <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 class="text-base font-bold text-text mb-4">{t('ui.routes.operator.operator.help.eafbd054')}</h2>
      <div class="divide-y divide-border">
        {#each faqs as faq, i}
          <div class="py-3.5">
            <button
              onclick={() => activeFaqIndex = activeFaqIndex === i ? null : i}
              class="w-full text-left flex justify-between items-center gap-4 text-text font-bold text-xs hover:text-primary transition"
            >
              <span>{faq.q}</span>
              <span class="text-text-faint">{activeFaqIndex === i ? '−' : '+'}</span>
            </button>
            {#if activeFaqIndex === i}
              <p class="mt-2 text-xs text-text-muted leading-relaxed font-medium pl-1 animate-fade-in">{faq.a}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Contact Info -->
    <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="font-bold text-text text-sm">{t('ui.routes.operator.operator.help.71209f29')}</h3>
        <p class="text-xs text-text-muted mt-0.5">{t('ui.routes.operator.operator.help.fed5173e')}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-4">
        <a href="tel:18004256000" class="flex items-center gap-2 text-xs font-bold text-text hover:text-primary transition">
          <Phone class="h-4 w-4" /> 1800 425 6000
        </a>
        <a href="mailto:support.tnhub@tn.gov.in" class="flex items-center gap-2 text-xs font-bold text-text hover:text-primary transition">
          <Mail class="h-4 w-4" /> {t('ui.support.tnhub.tn.gov.in')}
        </a>
      </div>
    </div>

  </div>
</div>
