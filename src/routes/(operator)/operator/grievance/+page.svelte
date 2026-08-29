<script>
  import { PlusCircle, AlertCircle, Clock, CheckCircle } from '@lucide/svelte';
  import { currentUser } from '$lib/stores/auth';
  import { tt, locale } from '$lib/i18n';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);

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
            body: JSON.stringify({ category, subject, description, location, departmentId: 'dept-kuviyam', email: user?.email })
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
  <title>{t('ui.routes.operator.operator.grievance.8a820171')}</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-12 flex flex-col w-full">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8">
    <div class="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">{t('ui.routes.operator.operator.grievance.baf37b23')}</h1>
        <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">{t('ui.routes.operator.operator.grievance.0099f005')}</p>
      </div>

      <button
        onclick={() => showNewModal = true}
        class="inline-flex items-center gap-2 rounded-xl bg-surface text-primary hover:bg-primary-soft px-4 py-2.5 text-xs font-bold shadow-md transition-all animate-fade-in"
      >
        <PlusCircle class="h-4 w-4" />
        {t('ui.routes.operator.operator.grievance.b1047952')}
      </button>
    </div>
  </div>

  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
    {#if isLoading}
      <div class="text-center py-12 text-xs font-bold text-text-muted">{t('ui.routes.operator.operator.grievance.5e8ffc98')}</div>
    {:else if complaintList.length === 0}
      <div class="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm flex flex-col items-center">
        <AlertCircle class="mx-auto h-12 w-12 text-text-faint mb-4" />
        <h3 class="text-base font-bold text-text">{t('ui.routes.operator.operator.grievance.beb0c942')}</h3>
        <p class="mt-1 text-xs text-text-muted">{t('ui.routes.operator.operator.grievance.1e8f627c')}</p>
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

<!-- Raise Complaint Modal -->
{#if showNewModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-scale-in">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-text">{t('ui.routes.operator.operator.grievance.b1047952')}</h3>
        <button
          onclick={() => showNewModal = false}
          class="rounded-lg p-1 text-text-muted hover:bg-surface-container"
        >
          ✕
        </button>
      </div>

      {#if submittedSuccess}
        <div class="text-center py-8">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary mb-3">
            ✓
          </div>
          <p class="text-sm font-bold text-text">{t('ui.routes.operator.operator.grievance.d185c9e6')}</p>
        </div>
      {:else}
        <form onsubmit={(e) => { e.preventDefault(); submitGrievance(); }} class="space-y-4">
          <div>
            <label for="comp-cat" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.operator.operator.grievance.6340c2f1')}</label>
            <select
              id="comp-cat"
              bind:value={category}
              class="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="kiosk_hardware">{t('ui.routes.operator.operator.grievance.231bef0b')}</option>
              <option value="portal_bug">{t('ui.routes.operator.operator.grievance.72fa45ff')}</option>
              <option value="payment_gateway">{t('ui.routes.operator.operator.grievance.0462472f')}</option>
              <option value="service_missing">{t('ui.routes.operator.operator.grievance.65b0f57c')}</option>
              <option value="other">{t('ui.routes.operator.operator.grievance.aeb49967')}</option>
            </select>
          </div>

          <div>
            <label for="comp-sub" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.operator.operator.grievance.8916d111')}</label>
            <input
              id="comp-sub"
              type="text"
              bind:value={subject}
              required
              placeholder={t('ui.e.g.thermal.printer.not.outputting.receipts')}
              class="w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-text placeholder:text-text-faint outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label for="comp-desc" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.operator.operator.grievance.637a5c8e')}</label>
            <textarea
              id="comp-desc"
              bind:value={description}
              required
              rows={4}
              placeholder={t('ui.provide.specific.details.about.the.malfunction.error.messages.displayed.and.step')}
              class="w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-text placeholder:text-text-faint outline-none resize-none focus:ring-2 focus:ring-primary/20"
            ></textarea>
          </div>

          <div>
            <label for="comp-loc" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.operator.operator.grievance.1fabf650')}</label>
            <input
              id="comp-loc"
              type="text"
              bind:value={location}
              placeholder={t('ui.e.g.kiosk.42.madurai.e.sevai.center')}
              class="w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-text placeholder:text-text-faint outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {#if errorMessage}
            <p class="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{errorMessage}</p>
          {/if}

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onclick={() => showNewModal = false}
              class="rounded-xl px-4 py-2 text-xs font-bold text-text-muted hover:bg-surface-container"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !description.trim()}
              class="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Grievance'}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
