<script lang="ts">
  let { data } = $props();

  import { tt, locale } from '$lib/i18n';
  import { mockDigiLockerDocuments } from '$lib/data/documents';
  import type { Document } from '$lib/types';
  import { FileText, Shield, Upload, Download, CheckCircle, RefreshCw, Lock, AlertCircle } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  let activeTab = $state<'vault' | 'digilocker'>('vault');
  let isDigiLockerConnected = $state(false);
  let isConnecting = $state(false);
  let showConsentModal = $state(false);
  let vaultDocuments = $state<Document[]>([]);
  let uploadInput: HTMLInputElement;

  $effect(() => {
    vaultDocuments = data.documents;
  });

  const citizenDocs = $derived(vaultDocuments);

  function connectDigiLocker() {
    showConsentModal = true;
  }

  function confirmDigiLockerConnect() {
    isConnecting = true;
    showConsentModal = false;
    setTimeout(() => {
      isDigiLockerConnected = true;
      isConnecting = false;
    }, 1200);
  }

  async function uploadVaultDocument(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set('file', file);
    formData.set('documentType', file.name.replace(/\.[^.]+$/, ''));

    try {
      const response = await fetch('/api/documents', { method: 'POST', body: formData, credentials: 'same-origin' });
      const body = await response.json().catch(() => null) as { document?: (typeof vaultDocuments)[number]; message?: string } | null;
      if (!response.ok || !body?.document) throw new Error(body?.message ?? 'Unable to upload this document.');
      vaultDocuments = [body.document, ...vaultDocuments];
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Unable to upload this document.');
    } finally {
      input.value = '';
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
  <title>{t('documents.title')} — Sympho Center</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-12 flex flex-col w-full">
  <!-- Document Vault Header -->
  <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
    <div class="max-w-7xl mx-auto w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{t('documents.title')}</h1>
          <p class="text-xs font-medium text-slate-500 mt-0.5">{t('documents.subtitle')}</p>
        </div>
        <button
          onclick={() => uploadInput?.click()}
          class="bg-[#062206] hover:bg-[#143A14] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto shadow-xs"
        >
          <Upload class="h-4 w-4" />
          {t('documents.upload')}
        </button>
        <input bind:this={uploadInput} type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" onchange={uploadVaultDocument} />
      </div>

      <!-- Tabs -->
      <div class="flex gap-6 mt-6 border-b border-slate-200">
        <button
          onclick={() => activeTab = 'vault'}
          class="pb-2.5 text-xs font-bold flex items-center gap-2 transition-colors {activeTab === 'vault' ? 'text-[#062206] border-b-2 border-[#062206]' : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'}"
        >
          <FileText class="h-4 w-4" />
          My Document Vault ({citizenDocs.length})
        </button>
        <button
          onclick={() => activeTab = 'digilocker'}
          class="pb-2.5 text-xs font-bold flex items-center gap-2 transition-colors {activeTab === 'digilocker' ? 'text-[#062206] border-b-2 border-[#062206]' : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'}"
        >
          <Shield class="h-4 w-4" />
          {t('digilocker.title')}
          {#if isDigiLockerConnected}
            <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">Connected</span>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Document Grid -->
  <div class="flex-grow py-8 px-6 md:px-12 w-full">
    <div class="max-w-7xl mx-auto w-full">
      {#if activeTab === 'vault'}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each citizenDocs as doc}
            <!-- Document Card -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:border-primary-400/50 hover:shadow-md transition-all">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary-600">
                  <FileText class="h-6 w-6" />
                </div>
                {#if doc.verificationStatus === 'verified'}
                  <span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle class="h-3.5 w-3.5" /> Verified
                  </span>
                {:else}
                  <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle class="h-3.5 w-3.5" /> {doc.verificationStatus}
                  </span>
                {/if}
              </div>
              
              <h3 class="text-base font-bold text-slate-900 mb-1 line-clamp-1">
                {currentLocale === 'ta' ? doc.nameTA : doc.name}
              </h3>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 line-clamp-1">
                Issued by: {doc.issuedBy || 'Government of TN'}
              </p>
              
              <div class="bg-slate-50 p-3 rounded-xl mb-6">
                <p class="text-[11px] font-bold text-slate-900 font-mono text-center">
                  {#if doc.documentNumber}
                    ID: {doc.documentNumber}
                  {:else}
                    <span class="text-slate-400">ID Not Extracted</span>
                  {/if}
                </p>
              </div>
              
              <div class="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {(doc.fileSize / 1024).toFixed(0)} KB • {doc.source}
                </span>
                <button onclick={() => downloadDocument(doc.id)} class="text-primary-600 text-xs font-bold flex items-center gap-1 hover:underline">
                  <Download class="h-4 w-4" /> Download
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- DigiLocker Integration -->
        <div class="mx-auto max-w-4xl">
          <div class="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/30 p-8 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
                <Shield class="h-8 w-8" />
              </div>
  
              <div class="flex-1">
                <h2 class="text-2xl font-black text-slate-900">{t('digilocker.title')}</h2>
                <p class="mt-1 text-sm text-slate-500">{t('digilocker.subtitle')}</p>
  
                <div class="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1 text-xs text-purple-800 font-bold">
                  <AlertCircle class="h-3.5 w-3.5" />
                  {t('digilocker.mock')}
                </div>
              </div>
            </div>
  
            <div class="mt-8 border-t border-purple-100 pt-6">
              {#if !isDigiLockerConnected}
                <div class="text-center py-8">
                  <p class="text-sm text-slate-500 mb-6 font-medium">Link your MeitY DigiLocker account to instantly fetch verified identity and academic certificates without manual document upload.</p>
                  <button
                    onclick={connectDigiLocker}
                    disabled={isConnecting}
                    class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-purple-700 disabled:opacity-50"
                  >
                    {#if isConnecting}
                      <RefreshCw class="h-4 w-4 animate-spin" />
                      Connecting to DigiLocker...
                    {:else}
                      <Shield class="h-4 w-4" />
                      {t('digilocker.connect')}
                    {/if}
                  </button>
                </div>
              {:else}
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-base font-bold text-slate-900">Fetched DigiLocker Documents</h3>
                    <button onclick={() => isDigiLockerConnected = false} class="text-xs text-error hover:underline font-bold">
                      {t('digilocker.disconnect')}
                    </button>
                  </div>
  
                  <div class="space-y-3">
                    {#each mockDigiLockerDocuments as dldoc}
                      <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-300 transition-colors">
                        <div class="flex items-center gap-3">
                          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                            <CheckCircle class="h-5 w-5" />
                          </div>
                          <div>
                            <div class="text-sm font-bold text-slate-900">{currentLocale === 'ta' ? dldoc.nameTA : dldoc.name}</div>
                            <div class="text-xs font-medium text-slate-500">{dldoc.issuer} • Issued {dldoc.issuedDate}</div>
                          </div>
                        </div>
  
                        <button
                          onclick={() => alert(`Imported ${dldoc.name} into vault!`)}
                          class="rounded-xl border border-purple-600 px-4 py-2 text-xs font-bold text-purple-600 hover:bg-purple-600 hover:text-white transition"
                        >
                          Import to Vault
                        </button>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Consent Modal -->
{#if showConsentModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div class="flex items-center gap-3 mb-4">
        <Shield class="h-6 w-6 text-purple-600" />
        <h3 class="text-lg font-bold text-slate-900">{t('digilocker.consent.title')}</h3>
      </div>

      <p class="text-xs text-slate-500 leading-relaxed">
        By clicking Allow, you permit Sympho Center to securely access your Aadhaar, Driving Licence, and educational certificates from DigiLocker for instant service verification.
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button onclick={() => showConsentModal = false} class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50">
          {t('digilocker.consent.cancel')}
        </button>
        <button onclick={confirmDigiLockerConnect} class="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700">
          {t('digilocker.consent.allow')}
        </button>
      </div>
    </div>
  </div>
{/if}
