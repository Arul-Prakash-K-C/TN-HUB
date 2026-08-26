<script lang="ts">
  import { page } from '$app/stores';
  import { LayoutDashboard, Grid, ListTodo, FolderLock, AlertTriangle, Info, Settings, HelpCircle, LogOut, Sparkles, PhoneCall } from '@lucide/svelte';
  import { auth, isAuthenticated, currentUser } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { tt } from '$lib/i18n';

  const t = $derived($tt);
  const authenticated = $derived($isAuthenticated);
  const user = $derived($currentUser);
  
  function isActive(path: string) {
    if (path === '/dashboard' && $page.url.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && $page.url.pathname.startsWith(path)) return true;
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

<aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-6 border-r border-border bg-[var(--color-sidebar-bg)] px-4 py-6 text-white transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href={authenticated ? '/dashboard' : '/'} class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-md">
      TN
    </div>
    <div class="flex flex-col overflow-hidden">
      <span class="font-extrabold text-sm tracking-tight text-white leading-tight">TN Hub</span>
      <span class="truncate text-[10px] font-bold uppercase tracking-wider text-primary/90">
        Citizen Portal
      </span>
    </div>
  </a>

  <!-- Citizen User Badge Card -->
  {#if authenticated && user}
    <div class="rounded-xl border border-border bg-white/5 p-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-xs font-bold text-primary">
          {user.name.charAt(0)}
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-bold text-white truncate">{user.name}</div>
          <div class="truncate text-[10px] font-medium text-white/65">Citizen Account</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    {#if authenticated}
      <a 
        href="/dashboard" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/dashboard') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        <span>{t('nav.dashboard')}</span>
      </a>

      <a 
        href="/services" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/services') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <Grid class="h-4 w-4 shrink-0" />
        <span>{t('nav.services')}</span>
      </a>

      <a 
        href="/applications" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/applications') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <ListTodo class="h-4 w-4 shrink-0" />
        <span>{t('nav.track')}</span>
      </a>

      <a 
        href="/documents" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/documents') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <FolderLock class="h-4 w-4 shrink-0" />
        <span>{t('nav.documents')}</span>
      </a>

      <a 
        href="/complaints" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/complaints') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <AlertTriangle class="h-4 w-4 shrink-0" />
        <span>{t('nav.complaints')}</span>
      </a>
    {:else}
      <a 
        href="/services" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/services') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        <span>{t('nav.services')}</span>
      </a>
    {/if}

    <!-- Thozhan AI Chat -->
    <a 
      href="/chatbot" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/chatbot') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
    >
      <Sparkles class="h-4 w-4 shrink-0 text-primary/90" />
      <span>{t('nav.chatbot')}</span>
    </a>
  </nav>

  <div class="mt-auto flex flex-col gap-1 border-t border-border pt-4">
    {#if authenticated}
      <a 
        href="/profile" 
        class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/profile') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
      >
        <Settings class="h-4 w-4 shrink-0" />
        <span>{t('nav.profile')}</span>
      </a>
    {/if}

    <a 
      href="/about" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/about') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
    >
      <Info class="h-4 w-4 shrink-0" />
      <span>{t('nav.about')}</span>
    </a>

    <a 
      href="/contact" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/contact') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
    >
      <PhoneCall class="h-4 w-4 shrink-0" />
      <span>{t('nav.contact')}</span>
    </a>

    <a 
      href="/help" 
      class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all {isActive('/help') ? 'border-l-4 border-primary bg-primary text-white font-bold' : 'text-white/70 hover:bg-primary/20 hover:text-white'}"
    >
      <HelpCircle class="h-4 w-4 shrink-0" />
      <span>{t('nav.help')}</span>
    </a>



    {#if authenticated}
      <button 
        onclick={() => showLogoutModal = true}
        class="flex items-center gap-3 px-3.5 py-2.5 text-rose-300 font-bold text-xs rounded-lg hover:bg-rose-950/40 transition-all w-full text-left"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        <span>{t('logout.confirmBtn')}</span>
      </button>
    {:else}
      <a 
        href="/login"
        class="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary-hover"
      >
        {t('nav.login')}
      </a>
    {/if}
  </div>
</aside>

<LogoutModal 
  bind:isOpen={showLogoutModal} 
  onConfirm={async () => {
    await auth.logout();
    window.location.href = '/';
  }} 
/>
