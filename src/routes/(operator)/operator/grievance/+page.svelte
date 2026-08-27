<script>

  import { PlusCircle, AlertCircle, Clock, CheckCircle } from '@lucide/svelte';

let showNewModal = $state(false);
let category = $state('kiosk_hardware');
let subject = $state('');
let description = $state('');
let location = $state('');
let complaintList = $state([]);
let isLoading = $state(true);
let isSubmitting = $state(false);
let submittedSuccess = $state(false);
let errorMessage = $state('');
$effect(() => {
    let cancelled = false;
    isLoading = true;
    fetch('/api/complaints', { credentials: 'same-origin' })
        .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load grievances')))
        .then((data) => {
        if (!cancelled) {
            complaintList = data.complaints || [];
            isLoading = false;
        }
    })
        .catch(() => {
        if (!cancelled) {
            complaintList = [];
            isLoading = false;
        }
    });
    return () => { cancelled = true; };
});
async function submitGrievance() {
    if (!subject || !description || isSubmitting)
        return;
    isSubmitting = true;
    errorMessage = '';
    try {
        const res = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ category, subject, description, location, departmentId: 'dept-tnega' })
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Failed to submit grievance');
        }
        const data = await res.json();
        complaintList = [data.complaint, ...complaintList];
        submittedSuccess = true;
        setTimeout(() => {
            showNewModal = false;
            submittedSuccess = false;
            subject = '';
            description = '';
            location = '';
        }, 1500);
    }
    catch (err) {
        errorMessage = err instanceof Error ? err.message : 'Error submitting grievance';
    }
    finally {
        isSubmitting = false;
    }
}
</script>

<svelte:head>
  <title>Operator Grievances — TN Hub</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-12 flex flex-col w-full">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8">
    <div class="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">Kiosk Grievances & Issues</h1>
        <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">Report technical malfunctions, payment portal issues, or missing service catalogues.</p>
      </div>

      <button
        onclick={() => showNewModal = true}
        class="inline-flex items-center gap-2 rounded-xl bg-surface text-primary hover:bg-primary-soft px-4 py-2.5 text-xs font-bold shadow-md transition-all animate-fade-in"
      >
        <PlusCircle class="h-4 w-4" />
        Raise Kiosk Complaint
      </button>
    </div>
  </div>

  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
    {#if isLoading}
      <div class="text-center py-12 text-xs font-bold text-text-muted">Loading kiosk grievances...</div>
    {:else if complaintList.length === 0}
      <div class="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm flex flex-col items-center">
        <AlertCircle class="mx-auto h-12 w-12 text-text-faint mb-4" />
        <h3 class="text-base font-bold text-text">No grievances registered</h3>
        <p class="mt-1 text-xs text-text-muted">If you experience hardware or registry problems, use the button above to register an issue.</p>
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2">
        {#each complaintList as comp}
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col justify-between hover:border-primary/30 transition">
            <div>
              <div class="flex items-center gap-3">
                <span class="rounded-lg bg-warning-soft border border-warning/20 px-2.5 py-1 font-mono text-[10px] font-bold text-warning">
                  {comp.complaintNumber}
                </span>
                <span class="rounded-full bg-primary-soft border border-primary/20 px-3 py-0.5 text-[10px] font-bold text-primary-soft-text uppercase tracking-wider">
                  {comp.status}
                </span>
              </div>

              <h3 class="mt-3 text-sm font-bold text-text">{comp.subject}</h3>
              <p class="mt-1 text-xs text-text-muted leading-relaxed font-medium">{comp.description}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-border flex justify-between items-center text-[10px] text-text-faint uppercase font-bold">
              <span>Category: {comp.category.replace('_', ' ')}</span>
              <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Raise Kiosk Complaint Modal -->
{#if showNewModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
    <div class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
      <h2 class="text-lg font-black text-text mb-4">Register Kiosk Issue</h2>

      {#if submittedSuccess}
        <div class="rounded-xl bg-success-soft p-4 text-center text-xs font-bold text-success animate-pulse">
          Complaint submitted successfully TNeGA support has been notified.
        </div>
      {:else}
        {#if errorMessage}
          <div class="mb-4 rounded-xl bg-danger-soft border border-danger/20 p-3 text-xs font-bold text-danger">
            {errorMessage}
          </div>
        {/if}
        <form onsubmit={(e) => { e.preventDefault(); submitGrievance(); }} class="space-y-4">
          <div>
            <label for="complaint-category" class="block text-xs font-bold text-text mb-1">Issue Category</label>
            <select id="complaint-category" bind:value={category} class="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="kiosk_hardware">Kiosk Biometric / Printer Hardware Malfunction</option>
              <option value="payment_gateway">Kiosk Wallet / Payment Gateway Failure</option>
              <option value="service_registry">Service Registry Configuration Error</option>
              <option value="citizen_conflict">Citizen Registry / Document Sync Conflict</option>
            </select>
          </div>

          <div>
            <label for="complaint-subject" class="block text-xs font-bold text-text mb-1">Subject *</label>
            <input id="complaint-subject" type="text" bind:value={subject} required placeholder="e.g. Biometric scanner not responding" class="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>

          <div>
            <label for="complaint-description" class="block text-xs font-bold text-text mb-1">Detailed Description *</label>
            <textarea id="complaint-description" bind:value={description} required rows="3" placeholder="Provide full details of the issue..." class="w-full rounded-xl border border-border bg-surface-container-low p-2.5 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick={() => showNewModal = false} class="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-muted transition">
              Cancel
            </button>
            <button type="submit" class="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition">
              Submit Grievance
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
