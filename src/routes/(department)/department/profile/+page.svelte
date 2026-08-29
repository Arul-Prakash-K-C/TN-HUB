<script>

  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { User, Shield, Building2, Lock, BadgeCheck, Mail, Phone, MapPin, Award, ShieldCheck, Key, Check } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';
  import { applyThemeMode } from '$lib/utils/theme';

const user = $derived($currentUser);
const guard = $derived(canAccessRoute(user, '/department/profile'));
const t = $derived($tt);
const currentLocale = $derived($locale);
let isDark = $state(false);
$effect(() => {
    if (typeof window !== 'undefined') {
        isDark = localStorage.getItem('theme-mode') === 'dark';
    }
});
</script>

<svelte:head>
  <title>{t('department.profile')} — {user?.name || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">{t('auth.accessRestricted')}</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || t('auth.unauthorizedAccess')}</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Top Green Banner Header -->
    <div class="public-banner py-6 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl flex justify-between items-center">
        <div>
          <h1 class="text-xl font-black text-white">{t('department.profileTitle')}</h1>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6 w-full max-w-7xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-border pb-6">
          <div class="w-16 h-16 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center border border-primary/20 shadow-md shrink-0">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">{user?.name}</h2>
            <p class="text-xs font-bold text-primary mt-0.5">{user?.departmentName || t('department.defaultName')}</p>
            <div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-0.5 text-[10px] font-bold text-primary">
              {t('department.profile.statusActiveVerified')}
            </div>
          </div>
        </div>

        <!-- Readonly Official Fields -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-surface-container dark:bg-surface-container-high p-4 border border-border">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{t('department.govtEmail')}</span>
            <div class="flex items-center gap-2 text-xs font-bold text-text">
              <Mail class="h-4 w-4 text-primary shrink-0" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div class="rounded-xl bg-surface-container dark:bg-surface-container-high p-4 border border-border">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{t('department.employeeId')}</span>
            <div class="flex items-center gap-2 text-xs font-bold text-text font-mono">
              <Award class="h-4 w-4 text-primary shrink-0" />
              <span>{user?.phone || 'REV-TN-2024-9102'}</span>
            </div>
          </div>

          <div class="rounded-xl bg-surface-container dark:bg-surface-container-high p-4 border border-border">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{t('department.assignedDept')}</span>
            <div class="flex items-center gap-2 text-xs font-bold text-text">
              <Building2 class="h-4 w-4 text-primary shrink-0" />
              <span>{user?.departmentName || t('department.defaultName')}</span>
            </div>
          </div>

          <div class="rounded-xl bg-surface-container dark:bg-surface-container-high p-4 border border-border">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{t('department.jurisdiction')}</span>
            <div class="flex items-center gap-2 text-xs font-bold text-text">
              <MapPin class="h-4 w-4 text-primary shrink-0" />
              <span>{t('department.jurisdictionValue')}</span>
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="rounded-xl border border-warning/25 bg-warning-soft p-4 text-warning text-xs flex items-start gap-3">
          <Lock class="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <strong>{t('department.adminNoticeLabel')}:</strong> {t('department.adminNotice')}
          </div>
        </div>

        <div class="border-t border-border pt-6 space-y-6">
          <h3 class="text-sm font-bold text-text">{t('settings.systemPreferences')}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="block text-xs font-semibold text-text-muted mb-2">{t('settings.interfaceLanguage')}</span>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick={() => locale.set('en')}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'en' ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('lang.english')}
                </button>
                <button
                  type="button"
                  onclick={() => locale.set('ta')}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'ta' ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('lang.tamilWithEnglish')}
                </button>
              </div>
            </div>



            <div>
              <span class="block text-xs font-semibold text-text-muted mb-2">{t('settings.interfaceThemeMode')}</span>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick={() => { isDark = false; applyThemeMode('light'); }}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {!isDark ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('settings.lightMode')}
                </button>
                <button
                  type="button"
                  onclick={() => { isDark = true; applyThemeMode('dark'); }}
                  class="rounded-xl border px-4 py-2 text-xs font-bold transition {isDark ? 'border-primary bg-primary text-white' : 'border-border bg-surface-container-low text-text hover:bg-muted'}"
                >
                  {t('settings.darkMode')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
