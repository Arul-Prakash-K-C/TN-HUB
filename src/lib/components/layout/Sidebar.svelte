<script>

  import { page } from '$app/stores';
  import { LayoutDashboard, Grid, ListTodo, FolderLock, AlertTriangle, Info, Settings, HelpCircle, LogOut, Sparkles, PhoneCall } from '@lucide/svelte';
  import { auth, isAuthenticated, currentUser } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';
  import { tt } from '$lib/i18n';

const t = $derived($tt);
const authenticated = $derived($isAuthenticated);
const user = $derived($currentUser);
const navItemClass = 'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all';
const inactiveNavClass = 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]';
const activeNavClass = 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm';
function isActive(path) {
    if (path === '/dashboard' && $page.url.pathname === '/dashboard')
        return true;
    if (path !== '/dashboard' && $page.url.pathname.startsWith(path))
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
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-30 bg-background/70 backdrop-blur-xs transition-opacity md:hidden" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-6 border-r border-white/10 bg-[var(--color-sidebar-bg)] px-4 py-6 text-[var(--color-sidebar-text)] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href={authenticated ? '/dashboard' : '/'} class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <BrandLogo showWordmark={true} subtitle="Citizen Portal" sizeClass="h-10 w-10" wordmarkClass="text-sm text-[var(--color-sidebar-text)]" subtitleClass="text-[10px] text-[var(--color-sidebar-text-muted)]" />
  </a>

  <!-- Citizen User Badge Card -->
  {#if authenticated && user}
    <div class="rounded-xl border border-white/15 bg-[var(--color-sidebar-card)] p-3 shadow-sm">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/25 text-xs font-bold text-[var(--color-sidebar-card-text)]">
          {user.name.charAt(0)}
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-bold text-[var(--color-sidebar-card-text)] truncate">{user.name}</div>
          <div class="truncate text-[10px] font-medium text-[var(--color-sidebar-card-muted)]">Citizen Account</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    {#if authenticated}
      <a 
        href="/dashboard" 
        class="{navItemClass} {isActive('/dashboard') ? activeNavClass : inactiveNavClass}"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        <span>{t('nav.dashboard')}</span>
      </a>

      <a 
        href="/services" 
        class="{navItemClass} {isActive('/services') ? activeNavClass : inactiveNavClass}"
      >
        <Grid class="h-4 w-4 shrink-0" />
        <span>{t('nav.services')}</span>
      </a>

      <a 
        href="/applications" 
        class="{navItemClass} {isActive('/applications') ? activeNavClass : inactiveNavClass}"
      >
        <ListTodo class="h-4 w-4 shrink-0" />
        <span>{t('nav.track')}</span>
      </a>

      <a 
        href="/documents" 
        class="{navItemClass} {isActive('/documents') ? activeNavClass : inactiveNavClass}"
      >
        <FolderLock class="h-4 w-4 shrink-0" />
        <span>{t('nav.documents')}</span>
      </a>

      <a 
        href="/complaints" 
        class="{navItemClass} {isActive('/complaints') ? activeNavClass : inactiveNavClass}"
      >
        <AlertTriangle class="h-4 w-4 shrink-0" />
        <span>{t('nav.complaints')}</span>
      </a>
    {:else}
      <a 
        href="/services" 
        class="{navItemClass} {isActive('/services') ? activeNavClass : inactiveNavClass}"
      >
        <LayoutDashboard class="h-4 w-4 shrink-0" />
        <span>{t('nav.services')}</span>
      </a>
    {/if}

    <!-- Thozhan AI Chat -->
    <a 
      href="/chatbot" 
      class="{navItemClass} {isActive('/chatbot') ? activeNavClass : inactiveNavClass}"
    >
      <Sparkles class="h-4 w-4 shrink-0" />
      <span>{t('nav.chatbot')}</span>
    </a>
  </nav>

  <div class="mt-auto flex flex-col gap-1 border-t border-white/25 pt-4">
    {#if authenticated}
      <a 
        href="/profile" 
        class="{navItemClass} {isActive('/profile') ? activeNavClass : inactiveNavClass}"
      >
        <Settings class="h-4 w-4 shrink-0" />
        <span>{t('nav.profile')}</span>
      </a>
    {/if}

    <a 
      href="/about" 
      class="{navItemClass} {isActive('/about') ? activeNavClass : inactiveNavClass}"
    >
      <Info class="h-4 w-4 shrink-0" />
      <span>{t('nav.about')}</span>
    </a>

    <a 
      href="/contact" 
      class="{navItemClass} {isActive('/contact') ? activeNavClass : inactiveNavClass}"
    >
      <PhoneCall class="h-4 w-4 shrink-0" />
      <span>{t('nav.contact')}</span>
    </a>

    <a 
      href="/help" 
      class="{navItemClass} {isActive('/help') ? activeNavClass : inactiveNavClass}"
    >
      <HelpCircle class="h-4 w-4 shrink-0" />
      <span>{t('nav.help')}</span>
    </a>



    {#if authenticated}
      <button 
        onclick={() => showLogoutModal = true}
        class="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-xs font-bold text-rose-200 transition-all hover:bg-rose-500/15 hover:text-rose-100"
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
