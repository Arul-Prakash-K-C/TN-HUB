<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { mockApplications } from '$lib/data/applications';
  import {
    Shield,
    CheckCircle,
    XCircle,
    HelpCircle,
    FileText,
    Clock,
    AlertTriangle,
    UserCheck,
    Search,
    Filter
  } from '@lucide/svelte';
  import type { Application } from '$lib/types';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let applicationsList = $state<Application[]>(mockApplications);
  let selectedApp = $state<Application | null>(null);
  let actionModal = $state<'approve' | 'reject' | 'clarify' | null>(null);
  let remarkText = $state('');

  const pendingApps = $derived(applicationsList.filter(a => ['OFFICER_REVIEW', 'DOCUMENT_VERIFICATION', 'FIELD_VERIFICATION'].includes(a.status)));
  const completedApps = $derived(applicationsList.filter(a => a.status === 'COMPLETED' || a.status === 'APPROVED'));

  function handleAction(type: 'approve' | 'reject' | 'clarify') {
    if (!selectedApp) return;

    const targetStatus = type === 'approve' ? 'COMPLETED' as const : type === 'reject' ? 'REJECTED' as const : 'CLARIFICATION_REQUESTED' as const;

    const newHistoryEntry = {
      id: 'h-' + Date.now(),
      status: targetStatus,
      timestamp: new Date().toISOString(),
      description: type === 'approve' ? 'Application approved and completed' : type === 'reject' ? 'Application rejected by officer' : 'Clarification requested by officer',
      descriptionTA: type === 'approve' ? 'விண்ணப்பம் அங்கீகரிக்கப்பட்டு நிறைவடைந்தது' : type === 'reject' ? 'அலுவலரால் விண்ணப்பம் நிராகரிக்கப்பட்டது' : 'அலுவலரால் விளக்கம் கோரப்பட்டது',
      actorId: user ? user.id : 'officer-001',
      actorName: user ? user.name : 'Rajesh Kumar',
      actorRole: 'officer',
      remarks: remarkText || undefined
    };

    applicationsList = applicationsList.map(a => {
      if (a.id === selectedApp?.id) {
        return {
          ...a,
          status: targetStatus,
          rejectionReason: type === 'reject' ? remarkText : a.rejectionReason,
          history: [...a.history, newHistoryEntry],
          updatedAt: new Date().toISOString(),
          completedAt: type === 'approve' ? new Date().toISOString() : a.completedAt
        };
      }
      return a;
    });

    actionModal = null;
    selectedApp = null;
    remarkText = '';
  }
</script>

<svelte:head>
  <title>Officer Portal — Sympho Center</title>
</svelte:head>

{#if !authenticated || role !== 'officer'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Access Denied</h2>
      <p class="mt-2 text-xs text-slate-500">Only authorized Revenue Department Officers can access this queue. Please log in with an officer account.</p>
      <a href="/login?redirect=/officer" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700">
        Log In as Officer
      </a>
    </div>
  </div>
{:else}
  <div class="bg-slate-50 min-h-screen pb-16">
    <!-- Officer Portal Dark Header (Deep Navy Theme) -->
    <div class="bg-primary-950 text-primary-foreground border-b border-primary-900">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span class="inline-flex rounded-full bg-primary-500/20 border border-primary-500/30 px-3 py-1 text-[11px] font-bold text-primary-400">
              Revenue Department Official Queue
            </span>
            <h1 class="mt-2 text-2xl font-black text-white">
              Welcome, {user ? user.name : 'Officer Rajesh Kumar'}
            </h1>
            <p class="text-xs text-slate-300 mt-1">Designation: Revenue Inspector • Chennai Division • SLA Monitor Active</p>
          </div>

          <div class="flex items-center gap-3 text-xs">
            <div class="rounded-2xl border border-slate-700 bg-slate-800/50 p-3 px-4 text-center shadow-md">
              <div class="font-black text-xl text-amber-400">{pendingApps.length}</div>
              <div class="text-slate-400 text-[11px] font-bold uppercase tracking-wide">Pending Review</div>
            </div>
            <div class="rounded-2xl border border-slate-700 bg-slate-800/50 p-3 px-4 text-center shadow-md">
              <div class="font-black text-xl text-green-400">{completedApps.length}</div>
              <div class="text-slate-400 text-[11px] font-bold uppercase tracking-wide">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Queue Column -->
        <div class="space-y-3">
          <h2 class="text-sm font-bold text-slate-900 mb-2">Applications Queue ({pendingApps.length})</h2>

          {#each pendingApps as app}
            <button
              onclick={() => selectedApp = app}
              class="w-full text-left rounded-3xl border p-4 transition-all duration-200 shadow-sm
              {selectedApp?.id === app.id ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30' : 'border-slate-200 bg-white hover:border-emerald-500/40'}"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-emerald-700">{app.applicationNumber}</span>
                <span class="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {t(`status.${app.status}`)}
                </span>
              </div>

              <div class="mt-2 text-sm font-black text-slate-900">
                {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">
                {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName}
              </p>

              <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
                <span class="flex items-center gap-1">
                  <Clock class="h-3.5 w-3.5 text-slate-400" />
                  Submitted: {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          {/each}
        </div>

        <!-- Detail/Action Column -->
        <div class="lg:col-span-2">
          {#if !selectedApp}
            <div class="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <FileText class="mx-auto h-12 w-12 text-slate-300" />
              <h3 class="mt-4 text-sm font-bold text-slate-800">No Application Selected</h3>
              <p class="mt-1 text-xs text-slate-500">Choose an application from the queue to start reviewing.</p>
            </div>
          {:else}
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <span class="font-mono text-xs font-bold text-slate-400">ID: {selectedApp.applicationNumber}</span>
                  <h3 class="text-base font-black text-slate-900 mt-1">
                    {currentLocale === 'ta' ? selectedApp.serviceNameTA : selectedApp.serviceName}
                  </h3>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2">
                  <button
                    onclick={() => { actionModal = 'clarify'; remarkText = ''; }}
                    class="flex items-center gap-1 rounded-xl border border-amber-600 bg-white p-2 px-3 text-xs font-bold text-amber-700 hover:bg-amber-50"
                  >
                    <HelpCircle class="h-3.5 w-3.5" /> Clarify
                  </button>
                  <button
                    onclick={() => { actionModal = 'reject'; remarkText = ''; }}
                    class="flex items-center gap-1 rounded-xl border border-rose-600 bg-white p-2 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle class="h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    onclick={() => { actionModal = 'approve'; remarkText = ''; }}
                    class="flex items-center gap-1 rounded-xl bg-emerald-600 p-2 px-4 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    <UserCheck class="h-3.5 w-3.5" /> Approve & Issue
                  </button>
                </div>
              </div>

              <!-- Documents checklist -->
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Submitted Documents</h4>
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each selectedApp.documents as doc}
                    <div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <FileText class="h-5 w-5 text-emerald-600" />
                        <div>
                          <span class="text-xs font-bold text-slate-900 block">{doc.name}</span>
                          <span class="text-[10px] text-slate-400">{doc.source}</span>
                        </div>
                      </div>
                      <button
                        onclick={() => alert(`Reviewing document: ${doc.name}`)}
                        class="text-xs font-bold text-[#007AFF] hover:underline"
                      >
                        View
                      </button>
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Form Data details -->
              <div class="border-t border-slate-100 pt-5">
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Application Form Data</h4>
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each Object.entries(selectedApp.formData) as [k, v]}
                    <div class="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <span class="text-slate-500 capitalize text-[11px]">{k}:</span>
                      <span class="font-bold text-slate-900 block mt-0.5">{String(v)}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Officer Action Decision Modal -->
  {#if actionModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 class="text-base font-bold text-slate-900 mb-3">
          {actionModal === 'approve' ? 'Confirm Certificate Approval' : actionModal === 'reject' ? 'Confirm Application Rejection' : 'Request Clarification from Applicant'}
        </h3>

        {#if actionModal === 'reject' || actionModal === 'clarify'}
          <div class="mb-4">
            <label for="officer-remarks" class="block text-xs font-bold text-slate-900 mb-1">Reason / Remarks</label>
            <textarea id="officer-remarks" bind:value={remarkText} rows="3" placeholder="Provide detailed official reason..." class="w-full rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500"></textarea>
          </div>
        {/if}

        <div class="flex justify-end gap-3">
          <button onclick={() => actionModal = null} class="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onclick={() => handleAction(actionModal!)}
            class="rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow {actionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : actionModal === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}"
          >
            Confirm Official Decision
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}
