<script lang="ts">
  import { HelpCircle, Phone, Mail, BookOpen, MessageSquare } from '@lucide/svelte';

  const faqs = [
    {
      q: 'How do I submit an application on behalf of a citizen?',
      a: 'Navigate to the Operator Dashboard, enter the citizen\'s phone number or email address, select the requested service, and click "Create Assisted Draft". Fill in the form fields, upload necessary documents, complete the step verification, and click submit.'
    },
    {
      q: 'How does the citizen verify their mobile and email?',
      a: 'During the first step of the application, click "Verify via OTP" next to the Mobile and Email inputs. A 6-digit mock OTP code will be sent. Enter this OTP code to complete the verification before continuing.'
    },
    {
      q: 'Can I print a citizen\'s issued certificate?',
      a: 'Yes. Once an application is approved by the officer, the citizen\'s certificate will be generated. You can find the application in your "Assisted Applications" list, open the citizen details, or access it via their tracking dashboard to print the high-quality styled PDF.'
    },
    {
      q: 'What do I do if a document is flagged by an officer?',
      a: 'Go to your Assisted Applications queue, find the application with the status "CLARIFICATION_REQUESTED". Open it, upload the corrected document requested by the officer, and resubmit it for review.'
    }
  ];

  let activeFaqIndex = $state<number | null>(null);
</script>

<svelte:head>
  <title>Operator Help & Support — TN Hub</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-12">
  <div class="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">Kiosk Operator Support Desk</h1>
      <p class="text-xs font-medium text-slate-500 mt-0.5">Find answers to common operational questions or contact the TNeGA admin desk.</p>
    </div>
  </div>

  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
    <!-- Help Guides -->
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4">
        <div class="p-3 bg-primary-100 rounded-xl text-primary-700 shrink-0">
          <BookOpen class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Operator Manual</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">Read step-by-step instructions on assisting citizen registrations, uploading documents, and navigating workflows.</p>
          <a href="#" class="mt-2.5 inline-block text-xs font-bold text-primary-700 hover:underline">Download PDF Manual</a>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4">
        <div class="p-3 bg-amber-100 rounded-xl text-amber-700 shrink-0">
          <MessageSquare class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Live Kiosk Support</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">Connect directly with the TNeGA Technical Support Team via the integrated kiosk chat desk.</p>
          <a href="/chatbot" class="mt-2.5 inline-block text-xs font-bold text-amber-700 hover:underline">Start Kiosk Chat</a>
        </div>
      </div>
    </div>

    <!-- FAQ Accordion -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-base font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
      <div class="divide-y divide-slate-100">
        {#each faqs as faq, i}
          <div class="py-3.5">
            <button
              onclick={() => activeFaqIndex = activeFaqIndex === i ? null : i}
              class="w-full text-left flex justify-between items-center gap-4 text-slate-900 font-bold text-xs hover:text-primary-700 transition"
            >
              <span>{faq.q}</span>
              <span class="text-slate-400">{activeFaqIndex === i ? '−' : '+'}</span>
            </button>
            {#if activeFaqIndex === i}
              <p class="mt-2 text-xs text-slate-500 leading-relaxed font-medium pl-1 animate-fade-in">{faq.a}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Contact Info -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="font-bold text-slate-900 text-sm">Need immediate administrative assistance?</h3>
        <p class="text-xs text-slate-500 mt-0.5">Contact the TNeGA state-wide operational headquarters.</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-4">
        <a href="tel:18004256000" class="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-primary-700 transition">
          <Phone class="h-4 w-4" /> 1800 425 6000
        </a>
        <a href="mailto:support.tnhub@tn.gov.in" class="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-primary-700 transition">
          <Mail class="h-4 w-4" /> support.tnhub@tn.gov.in
        </a>
      </div>
    </div>

  </div>
</div>
