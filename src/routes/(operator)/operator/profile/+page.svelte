<script>
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { User, Mail, Phone, MapPin, Globe, ShieldCheck, Check } from '@lucide/svelte';
  import { applyThemeMode } from '$lib/utils/theme';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  let savedNotice = $state(false);
  let profilePhone = $state('');
  let isDark = $state(false);

  $effect(() => {
    profilePhone = user?.phone ?? '';
    if (typeof window !== 'undefined') {
      isDark = localStorage.getItem('theme-mode') === 'dark';
    }
  });

  async function saveProfile() {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: profilePhone, preferredLanguage: currentLocale })
    });
    if (!response.ok) return;
    savedNotice = true;
    setTimeout(() => savedNotice = false, 2000);
  }
</script>

<svelte:head>
  <title>{t('ui.routes.operator.operator.profile.c44e7317')}</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-12 flex flex-col w-full">
  <!-- Page Header (Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8 shadow-md">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-2xl font-black tracking-tight text-white">{t('ui.routes.operator.operator.profile.87e6d64d')}</h1>
      <p class="public-banner-subtitle text-xs font-medium mt-1 max-w-2xl">{t('ui.routes.operator.operator.profile.80a3b9d9')}</p>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex-grow w-full">
    {#if !authenticated || !user}
      <div class="rounded-3xl border border-border bg-surface p-8 text-center shadow-vazhi-1 flex flex-col items-center">
        <h2 class="text-2xl font-bold text-text">{t('ui.routes.operator.operator.profile.d0844433')}</h2>
        <a href="/login" class="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition">{t('ui.routes.operator.operator.profile.64386e65')}</a>
      </div>
    {:else}
      <div class="rounded-3xl border border-border bg-surface p-5 shadow-vazhi-1 space-y-6 sm:p-6">
        <div class="flex items-center gap-4 border-b border-border pb-6">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-bold border border-primary/10">
            {user.name.charAt(0)}
          </div>
          <div class="min-w-0">
            <h2 class="text-2xl font-bold text-text">{user.name}</h2>
            <p class="text-xs text-text-muted">{user.email} • {t('profile.role')}: <strong class="text-primary capitalize">{t('role.' + user.role) !== 'role.' + user.role ? t('role.' + user.role) : user.role.replace('_', ' ')}</strong></p>
          </div>
        </div>

        {#if savedNotice}
          <div class="rounded-xl border border-success/20 bg-success-soft p-3 text-xs font-bold text-success text-center animate-pulse">
            {t('ui.profile.saved.successfully')}
          </div>
        {/if}

        <div class="space-y-4">
          <h3 class="text-sm font-bold text-text">{t('ui.routes.operator.operator.profile.5f7742c1')}</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="profile-name" class="block text-xs font-semibold text-text-muted mb-1">{t('ui.routes.operator.operator.profile.ae5193c6')}</label>
              <input id="profile-name" type="text" value={user.name} readonly class="w-full rounded-xl border border-border bg-muted p-2.5 text-xs font-semibold text-text" />
            </div>

            <div>
              <label for="profile-email" class="block text-xs font-semibold text-text-muted mb-1">{t('ui.routes.operator.operator.profile.09eef910')}</label>
              <input id="profile-email" type="text" value={user.email} readonly class="w-full rounded-xl border border-border bg-muted p-2.5 text-xs font-semibold text-text" />
            </div>

            <div>
              <label for="profile-phone" class="block text-xs font-semibold text-text-muted mb-1">{t('ui.routes.operator.operator.profile.40f03f96')}</label>
              <input id="profile-phone" type="text" bind:value={profilePhone} class="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs font-semibold text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>

            <div>
              <label for="profile-service-center" class="block text-xs font-semibold text-text-muted mb-1">{t('ui.routes.operator.operator.profile.20d664dc')}</label>
              <input id="profile-service-center" type="text" value="ESV-CHN-0042 (Egmore Center)" readonly class="w-full rounded-xl border border-border bg-muted p-2.5 text-xs font-semibold text-text" />
            </div>
          </div>
        </div>

        <div class="border-t border-border pt-6 space-y-6">
          <h3 class="text-sm font-bold text-text">{t('ui.routes.operator.operator.profile.81ae7ad9')}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="block text-xs font-semibold text-text-muted mb-2">{t('ui.routes.operator.operator.profile.0da93da1')}</span>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onclick={() => locale.set('en')}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'en' ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('lang.current')}
                </button>
                <button
                  type="button"
                  onclick={() => locale.set('ta')}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'ta' ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('lang.tamilWithEnglish')}
                </button>
              </div>
            </div>

            <div>
              <span class="block text-xs font-semibold text-text-muted mb-2">{t('ui.routes.operator.operator.profile.888f3cc6')}</span>
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onclick={() => { isDark = false; applyThemeMode('light'); }}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {!isDark ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('settings.lightMode')}
                </button>
                <button
                  type="button"
                  onclick={() => { isDark = true; applyThemeMode('dark'); }}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {isDark ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('settings.darkMode')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-border pt-6 flex justify-end">
          <button onclick={saveProfile} class="rounded-xl bg-primary hover:bg-primary-hover px-6 py-2.5 text-xs font-bold text-white shadow-vazhi-1 transition">
            {t('profile.save')}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
