<script lang="ts">
  import { HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, FileText, ShieldCheck, Scale, AlertTriangle } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import { onMount } from 'svelte';

  let openFaq = $state<number | null>(null);
  let activeTab = $state<'faq' | 'policies'>('faq');

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

  function handleQuestionSubmit() {
    if (!questionText.trim() || !questionName.trim()) return;
    submitting = true;
    // Simulate submission to help desk
    setTimeout(() => {
      submitting = false;
      questionSubmitted = true;
      questionName = '';
      questionEmail = '';
      questionText = '';
    }, 1200);
  }

  const faqs = [
    {
      q: 'What is TN Hub?',
      a: 'TN Hub is Tamil Nadu\'s unified citizen service portal integrating government services, DigiLocker document vaults, grievance redressal, and e-Adangal land extracts into one seamless digital platform.'
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
      a: 'Most revenue and certificate services (Income, Community, Nativity) on TN Hub are completely free of government fees. Some services like Transport or Licences may have nominal fees displayed on the service detail page.'
    },
    {
      q: 'How do I create an account on TN Hub?',
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
      a: 'Yes. You can visit an e-Sevai Common Service Center where an authorized operator will assist you. Alternatively, you can use the citizen portal with proper authorization documents for your family member.'
    },
    {
      q: 'What is DigiLocker integration?',
      a: 'DigiLocker is a Government of India initiative that provides a digital document wallet. When connected to TN Hub, you can directly fetch verified certificates without re-uploading physical documents.'
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
      q: 'Is TN Hub available in Tamil?',
      a: 'Yes. TN Hub fully supports both Tamil (தமிழ்) and English. You can switch languages at any time using the language toggle button in the header. All forms, notifications, and service information are available in both languages.'
    },
    {
      q: 'Which departments are connected to TN Hub?',
      a: 'TN Hub connects services from Revenue, Civil Supplies, Transport, Health, Education, Social Welfare, Labour, Agriculture, Local Government, and more. The full list is available on the Services page filtered by department.'
    },
    {
      q: 'How secure is my personal data on TN Hub?',
      a: 'TN Hub uses Firebase Authentication with encrypted sessions, server-side role-based authorization, and Firestore security rules. Your personal data is only accessible to you and authorized government officers processing your application.'
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
      desc: 'By using TN Hub, you agree to provide accurate information for government service applications. Misrepresentation may result in application rejection and legal action under applicable Indian Penal Code provisions.'
    },
    {
      title: 'Grievance Redressal Policy',
      icon: AlertTriangle,
      desc: 'Citizens may file grievances for service delays, incorrect rejections, or officer misconduct. All grievances are acknowledged within 24 hours and resolved within the prescribed SLA (typically 7-15 working days).'
    },
    {
      title: 'Accessibility Statement',
      icon: FileText,
      desc: 'TN Hub is designed to meet WCAG 2.1 AA accessibility standards. We support screen readers, keyboard navigation, high-contrast modes, and bilingual Tamil/English content to ensure inclusive access.'
    }
  ];
</script>

<svelte:head>
  <title>{t('help.title')}</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-16">
  <!-- Hero -->
  <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-emerald-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{t('help.heading')}</h1>
      <p class="mt-3 text-base text-emerald-200/80 max-w-2xl leading-relaxed">{t('help.subheading')}</p>
    </div>
  </div>

  <!-- Tab Switcher -->
  <div class="mx-auto max-w-4xl px-4 sm:px-6 pt-8">
    <div class="flex gap-2 border-b border-slate-200 pb-0">
      <button
        onclick={() => activeTab = 'faq'}
        class="px-5 py-3 text-sm font-bold rounded-t-xl transition-colors border-b-2 {activeTab === 'faq'
          ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}"
      >
        <span class="flex items-center gap-2">
          <HelpCircle class="h-4 w-4" />
          Frequently Asked Questions
        </span>
      </button>
      <button
        id="policies"
        onclick={() => activeTab = 'policies'}
        class="px-5 py-3 text-sm font-bold rounded-t-xl transition-colors border-b-2 {activeTab === 'policies'
          ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}"
      >
        <span class="flex items-center gap-2">
          <FileText class="h-4 w-4" />
          Policies & Guidelines
        </span>
      </button>
    </div>
  </div>

  <!-- FAQ Tab -->
  {#if activeTab === 'faq'}
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <!-- FAQ Count -->
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">{faqs.length} Frequently Asked Questions</p>

      <div class="space-y-3">
        {#each faqs as faq, i}
          <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onclick={() => openFaq = openFaq === i ? null : i}
              class="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-primary-950 hover:bg-slate-50 transition gap-4"
            >
              <span class="flex items-center gap-3">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold shrink-0">{i + 1}</span>
                <span>{faq.q}</span>
              </span>
              {#if openFaq === i}<ChevronUp class="h-4 w-4 text-emerald-600 shrink-0" />{:else}<ChevronDown class="h-4 w-4 text-slate-400 shrink-0" />{/if}
            </button>
            {#if openFaq === i}
              <div class="border-t border-slate-200 bg-emerald-50/40 p-5 text-sm text-slate-600 leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Ask a Question Section -->
      <div class="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Send class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Didn't find your answer?</h2>
            <p class="text-xs text-slate-500">Send your question to the TN Hub Help Desk. We'll respond within 24 hours.</p>
          </div>
        </div>

        {#if questionSubmitted}
          <div class="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 class="h-8 w-8" />
            </div>
            <h3 class="text-lg font-bold text-slate-900">Question Submitted!</h3>
            <p class="text-sm text-slate-500 mt-2 max-w-md">Your question has been sent to the TN Hub Help Desk. You will receive a response via email within 24 working hours.</p>
            <button
              onclick={() => questionSubmitted = false}
              class="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
            >
              Ask Another Question
            </button>
          </div>
        {:else}
          <form onsubmit={(e) => { e.preventDefault(); handleQuestionSubmit(); }} class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="q-name" class="block text-xs font-bold text-slate-700 mb-1.5">Your Name *</label>
                <input
                  id="q-name"
                  type="text"
                  bind:value={questionName}
                  required
                  placeholder="Enter your name"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
              <div>
                <label for="q-email" class="block text-xs font-bold text-slate-700 mb-1.5">Email Address (Optional)</label>
                <input
                  id="q-email"
                  type="email"
                  bind:value={questionEmail}
                  placeholder="your@email.com"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label for="q-text" class="block text-xs font-bold text-slate-700 mb-1.5">Your Question *</label>
              <textarea
                id="q-text"
                bind:value={questionText}
                required
                rows={4}
                placeholder="Describe your question about TN Hub services, processes, or documents..."
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
              ></textarea>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !questionText.trim() || !questionName.trim()}
                class="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Policies & Guidelines</p>

      <div class="grid gap-5 sm:grid-cols-2">
        {#each policies as policy}
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
                <policy.icon class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-2">{policy.title}</h3>
                <p class="text-xs text-slate-500 leading-relaxed">{policy.desc}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Important Notices -->
      <div class="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-5">
        <div class="flex items-start gap-3">
          <AlertTriangle class="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 class="text-sm font-bold text-amber-800">Important Notice</h4>
            <p class="text-xs text-amber-700 leading-relaxed mt-1">
              TN Hub is a hackathon prototype developed for the BuildWhatMovesIndia initiative. 
              The policies listed above represent the intended governance framework. Actual government 
              service policies are governed by the Government of Tamil Nadu and relevant departments.
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
