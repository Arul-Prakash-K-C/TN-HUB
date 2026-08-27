<script>
  let { data } = $props();

  import { tt, locale } from '$lib/i18n';
  import { mockDigiLockerDocuments } from '$lib/data/documents';
  import { FileText, Shield, Upload, Download, CheckCircle, RefreshCw, Lock, AlertCircle } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  let activeTab = $state('vault');
  let isDigiLockerConnected = $state(false);
  let isConnecting = $state(false);
  let showConsentModal = $state(false);
  let vaultDocuments = $state([]);
  let uploadInput;

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

  async function uploadVaultDocument(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set('file', file);
    formData.set('documentType', file.name.replace(/\.[^.]+$/, ''));

    try {
      const response = await fetch('/api/documents', { method: 'POST', body: formData, credentials: 'same-origin' });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.document) throw new Error(body?.message ?? 'Unable to upload this document.');
      vaultDocuments = [body.document, ...vaultDocuments];
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Unable to upload this document.');
    } finally {
      input.value = '';
    }
  }

  async function downloadDocument(documentId) {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, { credentials: 'same-origin' });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.url) throw new Error(body?.message ?? 'Unable to access this document.');
      window.open(body.url, '_blank', 'noopener,noreferrer');
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : 'Unable to access this document.');
    }
  }
</script>

<svelte:head>
  <title>{t('documents.title')} — TN Hub</title>
</svelte:head>

<div class="bg-background min-h-screen pb-12 flex flex-col w-full">
  <!-- Document Vault Header (Green Banner matching Public Pages) -->
  <div class="public-banner px-6 py-8 sm:px-8 shadow-md">
    <div class="max-w-7xl mx-auto w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-white">{t('documents.title')}</h1>
          <p class="text-xs font-medium text-green-100 mt-1 max-w-2xl">{t('documents.subtitle')}</p>
        </div>
        <button
          onclick={() => uploadInput?.click()}
          class="bg-white text-primary hover:bg-green-50 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto shadow-md"
        >
          <Upload class="h-4 w-4" />
          {t('documents.upload')}
        </button>
        <input bind:this={uploadInput} type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" onchange={uploadVaultDocument} />
      </div>

      <!-- Tabs -->
      <div class="flex gap-6 mt-6 border-b border-white/10">
        <button
          onclick={() => activeTab = 'vault'}
          class="pb-2.5 text-xs font-bold flex items-center gap-2 transition-colors {activeTab === 'vault' ? 'text-white border-b-2 border-white' : 'text-green-200 hover:text-white border-b-2 border-transparent'}"
        >
          <FileText class="h-4 w-4" />
          My Document Vault ({citizenDocs.length})
        </button>
        <button
          onclick={() => activeTab = 'digilocker'}
          class="pb-2.5 text-xs font-bold flex items-center gap-2 transition-colors {activeTab === 'digilocker' ? 'text-white border-b-2 border-white' : 'text-green-200 hover:text-white border-b-2 border-transparent'}"
        >
          <Shield class="h-4 w-4" />
          {t('digilocker.title')}
          {#if isDigiLockerConnected}
            <span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white border border-white/20">Connected</span>
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
            <div class="bg-surface border border-border rounded-2xl p-6 flex flex-col hover:border-primary/50 hover:shadow-md transition-all">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-primary-soft text-primary-soft-text rounded-xl flex items-center justify-center">
                  <FileText class="h-6 w-6" />
                </div>
                {#if doc.verificationStatus === 'verified'}
                  <span class="bg-primary-soft text-primary-soft-text px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle class="h-3.5 w-3.5" /> Verified
                  </span>
                {:else}
                  <span class="bg-surface-container-highest text-text-muted px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle class="h-3.5 w-3.5" /> {doc.verificationStatus}
                  </span>
                {/if}
              </div>
              
              <h3 class="text-base font-bold text-text mb-1 line-clamp-1">
                {currentLocale === 'ta' ? doc.nameTA : doc.name}
              </h3>
              <p class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4 line-clamp-1">
                Issued by: {doc.issuedBy || 'Government of TN'}
              </p>
              
              <div class="bg-surface-container-low border border-border p-3 rounded-xl mb-6">
                <p class="text-[11px] font-bold text-text font-mono text-center">
                  {#if doc.documentNumber}
                    ID: {doc.documentNumber}
                  {:else}
                    <span class="text-text-faint">ID Not Extracted</span>
                  {/if}
                </p>
              </div>
              
              <div class="mt-auto flex justify-between items-center pt-4 border-t border-border">
                <span class="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  {(doc.fileSize / 1024).toFixed(0)} KB • {doc.source}
                </span>
                <button onclick={() => downloadDocument(doc.id)} class="text-primary hover:text-primary-hover text-xs font-bold flex items-center gap-1 hover:underline">
                  <Download class="h-4 w-4" /> Download
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- DigiLocker Integration -->
        <div class="mx-auto max-w-4xl">
          <div class="rounded-3xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 via-white dark:via-surface to-purple-50/30 dark:to-purple-900/10 p-8 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
                <Shield class="h-8 w-8" />
              </div>
  
              <div class="flex-1">
                <h2 class="text-2xl font-black text-text">{t('digilocker.title')}</h2>
                <p class="mt-1 text-sm text-text-muted">{t('digilocker.subtitle')}</p>
  
                <div class="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-100 dark:bg-purple-950/40 px-3 py-1 text-xs text-purple-800 dark:text-purple-300 font-bold">
                  <AlertCircle class="h-3.5 w-3.5" />
                  {t('digilocker.mock')}
                </div>
              </div>
            </div>
  
            <div class="mt-8 border-t border-purple-100 dark:border-purple-900/50 pt-6">
              {#if !isDigiLockerConnected}
                <div class="text-center py-8">
                  <p class="text-sm text-text-muted mb-6 font-medium">Link your MeitY DigiLocker account to instantly fetch verified identity and academic certificates without manual document upload.</p>
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
                    <h3 class="text-base font-bold text-text">Fetched DigiLocker Documents</h3>
                    <button onclick={() => isDigiLockerConnected = false} class="text-xs text-error hover:underline font-bold">
                      {t('digilocker.disconnect')}
                    </button>
                  </div>
  
                  <div class="space-y-3">
                    {#each mockDigiLockerDocuments as dldoc}
                      <div class="flex items-center justify-between rounded-xl border border-border bg-surface dark:bg-surface-container p-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-colors">
                        <div class="flex items-center gap-3">
                          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                            <CheckCircle class="h-5 w-5" />
                          </div>
                          <div>
                            <div class="text-sm font-bold text-text">{currentLocale === 'ta' ? dldoc.nameTA : dldoc.name}</div>
                            <div class="text-xs font-medium text-text-muted">{dldoc.issuer} • Issued {dldoc.issuedDate}</div>
                          </div>
                        </div>
  
                        <button
                          onclick={() => alert(`Imported ${dldoc.name} into vault`)}
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
    <div class="w-full max-w-md rounded-2xl bg-surface dark:bg-surface-container-highest p-6 shadow-2xl">
      <div class="flex items-center gap-3 mb-4">
        <Shield class="h-6 w-6 text-purple-600 dark:text-purple-400" />
        <h3 class="text-lg font-bold text-text">{t('digilocker.consent.title')}</h3>
      </div>

      <p class="text-xs text-text-muted leading-relaxed">
        By clicking Allow, you permit TN Hub to securely access your Aadhaar and educational certificates from DigiLocker for instant service verification.
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button onclick={() => showConsentModal = false} class="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-surface-container-high dark:hover:bg-surface-container-highest">
          {t('digilocker.consent.cancel')}
        </button>
        <button onclick={confirmDigiLockerConnect} class="rounded-xl bg-purple-600 dark:bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 dark:hover:bg-purple-600">
          {t('digilocker.consent.allow')}
        </button>
      </div>
    </div>
  </div>
{/if}
