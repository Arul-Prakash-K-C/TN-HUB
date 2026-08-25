<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { tt, locale } from '$lib/i18n';
  import { ArrowLeft, ArrowRight, Save, Check, Upload, FileText, AlertCircle } from '@lucide/svelte';
  import type { ApplicationFormData } from '$lib/types';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const service = $derived(data.catalogService);
  const application = $derived(data.application);

  let currentStep = $state(0);
  let formData = $state<ApplicationFormData>({});
  let declarationAgreed = $state(false);
  let submitted = $state(false);
  let applicationId = $state('');
  let uploadedDocs = $state<Record<string, { name: string; size: number; url?: string; file?: File }>>({});
  let stepError = $state('');
  let isSaving = $state(false);
  let isSubmitting = $state(false);

  let phoneVerified = $state(false);
  let emailVerified = $state(false);
  let phoneOtpSent = $state(false);
  let emailOtpSent = $state(false);
  let phoneOtp = $state('');
  let emailOtp = $state('');
  let phoneOtpError = $state('');
  let emailOtpError = $state('');

  function sendPhoneOtp() {
    if (!formData.phone || !/^\d{10}$/.test(String(formData.phone))) {
      stepError = 'Please enter a valid 10-digit phone number.';
      return;
    }
    stepError = '';
    phoneOtpSent = true;
    phoneOtp = '';
    phoneOtpError = '';
  }

  function verifyPhoneOtp() {
    if (phoneOtp === '123456') {
      phoneVerified = true;
      phoneOtpError = '';
    } else {
      phoneOtpError = 'Invalid OTP. Enter 123456 to verify.';
    }
  }

  function sendEmailOtp() {
    if (!formData.email || !String(formData.email).includes('@')) {
      stepError = 'Please enter a valid email address.';
      return;
    }
    stepError = '';
    emailOtpSent = true;
    emailOtp = '';
    emailOtpError = '';
  }

  function verifyEmailOtp() {
    if (emailOtp === '123456') {
      emailVerified = true;
      emailOtpError = '';
    } else {
      emailOtpError = 'Invalid OTP. Enter 123456 to verify.';
    }
  }

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

  function validateCurrentStep(): boolean {
    stepError = '';

    if (currentStep === 1) { // Personal Details
      if (!formData.fullName || String(formData.fullName).trim() === '') {
        stepError = 'Please enter the Full Name.';
        return false;
      }
      if (!formData.phone || String(formData.phone).trim() === '') {
        stepError = 'Please enter the Phone Number.';
        return false;
      }
      if (!phoneVerified) {
        stepError = 'Please verify the phone number via OTP first.';
        return false;
      }
      if (formData.email && String(formData.email).trim() !== '' && !emailVerified) {
        stepError = 'Please verify the email address via OTP first.';
        return false;
      }
      if (formData.aadhaarNumber && !/^\d{12}$/.test(String(formData.aadhaarNumber))) {
        stepError = 'Aadhaar Number must be exactly 12 digits.';
        return false;
      }
    } else if (currentStep === 2) { // Service Details
      if (service?.slug === 'e-adangal-extract') {
        if (!formData.surveyNumber || String(formData.surveyNumber).trim() === '') {
          stepError = 'Please enter the Survey Number.';
          return false;
        }
        if (!formData.taluk || String(formData.taluk).trim() === '') {
          stepError = 'Please enter the Taluk.';
          return false;
        }
        if (!formData.village || String(formData.village).trim() === '') {
          stepError = 'Please enter the Village.';
          return false;
        }
      } else if (service?.slug === 'income-certificate') {
        if (!formData.annualIncome || Number(formData.annualIncome) <= 0) {
          stepError = 'Please enter a valid Annual Income (greater than 0).';
          return false;
        }
        if (!formData.occupation || String(formData.occupation).trim() === '') {
          stepError = 'Please enter the Occupation.';
          return false;
        }
      } else if (service?.slug === 'community-certificate') {
        if (!formData.religion || String(formData.religion).trim() === '') {
          stepError = 'Please enter the Religion.';
          return false;
        }
        if (!formData.communityCategory || String(formData.communityCategory).trim() === '') {
          stepError = 'Please select the Community Category.';
          return false;
        }
        if (!formData.subCaste || String(formData.subCaste).trim() === '') {
          stepError = 'Please enter the Sub-Caste Name.';
          return false;
        }
      } else if (service?.slug === 'nativity-certificate') {
        if (!formData.placeOfBirth || String(formData.placeOfBirth).trim() === '') {
          stepError = 'Please enter the Place of Birth.';
          return false;
        }
        if (!formData.residenceDurationYears || Number(formData.residenceDurationYears) <= 0) {
          stepError = 'Please enter a valid duration of residence in years.';
          return false;
        }
      } else {
        // Fallback for default address services
        if (!formData.district || String(formData.district).trim() === '') {
          stepError = 'Please enter the District.';
          return false;
        }
        if (!formData.pincode || String(formData.pincode).trim() === '') {
          stepError = 'Please enter the Pincode.';
          return false;
        }
      }
    } else if (currentStep === 3) { // Documents Upload
      if (service?.requiredDocuments && service.requiredDocuments.length > 0) {
        for (const doc of service.requiredDocuments) {
          if (doc.mandatory && !uploadedDocs[doc.id]) {
            stepError = `Please upload required document: ${currentLocale === 'ta' ? doc.name.ta : doc.name.en}`;
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
        throw new Error(body?.message ?? 'Failed to save application draft progress.');
      }
    } catch (cause) {
      stepError = cause instanceof Error ? cause.message : 'Unable to save draft progress.';
    } finally {
      isSaving = false;
    }
  }

  async function nextStep() {
    if (!validateCurrentStep()) return;
    await saveDraft();
    if (!stepError && currentStep < steps.length - 1) currentStep++;
  }

  async function prevStep() {
    stepError = '';
    await saveDraft();
    if (!stepError && currentStep > 0) currentStep--;
  }

  function handleFileUpload(docId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      uploadedDocs[docId] = { name: file.name, size: file.size, file };
    }
  }

  async function submitApplication() {
    if (isSubmitting) return;

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
        throw new Error(saveBody?.message ?? 'Unable to save the final draft details.');
      }

      // 2. Upload any new documents
      for (const [documentType, upload] of Object.entries(uploadedDocs)) {
        if (!upload.file) continue; // Skip already uploaded documents
        const documentData = new FormData();
        documentData.set('file', upload.file);
        documentData.set('documentType', documentType);
        const uploadResponse = await fetch(`/api/applications/${application.id}/documents`, {
          method: 'POST',
          body: documentData
        });
        if (!uploadResponse.ok) {
          const uploadBody = await uploadResponse.json().catch(() => null);
          throw new Error(uploadBody?.message ?? 'Unable to upload a required document.');
        }
      }

      // 3. Submit draft
      const submitResponse = await fetch(`/api/applications/${application.id}/submit`, {
        method: 'POST'
      });
      const submitBody = await submitResponse.json().catch(() => null);
      if (!submitResponse.ok || !submitBody?.application?.trackingId) {
        throw new Error(submitBody?.message ?? 'Unable to submit the application.');
      }

      applicationId = submitBody.application.trackingId;
      submitted = true;
    } catch (cause) {
      stepError = cause instanceof Error ? cause.message : 'Unable to submit the application.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Assisted Application — TN Hub</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-16">
  {#if submitted}
    <!-- Success state (consistent Operator green/primary palette) -->
    <div class="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg animate-fade-in">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 border border-primary-100 text-primary-600">
          <Check class="h-8 w-8" />
        </div>
        <h1 class="text-xl font-black text-slate-900">Application Submitted</h1>
        <p class="mt-2 text-xs font-medium text-slate-500">The assisted application has been submitted successfully to the respective department.</p>
        <div class="mt-6 rounded-2xl bg-primary-50/40 border border-primary-100 p-4">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracking Reference ID</div>
          <div class="mt-1.5 text-lg font-black text-primary-800 font-mono">{applicationId}</div>
        </div>
        <div class="mt-6 flex flex-col gap-3">
          <a href="/operator/applications" class="rounded-xl bg-primary-600 py-3 text-xs font-bold text-white transition hover:bg-primary-700 shadow-sm">
            View Assisted Applications
          </a>
          <a href="/operator/dashboard" class="rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
            Go to Operator Dashboard
          </a>
        </div>
      </div>
    </div>
  {:else}
    <!-- Header -->
    <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-[#143A14] py-8 px-6 sm:px-8">
      <div class="mx-auto max-w-5xl">
        <a href="/operator/applications" class="inline-flex items-center gap-1.5 text-xs font-bold text-primary-300 hover:text-white transition mb-3">
          <ArrowLeft class="h-4.5 w-4.5" /> Back to List
        </a>
        <h1 class="text-2xl font-black tracking-tight leading-tight">
          Assisted Application Form
        </h1>
        <p class="text-xs font-medium text-primary-200/80 mt-1 max-w-xl">
          Service: <span class="font-extrabold text-white">{currentLocale === 'ta' ? service.name.ta : service.name.en}</span>
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
          <h2 class="text-base font-bold text-slate-900 mb-4">Eligibility Requirements</h2>
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
            Please verify all eligibility conditions with the citizen before filling the form.
          </div>

        <!-- Step 1: Personal Details -->
        {:else if currentStep === 1}
          <h2 class="text-base font-bold text-slate-900 mb-6">Citizen's Personal Profile</h2>
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="fullName" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input id="fullName" type="text" bind:value={formData.fullName} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="fatherName" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Father's / Husband's Name *</label>
              <input id="fatherName" type="text" bind:value={formData.fatherName} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="dateOfBirth" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth *</label>
              <input id="dateOfBirth" type="date" bind:value={formData.dateOfBirth} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label for="gender" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
              <select id="gender" bind:value={formData.gender} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label for="phone" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number * (For updates)</label>
              <div class="flex gap-2">
                <input id="phone" type="tel" bind:value={formData.phone} disabled={phoneVerified || phoneOtpSent} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
                {#if !phoneVerified && !phoneOtpSent}
                  <button type="button" onclick={sendPhoneOtp} class="px-4 py-2 bg-[#062206] text-white text-xs font-bold rounded-lg hover:bg-[#143A14] transition whitespace-nowrap">Send OTP</button>
                {/if}
                {#if phoneVerified}
                  <span class="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs"><Check class="h-4 w-4 shrink-0" /> Verified</span>
                {/if}
              </div>
              {#if phoneOtpSent && !phoneVerified}
                <div class="mt-2 flex gap-2 items-center">
                  <input type="text" bind:value={phoneOtp} placeholder="OTP (e.g. 123456)" class="w-full max-w-[140px] rounded-lg border border-slate-200 py-1.5 px-2 text-xs outline-none" />
                  <button type="button" onclick={verifyPhoneOtp} class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition">Confirm</button>
                  <button type="button" onclick={() => phoneOtpSent = false} class="text-xs text-slate-500 hover:underline">Change</button>
                </div>
                {#if phoneOtpError}
                  <p class="text-[10px] text-rose-600 font-bold mt-1">{phoneOtpError}</p>
                {/if}
                <p class="text-[10px] text-slate-400 font-bold mt-1">Mock OTP: Use <strong>123456</strong></p>
              {/if}
            </div>
            <div>
              <label for="email" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div class="flex gap-2">
                <input id="email" type="email" bind:value={formData.email} disabled={emailVerified || emailOtpSent} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" />
                {#if formData.email && String(formData.email).trim() !== '' && !emailVerified && !emailOtpSent}
                  <button type="button" onclick={sendEmailOtp} class="px-4 py-2 bg-[#062206] text-white text-xs font-bold rounded-lg hover:bg-[#143A14] transition whitespace-nowrap">Send OTP</button>
                {/if}
                {#if emailVerified}
                  <span class="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs"><Check class="h-4 w-4 shrink-0" /> Verified</span>
                {/if}
              </div>
              {#if emailOtpSent && !emailVerified}
                <div class="mt-2 flex gap-2 items-center">
                  <input type="text" bind:value={emailOtp} placeholder="OTP (e.g. 123456)" class="w-full max-w-[140px] rounded-lg border border-slate-200 py-1.5 px-2 text-xs outline-none" />
                  <button type="button" onclick={verifyEmailOtp} class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition">Confirm</button>
                  <button type="button" onclick={() => emailOtpSent = false} class="text-xs text-slate-500 hover:underline">Change</button>
                </div>
                {#if emailOtpError}
                  <p class="text-[10px] text-rose-600 font-bold mt-1">{emailOtpError}</p>
                {/if}
                <p class="text-[10px] text-slate-400 font-bold mt-1">Mock OTP: Use <strong>123456</strong></p>
              {/if}
            </div>
            <div>
              <label for="aadhaarNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Aadhaar Number</label>
              <input id="aadhaarNumber" type="text" pattern="[0-9]{12}" bind:value={formData.aadhaarNumber} maxlength="12" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition" placeholder="12-digit number" />
            </div>
          </div>

        <!-- Step 2: Service Details -->
        {:else if currentStep === 2}
          <h2 class="text-base font-bold text-slate-900 mb-6">Service Form Details</h2>
          
          {#if service.slug === 'e-adangal-extract'}
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="adangalDistrict" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                <select id="adangalDistrict" bind:value={formData.district} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                  <option value="">Select District</option>
                  <option value="chennai">Chennai</option>
                  <option value="coimbatore">Coimbatore</option>
                  <option value="madurai">Madurai</option>
                  <option value="thanjavur">Thanjavur</option>
                  <option value="tiruchirappalli">Tiruchirappalli</option>
                </select>
              </div>
              <div>
                <label for="adangalTaluk" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Taluk *</label>
                <input id="adangalTaluk" type="text" bind:value={formData.taluk} required placeholder="e.g. Mambalam" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
              </div>
              <div>
                <label for="adangalVillage" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Village *</label>
                <input id="adangalVillage" type="text" bind:value={formData.village} required placeholder="e.g. Kodambakkam" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
              </div>
              <div>
                <label for="adangalSurveyNumber" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Survey Number / Sub-division *</label>
                <input id="adangalSurveyNumber" type="text" bind:value={formData.surveyNumber} required placeholder="e.g. 142/3A" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
              </div>
            </div>
          {:else}
            <div class="grid gap-5 sm:grid-cols-2">
              {#if service.slug === 'income-certificate'}
                <div>
                  <label for="annualIncome" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Annual Family Income (₹) *</label>
                  <input id="annualIncome" type="number" bind:value={formData.annualIncome} required placeholder="e.g. 120000" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="occupation" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Occupation *</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} required placeholder="e.g. Farmer / Business" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div class="sm:col-span-2">
                  <label for="purpose" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose of Certificate</label>
                  <input id="purpose" type="text" bind:value={formData.purpose} placeholder="e.g. Scholarship / Higher Education" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
              {:else if service.slug === 'community-certificate'}
                <div>
                  <label for="religion" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Religion *</label>
                  <select id="religion" bind:value={formData.religion} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                    <option value="">Select Religion</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Sikhism">Sikhism</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Jainism">Jainism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label for="communityCategory" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Community Category *</label>
                  <select id="communityCategory" bind:value={formData.communityCategory} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                    <option value="">Select Category</option>
                    <option value="BC">Backward Class (BC)</option>
                    <option value="MBC">Most Backward Class (MBC)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="DNC">Denotified Community (DNC)</option>
                    <option value="General">General (OC)</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="subCaste" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sub-Caste Name *</label>
                  <select id="subCaste" bind:value={formData.subCaste} required class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition">
                    <option value="">Select Sub-Caste</option>
                    <option value="Adidravidar">Adidravidar</option>
                    <option value="Kongu Vellalar">Kongu Vellalar</option>
                    <option value="Kallar">Kallar</option>
                    <option value="Maravar">Maravar</option>
                    <option value="Vanniyar">Vanniyar</option>
                    <option value="Nadar">Nadar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              {:else if service.slug === 'nativity-certificate'}
                <div>
                  <label for="placeOfBirth" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Place of Birth *</label>
                  <input id="placeOfBirth" type="text" bind:value={formData.placeOfBirth} required placeholder="e.g. Madurai" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="residenceDurationYears" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration of Residence in Tamil Nadu (in Years) *</label>
                  <input id="residenceDurationYears" type="number" bind:value={formData.residenceDurationYears} required placeholder="e.g. 15" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div class="sm:col-span-2">
                  <label for="purpose" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose of Certificate</label>
                  <input id="purpose" type="text" bind:value={formData.purpose} placeholder="e.g. Government Job / Education" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
              {:else}
                <div>
                  <label for="doorNo" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Door No.</label>
                  <input id="doorNo" type="text" bind:value={formData.doorNo} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="street" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Street</label>
                  <input id="street" type="text" bind:value={formData.street} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="area" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Area / Landmark</label>
                  <input id="area" type="text" bind:value={formData.area} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="district" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                  <input id="district" type="text" bind:value={formData.district} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="taluk" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Taluk</label>
                  <input id="taluk" type="text" bind:value={formData.taluk} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="pincode" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pincode *</label>
                  <input id="pincode" type="text" bind:value={formData.pincode} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="occupation" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Occupation</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
                <div>
                  <label for="purpose" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose</label>
                  <input id="purpose" type="text" bind:value={formData.purpose} class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium outline-none focus:bg-white focus:border-primary-500 transition" />
                </div>
              {/if}
            </div>
          {/if}

        <!-- Step 3: Documents -->
        {:else if currentStep === 3}
          <h2 class="text-base font-bold text-slate-900 mb-2">Upload Required Documents</h2>
          <p class="text-xs text-slate-500 mb-6">Upload citizen's verified document files or fetch instantly via DigiLocker mock connector.</p>
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
                      Remove
                    </button>
                  </div>
                {:else}
                  <div class="flex gap-2">
                    <label class="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-xs font-bold text-slate-500 cursor-pointer hover:border-primary-500 hover:text-primary-700 bg-white transition">
                      <Upload class="h-4 w-4" />
                      Upload File
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" onchange={(e) => handleFileUpload(doc.id, e)} />
                    </label>
                    {#if doc.digilockerAvailable}
                      <button
                        onclick={() => {
                          const dummyBlob = new Blob(
                            ["%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 40 >>\nstream\nBT /F1 24 Tf 100 700 Td (DigiLocker Document Verified) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n303\n%%EOF"],
                            { type: "application/pdf" }
                          );
                          const mockFile = new File([dummyBlob], `${doc.id}_digilocker.pdf`, { type: "application/pdf" });
                          uploadedDocs[doc.id] = { name: `${currentLocale === 'ta' ? doc.name.ta : doc.name.en} (DigiLocker).pdf`, size: mockFile.size, file: mockFile };
                        }}
                        class="rounded-xl border border-primary-500/20 bg-primary-50 px-4 py-2 text-[10px] font-bold text-primary-800 hover:bg-primary-100 transition"
                      >
                        DigiLocker
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

        <!-- Step 4: Review -->
        {:else if currentStep === 4}
          <h2 class="text-base font-bold text-slate-900 mb-6">Review Application Details</h2>
          <div class="space-y-4">
            <div class="rounded-2xl bg-slate-50/50 border border-slate-200 p-5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {service.slug === 'e-adangal-extract' ? 'Land Cultivation Details' : 'Personal Details'}
              </h3>
              {#if service.slug === 'e-adangal-extract'}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <dt class="text-slate-500">Applicant Name</dt><dd class="text-slate-900 font-bold">{formData.fullName || '—'}</dd>
                  <dt class="text-slate-500">District</dt><dd class="text-slate-900 font-bold capitalize">{formData.district || '—'}</dd>
                  <dt class="text-slate-500">Taluk</dt><dd class="text-slate-900 font-bold">{formData.taluk || '—'}</dd>
                  <dt class="text-slate-500">Village</dt><dd class="text-slate-900 font-bold">{formData.village || '—'}</dd>
                  <dt class="text-slate-500">Survey Number</dt><dd class="text-slate-900 font-bold">{formData.surveyNumber || '—'}</dd>
                </dl>
              {:else}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <dt class="text-slate-500">Full Name</dt><dd class="text-slate-900 font-bold">{formData.fullName || '—'}</dd>
                  <dt class="text-slate-500">Father's / Husband's Name</dt><dd class="text-slate-900 font-bold">{formData.fatherName || '—'}</dd>
                  <dt class="text-slate-500">Date of Birth</dt><dd class="text-slate-900 font-bold">{formData.dateOfBirth || '—'}</dd>
                  <dt class="text-slate-500">Gender</dt><dd class="text-slate-900 font-bold capitalize">{formData.gender || '—'}</dd>
                  <dt class="text-slate-500">Phone Number</dt><dd class="text-slate-900 font-bold">{formData.phone || '—'}</dd>
                  
                  {#if service.slug === 'income-certificate'}
                    <dt class="text-slate-500">Annual Family Income</dt><dd class="text-slate-900 font-bold">₹{formData.annualIncome || '—'}</dd>
                    <dt class="text-slate-500">Occupation</dt><dd class="text-slate-900 font-bold">{formData.occupation || '—'}</dd>
                    <dt class="text-slate-500">Purpose</dt><dd class="text-slate-900 font-bold">{formData.purpose || '—'}</dd>
                  {/if}

                  {#if service.slug === 'community-certificate'}
                    <dt class="text-slate-500">Religion</dt><dd class="text-slate-900 font-bold">{formData.religion || '—'}</dd>
                    <dt class="text-slate-500">Community Category</dt><dd class="text-slate-900 font-bold">{formData.communityCategory || '—'}</dd>
                    <dt class="text-slate-500">Sub-Caste Name</dt><dd class="text-slate-900 font-bold">{formData.subCaste || '—'}</dd>
                  {/if}

                  {#if service.slug === 'nativity-certificate'}
                    <dt class="text-slate-500">Place of Birth</dt><dd class="text-slate-900 font-bold">{formData.placeOfBirth || '—'}</dd>
                    <dt class="text-slate-500">Duration of Residence</dt><dd class="text-slate-900 font-bold">{formData.residenceDurationYears || '—'} Years</dd>
                    <dt class="text-slate-500">Purpose</dt><dd class="text-slate-900 font-bold">{formData.purpose || '—'}</dd>
                  {/if}
                </dl>
              {/if}
            </div>
            <div class="rounded-2xl bg-slate-50/50 border border-slate-200 p-5">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documents Check</h3>
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
          <h2 class="text-base font-bold text-slate-900 mb-6">Declaration</h2>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 leading-relaxed mb-6 font-medium">
            I hereby declare that all the information furnished by me in this application on behalf of the citizen is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false, the application is liable to be rejected.
          </div>
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={declarationAgreed} class="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <span class="text-xs font-bold text-slate-800">I confirm the citizen agrees to the declaration and authorizes submission.</span>
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
          Previous Step
        </button>

        <div class="flex items-center gap-3">
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
