<script>
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import {
    MessageCircleQuestion,
    Send,
    Shield,
    Clock,
    CheckCircle,
    Loader2,
    AlertTriangle,
    Mail,
    ChevronDown,
    ChevronUp,
    Reply,
    FileText,
    GripHorizontal,
    Check
  } from '@lucide/svelte';
  import { onMount } from 'svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let questions = $state([]);
  let complaints = $state([]);
  let loading = $state(true);
  let error = $state('');
  let replyLoading = $state(null);

  // Tab management: 'help' or 'grievance'
  let activeTab = $state('help');
  let filterTab = $state('all');

  // Expanded details management
  let expandedId = $state(null);
  let expandedGrievanceId = $state(null);
  let replyText = $state('');
  let grievanceRemark = $state('');

  const filteredQuestions = $derived(() => {
    let filtered = questions;
    if (filterTab === 'pending') {
      filtered = questions.filter(q => !q.reply);
    } else if (filterTab === 'replied') {
      filtered = questions.filter(q => q.reply);
    }
    return filtered;
  });

  const filteredComplaints = $derived(() => {
    let filtered = complaints;
    if (filterTab === 'pending') {
      filtered = complaints.filter(c => c.status !== 'RESOLVED');
    } else if (filterTab === 'resolved') {
      filtered = complaints.filter(c => c.status === 'RESOLVED');
    }
    return filtered;
  });

  async function fetchAllData() {
    loading = true;
    error = '';
    try {
      const [questionsRes, complaintsRes] = await Promise.all([
        fetch('/api/admin/questions', { credentials: 'same-origin' }),
        fetch('/api/complaints', { credentials: 'same-origin' })
      ]);

      if (!questionsRes.ok || !complaintsRes.ok) {
        throw new Error('Failed to retrieve inquiries or grievances.');
      }

      const qData = await questionsRes.json();
      const cData = await complaintsRes.json();

      questions = qData.questions || [];
      complaints = cData.complaints || [];
    } catch (e) {
      error = e.message || 'Unable to load administration data.';
    } finally {
      loading = false;
    }
  }

  async function sendReply(questionId) {
    if (!replyText.trim()) return;
    replyLoading = questionId;
    error = '';
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionId, reply: replyText.trim() })
      });
      if (!res.ok) throw new Error('Failed to send reply.');
      
      questions = questions.map(q => q.id === questionId
        ? { ...q, reply: replyText.trim(), repliedAt: new Date().toISOString() }
        : q
      );
      replyText = '';
      expandedId = null;
    } catch (e) {
      error = e.message || 'Unable to send reply.';
    } finally {
      replyLoading = null;
    }
  }

  async function resolveGrievance(complaintId) {
    if (!grievanceRemark.trim()) return;
    replyLoading = complaintId;
    error = '';
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ complaintId, status: 'RESOLVED', remark: grievanceRemark.trim() })
      });
      if (!res.ok) throw new Error('Failed to update grievance status.');
      const data = await res.json();

      complaints = complaints.map(c => c.id === complaintId ? data.complaint : c);
      grievanceRemark = '';
      expandedGrievanceId = null;
    } catch (e) {
      error = e.message || 'Unable to resolve grievance.';
    } finally {
      replyLoading = null;
    }
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  onMount(() => {
    fetchAllData();
  });
</script>

<svelte:head>
  <title>Help Desk & Grievance Desk — TN Kuviyam Admin</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
      <p class="mt-2 text-xs text-text-muted">Admin access only.</p>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-12">
    <!-- Header Banner -->
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-h1 text-white">Help Desk & Grievance Panel</h1>
        <p class="text-xs text-white/70">Manage user inquiries and resolve public grievances separately in their respective databases.</p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      <!-- Primary Tab Toggle -->
      <div class="flex border-b border-border/60 mb-8 overflow-x-auto gap-4">
        <button
          onclick={() => { activeTab = 'help'; filterTab = 'all'; expandedId = null; }}
          class="pb-3 px-6 text-sm font-bold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer {activeTab === 'help' ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text'}"
        >
          Help Desk Inquiries ({questions.length})
        </button>
        <button
          onclick={() => { activeTab = 'grievance'; filterTab = 'all'; expandedGrievanceId = null; }}
          class="pb-3 px-6 text-sm font-bold border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer {activeTab === 'grievance' ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text'}"
        >
          Grievance Desk Complaints ({complaints.length})
        </button>
      </div>

      {#if error}
        <div class="mb-6 rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3 text-xs font-bold text-danger flex items-center gap-2">
          <AlertTriangle class="h-4 w-4 shrink-0" />
          {error}
        </div>
      {/if}

      {#if loading}
        <div class="flex items-center justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <span class="ml-3 text-sm text-text-muted font-bold">Loading administration database...</span>
        </div>
      {:else}
        <!-- ============================================== -->
        <!-- HELP DESK INQUIRIES TAB                        -->
        <!-- ============================================== -->
        {#if activeTab === 'help'}
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-6 shadow-sm text-center">
              <div class="text-3xl font-black text-primary">{questions.length}</div>
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Total Inquiries</div>
            </div>
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-6 shadow-sm text-center">
              <div class="text-3xl font-black text-warning">{questions.filter(q => !q.reply).length}</div>
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Pending Action</div>
            </div>
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-6 shadow-sm text-center">
              <div class="text-3xl font-black text-success">{questions.filter(q => q.reply).length}</div>
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Replied</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex gap-2 mb-6">
            {#each [['all', 'All Inquiries'], ['pending', 'Pending'], ['replied', 'Replied']] as [tab, label]}
              <button
                onclick={() => { filterTab = tab; expandedId = null; }}
                class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 {filterTab === tab ? 'bg-primary text-white shadow-md' : 'bg-surface dark:bg-surface-container text-text-muted border border-border hover:bg-surface-container-high'}"
              >
                {label}
              </button>
            {/each}
          </div>

          {#if filteredQuestions().length === 0}
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-12 text-center shadow-sm">
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft text-success">
                <CheckCircle class="h-8 w-8" />
              </div>
              <h2 class="text-lg font-bold text-text">No Inquiries</h2>
              <p class="mt-2 text-xs text-text-muted">
                {filterTab === 'pending' ? 'All user inquiries have been resolved.' : 'No help desk queries found.'}
              </p>
            </div>
          {:else}
            <!-- Help Desk Table -->
            <div class="overflow-x-auto rounded-3xl border border-border bg-surface dark:bg-surface-container shadow-sm">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border bg-muted/50 text-[10px] font-black uppercase tracking-wider text-text-muted font-tamil">
                    <th class="py-3.5 px-6">User Details</th>
                    <th class="py-3.5 px-6">Subject</th>
                    <th class="py-3.5 px-6">Submitted At</th>
                    <th class="py-3.5 px-6">Status</th>
                    <th class="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border text-xs font-semibold text-text">
                  {#each filteredQuestions() as q (q.id)}
                    <tr class="hover:bg-surface-container/30 transition-colors">
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-lg bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {(q.userName || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div class="font-bold text-text">{q.userName || 'Unknown'}</div>
                            <div class="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                              <Mail class="h-3 w-3" />
                              {q.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-6 max-w-xs truncate">
                        <span class="font-bold block text-text">{q.subject}</span>
                        <span class="text-[10px] text-text-muted block truncate mt-0.5">{q.question}</span>
                      </td>
                      <td class="py-4 px-6 font-mono text-text-muted">
                        {formatDate(q.createdAt)}
                      </td>
                      <td class="py-4 px-6">
                        {#if q.reply}
                          <span class="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2.5 py-0.5 text-[9px] font-bold border border-success/15">
                            <CheckCircle class="h-2.5 w-2.5" /> Replied
                          </span>
                        {:else}
                          <span class="inline-flex items-center gap-1 rounded-full bg-warning-soft text-warning px-2.5 py-0.5 text-[9px] font-bold border border-warning/15">
                            <Clock class="h-2.5 w-2.5" /> Pending
                          </span>
                        {/if}
                      </td>
                      <td class="py-4 px-6 text-right">
                        <button
                          onclick={() => { expandedId = expandedId === q.id ? null : q.id; replyText = ''; }}
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-bold text-text-muted hover:text-text hover:bg-surface-container transition cursor-pointer"
                        >
                          <span>{expandedId === q.id ? 'Close' : 'View & Reply'}</span>
                          {#if expandedId === q.id}
                            <ChevronUp class="h-3 w-3" />
                          {:else}
                            <ChevronDown class="h-3 w-3" />
                          {/if}
                        </button>
                      </td>
                    </tr>

                    <!-- Expanded Reply Drawer -->
                    {#if expandedId === q.id}
                      <tr>
                        <td colspan="5" class="bg-surface-container/30 px-6 py-6 border-b border-border">
                          <div class="max-w-3xl space-y-4">
                            <div class="bg-surface dark:bg-surface-container border border-border p-5 rounded-2xl shadow-inner text-xs leading-relaxed">
                              <span class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-1">User Inquiry:</span>
                              <p class="whitespace-pre-wrap font-medium text-text">{q.question}</p>
                            </div>

                            {#if q.reply}
                              <div class="bg-primary-soft/30 border border-primary/25 p-5 rounded-2xl text-xs leading-relaxed">
                                <div class="flex items-center gap-2 mb-1.5 text-primary">
                                  <Reply class="h-4 w-4" />
                                  <span class="font-extrabold uppercase text-[10px] tracking-wider">Admin Response:</span>
                                </div>
                                <p class="font-semibold text-text whitespace-pre-wrap">{q.reply}</p>
                                {#if q.repliedAt}
                                  <span class="text-[10px] text-text-muted mt-2 block font-mono">Replied on {formatDate(q.repliedAt)}</span>
                                {/if}
                              </div>
                            {:else}
                              <div class="space-y-2">
                                <label for="reply-box" class="block text-[11px] font-black uppercase tracking-wider text-text-muted font-tamil">
                                  Response Message
                                </label>
                                <textarea
                                  id="reply-box"
                                  bind:value={replyText}
                                  placeholder="Type your reply to this inquiry..."
                                  rows="4"
                                  class="w-full rounded-2xl border border-border bg-surface dark:bg-surface-container px-4 py-3 text-xs font-semibold text-text outline-none focus:border-primary transition-all"
                                ></textarea>
                                <div class="flex justify-end">
                                  <button
                                    onclick={() => sendReply(q.id)}
                                    disabled={!replyText.trim() || replyLoading === q.id}
                                    class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
                                  >
                                    {#if replyLoading === q.id}
                                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                                      Sending...
                                    {:else}
                                      <Send class="h-3.5 w-3.5" />
                                      Send Reply & Notify
                                    {/if}
                                  </button>
                                </div>
                              </div>
                            {/if}
                          </div>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {/if}

        <!-- ============================================== -->
        <!-- GRIEVANCE DESK TAB                             -->
        <!-- ============================================== -->
        {#if activeTab === 'grievance'}
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3">
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-6 shadow-sm text-center">
              <div class="text-3xl font-black text-primary">{complaints.length}</div>
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Total Grievances</div>
            </div>
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-6 shadow-sm text-center">
              <div class="text-3xl font-black text-warning">{complaints.filter(c => c.status !== 'RESOLVED').length}</div>
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Unresolved</div>
            </div>
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-6 shadow-sm text-center">
              <div class="text-3xl font-black text-success">{complaints.filter(c => c.status === 'RESOLVED').length}</div>
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Resolved</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex gap-2 mb-6">
            {#each [['all', 'All Grievances'], ['pending', 'Unresolved'], ['resolved', 'Resolved']] as [tab, label]}
              <button
                onclick={() => { filterTab = tab; expandedGrievanceId = null; }}
                class="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 {filterTab === tab ? 'bg-primary text-white shadow-md' : 'bg-surface dark:bg-surface-container text-text-muted border border-border hover:bg-surface-container-high'}"
              >
                {label}
              </button>
            {/each}
          </div>

          {#if filteredComplaints().length === 0}
            <div class="rounded-3xl border border-border bg-surface dark:bg-surface-container p-12 text-center shadow-sm">
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft text-success">
                <CheckCircle class="h-8 w-8" />
              </div>
              <h2 class="text-lg font-bold text-text">No Grievances</h2>
              <p class="mt-2 text-xs text-text-muted">
                {filterTab === 'pending' ? 'All citizen complaints have been resolved.' : 'No public complaints registered.'}
              </p>
            </div>
          {:else}
            <!-- Grievance Desk Table -->
            <div class="overflow-x-auto rounded-3xl border border-border bg-surface dark:bg-surface-container shadow-sm">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border bg-muted/50 text-[10px] font-black uppercase tracking-wider text-text-muted font-tamil">
                    <th class="py-3.5 px-6">Grievance ID / Citizen</th>
                    <th class="py-3.5 px-6">Department & Category</th>
                    <th class="py-3.5 px-6">Subject</th>
                    <th class="py-3.5 px-6">Created At</th>
                    <th class="py-3.5 px-6">Status</th>
                    <th class="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border text-xs font-semibold text-text">
                  {#each filteredComplaints() as c (c.id)}
                    <tr class="hover:bg-surface-container/30 transition-colors">
                      <td class="py-4 px-6">
                        <div>
                          <span class="font-bold font-mono text-text block">{c.complaintNumber}</span>
                          <span class="text-[10px] text-text-muted block mt-0.5">
                            {c.citizenName} ({c.citizenEmail || c.email})
                          </span>
                        </div>
                      </td>
                      <td class="py-4 px-6">
                        <div>
                          <span class="font-bold text-text block capitalize">{c.departmentId.replace('dept-', '')} Department</span>
                          <span class="text-[10px] text-text-muted block capitalize mt-0.5">{c.category.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td class="py-4 px-6 max-w-xs truncate">
                        <span class="font-bold block text-text">{c.subject}</span>
                        <span class="text-[10px] text-text-muted block truncate mt-0.5">{c.description}</span>
                      </td>
                      <td class="py-4 px-6 font-mono text-text-muted">
                        {formatDate(c.createdAt)}
                      </td>
                      <td class="py-4 px-6">
                        {#if c.status === 'RESOLVED'}
                          <span class="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2.5 py-0.5 text-[9px] font-bold border border-success/15">
                            <CheckCircle class="h-2.5 w-2.5" /> Resolved
                          </span>
                        {:else}
                          <span class="inline-flex items-center gap-1 rounded-full bg-warning-soft text-warning px-2.5 py-0.5 text-[9px] font-bold border border-warning/15">
                            <Clock class="h-2.5 w-2.5" /> Pending
                          </span>
                        {/if}
                      </td>
                      <td class="py-4 px-6 text-right">
                        <button
                          onclick={() => { expandedGrievanceId = expandedGrievanceId === c.id ? null : c.id; grievanceRemark = ''; }}
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-bold text-text-muted hover:text-text hover:bg-surface-container transition cursor-pointer"
                        >
                          <span>{expandedGrievanceId === c.id ? 'Close' : 'View & Resolve'}</span>
                          {#if expandedGrievanceId === c.id}
                            <ChevronUp class="h-3 w-3" />
                          {:else}
                            <ChevronDown class="h-3 w-3" />
                          {/if}
                        </button>
                      </td>
                    </tr>

                    <!-- Expanded Grievance Resolution Drawer -->
                    {#if expandedGrievanceId === c.id}
                      <tr>
                        <td colspan="6" class="bg-surface-container/30 px-6 py-6 border-b border-border">
                          <div class="max-w-3xl space-y-4">
                            <!-- Full Details -->
                            <div class="grid grid-cols-2 gap-4 bg-surface dark:bg-surface-container border border-border p-5 rounded-2xl">
                              <div class="col-span-2">
                                <span class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-1">Grievance Description:</span>
                                <p class="text-xs font-semibold text-text whitespace-pre-wrap leading-relaxed">{c.description}</p>
                              </div>
                              {#if c.location}
                                <div>
                                  <span class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-0.5">Location / Address:</span>
                                  <span class="text-xs font-bold text-text">{c.location}</span>
                                </div>
                              {/if}
                            </div>

                            <!-- Resolution History / Reply -->
                            {#if c.status === 'RESOLVED'}
                              <div class="bg-success-soft/30 border border-success/25 p-5 rounded-2xl text-xs leading-relaxed">
                                <div class="flex items-center gap-2 mb-1.5 text-success">
                                  <Check class="h-4 w-4" />
                                  <span class="font-extrabold uppercase text-[10px] tracking-wider">Resolution Remark:</span>
                                </div>
                                <p class="font-semibold text-text whitespace-pre-wrap">
                                  {c.history?.find(h => h.status === 'RESOLVED')?.description || 'Grievance resolved successfully.'}
                                </p>
                                <span class="text-[10px] text-text-muted mt-2 block font-mono">
                                  Resolved on {formatDate(c.history?.find(h => h.status === 'RESOLVED')?.timestamp || c.updatedAt)}
                                </span>
                              </div>
                            {:else}
                              <div class="space-y-2">
                                <label for="resolve-remark" class="block text-[11px] font-black uppercase tracking-wider text-text-muted font-tamil">
                                  Action Remark / Resolution Note
                                </label>
                                <textarea
                                  id="resolve-remark"
                                  bind:value={grievanceRemark}
                                  placeholder="Write a resolution remark or status update..."
                                  rows="4"
                                  class="w-full rounded-2xl border border-border bg-surface dark:bg-surface-container px-4 py-3 text-xs font-semibold text-text outline-none focus:border-primary transition-all"
                                ></textarea>
                                <div class="flex justify-end">
                                  <button
                                    onclick={() => resolveGrievance(c.id)}
                                    disabled={!grievanceRemark.trim() || replyLoading === c.id}
                                    class="inline-flex items-center gap-2 rounded-2xl bg-success px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-success/90 transition cursor-pointer disabled:opacity-50"
                                  >
                                    {#if replyLoading === c.id}
                                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                                      Resolving...
                                    {:else}
                                      <CheckCircle class="h-3.5 w-3.5" />
                                      Resolve Grievance
                                    {/if}
                                  </button>
                                </div>
                              </div>
                            {/if}
                          </div>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
{/if}
