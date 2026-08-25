<script lang="ts">
  let { data } = $props();

  import { tt, locale } from '$lib/i18n';
  import {
    ArrowLeft,
    CheckCircle,
    Clock,
    FileText,
    Download,
    UserCheck,
    AlertCircle,
    ShieldCheck,
    ExternalLink
  } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const application = $derived(data.application);

  function getStatusColor(status: string) {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-success text-white';
      case 'REJECTED':
        return 'bg-error text-white';
      case 'OFFICER_REVIEW':
      case 'FIELD_VERIFICATION':
      case 'DOCUMENT_VERIFICATION':
        return 'bg-warning text-white';
      default:
        return 'bg-border text-text-muted';
    }
  }

  async function downloadDocument(documentId: string) {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, { credentials: 'same-origin' });
      const body = await response.json().catch(() => null) as { url?: string; message?: string } | null;
      if (!response.ok || !body?.url) throw new Error(body?.message ?? 'Unable to access this document.');
      window.open(body.url, '_blank', 'noopener,noreferrer');
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Unable to access this document.');
    }
  }
</script>

<svelte:head>
  <title>{application ? application.applicationNumber : 'Application'} — Sympho Center</title>
</svelte:head>

{#if !application}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4">
    <AlertCircle class="h-12 w-12 text-error/60" />
    <h2 class="mt-4 text-h2 text-text">Application Not Found</h2>
    <p class="mt-1 text-sm text-text-muted">The requested application ID does not exist.</p>
    <a href="/applications" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
      <ArrowLeft class="h-4 w-4" /> Back to Applications
    </a>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <!-- Top Nav Header -->
    <div class="bg-white border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <a href="/applications" class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition mb-3">
          <ArrowLeft class="h-3.5 w-3.5" />
          {t('common.back')} to Applications
        </a>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-3">
              <span class="rounded-lg bg-primary/10 px-3 py-1 font-mono text-sm font-bold text-primary">
                {application.applicationNumber}
              </span>
              <span class="rounded-full bg-surface-tertiary px-3 py-0.5 text-xs font-semibold text-text-muted">
                {t(`status.${application.status}`)}
              </span>
            </div>
            <h1 class="mt-2 text-h1 text-text">
              {currentLocale === 'ta' ? application.serviceNameTA : application.serviceName}
            </h1>
            <p class="text-sm text-text-muted mt-0.5">
              {currentLocale === 'ta' ? application.departmentNameTA : application.departmentName}
            </p>
          </div>

          {#if application.status === 'COMPLETED' || application.status === 'APPROVED'}
            <button
              onclick={() => alert('Mock Certificate Downloaded!')}
              class="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-success-dark"
            >
              <Download class="h-4 w-4" />
              {t('application.downloadCertificate')}
            </button>
          {/if}
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main Column: Timeline & Data -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Timeline Section -->
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-6">{t('application.timeline')}</h2>

            <div class="relative space-y-6 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {#each application.history as entry, index}
                <div class="relative flex items-start gap-4">
                  <div class="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm {getStatusColor(entry.status)}">
                    {index + 1}
                  </div>

                  <div class="flex-1 rounded-xl border border-border bg-surface-secondary p-4">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-primary">
                        {t(`status.${entry.status}`)}
                      </span>
                      <span class="text-[11px] text-text-muted">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p class="mt-1 text-sm font-medium text-text">
                      {currentLocale === 'ta' ? entry.descriptionTA : entry.description}
                    </p>

                    <div class="mt-2 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border/50">
                      <span>Actor: <strong class="text-text">{entry.actorName}</strong> ({entry.actorRole})</span>
                      {#if entry.remarks}
                        <span class="italic text-text-secondary">"{entry.remarks}"</span>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Application Form Data -->
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-4">{t('application.summary')}</h2>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {#each Object.entries(application.formData) as [key, value]}
                {#if value}
                  <div class="rounded-xl bg-surface-secondary p-3">
                    <div class="text-xs font-medium text-text-muted capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div class="mt-0.5 text-sm font-semibold text-text">
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Documents Submitted -->
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 class="text-lg font-bold text-text mb-4">{t('application.documents')}</h2>

            <div class="space-y-3">
              {#each application.documents as doc}
                <div class="flex items-center justify-between rounded-xl border border-border p-4">
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
                    <span class="rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success-dark">
                      {doc.status}
                    </span>
                    <button onclick={() => downloadDocument(doc.id)} class="text-xs font-bold text-primary hover:underline">View</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Sidebar: Officer Info & Status -->
        <div class="space-y-6">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h3 class="text-sm font-bold text-text mb-4">{t('application.assignedOfficer')}</h3>

            {#if application.assignedOfficerName}
              <div class="flex items-center gap-3 rounded-xl bg-surface-secondary p-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                  {application.assignedOfficerName.charAt(0)}
                </div>
                <div>
                  <div class="text-sm font-bold text-text">{application.assignedOfficerName}</div>
                  <div class="text-xs text-text-muted">Revenue Inspector • Chennai</div>
                </div>
              </div>
            {:else}
              <div class="text-xs text-text-muted">Not assigned yet</div>
            {/if}
          </div>

          <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h3 class="text-sm font-bold text-text mb-3">Expected SLA</h3>
            <div class="text-xs text-text-muted leading-relaxed">
              Target completion date:
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
