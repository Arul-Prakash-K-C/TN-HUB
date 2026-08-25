<script lang="ts">
  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { tt } from '$lib/i18n';
  import type { Notification } from '$lib/types';
  import { Bell, Shield, Building2, CheckCircle2, AlertTriangle, Info, Clock, Check } from '@lucide/svelte';

  let { data } = $props<{ data: { notifications: Notification[] } }>();

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/department/notifications'));
  const t = $derived($tt);

  let activeFilter = $state<'ALL' | 'CRITICAL' | 'UNREAD'>('ALL');
  let notificationsList = $state<Notification[]>([]);

  $effect(() => {
    notificationsList = data.notifications;
  });

  const filteredNotifs = $derived(
    notificationsList.filter(n => {
      if (activeFilter === 'CRITICAL') return n.type === 'sla_warning';
      if (activeFilter === 'UNREAD') return !n.isRead;
      return true;
    })
  );

  async function markAllRead() {
    const response = await fetch('/api/notifications/read-all', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok) return;
    notificationsList = notificationsList.map(n => ({ ...n, isRead: true }));
  }

  async function markRead(id: string) {
    const response = await fetch(`/api/notifications/${id}`, { method: 'PATCH', credentials: 'same-origin' });
    if (!response.ok) return;
    notificationsList = notificationsList.map(n => n.id === id ? { ...n, isRead: true } : n);
  }
</script>

<svelte:head>
  <title>Notifications — {user?.departmentName || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-[#f7f9fb]">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-slate-900">Access Restricted</h2>
      <p class="mt-2 text-xs text-slate-500">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-[#f7f9fb] min-h-screen pb-20 text-slate-900 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold text-slate-900 tracking-tight">Department Notifications</h1>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBEE] text-[#C62828]">
          {notificationsList.filter(n => !n.isRead).length} Unread
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button 
          onclick={markAllRead}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
        >
          <Check class="h-3.5 w-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="p-6 w-full max-w-4xl mx-auto space-y-6">
      <!-- Filter Bar -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onclick={() => activeFilter = 'ALL'}
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition {activeFilter === 'ALL' ? 'bg-[#062206] text-[#9df79e]' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}"
        >
          All Notifications ({notificationsList.length})
        </button>

        <button
          onclick={() => activeFilter = 'CRITICAL'}
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition {activeFilter === 'CRITICAL' ? 'bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/30' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}"
        >
          SLA Alerts
        </button>

        <button
          onclick={() => activeFilter = 'UNREAD'}
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition {activeFilter === 'UNREAD' ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#1565C0]/30' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}"
        >
          Unread Only
        </button>
      </div>

      <!-- Notifications List -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {#if filteredNotifs.length === 0}
          <div class="p-8 text-center text-xs font-semibold text-slate-500">{t('notifications.empty')}</div>
        {:else}
          {#each filteredNotifs as notif}
          <div class="p-5 flex items-start gap-4 hover:bg-slate-50/80 transition-colors {notif.isRead ? 'opacity-85' : 'bg-[#E3F2FD]/10'}">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 {notif.type === 'sla_warning' ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#E3F2FD] text-[#1565C0]'}">
              {#if notif.type === 'sla_warning'}
                <AlertTriangle class="h-4 w-4" />
              {:else}
                <Bell class="h-4 w-4" />
              {/if}
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between gap-4">
                <h3 class="text-xs font-bold text-slate-900">{notif.title}</h3>
                <span class="text-[10px] font-mono text-slate-400 shrink-0">{new Date(notif.createdAt).toLocaleString()}</span>
              </div>
              <p class="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
            </div>

            {#if !notif.isRead}
              <button 
                onclick={() => markRead(notif.id)}
                class="text-[10px] font-bold px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600"
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
