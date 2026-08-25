<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { MessageCircle, Send, Bot, User, Sparkles, ArrowRight, Zap, Globe, Shield, BookOpen } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
  }

  let query = $state('');
  let messages = $state<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Vanakkam! 🙏 I am Sympho, your AI assistant for Tamil Nadu government services. Ask me about eligibility, required documents, fee structures, or application procedures for any service.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  let isTyping = $state(false);

  const sampleSuggestions = [
    { text: "How to apply for an Income Certificate?", icon: BookOpen },
    { text: "What documents are needed for a new Ration Card?", icon: Shield },
    { text: "Check community certificate eligibility", icon: Globe },
    { text: "How long does a nativity certificate take?", icon: Zap }
  ];

  function handleSend(promptText?: string) {
    const textToSend = promptText || query;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages = [...messages, userMsg];
    if (!promptText) query = '';
    isTyping = true;

    // Simulate AI response synthesis
    setTimeout(() => {
      let botAnswer = "To apply for an Income Certificate in Tamil Nadu, you need: 1) Aadhaar Card, 2) Ration Card, 3) Salary proof or Income self-declaration, and 4) Address proof. Processing time is usually 5-7 working days and there is no service fee.";
      if (textToSend.toLowerCase().includes('ration')) {
        botAnswer = "For a new Ration Card under PDS Tamil Nadu: Submit Aadhaar cards of all family members, address proof (electricity bill or gas consumer card), and income details. Process takes 10-15 working days.";
      } else if (textToSend.toLowerCase().includes('community')) {
        botAnswer = "Community Certificates certify SC/ST/BC/MBC categories in TN. Applicants must be residents of Tamil Nadu and submit Aadhaar, School TC, and parent community certificate.";
      } else if (textToSend.toLowerCase().includes('nativity')) {
        botAnswer = "A Nativity Certificate confirms you are a native of Tamil Nadu. Processing takes 5-7 working days. Required documents: Aadhaar card, School Transfer Certificate, and parent's nativity/domicile proof.";
      } else if (textToSend.toLowerCase().includes('track') || textToSend.toLowerCase().includes('status')) {
        botAnswer = "You can track your submitted application by clicking 'Track Application' in the top menu or navigating to your Citizen Dashboard after logging in.";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      messages = [...messages, botMsg];
      isTyping = false;
    }, 1000);
  }
</script>

<svelte:head>
  <title>{t('chatbot.title')} — Sympho Center</title>
</svelte:head>

<div class="bg-gradient-to-b from-slate-50 to-white flex-1 flex flex-col w-full min-h-[calc(100vh-4rem)]">
  <div class="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6 md:py-10 overflow-hidden">
    
    <!-- Branding Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
        <Sparkles class="h-7 w-7" />
      </div>
      <div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">{t('chatbot.title')}</h2>
        <p class="text-sm font-medium text-slate-500">{t('chatbot.subtitle')}</p>
      </div>
      <div class="ml-auto hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5">
        <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Online</span>
      </div>
    </div>
    
    <!-- Chat Container -->
    <div class="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col gap-5">
        {#each messages as msg}
          <div class="flex gap-3 max-w-[85%] {msg.sender === 'user' ? 'self-end flex-row-reverse' : ''} animate-fade-in">
            <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 mt-1 shadow-sm
              {msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}">
              {#if msg.sender === 'user'}
                <User class="h-4 w-4" />
              {:else}
                <Bot class="h-4 w-4" />
              {/if}
            </div>
            <div class="rounded-2xl p-4 text-slate-800 shadow-sm border
              {msg.sender === 'user'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 rounded-tr-sm'
                : 'bg-gradient-to-br from-emerald-50/50 to-slate-50 border-slate-200 rounded-tl-sm'}">
              <p class="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span class="block text-right text-[10px] text-slate-400 mt-2 font-medium">{msg.timestamp}</span>
            </div>
          </div>
        {/each}

        {#if isTyping}
          <div class="flex gap-3 max-w-[85%] animate-fade-in">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
              <Bot class="h-4 w-4" />
            </div>
            <div class="bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
              <span class="flex gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></span>
              </span>
              <span class="text-xs text-emerald-600 font-medium ml-1">Searching records...</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input Area -->
      <div class="p-4 md:p-5 bg-white border-t border-slate-100">
        <!-- Suggested Chips -->
        {#if messages.length <= 2}
          <div class="flex gap-2 overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
            {#each sampleSuggestions as sug}
              <button
                onclick={() => handleSend(sug.text)}
                class="whitespace-nowrap flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm"
              >
                <sug.icon class="h-3.5 w-3.5 text-emerald-500" />
                {sug.text}
              </button>
            {/each}
          </div>
        {/if}
        
        <!-- Input Box -->
        <form onsubmit={(e) => { e.preventDefault(); handleSend(); }} class="relative flex items-center gap-2">
          <input
            bind:value={query}
            placeholder={t('chatbot.placeholder')}
            class="flex-1 pl-5 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white transition-all text-sm text-slate-900 shadow-sm"
            type="text"
          />
          <button
            type="submit"
            disabled={!query.trim() || isTyping}
            class="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:from-emerald-600 hover:to-emerald-800 transition-all shadow-sm disabled:opacity-40 disabled:hover:shadow-sm shrink-0"
          >
            <Send class="h-4.5 w-4.5" />
          </button>
        </form>
        <p class="text-center text-[10px] text-slate-400 mt-3 font-medium">{t('chatbot.disclaimer')}</p>
      </div>
    </div>
  </div>
</div>
