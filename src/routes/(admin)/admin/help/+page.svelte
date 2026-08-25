<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { isAuthenticated, userRole } from '$lib/stores/auth';
  import { HelpCircle, BookOpen, Shield, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from '@lucide/svelte';

  const t = $derived($tt);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let expandedFaq = $state<number | null>(null);

  const faqs = [
    {
      q: 'How do I approve a new Operator or Officer registration?',
      a: 'Navigate to "Registration Approvals" in the sidebar. You will see all pending requests. Click "Approve" to activate the account, or "Reject" to remove the request. The user will be notified automatically.'
    },
    {
      q: 'How do user inquiries work?',
      a: 'Citizens and operators can submit questions from their respective Help pages. All questions arrive at "Help Desk & Inquiries" in your admin panel. When you reply, the response is sent directly to the user\'s notification inbox.'
    },
    {
      q: 'Can I change an officer\'s department assignment?',
      a: 'Currently, department assignment is set during registration. To change it, you would need to update the user\'s departmentId field in the Firestore users collection directly.'
    },
    {
      q: 'How are service workflows managed?',
      a: 'Services and their workflows are configured in the service registry. Each service has a defined workflow state machine. The admin dashboard shows the service architecture matrix with all implementation modes.'
    },
    {
      q: 'What is the difference between NATIVE_WORKFLOW and API_INTEGRATED?',
      a: 'NATIVE_WORKFLOW services are fully managed within TN Hub with our own forms and state machines. API_INTEGRATED services connect to external department APIs for processing while keeping the citizen experience inside TN Hub.'
    },
    {
      q: 'How do I view platform usage statistics?',
      a: 'The admin dashboard shows key metrics including total services, breakdown by implementation mode, and the full service architecture matrix. More detailed analytics will be available in future releases.'
    }
  ];
</script>

<svelte:head>
  <title>Help & FAQ — TN Hub Admin</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-slate-50">
    <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <h2 class="text-xl font-bold text-slate-900">Access Denied</h2>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="bg-primary text-white border-b border-border">
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          Support
        </span>
        <h1 class="mt-2 text-h1 text-white">Help & FAQ</h1>
        <p class="text-xs text-white/70">Common questions about the admin console</p>
      </div>
    </div>

    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <!-- FAQ Section -->
      <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <BookOpen class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Frequently Asked Questions</h2>
            <p class="text-xs text-slate-500">Quick answers to common admin queries</p>
          </div>
        </div>

        <div class="divide-y divide-slate-100">
          {#each faqs as faq, i}
            <button
              onclick={() => expandedFaq = expandedFaq === i ? null : i}
              class="w-full text-left px-6 py-4 hover:bg-slate-50 transition flex items-start justify-between gap-3"
            >
              <div class="flex-1">
                <span class="text-xs font-bold text-slate-800">{faq.q}</span>
                {#if expandedFaq === i}
                  <p class="mt-2 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                {/if}
              </div>
              <div class="shrink-0 text-slate-400 mt-0.5">
                {#if expandedFaq === i}
                  <ChevronUp class="h-4 w-4" />
                {:else}
                  <ChevronDown class="h-4 w-4" />
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Contact Info -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <MessageCircle class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Need More Help?</h2>
            <p class="text-xs text-slate-500">Contact the TN Hub development team</p>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <Mail class="h-5 w-5 text-slate-400" />
            <div>
              <span class="text-xs font-bold text-slate-800">Email Support</span>
              <p class="text-[10px] text-slate-500">support@tnhub.demo</p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <Phone class="h-5 w-5 text-slate-400" />
            <div>
              <span class="text-xs font-bold text-slate-800">Phone</span>
              <p class="text-[10px] text-slate-500">044-2567-0000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
