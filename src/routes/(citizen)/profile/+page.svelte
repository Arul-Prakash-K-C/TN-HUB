<script lang="ts">
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
  let isDark = $state(true);

  $effect(() => {
    profilePhone = user?.phone ?? '';
    if (typeof window !== 'undefined') {
      isDark = localStorage.getItem('theme-mode') !== 'light';
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
  <title>{t('profile.title')} — TN Hub</title>
</svelte:head>

<div class="min-h-screen bg-background pb-12 text-text">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 text-white shadow-md sm:px-8">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-2xl font-black tracking-tight text-white">{t('profile.title')}</h1>
      <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">Manage your citizen profile, preferences, and language settings.</p>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    {#if !authenticated || !user}
      <div class="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <h2 class="text-2xl font-bold text-text">Please log in to view profile</h2>
        <a href="/login" class="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover">Login</a>
      </div>
    {:else}
      <div class="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div class="flex items-center gap-4 border-b border-border pb-6">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-text">{user.name}</h2>
            <p class="text-xs text-text-muted">{user.email} • Role: <strong class="capitalize text-primary">{user.role.replace('_', ' ')}</strong></p>
          </div>
        </div>

        {#if savedNotice}
          <div class="rounded-xl border border-success/30 bg-success-soft p-3 text-center text-xs font-bold text-success">
            {t('common.save')}d successfully!
          </div>
        {/if}

        <div class="space-y-4">
          <h3 class="text-sm font-bold text-text">{t('profile.personalInfo')}</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="profile-name" class="mb-1 block text-xs font-semibold text-text-muted">{t('apply.field.fullName')}</label>
              <input id="profile-name" type="text" value={user.name} readonly class="w-full rounded-xl border border-border bg-surface-container p-2.5 text-xs text-text" />
            </div>

            <div>
              <label for="profile-email" class="mb-1 block text-xs font-semibold text-text-muted">{t('apply.field.email')}</label>
              <input id="profile-email" type="text" value={user.email} readonly class="w-full rounded-xl border border-border bg-surface-container p-2.5 text-xs text-text" />
            </div>

            <div>
              <label for="profile-phone" class="mb-1 block text-xs font-semibold text-text-muted">{t('apply.field.phone')}</label>
              <input id="profile-phone" type="text" bind:value={profilePhone} class="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>

            <div>
              <label for="profile-aadhaar" class="mb-1 block text-xs font-semibold text-text-muted">{t('apply.field.aadhaar')}</label>
              <input id="profile-aadhaar" type="text" value={user.aadhaarNumber || 'Not Linked'} readonly class="w-full rounded-xl border border-border bg-surface-container p-2.5 text-xs text-text" />
            </div>
          </div>
        </div>

        <div class="space-y-6 border-t border-border pt-6">
          <h3 class="text-sm font-bold text-text">System Preferences</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="mb-2 block text-xs font-semibold text-text-muted">{t('profile.language')}</span>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick={() => locale.set('en')}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'en' ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container text-text hover:bg-surface-container-high'}"
                >
                  English
                </button>
                <button
                  type="button"
                  onclick={() => locale.set('ta')}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'ta' ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container text-text hover:bg-surface-container-high'}"
                >
                  தமிழ் (Tamil)
                </button>
              </div>
            </div>



            <div>
              <span class="mb-2 block text-xs font-semibold text-text-muted">Interface Theme Mode</span>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick={() => { isDark = false; applyThemeMode('light'); }}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {!isDark ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container text-text hover:bg-surface-container-high'}"
                >
                  Light Mode
                </button>
                <button
                  type="button"
                  onclick={() => { isDark = true; applyThemeMode('dark'); }}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {isDark ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container text-text hover:bg-surface-container-high'}"
                >
                  Dark Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end border-t border-border pt-6">
          <button onclick={saveProfile} class="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-primary-hover">
            {t('profile.save')}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

