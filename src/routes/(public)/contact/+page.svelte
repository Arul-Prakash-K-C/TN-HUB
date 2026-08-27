<script>
  import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, Globe, Headphones } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let sent = $state(false);

  let isSubmitting = $state(false);
  let errorMessage = $state('');

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim() || isSubmitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errorMessage = 'Please enter a valid email address.';
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          source: 'contact_page'
        })
      });
      const body = await response.json().catch(() => null);
      
      if (response.ok) {
        sent = true;
        setTimeout(() => {
          sent = false;
          name = '';
          email = '';
          message = '';
        }, 3000);
      } else {
        throw new Error(body?.error ?? 'Unable to submit your message.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      errorMessage = error instanceof Error ? error.message : 'Unable to submit your message.';
    } finally {
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
  <title>{t('contact.title')}</title>
</svelte:head>

<div class="bg-background min-h-screen pb-16 text-text">
  <!-- Hero Banner -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-bold tracking-tight leading-tight">{t('contact.heading')}</h1>
      <p class="public-banner-subtitle mt-2 max-w-2xl text-sm leading-relaxed">{t('contact.subheading')}</p>
    </div>
  </div>

  <!-- Content -->
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Contact Info Cards -->
      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3 text-primary">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft">
              <MapPin class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-text">{t('contact.headquarters')}</h3>
          </div>
          <p class="text-xs leading-relaxed text-text-muted">
            TN Hub Citizen Platform,<br />
            BuildWhatMovesIndia Hackathon Hub,<br />
            Chennai, Tamil Nadu.
          </p>
        </div>

        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3 text-primary">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft">
              <Phone class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-text">{t('contact.tollFree')}</h3>
          </div>
          <p class="font-mono text-sm font-bold text-text">1800-XXX-XXXX</p>
          <p class="mt-1 text-[11px] text-text-faint">Mon–Sat, 9 AM – 6 PM IST</p>
        </div>

        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3 text-primary">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft">
              <Mail class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-text">{t('contact.emailSupport')}</h3>
          </div>
          <p class="font-mono text-sm font-bold text-text">support@tnhub.org</p>
          <p class="mt-1 text-[11px] text-text-faint">Average response within 24 hours</p>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-2">
        <div class="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Send class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-text">{t('contact.sendMessage')}</h2>
              <p class="text-xs text-text-muted">Fill in the form and our team will respond promptly.</p>
            </div>
          </div>

          {#if sent}
            <div class="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
                <CheckCircle2 class="h-8 w-8" />
              </div>
              <h3 class="text-lg font-bold text-text">Message Sent!</h3>
              <p class="mt-2 max-w-md text-sm text-text-muted">{t('contact.successMsg')}</p>
            </div>
          {:else}
            <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="contactName" class="mb-1.5 block text-xs font-bold text-text">{t('contact.nameLabel')}</label>
                  <input id="contactName" type="text" bind:value={name} required placeholder="Meena Lakshmi" class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
                <div>
                  <label for="contactEmail" class="mb-1.5 block text-xs font-bold text-text">{t('contact.emailLabel')} *</label>
                  <input id="contactEmail" type="email" bind:value={email} required placeholder="meena@example.com" class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
              </div>

              <div>
                <label for="contactMessage" class="mb-1.5 block text-xs font-bold text-text">{t('contact.messageLabel')}</label>
                <textarea id="contactMessage" bind:value={message} required rows={5} placeholder="How can we help you?" class="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
              </div>
              {#if errorMessage}
                <p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{errorMessage}</p>
              {/if}

              <div class="flex justify-end">
                <button type="submit" disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()} class="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
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
