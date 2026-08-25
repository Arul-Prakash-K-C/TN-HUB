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
  <div class="fixed inset-0 bg-[#071A28]/60 backdrop-blur-xs z-30 md:hidden transition-opacity" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="flex flex-col py-6 px-4 gap-6 h-screen w-64 fixed left-0 top-0 z-40 bg-[#062206] text-white border-r border-[#143A14] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href={authenticated ? '/dashboard' : '/'} class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <div class="w-10 h-10 rounded-full bg-[#82da85] text-[#062206] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
      TN
    </div>
    <div class="flex flex-col overflow-hidden">
      <span class="font-extrabold text-sm tracking-tight text-white leading-tight">TN Hub</span>
      <span class="text-[10px] font-bold text-[#9df79e] uppercase tracking-wider truncate">
        Citizen Portal
      </span>
    </div>
  </a>

  <!-- Citizen User Badge Card -->
  {#if authenticated && user}
    <div class="rounded-xl border border-[#143A14] bg-[#0c310c]/80 p-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-[#9df79e]/20 border border-[#9df79e]/30 text-[#9df79e] font-bold flex items-center justify-center text-xs shrink-0">
          {user.name.charAt(0)}
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-bold text-white truncate">{user.name}</div>
          <div class="text-[10px] text-slate-300 font-medium truncate">Citizen Account</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    {#if authenticated}
      <a 
        href="/dashboard" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/dashboard') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        <span>{t('nav.dashboard')}</span>
      </a>

      <a 
        href="/services" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/services') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <Grid class="h-4 w-4 shrink-0" />
        <span>{t('nav.services')}</span>
      </a>

      <a 
        href="/applications" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/applications') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <ListTodo class="h-4 w-4 shrink-0" />
        <span>{t('nav.track')}</span>
      </a>

      <a 
        href="/documents" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/documents') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <FolderLock class="h-4 w-4 shrink-0" />
        <span>{t('nav.documents')}</span>
      </a>

      <a 
        href="/complaints" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/complaints') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <AlertTriangle class="h-4 w-4 shrink-0" />
        <span>{t('nav.complaints')}</span>
      </a>
    {:else}
      <a 
        href="/services" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/services') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        <span>{t('nav.services')}</span>
      </a>
    {/if}

    <!-- Thozhan AI Chat -->
    <a 
      href="/chatbot" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/chatbot') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <Sparkles class="h-4 w-4 shrink-0 text-emerald-400" />
      <span>{t('nav.chatbot')}</span>
    </a>
  </nav>

  <div class="mt-auto flex flex-col gap-1 border-t border-[#143A14] pt-4">
    {#if authenticated}
      <a 
        href="/profile" 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/profile') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <Settings class="h-4 w-4 shrink-0" />
        <span>{t('nav.profile')}</span>
      </a>
    {/if}

    <a 
      href="/about" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/about') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <Info class="h-4 w-4 shrink-0" />
      <span>{t('nav.about')}</span>
    </a>

    <a 
      href="/contact" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/contact') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <PhoneCall class="h-4 w-4 shrink-0" />
      <span>{t('nav.contact')}</span>
    </a>

    <a 
      href="/help" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/help') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
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
        class="flex items-center justify-center gap-2 mt-2 px-3 py-2 bg-[#82da85] text-[#062206] font-bold rounded-lg hover:bg-[#9df79e] transition-all text-xs shadow-xs"
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
