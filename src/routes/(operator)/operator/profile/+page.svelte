<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { User, Mail, Phone, MapPin, Globe, ShieldCheck, Check } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);

  let savedNotice = $state(false);
  let profilePhone = $state('');

  $effect(() => {
    profilePhone = user?.phone ?? '';
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
  <title>Operator Profile — TN Hub</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-12">
  <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">Kiosk Operator Profile</h1>
      <p class="text-xs font-medium text-slate-500 mt-0.5">Manage your operator account details and system preferences.</p>
    </div>
  </div>

  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    {#if !authenticated || !user}
      <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900">Please log in to view profile</h2>
        <a href="/login" class="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition animate-pulse">Login</a>
      </div>
    {:else}
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div class="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#062206] text-white text-2xl font-bold border border-[#143A14]">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">{user.name}</h2>
            <p class="text-xs text-slate-500">{user.email} • Role: <strong class="text-primary-600 capitalize">{user.role.replace('_', ' ')}</strong></p>
          </div>
        </div>

        {#if savedNotice}
          <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700 text-center">
            Profile saved successfully!
          </div>
        {/if}

        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Kiosk & Account Information</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="profile-name" class="block text-xs font-semibold text-slate-500 mb-1">Operator Name</label>
              <input id="profile-name" type="text" value={user.name} readonly class="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900" />
            </div>

            <div>
              <label for="profile-email" class="block text-xs font-semibold text-slate-500 mb-1">Official Email</label>
              <input id="profile-email" type="text" value={user.email} readonly class="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900" />
            </div>

            <div>
              <label for="profile-phone" class="block text-xs font-semibold text-slate-500 mb-1">Kiosk Contact Number</label>
              <input id="profile-phone" type="text" bind:value={profilePhone} class="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 outline-none focus:border-primary-500" />
            </div>

            <div>
              <label for="profile-kiosk" class="block text-xs font-semibold text-slate-500 mb-1">Assigned Kiosk ID</label>
              <input id="profile-kiosk" type="text" value="ESV-CHN-0042 (Egmore Center)" readonly class="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900" />
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-6 space-y-4">
          <h3 class="text-sm font-bold text-slate-900">System Preferences</h3>
          <div>
            <span class="block text-xs font-semibold text-slate-500 mb-2">Interface Language</span>
            <div class="flex items-center gap-3">
              <button
                onclick={() => locale.set('en')}
                class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'en' ? 'border-[#062206] bg-[#062206] text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}"
              >
                English
              </button>
              <button
                onclick={() => locale.set('ta')}
                class="rounded-xl border px-4 py-2 text-xs font-bold transition {currentLocale === 'ta' ? 'border-[#062206] bg-[#062206] text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}"
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-6 flex justify-end">
          <button onclick={saveProfile} class="rounded-xl bg-[#062206] hover:bg-[#143A14] px-6 py-2.5 text-xs font-bold text-white shadow transition">
            Save Changes
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
