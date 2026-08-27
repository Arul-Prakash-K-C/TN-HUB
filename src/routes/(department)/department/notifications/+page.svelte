<script>

  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { tt } from '$lib/i18n';
  import { Bell, Shield, Building2, CheckCircle2, AlertTriangle, Info, Clock, Check } from '@lucide/svelte';

let { data } = $props();
const user = $derived($currentUser);
const guard = $derived(canAccessRoute(user, '/department/notifications'));
const t = $derived($tt);
let activeFilter = $state('ALL');
let notificationsList = $state([]);
$effect(() => {
    notificationsList = data.notifications;
});
const filteredNotifs = $derived(notificationsList.filter(n => {
    if (activeFilter === 'CRITICAL')
        return n.type === 'sla_warning';
    if (activeFilter === 'UNREAD')
        return !n.isRead;
    return true;
}));
async function markAllRead() {
    const response = await fetch('/api/notifications/read-all', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok)
        return;
    notificationsList = notificationsList.map(n => ({ ...n, isRead: true }));
}
async function markRead(id) {
    const response = await fetch(`/api/notifications/${id}`, { method: 'PATCH', credentials: 'same-origin' });
    if (!response.ok)
        return;
    notificationsList = notificationsList.map(n => n.id === id ? { ...n, isRead: true } : n);
}
</script>

<svelte:head>
  <title>Notifications — {user?.departmentName || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center bg-background p-6 text-text">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-vazhi-2">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">Access Restricted</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Top Green Banner Header -->
    <div class="public-banner py-6 px-6 sm:px-8 shadow-md">
      <div class="mx-auto max-w-7xl flex justify-between items-center">
        <div>
          <h1 class="text-xl font-black text-white">Department Notifications</h1>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="p-6 w-full max-w-4xl mx-auto space-y-6">
      <!-- Filter Bar -->
      <div class="flex items-center justify-between border-b border-border pb-4">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onclick={() => activeFilter = 'ALL'}
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {activeFilter === 'ALL' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-muted hover:bg-muted'}"
          >
            All Notifications ({notificationsList.length})
          </button>

          <button
            onclick={() => activeFilter = 'CRITICAL'}
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {activeFilter === 'CRITICAL' ? 'bg-danger-soft text-danger border border-danger/20' : 'bg-surface border border-border text-text-muted hover:bg-muted'}"
          >
            SLA Alerts
          </button>

          <button
            onclick={() => activeFilter = 'UNREAD'}
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap {activeFilter === 'UNREAD' ? 'bg-primary-soft text-primary-soft-text border border-primary/20' : 'bg-surface border border-border text-text-muted hover:bg-muted'}"
          >
            Unread Only
          </button>
        </div>

        <button 
          onclick={markAllRead}
          disabled={notificationsList.filter(n => !n.isRead).length === 0}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text text-xs font-bold hover:bg-muted transition shadow-2xs disabled:opacity-50"
        >
          <Check class="h-3.5 w-3.5 text-primary" />
          <span>Mark All Read</span>
        </button>
      </div>

      <!-- Notifications List -->
      <div class="bg-surface border border-border rounded-xl shadow-vazhi-1 divide-y divide-border overflow-hidden">
        {#if filteredNotifs.length === 0}
          <div class="p-8 text-center text-xs font-semibold text-text-muted">{t('notifications.empty')}</div>
        {:else}
          {#each filteredNotifs as notif}
          <div class="p-5 flex items-start gap-4 hover:bg-muted transition-colors {notif.isRead ? 'opacity-85' : 'bg-primary-soft/40'}">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 {notif.type === 'sla_warning' ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary-soft-text'}">
              {#if notif.type === 'sla_warning'}
                <AlertTriangle class="h-4 w-4" />
              {:else}
                <Bell class="h-4 w-4" />
              {/if}
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-xs font-bold text-text">{notif.title}</h3>
                <span class="text-[10px] font-mono text-text-faint shrink-0">{new Date(notif.createdAt).toLocaleString()}</span>
              </div>
              <p class="text-xs text-text-muted mt-1 leading-relaxed">{notif.message}</p>
            </div>

            {#if !notif.isRead}
              <button 
                onclick={() => markRead(notif.id)}
                class="text-[10px] font-bold px-2 py-1 rounded border border-border hover:bg-muted text-text-muted"
              >
                Done
              </button>
            {/if}
          </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
