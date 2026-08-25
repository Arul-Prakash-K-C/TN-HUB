<script lang="ts">
  import { goto } from '$app/navigation';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { Shield, Monitor, UserCheck, PlusCircle, Search, FileText } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  let { data } = $props();

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/operator/dashboard'));

  let searchSvc = $state('');
  let citizenId = $state('');
  let createError = $state('');
  let creatingServiceId = $state<string | null>(null);
  const filteredServices = $derived(
    data.catalog.services.filter((service) =>
      service.implementationMode === 'NATIVE_WORKFLOW' &&
      (service.name.toLowerCase().includes(searchSvc.toLowerCase()) || service.departmentId.includes(searchSvc.toLowerCase()))
    )
  );
  async function createAssistedDraft(serviceId: string) {
    if (!citizenId.trim()) {
      createError = 'Enter the citizen’s phone number or email address before creating an assisted draft.';
      return;
    }

    creatingServiceId = serviceId;
    createError = '';
    try {
      const response = await fetch('/api/operator/applications', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ citizenId: citizenId.trim(), serviceId, formData: {} })
      });
      const body = await response.json().catch(() => null) as { application?: { trackingId?: string }; message?: string } | null;
      if (!response.ok || !body?.application) throw new Error(body?.message ?? 'Unable to create the assisted draft.');
      await goto('/operator/applications');
    } catch (cause) {
      createError = cause instanceof Error ? cause.message : 'Unable to create the assisted draft.';
    } finally {
      creatingServiceId = null;
    }
  }
</script>

<svelte:head>
  <title>{t('operator.kioskPortal')} — Sympho Center</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Access Restricted</h2>
      <p class="mt-2 text-xs text-slate-500">{guard.reason || 'Only authorized e-Sevai Kiosk Operators can access this portal.'}</p>
      <a href={guard.redirectTo || '/login'} class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow hover:bg-indigo-700">
        Operator Login
      </a>
    </div>
  </div>
{:else}
  <div class="bg-slate-50 min-h-screen pb-16">
    <div class="bg-indigo-950 text-white border-b border-indigo-900 py-8 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-[11px] font-bold text-indigo-300">
            <Monitor class="h-3.5 w-3.5" />
            e-Sevai Kiosk Operator Desk • Egmore Center
          </div>
          <h1 class="text-2xl font-black mt-2">Assisted Service Application Kiosk</h1>
          <p class="text-xs text-indigo-200 mt-1">Help citizens discover services, submit applications, and print generated certificates.</p>
        </div>

        <div class="text-right">
          <div class="text-xs font-bold text-indigo-300">Operator ID: ESV-CHN-0042</div>
          <div class="text-[11px] text-indigo-200">{user?.name || 'Kannan M'}</div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <!-- Fast Service Launcher -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-base font-bold text-slate-900">Assisted Application Launcher</h2>
            <p class="text-xs text-slate-500">Select any government service to initiate an assisted application for a citizen.</p>
          </div>

          <div class="relative w-full sm:w-72">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              bind:value={searchSvc}
              placeholder="Search service for applicant..."
              class="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div class="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <label for="assisted-citizen-id" class="block text-xs font-bold text-indigo-950">Citizen Phone Number or Email Address *</label>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="assisted-citizen-id"
              bind:value={citizenId}
              placeholder="e.g. 9876543210 or meena@demo.com"
              class="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
            />
            <a href="/operator/applications" class="shrink-0 text-xs font-bold text-indigo-700 hover:underline">My assisted drafts</a>
          </div>
          {#if createError}
            <p class="mt-2 text-xs font-semibold text-rose-700">{createError}</p>
          {/if}
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each filteredServices as svc}
            <div class="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-indigo-300 hover:bg-indigo-50/30 transition">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{svc.departmentId.replace('dept-', '')}</span>
                  <span class="text-[11px] font-bold text-indigo-700">₹{svc.fee}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 mt-1">{svc.name}</h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
              </div>

              <button
                type="button"
                onclick={() => createAssistedDraft(svc.id)}
                disabled={creatingServiceId !== null}
                class="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
              >
                <PlusCircle class="h-3.5 w-3.5" />
                <span>{creatingServiceId === svc.id ? 'Creating draft...' : 'Create Assisted Draft'}</span>
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
