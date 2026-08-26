<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { UserCircle, Mail, Shield, Key, Calendar, Globe, CheckCircle, Check } from '@lucide/svelte';
  import { applyThemeMode } from '$lib/utils/theme';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);
  const user = $derived($currentUser);

  let isDark = $state(true);

  $effect(() => {
    if (typeof window !== 'undefined') {
      isDark = localStorage.getItem('theme-mode') !== 'light';
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
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-h1 text-white">Admin Profile</h1>
        <p class="text-xs text-white/70">View your account details and credentials</p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <!-- Avatar Banner -->
        <div class="bg-gradient-to-r from-[#071A28] to-[#143520] px-8 py-10 text-center">
          <div class="mx-auto w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-black text-2xl flex items-center justify-center shadow-xl">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <h2 class="mt-3 text-lg font-bold text-white">{user?.displayName || 'System Administrator'}</h2>
          <span class="inline-flex items-center gap-1.5 mt-1 rounded-full bg-green-100/10 px-3 py-1 text-[10px] font-bold text-green-300 uppercase">
            <Shield class="h-3 w-3" />
            Platform Administrator
          </span>
        </div>

        <!-- Profile Details -->
        <div class="p-8 space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <UserCircle class="h-3.5 w-3.5" />
                Display Name
              </div>
              <p class="text-sm font-bold text-slate-900">{user?.displayName || 'N/A'}</p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <Mail class="h-3.5 w-3.5" />
                Email
              </div>
              <p class="text-sm font-bold text-slate-900">{user?.email || 'N/A'}</p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <Shield class="h-3.5 w-3.5" />
                Role
              </div>
              <p class="text-sm font-bold text-[#316342]">Platform Administrator</p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <CheckCircle class="h-3.5 w-3.5" />
                Account Status
              </div>
              <p class="text-sm font-bold text-[#316342]">Active & Verified</p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <Key class="h-3.5 w-3.5" />
                User ID
              </div>
              <p class="text-xs font-mono text-slate-600">{user?.uid || 'N/A'}</p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <Globe class="h-3.5 w-3.5" />
                Language
              </div>
              <p class="text-sm font-bold text-slate-900">{currentLocale === 'ta' ? 'தமிழ்' : 'English'}</p>
            </div>
          </div>

          <div class="rounded-2xl bg-[#316342]/5 border border-[#316342]/20 p-4 text-xs text-slate-700">
            <strong>Note:</strong> Profile changes are managed through Firebase Authentication. Contact the development team for credential updates.
          </div>

          <div class="border-t border-slate-200 pt-6 space-y-6">
            <h3 class="text-sm font-bold text-slate-900">System Preferences</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span class="block text-xs font-semibold text-slate-500 mb-2">Interface Language</span>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onclick={() => locale.set('en')}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'en' ? 'border-[#316342] bg-[#316342] text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}"
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onclick={() => locale.set('ta')}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'ta' ? 'border-[#316342] bg-[#316342] text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}"
                  >
                    தமிழ் (Tamil)
                  </button>
                </div>
              </div>



              <div>
                <span class="block text-xs font-semibold text-slate-500 mb-2">Interface Theme Mode</span>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onclick={() => { isDark = false; applyThemeMode('light'); }}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {!isDark ? 'border-[#316342] bg-[#316342] text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}"
                  >
                    Light Mode
                  </button>
                  <button
                    type="button"
                    onclick={() => { isDark = true; applyThemeMode('dark'); }}
                    class="rounded-xl border px-4 py-2 text-xs font-bold transition {isDark ? 'border-[#316342] bg-[#316342] text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}"
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
