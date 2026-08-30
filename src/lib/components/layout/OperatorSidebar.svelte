<script>

  import { page } from '$app/stores';
  import { LayoutDashboard, Grid, LogOut, AlertCircle, User, Settings, HelpCircle, FileText, MessageSquare, Globe } from '@lucide/svelte';
  import { auth, isAuthenticated } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';
  import { tt, locale } from '$lib/i18n';

const authenticated = $derived($isAuthenticated);
const t = $derived($tt);
const navItemClass = 'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all';
const inactiveNavClass = 'text-[var(--color-sidebar-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text)]';
const activeNavClass = 'border-l-4 border-primary bg-primary text-white font-bold shadow-sm';
function isActive(path) {
    const currentPath = $page.url.pathname;
    if (path === '/operator/dashboard' && currentPath === '/operator/dashboard')
        return true;
    if (path !== '/operator' && currentPath.startsWith(path))
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

<aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gap-5 border-r border-white/10 bg-[var(--color-sidebar-bg)] px-4 py-5 text-[var(--color-sidebar-text)] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/operator/dashboard" class="flex w-full items-center justify-center px-1 py-1 hover:opacity-90 transition">
    <BrandLogo showWordmark={true} subtitle={t('operator.portal')} sizeClass="h-[86px] w-full max-w-[236px]" wordmarkClass="text-sm text-[var(--color-sidebar-text)]" subtitleOffsetClass="-mt-2" subtitleClass="text-[10px] text-[var(--color-sidebar-text-muted)]" />
  </a>

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    <a 
      href="/operator/dashboard" 
      class="{navItemClass} {isActive('/operator/dashboard') ? activeNavClass : inactiveNavClass}"
    >
      <LayoutDashboard class="h-4 w-4 shrink-0" />
      <span>{t('operator.dashboard')}</span>
    </a>

    <a 
      href="/services" 
      class="{navItemClass} {isActive('/services') ? activeNavClass : inactiveNavClass}"
    >
      <Grid class="h-4 w-4 shrink-0" />
      <span>{t('operator.serviceCatalog')}</span>
    </a>

    <a 
      href="/applications" 
      class="{navItemClass} {isActive('/applications') ? activeNavClass : inactiveNavClass}"
    >
      <FileText class="h-4 w-4 shrink-0" />
      <span>{t('operator.applications')}</span>
    </a>

    <a 
      href="/operator/grievance" 
      class="{navItemClass} {isActive('/operator/grievance') ? activeNavClass : inactiveNavClass}"
    >
      <AlertCircle class="h-4 w-4 shrink-0" />
      <span>{t('operator.grievanceDesk')}</span>
    </a>

    <a 
      href="/operator/ai-chat" 
      class="{navItemClass} {isActive('/operator/ai-chat') ? activeNavClass : inactiveNavClass}"
    >
      <MessageSquare class="h-4 w-4 shrink-0" />
      <span>{t('operator.aiChat')}</span>
    </a>

  </nav>

  <!-- Bottom Links -->
  <div class="flex flex-col gap-1 border-t border-white/25 pt-4">
    <a 
      href="/operator/profile" 
      class="{navItemClass} {isActive('/operator/profile') ? activeNavClass : inactiveNavClass}"
    >
      <User class="h-4 w-4 shrink-0" />
      <span>{t('nav.profile')}</span>
    </a>

    <a 
      href="/operator/contact" 
      class="{navItemClass} {isActive('/operator/contact') ? activeNavClass : inactiveNavClass}"
    >
      <HelpCircle class="h-4 w-4 shrink-0" />
      <span>{t('operator.contactSupport')}</span>
    </a>

    <a 
      href="/operator/help" 
      class="{navItemClass} {isActive('/operator/help') ? activeNavClass : inactiveNavClass}"
    >
      <HelpCircle class="h-4 w-4 shrink-0" />
      <span>{t('operator.helpDesk')}</span>
    </a>

    <button 
      type="button"
      onclick={() => locale.toggle()}
      class="{navItemClass} {inactiveNavClass}"
      aria-label={t('a11y.changeLanguage')}
    >
      <Globe class="h-4 w-4 shrink-0" />
      <span>{$locale === 'ta' ? 'English' : 'தமிழ்'}</span>
    </button>

    <button 
      onclick={() => showLogoutModal = true}
      class="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-xs font-bold text-rose-200 transition-all hover:bg-rose-500/15 hover:text-rose-100"
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
