<script>
  import { tt, locale } from '$lib/i18n';
  import { Bell, Check, ArrowRight, AlertTriangle } from '@lucide/svelte';
  import { markAllNotificationsReadLocally, markNotificationReadLocally, setNotificationsForUser } from '$lib/stores/notifications';
  import { currentUser } from '$lib/stores/auth';

  let { data } = $props();
  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);

  let activeFilter = $state('ALL');
  let notificationsList = $state([]);

  $effect(() => {
    notificationsList = data.notifications;
    setNotificationsForUser(user, data.notifications);
  });

  const filteredNotifs = $derived(notificationsList.filter(n => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    return true;
  }));

  async function markAllRead() {
    const response = await fetch('/api/notifications/read-all', {
      method: 'POST',
      credentials: 'same-origin'
    });
    if (!response.ok) return;
    notificationsList = notificationsList.map(n => ({ ...n, isRead: true }));
    markAllNotificationsReadLocally();
  }

  async function markSingleRead(id) {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      credentials: 'same-origin'
    });
    if (!response.ok) return;
    notificationsList = notificationsList.map(n => n.id === id ? { ...n, isRead: true } : n);
    markNotificationReadLocally(id);
  }
</script>

<svelte:head>
  <title>{t('notifications.title')} — TN Kuviyam</title>
</svelte:head>

<div class="bg-background min-h-screen pb-20 text-text font-sans">
  <!-- Top Green Banner Header -->
  <div class="public-banner py-6 px-6 sm:px-8 shadow-md">
    <div class="mx-auto max-w-4xl flex justify-between items-center">
      <div>
        <h1 class="text-xl font-black text-white">{t('notifications.title')}</h1>
        <p class="text-xs text-green-100 mt-0.5">{t('notifications.subtitle')}</p>
      </div>
    </div>
  </div>

  <!-- Main Content Container -->
  <div class="p-6 w-full max-w-4xl mx-auto space-y-6">
    <!-- Filter & Action Bar -->
    <div class="flex items-center justify-between border-b border-border pb-4">
      <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button
          onclick={() => activeFilter = 'ALL'}
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap {activeFilter === 'ALL' ? 'bg-primary text-white shadow-xs' : 'bg-surface border border-border text-text-muted hover:bg-muted'}"
        >
          {t('notifications.all')} ({notificationsList.length})
        </button>

        <button
          onclick={() => activeFilter = 'UNREAD'}
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap {activeFilter === 'UNREAD' ? 'bg-primary-soft text-primary-soft-text border border-primary/20 shadow-xs' : 'bg-surface border border-border text-text-muted hover:bg-muted'}"
        >
          {t('notifications.unreadOnly')} ({notificationsList.filter(n => !n.isRead).length})
        </button>
      </div>

      <button 
        onclick={markAllRead}
        disabled={notificationsList.filter(n => !n.isRead).length === 0}
        class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-surface text-text text-xs font-bold hover:bg-muted transition shadow-xs disabled:opacity-50"
      >
        <Check class="h-3.5 w-3.5 text-primary" />
        <span>{t('notifications.markAllRead')}</span>
      </button>
    </div>

    <!-- Notifications List -->
    <div class="bg-surface border border-border rounded-2xl shadow-xs divide-y divide-border overflow-hidden">
      {#if filteredNotifs.length === 0}
        <div class="p-12 text-center">
          <Bell class="mx-auto h-12 w-12 text-text-faint" />
          <h3 class="mt-4 text-base font-bold text-text">{t('notifications.empty')}</h3>
          <p class="mt-1 text-xs text-text-muted">{t('notifications.emptySubtitle')}</p>
        </div>
      {:else}
        {#each filteredNotifs as notif}
          <div class="p-5 flex items-start gap-4 hover:bg-muted transition-colors {notif.isRead ? 'opacity-85' : 'bg-primary-soft/30'}">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 {notif.type === 'sla_warning' ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary-soft-text'}">
              {#if notif.type === 'sla_warning'}
                <AlertTriangle class="h-5 w-5" />
              {:else}
                <Bell class="h-5 w-5" />
              {/if}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold text-text">
                    {currentLocale === 'ta' ? (notif.titleTA || notif.title) : notif.title}
                  </h3>
                  {#if !notif.isRead}
                    <span class="h-2 w-2 rounded-full bg-primary shrink-0"></span>
                  {/if}
                </div>
                <span class="text-[10px] font-mono text-text-faint shrink-0">{new Date(notif.createdAt).toLocaleString()}</span>
              </div>
              <p class="text-xs text-text-muted mt-1 leading-relaxed">
                {currentLocale === 'ta' ? (notif.messageTA || notif.message) : notif.message}
              </p>

              {#if notif.actionUrl}
                <div class="mt-3">
                  <a
                    href={notif.actionUrl}
                    onclick={() => markSingleRead(notif.id)}
                    class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>{t('notifications.viewDetails')}</span>
                    <ArrowRight class="h-3.5 w-3.5" />
                  </a>
                </div>
              {/if}
            </div>

            {#if !notif.isRead}
              <button 
                onclick={() => markSingleRead(notif.id)}
                class="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-text-muted transition shrink-0"
              >
                {t('ui.done')}
              </button>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
