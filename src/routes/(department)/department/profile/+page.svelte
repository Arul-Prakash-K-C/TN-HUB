<script lang="ts">
  import { currentUser } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { User, Shield, Building2, Lock, BadgeCheck, Mail, Phone, MapPin, Award, ShieldCheck, Key } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/department/profile'));
</script>

<svelte:head>
  <title>{t('department.profile')} — {user?.name || 'Revenue Department'}</title>
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
        <h1 class="text-base font-bold text-slate-900 tracking-tight">{t('department.profileTitle')}</h1>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
          {t('department.authorizedOfficial')}
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <div class="p-6 w-full max-w-4xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-2xs space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 pb-6">
          <div class="w-16 h-16 rounded-full bg-[#062206] text-[#9df79e] font-black text-xl flex items-center justify-center border border-[#143A14] shadow-md shrink-0">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p class="text-xs font-bold text-[#1565C0] mt-0.5">{user?.departmentName || 'Revenue Department'}</p>
            <div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/20 px-3 py-0.5 text-[10px] font-bold text-[#2E7D32]">
              Status: Active & Government Verified
            </div>
          </div>
        </div>

        <!-- Readonly Official Fields -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Government Email</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Mail class="h-4 w-4 text-[#1565C0] shrink-0" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Official Employee ID</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono">
              <Award class="h-4 w-4 text-[#1565C0] shrink-0" />
              <span>{user?.phone || 'REV-TN-2024-9102'}</span>
            </div>
          </div>

          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Department</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Building2 class="h-4 w-4 text-[#1565C0] shrink-0" />
              <span>{user?.departmentName || 'Revenue Department'}</span>
            </div>
          </div>

          <div class="rounded-xl bg-[#f2f4f6] p-4 border border-slate-200">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Taluk / Jurisdiction</span>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <MapPin class="h-4 w-4 text-[#1565C0] shrink-0" />
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
      </div>
    </div>
  </div>
{/if}

