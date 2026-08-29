<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { triggerFeatureNotice } from '$lib/stores/featureNotice';
  import { ArrowLeft, ArrowRight, Check, Upload, FileText, AlertCircle, Trash2, CreditCard } from '@lucide/svelte';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const user = $derived($currentUser);
  const slug = $derived($page.params.slug || '');
  const service = $derived(data.catalogService);
  const draftApplication = $derived(data.draftApplication ?? null);
  const serviceFee = $derived(Number(service?.fee ?? 0));
  const paymentRequired = $derived(serviceFee > 0 && draftApplication?.status !== 'CLARIFICATION_REQUESTED');

  let currentStep = $state(0);
  let formData = $state({});
  let declarationAgreed = $state(false);
  let submitted = $state(false);
  let applicationId = $state('');
  let uploadedDocs = $state({});
  let stepError = $state('');
  let isSubmitting = $state(false);
  let isSavingDraft = $state(false);
  let isDeletingDraft = $state(false);
  let showDeleteConfirmModal = $state(false);
  let activeDraftId = $state('');
  let activeTrackingId = $state('');
  let phoneVerified = $state(false);
  let verifiedPhoneNumber = $state('');
  let otpLoading = $state(false);
  let showPaymentModal = $state(false);
  let paymentOtp = $state('');
  let paymentInfo = $state(null);
  let paymentLoading = $state(false);

  const steps = $derived([
    t('apply.step.eligibility'),
    t('apply.step.personal'),
    t('apply.step.service'),
    t('apply.step.documents'),
    t('apply.step.review'),
    t('apply.step.declaration')
  ]);

  onMount(() => {
    if (draftApplication) {
        activeDraftId = draftApplication.id;
        activeTrackingId = draftApplication.applicationNumber;
        applicationId = draftApplication.applicationNumber;
        formData = { ...draftApplication.formData };
        declarationAgreed = true;
        if (formData.phone) {
            phoneVerified = true;
            verifiedPhoneNumber = formData.phone;
        }
        const requestedStep = Number($page.url.searchParams.get('step'));
        if (requestedStep) {
            currentStep = requestedStep;
        }
        else if (formData.lastStep) {
            currentStep = Number(formData.lastStep);
        }
        const nextUploadedDocs = {};
        for (const doc of draftApplication.documents ?? []) {
            nextUploadedDocs[doc.documentId] = {
                id: doc.id,
                name: doc.fileName || doc.name,
                size: doc.fileSize
            };
        }
        uploadedDocs = nextUploadedDocs;
    }
    const requestedStep = Number($page.url.searchParams.get('step') ?? '');
    if (Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep < steps.length) {
        currentStep = requestedStep;
    }
    else if (draftApplication) {
        currentStep = steps.length - 1;
    }
  });

  async function createDraft() {
    const createResponse = await fetch('/api/applications', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        serviceId: service.id,
        formData,
        submit: false
      })
    });
    const createBody = await createResponse.json().catch(() => null);

    if (!createResponse.ok || !createBody?.application?.id || !createBody.application.trackingId) {
      throw new Error(createBody?.message ?? createBody?.error?.message ?? createBody?.error ?? t('errors.saveApplicationDraft'));
    }

    activeDraftId = createBody.application.id;
    activeTrackingId = createBody.application.trackingId;
    applicationId = createBody.application.trackingId;
    return { id: activeDraftId, trackingId: activeTrackingId };
  }

  async function ensureDraftExists() {
    if (activeDraftId && activeTrackingId) {
      const updateResponse = await fetch(`/api/applications/${activeDraftId}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ formData })
      });
      const updateBody = await updateResponse.json().catch(() => null);
      if (!updateResponse.ok) {
        const message = updateBody?.message ?? updateBody?.error?.message ?? updateBody?.error ?? t('errors.saveApplicationDraft');
        if (updateResponse.status === 404 || message === 'Application not found.') {
          activeDraftId = '';
          activeTrackingId = '';
          applicationId = '';
          return createDraft();
        }
        throw new Error(message);
      }
      return { id: activeDraftId, trackingId: activeTrackingId };
    }

    return createDraft();
  }

  async function persistDraftUploads(draftId) {
    for (const [documentType, upload] of Object.entries(uploadedDocs)) {
      if (!upload.file) continue;
      const documentData = new FormData();
      documentData.set('file', upload.file);
      documentData.set('documentType', documentType);
      const uploadResponse = await fetch(`/api/applications/${draftId}/documents`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        body: documentData
      });
      if (!uploadResponse.ok) {
        const uploadBody = await uploadResponse.json().catch(() => null);
        throw new Error(uploadBody?.message ?? t('errors.uploadRequiredDocument'));
      }
      const uploadBody = await uploadResponse.json().catch(() => null);
      uploadedDocs[documentType] = {
        ...upload,
        id: uploadBody?.document?.id ?? upload.id,
        file: undefined
      };
      uploadedDocs = { ...uploadedDocs };
    }
  }

  let showOtpModal = $state(false);
  let otpInput = $state('');

  function normalizePhone(value = formData.phone) {
    return String(value ?? '').replace(/\D/g, '').slice(0, 10);
  }

  function handlePhoneInput() {
    const phone = normalizePhone(formData.phone);
    formData.phone = phone;
    if (phone !== verifiedPhoneNumber) {
        phoneVerified = false;
    }
  }

  async function sendOtp() {
      stepError = '';
      const phone = normalizePhone(formData.phone);
      formData.phone = phone;
      if (phone.length !== 10) {
          stepError = t('apply.validation.phoneInvalid');
          return;
      }
      otpLoading = true;
      window.setTimeout(() => {
          showOtpModal = true;
          otpLoading = false;
      }, 250);
  }
  
  async function verifyOtp() {
      stepError = '';
      if (!/^\d{4}$/.test(otpInput)) {
          stepError = t('apply.otp.invalid');
          return;
      }
      
      otpLoading = true;
      window.setTimeout(() => {
          if (otpInput === '1234') {
              phoneVerified = true;
              verifiedPhoneNumber = normalizePhone(formData.phone);
              showOtpModal = false;
              otpInput = '';
          }
          else {
              stepError = t('apply.otp.invalid');
          }
          otpLoading = false;
      }, 250);
  }

  let showMessageModal = $state(false);
  let messageModalTitle = $state('');
  let messageModalText = $state('');
  let messageModalIsError = $state(false);
  let messageModalRedirect = $state('');
  
  function showMessage(title, text, isError = false, redirectUrl = '') {
    messageModalTitle = title;
    messageModalText = text;
    messageModalIsError = isError;
    messageModalRedirect = redirectUrl;
    showMessageModal = true;
    if (redirectUrl && !isError) {
      window.setTimeout(() => {
        if (showMessageModal && messageModalRedirect === redirectUrl) {
          showMessageModal = false;
          goto(redirectUrl);
        }
      }, 900);
    }
  }

  async function saveDraft(showPopup = true) {
    if (isSavingDraft || isSubmitting) return;
    isSavingDraft = true;
    if (showPopup) stepError = '';

    try {
      formData.lastStep = currentStep;
      const draft = await ensureDraftExists();
      await persistDraftUploads(draft.id);
      applicationId = draft.trackingId;
      activeDraftId = draft.id;
      activeTrackingId = draft.trackingId;
      if (showPopup) {
        showMessage(t('success.draftSaved'), t('success.draftSaved'), false, '/applications');
      }
    } catch (cause) {
      if (showPopup) {
        stepError = cause instanceof Error ? cause.message : t('errors.saveApplicationDraft');
      }
    } finally {
      isSavingDraft = false;
    }
  }

  async function deleteDraft() {
    if (!activeDraftId || isDeletingDraft) return;

    showDeleteConfirmModal = false;
    isDeletingDraft = true;
    stepError = '';
    try {
      const response = await fetch(`/api/applications/${activeDraftId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? t('errors.deleteDraft'));
      }
      await goto('/applications');
    } catch (cause) {
      stepError = cause instanceof Error ? cause.message : t('errors.deleteDraft');
    } finally {
      isDeletingDraft = false;
    }
  }

  function validateCurrentStep() {
    stepError = '';

    if (currentStep === 1) { // Personal Details
      if (!formData.fullName || String(formData.fullName).trim() === '') {
        stepError = t('apply.validation.requiredYourField', { field: t('apply.field.fullName') });
        return false;
      }
      if (!formData.fatherName || String(formData.fatherName).trim() === '') {
        stepError = t('apply.validation.requiredYourField', { field: t('apply.field.fatherName') });
        return false;
      }
      if (!formData.dateOfBirth || String(formData.dateOfBirth).trim() === '') {
        stepError = t('apply.validation.requiredYourField', { field: t('apply.field.dob') });
        return false;
      }
      if (!formData.gender || String(formData.gender).trim() === '') {
        stepError = t('apply.validation.selectYourField', { field: t('apply.field.gender') });
        return false;
      }
      if (!formData.phone || !/^\d{10}$/.test(String(formData.phone).trim())) {
        stepError = t('apply.validation.phoneInvalid');
        return false;
      }
      if (!phoneVerified) {
        stepError = t('apply.validation.verifyPhoneOtp');
        return false;
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email).trim())) {
        stepError = t('apply.validation.emailInvalid');
        return false;
      }
      if (!formData.aadhaarNumber || !/^\d{12}$/.test(String(formData.aadhaarNumber))) {
        stepError = t('apply.validation.aadhaarMandatory');
        return false;
      }
    } else if (currentStep === 2) { // Service Details
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
      } else if (service?.slug === 'income-certificate') {
        if (!formData.annualIncome || Number(formData.annualIncome) <= 0) {
          stepError = t('apply.validation.positiveField', { field: t('apply.field.annualIncome') });
          return false;
        }
        if (!formData.occupation || String(formData.occupation).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.occupation') });
          return false;
        }
      } else if (service?.slug === 'community-certificate') {
        if (!formData.religion || String(formData.religion).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.religion') });
          return false;
        }
        if (!formData.communityCategory || String(formData.communityCategory).trim() === '') {
          stepError = t('apply.validation.selectYourField', { field: t('ui.communityCategory') });
          return false;
        }
        if (!formData.subCaste || String(formData.subCaste).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('ui.subCasteName') });
          return false;
        }
      } else if (service?.slug === 'nativity-certificate') {
        if (!formData.placeOfBirth || String(formData.placeOfBirth).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('ui.placeOfBirth') });
          return false;
        }
        if (!formData.residenceDurationYears || Number(formData.residenceDurationYears) <= 0) {
          stepError = t('apply.validation.residenceDurationInvalid');
          return false;
        }
      } else {
        // Fallback for default address services
        if (!formData.doorNo || String(formData.doorNo).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.doorNo') });
          return false;
        }
        if (!formData.street || String(formData.street).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.street') });
          return false;
        }
        if (!formData.area || String(formData.area).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.area') });
          return false;
        }
        if (!formData.taluk || String(formData.taluk).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.taluk') });
          return false;
        }
        if (!formData.district || String(formData.district).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.district') });
          return false;
        }
        if (!formData.pincode || String(formData.pincode).trim() === '') {
          stepError = t('apply.validation.requiredYourField', { field: t('apply.field.pincode') });
          return false;
        }
        if (!/^[1-9][0-9]{5}$/.test(String(formData.pincode).trim())) {
          stepError = t('apply.validation.pincodeInvalid');
          return false;
        }
      }
    } else if (currentStep === 3) { // Documents Upload
      if (service?.requiredDocuments && service.requiredDocuments.length > 0) {
        for (const doc of service.requiredDocuments) {
          if (doc.mandatory && !uploadedDocs[doc.id]) {
            stepError = t('apply.validation.requiredDocument', { document: currentLocale === 'ta' ? doc.nameTA : doc.name });
            return false;
          }
        }
      }
    }

    return true;
  }

  async function nextStep() {
    if (!validateCurrentStep()) return;
    
    if (currentStep < steps.length - 1) currentStep++;
  }

  function prevStep() {
    stepError = '';
    if (currentStep > 0) currentStep--;
  }

  function handleFileUpload(docId, event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 1024 * 1024) {
        stepError = t('apply.validation.fileMaxOneMb');
        input.value = '';
        return;
      }
      uploadedDocs[docId] = { name: file.name, size: file.size, file };
      stepError = '';
    }
  }

  let showConfirmModal = $state(false);

  function triggerSubmitConfirm() {
    if (!service || isSubmitting) return;
    showConfirmModal = true;
  }

  async function submitApplication() {
    showConfirmModal = false;
    isSubmitting = true;
    stepError = '';

    try {
      formData.lastStep = currentStep;
      const draft = await ensureDraftExists();
      await persistDraftUploads(draft.id);

      applicationId = draft.trackingId;
      activeDraftId = draft.id;
      activeTrackingId = draft.trackingId;

      if (paymentRequired) {
        const paymentResponse = await fetch(`/api/applications/${draft.id}/payment/otp`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        const paymentBody = await paymentResponse.json().catch(() => null);
        if (!paymentResponse.ok) {
          throw new Error(paymentBody?.message ?? t('errors.startPayment'));
        }
        paymentInfo = paymentBody?.payment ?? null;
        paymentOtp = '';
        showPaymentModal = true;
        return;
      }
      
      const submitResponse = await fetch(`/api/applications/${draft.id}/submit`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      let errorMessage = t('errors.submitApplication');
      let trackingId = '';
      try {
        const submitBody = await submitResponse.json();
        errorMessage = submitBody?.message ?? submitBody?.error?.message ?? submitBody?.error ?? errorMessage;
        trackingId = submitBody?.application?.applicationNumber ?? submitBody?.application?.trackingId;
      } catch (parseError) {
        const text = await submitResponse.text().catch(() => null);
        if (text && text.trim().length > 0 && text.trim().length < 500) {
          errorMessage = text.trim();
        }
      }
      if (!submitResponse.ok || !trackingId) {
        throw new Error(errorMessage);
      }
      applicationId = trackingId;

      submitted = true;
      showMessage(t('success.applicationSubmitted'), t('success.applicationSubmitted'), false, '/applications');
      return;
    } catch (cause) {
      stepError = cause instanceof Error ? cause.message : t('errors.submitApplication');
      showMessage(t('errors.submissionFailed'), stepError, true, '');
    } finally {
      isSubmitting = false;
    }
  }

  async function completeSimulatedPayment(outcome) {
    if (!activeDraftId || paymentLoading) return;
    if (!/^\d{4,6}$/.test(paymentOtp)) {
      stepError = t('payment.otpRequired');
      return;
    }
    paymentLoading = true;
    stepError = '';
    try {
      const response = await fetch(`/api/applications/${activeDraftId}/payment/confirm`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ otp: paymentOtp, outcome })
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? t('errors.confirmPayment'));
      }
      if (body?.payment?.status === 'FAILED') {
        showPaymentModal = false;
        showMessage(t('payment.failedTitle'), t('payment.failedRetry'), true, '');
        return;
      }
      applicationId = body?.application?.applicationNumber ?? body?.application?.trackingId ?? activeTrackingId;
      submitted = true;
      showPaymentModal = false;
      showMessage(t('success.applicationSubmitted'), t('success.applicationSubmitted'), false, '/applications');
    } catch (cause) {
      stepError = cause instanceof Error ? cause.message : t('errors.confirmPayment');
      showMessage(t('payment.failedTitle'), stepError, true, '');
    } finally {
      paymentLoading = false;
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{t('apply.title', { service: service ? (currentLocale === 'ta' ? service.nameTA : service.name) : '' })} — TN Kuviyam</title>
</svelte:head>

{#if !authenticated}
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <h1 class="text-h2 text-text">{t('ui.routes.public.services.slug.apply.aa70e968')}</h1>
      <a href="/login" class="mt-4 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white">{t('ui.routes.public.services.slug.apply.b1499a83')}</a>
    </div>
  </div>
{:else if !service}
  <div class="flex min-h-[60vh] items-center justify-center">
    <p class="text-text-muted">{t('ui.routes.public.services.slug.apply.54f6b3d9')}</p>
  </div>
{:else if submitted}
  <!-- Success state -->
  <div class="flex min-h-[70vh] items-center justify-center bg-background px-4">
    <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg animate-fade-in">
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
        <Check class="h-8 w-8 text-success" />
      </div>
      <h1 class="text-h2 text-text">{t('apply.success.title')}</h1>
      <p class="mt-2 text-sm text-text-muted">{t('apply.success.message')}</p>
      {#if submissionPending}
        <p class="mt-2 text-xs font-semibold text-primary">{t('ui.routes.public.services.slug.apply.4cd77835')}</p>
      {/if}
      <div class="mt-6 rounded-lg bg-surface p-4">
        <div class="text-xs text-text-muted">{t('apply.success.id')}</div>
        <div class="mt-1 text-xl font-bold text-primary font-mono">{applicationId}</div>
      </div>
      <div class="mt-6 flex flex-col gap-3">
        <a href="/applications" class="rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-hover">
          {t('apply.success.track')}
        </a>
        <a href="/dashboard" class="rounded-lg border border-border py-3 text-sm font-medium text-text transition hover:bg-surface">
          {t('apply.success.dashboard')}
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="border-b border-border bg-surface">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <a href="/services/{slug}" class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition mb-2">
          <ArrowLeft class="h-4 w-4" /> {t('common.back')}
        </a>
        <p class="text-xs font-bold uppercase tracking-wider text-text-muted">{t('ui.routes.public.services.slug.apply.ff0d5177')}</p>
        <h1 class="mt-1 text-xl font-black tracking-tight text-text sm:text-2xl">
          {currentLocale === 'ta' ? service.nameTA : service.name}
        </h1>
      </div>
    </div>

    <!-- Stepper -->
    <div class="border-b border-border bg-surface px-4 py-4 sm:px-6">
      <div class="mx-auto max-w-7xl">
        <div class="hide-scrollbar flex items-center justify-start gap-2 overflow-x-auto pb-1 sm:gap-3">
          {#each steps as step, i}
            <div class="flex shrink-0 items-center gap-2 sm:gap-3">
              <div class="flex min-w-fit items-center gap-2 rounded-full border px-2.5 py-2 text-xs font-bold shadow-vazhi-1 transition-all sm:px-4
                {i === currentStep 
                  ? 'border-primary bg-primary text-white ring-2 ring-primary/15' 
                  : i < currentStep 
                    ? 'border-success/25 bg-success-soft text-success' 
                    : 'border-border bg-muted text-text-muted'}">
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black
                  {i === currentStep 
                    ? 'bg-white text-primary' 
                    : i < currentStep 
                      ? 'bg-success text-white' 
                      : 'bg-surface-container-high text-text-muted'}">
                  {#if i < currentStep}
                    <Check class="h-3.5 w-3.5" />
                  {:else}
                    {i + 1}
                  {/if}
                </div>
                <span class="hidden whitespace-nowrap sm:inline">{step}</span>
                <span class="whitespace-nowrap sm:hidden">{i === currentStep ? step : ''}</span>
              </div>
              {#if i < steps.length - 1}
                <svg class="h-3.5 w-3.5 shrink-0 text-border-strong" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Form content -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div class="rounded-xl border border-border bg-surface p-6 shadow-sm animate-fade-in">
        {#if draftApplication && draftApplication.status === 'CLARIFICATION_REQUESTED'}
          <div class="mb-6 rounded-2xl border border-primary/20 bg-primary-light/10 p-4 text-sm text-primary flex items-start gap-3">
            <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p class="font-extrabold">{t('ui.routes.public.services.slug.apply.0919d87d')}</p>
              <p class="text-xs mt-0.5 opacity-90">{t('ui.routes.public.services.slug.apply.d28f9a9f')}</p>
            </div>
          </div>
        {/if}
        <!-- Step 0: Eligibility -->
        {#if currentStep === 0}
          <h2 class="mb-4 text-base font-black text-text">{t('service.eligibility')}</h2>
          <ul class="mb-6 space-y-3">
            {#each (currentLocale === 'ta' ? service.eligibilityTA : service.eligibility) as item}
              <li class="flex items-start gap-2 text-sm">
                <Check class="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span class="text-text-muted">{item}</span>
              </li>
            {/each}
          </ul>
          <div class="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-soft p-4 text-sm font-semibold text-primary-soft-text">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {t('ui.review.eligibility.before.continuing')}
          </div>

        <!-- Step 1: Personal Details -->
        {:else if currentStep === 1}
          <h2 class="mb-6 text-base font-black text-text">{t('apply.step.personal')}</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fullName" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.fullName')} *</label>
              <input id="fullName" type="text" bind:value={formData.fullName} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="fatherName" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.fatherName')} *</label>
              <input id="fatherName" type="text" bind:value={formData.fatherName} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="dateOfBirth" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.dob')} *</label>
              <input id="dateOfBirth" type="date" bind:value={formData.dateOfBirth} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="gender" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.gender')} *</label>
              <select id="gender" bind:value={formData.gender} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary">
                <option value="">{t('ui.routes.public.services.slug.apply.06d5440b')}</option>
                <option value="male">{t('ui.routes.public.services.slug.apply.35062ae7')}</option>
                <option value="female">{t('ui.routes.public.services.slug.apply.b821374e')}</option>
                <option value="other">{t('ui.routes.public.services.slug.apply.2d0fdb03')}</option>
              </select>
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.phone')} *</label>
              <div class="flex gap-2">
                <input id="phone" type="tel" inputmode="numeric" maxlength="10" bind:value={formData.phone} oninput={handlePhoneInput} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                {#if phoneVerified}
                  <div class="flex h-[42px] px-4 items-center justify-center rounded-lg bg-success-soft text-success border border-success/25">
                    <Check class="h-4 w-4 mr-1 shrink-0" /> <span class="text-xs font-bold uppercase">{t('ui.routes.public.services.slug.apply.e64ce704')}</span>
                  </div>
                {:else}
                  <button type="button" onclick={sendOtp} disabled={otpLoading} class="h-[42px] px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition shrink-0">
                    {#if otpLoading}
                      <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></span>
                    {/if}
                    {t('ui.verify')}
                  </button>
                {/if}
              </div>
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.email')}</label>
              <input id="email" type="email" bind:value={formData.email} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="aadhaarNumber" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.aadhaar')} *</label>
                <input id="aadhaarNumber" type="text" pattern="[0-9]{12}" bind:value={formData.aadhaarNumber} maxlength="12" class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('apply.placeholder.aadhaar')} />
            </div>
          </div>

        <!-- Step 2: Service Details (Address & specific) -->
        {:else if currentStep === 2}
          <h2 class="mb-6 text-base font-black text-text">{t('apply.step.service')}</h2>
          {#if service.slug === 'e-adangal-extract'}
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="adangalDistrict" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.district')} *</label>
                <select id="adangalDistrict" bind:value={formData.district} required class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary">
                  <option value="">{t('ui.routes.public.services.slug.apply.31d2b329')}</option>
                  <option value="chennai">{t('ui.routes.public.services.slug.apply.ef1818ad')}</option>
                  <option value="coimbatore">{t('ui.routes.public.services.slug.apply.2b20b702')}</option>
                  <option value="madurai">{t('ui.routes.public.services.slug.apply.25d87df9')}</option>
                  <option value="thanjavur">{t('ui.routes.public.services.slug.apply.78e64a98')}</option>
                  <option value="tiruchirappalli">{t('ui.routes.public.services.slug.apply.ef5b8f38')}</option>
                </select>
              </div>
              <div>
                <label for="adangalTaluk" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.e21af624')}</label>
                <input id="adangalTaluk" type="text" bind:value={formData.taluk} placeholder={t('ui.e.g.mambalam')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="adangalVillage" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.4a3316ed')}</label>
                <input id="adangalVillage" type="text" bind:value={formData.village} placeholder={t('ui.e.g.kodambakkam')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="adangalSurveyNumber" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.ba8b93a2')}</label>
                <input id="adangalSurveyNumber" type="text" bind:value={formData.surveyNumber} required placeholder={t('ui.e.g.142.3a')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          {:else}
            <div class="grid gap-4 sm:grid-cols-2">
              {#if service.slug === 'income-certificate'}
                <div>
                  <label for="annualIncome" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.cd365b1a')}</label>
                  <input id="annualIncome" type="number" bind:value={formData.annualIncome} required placeholder={t('ui.e.g.120000')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="occupation" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.occupation')} *</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} required placeholder={t('ui.e.g.farmer.business')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {:else if service.slug === 'community-certificate'}
                <div>
                  <label for="religion" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.266fa199')}</label>
                  <select id="religion" bind:value={formData.religion} required class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary">
                    <option value="">{t('ui.routes.public.services.slug.apply.f3924dc2')}</option>
                    <option value="Hinduism">{t('ui.routes.public.services.slug.apply.20fd4d1c')}</option>
                    <option value="Islam">{t('ui.routes.public.services.slug.apply.6157ad71')}</option>
                    <option value="Christianity">{t('ui.routes.public.services.slug.apply.9b1a8bf0')}</option>
                    <option value="Sikhism">{t('ui.routes.public.services.slug.apply.ac6a09cf')}</option>
                    <option value="Buddhism">{t('ui.routes.public.services.slug.apply.9299ef20')}</option>
                    <option value="Jainism">{t('ui.routes.public.services.slug.apply.058a9947')}</option>
                    <option value="Other">{t('ui.routes.public.services.slug.apply.2d0fdb03')}</option>
                  </select>
                </div>
                <div>
                  <label for="communityCategory" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.9a22b944')}</label>
                  <select id="communityCategory" bind:value={formData.communityCategory} required class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary">
                    <option value="">{t('ui.routes.public.services.slug.apply.81ea0a00')}</option>
                    <option value="BC">{t('ui.routes.public.services.slug.apply.ca68b2ac')}</option>
                    <option value="MBC">{t('ui.routes.public.services.slug.apply.b712d0a2')}</option>
                    <option value="SC">{t('ui.routes.public.services.slug.apply.3480d78f')}</option>
                    <option value="ST">{t('ui.routes.public.services.slug.apply.af80ca07')}</option>
                    <option value="DNC">{t('ui.routes.public.services.slug.apply.f17e76a8')}</option>
                    <option value="General">{t('ui.routes.public.services.slug.apply.f3ec03eb')}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="subCaste" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.79134876')}</label>
                  <select id="subCaste" bind:value={formData.subCaste} required class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary">
                    <option value="">{t('ui.routes.public.services.slug.apply.395064bd')}</option>
                    <option value="Adidravidar">{t('ui.routes.public.services.slug.apply.5546ed6f')}</option>
                    <option value="Kongu Vellalar">{t('ui.routes.public.services.slug.apply.4ea9e3d6')}</option>
                    <option value="Kallar">{t('ui.routes.public.services.slug.apply.2be1a3a4')}</option>
                    <option value="Maravar">{t('ui.routes.public.services.slug.apply.c3aab41c')}</option>
                    <option value="Vanniyar">{t('ui.routes.public.services.slug.apply.464c0ca4')}</option>
                    <option value="Nadar">{t('ui.routes.public.services.slug.apply.30311dab')}</option>
                    <option value="Other">{t('ui.routes.public.services.slug.apply.2d0fdb03')}</option>
                  </select>
                </div>
              {:else if service.slug === 'nativity-certificate'}
                <div>
                  <label for="placeOfBirth" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.1a103f7f')}</label>
                  <input id="placeOfBirth" type="text" bind:value={formData.placeOfBirth} required placeholder={t('ui.e.g.madurai')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="residenceDurationYears" class="block text-sm font-medium text-text mb-1.5">{t('ui.routes.public.services.slug.apply.bff143f4')}</label>
                  <input id="residenceDurationYears" type="number" bind:value={formData.residenceDurationYears} required placeholder={t('ui.e.g.15')} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {:else}
                <div>
                  <label for="doorNo" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.doorNo')} *</label>
                  <input id="doorNo" type="text" bind:value={formData.doorNo} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="street" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.street')} *</label>
                  <input id="street" type="text" bind:value={formData.street} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="area" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.area')} *</label>
                  <input id="area" type="text" bind:value={formData.area} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="district" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.district')} *</label>
                  <input id="district" type="text" bind:value={formData.district} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="taluk" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.taluk')} *</label>
                  <input id="taluk" type="text" bind:value={formData.taluk} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="pincode" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.pincode')} *</label>
                  <input id="pincode" type="text" bind:value={formData.pincode} maxlength="6" pattern="[1-9][0-9]{5}" placeholder="600040" class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="occupation" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.occupation')}</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {/if}
            </div>
          {/if}

        <!-- Step 3: Documents -->
        {:else if currentStep === 3}
          <h2 class="mb-2 text-base font-black text-text">{t('apply.step.documents')}</h2>
          <p class="text-sm text-text-muted mb-6">{t('ui.routes.public.services.slug.apply.d48af040')}</p>
          <div class="space-y-4">
            {#each service.requiredDocuments as doc}
              <div class="rounded-lg border border-border p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <FileText class="h-5 w-5 text-primary" />
                    <span class="text-sm font-medium text-text">{currentLocale === 'ta' ? doc.nameTA : doc.name}</span>
                  </div>
                  <span class="text-xs font-medium {doc.mandatory ? 'text-danger' : 'text-text-muted'}">
                    {doc.mandatory ? t('common.required') : t('common.optional')}
                  </span>
                </div>
                {#if uploadedDocs[doc.id]}
                  <div class="flex items-center justify-between rounded-lg bg-success-soft border border-success/25 p-3 text-sm text-success">
                    <div class="flex items-center gap-2">
                      <Check class="h-4 w-4 text-success" />
                      <span class="font-medium truncate">{uploadedDocs[doc.id].name}</span>
                    </div>
                    <button
                      type="button"
                      onclick={() => { delete uploadedDocs[doc.id]; uploadedDocs = { ...uploadedDocs }; }}
                      class="text-xs font-bold text-danger hover:underline px-2.5 py-1.5 rounded-lg hover:bg-danger-soft transition shrink-0"
                    >
                      {t('ui.remove')}
                    </button>
                  </div>
                {:else}
                  <div class="flex gap-2">
                    <label class="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-text-muted cursor-pointer hover:border-primary hover:text-primary transition">
                      <Upload class="h-4 w-4" />
                      {t('ui.upload.file.2')}
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" onchange={(e) => handleFileUpload(doc.id, e)} />
                    </label>
                    {#if doc.digilockerAvailable}
                      <button
                        onclick={() => {
                          triggerFeatureNotice('DigiLocker Demo Integration');
                          const dummyBlob = new Blob(
                            ["%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >{t('ui.nendobj.n2.0.obj.n')}<< /Type /Pages /Kids [3 0 R] /Count 1 >{t('ui.nendobj.n3.0.obj.n')}<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >{t('ui.nendobj.n4.0.obj.n')}<< /Length 72 >{t('ui.nstream.nbt.f1.18.tf.72.700.td.demo.digilocker.document.not.real.government.veri')}<< /Size 5 /Root 1 0 R >>\nstartxref\n367\n%%EOF"],
                            { type: "application/pdf" }
                          );
                          const mockFile = new File([dummyBlob], `${doc.id}_digilocker.pdf`, { type: "application/pdf" });
                          uploadedDocs[doc.id] = {
                            name: `${currentLocale === 'ta' ? doc.nameTA : doc.name} (${t('ui.digilocker.demo')}).pdf`,
                            size: mockFile.size,
                            file: mockFile
                          };
                        }}
                        class="rounded-lg border border-primary/25 bg-primary-soft px-4 py-2 text-xs font-medium text-primary-soft-text hover:bg-primary/10 transition"
                      >
                        {t('ui.digilocker.demo')}
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

        <!-- Step 4: Review -->
        {:else if currentStep === 4}
          <h2 class="mb-6 text-base font-black text-text">{t('apply.step.review')}</h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-surface p-4">
              <h3 class="text-sm font-semibold text-text mb-3">
                {service.slug === 'e-adangal-extract' ? t('apply.review.landCultivationDetails') : t('apply.step.personal')}
              </h3>
              {#if service.slug === 'e-adangal-extract'}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.b88e3113')}</dt><dd class="text-text font-medium">{formData.fullName || '—'}</dd>
                  <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.68a13fe9')}</dt><dd class="text-text font-medium capitalize">{formData.district || '—'}</dd>
                  <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.e21af624')}</dt><dd class="text-text font-medium">{formData.taluk || '—'}</dd>
                  <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.4a3316ed')}</dt><dd class="text-text font-medium">{formData.village || '—'}</dd>
                  <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.0a015012')}</dt><dd class="text-text font-medium">{formData.surveyNumber || '—'}</dd>
                </dl>
              {:else}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt class="text-text-muted">{t('apply.field.fullName')}</dt><dd class="text-text font-medium">{formData.fullName || '—'}</dd>
                  
                  {#if service.slug === 'income-certificate'}
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.975f4ce5')}</dt><dd class="text-text font-medium">₹{formData.annualIncome || '—'}</dd>
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.f87cef33')}</dt><dd class="text-text font-medium">{formData.occupation || '—'}</dd>
                  {:else}
                    <dt class="text-text-muted">{t('apply.field.fatherName')}</dt><dd class="text-text font-medium">{formData.fatherName || '—'}</dd>
                    <dt class="text-text-muted">{t('apply.field.dob')}</dt><dd class="text-text font-medium">{formData.dateOfBirth || '—'}</dd>
                    <dt class="text-text-muted">{t('apply.field.gender')}</dt><dd class="text-text font-medium">{formData.gender || '—'}</dd>
                    <dt class="text-text-muted">{t('apply.field.phone')}</dt><dd class="text-text font-medium">{formData.phone || '—'}</dd>
                  {/if}

                  {#if service.slug === 'community-certificate'}
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.7d99b74e')}</dt><dd class="text-text font-medium">{formData.religion || '—'}</dd>
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.bcf29f16')}</dt><dd class="text-text font-medium">{formData.communityCategory || '—'}</dd>
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.4d5c98d3')}</dt><dd class="text-text font-medium">{formData.subCaste || '—'}</dd>
                  {/if}

                  {#if service.slug === 'nativity-certificate'}
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.eb59fe52')}</dt><dd class="text-text font-medium">{formData.placeOfBirth || '—'}</dd>
                    <dt class="text-text-muted">{t('ui.routes.public.services.slug.apply.d5ed6119')}</dt><dd class="text-text font-medium">{formData.residenceDurationYears || '—'} {t('common.years')}</dd>
                  {/if}
                </dl>
              {/if}
            </div>
            <div class="rounded-lg bg-surface p-4">
              <h3 class="text-sm font-semibold text-text mb-3">{t('apply.step.documents')}</h3>
              {#each service.requiredDocuments as doc}
                <div class="flex items-center justify-between py-1.5 text-sm">
                  <span class="text-text-muted">{currentLocale === 'ta' ? doc.nameTA : doc.name}</span>
                  <span class="font-medium {uploadedDocs[doc.id] ? 'text-success' : 'text-danger'}">
                    {uploadedDocs[doc.id] ? t('status.uploaded') : t('status.missing')}
                  </span>
                </div>
              {/each}
            </div>
          </div>

        <!-- Step 5: Declaration -->
        {:else if currentStep === 5}
          <h2 class="mb-6 text-base font-black text-text">{t('apply.step.declaration')}</h2>
          <div class="mb-6 rounded-lg border border-border bg-muted p-4 text-sm leading-relaxed text-text-muted">
            {t('ui.i.confirm.the.information.in.this.application.is.true.and.correct')}
          </div>
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={declarationAgreed} class="mt-1 h-4 w-4 rounded border-border text-primary" />
            <span class="text-sm font-medium text-text">{t('apply.declaration.agree')}</span>
          </label>
        {/if}
      </div>

      {#if stepError}
        <div class="mt-4 rounded-xl border border-danger/25 bg-danger-soft p-3.5 text-xs font-bold text-danger flex items-center gap-2.5 shadow-xs">
          <AlertCircle class="h-4 w-4 text-danger shrink-0" />
          <span>{stepError}</span>
        </div>
      {/if}

      <!-- Navigation buttons -->
      <div class="mt-6 flex items-center justify-between">
        <button
          onclick={prevStep}
          disabled={currentStep === 0}
          class="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text transition hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft class="h-4 w-4" />
          {t('apply.previous')}
        </button>

        <div class="flex items-center gap-3">
          {#if activeDraftId}
            <button
              type="button"
              onclick={() => showDeleteConfirmModal = true}
              disabled={isDeletingDraft || isSubmitting}
              class="inline-flex items-center gap-2 rounded-lg border border-danger/25 bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger-soft/80 disabled:opacity-50"
            >
              <Trash2 class="h-4 w-4" />
              {isDeletingDraft ? t('common.deleting') : t('ui.delete.draft')}
            </button>
          {/if}
          {#if currentStep === steps.length - 1}
            <button
              type="button"
              onclick={() => saveDraft(true)}
              disabled={isSavingDraft || isSubmitting}
              class="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-surface-container disabled:opacity-50"
            >
              <FileText class="h-4 w-4" />
              {isSavingDraft ? t('apply.savingDraft') : t('apply.saveDraft')}
            </button>
          {/if}
          {#if currentStep < steps.length - 1}
            <button
              onclick={nextStep}
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t('apply.next')}
              <ArrowRight class="h-4 w-4" />
            </button>
          {:else}
            <button
              onclick={triggerSubmitConfirm}
              disabled={!declarationAgreed || isSubmitting}
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check class="h-4 w-4" />
              {#if isSubmitting}
                {t('common.loading')}
              {:else}
                {t('apply.submit')}
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if showConfirmModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scale-up">
        <h3 class="mb-3 text-lg font-black text-text">{t('ui.routes.public.services.slug.apply.1fceecc1')}</h3>
        <p class="text-sm text-text-muted leading-relaxed mb-6">
          {t('apply.confirm.detailsCorrect')}
          {#if paymentRequired}
            {t('apply.confirm.paymentBeforeSubmission')}
          {/if}
        </p>
        <div class="flex items-center justify-end gap-3">
          <button
            onclick={() => showConfirmModal = false}
            class="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-muted transition"
          >
            {t('common.cancel')}
          </button>
          <button
            onclick={submitApplication}
            class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition"
          >
            {paymentRequired ? t('payment.continueToPayment') : t('apply.submit')}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showPaymentModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scale-up">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary-soft text-primary">
          <CreditCard class="h-5 w-5" />
        </div>
        <p class="text-xs font-black uppercase tracking-wider text-primary">{t('ui.routes.public.services.slug.apply.3a5ea712')}</p>
        <h3 class="mt-1 text-lg font-black text-text">{t('ui.routes.public.services.slug.apply.81389553')}</h3>
        <p class="mt-2 text-sm leading-relaxed text-text-muted">
          {t('ui.this.is.a.safe.simulation.for.tn.kuviyam.testing.do.not.enter.real.card.upi.bank')}
        </p>
        <div class="mt-5 rounded-xl border border-border bg-muted p-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-text-muted">{t('ui.routes.public.services.slug.apply.ff0d5177')}</span>
            <span class="font-bold text-text">{activeTrackingId || applicationId}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span class="text-text-muted">{t('ui.routes.public.services.slug.apply.b1f7c598')}</span>
            <span class="font-black text-text">Rs. {paymentInfo?.amount ?? serviceFee}</span>
          </div>
          <p class="mt-3 text-xs font-semibold text-primary">
            {t('ui.demo.otp.1234.the.server.validates.this.otp.before.recording.the.selected.outcom')}
          </p>
        </div>
        <label for="paymentOtp" class="mt-5 block text-sm font-semibold text-text">{t('ui.routes.public.services.slug.apply.8477998a')}</label>
        <input
          id="paymentOtp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          bind:value={paymentOtp}
          placeholder="1234"
          class="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-xl font-black tracking-[0.4em] text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onclick={() => completeSimulatedPayment('FAILED')}
            disabled={paymentLoading}
            class="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm font-bold text-danger transition hover:bg-danger-soft/80 disabled:opacity-60"
          >
            {t('chatbot.help.issue.paymentFailed')}
          </button>
          <button
            type="button"
            onclick={() => completeSimulatedPayment('SUCCESS')}
            disabled={paymentLoading}
            class="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {paymentLoading ? t('common.verifying') : t('payment.markSuccessful')}
          </button>
        </div>
        <button
          type="button"
          onclick={() => { showPaymentModal = false; isSubmitting = false; }}
          disabled={paymentLoading}
          class="mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-muted disabled:opacity-60"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  {/if}

  {#if showDeleteConfirmModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-vazhi-2 animate-scale-up">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/25 bg-danger-soft text-danger">
          <Trash2 class="h-5 w-5" />
        </div>
        <h3 class="mb-3 text-lg font-black text-text">{t('ui.routes.public.services.slug.apply.87578807')}</h3>
        <p class="text-sm text-text-muted leading-relaxed mb-6">
          {t('ui.this.draft.will.be.permanently.deleted')}
        </p>
        <div class="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onclick={() => showDeleteConfirmModal = false}
            disabled={isDeletingDraft}
            class="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onclick={deleteDraft}
            disabled={isDeletingDraft}
            class="rounded-lg border border-danger/30 bg-danger-soft px-5 py-2.5 text-sm font-bold text-danger transition hover:bg-danger-soft/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeletingDraft ? t('common.deleting') : t('common.yesDelete')}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Mock OTP Modal -->
  {#if showOtpModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div class="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scale-up">
        <h3 class="mb-2 text-lg font-black text-text">{t('apply.otp.title')}</h3>
        <p class="text-sm text-text-muted mb-6">{t('apply.otp.subtitle', { phone: formData.phone })}</p>
        
        <input type="text" bind:value={otpInput} placeholder="1234" maxlength="4" class="w-full text-center tracking-[0.5em] text-2xl font-bold rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-6" />

        {#if stepError}
          <p class="text-sm text-danger mb-6 text-center font-medium animate-pulse">{stepError}</p>
        {/if}

        <div class="flex items-center justify-end gap-3">
          <button
            onclick={() => { showOtpModal = false; otpInput = ''; stepError = ''; }}
            class="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-muted transition"
          >
            {t('common.cancel')}
          </button>
          <button
            onclick={verifyOtp}
            disabled={otpLoading || !/^\d{4}$/.test(otpInput)}
            class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition disabled:opacity-50"
          >
            {otpLoading ? t('common.loading') : t('auth.verifyOtp')}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Generic Message/Success Modal -->
  {#if showMessageModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div class="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scale-up text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full {messageModalIsError ? 'bg-danger-soft' : 'bg-success-soft'}">
          {#if messageModalIsError}
            <AlertCircle class="h-6 w-6 text-danger" />
          {:else}
            <Check class="h-6 w-6 text-success" />
          {/if}
        </div>
        <h3 class="mb-2 text-lg font-black text-text">{messageModalTitle}</h3>
        <p class="text-sm text-text-muted leading-relaxed mb-6">{messageModalText}</p>
        
        <button
          onclick={() => {
            showMessageModal = false;
            if (messageModalRedirect) {
              goto(messageModalRedirect);
            }
          }}
          class="w-full rounded-lg {messageModalIsError ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-hover'} py-2.5 text-sm font-semibold text-white transition"
        >
          {messageModalRedirect ? 'Continue' : 'Close'}
        </button>
      </div>
    </div>
  {/if}
{/if}
