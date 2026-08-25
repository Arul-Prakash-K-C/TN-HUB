<script lang="ts">
  import { currentUser, isRestored } from '$lib/stores/auth';
  import { tt, locale } from '$lib/i18n';
  import type { Application } from '$lib/types';
  import GlassLoader from '$lib/components/ui/GlassLoader.svelte';
  import { ArrowLeft, Printer, Share2, FileText, CheckCircle, XCircle, AlertCircle, Lock, Eye, CheckCircle2, ShieldCheck, HelpCircle } from '@lucide/svelte';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const restored = $derived($isRestored);
  let appState = $state<Application | null>(null);
  let availableActions = $state<Array<{
    id: string;
    toState: string;
    label: { en: string; ta: string };
    requiresReason: boolean;
    requiresDocuments: boolean;
  }>>([]);
  let actionModal = $state<'approve' | 'reject' | 'clarify' | null>(null);
  let remarkText = $state('');
  let docVerificationMap = $state<Record<string, 'VERIFIED' | 'FLAGGED'>>({});
  let actionError = $state('');

  $effect(() => {
    appState = data.application;
    availableActions = data.availableActions;
    docVerificationMap = Object.fromEntries(
      (data.application?.documents ?? []).map((document) => [document.id, document.status === 'verified' ? 'VERIFIED' : 'FLAGGED'])
    );
  });

  async function toggleDocStatus(docId: string) {
    if (!appState) return;
    const status = docVerificationMap[docId] === 'VERIFIED' ? 'rejected' : 'verified';
    actionError = '';
    try {
      const response = await fetch(`/api/applications/${appState.id}/documents/${docId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, ...(status === 'rejected' ? { comment: 'Document requires correction.' } : {}) })
      });
      const body = await response.json().catch(() => null) as { application?: Application; message?: string } | null;
      if (!response.ok || !body?.application) throw new Error(body?.message ?? 'Unable to review this document.');
      appState = body.application;
      docVerificationMap[docId] = status === 'verified' ? 'VERIFIED' : 'FLAGGED';
    } catch (cause) {
      actionError = cause instanceof Error ? cause.message : 'Unable to review this document.';
    }
  }

  async function viewDocument(documentId: string) {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, { credentials: 'same-origin' });
      const body = await response.json().catch(() => null) as { url?: string; message?: string } | null;
      if (!response.ok || !body?.url) throw new Error(body?.message ?? 'Unable to access this document.');
      window.open(body.url, '_blank', 'noopener,noreferrer');
    } catch (cause) {
      actionError = cause instanceof Error ? cause.message : 'Unable to access this document.';
    }
  }

  function handleLocalAction(type: 'approve' | 'reject' | 'clarify') {
    if (!appState || !user) return;

    const targetStatus = type === 'approve' ? 'COMPLETED' as const : type === 'reject' ? 'REJECTED' as const : 'CLARIFICATION_REQUESTED' as const;

    const newHistoryEntry = {
      id: 'h-' + Date.now(),
      status: targetStatus,
      timestamp: new Date().toISOString(),
      description: type === 'approve' ? 'Application officially approved and certificate generated' : type === 'reject' ? 'Application rejected by officer' : 'Clarification / Re-upload requested from citizen',
      descriptionTA: type === 'approve' ? 'விண்ணப்பம் அங்கீகரிக்கப்பட்டு சான்றிதழ் உருவாக்கப்பட்டது' : type === 'reject' ? 'அலுவலரால் விண்ணப்பம் நிராகரிக்கப்பட்டது' : 'அலுவலரால் விளக்கம் கோரப்பட்டது',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      remarks: remarkText || undefined
    };

    appState = {
      ...appState,
      status: targetStatus,
      rejectionReason: type === 'reject' ? remarkText : appState.rejectionReason,
      history: [...appState.history, newHistoryEntry],
      updatedAt: new Date().toISOString(),
      completedAt: type === 'approve' ? new Date().toISOString() : appState.completedAt
    };

    actionModal = null;
    remarkText = '';
  }

  function getWorkflowAction(type: 'approve' | 'reject' | 'clarify') {
    const targetStates = type === 'approve'
      ? ['APPROVED', 'COMPLETED']
      : type === 'reject'
        ? ['REJECTED']
        : ['CLARIFICATION_REQUESTED'];
    return availableActions.find((action) => targetStates.includes(action.toState));
  }

  async function handleAction(type: 'approve' | 'reject' | 'clarify') {
    if (!appState) return;
    const action = getWorkflowAction(type);
    if (!action) {
      actionError = 'This workflow action is not available at the current stage.';
      actionModal = null;
      return;
    }

    actionError = '';
    try {
      const response = await fetch(`/api/applications/${appState.id}/actions`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transitionId: action.id, comment: remarkText })
      });
      const body = await response.json().catch(() => null) as { application?: Application; message?: string } | null;
      if (!response.ok || !body?.application) throw new Error(body?.message ?? 'Unable to update this application.');
      appState = body.application;
      availableActions = [];
      actionModal = null;
      remarkText = '';
    } catch (cause) {
      actionError = cause instanceof Error ? cause.message : 'Unable to update this application.';
    }
  }
</script>

<svelte:head>
  <title>Application Review — {appState ? appState.applicationNumber : 'Sympho Center'}</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
  {#if !restored}
    <GlassLoader message="Verifying authentication..." />
  {:else if !appState}
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div class="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xl max-w-lg w-full">
        <Lock class="mx-auto h-12 w-12 text-rose-500 mb-4" />
        <h2 class="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
        <p class="mt-2 text-sm text-slate-500">
          You are either not authorized to view applications outside your assigned department (`{user?.departmentName || 'Revenue Department'}`), or this record does not exist.
        </p>
        <a href="/department/applications" class="mt-6 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-700">
          Return to Authorized Queue
        </a>
      </div>
    </div>
  {:else}
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <a href="/department/applications" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-3">
            <ArrowLeft class="h-4 w-4" /> Back to Application Queue
          </a>
          <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 flex-wrap">
            {appState.applicationNumber}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
              {appState.status}
            </span>
          </h1>
          <p class="text-sm font-bold text-slate-500 mt-2">
            {currentLocale === 'ta' ? appState.serviceNameTA : appState.serviceName}
          </p>
        </div>
        <div class="flex gap-2">
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 shadow-sm">
            <Printer class="h-4 w-4" /> Print
          </button>
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 shadow-sm">
            <Share2 class="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column (Main Content) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Applicant Info -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 class="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck class="h-5 w-5 text-emerald-600" />
              Applicant Information
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div>
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</span>
                <span class="text-sm font-bold text-slate-900">{appState.citizenName}</span>
              </div>
              <div>
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Submission Date</span>
                <span class="text-sm font-bold text-slate-900">{new Date(appState.createdAt).toLocaleDateString()}</span>
              </div>
              
              <!-- Form Data Values -->
              {#each Object.entries(appState.formData) as [key, val]}
                <div>
                  <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span class="text-sm font-bold text-slate-900">{String(val)}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Submitted Documents -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText class="h-5 w-5 text-emerald-600" />
                Submitted Documents
              </h2>
              <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                {Object.values(docVerificationMap).filter(v => v === 'VERIFIED').length} / {appState.documents.length} Verified
              </span>
            </div>
            
            <div class="space-y-3">
              {#each appState.documents as doc}
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all {docVerificationMap[doc.id] === 'VERIFIED' ? 'bg-white border-slate-200 hover:border-emerald-300' : 'bg-rose-50 border-rose-200'}">
                  <div class="flex items-start gap-4 mb-4 sm:mb-0">
                    <div class="bg-slate-100 p-2.5 rounded-xl border border-slate-200 shrink-0">
                      <FileText class="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 class="font-bold text-slate-900 text-sm">{doc.name}</h3>
                      <div class="flex flex-wrap items-center gap-2 mt-1.5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border {docVerificationMap[doc.id] === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-300'}">
                          {docVerificationMap[doc.id]}
                        </span>
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{doc.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex gap-2 w-full sm:w-auto">
                    <button onclick={() => viewDocument(doc.id)} class="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                      <Eye class="h-3.5 w-3.5" /> View
                    </button>
                    <button onclick={() => toggleDocStatus(doc.id)} class="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-xl transition-colors {docVerificationMap[doc.id] === 'VERIFIED' ? 'bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}">
                      {#if docVerificationMap[doc.id] === 'VERIFIED'}
                        <AlertCircle class="h-3.5 w-3.5" /> Flag Issue
                      {:else}
                        <CheckCircle2 class="h-3.5 w-3.5" /> Verify
                      {/if}
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          
          <!-- Officer Actions -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 class="text-base font-black text-slate-900 mb-6">Officer Actions</h2>
            {#if actionError}
              <p class="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{actionError}</p>
            {/if}
            
            <div class="flex flex-col gap-3">
              <button onclick={() => { actionModal = 'approve'; remarkText = ''; }} class="w-full py-3.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle class="h-4 w-4" /> Approve & Issue
              </button>
              
              <button onclick={() => { actionModal = 'reject'; remarkText = ''; }} class="w-full py-3.5 bg-white border border-slate-200 text-rose-600 font-bold text-xs rounded-2xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <XCircle class="h-4 w-4" /> Reject Request
              </button>
              
              <button onclick={() => { actionModal = 'clarify'; remarkText = ''; }} class="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <HelpCircle class="h-4 w-4" /> Request Correction
              </button>
            </div>
          </div>

          <!-- Application History Timeline -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 class="text-base font-black text-slate-900 mb-6">Audit Trail</h2>
            
            <div class="relative pl-6 space-y-8">
              <!-- Timeline Line -->
              <div class="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200"></div>
              
              {#each appState.history as step}
                <div class="relative">
                  <div class="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-white border-4 border-slate-200 z-10"></div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900">{step.description}</h4>
                    <p class="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wide">
                      {new Date(step.timestamp).toLocaleDateString()} {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span class="text-emerald-600">{step.actorRole}</span>
                    </p>
                    {#if step.remarks}
                      <div class="mt-3 text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 font-medium leading-relaxed">
                        <strong class="text-slate-900 block mb-1">Official Remarks:</strong> {step.remarks}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  {/if}

  <!-- Action Modal -->
  {#if actionModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-200">
        <div class="mb-6 flex items-center justify-center w-12 h-12 rounded-2xl {actionModal === 'approve' ? 'bg-emerald-100 text-emerald-600' : actionModal === 'reject' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}">
          {#if actionModal === 'approve'}
            <CheckCircle2 class="h-6 w-6" />
          {:else if actionModal === 'reject'}
            <XCircle class="h-6 w-6" />
          {:else}
            <HelpCircle class="h-6 w-6" />
          {/if}
        </div>
        
        <h3 class="text-xl font-black text-slate-900 mb-2 tracking-tight">
          {actionModal === 'approve' ? 'Approve Application' : actionModal === 'reject' ? 'Reject Application' : 'Request Correction'}
        </h3>
        <p class="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
          This action will immediately update the official application status and notify the citizen via SMS and email.
        </p>

        {#if actionModal === 'reject' || actionModal === 'clarify'}
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-900 mb-2" for="remarkText">Official Remarks (Required) *</label>
            <textarea
              id="remarkText"
              bind:value={remarkText}
              rows="4"
              required
              placeholder="Please provide clear reasons for the citizen..."
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-colors resize-none"
            ></textarea>
          </div>
        {/if}

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button 
            onclick={() => actionModal = null} 
            class="w-full sm:w-auto rounded-xl px-5 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onclick={() => handleAction(actionModal!)}
            class="w-full sm:w-auto rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2 {actionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : actionModal === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#071A28] hover:bg-[#0A253C]'}"
          >
            Confirm Decision
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
