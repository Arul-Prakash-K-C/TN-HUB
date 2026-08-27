<script>

  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, isRestored } from '$lib/stores/auth';
  import {
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    FolderKanban,
    PlusCircle,
    MessageCircle,
    ArrowRight,
    Lock,
    ExternalLink,
    Shield
  } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const user = $derived($currentUser);
const authenticated = $derived($isAuthenticated);
const restored = $derived($isRestored);
const applications = $derived(data.applications);
const activeApplications = $derived(applications.filter(a => !['COMPLETED', 'REJECTED', 'DRAFT', 'CANCELLED'].includes(a.status)));
const completedApplications = $derived(applications.filter(a => a.status === 'COMPLETED'));
const pendingReview = $derived(applications.filter(a => ['OFFICER_REVIEW', 'DOCUMENT_VERIFICATION', 'FIELD_VERIFICATION'].includes(a.status)));
const documentsCount = $derived(data.documentCount);
function getStatusBadge(status) {
    switch (status) {
        case 'COMPLETED':
        case 'APPROVED':
            return 'bg-[#316342]/10 text-[#316342] border border-[#316342]/20';
        case 'REJECTED':
            return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
        case 'DRAFT':
            return 'bg-white/8 text-text-muted border border-border';
        default:
            return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
    }
}
</script>

<svelte:head>
  <title>Citizen Dashboard — TN Hub</title>
</svelte:head>

{#if !restored}
  <div class="flex min-h-[60vh] flex-col items-center justify-center bg-background p-4">
    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
{:else if !authenticated || !user}
  <div class="flex min-h-[60vh] flex-col items-center justify-center bg-background p-4">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
        <Lock class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Authentication Required</h2>
      <p class="mt-2 text-xs text-text-muted">Please sign in to access your citizen dashboard.</p>
      <a href="/login?redirect=/dashboard" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow transition hover:bg-primary-hover">
        Go to Login
      </a>
    </div>
  </div>
{:else}
  <div class="flex min-h-screen w-full flex-col bg-background pb-16 text-text">
    <!-- Page Header (Green Banner matching Public Pages) -->
    <div class="public-banner px-6 py-8 shadow-md sm:px-8">
      <div class="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="mb-1 flex items-center gap-2">
            <span class="text-xs font-black tracking-tight text-white/75">Citizen Workspace</span>
            <span class="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase border border-white/20">Verified</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white">Welcome back, {user.name}</h1>
          <p class="public-banner-subtitle mt-1 max-w-2xl text-xs font-medium">Manage your government service applications, official certificates, and document vault.</p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/services" class="adaptive-action-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all">
            <PlusCircle class="h-4 w-4" />
            Apply for New Service
          </a>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="flex-1 px-6 sm:px-8 py-6 w-full">
      <div class="max-w-7xl mx-auto w-full space-y-6">
        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Column: Status & Quick Actions -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Status Overview Cards -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Apps</h3>
                <p class="text-2xl font-black text-primary">{activeApplications.length}</p>
              </div>
              <div class="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Completed</h3>
                <p class="text-2xl font-black text-primary">{completedApplications.length}</p>
              </div>
              <div class="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pending</h3>
                <p class="text-2xl font-black text-primary">{pendingReview.length}</p>
              </div>
              <div class="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Documents</h3>
                <p class="text-2xl font-black text-primary">{documentsCount}</p>
              </div>
            </div>

            <!-- Integrated Quick Actions -->
            <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
              <div class="border-b border-border bg-surface-container px-5 py-4">
                <h3 class="text-xs font-black uppercase tracking-wider text-text">Common Actions</h3>
              </div>
              <div class="flex flex-col">
                <a class="group flex items-center justify-between border-b border-border p-4 transition-colors hover:bg-surface-container" href="/services/e-adangal-extract">
                  <div class="flex items-center gap-3">
                    <FileText class="h-4 w-4 text-text-muted transition-colors group-hover:text-primary" />
                    <span class="text-xs font-bold text-text transition-colors group-hover:text-primary">Apply for e-Adangal</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-text-faint transition-colors group-hover:text-primary" />
                </a>
                <a class="group flex items-center justify-between border-b border-border p-4 transition-colors hover:bg-surface-container" href="/applications">
                  <div class="flex items-center gap-3">
                    <Clock class="h-4 w-4 text-text-muted transition-colors group-hover:text-primary" />
                    <span class="text-xs font-bold text-text transition-colors group-hover:text-primary">Track Existing Applications</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-text-faint transition-colors group-hover:text-primary" />
                </a>
                <a class="group flex items-center justify-between border-b border-border p-4 transition-colors hover:bg-surface-container" href="/documents">
                  <div class="flex items-center gap-3">
                    <Lock class="h-4 w-4 text-text-muted transition-colors group-hover:text-primary" />
                    <span class="text-xs font-bold text-text transition-colors group-hover:text-primary">Access DigiLocker Vault</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-text-faint transition-colors group-hover:text-primary" />
                </a>
                <a class="group flex items-center justify-between p-4 transition-colors hover:bg-surface-container" href="/complaints">
                  <div class="flex items-center gap-3">
                    <AlertCircle class="h-4 w-4 text-text-muted transition-colors group-hover:text-primary" />
                    <span class="text-xs font-bold text-text transition-colors group-hover:text-primary">File a Grievance</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-text-faint transition-colors group-hover:text-primary" />
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column: Recent Applications -->
          <div class="lg:col-span-2">
            <div class="flex h-full flex-col rounded-2xl border border-border bg-surface shadow-xs">
              <div class="flex items-center justify-between rounded-t-2xl border-b border-border bg-surface-container px-5 py-4">
                <h3 class="text-xs font-black uppercase tracking-wider text-text">Recent Service Applications</h3>
                <a class="px-2 py-1 text-xs font-bold text-primary hover:text-primary-hover hover:underline" href="/applications">
                  View All
                </a>
              </div>
              
              <div class="flex flex-col p-5 gap-3">
                {#if applications.length === 0}
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                    <FileText class="mb-3 h-10 w-10 text-text-faint" />
                    <p class="text-xs font-bold text-text-muted">No active applications yet.</p>
                    <p class="mt-0.5 text-[11px] text-text-faint">Browse services to apply.</p>
                  </div>
                {:else}
                  {#each applications.slice(0, 5) as app}
                    <a href="/applications/{app.id}" class="group flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface-container/60 p-4 transition-all hover:border-primary/30 hover:bg-surface-container-high md:flex-row md:items-center">
                      <div>
                        <div class="mb-1 flex items-center gap-2">
                          <h4 class="text-sm font-bold text-text">
                            {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                          </h4>
                          <span class="rounded bg-white/8 px-2 py-0.5 font-mono text-[10px] font-bold text-text-muted">
                            {app.applicationNumber}
                          </span>
                        </div>
                        <p class="text-xs font-medium text-text-muted">
                          {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName} • Submitted {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div class="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider {getStatusBadge(app.status)}">
                          {t(`status.${app.status}`)}
                        </span>
                        <div class="p-1 text-text-faint transition-colors group-hover:text-primary">
                          <ArrowRight class="h-4 w-4" />
                        </div>
                      </div>
                    </a>
                  {/each}
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

