<script>

  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { UserCircle, Mail, Shield, Key, Calendar, Globe, CheckCircle, Check } from '@lucide/svelte';
  import { applyThemeMode } from '$lib/utils/theme';

const t = $derived($tt);
const currentLocale = $derived($locale);
const authenticated = $derived($isAuthenticated);
const role = $derived($userRole);
const user = $derived($currentUser);
let isDark = $state(false);
$effect(() => {
    if (typeof window !== 'undefined') {
        const updateTheme = () => {
            isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme-mode') === 'dark';
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }
});
</script>

<svelte:head>
  <title>Admin Profile — TN Hub</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl">
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-12">
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-h1 text-white">Admin Profile</h1>
        <p class="text-xs text-white/70">View your account details and credentials</p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container shadow-sm overflow-hidden">
        <!-- Avatar Banner -->
        <div class="border-b border-border px-8 py-10 text-center transition-all duration-300 {isDark ? 'bg-surface-container-high' : 'bg-primary-soft'}">
          <div class="mx-auto w-20 h-20 rounded-2xl font-black text-2xl flex items-center justify-center shadow-xl transition-all duration-300 bg-surface border border-border text-primary">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <h2 class="mt-3 text-lg font-bold transition-all duration-300 text-text">{user?.displayName || 'System Administrator'}</h2>
          <span class="inline-flex items-center gap-1.5 mt-1 rounded-full px-3 py-1 text-[10px] font-bold transition-all duration-300 uppercase bg-success-soft text-success border border-success/20">
            <Shield class="h-3 w-3" />
            Platform Administrator
          </span>
        </div>

        <!-- Profile Details -->
        <div class="p-8 space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl bg-surface-container-low border border-border p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-1.5">
                <UserCircle class="h-3.5 w-3.5" />
                Display Name
              </div>
              <p class="text-sm font-bold text-text">{user?.displayName || 'N/A'}</p>
            </div>

            <div class="rounded-2xl bg-surface-container-low border border-border p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-1.5">
                <Mail class="h-3.5 w-3.5" />
                Email
              </div>
              <p class="text-sm font-bold text-text">{user?.email || 'N/A'}</p>
            </div>

            <div class="rounded-2xl bg-surface-container-low border border-border p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-1.5">
                <Shield class="h-3.5 w-3.5" />
                Role
              </div>
              <p class="text-sm font-bold text-primary-soft-text">Platform Administrator</p>
            </div>

            <div class="rounded-2xl bg-surface-container-low border border-border p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-1.5">
                <CheckCircle class="h-3.5 w-3.5" />
                Account Status
              </div>
              <p class="text-sm font-bold text-primary-soft-text">Active & Verified</p>
            </div>

            <div class="rounded-2xl bg-surface-container-low border border-border p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-1.5">
                <Key class="h-3.5 w-3.5" />
                User ID
              </div>
              <p class="text-xs font-mono text-text-muted">{user?.uid || 'N/A'}</p>
            </div>

            <div class="rounded-2xl bg-surface-container-low border border-border p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-text-muted uppercase mb-1.5">
                <Globe class="h-3.5 w-3.5" />
                Language
              </div>
              <p class="text-sm font-bold text-text">{currentLocale === 'ta' ? 'தமிழ்' : 'English'}</p>
            </div>
          </div>

          <div class="rounded-2xl bg-primary-soft border border-primary/20 p-4 text-xs text-primary-soft-text">
            <strong>Note:</strong> Profile changes are managed through Firebase Authentication. Contact the development team for credential updates.
          </div>

          <div class="border-t border-border pt-6 space-y-6">
            <h3 class="text-sm font-bold text-text">System Preferences</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span class="block text-xs font-semibold text-text-muted mb-2">Interface Language</span>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onclick={() => locale.set('en')}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'en' ? 'border-primary bg-primary text-white' : 'border-border bg-surface dark:bg-surface-container text-text hover:bg-surface-container-high dark:hover:bg-surface-container-highest'}"
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onclick={() => locale.set('ta')}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'ta' ? 'border-primary bg-primary text-white' : 'border-border bg-surface dark:bg-surface-container text-text hover:bg-surface-container-high dark:hover:bg-surface-container-highest'}"
                  >
                    தமிழ் (Tamil)
                  </button>
                </div>
              </div>



              <div>
                <span class="block text-xs font-semibold text-text-muted mb-2">Interface Theme Mode</span>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onclick={() => { isDark = false; applyThemeMode('light'); }}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {!isDark ? 'border-primary bg-primary text-white' : 'border-border bg-surface dark:bg-surface-container text-text hover:bg-surface-container-high dark:hover:bg-surface-container-highest'}"
                  >
                    Light Mode
                  </button>
                  <button
                    type="button"
                    onclick={() => { isDark = true; applyThemeMode('dark'); }}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {isDark ? 'border-primary bg-primary text-white' : 'border-border bg-surface dark:bg-surface-container text-text hover:bg-surface-container-high dark:hover:bg-surface-container-highest'}"
                  >
                    Dark Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
