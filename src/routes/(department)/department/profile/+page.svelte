<script lang="ts">
  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { User, Shield, Building2, Lock, BadgeCheck, Mail, Phone, MapPin, Award, ShieldCheck, Key, Check } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';
  import { applyThemeMode } from '$lib/utils/theme';

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/department/profile'));
  const t = $derived($tt);
  const currentLocale = $derived($locale);

  let isDark = $state(true);

  $effect(() => {
    if (typeof window !== 'undefined') {
      isDark = localStorage.getItem('theme-mode') !== 'light';
    }
  });
</script>

<svelte:head>
  <title>{t('department.profile')} — {user?.name || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">Access Restricted</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Top Green Banner Header -->
    <div class="public-banner py-6 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl flex justify-between items-center">
        <div>
          <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Authorized Account
          </span>
          <h1 class="text-xl font-black mt-2 text-white">{t('department.profileTitle')}</h1>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
          {t('department.authorizedOfficial')}
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-border pb-6">
          <div class="w-16 h-16 rounded-full bg-[#316342] text-white font-black text-xl flex items-center justify-center border border-[#316342]/20 shadow-md shrink-0">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">{user?.name}</h2>
            <p class="text-xs font-bold text-[#316342] mt-0.5">{user?.departmentName || 'Revenue Department'}</p>
            <div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-0.5 text-[10px] font-bold text-[#316342]">
              Status: Active & Government Verified
            </div>
          </div>
        </div>

        <!-- Readonly Official Fields -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Government Email</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Mail class="h-4 w-4 text-[#316342] shrink-0" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Official Employee ID</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono">
              <Award class="h-4 w-4 text-[#316342] shrink-0" />
              <span>{user?.phone || 'REV-TN-2024-9102'}</span>
            </div>
          </div>

          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Department</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Building2 class="h-4 w-4 text-[#316342] shrink-0" />
              <span>{user?.departmentName || 'Revenue Department'}</span>
            </div>
          </div>

          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Taluk / Jurisdiction</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <MapPin class="h-4 w-4 text-[#316342] shrink-0" />
              <span>Chennai Central Division</span>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="rounded-xl border border-[#E65100]/20 bg-[#FFF3E0] p-4 text-[#E65100] text-xs flex items-start gap-3">
          <Lock class="h-5 w-5 text-[#E65100] shrink-0 mt-0.5" />
          <div>
            <strong>Administrative Notice:</strong> Official department assignments and approval designations are governed by state platform administrators. Transfers require formal administrative authorization.
          </div>
        </div>

        <div class="border-t border-border pt-6 space-y-6">
          <h3 class="text-sm font-bold text-text">System Preferences</h3>
          
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
{/if}
