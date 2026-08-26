<script lang="ts">
  import { page } from '$app/stores';
  import { LayoutDashboard, Grid, LogOut, AlertCircle, User, Settings, HelpCircle, FileText, MessageSquare } from '@lucide/svelte';
  import { auth, isAuthenticated } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { t } from '$lib/i18n';

  const authenticated = $derived($isAuthenticated);
  
  function isActive(path: string) {
    const currentPath = $page.url.pathname as string;
    if (path === '/operator/dashboard' && currentPath === '/operator/dashboard') return true;
    if (path !== '/operator' && currentPath.startsWith(path)) return true;
    return false;
  }

  let { isOpen = $bindable(false) } = $props();
  let showLogoutModal = $state(false);

  $effect(() => {
    if ($page.url.pathname) {
      isOpen = false;
    }
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-30 bg-background/70 backdrop-blur-xs transition-opacity md:hidden" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-6 border-r border-border bg-[var(--color-sidebar-bg)] px-4 py-6 text-text transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/operator/dashboard" class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-md">
      TN
    </div>
    <div class="flex flex-col overflow-hidden">
      <span class="text-sm font-extrabold leading-tight tracking-tight text-text">TN Hub</span>
      <span class="truncate text-[10px] font-bold uppercase tracking-wider text-primary-soft">
        {t('operator.portal')}
      </span>
    </div>
  </a>

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    <a 
      href="/operator/dashboard" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/dashboard') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <LayoutDashboard class="h-4 w-4 shrink-0" />
      <span>{t('operator.dashboard')}</span>
    </a>

    <a 
      href="/operator/services" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/services') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <Grid class="h-4 w-4 shrink-0" />
      <span>{t('operator.serviceCatalog')}</span>
    </a>

    <a 
      href="/operator/applications" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/applications') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <FileText class="h-4 w-4 shrink-0" />
      <span>{t('operator.applications')}</span>
    </a>

    <a 
      href="/operator/grievance" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/grievance') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <AlertCircle class="h-4 w-4 shrink-0" />
      <span>Grievance Desk</span>
    </a>

    <a 
      href="/operator/ai-chat" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/ai-chat') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <MessageSquare class="h-4 w-4 shrink-0" />
      <span>Thozhan AI</span>
    </a>

  </nav>

  <!-- Bottom Links -->
  <div class="flex flex-col gap-1 border-t border-border pt-4">
    <a 
      href="/operator/profile" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/profile') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <User class="h-4 w-4 shrink-0" />
      <span>{t('nav.profile')}</span>
    </a>

    <a 
      href="/operator/contact" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/contact') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <HelpCircle class="h-4 w-4 shrink-0" />
      <span>Contact Support</span>
    </a>

    <a 
      href="/operator/help" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/operator/help') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-text-muted hover:bg-primary/20 hover:text-text'}"
    >
      <HelpCircle class="h-4 w-4 shrink-0" />
      <span>Help Desk</span>
    </a>



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
