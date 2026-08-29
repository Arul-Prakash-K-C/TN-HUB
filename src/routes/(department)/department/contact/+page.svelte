<script>
  import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, Globe, Headphones } from '@lucide/svelte';
  
const t = $derived($tt);
import { tt } from '$lib/i18n';

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let sent = $state(false);
  let errorMessage = $state('');
  let isSubmitting = $state(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim() || isSubmitting)
        return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errorMessage = t('apply.validation.emailInvalid');
        return;
    }
    isSubmitting = true;
    errorMessage = '';
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
                source: 'department_contact'
            })
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(body?.error ?? t('errors.submitMessage'));
        }
        sent = true;
        setTimeout(() => {
            sent = false;
            name = '';
            email = '';
            message = '';
        }, 3000);
    }
    catch (cause) {
        errorMessage = cause instanceof Error ? cause.message : t('errors.submitMessage');
    }
    finally {
        isSubmitting = false;
    }
  }

  const stats = [
    { label: 'Support Hours', value: '24/7', icon: Clock },
    { label: 'Response Time', value: '<24 hrs', icon: MessageSquare },
    { label: 'Languages', value: 'EN / தமிழ்', icon: Globe },
    { label: 'Support Channels', value: '3+', icon: Headphones }
  ];
</script>

<svelte:head>
  <title>{t('contact.title')} — Officer Portal</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-16 w-full">
  <!-- Hero Banner -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-black tracking-tight leading-tight">{t('contact.heading')}</h1>
      <p class="public-banner-subtitle mt-1 max-w-2xl text-xs leading-relaxed">{t('contact.subheading')}</p>
    </div>
  </div>

  <!-- Content -->
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Contact Info Cards -->
      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center gap-3 text-primary mb-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft">
              <MapPin class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-text">{t('contact.headquarters')}</h3>
          </div>
          <p class="text-xs text-text-muted leading-relaxed">
            {t('ui.tn.kuviyam.citizen.platform')}<br />
            {t('ui.buildwhatmovesindia.hackathon.hub')}<br />
            {t('ui.chennai.tamil.nadu')}
          </p>
        </div>

        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center gap-3 text-primary mb-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft">
              <Phone class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-text">{t('contact.tollFree')}</h3>
          </div>
          <p class="text-sm text-text font-mono font-bold">{t('ui.routes.department.department.contact.64355bbb')}</p>
          <p class="text-[11px] text-text-faint mt-1">{t('ui.routes.department.department.contact.81dee69b')}</p>
        </div>

        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center gap-3 text-primary mb-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft">
              <Mail class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-text">{t('contact.emailSupport')}</h3>
          </div>
          <p class="text-sm text-text font-mono font-bold">{t('ui.routes.department.department.contact.73bba52b')}</p>
          <p class="text-[11px] text-text-faint mt-1">{t('ui.routes.department.department.contact.223913ae')}</p>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-2">
        <div class="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-text">
              <Send class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-text">{t('contact.sendMessage')}</h2>
              <p class="text-xs text-text-muted">{t('ui.routes.department.department.contact.d9f57235')}</p>
            </div>
          </div>

          {#if sent}
            <div class="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text mb-4">
                <CheckCircle2 class="h-8 w-8" />
              </div>
              <h3 class="text-lg font-bold text-text">{t('ui.routes.department.department.contact.481a9218')}</h3>
              <p class="text-sm text-text-muted mt-2 max-w-md">{t('contact.successMsg')}</p>
            </div>
          {:else}
            <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="contactName" class="block text-xs font-bold text-text mb-1.5">{t('contact.nameLabel')}</label>
                  <input id="contactName" type="text" bind:value={name} required placeholder={t('ui.meena.lakshmi')} class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
                <div>
                  <label for="contactEmail" class="block text-xs font-bold text-text mb-1.5">{t('contact.emailLabel')} *</label>
                  <input id="contactEmail" type="email" bind:value={email} required placeholder={t('ui.meena.example.com')} class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
              </div>

              <div>
                <label for="contactMessage" class="block text-xs font-bold text-text mb-1.5">{t('contact.messageLabel')}</label>
                <textarea id="contactMessage" bind:value={message} required rows={5} placeholder={t('ui.how.can.we.help.you')} class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text placeholder:text-text-faint outline-none transition resize-none focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
              </div>
              {#if errorMessage}
                <p class="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-xs font-bold text-danger">{errorMessage}</p>
              {/if}

              <div class="flex justify-end">
                <button type="submit" disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()} class="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-vazhi-1 hover:bg-primary-hover transition disabled:cursor-not-allowed disabled:opacity-50">
                  <Send class="h-4 w-4" /> {isSubmitting ? 'Sending...' : t('contact.sendBtn')}
                </button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
