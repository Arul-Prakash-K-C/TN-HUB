<script lang="ts">
  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { tt } from '$lib/i18n';
  import { Settings, Shield, Bell, Lock, CheckCircle2, Sliders, Database, Server, RefreshCw } from '@lucide/svelte';

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/department/settings'));
  const t = $derived($tt);

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
    if (!activeUser) return;

    let cancelled = false;
    isLoading = true;
    fetch('/api/department/settings', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : null)
      .then((data: { settings?: { emailNotifs?: boolean; smsNotifs?: boolean; autoAssign?: boolean; slaThresholdDays?: string } } | null) => {
        if (!cancelled && data?.settings) {
          emailNotifs = Boolean(data.settings.emailNotifs);
          smsNotifs = Boolean(data.settings.smsNotifs);
          autoAssign = Boolean(data.settings.autoAssign);
          slaThresholdDays = String(data.settings.slaThresholdDays || '3');
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) isLoading = false;
      });

    return () => { cancelled = true; };
  });

  async function saveSettings() {
    if (isSaving) return;
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
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Error saving settings';
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <title>Department Settings — {user?.departmentName || 'Revenue Department'}</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-[#f7f9fb]">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-lg font-bold text-slate-900">Access Restricted</h2>
      <p class="mt-2 text-xs text-slate-500">{guard.reason || 'Unauthorized access'}</p>
    </div>
  </div>
{:else}
  <div class="bg-[#f7f9fb] min-h-screen pb-20 text-slate-900 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold text-slate-900 tracking-tight">Department Processing Settings</h1>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F2FD] text-[#1565C0]">
          Configuration Active
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <div class="p-6 w-full max-w-4xl mx-auto space-y-6">
      {#if savedMessage}
        <div class="rounded-xl border border-[#2E7D32]/30 bg-[#E8F5E9] p-4 text-xs font-bold text-[#2E7D32] flex items-center gap-2">
          <CheckCircle2 class="h-4 w-4 text-[#2E7D32]" />
          <span>{savedMessage}</span>
        </div>
      {/if}

      <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-2xs space-y-6">
        <!-- SLA Parameters -->
        <div>
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Guaranteed SLA Target</h3>
          <p class="text-xs text-slate-500 mb-4">Set the target completion timeframe for applications processed by {user?.departmentName || 'your department'}.</p>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
              <label class="block text-xs font-bold text-slate-900 mb-1.5" for="slaThresholdDays">Max SLA Days Limit</label>
              <select id="slaThresholdDays" bind:value={slaThresholdDays} class="w-full bg-white rounded-lg border border-slate-300 p-2 text-xs font-semibold">
                <option value="1">1 Day (Express Processing)</option>
                <option value="3">3 Days (Standard SLA)</option>
                <option value="7">7 Days (Extended Investigation)</option>
              </select>
            </div>

            <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
              <label class="block text-xs font-bold text-slate-900 mb-1.5" for="autoAssign">Auto Queue Assignment</label>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-slate-600 font-medium">Round-robin officer distribution</span>
                <input id="autoAssign" type="checkbox" bind:checked={autoAssign} class="h-4 w-4 text-[#062206] rounded focus:ring-2 focus:ring-[#9df79e]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Triggers -->
        <div class="border-t border-slate-100 pt-6">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Official Alert Preferences</h3>
          <p class="text-xs text-slate-500 mb-4">Configure automated alerts for incoming queue events and SLA risks.</p>

          <div class="space-y-3">
            <label class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-[#f2f4f6] cursor-pointer">
              <div>
                <span class="text-xs font-bold text-slate-900 block">Email Alerts for New Applications</span>
                <span class="text-[10px] text-slate-500">Send an instant email when a citizen submits an application to your department</span>
              </div>
              <input type="checkbox" bind:checked={emailNotifs} class="h-4 w-4 text-[#062206] rounded focus:ring-2 focus:ring-[#9df79e]" />
            </label>

            <label class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-[#f2f4f6] cursor-pointer">
              <div>
                <span class="text-xs font-bold text-slate-900 block">SMS Notifications for SLA Risks</span>
                <span class="text-[10px] text-slate-500">Alert designated officers when an application approaches 80% SLA deadline</span>
              </div>
              <input type="checkbox" bind:checked={smsNotifs} class="h-4 w-4 text-[#062206] rounded focus:ring-2 focus:ring-[#9df79e]" />
            </label>
          </div>
        </div>

        <!-- Integration Status Bar -->
        <div class="border-t border-slate-100 pt-6">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">System Adapters & External Integration Status</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2.5">
                <Database class="h-4 w-4 text-[#1565C0]" />
                <span class="font-bold text-slate-800">e-District API Adapter</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#E65100]">{t('service.externalNotice')}</span>
            </div>

            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2.5">
                <Server class="h-4 w-4 text-[#7B1FA2]" />
                <span class="font-bold text-slate-800">DigiLocker Verification Adapter</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF3E0] text-[#E65100]">{t('service.externalNotice')}</span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-6 flex justify-end">
          <button
            onclick={saveSettings}
            class="rounded-lg bg-[#062206] text-[#9df79e] px-5 py-2.5 text-xs font-bold shadow-2xs hover:bg-[#143A14] transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
