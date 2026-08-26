<script lang="ts">
  import { page } from '$app/stores';
  import { LayoutDashboard, UserCheck, MessageCircleQuestion, Settings, UserCircle, LogOut } from '@lucide/svelte';
  import { auth, isAuthenticated } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { t } from '$lib/i18n';

  const authenticated = $derived($isAuthenticated);
  
  function isActive(path: string) {
    const currentPath = $page.url.pathname as string;
    if (path === '/admin' && currentPath === '/admin') return true;
    if (path !== '/admin' && currentPath.startsWith(path)) return true;
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
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', labelTA: 'டாஷ்போர்டு' },
    { href: '/admin/approvals', icon: UserCheck, label: 'Registration Approvals', labelTA: 'பதிவு ஒப்புதல்கள்' },
    { href: '/admin/helpdesk', icon: MessageCircleQuestion, label: 'Help Desk & Inquiries', labelTA: 'உதவி மையம்' },
  ];

  const bottomLinks = [
    { href: '/admin/profile', icon: UserCircle, label: 'Profile', labelTA: 'சுயவிவரம்' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', labelTA: 'அமைப்புகள்' },
  ];
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-30 bg-background/70 backdrop-blur-xs transition-opacity md:hidden" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-6 border-r border-border bg-[var(--color-sidebar-bg)] px-4 py-6 text-text transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/admin" class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-md">
      TN
    </div>
    <div class="flex flex-col overflow-hidden">
      <span class="text-sm font-extrabold leading-tight tracking-tight text-text">TN Hub</span>
      <span class="truncate text-[10px] font-bold uppercase tracking-wider text-primary-soft">
        {t('admin.portal')}
      </span>
    </div>
  </a>

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    {#each mainLinks as link}
      <a 
        href={link.href} 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive(link.href) ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
      >
        <link.icon class="h-4 w-4 shrink-0" />
        <span>{link.label}</span>
      </a>
    {/each}
  </nav>

  <div class="mt-auto flex flex-col gap-1 border-t border-border pt-4">
    {#each bottomLinks as link}
      <a 
        href={link.href} 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive(link.href) ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
      >
        <link.icon class="h-4 w-4 shrink-0" />
        <span>{link.label}</span>
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
