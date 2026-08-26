<script lang="ts">
  import { Shield, Bell, Eye, Lock, Save } from '@lucide/svelte';

  let notificationSettings = $state({
    emailAlerts: true,
    smsAlerts: true,
    kioskReceipts: true,
    newServiceAlerts: false
  });

  let savedNotice = $state(false);

  function saveSettings() {
    savedNotice = true;
    setTimeout(() => savedNotice = false, 2000);
  }
</script>

<svelte:head>
  <title>Operator Settings — TN Hub</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-12 flex flex-col w-full">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-2xl font-black tracking-tight text-white">Kiosk Settings</h1>
      <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">Configure notifications, security options, and receipt print details.</p>
    </div>
  </div>

  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 flex-grow w-full">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      
      {#if savedNotice}
        <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700 text-center animate-pulse">
          Kiosk settings updated successfully!
        </div>
      {/if}

      <!-- Kiosk Notification Section -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell class="h-4 w-4 text-[#316342]" /> Kiosk Alerts & Notifications
        </h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={notificationSettings.emailAlerts} class="rounded text-[#316342] focus:ring-[#316342]" />
            <span class="text-xs font-medium text-slate-700">Receive copy of submission emails for assisted citizen</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={notificationSettings.smsAlerts} class="rounded text-[#316342] focus:ring-[#316342]" />
            <span class="text-xs font-medium text-slate-700">Send status SMS updates directly to citizen's mobile</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={notificationSettings.kioskReceipts} class="rounded text-[#316342] focus:ring-[#316342]" />
            <span class="text-xs font-medium text-slate-700">Auto-trigger local receipt print prompt on application submission</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={notificationSettings.newServiceAlerts} class="rounded text-[#316342] focus:ring-[#316342]" />
            <span class="text-xs font-medium text-slate-700">Notify me about new Tamil Nadu government services added to the registry</span>
          </label>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="border-t border-slate-200 pt-6 space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield class="h-4 w-4 text-[#316342]" /> Security & Session Management
        </h3>
        <div class="space-y-3 text-xs text-slate-600">
          <p>Local biometric verification is currently: <strong class="text-[#316342]">Enabled (Biometric ID: BIO-042)</strong></p>
          <p>Auto-logout inactive kiosk sessions after: <strong>15 minutes</strong></p>
          <button class="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-bold text-slate-700 transition">
            Change Kiosk PIN / Password
          </button>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-6 flex justify-end">
        <button onclick={saveSettings} class="rounded-xl bg-[#316342] hover:bg-[#254b32] px-6 py-2.5 text-xs font-bold text-white shadow transition flex items-center gap-1.5">
          <Save class="h-4 w-4" /> Save Kiosk Settings
        </button>
      </div>
    </div>
  </div>
</div>
