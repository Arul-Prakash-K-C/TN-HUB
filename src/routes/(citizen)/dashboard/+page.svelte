<script lang="ts">
  let { data } = $props();

  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
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

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const user = $derived($currentUser);
  const authenticated = $derived($isAuthenticated);

  const applications = $derived(data.applications);
  const activeApplications = $derived(applications.filter(a => !['COMPLETED', 'REJECTED', 'DRAFT', 'CANCELLED'].includes(a.status)));
  const completedApplications = $derived(applications.filter(a => a.status === 'COMPLETED'));
  const pendingReview = $derived(applications.filter(a => ['OFFICER_REVIEW', 'DOCUMENT_VERIFICATION', 'FIELD_VERIFICATION'].includes(a.status)));
  const documentsCount = $derived(data.documentCount);

  function getStatusBadge(status: string) {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  }
</script>

<svelte:head>
  <title>Citizen Dashboard — TN Hub</title>
</svelte:head>

{#if !authenticated || !user}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Lock class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Authentication Required</h2>
      <p class="mt-2 text-xs text-slate-500">Please sign in to access your citizen dashboard.</p>
      <a href="/login?redirect=/dashboard" class="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 py-3.5 text-xs font-bold text-white shadow transition hover:bg-primary-700">
        Go to Login
      </a>
    </div>
  </div>
{:else}
  <div class="bg-slate-50 min-h-screen pb-16 flex flex-col w-full">
    <!-- Page Header (Compact & Clean like Dept Portal) -->
    <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
      <div class="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-black tracking-tight text-slate-900">Citizen Workspace</span>
            <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase border border-emerald-200">Verified</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Welcome back, {user.name}</h1>
          <p class="text-xs font-medium text-slate-500 mt-0.5">Manage your government service applications, official certificates, and document vault.</p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/services" class="inline-flex items-center justify-center gap-2 bg-[#062206] hover:bg-[#143A14] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all">
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
              <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-1 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Apps</h3>
                <p class="text-2xl font-black text-[#062206]">{activeApplications.length}</p>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-1 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Completed</h3>
                <p class="text-2xl font-black text-[#062206]">{completedApplications.length}</p>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-1 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pending</h3>
                <p class="text-2xl font-black text-[#062206]">{pendingReview.length}</p>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-1 shadow-xs transition-shadow hover:shadow-sm">
                <h3 class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Documents</h3>
                <p class="text-2xl font-black text-[#062206]">{documentsCount}</p>
              </div>
            </div>

            <!-- Integrated Quick Actions -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div class="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">Common Actions</h3>
              </div>
              <div class="flex flex-col">
                <a class="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group" href="/services/e-adangal-extract">
                  <div class="flex items-center gap-3">
                    <FileText class="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Apply for e-Adangal</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600" />
                </a>
                <a class="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group" href="/applications">
                  <div class="flex items-center gap-3">
                    <Clock class="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Track Existing Applications</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600" />
                </a>
                <a class="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group" href="/documents">
                  <div class="flex items-center gap-3">
                    <Lock class="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Access DigiLocker Vault</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600" />
                </a>
                <a class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group" href="/complaints">
                  <div class="flex items-center gap-3">
                    <AlertCircle class="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">File a Grievance</span>
                  </div>
                  <ArrowRight class="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600" />
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column: Recent Applications -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl border border-slate-200 h-full flex flex-col shadow-xs">
              <div class="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">Recent Service Applications</h3>
                <a class="text-xs font-bold text-emerald-700 hover:underline px-2 py-1" href="/applications">
                  View All
                </a>
              </div>
              
              <div class="flex flex-col p-5 gap-3">
                {#if applications.length === 0}
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                    <FileText class="h-10 w-10 text-slate-200 mb-3" />
                    <p class="text-xs font-bold text-slate-500">No active applications yet.</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">Browse services to apply.</p>
                  </div>
                {:else}
                  {#each applications.slice(0, 5) as app}
                    <a href="/applications/{app.id}" class="p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-emerald-300 hover:shadow-xs transition-all group">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-bold text-slate-900">
                            {currentLocale === 'ta' ? app.serviceNameTA : app.serviceName}
                          </h4>
                          <span class="text-[10px] text-slate-500 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {app.applicationNumber}
                          </span>
                        </div>
                        <p class="text-xs font-medium text-slate-500">
                          {currentLocale === 'ta' ? app.departmentNameTA : app.departmentName} • Submitted {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider {getStatusBadge(app.status)}">
                          {t(`status.${app.status}`)}
                        </span>
                        <div class="text-slate-300 group-hover:text-emerald-600 transition-colors p-1">
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
