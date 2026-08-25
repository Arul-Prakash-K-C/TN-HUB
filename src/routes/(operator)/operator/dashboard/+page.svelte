<script lang="ts">
  import { goto } from '$app/navigation';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { canAccessRoute } from '$lib/utils/authGuard';
  import { Shield, Monitor, UserCheck, PlusCircle, Search, FileText, CheckCircle2, Clock, Eye, AlertTriangle } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  let { data } = $props();

  const user = $derived($currentUser);
  const guard = $derived(canAccessRoute(user, '/operator/dashboard'));

  let searchSvc = $state('');
  let citizenId = $state('');
  let createError = $state('');
  let creatingServiceId = $state<string | null>(null);

  const applications = $derived(data.applications || []);
  const stats = $derived({
    total: applications.length,
    completed: applications.filter((a: any) => ['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED'].includes(a.status)).length,
    drafts: applications.filter((a: any) => a.status === 'DRAFT').length,
    pending: applications.filter((a: any) => !['COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED', 'DRAFT', 'REJECTED'].includes(a.status)).length
  });

  const filteredServices = $derived(
    data.catalog.services.filter((service: any) =>
      service.implementationMode === 'NATIVE_WORKFLOW' &&
      (service.name.toLowerCase().includes(searchSvc.toLowerCase()) || service.departmentId.includes(searchSvc.toLowerCase()))
    )
  );

  async function createAssistedDraft(serviceId: string) {
    creatingServiceId = serviceId;
    createError = '';
    try {
      const response = await fetch('/api/operator/applications', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ citizenId: citizenId.trim(), serviceId, formData: {} })
      });
      const body = await response.json().catch(() => null) as { application?: { id?: string; trackingId?: string }; message?: string } | null;
      if (!response.ok || !body?.application?.id) throw new Error(body?.message ?? 'Unable to create the assisted draft.');
      await goto(`/operator/applications/${body.application.id}/edit`);
    } catch (cause) {
      createError = cause instanceof Error ? cause.message : 'Unable to create the assisted draft.';
    } finally {
      creatingServiceId = null;
    }
  }
</script>

<svelte:head>
  <title>{t('operator.kioskPortal')} — TN Hub</title>
</svelte:head>

{#if !guard.allowed}
  <div class="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Access Restricted</h2>
      <p class="mt-2 text-xs text-slate-500">{guard.reason || 'Only authorized e-Sevai Kiosk Operators can access this portal.'}</p>
      <a href={guard.redirectTo || '/login'} class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#062206] py-3.5 text-xs font-bold text-white shadow hover:bg-[#143A14]">
        Operator Login
      </a>
    </div>
  </div>
{:else}
  <div class="bg-slate-50 min-h-screen pb-16">
    <!-- Operator Green Hero Section -->
    <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-[#143A14] py-8 px-6 sm:px-8">
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-500/30 px-3 py-1 text-[11px] font-bold text-primary-300">
            <Monitor class="h-3.5 w-3.5" />
            e-Sevai Kiosk Operator Desk • Egmore Center
          </div>
          <h1 class="text-2xl font-black mt-2">Assisted Service Application Kiosk</h1>
          <p class="text-xs text-primary-200 mt-1">Help citizens discover services, submit applications, and print generated certificates.</p>
        </div>

        <div class="text-right">
          <div class="text-xs font-bold text-primary-300 font-mono">Operator ID: ESV-CHN-0042</div>
          <div class="text-[11px] text-primary-200 font-semibold">{user?.name || 'Kannan M'}</div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      <!-- Operator Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[10px] font-bold uppercase tracking-wider">Total Assisted</span>
            <FileText class="h-4 w-4 text-blue-600" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">{stats.total}</div>
          <div class="text-[10px] text-slate-400 font-semibold mt-1">Applications registered</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[10px] font-bold uppercase tracking-wider">Completed / Approved</span>
            <CheckCircle2 class="h-4 w-4 text-emerald-600" />
          </div>
          <div class="text-2xl font-extrabold text-emerald-700 mt-2">{stats.completed}</div>
          <div class="text-[10px] text-slate-400 font-semibold mt-1">Certificates issued</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[10px] font-bold uppercase tracking-wider">Draft Applications</span>
            <Clock class="h-4 w-4 text-amber-600" />
          </div>
          <div class="text-2xl font-extrabold text-amber-700 mt-2">{stats.drafts}</div>
          <div class="text-[10px] text-slate-400 font-semibold mt-1">Pending submission</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[10px] font-bold uppercase tracking-wider">Under Review</span>
            <AlertTriangle class="h-4 w-4 text-[#062206]" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900 mt-2">{stats.pending}</div>
          <div class="text-[10px] text-slate-400 font-semibold mt-1">In official verification</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 Cols: Launcher -->
        <div class="lg:col-span-2 space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 class="text-base font-bold text-slate-900">Assisted Application Launcher</h2>
                <p class="text-xs text-slate-500">Select any government service to initiate an assisted application for a citizen.</p>
              </div>

              <div class="relative w-full sm:w-64">
                <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  bind:value={searchSvc}
                  placeholder="Search service for applicant..."
                  class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#062206] focus:bg-white transition"
                />
              </div>
            </div>

            <!-- Citizen lookup section -->
            <div class="mb-5 rounded-2xl border border-primary-100 bg-primary-50/20 p-4">
              <label for="assisted-citizen-id" class="block text-xs font-bold text-primary-950 uppercase tracking-wider">Citizen Phone Number or Email Address (Optional)</label>
              <div class="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="assisted-citizen-id"
                  bind:value={citizenId}
                  placeholder="e.g. 9876543210 or meena@demo.com"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-primary-500"
                />
                <a href="/operator/applications" class="shrink-0 text-xs font-bold text-primary-700 hover:text-primary-950 transition underline px-2">
                  My Assisted Drafts
                </a>
              </div>
              {#if createError}
                <p class="mt-2 text-xs font-bold text-rose-700">{createError}</p>
              {/if}
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              {#each filteredServices as svc}
                <div class="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-primary-300 hover:bg-primary-50/10 transition">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{svc.departmentId.replace('dept-', '')}</span>
                      <span class="text-[11px] font-bold text-primary-700">₹{svc.fee}</span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 mt-1">{svc.name}</h3>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                  </div>

                  <button
                    type="button"
                    onclick={() => createAssistedDraft(svc.id)}
                    disabled={creatingServiceId !== null}
                    class="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
                  >
                    <PlusCircle class="h-3.5 w-3.5" />
                    <span>{creatingServiceId === svc.id ? 'Creating draft...' : 'Create Assisted Draft'}</span>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right Col: Recent Applications -->
        <div class="space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-base font-bold text-slate-900 mb-4">Recent Kiosk Activity</h2>
            
            {#if applications.length === 0}
              <p class="text-xs text-slate-500 text-center py-6">No recently assisted applications found.</p>
            {:else}
              <div class="space-y-3.5">
                {#each applications.slice(0, 5) as app}
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start gap-2 text-xs">
                    <div>
                      <span class="font-mono font-bold text-primary-700">{app.applicationNumber}</span>
                      <h4 class="font-bold text-slate-900 mt-0.5">{app.serviceName}</h4>
                      <p class="text-[10px] text-slate-500 mt-0.5">Citizen: {app.citizenName}</p>
                    </div>
                    <span class="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider text-slate-700 shrink-0">
                      {app.status}
                    </span>
                  </div>
                {/each}
                <a href="/operator/applications" class="block text-center text-xs font-bold text-primary-700 hover:underline mt-2">
                  View All Assisted Applications
                </a>
              </div>
            {/if}
          </div>
        </div>

      </div>
    </div>
  </div>
{/if}
