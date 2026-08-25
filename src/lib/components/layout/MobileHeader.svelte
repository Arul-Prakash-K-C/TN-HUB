<script lang="ts">
  import { Menu, Bell, User } from '@lucide/svelte';
  import { auth, isAuthenticated, currentUser } from '$lib/stores/auth';
  import { t } from '$lib/i18n';

  const authenticated = $derived($isAuthenticated);
  const user = $derived($currentUser);
  
  let { isOpen = $bindable(false), portal = 'citizen' } = $props<{ isOpen?: boolean, portal?: 'citizen' | 'department' | 'operator' | 'admin' }>();
  
  const isDept = $derived(portal === 'department');
  let unreadCount = $state(0);

  $effect(() => {
    const activeUser = user;
    if (!activeUser) {
      unreadCount = 0;
      return;
    }

    let cancelled = false;
    void fetch('/api/notifications/unread-count', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() as Promise<{ count?: unknown }> : null)
      .then((body) => {
        if (!cancelled) unreadCount = typeof body?.count === 'number' ? body.count : 0;
      })
      .catch(() => {
        if (!cancelled) unreadCount = 0;
      });

    return () => { cancelled = true; };
  });
</script>

<header class="flex justify-between items-center px-4 py-3.5 w-full {isDept ? 'bg-[#062206] text-white border-b border-[#143A14]' : 'bg-primary-950 text-white border-b border-primary-900'} md:hidden sticky top-0 z-30 shadow-xs">
  <div class="flex items-center gap-3">
    <button class="text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors" onclick={() => isOpen = true} aria-label="Open navigation menu">
      <Menu class="h-5 w-5" />
    </button>
    <a href={isDept ? "/department/dashboard" : portal === 'operator' ? "/operator/dashboard" : portal === 'admin' ? "/admin" : "/"} class="flex items-center gap-2.5">
      <div class="w-7 h-7 {isDept ? 'bg-[#82da85] text-[#062206]' : 'bg-white/10 text-white'} rounded-full flex items-center justify-center font-black text-xs shadow-xs">TN</div>
      <div>
        <h1 class="text-xs font-black tracking-tight uppercase leading-none">{isDept ? (user?.departmentName || 'Revenue Dept') : 'SYMPHO CENTER'}</h1>
        <p class="text-[9px] text-[#9df79e] font-bold tracking-wider leading-none mt-0.5">{isDept ? 'Officer Portal' : portal === 'operator' ? t('operator.portal') : portal === 'admin' ? t('admin.portal') : 'Citizen Platform'}</p>
      </div>
    </a>
  </div>

  <div class="flex items-center gap-3">
    {#if authenticated && user}
      <a href={isDept ? "/department/notifications" : portal === 'citizen' ? "/notifications" : "#"} class="relative text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors">
        <Bell class="h-4 w-4" />
        {#if unreadCount > 0}
          <span class="absolute right-0.5 top-0.5 flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-xs"></span>
        {/if}
      </a>
      <a href={isDept ? "/department/profile" : portal === 'citizen' ? "/profile" : "#"} class="w-7 h-7 rounded-full bg-[#9df79e]/20 border border-[#9df79e]/40 text-[#9df79e] flex items-center justify-center font-bold text-xs">
        {user.name.charAt(0)}
      </a>
    {:else}
      <a href="/login" class="text-xs font-bold text-slate-900 bg-[#82da85] px-3 py-1 rounded-lg shadow-xs">
        {t('nav.login')}
      </a>
    {/if}
  </div>
</header>
