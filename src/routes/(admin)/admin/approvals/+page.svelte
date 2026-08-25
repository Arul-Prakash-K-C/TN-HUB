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
    AlertTriangle
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

  async function fetchPending() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/admin/registrations');
      if (!res.ok) throw new Error('Failed to load registrations.');
      const data = await res.json();
      pendingUsers = data.users || [];
    } catch (e: any) {
      error = e.message || 'Unable to load pending registrations.';
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
      if (!res.ok) throw new Error('Action failed.');
      pendingUsers = pendingUsers.filter(u => u.uid !== uid);
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
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Access Denied</h2>
      <p class="mt-2 text-xs text-slate-500">Admin access only.</p>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="bg-primary text-white border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          User Management
        </span>
        <h1 class="mt-2 text-h1 text-white">Registration Approvals</h1>
        <p class="text-xs text-white/70">Review and approve pending Operator & Officer registration requests</p>
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
          <Loader2 class="h-8 w-8 animate-spin text-emerald-600" />
          <span class="ml-3 text-sm text-slate-500">Loading pending registrations…</span>
        </div>
      {:else if pendingUsers.length === 0}
        <div class="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle class="h-8 w-8" />
          </div>
          <h2 class="text-lg font-bold text-slate-900">All Clear!</h2>
          <p class="mt-2 text-xs text-slate-500">No pending registration requests at this time.</p>
        </div>
      {:else}
        <div class="mb-4 text-sm font-bold text-slate-700">
          {pendingUsers.length} pending request{pendingUsers.length !== 1 ? 's' : ''}
        </div>

        <div class="grid gap-4">
          {#each pendingUsers as user (user.uid)}
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
                      <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                        <Clock class="h-3 w-3" />
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    onclick={() => confirmAction = { uid: user.uid, name: user.displayName || user.email, action: 'approve' }}
                    disabled={actionLoading === user.uid}
                    class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
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
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Confirmation Modal -->
{#if confirmAction}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center {confirmAction.action === 'approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
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
              : `This will permanently remove ${confirmAction.name}'s registration request.`
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
          class="rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition disabled:opacity-50 {confirmAction.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}"
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
