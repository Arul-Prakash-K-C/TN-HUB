<script>

  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import { applications as mockApplications } from '$lib/data/applications';
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

const t = $derived($tt);
const currentLocale = $derived($locale);
const user = $derived($currentUser);
const authenticated = $derived($isAuthenticated);
const role = $derived($userRole);
let applicationsList = $state(mockApplications);
let selectedApp = $state(null);
let actionModal = $state(null);
let remarkText = $state('');
const pendingApps = $derived(applicationsList.filter(a => ['OFFICER_REVIEW', 'DOCUMENT_VERIFICATION', 'FIELD_VERIFICATION'].includes(a.status)));
const completedApps = $derived(applicationsList.filter(a => a.status === 'COMPLETED' || a.status === 'APPROVED'));
function handleAction(type) {
    if (!selectedApp)
        return;
    const targetStatus = type === 'approve' ? 'COMPLETED' : type === 'reject' ? 'REJECTED' : 'CLARIFICATION_REQUESTED';
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
  <title>Officer Portal — TN Hub</title>
</svelte:head>

{#if !authenticated || role !== 'officer'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
      <p class="mt-2 text-xs text-text-muted">Only authorized Revenue Department Officers can access this queue. Please log in with an officer account.</p>
      <a href="/login?redirect=/officer" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow transition hover:bg-primary-hover">
        Log In
      </a>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen pb-16 text-text">
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
            <p class="text-xs text-primary-200 mt-1">Designation: Revenue Inspector • Chennai Division • SLA Monitor Active</p>
          </div>

          <div class="flex items-center gap-3 text-xs">
            <div class="rounded-2xl border border-primary-900 bg-primary-900/30 p-3 px-4 text-center shadow-md">
              <div class="font-black text-xl text-warning">{pendingApps.length}</div>
              <div class="text-primary-300 text-[11px] font-bold uppercase tracking-wide">Pending Review</div>
            </div>
            <div class="rounded-2xl border border-primary-900 bg-primary-900/30 p-3 px-4 text-center shadow-md">
              <div class="font-black text-xl text-success">{completedApps.length}</div>
              <div class="text-primary-300 text-[11px] font-bold uppercase tracking-wide">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Queue Column -->
        <div class="space-y-3">
          <h2 class="text-sm font-bold text-text mb-2">Applications Queue ({pendingApps.length})</h2>

          {#each pendingApps as app}
            <button
              onclick={() => selectedApp = app}
              class="w-full text-left rounded-3xl border p-4 transition-all duration-200 shadow-sm
              {selectedApp?.id === app.id ? 'border-primary bg-primary-soft ring-2 ring-primary/20' : 'border-border bg-surface hover:border-primary/40'}"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-primary">{app.applicationNumber}</span>
                {#if app.status === 'SUBMITTED' || app.status === 'OFFICER_REVIEW'}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-soft text-primary-soft-text border border-primary/20">{t(`status.${app.status}`)}</span>
                {:else if app.status === 'DOCUMENT_VERIFICATION' || app.status === 'FIELD_VERIFICATION'}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-soft text-warning border border-warning/25">{t(`status.${app.status}`)}</span>
                {:else if app.status === 'CLARIFICATION_REQUESTED'}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-soft text-danger border border-danger/25">{t(`status.${app.status}`)}</span>
                {:else if app.status === 'APPROVED' || app.status === 'COMPLETED'}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/25">{t(`status.${app.status}`)}</span>
                {:else if app.status === 'REJECTED'}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-soft text-danger border border-danger/25">{t(`status.${app.status}`)}</span>
                {:else}
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-text-muted border border-border">{t(`status.${app.status}`)}</span>
                {/if}
              </div>

              <div class="mt-2 text-sm font-black text-text">
                {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
              </div>
              <p class="text-[11px] text-text-muted mt-0.5 uppercase font-bold tracking-wider">
                {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName}
              </p>

              <div class="mt-3 flex items-center justify-between text-[11px] text-text-muted font-semibold border-t border-border pt-2">
                <span class="flex items-center gap-1">
                  <Clock class="h-3.5 w-3.5 text-text-faint" />
                  Submitted: {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          {/each}
        </div>

        <!-- Detail/Action Column -->
        <div class="lg:col-span-2">
          {#if !selectedApp}
            <div class="rounded-3xl border border-border bg-surface p-12 text-center shadow-sm">
              <FileText class="mx-auto h-12 w-12 text-text-faint" />
              <h3 class="mt-4 text-sm font-bold text-text">No Application Selected</h3>
              <p class="mt-1 text-xs text-text-muted">Choose an application from the queue to start reviewing.</p>
            </div>
          {:else}
            <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <span class="font-mono text-xs font-bold text-text-faint">ID: {selectedApp.applicationNumber}</span>
                  <h3 class="text-base font-black text-text mt-1">
                    {currentLocale === 'ta' ? selectedApp.serviceNameTA : selectedApp.serviceName}
                  </h3>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2">
                  <button
                    onclick={() => { actionModal = 'clarify'; remarkText = ''; }}
                    class="flex items-center gap-1 rounded-xl border border-warning/45 bg-surface dark:bg-surface-container px-3 py-2 text-xs font-bold text-warning hover:bg-warning-soft/30 transition"
                  >
                    <HelpCircle class="h-3.5 w-3.5" /> Clarify
                  </button>
                  <button
                    onclick={() => { actionModal = 'reject'; remarkText = ''; }}
                    class="flex items-center gap-1 rounded-xl border border-danger/45 bg-surface dark:bg-surface-container px-3 py-2 text-xs font-bold text-danger hover:bg-danger-soft/30 transition"
                  >
                    <XCircle class="h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    onclick={() => { actionModal = 'approve'; remarkText = ''; }}
                    class="flex items-center gap-1 rounded-xl bg-success px-4 py-2 text-xs font-bold text-white shadow hover:bg-success/90 transition"
                  >
                    <UserCheck class="h-3.5 w-3.5" /> Approve & Issue
                  </button>
                </div>
              </div>

              <!-- Documents checklist -->
              <div>
                <h4 class="text-xs font-bold text-text uppercase tracking-wider mb-3">Submitted Documents</h4>
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each selectedApp.documents as doc}
                    <div class="rounded-2xl border border-border bg-surface-container/50 p-3.5 flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <FileText class="h-5 w-5 text-primary" />
                        <div>
                          <span class="text-xs font-bold text-text block">{doc.name}</span>
                          <span class="text-[10px] text-text-muted">{doc.source}</span>
                        </div>
                      </div>
                      <button
                        onclick={() => alert(`Reviewing document: ${doc.name}`)}
                        class="text-xs font-bold text-primary hover:underline"
                      >
                        View
                      </button>
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Form Data details -->
              <div class="border-t border-border pt-5">
                <h4 class="text-xs font-bold text-text uppercase tracking-wider mb-3">Application Form Data</h4>
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each Object.entries(selectedApp.formData) as [k, v]}
                    <div class="rounded-2xl bg-surface-container/50 p-3 border border-border">
                      <span class="text-text-muted capitalize text-[11px]">{k}:</span>
                      <span class="font-bold text-text block mt-0.5">{String(v)}</span>
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
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-md rounded-3xl bg-surface border border-border p-6 shadow-2xl">
        <h3 class="text-base font-bold text-text mb-3">
          {actionModal === 'approve' ? 'Confirm Certificate Approval' : actionModal === 'reject' ? 'Confirm Application Rejection' : 'Request Clarification from Applicant'}
        </h3>

        {#if actionModal === 'reject' || actionModal === 'clarify'}
          <div class="mb-4">
            <label for="officer-remarks" class="block text-xs font-bold text-text mb-1">Reason / Remarks</label>
            <textarea id="officer-remarks" bind:value={remarkText} rows="3" placeholder="Provide detailed official reason..." class="w-full rounded-2xl border border-border bg-surface-container-low dark:text-text p-3 text-xs outline-none focus:border-primary"></textarea>
          </div>
        {/if}

        <div class="flex justify-end gap-3">
          <button onclick={() => actionModal = null} class="rounded-2xl border border-border px-5 py-2.5 text-xs font-semibold text-text-muted hover:bg-surface-container transition">
            Cancel
          </button>
          <button
            onclick={() => handleAction(actionModal)}
            class="rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow transition {actionModal === 'approve' ? 'bg-success hover:bg-success/90' : actionModal === 'reject' ? 'bg-danger hover:bg-danger/90' : 'bg-warning hover:bg-warning/90'}"
          >
            Confirm Official Decision
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}
