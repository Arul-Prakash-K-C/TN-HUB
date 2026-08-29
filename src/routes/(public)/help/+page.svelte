<script>
  import { HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, FileText, ShieldCheck, Scale, AlertTriangle } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';
  import { onMount } from 'svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

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
      } else {
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
      qTA: 'டிஎன் குவியம் என்றால் என்ன?',
      a: 'TN Kuviyam is Tamil Nadu\'s unified citizen service portal integrating government services, DigiLocker document vaults, grievance redressal, and e-Adangal land extracts into one seamless digital platform.',
      aTA: 'டிஎன் குவியம் என்பது அரசு சேவைகள், டிஜிலாக்கர் ஆவண பெட்டகம், குறைதீர்ப்பு மற்றும் இ-அடங்கல் நில சாறுகளை ஒரே தளத்தில் ஒருங்கிணைக்கும் தமிழ்நாட்டின் ஒருங்கிணைந்த குடிமக்கள் சேவை போர்டல் ஆகும்.'
    },
    {
      q: 'How do I track my submitted application?',
      qTA: 'சமர்ப்பிக்கப்பட்ட விண்ணப்பத்தை எவ்வாறு கண்காணிப்பது?',
      a: 'Click "Track Application" in the main navigation menu or visit your Citizen Dashboard. You will need to log in to view real-time officer workflow steps and status updates.',
      aTA: 'முதன்மை வழிசெலுத்தல் மெனுவில் "விண்ணப்பத்தைக் கண்காணி" என்பதைக் கிளிக் செய்யவும் அல்லது உங்கள் குடிமகன் கட்டுப்பாட்டு அறைக்குச் செல்லவும். நிகழ்நேர பணிப்பாய்வு படிகள் மற்றும் நிலை புதுப்பிப்புகளைக் காண உள்நுழையவும்.'
    },
    {
      q: 'Where do I fetch my e-Adangal extract?',
      qTA: 'எனது இ-அடங்கல் சாற்றை எங்கிருந்து பெறுவது?',
      a: 'Navigate to "Services > e-Adangal Extract" from the main header. Enter your district, taluk, village, and survey number to view and download your signed crop extract.',
      aTA: 'முதன்மை தலைப்பிலிருந்து "சேவைகள் > இ-அடங்கல் சாறு" என்பதற்குச் செல்லவும். உங்கள் மாவட்டம், தாலுகா, கிராமம் மற்றும் புல எண்ணை உள்ளிட்டு கையொப்பமிட்ட பயிர் சாற்றைப் பதிவிறக்கவும்.'
    },
    {
      q: 'Is there any fee for submitting applications?',
      qTA: 'விண்ணப்பங்களை சமர்ப்பிக்க ஏதேனும் கட்டணம் உண்டா?',
      a: 'Most revenue and certificate services (Income, Community, Nativity) on TN Kuviyam are completely free of government fees. Some services like Transport or Licences may have nominal fees displayed on the service detail page.',
      aTA: 'டிஎன் குவியத்தில் உள்ள பெரும்பாலான வருவாய் மற்றும் சான்றிதழ் சேவைகள் (வருமானம், சமூகம், இருப்பிடம்) அரசு கட்டணம் ஏதுமின்றி முற்றிலும் இலவசம். போக்குவரத்து அல்லது உரிமங்கள் போன்ற சில சேவைகளுக்கு பெயரளவு கட்டணம் சேவை பக்கத்தில் காட்டப்படும்.'
    },
    {
      q: 'How do I create an account on TN Kuviyam?',
      qTA: 'டிஎன் குவியத்தில் ஒரு கணக்கை எவ்வாறு உருவாக்குவது?',
      a: 'Click the "Login" button on the top right corner, then select "Create Account". You can register using your email address, mobile number, or link an existing Google account. Aadhaar-based verification may be used for enhanced services.',
      aTA: 'மேல் வலது மூலையில் உள்ள "உள்நுழை" பொத்தானைக் கிளிக் செய்து, பின்னர் "கணக்கை உருவாக்கு" என்பதைத் தேர்ந்தெடுக்கவும். உங்கள் மின்னஞ்சல் அல்லது மொபைல் எண்ணைப் பயன்படுத்தி பதிவு செய்யலாம்.'
    },
    {
      q: 'What documents are needed for an Income Certificate?',
      qTA: 'வருமானச் சான்றிதழுக்கு என்னென்ன ஆவணங்கள் தேவை?',
      a: 'You typically need proof of identity (Aadhaar/Voter ID), proof of residence, and income proof (salary slips, bank statements, or self-declaration). Check the full document checklist on the Income Certificate service page.',
      aTA: 'அடையாளச் சான்று (ஆதார்/வாக்காளர் அட்டை), இருப்பிடச் சான்று மற்றும் வருமானச் சான்று (சம்பளச் சீட்டு, வங்கி அறிக்கை அல்லது சுய உறுதிமொழி) தேவைப்படும். முழு விவரங்களை வருமானச் சான்றிதழ் சேவை பக்கத்தில் பார்க்கலாம்.'
    },
    {
      q: 'How long does it take to process applications?',
      qTA: 'விண்ணப்பங்களைச் செயல்படுத்த எவ்வளவு காலம் ஆகும்?',
      a: 'Processing times vary by service. Most certificates (Income, Community, Nativity) are processed within 3-7 working days. Complex services like land records or licences may take 15-30 working days. Each service page displays its estimated SLA.',
      aTA: 'செயலாக்க நேரம் சேவைக்கு ஏற்ப மாறுபடும். பெரும்பாலான சான்றிதழ்கள் (வருமானம், சமூகம், இருப்பிடம்) 3-7 வேலை நாட்களுக்குள் வழங்கப்படும். ஒவ்வொரு சேவை பக்கத்திலும் அதன் கால வரம்பு காட்டப்படும்.'
    },
    {
      q: 'Can I apply on behalf of a family member?',
      qTA: 'குடும்ப உறுப்பினர் சார்பாக நான் விண்ணப்பிக்கலாமா?',
      a: 'Yes. You can visit an authorized Assisted Services center where an operator will assist you. Alternatively, you can use the citizen portal with proper authorization documents for your family member.',
      aTA: 'ஆம். அங்கீகரிக்கப்பட்ட உதவி மையத்திற்குச் சென்று ஆபரேட்டர் மூலம் விண்ணப்பிக்கலாம் அல்லது குடும்ப உறுப்பினரின் முறையான ஆவணங்களுடன் போர்ட்டலைப் பயன்படுத்தலாம்.'
    },
    {
      q: 'What is DigiLocker integration?',
      qTA: 'டிஜிலாக்கர் ஒருங்கிணைப்பு என்றால் என்ன?',
      a: 'DigiLocker is a Government of India initiative that provides a digital document wallet. When connected to TN Kuviyam, you can directly fetch verified certificates without re-uploading physical documents.',
      aTA: 'டிஜிலாக்கர் என்பது இந்திய அரசின் டிஜிட்டல் ஆவண பணப்பை திட்டம். டிஎன் குவியத்துடன் இணைக்கப்படும் போது, அசல் ஆவணங்களை மீண்டும் பதிவேற்றாமல் சரிபார்க்கப்பட்ட சான்றிதழ்களை நேரடியாகப் பெறலாம்.'
    },
    {
      q: 'How do I file a grievance or complaint?',
      qTA: 'குறை அல்லது புகாரை எவ்வாறு பதிவு செய்வது?',
      a: 'Log in to your account and navigate to "Grievances / Complaints" from the Help dropdown menu. Fill in the complaint form with details, attach relevant documents, and submit. You\'ll receive a tracking number to monitor resolution progress.',
      aTA: 'உங்கள் கணக்கில் உள்நுழைந்து "புகார்கள்" பகுதிக்குச் செல்லவும். விவரங்களுடன் படிவத்தை பூர்த்தி செய்து ஆவணங்களை இணைத்து சமர்ப்பிக்கவும். தீர்வின் முன்னேற்றத்தைக் கண்காணிக்க கண்காணிப்பு எண் வழங்கப்படும்.'
    },
    {
      q: 'What if my application is rejected?',
      qTA: 'எனது விண்ணப்பம் நிராகரிக்கப்பட்டால் என்ன செய்வது?',
      a: 'If your application is rejected, you will receive a notification with the specific reason. You can address the issue (e.g., upload missing documents, correct information) and resubmit. If you disagree with the decision, you can file a grievance.',
      aTA: 'உங்கள் விண்ணப்பம் நிராகரிக்கப்பட்டால், அதற்கான குறிப்பிட்ட காரணத்துடன் அறிவிப்பு வரும். நீங்கள் விடுபட்ட ஆவணங்களைப் பதிவேற்றி மீண்டும் சமர்ப்பிக்கலாம் அல்லது குறை பதிவு செய்யலாம்.'
    },
    {
      q: 'Is TN Kuviyam available in Tamil?',
      qTA: 'டிஎன் குவியம் தமிழில் கிடைக்குமா?',
      a: 'Yes. TN Kuviyam fully supports both Tamil (தமிழ்) and English. You can switch languages at any time using the language toggle button in the header. All forms, notifications, and service information are available in both languages.',
      aTA: 'ஆம். டிஎன் குவியம் தமிழ் மற்றும் ஆங்கிலம் ஆகிய இரு மொழிகளிலும் முழுமையாகக் கிடைக்கிறது. தலைப்பில் உள்ள மொழி மாற்ற பொத்தான் மூலம் எந்த நேரத்திலும் மாற்றிக்கொள்ளலாம்.'
    },
    {
      q: 'Which departments are connected to TN Kuviyam?',
      qTA: 'டிஎன் குவியத்துடன் எந்தெந்த துறைகள் இணைக்கப்பட்டுள்ளன?',
      a: 'TN Kuviyam connects services from Revenue, Civil Supplies, Transport, Health, Education, Social Welfare, Labour, Agriculture, Local Government, and more. The full list is available on the Services page filtered by department.',
      aTA: 'வருவாய், குடிமைப் பொருள் வழங்கல், போக்குவரத்து, சுகாதாரம், கல்வி, சமூக நலம், தொழிலாளர் நலன், வேளாண்மை உள்ளிட்ட பல்வேறு அரசு துறைகளின் சேவைகள் இணைக்கப்பட்டுள்ளன.'
    },
    {
      q: 'How secure is my personal data on TN Kuviyam?',
      qTA: 'டிஎன் குவியத்தில் எனது தனிப்பட்ட தரவு எவ்வளவு பாதுகாப்பானது?',
      a: 'TN Kuviyam uses Firebase Authentication with encrypted sessions, server-side role-based authorization, and Firestore security rules. Your personal data is only accessible to you and authorized government officers processing your application.',
      aTA: 'டிஎன் குவியம் மறைகுறியாக்கப்பட்ட அமர்வுகள் மற்றும் பங்கு அடிப்படையிலான அங்கீகாரத்துடன் பாதுகாப்பான தொழில்நுட்பத்தைப் பயன்படுத்துகிறது. உங்கள் தரவை நீங்கள் மற்றும் அதிகாரப்பூர்வ அலுவலர்கள் மட்டுமே அணுக முடியும்.'
    },
    {
      q: 'Can I download approved certificates digitally?',
      qTA: 'ஒப்புதல் அளிக்கப்பட்ட சான்றிதழ்களை டிஜிட்டல் முறையில் பதிவிறக்க முடியுமா?',
      a: 'Yes. Once your application is approved and the certificate is issued, you can download the digitally signed certificate from your Citizen Dashboard under "Completed Applications". The certificate is also available through DigiLocker if connected.',
      aTA: 'ஆம். உங்கள் விண்ணப்பம் அங்கீகரிக்கப்பட்டவுடன், குடிமகன் கட்டுப்பாட்டு அறையிலிருந்து டிஜிட்டல் கையொப்பமிட்ட சான்றிதழைப் பதிவிறக்கம் செய்யலாம்.'
    }
  ];

  const policies = [
    {
      titleKey: 'help.policies.privacy.title',
      icon: ShieldCheck,
      descKey: 'help.policies.privacy.desc'
    },
    {
      titleKey: 'help.policies.terms.title',
      icon: Scale,
      descKey: 'help.policies.terms.desc'
    },
    {
      titleKey: 'help.policies.grievance.title',
      icon: AlertTriangle,
      descKey: 'help.policies.grievance.desc'
    },
    {
      titleKey: 'help.policies.accessibility.title',
      icon: FileText,
      descKey: 'help.policies.accessibility.desc'
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
      <p class="mb-5 text-xs font-bold uppercase tracking-wider text-text-faint">
        {t('help.faq.count', { count: faqs.length })}
      </p>

      <div class="space-y-3">
        {#each faqs as faq, i}
          <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
            <button
              onclick={() => openFaq = openFaq === i ? null : i}
              class="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-text transition hover:bg-muted"
            >
              <span class="flex items-center gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-extrabold text-primary">{i + 1}</span>
                <span>{currentLocale === 'ta' && faq.qTA ? faq.qTA : faq.q}</span>
              </span>
              {#if openFaq === i}<ChevronUp class="h-4 w-4 shrink-0 text-primary" />{:else}<ChevronDown class="h-4 w-4 shrink-0 text-text-faint" />{/if}
            </button>
            {#if openFaq === i}
              <div class="animate-fade-in border-t border-border bg-surface-container p-5 text-sm leading-relaxed text-text-muted">
                {currentLocale === 'ta' && faq.aTA ? faq.aTA : faq.a}
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
                {submitting ? t('common.sending') : t('help.ask.submit')}
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
                <h3 class="mb-2 text-sm font-bold text-text">{t(policy.titleKey)}</h3>
                <p class="text-xs leading-relaxed text-text-muted">{t(policy.descKey)}</p>
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
