import sys
file_path = r'C:\Users\ARUL PRAKASH\Desktop\Projects\personal\Agri-Sphere-git\TN-HUB\src\routes\(public)\services\[slug]\apply\+page.svelte'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Basic imports and variables
change1_target = """  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { ArrowLeft, ArrowRight, Check, Upload, FileText, AlertCircle, Trash2 } from '@lucide/svelte';"""

change1_replace = """  import { currentUser, isAuthenticated } from '$lib/stores/auth';
  import { getFirebaseAuth } from '$lib/firebase/client';
  import { ArrowLeft, ArrowRight, Check, Upload, FileText, AlertCircle, Trash2 } from '@lucide/svelte';"""

content = content.replace(change1_target, change1_replace)

# Change 2: Variables
change2_target = """  let activeTrackingId = $state('');
  let isRazorpayReady = $state(false);

  const requiresPayment = $derived(Boolean(env.PUBLIC_RAZORPAY_KEY_ID));"""

change2_replace = """  let activeTrackingId = $state('');
  let isRazorpayReady = $state(false);
  let phoneVerified = $state(false);
  let verifiedPhoneNumber = $state('');
  let otpConfirmationResult = $state<any>(null);
  let otpLoading = $state(false);

  const requiresPayment = $derived(Boolean(env.PUBLIC_RAZORPAY_KEY_ID));"""

content = content.replace(change2_target, change2_replace)

# Change 3: onMount sessionStorage logic
change3_target = """    if (draftApplication) {
      activeDraftId = draftApplication.id;
      activeTrackingId = draftApplication.applicationNumber;
      applicationId = draftApplication.applicationNumber;
      formData = { ...draftApplication.formData };
      declarationAgreed = true;
      if (formData.phone) phoneVerified = true;
      
      const requestedStep = Number($page.url.searchParams.get('step'));
      if (requestedStep) {
        currentStep = requestedStep;
      } else if (formData.lastStep) {
        currentStep = Number(formData.lastStep);
      }

      const nextUploadedDocs: Record<string, { name: string; size: number; file?: File; id?: string }> = {};
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
    } else if (draftApplication) {
      currentStep = steps.length - 1;
    }"""

change3_replace = """    if (draftApplication) {
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
        const nextUploadedDocs: Record<string, { name: string; size: number; file?: File; id?: string }> = {};
        for (const doc of draftApplication.documents ?? []) {
            nextUploadedDocs[doc.documentId] = {
                id: doc.id,
                name: doc.fileName || doc.name,
                size: doc.fileSize
            };
        }
        uploadedDocs = nextUploadedDocs;
    } else {
        const savedDraft = sessionStorage.getItem(`draft_${service?.id}`);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                formData = { ...formData, ...parsed };
                if (parsed.phoneVerified && parsed.phone) {
                    phoneVerified = true;
                    verifiedPhoneNumber = parsed.phone;
                }
                if (formData.lastStep && !Number($page.url.searchParams.get('step'))) {
                    currentStep = Number(formData.lastStep);
                }
            } catch (e) {
                console.error('Failed to parse saved draft', e);
            }
        }
    }
    const requestedStep = Number($page.url.searchParams.get('step') ?? '');
    if (Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep < steps.length) {
        currentStep = requestedStep;
    }
    else if (draftApplication) {
        currentStep = steps.length - 1;
    }"""

content = content.replace(change3_target, change3_replace)

# Change 4: payment checkout
change4_target = """  async function launchPaymentCheckout(draftId: string) {
    if (!window.Razorpay) {
      throw new Error('Payment gateway is not ready yet. Please try again.');
    }
    
    // We already have payment order details attached to draft from backend if it requires fee
    // But since this is a prototype, we'll create a mock success response if we don't have real order
    
    return new Promise<void>((resolve, reject) => {
      const options = {
        key: env.PUBLIC_RAZORPAY_KEY_ID,
        amount: payableAmount, 
        currency: 'INR',
        name: 'Sympho Center',
        description: service?.name,
        image: '/images/emblem-of-india.png',
        handler: function (response: any) {
          // In real app, we verify this response signature in backend
          resolve();
        },
        prefill: {
          name: formData.fullName || user?.name || '',
          email: formData.email || user?.email || '',
          contact: formData.phone || user?.phone || ''
        },
        theme: {
          color: '#071A28'
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment cancelled by user.'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        reject(new Error(response.error.description || 'Payment failed. Please try again.'));
      });
      rzp.open();
    });
  }"""

change4_replace = """  async function launchPaymentCheckout(draftId: string) {
    if (!window.Razorpay) {
      throw new Error('Payment gateway is not ready yet. Please try again.');
    }
    
    return new Promise<void>((resolve, reject) => {
      let paymentHandled = false;
      const options = {
        key: env.PUBLIC_RAZORPAY_KEY_ID,
        amount: payableAmount, 
        currency: 'INR',
        name: 'Sympho Center',
        description: service?.name,
        image: '/images/emblem-of-india.png',
        handler: function (response: any) {
          paymentHandled = true;
          resolve();
        },
        prefill: {
          name: formData.fullName || user?.name || '',
          email: formData.email || user?.email || '',
          contact: formData.phone || user?.phone || ''
        },
        theme: {
          color: '#071A28'
        },
        modal: {
          ondismiss: function() {
            if (!paymentHandled) {
              reject(new Error('Payment cancelled by user.'));
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        paymentHandled = true;
        reject(new Error(response.error.description || 'Payment failed. Please try again.'));
      });
      rzp.open();
    });
  }"""

content = content.replace(change4_target, change4_replace)

# Change 5: Phone auth functions and logic
change5_target = """  let phoneVerified = $state(false);
  let showOtpModal = $state(false);
  let otpInput = $state('');"""

change5_replace = """  let showOtpModal = $state(false);
  let otpInput = $state('');

  function handlePhoneInput() {
    const phone = formData.phone || '';
    if (phone !== verifiedPhoneNumber) {
        phoneVerified = false;
    }
  }

  async function sendOtp() {
      stepError = '';
      const phone = formData.phone || '';
      if (phone.length !== 10) {
          stepError = 'Enter a valid 10-digit number first.';
          return;
      }
      otpLoading = true;
      try {
          const [{ RecaptchaVerifier, signInWithPhoneNumber }, firebaseAuth] = await Promise.all([
              import('firebase/auth'),
              getFirebaseAuth()
          ]);
          
          if (!(window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                  'size': 'invisible',
                  'callback': () => {}
              });
          }
          
          const phoneNumber = `+91${phone}`;
          otpConfirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, (window as any).recaptchaVerifier);
          showOtpModal = true;
      } catch (cause) {
          stepError = cause instanceof Error ? cause.message : 'Unable to send OTP. Please try again.';
          if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
          }
      } finally {
          otpLoading = false;
      }
  }
  
  async function verifyOtp() {
      stepError = '';
      if (!otpInput || otpInput.length !== 6) {
          stepError = 'Please enter a valid 6-digit OTP.';
          return;
      }
      
      otpLoading = true;
      try {
          if (otpConfirmationResult) {
              await otpConfirmationResult.confirm(otpInput);
              phoneVerified = true;
              verifiedPhoneNumber = formData.phone || '';
              showOtpModal = false;
          } else {
             // Mock fallback for prototyping if Firebase is not fully setup
             if (otpInput === '123456') {
                 phoneVerified = true;
                 verifiedPhoneNumber = formData.phone || '';
                 showOtpModal = false;
             } else {
                 stepError = 'Invalid OTP.';
             }
          }
      } catch (cause) {
          stepError = cause instanceof Error ? cause.message : 'Invalid OTP.';
      } finally {
          otpLoading = false;
      }
  }"""

content = content.replace(change5_target, change5_replace)

# Change 6: nextStep session storage
change6_target = """  async function nextStep() {
    if (!validateCurrentStep()) return;
    
    // Auto-save the draft before moving to next step
    if (authenticated && currentStep > 0) {
      formData.lastStep = currentStep + 1;
      await saveDraft(false);
    }
    
    if (currentStep < steps.length - 1) currentStep++;
  }"""

change6_replace = """  async function nextStep() {
    if (!validateCurrentStep()) return;
    
    if (authenticated && currentStep > 0) {
      formData.lastStep = currentStep + 1;
      const draftData = {
          ...formData,
          phoneVerified,
          phone: formData.phone || ''
      };
      sessionStorage.setItem(`draft_${service?.id}`, JSON.stringify(draftData));
    }
    
    if (currentStep < steps.length - 1) currentStep++;
  }"""

content = content.replace(change6_target, change6_replace)

# Change 7: Phone input element
change7_target = """            <div>
              <label for="phone" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.phone')} *</label>
              <div class="flex gap-2">
                <input id="phone" type="tel" inputmode="numeric" maxlength="10" bind:value={formData.phone} disabled={phoneVerified} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:bg-surface-secondary" />
                {#if phoneVerified}
                  <div class="flex h-[42px] px-4 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <Check class="h-4 w-4 mr-1 shrink-0" /> <span class="text-xs font-bold uppercase">Verified</span>
                  </div>
                {:else}
                  <button type="button" onclick={() => { if (formData.phone?.length === 10) { showOtpModal = true; stepError = ''; } else stepError = 'Enter a valid 10-digit number first.'; }} class="h-[42px] px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light disabled:opacity-50 transition shrink-0">Verify</button>
                {/if}
              </div>
            </div>"""

change7_replace = """            <div>
              <label for="phone" class="block text-sm font-medium text-text mb-1.5">{t('apply.field.phone')} *</label>
              <div class="flex gap-2">
                <input id="phone" type="tel" inputmode="numeric" maxlength="10" bind:value={formData.phone} oninput={handlePhoneInput} class="w-full rounded-lg border border-border bg-surface dark:bg-surface-container-highest dark:text-text py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                {#if phoneVerified}
                  <div class="flex h-[42px] px-4 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <Check class="h-4 w-4 mr-1 shrink-0" /> <span class="text-xs font-bold uppercase">Verified</span>
                  </div>
                {:else}
                  <button type="button" onclick={sendOtp} disabled={otpLoading} class="h-[42px] px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light disabled:opacity-50 transition shrink-0">
                    {#if otpLoading}
                      <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></span>
                    {/if}
                    Verify
                  </button>
                  <div id="recaptcha-container"></div>
                {/if}
              </div>
            </div>"""

content = content.replace(change7_target, change7_replace)

# Change 8: verify OTP button
change8_target = """            <button type="button" onclick={() => { if (otpInput === '123456') { phoneVerified = true; showOtpModal = false; } else stepError = 'Invalid OTP. Try 123456 for demo.'; }} class="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light">
              Verify
            </button>"""

change8_replace = """            <button type="button" onclick={verifyOtp} disabled={otpLoading} class="w-full flex justify-center items-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light disabled:opacity-50">
              {#if otpLoading}
                <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
              {/if}
              Verify
            </button>"""

content = content.replace(change8_target, change8_replace)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patch applied.')
