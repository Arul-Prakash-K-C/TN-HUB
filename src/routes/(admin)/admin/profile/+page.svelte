<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { UserCircle, Mail, Shield, Key, Calendar, Globe, CheckCircle } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);
  const user = $derived($currentUser);
</script>

<svelte:head>
  <title>Admin Profile — TN Hub</title>
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
          My Account
        </span>
        <h1 class="mt-2 text-h1 text-white">Admin Profile</h1>
        <p class="text-xs text-white/70">View your account details and credentials</p>
      </div>
    </div>

    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <!-- Avatar Banner -->
        <div class="bg-gradient-to-r from-[#071A28] to-[#143A14] px-8 py-10 text-center">
          <div class="mx-auto w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-black text-2xl flex items-center justify-center shadow-xl">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <h2 class="mt-3 text-lg font-bold text-white">{user?.displayName || 'System Administrator'}</h2>
          <span class="inline-flex items-center gap-1.5 mt-1 rounded-full bg-[#9df79e]/20 px-3 py-1 text-[10px] font-bold text-[#9df79e] uppercase">
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
              <p class="text-sm font-bold text-emerald-700">Platform Administrator</p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                <CheckCircle class="h-3.5 w-3.5" />
                Account Status
              </div>
              <p class="text-sm font-bold text-emerald-700">Active & Verified</p>
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

          <div class="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
            <strong>Note:</strong> Profile changes are managed through Firebase Authentication. Contact the development team for credential updates.
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
