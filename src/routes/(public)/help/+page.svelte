<script>

  import { HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, FileText, ShieldCheck, Scale, AlertTriangle } from '@lucide/svelte';
  
const t = $derived($tt);
import { tt } from '$lib/i18n';
  import { onMount } from 'svelte';

let openFaq = $state(null);
let activeTab = $state('faq');
// Auto-switch to policies tab if hash is #policies
onMount(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#policies') {
        activeTab = 'policies';
    }
});
// Question submission
let questionName = $state('');
let questionEmail = $state('');
let questionText = $state('');
let questionSubmitted = $state(false);
let submitting = $state(false);
let questionError = $state('');
async function handleQuestionSubmit() {
    if (!questionText.trim() || !questionName.trim() || !questionEmail.trim() || submitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(questionEmail.trim())) {
        questionError = t('apply.validation.emailInvalid');
        return;
    }
    
    submitting = true;
    questionError = '';
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: questionName.trim(), 
                email: questionEmail.trim(), 
                message: questionText.trim(), 
                source: 'help_desk' 
            })
        });
        const body = await response.json().catch(() => null);
        
        if (response.ok) {
            questionSubmitted = true;
            questionName = '';
            questionEmail = '';
            questionText = '';
        }
        else {
            throw new Error(body?.error ?? t('errors.submitQuestion'));
        }
    } catch (error) {
        console.error('Error submitting help request:', error);
        questionError = error instanceof Error ? error.message : t('errors.submitQuestion');
    } finally {
        submitting = false;
    }
}
const faqs = [
    {
        q: 'What is TN Kuviyam?',
        a: 'TN Kuviyam is Tamil Nadu\'s unified citizen service portal integrating government services, DigiLocker document vaults, grievance redressal, and e-Adangal land extracts into one seamless digital platform.'
    },
    {
        q: 'How do I track my submitted application?',
        a: 'Click "Track Application" in the main navigation menu or visit your Citizen Dashboard. You will need to log in to view real-time officer workflow steps and status updates.'
    },
    {
        q: 'Where do I fetch my e-Adangal extract?',
        a: 'Navigate to "Services > e-Adangal Extract" from the main header. Enter your district, taluk, village, and survey number to view and download your signed crop extract.'
    },
    {
        q: 'Is there any fee for submitting applications?',
        a: 'Most revenue and certificate services (Income, Community, Nativity) on TN Kuviyam are completely free of government fees. Some services like Transport or Licences may have nominal fees displayed on the service detail page.'
    },
    {
        q: 'How do I create an account on TN Kuviyam?',
        a: 'Click the "Login" button on the top right corner, then select "Create Account". You can register using your email address, mobile number, or link an existing Google account. Aadhaar-based verification may be used for enhanced services.'
    },
    {
        q: 'What documents are needed for an Income Certificate?',
        a: 'You typically need proof of identity (Aadhaar/Voter ID), proof of residence, and income proof (salary slips, bank statements, or self-declaration). Check the full document checklist on the Income Certificate service page.'
    },
    {
        q: 'How long does it take to process applications?',
        a: 'Processing times vary by service. Most certificates (Income, Community, Nativity) are processed within 3-7 working days. Complex services like land records or licences may take 15-30 working days. Each service page displays its estimated SLA.'
    },
    {
        q: 'Can I apply on behalf of a family member?',
        a: 'Yes. You can visit an authorized Kiosk Center where an operator will assist you. Alternatively, you can use the citizen portal with proper authorization documents for your family member.'
    },
    {
        q: 'What is DigiLocker integration?',
        a: 'DigiLocker is a Government of India initiative that provides a digital document wallet. When connected to TN Kuviyam, you can directly fetch verified certificates without re-uploading physical documents.'
    },
    {
        q: 'How do I file a grievance or complaint?',
        a: 'Log in to your account and navigate to "Grievances / Complaints" from the Help dropdown menu. Fill in the complaint form with details, attach relevant documents, and submit. You\'ll receive a tracking number to monitor resolution progress.'
    },
    {
        q: 'What if my application is rejected?',
        a: 'If your application is rejected, you will receive a notification with the specific reason. You can address the issue (e.g., upload missing documents, correct information) and resubmit. If you disagree with the decision, you can file a grievance.'
    },
    {
        q: 'Is TN Kuviyam available in Tamil?',
        a: 'Yes. TN Kuviyam fully supports both Tamil (தமிழ்) and English. You can switch languages at any time using the language toggle button in the header. All forms, notifications, and service information are available in both languages.'
    },
    {
        q: 'Which departments are connected to TN Kuviyam?',
        a: 'TN Kuviyam connects services from Revenue, Civil Supplies, Transport, Health, Education, Social Welfare, Labour, Agriculture, Local Government, and more. The full list is available on the Services page filtered by department.'
    },
    {
        q: 'How secure is my personal data on TN Kuviyam?',
        a: 'TN Kuviyam uses Firebase Authentication with encrypted sessions, server-side role-based authorization, and Firestore security rules. Your personal data is only accessible to you and authorized government officers processing your application.'
    },
    {
        q: 'Can I download approved certificates digitally?',
        a: 'Yes. Once your application is approved and the certificate is issued, you can download the digitally signed certificate from your Citizen Dashboard under "Completed Applications". The certificate is also available through DigiLocker if connected.'
    }
];
const policies = [
    {
        title: 'Privacy Policy',
        icon: ShieldCheck,
        desc: 'Your personal data is collected solely for government service delivery. We follow IT Act 2000, DPDP Act 2023, and Government of Tamil Nadu data governance guidelines. Data is encrypted in transit and at rest.'
    },
    {
        title: 'Terms of Service',
        icon: Scale,
        desc: 'By using TN Kuviyam, you agree to provide accurate information for government service applications. Misrepresentation may result in application rejection and legal action under applicable Indian Penal Code provisions.'
    },
    {
        title: 'Grievance Redressal Policy',
        icon: AlertTriangle,
        desc: 'Citizens may file grievances for service delays, incorrect rejections, or officer misconduct. All grievances are acknowledged within 24 hours and resolved within the prescribed SLA (typically 7-15 working days).'
    },
    {
        title: 'Accessibility Statement',
        icon: FileText,
        desc: 'TN Kuviyam is designed to meet WCAG 2.1 AA accessibility standards. We support screen readers, keyboard navigation, high-contrast modes, and bilingual Tamil/English content to ensure inclusive access.'
    }
];
</script>

<svelte:head>
  <title>{t('help.title')}</title>
</svelte:head>

<div class="bg-background min-h-screen pb-16 text-text">
  <!-- Hero Banner -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-bold tracking-tight leading-tight">{t('help.heading')}</h1>
      <p class="public-banner-subtitle mt-2 max-w-2xl text-sm leading-relaxed">{t('help.subheading')}</p>
    </div>
  </div>

  <!-- Tab Switcher -->
  <div class="mx-auto max-w-4xl px-4 sm:px-6 pt-8">
    <div class="flex gap-2 border-b border-border pb-0">
      <button
        onclick={() => activeTab = 'faq'}
        class="px-5 py-3 text-sm font-bold rounded-t-xl transition-colors border-b-2 {activeTab === 'faq'
          ? 'border-primary text-primary bg-primary-soft'
          : 'border-transparent text-text-muted hover:text-text hover:bg-muted'}"
      >
        <span class="flex items-center gap-2">
          <HelpCircle class="h-4 w-4" />
          {t('service.faq')}
        </span>
      </button>
      <button
        id="policies"
        onclick={() => activeTab = 'policies'}
        class="px-5 py-3 text-sm font-bold rounded-t-xl transition-colors border-b-2 {activeTab === 'policies'
          ? 'border-primary text-primary bg-primary-soft'
          : 'border-transparent text-text-muted hover:text-text hover:bg-muted'}"
      >
        <span class="flex items-center gap-2">
          <FileText class="h-4 w-4" />
          {t('ui.routes.public.help.3f695d87')}
        </span>
      </button>
    </div>
  </div>

  <!-- FAQ Tab -->
  {#if activeTab === 'faq'}
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <!-- FAQ Count -->
      <p class="mb-5 text-xs font-bold uppercase tracking-wider text-text-faint">{faqs.length} Frequently Asked Questions</p>

      <div class="space-y-3">
        {#each faqs as faq, i}
          <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
            <button
              onclick={() => openFaq = openFaq === i ? null : i}
              class="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-text transition hover:bg-muted"
            >
              <span class="flex items-center gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-extrabold text-primary">{i + 1}</span>
                <span>{faq.q}</span>
              </span>
              {#if openFaq === i}<ChevronUp class="h-4 w-4 shrink-0 text-primary" />{:else}<ChevronDown class="h-4 w-4 shrink-0 text-text-faint" />{/if}
            </button>
            {#if openFaq === i}
              <div class="animate-fade-in border-t border-border bg-surface-container p-5 text-sm leading-relaxed text-text-muted">
                {faq.a}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Ask a Question Section -->
      <div class="mt-12 rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Send class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">{t('ui.routes.public.help.851c0814')}</h2>
            <p class="text-xs text-text-muted">{t('ui.routes.public.help.c6df057e')}</p>
          </div>
        </div>

        {#if questionSubmitted}
          <div class="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CheckCircle2 class="h-8 w-8" />
            </div>
            <h3 class="text-lg font-bold text-text">{t('ui.routes.public.help.79f70270')}</h3>
            <p class="mt-2 max-w-md text-sm text-text-muted">{t('ui.routes.public.help.710ad697')}</p>
            <button
              onclick={() => questionSubmitted = false}
              class="mt-6 text-sm font-bold text-primary transition hover:text-primary-hover"
            >
              {t('ui.ask.another.question')}
            </button>
          </div>
        {:else}
          <form onsubmit={(e) => { e.preventDefault(); handleQuestionSubmit(); }} class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="q-name" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.public.help.12a90bc6')}</label>
                <input
                  id="q-name"
                  type="text"
                  bind:value={questionName}
                  required
                  placeholder={t('ui.enter.your.name')}
                  class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label for="q-email" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.public.help.11fbc7e7')}</label>
                <input
                  id="q-email"
                  type="email"
                  bind:value={questionEmail}
                  required
                  placeholder={t('ui.your.email.com')}
                  class="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>
            <div>
              <label for="q-text" class="mb-1.5 block text-xs font-bold text-text">{t('ui.routes.public.help.95c56eb0')}</label>
              <textarea
                id="q-text"
                bind:value={questionText}
                required
                rows={4}
                placeholder={t('ui.describe.your.question.about.tn.kuviyam.services.processes.or.documents')}
                class="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
              ></textarea>
            </div>
            {#if questionError}
              <p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{questionError}</p>
            {/if}
            <div class="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !questionText.trim() || !questionName.trim() || !questionEmail.trim()}
                class="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send class="h-4 w-4" />
                {submitting ? 'Sending...' : 'Submit to Help Desk'}
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Policies & Guidelines Tab -->
  {#if activeTab === 'policies'}
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p class="mb-5 text-xs font-bold uppercase tracking-wider text-text-faint">{t('ui.routes.public.help.3f695d87')}</p>

      <div class="grid gap-5 sm:grid-cols-2">
        {#each policies as policy}
          <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <policy.icon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="mb-2 text-sm font-bold text-text">{policy.title}</h3>
                <p class="text-xs leading-relaxed text-text-muted">{policy.desc}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Important Notices -->
      <div class="mt-8 rounded-2xl border border-warning/25 bg-warning-soft p-5">
        <div class="flex items-start gap-3">
          <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <h4 class="text-sm font-bold text-warning">{t('ui.routes.public.help.d849a8be')}</h4>
            <p class="mt-1 text-xs leading-relaxed text-warning">
              {t('ui.tn.kuviyam.is.a.hackathon.prototype.developed.for.the.buildwhatmovesindia.initia')}
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
