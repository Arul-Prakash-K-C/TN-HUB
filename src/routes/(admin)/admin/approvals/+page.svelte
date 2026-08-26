<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { departments } from '$lib/data/departments';
  import {
    UserCheck,
    UserX,
    Shield,
    Clock,
    Building2,
    Mail,
    CheckCircle,
    XCircle,
    Loader2,
    AlertTriangle,
    Search
  } from '@lucide/svelte';
  import { onMount } from 'svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let pendingUsers: any[] = $state([]);
  let loading = $state(true);
  let error = $state('');
  let actionLoading = $state<string | null>(null);
  let confirmAction = $state<{ uid: string; name: string; action: 'approve' | 'reject' } | null>(null);
  let statusFilter = $state<'ALL' | 'APPLIED' | 'APPROVED' | 'REJECTED'>('ALL');
  let searchQuery = $state('');
  const appliedCount = $derived(pendingUsers.filter((user) => getRegistrationStatus(user) === 'APPLIED').length);
  const approvedCount = $derived(pendingUsers.filter((user) => getRegistrationStatus(user) === 'APPROVED').length);
  const rejectedCount = $derived(pendingUsers.filter((user) => getRegistrationStatus(user) === 'REJECTED').length);
  const filteredRegistrations = $derived.by(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return pendingUsers.filter((user) => {
      if (statusFilter !== 'ALL' && getRegistrationStatus(user) !== statusFilter) return false;
      if (!normalizedQuery) return true;
      return [user.displayName, user.email, user.departmentId, user.role, user.desiredRole]
        .some((value) => typeof value === 'string' && value.toLowerCase().includes(normalizedQuery));
    });
  });

  function getDeptName(deptId: string | null): string {
    if (!deptId) return 'N/A';
    const dept = departments.find(d => d.id === deptId);
    return dept ? (currentLocale === 'ta' ? dept.nameTA : dept.name) : deptId;
  }

  function getRoleBadge(role: string): string {
    if (role === 'operator') return 'Kiosk Operator';
    if (role === 'department_user') return 'Department Officer';
    return role;
  }

  function getRegistrationStatus(user: any): 'APPLIED' | 'APPROVED' | 'REJECTED' {
    if (user.registrationStatus === 'APPROVED' || user.registrationStatus === 'REJECTED') {
      return user.registrationStatus;
    }
    return user.approved === true ? 'APPROVED' : 'APPLIED';
  }

  function getStatusBadge(status: 'APPLIED' | 'APPROVED' | 'REJECTED'): string {
    if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'REJECTED') return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }

  function getStatusLabel(status: 'APPLIED' | 'APPROVED' | 'REJECTED'): string {
    if (status === 'APPROVED') return t('admin.registration.status.approved');
    if (status === 'REJECTED') return t('admin.registration.status.rejected');
    return t('admin.registration.status.applied');
  }

  async function fetchPending() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/admin/registrations');
      if (!res.ok) throw new Error('Failed to load registrations.');
      const data = await res.json();
      pendingUsers = data.users || [];
    } catch (e: any) {
      error = e.message || 'Unable to load registrations.';
    } finally {
      loading = false;
    }
  }

  async function handleAction(uid: string, approved: boolean) {
    actionLoading = uid;
    error = '';
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, approved })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.registrationStatus) throw new Error(body?.message || 'Action failed.');
      pendingUsers = pendingUsers.map((user) => user.uid === uid
        ? {
            ...user,
            approved,
            isActive: approved,
            registrationStatus: body.registrationStatus
          }
        : user);
      confirmAction = null;
    } catch (e: any) {
      error = e.message || 'Unable to process action.';
    } finally {
      actionLoading = null;
    }
  }

  onMount(() => { fetchPending(); });
</script>

<svelte:head>
  <title>Registration Approvals — TN Hub Admin</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
      <p class="mt-2 text-xs text-text-muted">Admin access only.</p>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-h1 text-white">{t('admin.registration.title')}</h1>
        <p class="text-xs text-white/70">{t('admin.registration.subtitle')}</p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {#if error}
        <div class="mb-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertTriangle class="h-4 w-4 shrink-0" />
          {error}
        </div>
      {/if}

      {#if loading}
        <div class="flex items-center justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-[#316342]" />
          <span class="ml-3 text-sm text-slate-500">{t('admin.registration.loading')}</span>
        </div>
      {:else if pendingUsers.length === 0}
        <div class="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#316342]/10 text-[#316342]">
            <CheckCircle class="h-8 w-8" />
          </div>
          <h2 class="text-lg font-bold text-slate-900">All Clear!</h2>
          <p class="mt-2 text-xs text-slate-500">{t('admin.registration.empty')}</p>
        </div>
      {:else}
        <div class="mb-4 text-sm font-bold text-slate-700">
          {t('admin.registration.summary', { total: pendingUsers.length, applied: appliedCount })}
        </div>

        <div class="relative mb-4 max-w-md">
          <Search class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            bind:value={searchQuery}
            placeholder={t('admin.registration.search')}
            class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#316342]"
          />
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          {#each [
            { status: 'ALL', label: t('common.all'), count: pendingUsers.length },
            { status: 'APPLIED', label: t('admin.registration.status.applied'), count: appliedCount },
            { status: 'APPROVED', label: t('admin.registration.status.approved'), count: approvedCount },
            { status: 'REJECTED', label: t('admin.registration.status.rejected'), count: rejectedCount }
          ] as filter}
            <button
              type="button"
              onclick={() => statusFilter = filter.status as typeof statusFilter}
              class="rounded-xl border px-4 py-2 text-xs font-bold transition {statusFilter === filter.status ? 'border-[#316342] bg-[#316342] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
            >
              {filter.label} ({filter.count})
            </button>
          {/each}
        </div>

        {#if filteredRegistrations.length === 0}
          <div class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
            {t('admin.registration.filterEmpty')}
          </div>
        {:else}
        <div class="grid gap-4">
          {#each filteredRegistrations as user (user.uid)}
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#071A28] to-[#143A14] text-white font-bold text-lg flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900">{user.displayName || 'Unknown'}</h3>
                    <div class="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                      <Mail class="h-3 w-3" />
                      {user.email || 'N/A'}
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 border border-indigo-200">
                        <Shield class="h-3 w-3" />
                        {getRoleBadge(user.role || user.desiredRole || 'operator')}
                      </span>
                      {#if user.departmentId}
                        <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                          <Building2 class="h-3 w-3" />
                          {getDeptName(user.departmentId)}
                        </span>
                      {/if}
                      <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border {getStatusBadge(getRegistrationStatus(user))}">
                        <Clock class="h-3 w-3" />
                        {getStatusLabel(getRegistrationStatus(user))}
                      </span>
                    </div>
                  </div>
                </div>

                {#if getRegistrationStatus(user) === 'APPLIED'}
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      onclick={() => confirmAction = { uid: user.uid, name: user.displayName || user.email, action: 'approve' }}
                      disabled={actionLoading === user.uid}
                      class="inline-flex items-center gap-1.5 rounded-xl bg-[#316342] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#254b32] transition disabled:opacity-50"
                    >
                      <UserCheck class="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onclick={() => confirmAction = { uid: user.uid, name: user.displayName || user.email, action: 'reject' }}
                      disabled={actionLoading === user.uid}
                      class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-rose-300 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                    >
                      <UserX class="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

<!-- Confirmation Modal -->
{#if confirmAction}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center {confirmAction.action === 'approve' ? 'bg-[#316342]/10 text-[#316342]' : 'bg-rose-100 text-rose-600'}">
          {#if confirmAction.action === 'approve'}
            <CheckCircle class="h-5 w-5" />
          {:else}
            <XCircle class="h-5 w-5" />
          {/if}
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900">
            {confirmAction.action === 'approve' ? 'Approve Registration?' : 'Reject Registration?'}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {confirmAction.action === 'approve'
              ? `This will activate ${confirmAction.name}'s account and grant them portal access.`
              : t('admin.registration.rejectAudit', { name: confirmAction.name })
            }
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          onclick={() => confirmAction = null}
          class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          onclick={() => confirmAction && handleAction(confirmAction.uid, confirmAction.action === 'approve')}
          disabled={!!actionLoading}
          class="rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition disabled:opacity-50 {confirmAction.action === 'approve' ? 'bg-[#316342] hover:bg-[#254b32]' : 'bg-rose-600 hover:bg-rose-700'}"
        >
          {#if actionLoading}
            <Loader2 class="h-3.5 w-3.5 animate-spin inline mr-1" />
          {/if}
          {confirmAction.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        </button>
      </div>
    </div>
  </div>
{/if}
