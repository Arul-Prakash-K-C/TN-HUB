<script>

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth, currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { locale, tt } from '$lib/i18n';
  import {
    Menu,
    X,
    Globe,
    Sun,
    Moon,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Lock,
    GraduationCap,
    Phone
  } from '@lucide/svelte';
  import { getPortalRedirectForRole } from '$lib/utils/authGuard';
  import { applyThemeMode, getPreferredThemeMode } from '$lib/utils/theme';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';
  import { notificationUnreadCount } from '$lib/stores/notifications';

let mobileMenuOpen = $state(false);
let profileMenuOpen = $state(false);
let loginGuardModal = $state({ open: false, target: '', title: '' });
const t = $derived($tt);
const user = $derived($currentUser);
const authenticated = $derived($isAuthenticated);
const role = $derived($userRole);
const currentPath = $derived($page.url.pathname);
let themeMode = $state('dark');
const unreadCount = $derived($notificationUnreadCount);
$effect(() => {
    themeMode = getPreferredThemeMode();
});
function toggleLanguage() {
    locale.toggle();
}
function handleLanguageToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleLanguage();
}
function handleThemeToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    themeMode = themeMode === 'dark' ? 'light' : 'dark';
    applyThemeMode(themeMode);
}
async function handleLogout() {
    await auth.logout();
    profileMenuOpen = false;
    goto('/');
}
function getDashboardUrl() {
    return getPortalRedirectForRole(role);
}
function handleProtectedNav(targetPath, title, e) {
    if (!authenticated) {
        e.preventDefault();
        loginGuardModal = { open: true, target: targetPath, title };
    }
}
</script>

<!-- STICKY HEADER -->
<header class="sticky top-0 z-50 w-full bg-surface text-text shadow-sm border-b border-border">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between gap-4">
      
      <!-- Brand Logo / Wordmark -->
      <a href={authenticated ? getDashboardUrl() : "/"} class="flex items-center gap-3 shrink-0 group">
        <BrandLogo showWordmark={true} sizeClass="h-12 w-44 sm:w-52" wordmarkClass="text-sm" subtitleClass="text-[9px]" />
      </a>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-2 text-[14px] font-semibold text-text-muted" aria-label="Main navigation">
        <a href="/services" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath.startsWith('/services') ? 'border-primary text-primary' : 'border-transparent'}">{t('nav.services')}</a>
        {#if authenticated}
          <a href="/applications" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath.startsWith('/applications') ? 'border-primary text-primary' : 'border-transparent'}">{t('nav.track')}</a>
          <a href="/documents" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath.startsWith('/documents') ? 'border-primary text-primary' : 'border-transparent'}">{t('nav.documents')}</a>
        {/if}
        <a href="/about" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath === '/about' ? 'border-primary text-primary' : 'border-transparent'}">{t('nav.about')}</a>

        <a href="/help" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath === '/help' ? 'border-primary text-primary' : 'border-transparent'}">{t('nav.help')}</a>

        <a href="/contact" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath === '/contact' ? 'border-primary text-primary' : 'border-transparent'}">{t('footer.contact')}</a>
        <a href="/tutorials" class="px-3 py-2 transition hover:text-primary border-b-2 {currentPath === '/tutorials' ? 'border-primary text-primary' : 'border-transparent'}">
          <span class="flex items-center gap-1.5">
            <GraduationCap class="h-4 w-4" />
            {$locale === 'ta' ? 'பயிற்சிகள்' : 'Tutorials'}
          </span>
        </a>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-3">
        {#if authenticated && user}
          <a
            href="/notifications"
            class="relative rounded-full p-2 text-text-muted hover:bg-muted transition"
            aria-label="Notifications"
          >
            <Bell class="h-4 w-4" />
            {#if unreadCount > 0}
              <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                {unreadCount}
              </span>
            {/if}
          </a>

          <div class="relative">
            <button
              onclick={() => profileMenuOpen = !profileMenuOpen}
              class="flex items-center gap-2 rounded-full border border-border bg-muted p-1 pr-3 hover:bg-surface-container transition"
            >
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white font-bold text-xs shadow-sm">
                {user.name.charAt(0)}
              </div>
              <span class="hidden sm:inline text-xs font-bold text-text">{user.name.split(' ')[0]}</span>
              <ChevronDown class="h-3.5 w-3.5 text-text-faint" />
            </button>

            {#if profileMenuOpen}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="fixed inset-0 z-40" onclick={() => profileMenuOpen = false}></div>
              <div class="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-2xl text-text animate-fade-in">
                <div class="border-b border-border px-3 py-3 mb-1">
                  <div class="text-sm font-bold text-text">{user.name}</div>
                  <div class="text-[11px] text-text-muted font-medium">{user.email}</div>
                </div>
                <a href={getDashboardUrl()} class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-text hover:bg-primary-soft hover:text-primary transition" onclick={() => profileMenuOpen = false}>
                  <User class="h-4 w-4 text-primary" />
                  Dashboard
                </a>
                <a href="/profile" class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-text hover:bg-primary-soft transition" onclick={() => profileMenuOpen = false}>
                  <User class="h-4 w-4 text-text-faint" />
                  Profile
                </a>
                <div class="border-t border-border mt-1 pt-1">
                  <button
                    onclick={handleLogout}
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft transition"
                  >
                    <LogOut class="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onclick={handleLanguageToggle}
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-text-muted transition hover:bg-surface-container"
              aria-label="Change Language"
            >
              <Globe class="h-4 w-4" />
            </button>
            <button
              type="button"
              onclick={handleThemeToggle}
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-text-muted transition hover:bg-surface-container"
              aria-label="Toggle Theme"
            >
              {#if themeMode === 'dark'}
                <Sun class="h-4 w-4" />
              {:else}
                <Moon class="h-4 w-4" />
              {/if}
            </button>
          </div>
          <a
            href="/login"
            class="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover transition shadow-sm"
          >
            {t('nav.login')}
          </a>
        {/if}

        <!-- Mobile Menu Toggle -->
        <button
          onclick={() => mobileMenuOpen = !mobileMenuOpen}
          class="rounded-lg p-2 text-text-muted hover:bg-muted transition lg:hidden"
          aria-label="Toggle Mobile Navigation"
        >
          {#if mobileMenuOpen}<X class="h-5 w-5" />{:else}<Menu class="h-5 w-5" />{/if}
        </button>
      </div>

    </div>
  </div>

  <!-- Mobile Drawer -->
  {#if mobileMenuOpen}
    <div class="bg-surface p-4 lg:hidden animate-fade-in space-y-1 text-sm font-bold border-t border-border text-text">
      {#if !authenticated}
        <a href="/" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.home')}</a>
      {:else}
        <a href={getDashboardUrl()} onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.dashboard')}</a>
      {/if}
      <a href="/services" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.services')}</a>
      {#if authenticated}
        <a href="/applications" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.track')}</a>
        <a href="/documents" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.documents')}</a>
      {/if}
      <a href="/about" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.about')}</a>

      <a href="/help" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.help')}</a>
      {#if authenticated}
        <a href="/complaints" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('nav.complaints')}</a>
      {/if}

      <a href="/contact" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">
        <span class="flex items-center gap-2"><Phone class="h-4 w-4" /> {t('footer.contact')}</span>
      </a>
      <a href="/tutorials" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">
        <span class="flex items-center gap-2"><GraduationCap class="h-4 w-4" /> {$locale === 'ta' ? 'பயிற்சிகள்' : 'Tutorials'}</span>
      </a>
      <a href="/sitemap" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 hover:bg-muted">{t('sitemap.heading')}</a>
    </div>
  {/if}
</header>

<!-- Login Required Guard Modal -->
{#if loginGuardModal.open}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl text-center">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Lock class="h-8 w-8" />
      </div>
      <h3 class="text-xl font-bold text-text">Login Required</h3>
      <p class="mt-3 text-sm text-text-muted leading-relaxed">
        You must be logged in to access <strong>{loginGuardModal.title}</strong>. Please log in with your credentials to proceed.
      </p>

      <div class="mt-8 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
        <button
          onclick={() => loginGuardModal = { open: false, target: '', title: '' }}
          class="w-full sm:w-auto rounded-xl border border-border px-6 py-3 text-sm font-bold text-text hover:bg-muted transition"
        >
          Cancel
        </button>

        <a
          href="/login?redirect={encodeURIComponent(loginGuardModal.target)}"
          onclick={() => loginGuardModal = { open: false, target: '', title: '' }}
          class="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-hover transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  </div>
{/if}
