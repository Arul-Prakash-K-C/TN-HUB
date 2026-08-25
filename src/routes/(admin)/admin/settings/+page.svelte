<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { Settings, Globe, Bell, Shield, Moon, Sun, Palette } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let notificationsEnabled = $state(true);
  let emailAlerts = $state(true);
  let darkMode = $state(false);
</script>

<svelte:head>
  <title>Settings — TN Hub Admin</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <h2 class="text-xl font-bold text-slate-900">Access Denied</h2>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="bg-primary text-white border-b border-border">
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          Configuration
        </span>
        <h1 class="mt-2 text-h1 text-white">Admin Settings</h1>
        <p class="text-xs text-white/70">Manage platform preferences and configurations</p>
      </div>
    </div>

    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <!-- Language Preference -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Globe class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Language Preference</h3>
            <p class="text-xs text-slate-500">Set the admin console display language</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            onclick={() => locale.set('en')}
            class="flex-1 rounded-xl border-2 py-3 text-xs font-bold transition {currentLocale === 'en' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
          >
            🇬🇧 English
          </button>
          <button
            onclick={() => locale.set('ta')}
            class="flex-1 rounded-xl border-2 py-3 text-xs font-bold transition {currentLocale === 'ta' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
          >
            🇮🇳 தமிழ்
          </button>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Bell class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Notification Preferences</h3>
            <p class="text-xs text-slate-500">Control how you receive platform alerts</p>
          </div>
        </div>
        <div class="space-y-3">
          <label class="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4 cursor-pointer">
            <div>
              <span class="text-xs font-bold text-slate-800">In-App Notifications</span>
              <p class="text-[10px] text-slate-500">Receive registration requests and system alerts</p>
            </div>
            <input type="checkbox" bind:checked={notificationsEnabled} class="h-5 w-5 rounded accent-emerald-600" />
          </label>
          <label class="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4 cursor-pointer">
            <div>
              <span class="text-xs font-bold text-slate-800">Email Alerts</span>
              <p class="text-[10px] text-slate-500">Get email copies of critical platform events</p>
            </div>
            <input type="checkbox" bind:checked={emailAlerts} class="h-5 w-5 rounded accent-emerald-600" />
          </label>
        </div>
      </div>

      <!-- Security -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Shield class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Security</h3>
            <p class="text-xs text-slate-500">Manage account security settings</p>
          </div>
        </div>
        <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <span class="text-xs font-bold text-slate-800">Password</span>
          <p class="text-[10px] text-slate-500 mt-0.5">Last changed: Not available (Firebase managed)</p>
          <button class="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
            Change Password
          </button>
        </div>
      </div>

      <!-- Platform Info -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Palette class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Platform Information</h3>
            <p class="text-xs text-slate-500">TN Hub system details</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span class="text-slate-500 font-medium">Version</span>
            <p class="font-bold text-slate-900 mt-0.5">1.0.0 (Hackathon Prototype)</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span class="text-slate-500 font-medium">Environment</span>
            <p class="font-bold text-slate-900 mt-0.5">Development</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span class="text-slate-500 font-medium">Backend</span>
            <p class="font-bold text-slate-900 mt-0.5">Firebase / SvelteKit</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <span class="text-slate-500 font-medium">Hosting</span>
            <p class="font-bold text-slate-900 mt-0.5">Vercel</p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
