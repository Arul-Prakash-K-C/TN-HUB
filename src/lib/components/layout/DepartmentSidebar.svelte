<script>

  import { page } from '$app/stores';
  import { LayoutDashboard, Inbox, Bell, User, Settings, LogOut, BarChart3, ShieldCheck, PhoneCall } from '@lucide/svelte';
  import { auth, currentUser } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { t } from '$lib/i18n';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';

let { isOpen = $bindable(false) } = $props();
let showLogoutModal = $state(false);
const user = $derived($currentUser);
function isActive(path) {
    if (path === '/department/dashboard' && $page.url.pathname === '/department/dashboard')
        return true;
    if (path !== '/department/dashboard' && $page.url.pathname.startsWith(path))
        return true;
    return false;
}
$effect(() => {
    if ($page.url.pathname) {
        isOpen = false;
    }
});
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-40 bg-background/70 backdrop-blur-xs transition-opacity md:hidden" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-6 border-r border-white/10 bg-[var(--color-sidebar-bg)] px-4 py-6 text-[var(--color-sidebar-text)] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/department/dashboard" class="flex w-full items-center justify-center px-2 py-1 hover:opacity-90 transition">
    <BrandLogo showWordmark={true} subtitle={user?.departmentName || 'Revenue Department'} sizeClass="w-full max-w-[236px] max-h-[84px]" wordmarkClass="text-sm text-[var(--color-sidebar-text)]" subtitleClass="text-[10px] text-[var(--color-sidebar-text-muted)]" />
  </a>

  <!-- Officer Department Badge Card -->
  {#if user}
    <div class="rounded-xl border border-white/20 bg-[var(--color-sidebar-card)] p-3 shadow-sm">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/25 text-xs font-bold text-[var(--color-sidebar-card-text)] shadow-sm">
          {user.name.charAt(0)}
        </div>
        <div class="overflow-hidden">
          <div class="truncate text-xs font-bold text-[var(--color-sidebar-card-text)]">{user.name}</div>
          <div class="truncate text-[10px] font-medium text-[var(--color-sidebar-card-muted)]">{user.role || 'DEPARTMENT_USER'}</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    <a 
      href="/department/dashboard" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/department/dashboard') ? 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
    >
      <LayoutDashboard class="h-4 w-4 shrink-0" />
      <span>{t('nav.dashboard')}</span>
    </a>

    <a 
      href="/department/applications" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/department/applications') ? 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
    >
      <Inbox class="h-4 w-4 shrink-0" />
      <span>Application Queue</span>
    </a>

    <a 
      href="/department/notifications" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/department/notifications') ? 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
    >
      <Bell class="h-4 w-4 shrink-0" />
      <span>{t('nav.notifications')}</span>
    </a>

    <a 
      href="/department/reports" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/department/reports') ? 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
    >
      <BarChart3 class="h-4 w-4 shrink-0" />
      <span>Reports</span>
    </a>
  </nav>

  <!-- Bottom Links -->
  <div class="flex flex-col gap-1 mt-auto">
    <a 
      href="/department/profile" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/department/profile') ? 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
    >
      <User class="h-4 w-4 shrink-0" />
      <span>Profile</span>
    </a>


    <a 
      href="/department/contact" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/department/contact') ? 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
    >
      <PhoneCall class="h-4 w-4 shrink-0" />
      <span>{t('footer.contact')}</span>
    </a>

  </div>



  <!-- Sign out -->
  <div class="border-t border-white/25 pt-4">
    <button 
      onclick={() => showLogoutModal = true}
      class="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-xs font-bold text-danger transition-all hover:bg-danger/10"
    >
      <LogOut class="h-4 w-4 shrink-0" />
      <span>{t('logout.officialBtn')}</span>
    </button>
  </div>
</aside>

<LogoutModal 
  bind:isOpen={showLogoutModal} 
  onConfirm={async () => {
    await auth.logout();
    window.location.href = '/';
  }} 
/>
