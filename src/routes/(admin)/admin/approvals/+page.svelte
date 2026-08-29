<script>
  import { tt, locale } from "$lib/i18n";
  import { currentUser, isAuthenticated, userRole } from "$lib/stores/auth";
  import { departments } from "$lib/data/departments";
  import RequestedRoleBadge from "$lib/components/ui/RequestedRoleBadge.svelte";
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
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
  } from "@lucide/svelte";
  import { onMount } from "svelte";

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let pendingUsers = $state([]);
  let loading = $state(true);
  let error = $state("");
  let actionLoading = $state(null);
  let confirmAction = $state(null);
  let statusFilter = $state("ALL");
  let searchQuery = $state("");
  let showFilters = $state(true);
  let currentPage = $state(1);
  const rowsPerPage = 7;

  const appliedCount = $derived(
    pendingUsers.filter((user) => getRegistrationStatus(user) === "APPLIED")
      .length,
  );
  const approvedCount = $derived(
    pendingUsers.filter((user) => getRegistrationStatus(user) === "APPROVED")
      .length,
  );
  const rejectedCount = $derived(
    pendingUsers.filter((user) => getRegistrationStatus(user) === "REJECTED")
      .length,
  );

  const filteredRegistrations = $derived.by(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return pendingUsers.filter((user) => {
      if (
        statusFilter !== "ALL" &&
        getRegistrationStatus(user) !== statusFilter
      )
        return false;
      if (!normalizedQuery) return true;
      return [
        user.displayName,
        user.email,
        user.departmentId,
        user.role,
        user.desiredRole,
      ].some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(normalizedQuery),
      );
    });
  });

  const totalPages = $derived(
    Math.max(1, Math.ceil(filteredRegistrations.length / rowsPerPage)),
  );
  const paginatedRegistrations = $derived.by(() => {
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (safePage - 1) * rowsPerPage;
    return filteredRegistrations.slice(start, start + rowsPerPage);
  });
  const showingFrom = $derived(
    filteredRegistrations.length === 0
      ? 0
      : (Math.min(currentPage, totalPages) - 1) * rowsPerPage + 1,
  );
  const showingTo = $derived(
    Math.min(
      filteredRegistrations.length,
      Math.min(currentPage, totalPages) * rowsPerPage,
    ),
  );

  $effect(() => {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }
  });

  function getDeptName(deptId) {
    if (!deptId) return "N/A";
    const dept = departments.find((d) => d.id === deptId);
    return dept ? (currentLocale === "ta" ? dept.nameTA : dept.name) : deptId;
  }

  function getRoleBadge(role) {
    if (role === "operator") return t("role.operator");
    if (role === "department_user") return "Department Officer";
    return role;
  }

  function getRegistrationStatus(user) {
    if (
      user.registrationStatus === "APPROVED" ||
      user.registrationStatus === "REJECTED"
    ) {
      return user.registrationStatus;
    }
    return user.approved === true ? "APPROVED" : "APPLIED";
  }

  function getStatusBadge(status) {
    if (status === "APPROVED")
      return "bg-status-approved-bg text-status-approved-text border-border";
    if (status === "REJECTED")
      return "bg-status-rejected-bg text-status-rejected-text border-border";
    return "bg-status-pending-bg text-status-pending-text border-border";
  }

  function getStatusLabel(status) {
    if (status === "APPROVED") return "Verified";
    if (status === "REJECTED") return "Rejected";
    return "Applied";
  }

  function exportCurrentView() {
    const rows = filteredRegistrations.map((user) => [
      user.displayName || "Unknown",
      user.email || "N/A",
      getRoleBadge(user.role || user.desiredRole || "operator"),
      getDeptName(user.departmentId),
      getStatusLabel(getRegistrationStatus(user)),
    ]);
    const csv = [
      [
        "Name",
        "Email Address",
        "Requested Role",
        "Assigned Department",
        "Status",
      ],
      ...rows,
    ]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `application-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function getPaginationItems(page, pages) {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, "...", pages];
    }
    if (page >= pages - 3) {
      return [1, "...", pages - 3, pages - 2, pages - 1, pages];
    }
    return [1, "...", page - 1, page, page + 1, "...", pages];
  }

  async function fetchPending() {
    loading = true;
    error = "";
    try {
      const res = await fetch("/api/admin/registrations");
      if (!res.ok) throw new Error("Failed to load registrations.");
      const data = await res.json();
      pendingUsers = data.users || [];
    } catch (e) {
      error = e.message || "Unable to load registrations.";
    } finally {
      loading = false;
    }
  }

  async function handleAction(uid, approved) {
    actionLoading = uid;
    error = "";
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uid, approved }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.registrationStatus)
        throw new Error(body?.message || "Action failed.");

      pendingUsers = pendingUsers.map((user) =>
        user.uid === uid
          ? {
              ...user,
              approved,
              isActive: approved,
              registrationStatus: body.registrationStatus,
            }
          : user,
      );
      confirmAction = null;
    } catch (e) {
      error = e.message || "Unable to process action.";
    } finally {
      actionLoading = null;
    }
  }

  onMount(() => {
    fetchPending();
  });
</script>

<svelte:head>
  <title>{t('ui.routes.admin.admin.approvals.6c857d11')}</title>
</svelte:head>

{#if !authenticated || role !== "admin"}
  <div
    class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background"
  >
    <div
      class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10"
    >
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning"
      >
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">{t('ui.routes.admin.admin.approvals.ca62e291')}</h2>
      <p class="mt-2 text-xs text-text-muted">{t('ui.routes.admin.admin.approvals.c8e4e8be')}</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-background text-text">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {#if error}
        <div
          class="mb-6 flex items-center gap-2 rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3 text-xs font-bold text-danger shadow-sm"
        >
          <AlertTriangle class="h-4 w-4 shrink-0" />
          {error}
        </div>
      {/if}

      {#if loading}
        <div class="flex items-center justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <span class="ml-3 text-sm text-text-muted font-bold"
            >{t('ui.routes.admin.admin.approvals.9c654d78')}</span
          >
        </div>
      {:else}
        <div
          class="rounded-[28px] border border-border bg-surface shadow-vazhi-2"
        >
          <div
            class="flex flex-col gap-4 border-b border-border px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between"
          >
            <div class="space-y-1">
              <h1
                class="text-3xl font-black tracking-tight text-text sm:text-[2.1rem]"
              >
                {t('ui.application.requests')}
              </h1>
              <p class="text-sm text-text-muted">
                {t('ui.manage.and.verify.departmental.officer.applications')}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick={() => (showFilters = !showFilters)}
                class="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted px-4 py-2.5 text-xs font-bold text-text-muted shadow-sm transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
              >
                <Filter class="h-4 w-4" />
                {t('common.filter')}
              </button>
              <button
                type="button"
                onclick={exportCurrentView}
                class="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted px-4 py-2.5 text-xs font-bold text-text-muted shadow-sm transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
              >
                <Download class="h-4 w-4" />
                {t('ui.export')}
              </button>
            </div>
          </div>

          {#if showFilters}
            <div
              class="flex flex-col gap-4 border-b border-border px-6 py-5 sm:px-8"
            >
              <div class="relative max-w-md">
                <Search
                  class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint"
                />
                <input
                  bind:value={searchQuery}
                  oninput={() => (currentPage = 1)}
                  placeholder={t('ui.search.by.name.email.or.role')}
                  class="w-full rounded-2xl border border-border bg-muted py-3 pl-10 pr-4 text-sm font-medium text-text outline-none shadow-sm transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div class="flex flex-wrap gap-2">
                {#each [{ status: "ALL", label: "All Users", count: pendingUsers.length }, { status: "APPLIED", label: "Applied", count: appliedCount }, { status: "APPROVED", label: "Verified", count: approvedCount }, { status: "REJECTED", label: "Rejected", count: rejectedCount }] as filter}
                  <button
                    type="button"
                    onclick={() => {
                      statusFilter = filter.status;
                      currentPage = 1;
                    }}
                    class="rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 {statusFilter ===
                    filter.status
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-border bg-muted text-text-muted hover:border-primary/30 hover:bg-primary-soft hover:text-primary'}"
                  >
                    {filter.label} ({filter.count})
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          {#if filteredRegistrations.length === 0}
            <div class="px-8 py-16 text-center">
              <div
                class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary"
              >
                <UserCheck class="h-5 w-5" />
              </div>
              <p class="text-sm font-bold text-text">{t('ui.routes.admin.admin.approvals.d2d065e2')}</p>
              <p class="mt-1 text-xs text-text-muted">
                {t('ui.try.changing.the.search.or.filter.criteria')}
              </p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse text-left">
                <thead>
                  <tr
                    class="border-b border-border bg-table-header-bg text-[10px] font-black uppercase tracking-[0.18em] text-text-muted"
                  >
                    <th class="py-4 px-6">{t('ui.routes.admin.admin.approvals.6e32e8fd')}</th>
                    <th class="py-4 px-6">{t('ui.routes.admin.admin.approvals.f982f19c')}</th>
                    <th class="py-4 px-6">{t('ui.routes.admin.admin.approvals.8e02c3c9')}</th>
                    <th class="py-4 px-6">{t('ui.routes.admin.admin.approvals.6e5da442')}</th>
                    <th class="py-4 px-6">{t('ui.routes.admin.admin.approvals.59e87de7')}</th>
                    <th class="py-4 px-6 text-right">{t('ui.routes.admin.admin.approvals.90889dc0')}</th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-border text-sm text-text"
                >
                  {#each paginatedRegistrations as user (user.uid)}
                    <tr
                      class="bg-surface transition-colors hover:bg-primary-soft/40"
                    >
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <div
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-black text-primary-soft-text ring-1 ring-primary/10 dark:bg-primary/15 dark:text-primary"
                          >
                            {(user.displayName ||
                              user.email ||
                              "?")[0].toUpperCase()}
                          </div>
                          <div class="min-w-0">
                            <div class="truncate font-bold text-text">
                              {user.displayName || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-6 text-text-muted font-medium">
                        {user.email || "N/A"}
                      </td>
                      <td class="py-4 px-6">
                        <RequestedRoleBadge role={user.role || user.desiredRole || "operator"} />
                      </td>
                      <td class="py-4 px-6 text-text-muted">
                        {getDeptName(user.departmentId)}
                      </td>
                      <td class="py-4 px-6">
                        <span
                          class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold shadow-sm {getStatusBadge(
                            getRegistrationStatus(user),
                          )}"
                        >
                          {getStatusLabel(getRegistrationStatus(user))}
                        </span>
                      </td>
                      <td class="py-4 px-6 text-right">
                        {#if getRegistrationStatus(user) === "APPLIED"}
                          <div class="inline-flex gap-2">
                            <button
                              onclick={() =>
                                (confirmAction = {
                                  uid: user.uid,
                                  name: user.displayName || user.email,
                                  action: "approve",
                                })}
                              disabled={actionLoading === user.uid}
                              class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <UserCheck class="h-3.5 w-3.5" />
                              {t('ui.verify')}
                            </button>
                            <button
                              onclick={() =>
                                (confirmAction = {
                                  uid: user.uid,
                                  name: user.displayName || user.email,
                                  action: "reject",
                                })}
                              disabled={actionLoading === user.uid}
                              class="inline-flex items-center gap-1.5 rounded-xl border border-danger/20 bg-danger-soft px-3 py-2 text-[11px] font-bold text-danger transition hover:bg-danger-soft/80 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle class="h-3.5 w-3.5" />
                              {t('officer.reject')}
                            </button>
                          </div>
                        {:else}
                          <span
                            class="text-[10px] font-bold italic text-text-faint"
                            >{t('ui.routes.admin.admin.approvals.9591db5d')}</span
                          >
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <div
              class="flex flex-col items-start justify-between gap-4 border-t border-border px-6 py-4 text-xs text-text-muted sm:flex-row sm:items-center sm:px-8"
            >
              <p class="font-medium">
                Showing {showingFrom} to {showingTo} of {filteredRegistrations.length}
                results
              </p>

              <div
                class="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1 shadow-sm"
              >
                <button
                  type="button"
                  onclick={() => (currentPage = Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-primary/10"
                  aria-label={t('ui.previous.page')}
                >
                  <ChevronLeft class="h-4 w-4" />
                </button>

                {#each getPaginationItems(currentPage, totalPages) as item}
                  {#if item === "..."}
                    <span
                      class="inline-flex h-9 w-9 items-center justify-center text-text-faint"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </span>
                  {:else}
                    <button
                      type="button"
                      onclick={() => (currentPage = item)}
                      class="inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition {currentPage ===
                      item
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:bg-primary-soft hover:text-primary dark:hover:bg-primary/10'}"
                    >
                      {item}
                    </button>
                  {/if}
                {/each}

                <button
                  type="button"
                  onclick={() =>
                    (currentPage = Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-primary/10"
                  aria-label={t('ui.next.page')}
                >
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Confirmation Modal -->
{#if confirmAction}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/78 p-4 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-sm rounded-3xl bg-surface border border-border/40 p-6 shadow-2xl space-y-4 animate-scale-up"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center {confirmAction.action ===
          'approve'
            ? 'bg-primary-soft text-primary'
            : 'bg-danger-soft text-danger'}"
        >
          {#if confirmAction.action === "approve"}
            <CheckCircle class="h-5 w-5" />
          {:else}
            <XCircle class="h-5 w-5" />
          {/if}
        </div>
        <div>
          <h3 class="text-sm font-bold text-text">
            {confirmAction.action === "approve"
              ? "Approve Registration?"
              : "Reject Registration?"}
          </h3>
          <p class="text-xs text-text-muted mt-0.5 leading-relaxed font-medium">
            {confirmAction.action === "approve"
              ? `This will activate ${confirmAction.name}'s account and grant them portal access.`
              : `This will reject ${confirmAction.name}'s request and deny them portal access.`}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          onclick={() => (confirmAction = null)}
          class="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-muted hover:bg-surface-container-high transition"
        >
          {t('common.cancel')}
        </button>
        <button
          onclick={() =>
            confirmAction &&
            handleAction(confirmAction.uid, confirmAction.action === "approve")}
          disabled={!!actionLoading}
          class="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 {confirmAction.action ===
          'approve'
            ? 'bg-primary hover:bg-primary-hover'
            : 'bg-danger hover:bg-danger/90'}"
        >
          {#if actionLoading}
            <Loader2 class="h-3.5 w-3.5 animate-spin inline mr-1" />
          {/if}
          {confirmAction.action === "approve"
            ? "Confirm Approval"
            : "Confirm Rejection"}
        </button>
      </div>
    </div>
  </div>
{/if}
