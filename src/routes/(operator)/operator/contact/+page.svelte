<script lang="ts">
  import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, Globe, Headphones } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let sent = $state(false);

  function handleSubmit() {
    if (!name || !message) return;
    sent = true;
    setTimeout(() => {
      sent = false;
      name = '';
      email = '';
      message = '';
    }, 3000);
  }

  const stats = [
    { label: 'Support Hours', value: '24/7', icon: Clock },
    { label: 'Response Time', value: '<24 hrs', icon: MessageSquare },
    { label: 'Languages', value: 'EN / தமிழ்', icon: Globe },
    { label: 'Support Channels', value: '3+', icon: Headphones }
  ];
</script>

<svelte:head>
  <title>{t('contact.title')} — Operator Desk</title>
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
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center gap-3 text-[#316342] mb-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#316342]/10">
              <MapPin class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-slate-900">{t('contact.headquarters')}</h3>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">
            TN Hub Citizen Platform,<br />
            BuildWhatMovesIndia Hackathon Hub,<br />
            Chennai, Tamil Nadu.
          </p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center gap-3 text-[#316342] mb-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#316342]/10">
              <Phone class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-slate-900">{t('contact.tollFree')}</h3>
          </div>
          <p class="text-sm text-slate-800 font-mono font-bold">1800-XXX-XXXX</p>
          <p class="text-[11px] text-slate-400 mt-1">Mon–Sat, 9 AM – 6 PM IST</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div class="flex items-center gap-3 text-[#316342] mb-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#316342]/10">
              <Mail class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-bold text-slate-900">{t('contact.emailSupport')}</h3>
          </div>
          <p class="text-sm text-slate-800 font-mono font-bold">support@tnhub.org</p>
          <p class="text-[11px] text-slate-400 mt-1">Average response within 24 hours</p>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-2">
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#316342]/10 text-[#316342]">
              <Send class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">{t('contact.sendMessage')}</h2>
              <p class="text-xs text-slate-500">Fill in the form and our team will respond promptly.</p>
            </div>
          </div>

          {#if sent}
            <div class="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#316342]/10 text-[#316342] mb-4">
                <CheckCircle2 class="h-8 w-8" />
              </div>
              <h3 class="text-lg font-bold text-slate-900">Message Sent!</h3>
              <p class="text-sm text-slate-500 mt-2 max-w-md">{t('contact.successMsg')}</p>
            </div>
          {:else}
            <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="contactName" class="block text-xs font-bold text-slate-700 mb-1.5">{t('contact.nameLabel')}</label>
                  <input id="contactName" type="text" bind:value={name} required placeholder="Meena Lakshmi" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#316342] focus:ring-2 focus:ring-[#316342]/10 outline-none transition" />
                </div>
                <div>
                  <label for="contactEmail" class="block text-xs font-bold text-slate-700 mb-1.5">{t('contact.emailLabel')}</label>
                  <input id="contactEmail" type="email" bind:value={email} placeholder="meena@example.com" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#316342] focus:ring-2 focus:ring-[#316342]/10 outline-none transition" />
                </div>
              </div>

              <div>
                <label for="contactMessage" class="block text-xs font-bold text-slate-700 mb-1.5">{t('contact.messageLabel')}</label>
                <textarea id="contactMessage" bind:value={message} required rows={5} placeholder="How can we help you?" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#316342] focus:ring-2 focus:ring-[#316342]/10 outline-none transition resize-none"></textarea>
              </div>

              <div class="flex justify-end">
                <button type="submit" class="flex items-center gap-2 rounded-2xl bg-[#316342] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#254b32] transition">
                  <Send class="h-4 w-4" /> {t('contact.sendBtn')}
                </button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
