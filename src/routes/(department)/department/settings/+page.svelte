<script>
  import { tt } from '$lib/i18n';
  const t = $derived($tt);

  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { Shield, CheckCircle2 } from '@lucide/svelte';

const user = $derived($currentUser);
const guard = $derived(canAccessRoute(user, '/department/settings'));
let emailNotifs = $state(true);
let smsNotifs = $state(true);
let autoAssign = $state(true);
let slaThresholdDays = $state('3');
let savedMessage = $state('');
let isSaving = $state(false);
let isLoading = $state(true);
let errorMessage = $state('');
$effect(() => {
    const activeUser = user;
    if (!activeUser)
        return;
    let cancelled = false;
    isLoading = true;
    fetch('/api/department/settings', { credentials: 'same-origin' })
        .then(res => res.ok ? res.json() : null)
        .then((data) => {
        if (!cancelled && data?.settings) {
            emailNotifs = Boolean(data.settings.emailNotifs);
            smsNotifs = Boolean(data.settings.smsNotifs);
            autoAssign = Boolean(data.settings.autoAssign);
            slaThresholdDays = String(data.settings.slaThresholdDays || '3');
        }
    })
        .catch(() => { })
        .finally(() => {
        if (!cancelled)
            isLoading = false;
    });
    return () => { cancelled = true; };
});
async function saveSettings() {
    if (isSaving)
        return;
    isSaving = true;
    savedMessage = '';
    errorMessage = '';
    try {
        const res = await fetch('/api/department/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ emailNotifs, smsNotifs, autoAssign, slaThresholdDays })
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Failed to save department settings');
        }
        savedMessage = 'Department processing preferences updated and saved to Firestore successfully.';
        setTimeout(() => savedMessage = '', 3500);
    }
    catch (err) {
        errorMessage = err instanceof Error ? err.message : 'Error saving settings';
    }
    finally {
        isSaving = false;
    }
}
</script>

<svelte:head>
  <title>Department Settings — {user?.departmentName || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-text">{t('ui.routes.department.department.settings.f0c900ba')}</h2>
      <p class="mt-2 text-xs text-text-muted">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-20 text-text font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-6 shadow-vazhi-1">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold text-text tracking-tight">{t('ui.routes.department.department.settings.f75ed196')}</h1>
      </div>
    </header>

    <!-- Main Content -->
    <div class="p-6 w-full max-w-4xl mx-auto space-y-6">
      {#if savedMessage}
        <div class="rounded-xl border border-success/25 bg-success-soft p-4 text-xs font-bold text-success flex items-center gap-2">
          <CheckCircle2 class="h-4 w-4 text-success" />
          <span>{savedMessage}</span>
        </div>
      {/if}

      <div class="bg-surface border border-border rounded-xl p-8 shadow-vazhi-1 space-y-6">
        <!-- SLA Parameters -->
        <div>
          <h3 class="text-xs font-bold text-text uppercase tracking-wider mb-1">{t('ui.routes.department.department.settings.d3de5c69')}</h3>
          <p class="text-xs text-text-muted mb-4">Set the target completion timeframe for applications processed by {user?.departmentName || 'your department'}.</p>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl bg-muted p-4 border border-border">
              <label class="block text-xs font-bold text-text mb-1.5" for="slaThresholdDays">{t('ui.routes.department.department.settings.08bdfe0e')}</label>
              <select id="slaThresholdDays" bind:value={slaThresholdDays} class="w-full bg-surface rounded-lg border border-border p-2 text-xs font-semibold text-text">
                <option value="1">{t('ui.routes.department.department.settings.6ca5c703')}</option>
                <option value="3">{t('ui.routes.department.department.settings.a74338c2')}</option>
                <option value="7">{t('ui.routes.department.department.settings.57e27c9a')}</option>
              </select>
            </div>

            <div class="rounded-xl bg-muted p-4 border border-border">
              <label class="block text-xs font-bold text-text mb-1.5" for="autoAssign">{t('ui.routes.department.department.settings.a84cdcbc')}</label>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-text-muted font-medium">{t('ui.routes.department.department.settings.25b3966f')}</span>
                <input id="autoAssign" type="checkbox" bind:checked={autoAssign} class="h-4 w-4 accent-primary rounded focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Triggers -->
        <div class="border-t border-border pt-6">
          <h3 class="text-xs font-bold text-text uppercase tracking-wider mb-1">{t('ui.routes.department.department.settings.25ab213a')}</h3>
          <p class="text-xs text-text-muted mb-4">{t('ui.routes.department.department.settings.ed434632')}</p>

          <div class="space-y-3">
            <label class="flex items-center justify-between p-4 rounded-xl border border-border bg-muted cursor-pointer">
              <div>
                <span class="text-xs font-bold text-text block">{t('ui.routes.department.department.settings.798bb35b')}</span>
                <span class="text-[10px] text-text-muted">{t('ui.routes.department.department.settings.c4a9fec9')}</span>
              </div>
              <input type="checkbox" bind:checked={emailNotifs} class="h-4 w-4 accent-primary rounded focus:ring-2 focus:ring-primary/20" />
            </label>

            <label class="flex items-center justify-between p-4 rounded-xl border border-border bg-muted cursor-pointer">
              <div>
                <span class="text-xs font-bold text-text block">{t('ui.routes.department.department.settings.494937bf')}</span>
                <span class="text-[10px] text-text-muted">{t('ui.routes.department.department.settings.ab300ef4')}</span>
              </div>
              <input type="checkbox" bind:checked={smsNotifs} class="h-4 w-4 accent-primary rounded focus:ring-2 focus:ring-primary/20" />
            </label>
          </div>
        </div>

        <div class="border-t border-border pt-6 flex justify-end">
          <button
            onclick={saveSettings}
            class="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-vazhi-1 transition hover:bg-primary-hover"
          >
            {t('ui.save.preferences')}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
