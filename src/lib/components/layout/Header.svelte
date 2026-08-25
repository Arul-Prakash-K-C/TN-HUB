<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth, currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { locale, tt } from '$lib/i18n';
  import {
    Menu,
    X,
    Globe,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Lock,
    GraduationCap,
    Phone
  } from '@lucide/svelte';
  import { getPortalRedirectForRole } from '$lib/utils/authGuard';

  let mobileMenuOpen = $state(false);
  let profileMenuOpen = $state(false);
  let loginGuardModal = $state<{ open: boolean; target: string; title: string }>({ open: false, target: '', title: '' });

  const t = $derived($tt);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);
  const currentPath = $derived($page.url.pathname);
  let unreadCount = $state(0);

  $effect(() => {
    const activeUser = user;
    if (!activeUser) {
      unreadCount = 0;
      return;
    }

    let cancelled = false;
    void fetch('/api/notifications/unread-count', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() as Promise<{ count?: unknown }> : null)
      .then((body) => {
        if (!cancelled) unreadCount = typeof body?.count === 'number' ? body.count : 0;
      })
      .catch(() => {
        if (!cancelled) unreadCount = 0;
      });

    return () => { cancelled = true; };
  });

  function toggleLanguage() {
    locale.toggle();
  }

  async function handleLogout() {
    await auth.logout();
    profileMenuOpen = false;
    goto('/');
  }

  function getDashboardUrl(): string {
    return getPortalRedirectForRole(role);
  }

  function handleProtectedNav(targetPath: string, title: string, e: MouseEvent) {
    if (!authenticated) {
      e.preventDefault();
      loginGuardModal = { open: true, target: targetPath, title };
    }
  }


</script>

<!-- STICKY HEADER -->
<header class="sticky top-0 z-50 w-full bg-[#062206] text-white shadow-md border-b border-[#143A14]">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between gap-4">
      
      <!-- Brand Logo / Wordmark -->
      <a href={authenticated ? getDashboardUrl() : "/"} class="flex items-center gap-3 shrink-0 group">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#82da85] text-[#062206] font-black text-sm shadow-md">
          TN
        </div>
        <div class="hidden sm:block">
          <div class="text-sm font-extrabold tracking-tight leading-none text-white">Sympho Center</div>
          <div class="text-[10px] font-bold text-[#9df79e] leading-tight uppercase tracking-wider mt-0.5">
            One Center. Every Government Service.
          </div>
        </div>
      </a>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-1 text-sm font-semibold tracking-wide" aria-label="Main navigation">
        <a href="/services" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath.startsWith('/services') ? 'bg-white/20 text-white' : 'text-slate-300'}">{t('nav.services')}</a>
        {#if authenticated}
          <a href="/applications" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath.startsWith('/applications') ? 'bg-white/20 text-white' : 'text-slate-300'}">{t('nav.track')}</a>
          <a href="/documents" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath.startsWith('/documents') ? 'bg-white/20 text-white' : 'text-slate-300'}">{t('nav.documents')}</a>
        {/if}
        <a href="/about" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath === '/about' ? 'bg-white/20 text-white' : 'text-slate-300'}">{t('nav.about')}</a>

        <a href="/help" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath === '/help' ? 'bg-white/20 text-white' : 'text-slate-300'}">{t('nav.help')}</a>

        <a href="/contact" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath === '/contact' ? 'bg-white/20 text-white' : 'text-slate-300'}">{t('footer.contact')}</a>
        <a href="/tutorials" class="px-3 py-2 rounded-lg transition hover:bg-white/10 {currentPath === '/tutorials' ? 'bg-white/20 text-white' : 'text-slate-300'}">
          <span class="flex items-center gap-1.5">
            <GraduationCap class="h-4 w-4" />
            {$locale === 'ta' ? 'பயிற்சிகள்' : 'Tutorials'}
          </span>
        </a>
      </nav>

      <!-- Right Side Actions (Language + User) -->
      <div class="flex items-center gap-3">
        <!-- Language Toggle -->
        <button
          onclick={toggleLanguage}
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-white/10 transition text-xs font-bold text-slate-300"
        >
          <Globe class="h-3.5 w-3.5" />
          <span>தமிழ் | ENG</span>
        </button>

        {#if authenticated && user}
          <a
            href="/notifications"
            class="relative rounded-lg p-2 text-slate-300 hover:bg-white/10 transition"
            aria-label="Notifications"
          >
            <Bell class="h-4 w-4" />
            {#if unreadCount > 0}
              <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E53935] px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#071A28]">
                {unreadCount}
              </span>
            {/if}
          </a>

          <div class="relative">
            <button
              onclick={() => profileMenuOpen = !profileMenuOpen}
              class="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 p-1 pr-3 hover:bg-white/10 transition"
            >
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm">
                {user.name.charAt(0)}
              </div>
              <span class="hidden sm:inline text-xs font-bold text-slate-200">{user.name.split(' ')[0]}</span>
              <ChevronDown class="h-3.5 w-3.5 text-slate-400" />
            </button>

            {#if profileMenuOpen}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="fixed inset-0 z-40" onclick={() => profileMenuOpen = false}></div>
              <div class="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl text-slate-800 animate-fade-in">
                <div class="border-b border-slate-100 px-3 py-3 mb-1">
                  <div class="text-sm font-bold text-slate-900">{user.name}</div>
                  <div class="text-[11px] text-slate-500 font-medium">{user.email}</div>
                </div>
                <a href={getDashboardUrl()} class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition" onclick={() => profileMenuOpen = false}>
                  <User class="h-4 w-4 text-blue-600" />
                  Dashboard
                </a>
                <a href="/profile" class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 transition" onclick={() => profileMenuOpen = false}>
                  <User class="h-4 w-4 text-slate-400" />
                  Profile
                </a>
                <div class="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onclick={handleLogout}
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#E53935] hover:bg-red-50 transition"
                  >
                    <LogOut class="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <a
            href="/login"
            class="rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-600 transition hover:shadow-primary-500/30"
          >
            {t('nav.login')}
          </a>
        {/if}

        <!-- Mobile Menu Toggle -->
        <button
          onclick={() => mobileMenuOpen = !mobileMenuOpen}
          class="rounded-lg p-2 text-slate-300 hover:bg-white/10 transition lg:hidden"
          aria-label="Toggle Mobile Navigation"
        >
          {#if mobileMenuOpen}<X class="h-5 w-5" />{:else}<Menu class="h-5 w-5" />{/if}
        </button>
      </div>

    </div>
  </div>

  <!-- Mobile Drawer -->
  {#if mobileMenuOpen}
    <div class="bg-[#0A253C] p-4 lg:hidden animate-fade-in space-y-1 text-sm font-bold border-t border-slate-800">
      {#if !authenticated}
        <a href="/" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.home')}</a>
      {:else}
        <a href={getDashboardUrl()} onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.dashboard')}</a>
      {/if}
      <a href="/services" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.services')}</a>
      {#if authenticated}
        <a href="/applications" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.track')}</a>
        <a href="/documents" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.documents')}</a>
      {/if}
      <a href="/about" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.about')}</a>

      <a href="/help" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.help')}</a>
      {#if authenticated}
        <a href="/complaints" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('nav.complaints')}</a>
      {/if}

      <a href="/contact" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">
        <span class="flex items-center gap-2"><Phone class="h-4 w-4" /> {t('footer.contact')}</span>
      </a>
      <a href="/tutorials" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">
        <span class="flex items-center gap-2"><GraduationCap class="h-4 w-4" /> {$locale === 'ta' ? 'பயிற்சிகள்' : 'Tutorials'}</span>
      </a>
      <a href="/sitemap" onclick={() => mobileMenuOpen = false} class="block rounded-xl px-4 py-3 text-white hover:bg-white/10">{t('sitemap.heading')}</a>
    </div>
  {/if}
</header>

<!-- Login Required Guard Modal -->
{#if loginGuardModal.open}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Lock class="h-8 w-8" />
      </div>
      <h3 class="text-xl font-bold text-slate-900">Login Required</h3>
      <p class="mt-3 text-sm text-slate-600 leading-relaxed">
        You must be logged in to access <strong>{loginGuardModal.title}</strong>. Please log in with your credentials to proceed.
      </p>

      <div class="mt-8 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
        <button
          onclick={() => loginGuardModal = { open: false, target: '', title: '' }}
          class="w-full sm:w-auto rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <a
          href="/login?redirect={encodeURIComponent(loginGuardModal.target)}"
          onclick={() => loginGuardModal = { open: false, target: '', title: '' }}
          class="w-full sm:w-auto rounded-xl bg-primary-500 px-8 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-600 transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  </div>
{/if}
