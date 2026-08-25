<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser } from '$lib/stores/auth';
  import type { ComplaintRecord } from '$lib/server/complaints/repository';
  import { AlertCircle, PlusCircle, Clock, CheckCircle, FileText, Send, ArrowRight } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);

  let showNewModal = $state(false);
  let category = $state('service_delay');
  let subject = $state('');
  let description = $state('');
  let location = $state('');
  let complaintList = $state<ComplaintRecord[]>([]);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let submittedSuccess = $state(false);
  let errorMessage = $state('');

  $effect(() => {
    const activeUser = user;
    if (!activeUser) {
      complaintList = [];
      isLoading = false;
      return;
    }

    let cancelled = false;
    isLoading = true;
    fetch('/api/complaints', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load complaints')))
      .then((data: { complaints: ComplaintRecord[] }) => {
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
    if (!subject || !description || isSubmitting) return;

    isSubmitting = true;
    errorMessage = '';
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ category, subject, description, location })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to submit grievance');
      }

      const data = await res.json() as { complaint: ComplaintRecord };
      complaintList = [data.complaint, ...complaintList];
      submittedSuccess = true;
      setTimeout(() => {
        showNewModal = false;
        submittedSuccess = false;
        subject = '';
        description = '';
        location = '';
      }, 1500);
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Error submitting grievance';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{t('complaints.title')} — Sympho Center</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-12">
  <!-- Page Header (Compact & Clean like Dept Portal) -->
  <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
    <div class="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{t('complaints.title')}</h1>
        <p class="text-xs font-medium text-slate-500 mt-0.5">{t('complaints.subtitle')}</p>
      </div>

      <button
        onclick={() => showNewModal = true}
        class="inline-flex items-center gap-2 rounded-xl bg-[#062206] hover:bg-[#143A14] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
      >
        <PlusCircle class="h-4 w-4" />
        {t('complaints.new')}
      </button>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {#if complaintList.length === 0}
      <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <AlertCircle class="mx-auto h-12 w-12 text-slate-300" />
        <h3 class="mt-4 text-base font-bold text-slate-900">{t('complaints.empty')}</h3>
      </div>
    {:else}
      <div class="space-y-4 stagger-children">
        {#each complaintList as comp}
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="flex items-center gap-3">
                  <span class="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 font-mono text-xs font-bold text-amber-800">
                    {comp.complaintNumber}
                  </span>
                  <span class="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {t(`complaint.status.${comp.status}`)}
                  </span>
                </div>

                <h3 class="mt-2 text-lg font-bold text-slate-900">{comp.subject}</h3>
                <p class="mt-1 text-xs text-slate-500">{comp.description}</p>
              </div>

              <div class="text-xs text-slate-500 border-t border-slate-200 pt-3 sm:border-t-0 sm:pt-0">
                Filed on {new Date(comp.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Raise Complaint Modal -->
{#if showNewModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">{t('complaints.new')}</h2>

      {#if submittedSuccess}
        <div class="rounded-xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700">
          {t('complaints.success')}
        </div>
      {:else}
        {#if errorMessage}
          <div class="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
            {errorMessage}
          </div>
        {/if}
        <form onsubmit={(e) => { e.preventDefault(); submitGrievance(); }} class="space-y-4">
          <div>
            <label for="complaint-category" class="block text-xs font-bold text-slate-900 mb-1">{t('complaints.field.category')}</label>
            <select id="complaint-category" bind:value={category} class="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none">
              <option value="service_delay">Service Delay / Timelines Breached</option>
              <option value="document_issue">Document Processing Issue</option>
              <option value="officer_misconduct">Officer Inquiry / Conduct</option>
              <option value="technical_issue">Platform / Portal Technical Error</option>
            </select>
          </div>

          <div>
            <label for="complaint-subject" class="block text-xs font-bold text-slate-900 mb-1">{t('complaints.field.subject')} *</label>
            <input id="complaint-subject" type="text" bind:value={subject} required placeholder="Brief title of grievance" class="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none" />
          </div>

          <div>
            <label for="complaint-description" class="block text-xs font-bold text-slate-900 mb-1">{t('complaints.field.description')} *</label>
            <textarea id="complaint-description" bind:value={description} required rows="3" placeholder="Provide full details..." class="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none"></textarea>
          </div>

          <div>
            <label for="complaint-location" class="block text-xs font-bold text-slate-900 mb-1">{t('complaints.field.location')}</label>
            <input id="complaint-location" type="text" bind:value={location} placeholder="District / Taluk" class="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none" />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" onclick={() => showNewModal = false} class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
              {t('common.cancel')}
            </button>
            <button type="submit" class="rounded-xl bg-primary-500 px-5 py-2 text-xs font-semibold text-white hover:bg-primary-600 transition">
              {t('complaints.submit')}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
