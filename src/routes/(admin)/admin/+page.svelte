<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { departments } from '$lib/data/departments';
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
    Shield,
    FileText,
    Clock,
    XCircle,
    UserCheck,
    MessageCircleQuestion,
    TrendingUp
  } from '@lucide/svelte';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);
  const services = $derived(data.catalog.services);
  const stats = $derived(data.stats);

  let showInspectorModal = $state(false);
  const totalServices = $derived(services.length);
  const nativeServices = $derived(services.filter((s: any) => s.implementationMode === 'NATIVE_WORKFLOW').length);
  const apiServices = $derived(services.filter((s: any) => s.implementationMode === 'API_INTEGRATED').length);
  const externalServices = $derived(services.filter((s: any) => s.implementationMode === 'EXTERNAL_REDIRECT').length);

  function getDeptName(deptId: string): string {
    const dept = departments.find(d => d.id === deptId);
    return dept ? (currentLocale === 'ta' ? dept.nameTA : dept.shortName || dept.name) : deptId.replace('dept-', '');
  }

  // Calculate bar widths for chart
  function barWidth(value: number, max: number): number {
    return max > 0 ? Math.max(8, (value / max) * 100) : 8;
  }

  const maxStatusCount = $derived(Math.max(...Object.values(stats.statusBreakdown).map(v => Number(v)), 1));
  const maxDeptCount = $derived(Math.max(...Object.values(stats.departmentBreakdown).map(v => Number(v)), 1));

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-400',
    SUBMITTED: 'bg-blue-500',
    DOCUMENT_VERIFICATION: 'bg-indigo-500',
    OFFICER_REVIEW: 'bg-purple-500',
    FIELD_VERIFICATION: 'bg-violet-500',
    CLARIFICATION_REQUESTED: 'bg-amber-500',
    APPROVAL: 'bg-cyan-500',
    APPROVED: 'bg-emerald-500',
    REJECTED: 'bg-rose-500',
    CERTIFICATE_GENERATED: 'bg-green-500',
    COMPLETED: 'bg-teal-500',
    CANCELLED: 'bg-gray-500'
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    DOCUMENT_VERIFICATION: 'Doc Verification',
    OFFICER_REVIEW: 'Officer Review',
    FIELD_VERIFICATION: 'Field Verification',
    CLARIFICATION_REQUESTED: 'Clarification',
    APPROVAL: 'Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CERTIFICATE_GENERATED: 'Certificate Ready',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };
</script>

<svelte:head>
  <title>{t('admin.title')} — TN Hub</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
      <p class="mt-2 text-xs text-text-muted">Only authorized System Administrators can access this dashboard. Please log in with an administrator account.</p>
      <a href="/login?redirect=/admin" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow transition hover:bg-primary-hover">
        Log In as Admin
      </a>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-h1 text-white">{t('admin.title')}</h1>
            <p class="text-xs text-white/70">Platform usage analytics & service architecture overview</p>
          </div>

          <button onclick={() => showInspectorModal = true} class="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-bold text-primary shadow hover:bg-surface-container transition">
            <Layers class="h-4 w-4" /> System Service Inspector
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Primary Platform Stats -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <FileText class="h-4 w-4 text-blue-500" />
            Total Applications
          </div>
          <div class="mt-2 text-3xl font-bold text-[#316342]">{stats.totalApplications}</div>
          <div class="mt-1 text-[10px] font-bold text-[#316342]">{stats.approvedApplications} approved</div>
        </div>

        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Clock class="h-4 w-4 text-amber-500" />
            Pending Review
          </div>
          <div class="mt-2 text-3xl font-bold text-amber-600">{stats.pendingApplications}</div>
          <div class="mt-1 text-[10px] font-bold text-rose-500">{stats.rejectedApplications} rejected</div>
        </div>

        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Users class="h-4 w-4 text-indigo-500" />
            Total Users
          </div>
          <div class="mt-2 text-3xl font-bold text-indigo-700">{stats.totalUsers}</div>
          <div class="mt-1 text-[10px] font-bold text-slate-500">{stats.citizenUsers} citizens • {stats.operatorUsers + stats.officerUsers} officials</div>
        </div>

        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Activity class="h-4 w-4 text-emerald-500" />
            Total Services
          </div>
          <div class="mt-2 text-3xl font-bold text-[#316342]">{totalServices}</div>
          <div class="mt-1 text-[10px] font-bold text-slate-500">{nativeServices} native • {apiServices} API • {externalServices} external</div>
        </div>
      </div>

      <!-- Quick Action Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <a href="/admin/approvals" class="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <UserCheck class="h-4 w-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-slate-900">Registration Approvals</span>
              {#if stats.pendingRegistrations > 0}
                <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-bold">{stats.pendingRegistrations}</span>
              {/if}
            </div>
          </div>
          <p class="text-[10px] text-slate-500 mt-2">Pending operator & officer approvals</p>
        </a>

        <a href="/admin/helpdesk" class="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <MessageCircleQuestion class="h-4 w-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-slate-900">Help Desk</span>
              {#if stats.pendingQuestions > 0}
                <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] font-bold">{stats.pendingQuestions}</span>
              {/if}
            </div>
          </div>
          <p class="text-[10px] text-slate-500 mt-2">User inquiries & replies</p>
        </a>

        <a href="/admin/profile" class="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Shield class="h-4 w-4" />
            </div>
            <span class="text-xs font-bold text-slate-900">Admin Profile</span>
          </div>
          <p class="text-[10px] text-slate-500 mt-2">View account details</p>
        </a>

        <a href="/admin/settings" class="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition">
              <Settings class="h-4 w-4" />
            </div>
            <span class="text-xs font-bold text-slate-900">Settings</span>
          </div>
          <p class="text-[10px] text-slate-500 mt-2">Platform configuration</p>
        </a>
      </div>

      <!-- Charts Row -->
      <div class="grid lg:grid-cols-2 gap-6 mt-8">
        <!-- Application Status Distribution (Horizontal Bar Chart) -->
        <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-5">
            <BarChart3 class="h-5 w-5 text-primary" />
            <h2 class="text-sm font-bold text-text">Application Status Distribution</h2>
          </div>
          {#if Object.keys(stats.statusBreakdown).length === 0}
            <p class="text-xs text-slate-400 text-center py-8">No application data yet</p>
          {:else}
            <div class="space-y-2.5">
              {#each Object.entries(stats.statusBreakdown).sort((a, b) => Number(b[1]) - Number(a[1])) as [status, count]}
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold text-slate-600 w-28 truncate text-right">{statusLabels[status] || status}</span>
                  <div class="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      class="h-full rounded-lg flex items-center justify-end pr-2 text-[9px] font-bold text-white transition-all duration-700 {statusColors[status] || 'bg-slate-500'}"
                      style="width: {barWidth(Number(count), maxStatusCount)}%"
                    >
                      {count}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Department Load (Horizontal Bar Chart) -->
        <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-5">
            <Building2 class="h-5 w-5 text-primary" />
            <h2 class="text-sm font-bold text-text">Department Application Load</h2>
          </div>
          {#if Object.keys(stats.departmentBreakdown).length === 0}
            <p class="text-xs text-slate-400 text-center py-8">No application data yet</p>
          {:else}
            <div class="space-y-2.5">
              {#each Object.entries(stats.departmentBreakdown).sort((a, b) => Number(b[1]) - Number(a[1])) as [deptId, count]}
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold text-slate-600 w-28 truncate text-right">{getDeptName(deptId)}</span>
                  <div class="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      class="h-full rounded-lg bg-gradient-to-r from-[#071A28] to-[#143A14] flex items-center justify-end pr-2 text-[9px] font-bold text-white transition-all duration-700"
                      style="width: {barWidth(Number(count), maxDeptCount)}%"
                    >
                      {count}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- User Breakdown Row -->
      <div class="grid lg:grid-cols-3 gap-4 mt-6">
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <Users class="h-6 w-6" />
          </div>
          <div class="text-2xl font-bold text-slate-900">{stats.citizenUsers}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mt-1">Registered Citizens</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <TrendingUp class="h-6 w-6" />
          </div>
          <div class="text-2xl font-bold text-slate-900">{stats.operatorUsers}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mt-1">Kiosk Operators</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <Shield class="h-6 w-6" />
          </div>
          <div class="text-2xl font-bold text-slate-900">{stats.officerUsers}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mt-1">Department Officers</div>
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
                  <td class="p-3 text-text-muted">{getDeptName(svc.departmentId)}</td>
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
