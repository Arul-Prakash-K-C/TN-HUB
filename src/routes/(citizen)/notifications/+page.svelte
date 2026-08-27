<script>

  import { tt, locale } from '$lib/i18n';
  import { Bell, CheckCircle, Check, ArrowRight } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
let notificationsList = $state([]);
$effect(() => {
    notificationsList = data.notifications;
});
async function markAllRead() {
    const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'same-origin'
    });
    if (!response.ok)
        return;
    notificationsList = notificationsList.map(n => ({ ...n, isRead: true }));
}
async function markSingleRead(id) {
    const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        credentials: 'same-origin'
    });
    if (!response.ok)
        return;
    notificationsList = notificationsList.map(n => n.id === id ? { ...n, isRead: true } : n);
}
</script>

<svelte:head>
  <title>{t('notifications.title')} — TN Hub</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-12">
  <!-- Page Header (Compact & Clean like Dept Portal) -->
  <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
    <div class="mx-auto flex max-w-4xl items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{t('notifications.title')}</h1>
        <p class="text-xs font-medium text-slate-500 mt-0.5">{t('notifications.subtitle')}</p>
      </div>

      <button
        onclick={markAllRead}
        class="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50"
      >
        {t('notifications.markAllRead')}
      </button>
    </div>
  </div>

  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    {#if notificationsList.length === 0}
      <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <Bell class="mx-auto h-12 w-12 text-slate-300" />
        <h3 class="mt-4 text-base font-bold text-slate-900">{t('notifications.empty')}</h3>
      </div>
    {:else}
      <div class="space-y-3 stagger-children">
        {#each notificationsList as notif}
          <div
            class="flex items-start justify-between rounded-2xl border p-5 transition shadow-sm
            {notif.isRead ? 'border-slate-200 bg-white' : 'border-primary-500/30 bg-primary-500/5'}"
          >
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
                <Bell class="h-5 w-5" />
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">
                    {currentLocale === 'ta' ? notif.titleTA : notif.title}
                  </h3>
                  {#if !notif.isRead}
                    <span class="h-2 w-2 rounded-full bg-primary-500"></span>
                  {/if}
                </div>

                <p class="mt-1 text-xs text-slate-500 leading-relaxed">
                  {currentLocale === 'ta' ? notif.messageTA : notif.message}
                </p>

                <div class="mt-2 text-[11px] text-slate-400">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              {#if notif.actionUrl}
                <a
                  href={notif.actionUrl}
                  onclick={() => markSingleRead(notif.id)}
                  class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"
                >
                  View
                  <ArrowRight class="h-3 w-3" />
                </a>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
