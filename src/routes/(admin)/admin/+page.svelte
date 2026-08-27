<script>

  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { departments } from '$lib/data/departments';
  import {
    BarChart3,
    CheckCircle,
    Building2,
    Zap,
    ExternalLink,
    Users,
    Activity,
    Shield,
    FileText,
    Clock,
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
const totalServices = $derived(services.length);
const nativeServices = $derived(services.filter((s) => s.implementationMode === 'NATIVE_WORKFLOW').length);
const apiServices = $derived(services.filter((s) => s.implementationMode === 'API_INTEGRATED').length);
const externalServices = $derived(services.filter((s) => s.implementationMode === 'EXTERNAL_REDIRECT').length);
function getDeptName(deptId) {
    const dept = departments.find(d => d.id === deptId);
    return dept ? (currentLocale === 'ta' ? dept.nameTA : dept.shortName || dept.name) : deptId.replace('dept-', '');
}
// Calculate bar widths for chart
function barWidth(value, max) {
    return max > 0 ? Math.max(8, (value / max) * 100) : 8;
}
const maxStatusCount = $derived(Math.max(...Object.values(stats.statusBreakdown).map(v => Number(v)), 1));
const maxDeptCount = $derived(Math.max(...Object.values(stats.departmentBreakdown).map(v => Number(v)), 1));
const statusColors = {
    DRAFT: 'bg-muted text-text',
    SUBMITTED: 'bg-primary text-white',
    DOCUMENT_VERIFICATION: 'bg-warning text-white',
    OFFICER_REVIEW: 'bg-primary text-white',
    FIELD_VERIFICATION: 'bg-warning text-white',
    CLARIFICATION_REQUESTED: 'bg-warning text-white',
    APPROVAL: 'bg-primary text-white',
    APPROVED: 'bg-success text-white',
    REJECTED: 'bg-danger text-white',
    CERTIFICATE_GENERATED: 'bg-success text-white',
    COMPLETED: 'bg-success text-white',
    CANCELLED: 'bg-muted text-text'
};
const statusLabels = {
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
  <title>{t('admin.title')} â€” TN Hub</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
      <p class="mt-2 text-xs text-text-muted">Only authorized System Administrators can access this dashboard. Please log in with an administrator account.</p>
      <a href="/login?redirect=/admin" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow transition hover:bg-primary-hover">
        Log In
      </a>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-12 text-text">
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-h1 text-white">{t('admin.title')}</h1>
            <p class="text-xs text-white/70">Platform usage analytics & service architecture overview</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Primary Platform Stats -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <FileText class="h-4 w-4 text-primary" />
            Total Applications
          </div>
          <div class="mt-2 text-3xl font-bold text-primary">{stats.totalApplications}</div>
          <div class="mt-1 text-[10px] font-bold text-success">{stats.approvedApplications} approved</div>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Clock class="h-4 w-4 text-warning" />
            Pending Review
          </div>
          <div class="mt-2 text-3xl font-bold text-warning">{stats.pendingApplications}</div>
          <div class="mt-1 text-[10px] font-bold text-danger">{stats.rejectedApplications} rejected</div>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Users class="h-4 w-4 text-primary" />
            Total Users
          </div>
          <div class="mt-2 text-3xl font-bold text-primary">{stats.totalUsers}</div>
          <div class="mt-1 text-[10px] font-bold text-text-muted">{stats.citizenUsers} citizens â€¢ {stats.operatorUsers + stats.officerUsers} officials</div>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1">
          <div class="flex items-center gap-2 text-xs font-medium text-text-muted">
            <Activity class="h-4 w-4 text-success" />
            Total Services
          </div>
          <div class="mt-2 text-3xl font-bold text-primary">{totalServices}</div>
          <div class="mt-1 text-[10px] font-bold text-text-muted">{nativeServices} native â€¢ {apiServices} API â€¢ {externalServices} external</div>
        </div>
      </div>

      <!-- Quick Action Cards -->
      <div class="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
        <a href="/admin/approvals" class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1 hover:shadow-vazhi-2 transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-primary-soft text-primary-soft-text flex items-center justify-center group-hover:scale-110 transition">
              <UserCheck class="h-4 w-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-text">Registration Approvals</span>
              {#if stats.pendingRegistrations > 0}
                <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger text-white text-[9px] font-bold">{stats.pendingRegistrations}</span>
              {/if}
            </div>
          </div>
          <p class="text-[10px] text-text-muted mt-2">Pending operator & officer approvals</p>
        </a>

        <a href="/admin/helpdesk" class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1 hover:shadow-vazhi-2 transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-warning-soft text-warning flex items-center justify-center group-hover:scale-110 transition">
              <MessageCircleQuestion class="h-4 w-4" />
            </div>
            <div>
              <span class="text-xs font-bold text-text">Help Desk</span>
              {#if stats.pendingQuestions > 0}
                <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-warning text-white text-[9px] font-bold">{stats.pendingQuestions}</span>
              {/if}
            </div>
          </div>
          <p class="text-[10px] text-text-muted mt-2">User inquiries & replies</p>
        </a>

        <a href="/admin/profile" class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1 hover:shadow-vazhi-2 transition group">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-success-soft text-success flex items-center justify-center group-hover:scale-110 transition">
              <Shield class="h-4 w-4" />
            </div>
            <span class="text-xs font-bold text-text">Admin Profile</span>
          </div>
          <p class="text-[10px] text-text-muted mt-2">View account details</p>
        </a>

      </div>

      <!-- Charts Row -->
      <div class="grid lg:grid-cols-2 gap-6 mt-8">
        <!-- Application Status Distribution (Horizontal Bar Chart) -->
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-vazhi-1">
          <div class="flex items-center gap-2 mb-5">
            <BarChart3 class="h-5 w-5 text-primary" />
            <h2 class="text-sm font-bold text-text">Application Status Distribution</h2>
          </div>
          {#if Object.keys(stats.statusBreakdown).length === 0}
            <p class="text-xs text-text-faint text-center py-8">No application data yet</p>
          {:else}
            <div class="space-y-2.5">
              {#each Object.entries(stats.statusBreakdown).sort((a, b) => Number(b[1]) - Number(a[1])) as [status, count]}
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold text-text-muted w-28 truncate text-right">{statusLabels[status] || status}</span>
                  <div class="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                    <div
                      class="h-full rounded-lg flex items-center justify-end pr-2 text-[9px] font-bold transition-all duration-700 {statusColors[status] || 'bg-muted text-text'}"
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
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-vazhi-1">
          <div class="flex items-center gap-2 mb-5">
            <Building2 class="h-5 w-5 text-primary" />
            <h2 class="text-sm font-bold text-text">Department Application Load</h2>
          </div>
          {#if Object.keys(stats.departmentBreakdown).length === 0}
            <p class="text-xs text-text-faint text-center py-8">No application data yet</p>
          {:else}
            <div class="space-y-2.5">
              {#each Object.entries(stats.departmentBreakdown).sort((a, b) => Number(b[1]) - Number(a[1])) as [deptId, count]}
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold text-text-muted w-28 truncate text-right">{getDeptName(deptId)}</span>
                  <div class="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                    <div
                      class="h-full rounded-lg bg-primary flex items-center justify-end pr-2 text-[9px] font-bold text-white transition-all duration-700"
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
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1 text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-primary-soft text-primary-soft-text flex items-center justify-center mb-3">
            <Users class="h-6 w-6" />
          </div>
          <div class="text-2xl font-bold text-text">{stats.citizenUsers}</div>
          <div class="text-[10px] font-bold text-text-muted uppercase mt-1">Registered Citizens</div>
        </div>
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1 text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-success-soft text-success flex items-center justify-center mb-3">
            <TrendingUp class="h-6 w-6" />
          </div>
          <div class="text-2xl font-bold text-text">{stats.operatorUsers}</div>
          <div class="text-[10px] font-bold text-text-muted uppercase mt-1">Kiosk Operators</div>
        </div>
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-vazhi-1 text-center">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-primary-soft text-primary-soft-text flex items-center justify-center mb-3">
            <Shield class="h-6 w-6" />
          </div>
          <div class="text-2xl font-bold text-text">{stats.officerUsers}</div>
          <div class="text-[10px] font-bold text-text-muted uppercase mt-1">Department Officers</div>
        </div>
      </div>

      <!-- Service Architecture Matrix Table -->
      <div class="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-vazhi-1">
        <h2 class="text-lg font-bold text-text mb-4">Service Integration Architecture Matrix</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-text">
            <thead class="bg-surface-container font-bold text-text-muted uppercase tracking-wider border-b border-border">
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
                <tr class="hover:bg-surface-container/70">
                  <td class="p-3 font-bold">{svc.name}</td>
                  <td class="p-3 text-text-muted">{getDeptName(svc.departmentId)}</td>
                  <td class="p-3 capitalize">{svc.category}</td>
                  <td class="p-3">
                    {#if svc.implementationMode === 'NATIVE_WORKFLOW'}
                      <span class="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 font-bold text-success">
                        <CheckCircle class="h-3 w-3" /> Native
                      </span>
                    {:else if svc.implementationMode === 'API_INTEGRATED'}
                      <span class="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 font-bold text-primary-soft-text">
                        <Zap class="h-3 w-3" /> API
                      </span>
                    {:else}
                      <span class="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 font-bold text-warning">
                        <ExternalLink class="h-3 w-3" /> External
                      </span>
                    {/if}
                  </td>
                  <td class="p-3">{svc.processingTimeDays}d â€¢ â‚¹{svc.fee}</td>
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
