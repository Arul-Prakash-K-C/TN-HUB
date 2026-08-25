<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { ArrowLeft, ArrowRight, Save, Check, Upload, FileText, AlertCircle } from '@lucide/svelte';
  import type { ApplicationFormData } from '$lib/types';

  let { data } = $props();

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const user = $derived($currentUser);
  const slug = $derived($page.params.slug || '');
  const service = $derived(data.catalogService);

  let currentStep = $state(0);
  let formData = $state<ApplicationFormData>({});
  let declarationAgreed = $state(false);
  let submitted = $state(false);
  let applicationId = $state('');
  let uploadedDocs = $state<Record<string, { name: string; size: number; file?: File }>>({});
  let stepError = $state('');
  let isSubmitting = $state(false);

  const steps = $derived([
    t('apply.step.eligibility'),
    t('apply.step.personal'),
    t('apply.step.service'),
    t('apply.step.documents'),
    t('apply.step.review'),
    t('apply.step.declaration')
  ]);

  // Pre-fill from user profile
  $effect(() => {
    if (user && user.role === 'citizen') {
      const citizen = user as any;
      formData = {
        fullName: citizen.name || '',
        email: citizen.email || '',
        phone: citizen.phone || '',
        dateOfBirth: citizen.dateOfBirth || '',
        gender: citizen.gender || '',
        aadhaarLast4: citizen.aadhaarLast4 || '',
        doorNo: citizen.address?.doorNo || '',
        street: citizen.address?.street || '',
        area: citizen.address?.area || '',
        city: citizen.address?.city || '',
        district: citizen.district || '',
        taluk: citizen.taluk || '',
        village: citizen.village || '',
        pincode: citizen.pincode || '',
        annualIncome: citizen.annualIncome || undefined,
        occupation: citizen.occupation || '',
        community: citizen.community || '',
        religion: citizen.religion || '',
        purpose: ''
      };
    }
  });

  function validateCurrentStep(): boolean {
    stepError = '';

    if (currentStep === 1) { // Personal Details
      if (!formData.fullName || String(formData.fullName).trim() === '') {
        stepError = 'Please enter your Full Name.';
        return false;
      }
      if (!formData.phone || String(formData.phone).trim() === '') {
        stepError = 'Please enter your Phone Number.';
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
          stepError = 'Please enter your Occupation.';
          return false;
        }
      } else if (service?.slug === 'community-certificate') {
        if (!formData.religion || String(formData.religion).trim() === '') {
          stepError = 'Please enter your Religion.';
          return false;
        }
        if (!formData.communityCategory || String(formData.communityCategory).trim() === '') {
          stepError = 'Please select your Community Category.';
          return false;
        }
        if (!formData.subCaste || String(formData.subCaste).trim() === '') {
          stepError = 'Please enter your Sub-Caste Name.';
          return false;
        }
      } else if (service?.slug === 'nativity-certificate') {
        if (!formData.placeOfBirth || String(formData.placeOfBirth).trim() === '') {
          stepError = 'Please enter your Place of Birth.';
          return false;
        }
        if (!formData.residenceDurationYears || Number(formData.residenceDurationYears) <= 0) {
          stepError = 'Please enter a valid duration of residence in years.';
          return false;
        }
      } else {
        // Fallback for default address services
        if (!formData.district || String(formData.district).trim() === '') {
          stepError = 'Please enter your District.';
          return false;
        }
        if (!formData.pincode || String(formData.pincode).trim() === '') {
          stepError = 'Please enter your Pincode.';
          return false;
        }
      }
    } else if (currentStep === 3) { // Documents Upload
      if (service?.requiredDocuments && service.requiredDocuments.length > 0) {
        for (const doc of service.requiredDocuments) {
          if (doc.mandatory && !uploadedDocs[doc.id]) {
            stepError = `Please upload required document: ${currentLocale === 'ta' ? doc.nameTA : doc.name}`;
            return false;
          }
        }
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    if (currentStep < steps.length - 1) currentStep++;
  }

  function prevStep() {
    stepError = '';
    if (currentStep > 0) currentStep--;
  }

  function handleFileUpload(docId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      uploadedDocs[docId] = { name: file.name, size: file.size, file };
    }
  }

  async function submitApplication() {
    if (!service || isSubmitting) return;

    isSubmitting = true;
    stepError = '';

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          formData,
          submit: false
        })
      });
      const body = (await response.json().catch(() => null)) as {
        application?: { id?: string; trackingId?: string };
        message?: string;
      } | null;

      if (!response.ok || !body?.application?.id) {
        throw new Error(body?.message ?? 'Unable to save the application draft.');
      }

      for (const [documentType, upload] of Object.entries(uploadedDocs)) {
        if (!upload.file) continue;
        const documentData = new FormData();
        documentData.set('file', upload.file);
        documentData.set('documentType', documentType);
        const uploadResponse = await fetch(`/api/applications/${body.application.id}/documents`, {
          method: 'POST',
          credentials: 'same-origin',
          body: documentData
        });
        if (!uploadResponse.ok) {
          const uploadBody = await uploadResponse.json().catch(() => null) as { message?: string } | null;
          throw new Error(uploadBody?.message ?? 'Unable to upload a required document.');
        }
      }

      const submitResponse = await fetch(`/api/applications/${body.application.id}/submit`, {
        method: 'POST',
        credentials: 'same-origin'
      });
      const submitBody = await submitResponse.json().catch(() => null) as { application?: { trackingId?: string }; message?: string } | null;
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
  <title>{t('apply.title', { service: service ? (currentLocale === 'ta' ? service.nameTA : service.name) : '' })} — Sympho Center</title>
</svelte:head>

{#if !authenticated}
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <h1 class="text-h2 text-text">Please login to apply</h1>
      <a href="/login" class="mt-4 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white">Login</a>
    </div>
  </div>
{:else if !service}
  <div class="flex min-h-[60vh] items-center justify-center">
    <p class="text-text-muted">Service not found</p>
  </div>
{:else if submitted}
  <!-- Success state -->
  <div class="flex min-h-[70vh] items-center justify-center bg-surface-secondary px-4">
    <div class="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-lg animate-fade-in">
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
        <Check class="h-8 w-8 text-success" />
      </div>
      <h1 class="text-h2 text-text">{t('apply.success.title')}</h1>
      <p class="mt-2 text-sm text-text-muted">{t('apply.success.message')}</p>
      <div class="mt-6 rounded-lg bg-surface p-4">
        <div class="text-xs text-text-muted">{t('apply.success.id')}</div>
        <div class="mt-1 text-xl font-bold text-primary font-mono">{applicationId}</div>
      </div>
      <div class="mt-6 flex flex-col gap-3">
        <a href="/applications" class="rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-light">
          {t('apply.success.track')}
        </a>
        <a href="/dashboard" class="rounded-lg border border-border py-3 text-sm font-medium text-text transition hover:bg-surface">
          {t('apply.success.dashboard')}
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <a href="/services/{slug}" class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition mb-2">
          <ArrowLeft class="h-4 w-4" /> {t('common.back')}
        </a>
        <h1 class="text-h2 text-text">
          {t('apply.title', { service: currentLocale === 'ta' ? service.nameTA : service.name })}
        </h1>
      </div>
    </div>

    <!-- Stepper (Redesigned as clean progress pills, no hyphens, no scrollbar) -->
    <div class="bg-white border-b border-slate-200 py-4 px-4 sm:px-6">
      <div class="mx-auto max-w-7xl">
        <div class="flex items-center justify-start gap-3 overflow-x-auto pb-1" style="scrollbar-width: none; -ms-overflow-style: none;">
          {#each steps as step, i}
            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold
                {i === currentStep 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs' 
                  : i < currentStep 
                    ? 'bg-emerald-50/40 border-emerald-100/50 text-slate-700' 
                    : 'bg-slate-50 border-slate-100 text-slate-400'}">
                <div class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shrink-0
                  {i === currentStep 
                    ? 'bg-emerald-600 text-white' 
                    : i < currentStep 
                      ? 'bg-emerald-500 text-white' 
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

    <!-- Form content -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div class="rounded-xl border border-border bg-white p-6 shadow-sm animate-fade-in">
        <!-- Step 0: Eligibility -->
        {#if currentStep === 0}
          <h2 class="text-h3 text-text mb-4">{t('service.eligibility')}</h2>
          <ul class="space-y-3 mb-6">
            {#each (currentLocale === 'ta' ? service.eligibilityTA : service.eligibility) as item}
              <li class="flex items-start gap-2 text-sm">
                <Check class="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span class="text-text-secondary">{item}</span>
              </li>
            {/each}
          </ul>
          <div class="rounded-lg bg-info-light/50 p-4 text-sm text-info-dark">
            <AlertCircle class="inline h-4 w-4 mr-1" />
            Please ensure you meet all eligibility criteria before proceeding.
          </div>

        <!-- Step 1: Personal Details -->
        {:else if currentStep === 1}
          <h2 class="text-h3 text-text mb-6">{t('apply.step.personal')}</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fullName" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.fullName')} *</label>
              <input id="fullName" type="text" bind:value={formData.fullName} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="fatherName" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.fatherName')} *</label>
              <input id="fatherName" type="text" bind:value={formData.fatherName} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="dateOfBirth" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.dob')} *</label>
              <input id="dateOfBirth" type="date" bind:value={formData.dateOfBirth} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="gender" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.gender')} *</label>
              <select id="gender" bind:value={formData.gender} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.phone')} *</label>
              <input id="phone" type="tel" bind:value={formData.phone} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.email')}</label>
              <input id="email" type="email" bind:value={formData.email} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label for="aadhaarLast4" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.aadhaar')}</label>
              <input id="aadhaarLast4" type="text" bind:value={formData.aadhaarLast4} maxlength="4" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>

        <!-- Step 2: Service Details (Address & specific) -->
        {:else if currentStep === 2}
          <h2 class="text-h3 text-text mb-6">{t('apply.step.service')}</h2>
          {#if service.slug === 'e-adangal-extract'}
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="adangalDistrict" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.district')} *</label>
                <select id="adangalDistrict" bind:value={formData.district} required class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary">
                  <option value="">Select District</option>
                  <option value="chennai">Chennai</option>
                  <option value="coimbatore">Coimbatore</option>
                  <option value="madurai">Madurai</option>
                  <option value="thanjavur">Thanjavur</option>
                  <option value="tiruchirappalli">Tiruchirappalli</option>
                </select>
              </div>
              <div>
                <label for="adangalTaluk" class="block text-sm font-medium text-text mb-1.5">Taluk</label>
                <input id="adangalTaluk" type="text" bind:value={formData.taluk} placeholder="e.g. Mambalam" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="adangalVillage" class="block text-sm font-medium text-text mb-1.5">Village</label>
                <input id="adangalVillage" type="text" bind:value={formData.village} placeholder="e.g. Kodambakkam" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label for="adangalSurveyNumber" class="block text-sm font-medium text-text mb-1.5">Survey Number / Sub-division *</label>
                <input id="adangalSurveyNumber" type="text" bind:value={formData.surveyNumber} required placeholder="e.g. 142/3A" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          {:else}
            <div class="grid gap-4 sm:grid-cols-2">
              {#if service.slug === 'income-certificate'}
                <div>
                  <label for="annualIncome" class="block text-sm font-medium text-text mb-1.5">Annual Family Income (₹) *</label>
                  <input id="annualIncome" type="number" bind:value={formData.annualIncome} required placeholder="e.g. 120000" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="occupation" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.occupation')} *</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} required placeholder="e.g. Farmer / Business" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div class="sm:col-span-2">
                  <label for="purpose" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.purpose')}</label>
                  <input id="purpose" type="text" bind:value={formData.purpose} placeholder="e.g. Scholarship / Higher Education" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {:else if service.slug === 'community-certificate'}
                <div>
                  <label for="religion" class="block text-sm font-medium text-text mb-1.5">Religion *</label>
                  <input id="religion" type="text" bind:value={formData.religion} required placeholder="e.g. Hinduism / Islam / Christianity" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="communityCategory" class="block text-sm font-medium text-text mb-1.5">Community Category *</label>
                  <select id="communityCategory" bind:value={formData.communityCategory} required class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary">
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
                  <label for="subCaste" class="block text-sm font-medium text-text mb-1.5">Sub-Caste Name *</label>
                  <input id="subCaste" type="text" bind:value={formData.subCaste} required placeholder="e.g. Kongu Vellalar / Kallar" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {:else if service.slug === 'nativity-certificate'}
                <div>
                  <label for="placeOfBirth" class="block text-sm font-medium text-text mb-1.5">Place of Birth *</label>
                  <input id="placeOfBirth" type="text" bind:value={formData.placeOfBirth} required placeholder="e.g. Madurai" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="residenceDurationYears" class="block text-sm font-medium text-text mb-1.5">Duration of Residence in Tamil Nadu (in Years) *</label>
                  <input id="residenceDurationYears" type="number" bind:value={formData.residenceDurationYears} required placeholder="e.g. 15" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div class="sm:col-span-2">
                  <label for="purpose" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.purpose')}</label>
                  <input id="purpose" type="text" bind:value={formData.purpose} placeholder="e.g. Government Job / Education" class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {:else}
                <div>
                  <label for="doorNo" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.doorNo')}</label>
                  <input id="doorNo" type="text" bind:value={formData.doorNo} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="street" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.street')}</label>
                  <input id="street" type="text" bind:value={formData.street} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="area" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.area')}</label>
                  <input id="area" type="text" bind:value={formData.area} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="district" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.district')} *</label>
                  <input id="district" type="text" bind:value={formData.district} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="taluk" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.taluk')}</label>
                  <input id="taluk" type="text" bind:value={formData.taluk} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="pincode" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.pincode')} *</label>
                  <input id="pincode" type="text" bind:value={formData.pincode} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="occupation" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.occupation')}</label>
                  <input id="occupation" type="text" bind:value={formData.occupation} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label for="purpose" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.purpose')}</label>
                  <input id="purpose" type="text" bind:value={formData.purpose} class="w-full rounded-lg border border-border py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              {/if}
            </div>
          {/if}

        <!-- Step 3: Documents -->
        {:else if currentStep === 3}
          <h2 class="text-h3 text-text mb-2">{t('apply.step.documents')}</h2>
          <p class="text-sm text-text-muted mb-6">Upload the required documents or fetch from DigiLocker.</p>
          <div class="space-y-4">
            {#each service.requiredDocuments as doc}
              <div class="rounded-lg border border-border p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <FileText class="h-5 w-5 text-primary" />
                    <span class="text-sm font-medium text-text">{currentLocale === 'ta' ? doc.nameTA : doc.name}</span>
                  </div>
                  <span class="text-xs font-medium {doc.mandatory ? 'text-error' : 'text-text-muted'}">
                    {doc.mandatory ? t('common.required') : t('common.optional')}
                  </span>
                </div>
                {#if uploadedDocs[doc.id]}
                  <div class="flex items-center gap-2 rounded-lg bg-success-light p-3 text-sm text-success-dark">
                    <Check class="h-4 w-4" />
                    {uploadedDocs[doc.id].name}
                  </div>
                {:else}
                  <div class="flex gap-2">
                    <label class="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-text-muted cursor-pointer hover:border-primary hover:text-primary transition">
                      <Upload class="h-4 w-4" />
                      Upload file
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" onchange={(e) => handleFileUpload(doc.id, e)} />
                    </label>
                    {#if doc.digilockerAvailable}
                      <button
                        onclick={() => { uploadedDocs[doc.id] = { name: `${doc.name} (DigiLocker)`, size: 250000 }; }}
                        class="rounded-lg border border-info bg-info-light px-4 py-2 text-xs font-medium text-info-dark hover:bg-info/10 transition"
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
          <h2 class="text-h3 text-text mb-6">{t('apply.step.review')}</h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-surface p-4">
              <h3 class="text-sm font-semibold text-text mb-3">
                {service.slug === 'e-adangal-extract' ? 'Land Cultivation Details' : t('apply.step.personal')}
              </h3>
              {#if service.slug === 'e-adangal-extract'}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt class="text-text-muted">Applicant Name</dt><dd class="text-text font-medium">{formData.fullName || '—'}</dd>
                  <dt class="text-text-muted">District</dt><dd class="text-text font-medium capitalize">{formData.district || '—'}</dd>
                  <dt class="text-text-muted">Taluk</dt><dd class="text-text font-medium">{formData.taluk || '—'}</dd>
                  <dt class="text-text-muted">Village</dt><dd class="text-text font-medium">{formData.village || '—'}</dd>
                  <dt class="text-text-muted">Survey Number</dt><dd class="text-text font-medium">{formData.surveyNumber || '—'}</dd>
                </dl>
              {:else}
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt class="text-text-muted">{t('apply.field.fullName')}</dt><dd class="text-text font-medium">{formData.fullName || '—'}</dd>
                  
                  {#if service.slug === 'income-certificate'}
                    <dt class="text-text-muted">Annual Family Income</dt><dd class="text-text font-medium">₹{formData.annualIncome || '—'}</dd>
                    <dt class="text-text-muted">Occupation</dt><dd class="text-text font-medium">{formData.occupation || '—'}</dd>
                    <dt class="text-text-muted">Purpose</dt><dd class="text-text font-medium">{formData.purpose || '—'}</dd>
                  {:else}
                    <dt class="text-text-muted">{t('apply.field.fatherName')}</dt><dd class="text-text font-medium">{formData.fatherName || '—'}</dd>
                    <dt class="text-text-muted">{t('apply.field.dob')}</dt><dd class="text-text font-medium">{formData.dateOfBirth || '—'}</dd>
                    <dt class="text-text-muted">{t('apply.field.gender')}</dt><dd class="text-text font-medium">{formData.gender || '—'}</dd>
                    <dt class="text-text-muted">{t('apply.field.phone')}</dt><dd class="text-text font-medium">{formData.phone || '—'}</dd>
                  {/if}

                  {#if service.slug === 'community-certificate'}
                    <dt class="text-text-muted">Religion</dt><dd class="text-text font-medium">{formData.religion || '—'}</dd>
                    <dt class="text-text-muted">Community Category</dt><dd class="text-text font-medium">{formData.communityCategory || '—'}</dd>
                    <dt class="text-text-muted">Sub-Caste Name</dt><dd class="text-text font-medium">{formData.subCaste || '—'}</dd>
                  {/if}

                  {#if service.slug === 'nativity-certificate'}
                    <dt class="text-text-muted">Place of Birth</dt><dd class="text-text font-medium">{formData.placeOfBirth || '—'}</dd>
                    <dt class="text-text-muted">Duration of Residence</dt><dd class="text-text font-medium">{formData.residenceDurationYears || '—'} Years</dd>
                    <dt class="text-text-muted">Purpose</dt><dd class="text-text font-medium">{formData.purpose || '—'}</dd>
                  {/if}
                </dl>
              {/if}
            </div>
            <div class="rounded-lg bg-surface p-4">
              <h3 class="text-sm font-semibold text-text mb-3">{t('apply.step.documents')}</h3>
              {#each service.requiredDocuments as doc}
                <div class="flex items-center justify-between py-1.5 text-sm">
                  <span class="text-text-muted">{currentLocale === 'ta' ? doc.nameTA : doc.name}</span>
                  <span class="font-medium {uploadedDocs[doc.id] ? 'text-success' : 'text-error'}">
                    {uploadedDocs[doc.id] ? '✓ Uploaded' : '✗ Missing'}
                  </span>
                </div>
              {/each}
            </div>
          </div>

        <!-- Step 5: Declaration -->
        {:else if currentStep === 5}
          <h2 class="text-h3 text-text mb-6">{t('apply.step.declaration')}</h2>
          <div class="rounded-lg border border-border p-6 text-sm text-text-secondary leading-relaxed mb-6">
            {t('apply.declaration.text')}
          </div>
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={declarationAgreed} class="mt-1 h-4 w-4 rounded border-border text-primary" />
            <span class="text-sm font-medium text-text">{t('apply.declaration.agree')}</span>
          </label>
        {/if}
      </div>

      {#if stepError}
        <div class="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-bold text-rose-800 flex items-center gap-2.5 shadow-xs">
          <AlertCircle class="h-4 w-4 text-rose-600 shrink-0" />
          <span>{stepError}</span>
        </div>
      {/if}

      <!-- Navigation buttons -->
      <div class="mt-6 flex items-center justify-between">
        <button
          onclick={prevStep}
          disabled={currentStep === 0}
          class="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text transition hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft class="h-4 w-4" />
          {t('apply.previous')}
        </button>

        <div class="flex items-center gap-3">
          {#if currentStep < steps.length - 1}
            <button
              onclick={nextStep}
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              {t('apply.next')}
              <ArrowRight class="h-4 w-4" />
            </button>
          {:else}
            <button
              onclick={submitApplication}
              disabled={!declarationAgreed || isSubmitting}
              class="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-success-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check class="h-4 w-4" />
              {isSubmitting ? t('common.loading') : t('apply.confirm')}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
