<script>

  import { tt, locale } from '$lib/i18n';
  import {
    ArrowLeft,
    Clock,
    FileText,
    Download,
    AlertCircle,
    User,
    Mail,
    Phone,
    Calendar,
    IdCard,
    Home,
    Route,
    MapPin,
    Hash
  } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const application = $derived(data.application);
const timelineEntries = $derived([...(application?.history ?? [])].sort((left, right) => left.timestamp.localeCompare(right.timestamp)));

const getFieldMeta = (key) => {
  switch (key) {
    case 'fullName':
      return { label: t('apply.field.fullName') || 'Full Name', icon: User };
    case 'email':
      return { label: t('apply.field.email') || 'Email Address', icon: Mail };
    case 'phone':
      return { label: t('apply.field.phone') || 'Phone Number', icon: Phone };
    case 'dateOfBirth':
      return { label: t('apply.field.dob') || 'Date of Birth', icon: Calendar };
    case 'gender':
      return { label: t('apply.field.gender') || 'Gender', icon: User };
    case 'aadhaarNumber':
      return { label: t('apply.field.aadhaar') || 'Aadhaar Number', icon: IdCard };
    case 'doorNo':
      return { label: t('apply.field.doorNo') || 'Door Number', icon: Home };
    case 'street':
      return { label: t('apply.field.street') || 'Street', icon: Route };
    case 'district':
      return { label: t('apply.field.district') || 'District', icon: MapPin };
    case 'pincode':
      return { label: t('apply.field.pincode') || 'Pincode', icon: Hash };
    case 'fatherName':
      return { label: t('apply.field.fatherName') || 'Father\'s Name', icon: User };
    default:
      return { label: key.replace(/([A-Z])/g, ' $1'), icon: FileText };
  }
};
function getStatusColor(status) {
    switch (String(status ?? '').toUpperCase()) {
        case 'COMPLETED':
        case 'APPROVED':
        case 'CERTIFICATE_GENERATED':
            return 'bg-success text-white ring-4 ring-success/10';
        case 'REJECTED':
            return 'bg-danger text-white ring-4 ring-danger/10';
        case 'CLARIFICATION_REQUESTED':
            return 'bg-warning text-white ring-4 ring-warning/10';
        case 'DOCUMENT_VERIFICATION':
        case 'OFFICER_REVIEW':
        case 'FIELD_VERIFICATION':
        case 'FAMILY_VERIFICATION':
        case 'SUBMITTED':
            return 'bg-primary text-white ring-4 ring-primary/10';
        case 'DRAFT':
            return 'bg-surface-container text-text-muted ring-4 ring-border/50';
        default:
            return 'bg-surface-container text-text-muted ring-4 ring-border/50';
    }
}

function getTimelineTitle(status) {
  const normalized = String(status ?? '').toUpperCase();
  return t(`status.${normalized}`) || normalized.replaceAll('_', ' ');
}

function getTimelineCardClass(status) {
  switch (String(status ?? '').toUpperCase()) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'CERTIFICATE_GENERATED':
      return 'border-success/20 bg-success-soft/40';
    case 'REJECTED':
      return 'border-danger/20 bg-danger-soft/40';
    case 'CLARIFICATION_REQUESTED':
      return 'border-warning/20 bg-warning-soft/40';
    case 'DOCUMENT_VERIFICATION':
    case 'OFFICER_REVIEW':
    case 'FIELD_VERIFICATION':
    case 'FAMILY_VERIFICATION':
    case 'SUBMITTED':
      return 'border-primary/15 bg-primary-soft/35';
    default:
      return 'border-border bg-surface-container/70';
  }
}

function getTimelineTextClass(status) {
  switch (String(status ?? '').toUpperCase()) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'CERTIFICATE_GENERATED':
      return 'text-success';
    case 'REJECTED':
      return 'text-danger';
    case 'CLARIFICATION_REQUESTED':
      return 'text-warning';
    case 'DOCUMENT_VERIFICATION':
    case 'OFFICER_REVIEW':
    case 'FIELD_VERIFICATION':
    case 'FAMILY_VERIFICATION':
    case 'SUBMITTED':
      return 'text-primary-soft-text';
    default:
      return 'text-text-muted';
  }
}
async function deleteDraft() {
    if (!application)
        return;
    const confirmed = window.confirm(t('confirm.deleteDraftApplication'));
    if (!confirmed)
        return;
    try {
        const response = await fetch(`/api/applications/${application.id}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const body = await response.json().catch(() => null);
        if (!response.ok)
            throw new Error(body?.message ?? t('errors.deleteDraft'));
        window.location.href = '/applications';
    }
    catch (cause) {
        alert(cause instanceof Error ? cause.message : t('errors.deleteDraft'));
    }
}
async function downloadDocument(documentId) {
    try {
        const response = await fetch(`/api/documents/${documentId}/download`, { credentials: 'same-origin' });
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.url)
            throw new Error(body?.message ?? t('errors.accessDocument'));
        window.open(body.url, '_blank', 'noopener,noreferrer');
    }
    catch (cause) {
        alert(cause instanceof Error ? cause.message : t('errors.accessDocument'));
    }
}
</script>

<svelte:head>
  <title>{application ? application.applicationNumber : 'Application'} — TN Kuviyam</title>
</svelte:head>

{#if !application}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4">
    <AlertCircle class="h-12 w-12 text-error/60" />
    <h2 class="mt-4 text-h2 text-text">{t('ui.routes.citizen.applications.id.6e6cb5b6')}</h2>
    <p class="mt-1 text-sm text-text-muted">{t('ui.routes.citizen.applications.id.4238230d')}</p>
    <a href="/applications" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
      <ArrowLeft class="h-4 w-4" /> {t('ui.back.to.applications')}
    </a>
  </div>
{:else}
  <div class="min-h-screen bg-background pb-12 text-text">
    <!-- Top Nav Header -->
    <div class="public-banner border-b border-white/10">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <a href="/applications" class="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/75 transition hover:text-white">
          <ArrowLeft class="h-3.5 w-3.5" />
          {t('common.back')} to Applications
        </a>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-3">
              <span class="rounded-lg bg-white/10 px-3 py-1 font-mono text-sm font-bold text-white">
                {application.applicationNumber}
              </span>
              <span class="rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-xs font-semibold text-white/80">
                {t(`status.${application.status}`)}
              </span>
            </div>
            <h1 class="mt-2 text-h1 text-white">
              {currentLocale === 'ta' ? application.serviceNameTA : application.serviceName}
            </h1>
            <p class="mt-0.5 text-sm text-white/75">
              {currentLocale === 'ta' ? application.departmentNameTA : application.departmentName}
            </p>
          </div>

          {#if (application.status === 'DRAFT' || application.status === 'CLARIFICATION_REQUESTED') && application.serviceSlug}
            <div class="flex flex-wrap items-center gap-2">
              <a
                href={`/services/${application.serviceSlug}/apply?draft=${application.id}`}
                class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text shadow transition hover:bg-surface-container"
              >
                {application.status === 'CLARIFICATION_REQUESTED' ? 'Edit & Resubmit' : 'Edit Draft'}
              </a>
              {#if application.status === 'DRAFT'}
                <a
                  href={`/services/${application.serviceSlug}/apply?draft=${application.id}&step=5`}
                  class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary-hover"
                >
                  {t('apply.step.submit')}
                </a>
                <button
                  type="button"
                  onclick={deleteDraft}
                  class="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 shadow transition hover:bg-rose-500/20"
                >
                  {t('ui.delete.draft')}
                </button>
              {/if}
            </div>
          {:else if application.status === 'COMPLETED' || application.status === 'APPROVED' || application.status === 'CERTIFICATE_GENERATED'}
            <a
              href="/certificate/{application.id}"
              target="_blank"
              class="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-success-dark"
            >
              <Download class="h-4 w-4" />
              {t('application.downloadCertificate')}
            </a>
          {/if}
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {#if application.status === 'CLARIFICATION_REQUESTED'}
        <div class="mb-8 rounded-3xl border border-warning/30 bg-warning-soft p-6 shadow-md animate-fade-in flex flex-col sm:flex-row items-start gap-4 text-text">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning text-white shadow-sm shrink-0">
            <AlertCircle class="h-6 w-6" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-black text-text">{t('ui.routes.citizen.applications.id.4348c977')}</h3>
            <p class="mt-1.5 text-xs text-text-muted leading-relaxed font-medium">
              {t('ui.the.reviewing.officer.has.requested.corrections.please.review.the.official.comme')} <strong class="text-primary font-bold">{t('ui.routes.citizen.applications.id.f10411fd')}</strong>
            </p>
            {#if application.history.length > 0 && application.history.find(h => h.status === 'CLARIFICATION_REQUESTED')?.remarks}
              <div class="mt-4 bg-surface dark:bg-surface-container border border-warning/20 p-4 rounded-2xl">
                <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">{t('ui.routes.citizen.applications.id.b9fff40d')}</span>
                <p class="text-xs font-bold text-warning italic">
                  "{application.history.find(h => h.status === 'CLARIFICATION_REQUESTED')?.remarks}"
                </p>
              </div>
            {/if}
            <div class="mt-4 flex gap-3 flex-wrap">
              <a
                href={`/services/${application.serviceSlug}/apply?draft=${application.id}`}
                class="inline-flex items-center gap-2 rounded-xl bg-warning px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-warning/90"
              >
                {t('ui.respond.and.edit.application')}
              </a>
            </div>
          </div>
        </div>
      {/if}

      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main Column: Timeline & Data -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Timeline Section -->
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-6">{t('application.timeline')}</h2>

            <div class="relative space-y-6 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {#each timelineEntries as entry, index}
                <div class="relative flex items-start gap-4">
                  <div class="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[11px] font-black shadow-sm {getStatusColor(entry.status)}">
                    {index + 1}
                  </div>

                  <div class="flex-1 rounded-2xl border p-4 shadow-sm transition-colors {getTimelineCardClass(entry.status)}">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-black uppercase tracking-wider {getTimelineTextClass(entry.status)}">
                        {getTimelineTitle(entry.status)}
                      </span>
                      <span class="text-[11px] text-text-muted">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p class="mt-1 text-sm font-semibold text-text">
                      {currentLocale === 'ta' ? entry.descriptionTA : entry.description}
                    </p>

                    <div class="mt-3 flex flex-col gap-2 border-t border-border/70 pt-3 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
                      <span>{t('ui.routes.citizen.applications.id.153b0e9b')} <strong class="text-text">{entry.actorName}</strong> ({entry.actorRole})</span>
                      {#if entry.remarks}
                        <span class="max-w-full italic text-text-faint sm:text-right">"{entry.remarks}"</span>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Application Form Data -->
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-4">{t('application.summary')}</h2>

            <div class="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
              <!-- Left Column (Even Indexes) -->
              <div class="divide-y divide-border/40">
                {#each Object.entries(application.formData).filter(([_, value]) => value) as [key, value], idx}
                  {#if idx % 2 === 0}
                    {@const meta = getFieldMeta(key)}
                    <div class="flex items-center gap-4 py-3.5">
                      <div class="text-text-muted shrink-0">
                        <meta.icon class="h-5 w-5" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                          {meta.label}
                        </span>
                        <span class="text-sm font-semibold text-text mt-0.5 block capitalize">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>

              <!-- Right Column (Odd Indexes) -->
              <div class="divide-y divide-border/40">
                {#each Object.entries(application.formData).filter(([_, value]) => value) as [key, value], idx}
                  {#if idx % 2 === 1}
                    {@const meta = getFieldMeta(key)}
                    <div class="flex items-center gap-4 py-3.5">
                      <div class="text-text-muted shrink-0">
                        <meta.icon class="h-5 w-5" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                          {meta.label}
                        </span>
                        <span class="text-sm font-semibold text-text mt-0.5 block capitalize">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>

          <!-- Documents Submitted -->
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-4">{t('application.documents')}</h2>

            <div class="space-y-3">
              {#each application.documents as doc}
                <div class="flex items-center justify-between rounded-xl border border-border bg-surface-container p-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText class="h-5 w-5" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-text">{doc.name}</div>
                      <div class="text-xs text-text-muted">{doc.fileName} • {(doc.fileSize / 1024).toFixed(0)} KB • Source: {doc.source}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="rounded-full border border-border bg-white/8 px-3 py-1 text-xs font-semibold text-text-muted">
                      {doc.status}
                    </span>
                    <button onclick={() => downloadDocument(doc.id)} class="text-xs font-bold text-primary hover:underline">{t('ui.routes.citizen.applications.id.07708181')}</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Sidebar: Status -->
        <div class="space-y-6">
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 class="text-sm font-bold text-text mb-3">{t('ui.routes.citizen.applications.id.70844372')}</h3>
            <div class="text-xs text-text-muted leading-relaxed">
              {t('ui.target.completion.date')}
              <strong class="text-text block text-sm mt-1">
                {application.expectedCompletionDate ? new Date(application.expectedCompletionDate).toLocaleDateString() : '7 Days'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
