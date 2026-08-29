<script>
  import { page } from '$app/stores';
  import { LayoutDashboard, UserCheck, MessageCircleQuestion, UserCircle, LogOut } from '@lucide/svelte';
  import { auth, isAuthenticated } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { tt } from '$lib/i18n';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';

  const authenticated = $derived($isAuthenticated);
  const t = $derived($tt);

  function isActive(path) {
    const currentPath = $page.url.pathname;
    if (path === '/admin' && currentPath === '/admin')
        return true;
    if (path !== '/admin' && currentPath.startsWith(path))
        return true;
    return false;
  }

  let { isOpen = $bindable(false) } = $props();
  let showLogoutModal = $state(false);

  $effect(() => {
    if ($page.url.pathname) {
        isOpen = false;
    }
  });

  const mainLinks = [
    { href: '/admin', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { href: '/admin/approvals', icon: UserCheck, labelKey: 'admin.registration.title' },
    { href: '/admin/helpdesk', icon: MessageCircleQuestion, labelKey: 'admin.helpdesk.nav' },
  ];
  const bottomLinks = [
    { href: '/admin/profile', icon: UserCircle, labelKey: 'nav.profile' },
  ];
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-30 bg-background/70 backdrop-blur-xs transition-opacity md:hidden" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-5 border-r border-white/10 bg-[var(--color-sidebar-bg)] px-4 py-5 text-[var(--color-sidebar-text)] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/admin" class="flex w-full items-center justify-center px-1 py-1 hover:opacity-90 transition">
    <BrandLogo showWordmark={true} subtitle={t('admin.portal')} sizeClass="h-[86px] w-full max-w-[236px]" wordmarkClass="text-sm text-[var(--color-sidebar-text)]" subtitleOffsetClass="-mt-2" subtitleClass="text-[10px] text-[var(--color-sidebar-text-muted)]" />
  </a>

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    {#each mainLinks as link}
      <a 
        href={link.href} 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive(link.href) ? 'border-l-4 border-white/30 bg-primary text-white font-bold' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
      >
        <link.icon class="h-4 w-4 shrink-0" />
        <span>{t(link.labelKey)}</span>
      </a>
    {/each}
  </nav>

    <div class="mt-auto flex flex-col gap-1 border-t border-white/20 pt-4">
    {#each bottomLinks as link}
      <a 
        href={link.href} 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive(link.href) ? 'border-l-4 border-white/30 bg-primary text-white font-bold' : 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]'}"
      >
        <link.icon class="h-4 w-4 shrink-0" />
        <span>{t(link.labelKey)}</span>
      </a>
    {/each}



    <button 
      onclick={() => showLogoutModal = true}
      class="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-xs font-bold text-danger transition-all hover:bg-danger/10"
    >
      <LogOut class="h-4 w-4 shrink-0" />
      <span>{t('logout.confirmBtn')}</span>
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
