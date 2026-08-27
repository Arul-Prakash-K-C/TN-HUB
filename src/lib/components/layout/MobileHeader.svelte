<script>

  import { Menu, Bell } from '@lucide/svelte';
  import { auth, isAuthenticated, currentUser } from '$lib/stores/auth';
  import { t } from '$lib/i18n';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';

const authenticated = $derived($isAuthenticated);
const user = $derived($currentUser);
let { isOpen = $bindable(false), portal = 'citizen' } = $props();
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
        .then((response) => response.ok ? response.json() : null)
        .then((body) => {
        if (!cancelled)
            unreadCount = typeof body?.count === 'number' ? body.count : 0;
    })
        .catch(() => {
        if (!cancelled)
            unreadCount = 0;
    });
    return () => { cancelled = true; };
});
</script>

<header class="sticky top-0 z-30 flex w-full items-center justify-between border-b px-4 py-3.5 text-white shadow-xs md:hidden {portal === 'operator' || portal === 'admin' || isDept ? 'border-border bg-[var(--color-sidebar-bg)]' : 'border-border bg-[var(--color-sidebar-bg)]'}">
  <div class="flex items-center gap-3">
    <button class="rounded-lg p-1.5 text-white transition-colors hover:bg-white/10" onclick={() => isOpen = true} aria-label="Open navigation menu">
      <Menu class="h-5 w-5" />
    </button>
    <a href={isDept ? "/department/dashboard" : portal === 'operator' ? "/operator/dashboard" : portal === 'admin' ? "/admin" : "/"} class="flex items-center gap-2.5">
      <BrandLogo sizeClass="h-7 w-7" />
      <div>
        <div class="flex items-center gap-1.5">
          <h1 class="text-xs font-black tracking-tight uppercase leading-none">{isDept ? (user?.departmentName || 'Revenue Dept') : 'TN HUB'}</h1>
        </div>
        <p class="mt-0.5 text-[9px] font-bold leading-none tracking-wider text-primary/90">{isDept ? 'Officer Portal' : portal === 'operator' ? t('operator.portal') : portal === 'admin' ? t('admin.portal') : 'Citizen Platform'}</p>
      </div>
    </a>
  </div>

  <div class="flex items-center gap-2">
    {#if authenticated && user}
      <a href={isDept ? "/department/notifications" : portal === 'citizen' ? "/notifications" : "#"} class="relative text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors">
        <Bell class="h-4 w-4" />
        {#if unreadCount > 0}
          <span class="absolute right-0.5 top-0.5 flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-xs"></span>
        {/if}
      </a>
      <a href={isDept ? "/department/profile" : portal === 'citizen' ? "/profile" : "#"} class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary text-xs font-bold text-white shadow-sm">
        {user.name.charAt(0)}
      </a>
    {:else}
      <a href="/login" class="rounded-lg bg-surface px-3 py-1 text-xs font-bold text-text shadow-xs">
        {t('nav.login')}
      </a>
    {/if}
  </div>
</header>
