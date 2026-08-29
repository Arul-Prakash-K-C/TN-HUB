<script>

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { tt, locale } from '$lib/i18n';
  import { ArrowLeft, ArrowRight, Check, Upload, FileText, AlertCircle, Trash2 } from '@lucide/svelte';

let { data } = $props();
const t = $derived($tt);
const currentLocale = $derived($locale);
const service = $derived(data.catalogService);
const application = $derived(data.application);
let currentStep = $state(0);
let formData = $state({});
let declarationAgreed = $state(false);
let submitted = $state(false);
let applicationId = $state('');
let uploadedDocs = $state({});
let stepError = $state('');
let isSaving = $state(false);
let isSubmitting = $state(false);
let isDeletingDraft = $state(false);
const steps = $derived([
    t('apply.step.eligibility'),
    t('apply.step.personal'),
    t('apply.step.service'),
    t('apply.step.documents'),
    t('apply.step.review'),
    t('apply.step.declaration')
]);
onMount(() => {
    if (application.formData) {
        formData = { ...application.formData };
    }
    if (application.documents && Array.isArray(application.documents)) {
        for (const doc of application.documents) {
            uploadedDocs[doc.documentId] = {
                name: doc.name || doc.fileName,
                size: doc.fileSize || 0,
                url: doc.fileName
            };
        }
    }
});
function validateCurrentStep() {
    stepError = '';
    if (currentStep === 1) { // Personal Details
        if (!formData.fullName || String(formData.fullName).trim() === '') {
            stepError = t('apply.validation.requiredField', { field: t('apply.field.fullName') });
            return false;
        }
        if (!formData.phone || !/^\d{10}$/.test(String(formData.phone).trim())) {
            stepError = t('apply.validation.phoneInvalid');
            return false;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email).trim())) {
            stepError = t('apply.validation.emailInvalid');
            return false;
        }
        if (formData.aadhaarNumber && !/^\d{12}$/.test(String(formData.aadhaarNumber))) {
            stepError = t('apply.validation.aadhaarInvalid');
            return false;
        }
    }
    else if (currentStep === 2) { // Service Details
        if (service?.slug === 'e-adangal-extract') {
            if (!formData.surveyNumber || String(formData.surveyNumber).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('ui.surveyNumber') });
                return false;
            }
            if (!formData.taluk || String(formData.taluk).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('apply.field.taluk') });
                return false;
            }
            if (!formData.village || String(formData.village).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('apply.field.village') });
                return false;
            }
        }
        else if (service?.slug === 'income-certificate') {
            if (!formData.annualIncome || Number(formData.annualIncome) <= 0) {
                stepError = t('apply.validation.positiveField', { field: t('apply.field.annualIncome') });
                return false;
            }
            if (!formData.occupation || String(formData.occupation).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('apply.field.occupation') });
                return false;
            }
        }
        else if (service?.slug === 'community-certificate') {
            if (!formData.religion || String(formData.religion).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('apply.field.religion') });
                return false;
            }
            if (!formData.communityCategory || String(formData.communityCategory).trim() === '') {
                stepError = t('apply.validation.selectField', { field: t('ui.communityCategory') });
                return false;
            }
            if (!formData.subCaste || String(formData.subCaste).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('ui.subCasteName') });
                return false;
            }
        }
        else if (service?.slug === 'nativity-certificate') {
            if (!formData.placeOfBirth || String(formData.placeOfBirth).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('ui.placeOfBirth') });
                return false;
            }
            if (!formData.residenceDurationYears || Number(formData.residenceDurationYears) <= 0) {
                stepError = t('apply.validation.residenceDurationInvalid');
                return false;
            }
        }
        else {
            // Fallback for default address services
            if (!formData.district || String(formData.district).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('apply.field.district') });
                return false;
            }
            if (!formData.pincode || String(formData.pincode).trim() === '') {
                stepError = t('apply.validation.requiredField', { field: t('apply.field.pincode') });
                return false;
            }
        }
    }
    else if (currentStep === 3) { // Documents Upload
        if (service?.requiredDocuments && service.requiredDocuments.length > 0) {
            for (const doc of service.requiredDocuments) {
                if (doc.mandatory && !uploadedDocs[doc.id]) {
                    stepError = t('apply.validation.requiredDocument', { document: currentLocale === 'ta' ? doc.name.ta : doc.name.en });
                    return false;
                }
            }
        }
    }
    return true;
}
async function saveDraft() {
    isSaving = true;
    stepError = '';
    try {
        const response = await fetch(`/api/applications/${application.id}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ formData })
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.message ?? t('errors.saveDraftFailed'));
        }
    }
    catch (cause) {
        stepError = cause instanceof Error ? cause.message : t('errors.saveDraftProgress');
    }
    finally {
        isSaving = false;
    }
}
async function nextStep() {
    if (!validateCurrentStep())
        return;
    await saveDraft();
    if (!stepError && currentStep < steps.length - 1)
        currentStep++;
}
async function prevStep() {
    stepError = '';
    await saveDraft();
    if (!stepError && currentStep > 0)
        currentStep--;
}
function handleFileUpload(docId, event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        uploadedDocs[docId] = { name: file.name, size: file.size, file };
    }
}
async function submitApplication() {
    if (isSubmitting)
        return;
    isSubmitting = true;
    stepError = '';
    try {
        // 1. Save final form data to draft
        const saveResponse = await fetch(`/api/applications/${application.id}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ formData })
        });
        if (!saveResponse.ok) {
            const saveBody = await saveResponse.json().catch(() => null);
            throw new Error(saveBody?.message ?? t('errors.saveFinalDraft'));
        }
        // 2. Upload any new documents
        for (const [documentType, upload] of Object.entries(uploadedDocs)) {
            if (!upload.file)
                continue; // Skip already uploaded documents
            const documentData = new FormData();
            documentData.set('file', upload.file);
            documentData.set('documentType', documentType);
            const uploadResponse = await fetch(`/api/applications/${application.id}/documents`, {
                method: 'POST',
                body: documentData
            });
            if (!uploadResponse.ok) {
                const uploadBody = await uploadResponse.json().catch(() => null);
                throw new Error(uploadBody?.message ?? t('errors.uploadRequiredDocument'));
            }
        }
        // 3. Submit draft
        const submitResponse = await fetch(`/api/applications/${application.id}/submit`, {
            method: 'POST'
        });
        const submitBody = await submitResponse.json().catch(() => null);
        if (!submitResponse.ok || !submitBody?.application?.trackingId) {
            throw new Error(submitBody?.message ?? t('errors.submitApplication'));
        }
        applicationId = submitBody.application.trackingId;
        submitted = true;
    }
    catch (cause) {
        stepError = cause instanceof Error ? cause.message : t('errors.submitApplication');
    }
    finally {
        isSubmitting = false;
    }
}
async function deleteDraft() {
    if (isDeletingDraft)
        return;
    const confirmed = window.confirm(t('confirm.deleteAssistedDraft'));
    if (!confirmed)
        return;
    isDeletingDraft = true;
    stepError = '';
    try {
        const response = await fetch(`/api/applications/${application.id}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(body?.message ?? t('errors.deleteDraft'));
        }
        await goto('/applications');
    }
    catch (cause) {
        stepError = cause instanceof Error ? cause.message : t('errors.deleteDraft');
    }
    finally {
        isDeletingDraft = false;
    }
}
</script>

<svelte:head>
  <title>{t('operator.editDraft')} — TN Kuviyam</title>
</svelte:head>

<div class="operator-application-editor min-h-screen bg-background pb-16 text-text">
  {#if submitted}
    <!-- Success state (consistent Operator green/primary palette) -->
    <div class="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg animate-fade-in">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 border border-primary-100 text-primary-600">
          <Check class="h-8 w-8" />
        </div>
        <h1 class="text-xl font-black text-slate-900">{t('ui.routes.operator.operator.applications.id.edit.87581771')}</h1>
        <p class="mt-2 text-xs font-medium text-slate-500">{t('operator.submissionSuccessDesc')}</p>
        <div class="mt-6 rounded-2xl bg-primary-50/40 border border-primary-100 p-4">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('ui.routes.operator.operator.applications.id.edit.79930671')}</div>
          <div class="mt-1.5 text-lg font-black text-primary-800 font-mono">{applicationId}</div>
        </div>
        <div class="mt-6 flex flex-col gap-3">
          <a href="/applications" class="rounded-xl bg-primary-600 py-3 text-xs font-bold text-white transition hover:bg-primary-700 shadow-sm">
            {t('operator.viewAllServices')}
          </a>
          <a href="/operator/dashboard" class="rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
            {t('ui.go.to.operator.dashboard')}
          </a>
        </div>
      </div>
    </div>
  {:else}
    <!-- Header -->
    <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-[#143A14] py-8 px-6 sm:px-8">
      <div class="mx-auto max-w-5xl">
        <a href="/applications" class="inline-flex items-center gap-1.5 text-xs font-bold text-primary-300 hover:text-white transition mb-3">
          <ArrowLeft class="h-4.5 w-4.5" /> {t('operator.viewAllServices')}
        </a>
        <h1 class="text-2xl font-black tracking-tight leading-tight">
          {t('operator.serviceApplicationForm')}
        </h1>
        <p class="text-xs font-medium text-primary-200/80 mt-1 max-w-xl">
          {t('ui.service')} <span class="font-extrabold text-white">{currentLocale === 'ta' ? service.name.ta : service.name.en}</span>
        </p>
        <p class="text-[10px] font-bold text-slate-400 mt-1 font-mono uppercase tracking-wider">
          Draft ID: {application.applicationNumber} • Citizen: {application.citizenName}
        </p>
      </div>
    </div>

    <!-- Stepper (Consistent Operator Green, no hyphens, responsive) -->
    <div class="bg-white border-b border-slate-200 py-4 px-6 sm:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="flex items-center justify-start gap-3 overflow-x-auto pb-1" style="scrollbar-width: none; -ms-overflow-style: none;">
          {#each steps as step, i}
            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[11px] font-bold
                {i === currentStep 
                  ? 'bg-primary-50 border-primary-200 text-primary-800 shadow-xs' 
                  : i < currentStep 
                    ? 'bg-primary-50/40 border-primary-100/50 text-slate-700' 
                    : 'bg-slate-50 border-slate-100 text-slate-400'}">
                <div class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shrink-0
                  {i === currentStep 
                    ? 'bg-primary-600 text-white' 
                    : i < currentStep 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-slate-200 text-slate-500'}">
                  {#if i < currentStep}
                    ✓
                  {:else}
                    {i + 1}
                  {/if}
                </div>
                <span>{step}</span>
              </div>
              {#if i < steps.length - 1}
                <svg class="h-3.5 w-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Form contents -->
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        
        <!-- Step 0: Eligibility -->
        {#if currentStep === 0}
          <h2 class="text-base font-bold text-slate-900 mb-4">{t('ui.routes.operator.operator.applications.id.edit.90b8d851')}</h2>
          <ul class="space-y-3 mb-6">
            {#each (currentLocale === 'ta' ? service.eligibility.statements : service.eligibility.statements) as item}
              <li class="flex items-start gap-2.5 text-xs text-slate-600">
                <Check class="h-4.5 w-4.5 text-primary-600 mt-0.5 shrink-0" />
                <span>{currentLocale === 'ta' ? item.ta : item.en}</span>
              </li>
            {/each}
          </ul>
          <div class="rounded-2xl bg-primary-50/50 border border-primary-100 p-4 text-xs font-bold text-primary-800">
            <AlertCircle class="inline h-4 w-4 mr-1 text-primary-600" />
            {t('ui.please.verify.all.eligibility.conditions.with.the.citizen.before.filling.the.for')}
          </div>

        <!-- Step 1: Personal Details -->
        {:else if currentStep === 1}
          <h2 class="text-base font-bold text-slate-900 mb-6">{t('ui.routes.operator.operator.applications.id.edit.149975c8')}</h2>
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="fullName" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.fd765bb5')}</label>
              <input id="fullName" type="text" bind:value={formData.fullName} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="fatherName" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.703d8de7')}</label>
              <input id="fatherName" type="text" bind:value={formData.fatherName} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="dateOfBirth" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.c635ffa2')}</label>
              <input id="dateOfBirth" type="date" bind:value={formData.dateOfBirth} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="gender" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.87da065c')}</label>
              <select id="gender" bind:value={formData.gender} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                <option value="">{t('ui.routes.operator.operator.applications.id.edit.51740abb')}</option>
                <option value="male">{t('ui.routes.operator.operator.applications.id.edit.4107b286')}</option>
                <option value="female">{t('ui.routes.operator.operator.applications.id.edit.df52364e')}</option>
                <option value="other">{t('ui.routes.operator.operator.applications.id.edit.0095482b')}</option>
              </select>
            </div>
            <div>
              <label for="phone" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.9b1d6c9a')}</label>
              <input id="phone" type="tel" inputmode="numeric" maxlength="10" bind:value={formData.phone} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="email" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.2670b83b')}</label>
              <input id="email" type="email" bind:value={formData.email} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="aadhaarNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.7f45842e')}</label>
              <input id="aadhaarNumber" type="text" pattern="[0-9]{12}" bind:value={formData.aadhaarNumber} maxlength="12" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" placeholder="12-digit number" />
            </div>
          </div>

        <!-- Step 2: Service Details -->
        {:else if currentStep === 2}
          <h2 class="text-base font-bold text-slate-900 mb-6">{t('ui.routes.operator.operator.applications.id.edit.c14a1d36')}</h2>
          
          {#if service.slug === 'e-adangal-extract'}
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="adangalDistrict" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.c7dafecd')}</label>
                <select id="adangalDistrict" bind:value={formData.district} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                  <option value="">{t('ui.routes.operator.operator.applications.id.edit.749fc59f')}</option>
                  <option value="chennai">{t('ui.routes.operator.operator.applications.id.edit.2935135c')}</option>
                  <option value="coimbatore">{t('ui.routes.operator.operator.applications.id.edit.752d9d86')}</option>
                  <option value="madurai">{t('ui.routes.operator.operator.applications.id.edit.800f6c5c')}</option>
                  <option value="thanjavur">{t('ui.routes.operator.operator.applications.id.edit.8bc1120d')}</option>
                  <option value="tiruchirappalli">{t('ui.routes.operator.operator.applications.id.edit.d13adf93')}</option>
                </select>
              </div>
              <div>
                <label for="adangalTaluk" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.f25d0a86')}</label>
                <input id="adangalTaluk" type="text" bind:value={formData.taluk} required placeholder={t('ui.e.g.mambalam')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
              </div>
              <div>
                <label for="adangalVillage" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.2f0f49bb')}</label>
                <input id="adangalVillage" type="text" bind:value={formData.village} required placeholder={t('ui.e.g.kodambakkam')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
              </div>
              <div>
                <label for="adangalSurveyNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.6a1d2695')}</label>
                <input id="adangalSurveyNumber" type="text" bind:value={formData.surveyNumber} required placeholder={t('ui.e.g.142.3a')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
              </div>
            </div>
          {:else}
            <div class="grid gap-5 sm:grid-cols-2">
              {#if service.slug === 'income-certificate'}
                <div>
                  <label for="annualIncome" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.53c7f1fe')}</label>
                  <input id="annualIncome" type="number" bind:value={formData.annualIncome} required placeholder={t('ui.e.g.120000')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="occupation" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.73e1739e')}</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} required placeholder={t('ui.e.g.farmer.business')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
              {:else if service.slug === 'community-certificate'}
                <div>
                  <label for="religion" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.d1635ec4')}</label>
                  <select id="religion" bind:value={formData.religion} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                    <option value="">{t('ui.routes.operator.operator.applications.id.edit.41ad33a2')}</option>
                    <option value="Hinduism">{t('ui.routes.operator.operator.applications.id.edit.afc03ec5')}</option>
                    <option value="Islam">{t('ui.routes.operator.operator.applications.id.edit.94073237')}</option>
                    <option value="Christianity">{t('ui.routes.operator.operator.applications.id.edit.13ff6ab2')}</option>
                    <option value="Sikhism">{t('ui.routes.operator.operator.applications.id.edit.b5dcfdc7')}</option>
                    <option value="Buddhism">{t('ui.routes.operator.operator.applications.id.edit.01dc8c4a')}</option>
                    <option value="Jainism">{t('ui.routes.operator.operator.applications.id.edit.d34c2e84')}</option>
                    <option value="Other">{t('ui.routes.operator.operator.applications.id.edit.0095482b')}</option>
                  </select>
                </div>
                <div>
                  <label for="communityCategory" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.8fa743d2')}</label>
                  <select id="communityCategory" bind:value={formData.communityCategory} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                    <option value="">{t('ui.routes.operator.operator.applications.id.edit.5c8382bb')}</option>
                    <option value="BC">{t('ui.routes.operator.operator.applications.id.edit.e3053d55')}</option>
                    <option value="MBC">{t('ui.routes.operator.operator.applications.id.edit.7068ebf9')}</option>
                    <option value="SC">{t('ui.routes.operator.operator.applications.id.edit.cbce448f')}</option>
                    <option value="ST">{t('ui.routes.operator.operator.applications.id.edit.3fbcdae1')}</option>
                    <option value="DNC">{t('ui.routes.operator.operator.applications.id.edit.0111f874')}</option>
                    <option value="General">{t('ui.routes.operator.operator.applications.id.edit.a9ade785')}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="subCaste" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.3a149b9a')}</label>
                  <select id="subCaste" bind:value={formData.subCaste} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                    <option value="">{t('ui.routes.operator.operator.applications.id.edit.02b89c89')}</option>
                    <option value="Adidravidar">{t('ui.routes.operator.operator.applications.id.edit.2273b5c9')}</option>
                    <option value="Kongu Vellalar">{t('ui.routes.operator.operator.applications.id.edit.34c0b186')}</option>
                    <option value="Kallar">{t('ui.routes.operator.operator.applications.id.edit.f462d7ed')}</option>
                    <option value="Maravar">{t('ui.routes.operator.operator.applications.id.edit.77a488e0')}</option>
                    <option value="Vanniyar">{t('ui.routes.operator.operator.applications.id.edit.6c7c9aea')}</option>
                    <option value="Nadar">{t('ui.routes.operator.operator.applications.id.edit.0c5e2a41')}</option>
                    <option value="Other">{t('ui.routes.operator.operator.applications.id.edit.0095482b')}</option>
                  </select>
                </div>
              {:else if service.slug === 'nativity-certificate'}
                <div>
                  <label for="placeOfBirth" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.9b351883')}</label>
                  <input id="placeOfBirth" type="text" bind:value={formData.placeOfBirth} required placeholder={t('ui.e.g.madurai')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="residenceDurationYears" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.e80113c8')}</label>
                  <input id="residenceDurationYears" type="number" bind:value={formData.residenceDurationYears} required placeholder={t('ui.e.g.15')} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
              {:else}
                <div>
                  <label for="doorNo" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.518c4d63')}</label>
                  <input id="doorNo" type="text" bind:value={formData.doorNo} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="street" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.d8eb4bba')}</label>
                  <input id="street" type="text" bind:value={formData.street} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="area" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.92d2548f')}</label>
                  <input id="area" type="text" bind:value={formData.area} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="district" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.c7dafecd')}</label>
                  <input id="district" type="text" bind:value={formData.district} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="taluk" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.3eaffbaa')}</label>
                  <input id="taluk" type="text" bind:value={formData.taluk} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="pincode" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.10cc8788')}</label>
                  <input id="pincode" type="text" bind:value={formData.pincode} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="occupation" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('ui.routes.operator.operator.applications.id.edit.7344eada')}</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
              {/if}
            </div>
          {/if}

        <!-- Step 3: Documents -->
        {:else if currentStep === 3}
          <h2 class="text-base font-bold text-slate-900 mb-2">{t('ui.routes.operator.operator.applications.id.edit.38e08b84')}</h2>
          <p class="text-xs text-slate-500 mb-6">{t('operator.documents.uploadHelp')}</p>
          <div class="space-y-4">
            {#each service.requiredDocuments as doc}
              <div class="rounded-2xl border border-slate-200 p-5 bg-slate-50/20">
                <div class="flex items-center justify-between mb-3.5">
                  <div class="flex items-center gap-2">
                    <FileText class="h-4.5 w-4.5 text-primary-600" />
                    <span class="text-xs font-bold text-slate-950">{currentLocale === 'ta' ? doc.name.ta : doc.name.en}</span>
                  </div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wider {doc.mandatory ? 'text-rose-600 bg-rose-50 border border-rose-100' : 'text-slate-500 bg-slate-100 border border-slate-200'} px-2 py-0.5 rounded-md">
                    {doc.mandatory ? 'Required' : 'Optional'}
                  </span>
                </div>
                
                {#if uploadedDocs[doc.id]}
                  <div class="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-150 p-3 text-xs text-primary-800">
                    <div class="flex items-center gap-2">
                      <Check class="h-4 w-4 text-primary-600" />
                      <span class="font-semibold truncate">{uploadedDocs[doc.id].name}</span>
                    </div>
                    <button
                      type="button"
                      onclick={() => { delete uploadedDocs[doc.id]; uploadedDocs = { ...uploadedDocs }; }}
                      class="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition shrink-0"
                    >
                      {t('ui.remove')}
                    </button>
                  </div>
                {:else}
                  <div>
                    <label class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-xs font-bold text-slate-500 cursor-pointer hover:border-primary-500 hover:text-primary-700 bg-white transition">
                      <Upload class="h-4 w-4" />
                      {t('ui.upload.file')}
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" onchange={(e) => handleFileUpload(doc.id, e)} />
                    </label>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

        <!-- Step 4: Review -->
        {:else if currentStep === 4}
          <h2 class="text-base font-bold text-slate-900 mb-6">{t('ui.routes.operator.operator.applications.id.edit.67875255')}</h2>
          <div class="space-y-4">
            <div class="rounded-2xl bg-slate-50/50 border border-slate-200 p-5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {service.slug === 'e-adangal-extract' ? 'Land Cultivation Details' : 'Personal Details'}
              </h3>
              {#if service.slug === 'e-adangal-extract'}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.00efdc0e')}</dt><dd class="text-slate-900 font-bold">{formData.fullName || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.e6eec367')}</dt><dd class="text-slate-900 font-bold capitalize">{formData.district || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.3eaffbaa')}</dt><dd class="text-slate-900 font-bold">{formData.taluk || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.b404ab13')}</dt><dd class="text-slate-900 font-bold">{formData.village || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.1b462c70')}</dt><dd class="text-slate-900 font-bold">{formData.surveyNumber || '—'}</dd>
                </dl>
              {:else}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.e0a87fe0')}</dt><dd class="text-slate-900 font-bold">{formData.fullName || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.a83ce049')}</dt><dd class="text-slate-900 font-bold">{formData.fatherName || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.60dfca8a')}</dt><dd class="text-slate-900 font-bold">{formData.dateOfBirth || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.51ebde2e')}</dt><dd class="text-slate-900 font-bold capitalize">{formData.gender || '—'}</dd>
                  <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.b6f5442a')}</dt><dd class="text-slate-900 font-bold">{formData.phone || '—'}</dd>
                  
                  {#if service.slug === 'income-certificate'}
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.7e0ef584')}</dt><dd class="text-slate-900 font-bold">₹{formData.annualIncome || '—'}</dd>
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.7344eada')}</dt><dd class="text-slate-900 font-bold">{formData.occupation || '—'}</dd>
                  {/if}

                  {#if service.slug === 'community-certificate'}
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.896abb59')}</dt><dd class="text-slate-900 font-bold">{formData.religion || '—'}</dd>
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.f8a31e7c')}</dt><dd class="text-slate-900 font-bold">{formData.communityCategory || '—'}</dd>
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.f32450ea')}</dt><dd class="text-slate-900 font-bold">{formData.subCaste || '—'}</dd>
                  {/if}

                  {#if service.slug === 'nativity-certificate'}
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.1a10e399')}</dt><dd class="text-slate-900 font-bold">{formData.placeOfBirth || '—'}</dd>
                    <dt class="text-slate-500">{t('ui.routes.operator.operator.applications.id.edit.1d46a71c')}</dt><dd class="text-slate-900 font-bold">{formData.residenceDurationYears || '—'} Years</dd>
                  {/if}
                </dl>
              {/if}
            </div>
            <div class="rounded-2xl bg-slate-50/50 border border-slate-200 p-5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ui.routes.operator.operator.applications.id.edit.644a04a3')}</h3>
              {#each service.requiredDocuments as doc}
                <div class="flex items-center justify-between py-1.5 text-xs">
                  <span class="text-slate-500">{currentLocale === 'ta' ? doc.name.ta : doc.name.en}</span>
                  <span class="font-bold {uploadedDocs[doc.id] ? 'text-primary-600' : 'text-rose-600'}">
                    {uploadedDocs[doc.id] ? '✓ Uploaded' : '✗ Missing'}
                  </span>
                </div>
              {/each}
            </div>
          </div>

        <!-- Step 5: Declaration -->
        {:else if currentStep === 5}
          <h2 class="text-base font-bold text-slate-900 mb-6">{t('ui.routes.operator.operator.applications.id.edit.b8e2f210')}</h2>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 leading-relaxed mb-6 font-medium">
            {t('ui.i.hereby.declare.that.all.the.information.furnished.by.me.in.this.application.on')}
          </div>
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={declarationAgreed} class="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <span class="text-xs font-bold text-slate-800">{t('ui.routes.operator.operator.applications.id.edit.db453345')}</span>
          </label>
        {/if}
      </div>

      {#if stepError}
        <div class="mt-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center gap-2.5 shadow-xs">
          <AlertCircle class="h-4.5 w-4.5 text-rose-600 shrink-0" />
          <span>{stepError}</span>
        </div>
      {/if}

      <!-- Navigation buttons -->
      <div class="mt-6 flex items-center justify-between">
        <button
          onclick={prevStep}
          disabled={currentStep === 0 || isSaving || isSubmitting}
          class="inline-flex items-center gap-2 rounded-xl border border-slate-250 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft class="h-4 w-4" />
          {t('ui.previous.step')}
        </button>

        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick={deleteDraft}
            disabled={isDeletingDraft || isSaving || isSubmitting}
            class="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 class="h-4 w-4" />
            {isDeletingDraft ? 'Deleting...' : 'Delete Draft'}
          </button>
          {#if currentStep < steps.length - 1}
            <button
              onclick={nextStep}
              disabled={isSaving || isSubmitting}
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-primary-700 shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Next Step'}
              <ArrowRight class="h-4 w-4" />
            </button>
          {:else}
            <button
              onclick={submitApplication}
              disabled={!declarationAgreed || isSubmitting}
              class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Check class="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
