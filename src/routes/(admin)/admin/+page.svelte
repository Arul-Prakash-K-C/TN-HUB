<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import type { ServiceCategory, ImplementationMode } from '$lib/types';
  import {
    Settings,
    BarChart3,
    CheckCircle,
    Building2,
    Zap,
    ExternalLink,
    Users,
    Activity,
    Layers,
    PlusCircle,
    Shield
  } from '@lucide/svelte';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);
  const services = $derived(data.catalog.services);

  let showInspectorModal = $state(false);
  const totalServices = $derived(services.length);
  const nativeServices = $derived(services.filter(s => s.implementationMode === 'NATIVE_WORKFLOW').length);
  const apiServices = $derived(services.filter(s => s.implementationMode === 'API_INTEGRATED').length);
  const externalServices = $derived(services.filter(s => s.implementationMode === 'EXTERNAL_REDIRECT').length);
</script>

<svelte:head>
  <title>{t('admin.title')} — Sympho Center</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Access Denied</h2>
      <p class="mt-2 text-xs text-slate-500">Only authorized System Administrators can access this dashboard. Please log in with an administrator account.</p>
      <a href="/login?redirect=/admin" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700">
        Log In as Admin
      </a>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="bg-primary text-white border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              System Administration
            </span>
            <h1 class="mt-2 text-h1 text-white">{t('admin.title')}</h1>
            <p class="text-xs text-white/70">Overview of 100+ Tamil Nadu Government Services & Workflows</p>
          </div>

          <button onclick={() => showInspectorModal = true} class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow hover:bg-slate-50 transition">
            <Layers class="h-4 w-4" /> System Service Inspector
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Platform Analytics Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="text-xs font-medium text-text-muted">{t('admin.stats.totalServices')}</div>
          <div class="mt-2 text-3xl font-bold text-primary">{totalServices}</div>
          <div class="mt-1 text-xs text-success">Active & Functional</div>
        </div>

        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="text-xs font-medium text-text-muted">{t('admin.stats.nativeServices')}</div>
          <div class="mt-2 text-3xl font-bold text-success-dark">{nativeServices}</div>
          <div class="mt-1 text-xs text-text-muted">Direct Sympho Flow</div>
        </div>

        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="text-xs font-medium text-text-muted">{t('admin.stats.apiServices')}</div>
          <div class="mt-2 text-3xl font-bold text-info-dark">{apiServices}</div>
          <div class="mt-1 text-xs text-text-muted">API Integrated</div>
        </div>

        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="text-xs font-medium text-text-muted">{t('admin.stats.externalServices')}</div>
          <div class="mt-2 text-3xl font-bold text-warning-dark">{externalServices}</div>
          <div class="mt-1 text-xs text-text-muted">External Redirect</div>
        </div>
      </div>

      <!-- Service Architecture Matrix Table -->
      <div class="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-text mb-4">Service Integration Architecture Matrix</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-text">
            <thead class="bg-surface-secondary font-bold text-text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th class="p-3">Service Name</th>
                <th class="p-3">Department</th>
                <th class="p-3">Category</th>
                <th class="p-3">Implementation Mode</th>
                <th class="p-3">SLA / Fee</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#each services as svc}
                <tr class="hover:bg-surface-secondary/50">
                  <td class="p-3 font-bold">{svc.name}</td>
                  <td class="p-3 text-text-muted">{svc.departmentId.replace('dept-', '')}</td>
                  <td class="p-3 capitalize">{svc.category}</td>
                  <td class="p-3">
                    {#if svc.implementationMode === 'NATIVE_WORKFLOW'}
                      <span class="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-0.5 font-bold text-success-dark">
                        <CheckCircle class="h-3 w-3" /> Native
                      </span>
                    {:else if svc.implementationMode === 'API_INTEGRATED'}
                      <span class="inline-flex items-center gap-1 rounded-full bg-info-light px-2.5 py-0.5 font-bold text-info-dark">
                        <Zap class="h-3 w-3" /> API
                      </span>
                    {:else}
                      <span class="inline-flex items-center gap-1 rounded-full bg-warning-light px-2.5 py-0.5 font-bold text-warning-dark">
                        <ExternalLink class="h-3 w-3" /> External
                      </span>
                    {/if}
                  </td>
                  <td class="p-3">{svc.processingTimeDays}d • ₹{svc.fee}</td>
                  <td class="p-3 font-bold text-success">Active</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showInspectorModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
    <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-lg font-bold text-slate-900">System Service & Integration Inspector</h3>
        <button onclick={() => showInspectorModal = false} class="text-slate-400 hover:text-slate-600 font-bold text-lg px-2">✕</button>
      </div>

      <p class="text-xs text-slate-600">
        Review active system configuration and integration parameters across native workflows, external adapters, and SLA targets.
      </p>

      <div class="grid grid-cols-3 gap-3 text-center py-2">
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="text-xl font-bold text-emerald-800">{nativeServices}</div>
          <div class="text-[10px] font-bold text-emerald-600 uppercase">Native Engine</div>
        </div>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="text-xl font-bold text-blue-800">{apiServices}</div>
          <div class="text-[10px] font-bold text-blue-600 uppercase">API Adapters</div>
        </div>
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div class="text-xl font-bold text-amber-800">{externalServices}</div>
          <div class="text-[10px] font-bold text-amber-600 uppercase">External Redirects</div>
        </div>
      </div>

      <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
        {#each services as svc}
          <div class="p-3 flex items-center justify-between">
            <div>
              <span class="font-bold text-slate-900">{svc.name}</span>
              <span class="text-[10px] text-slate-500 block font-mono">Slug: {svc.slug} • SLA: {svc.processingTimeDays} Days</span>
            </div>
            <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
              {svc.implementationMode}
            </span>
          </div>
        {/each}
      </div>

      <div class="flex justify-end pt-2">
        <button onclick={() => showInspectorModal = false} class="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition">
          Close Inspector
        </button>
      </div>
    </div>
  </div>
{/if}

