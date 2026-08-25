<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { Send, Bot, User, HelpCircle } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
  }

  let query = $state('');
  let messages = $state<ChatMessage[]>([]);
  let isTyping = $state(false);

  const sampleSuggestions = [
    "How to apply for an Income Certificate?",
    "What documents are needed for a new Ration Card?",
    "Check community certificate eligibility",
    "How long does a nativity certificate take?"
  ];

  const sampleSuggestionsTA = [
    "வருமான சான்றிதழுக்கு விண்ணப்பிப்பது எப்படி?",
    "புதிய ரேஷன் கார்டுக்கு என்ன ஆவணங்கள் தேவை?",
    "சமூக சான்றிதழ் தகுதியை சரிபார்க்கவும்",
    "இருப்பிட சான்றிதழ் பெற எவ்வளவு காலம் ஆகும்?"
  ];

  const activeSuggestions = $derived(currentLocale === 'ta' ? sampleSuggestionsTA : sampleSuggestions);

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
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('ration') || lower.includes('ரேஷன்')) {
        botAnswer = "For a new Ration Card under PDS Tamil Nadu: Submit Aadhaar cards of all family members, address proof (electricity bill or gas consumer card), and income details. Process takes 10-15 working days.";
      } else if (lower.includes('community') || lower.includes('சமூக')) {
        botAnswer = "Community Certificates certify SC/ST/BC/MBC categories in TN. Applicants must be residents of Tamil Nadu and submit Aadhaar, School TC, and parent community certificate.";
      } else if (lower.includes('nativity') || lower.includes('இருப்பிட')) {
        botAnswer = "A Nativity Certificate confirms you are a native of Tamil Nadu. Processing takes 5-7 working days. Required documents: Aadhaar card, School Transfer Certificate, and parent's nativity proof.";
      } else if (lower.includes('track') || lower.includes('status') || lower.includes('கண்காணி')) {
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
  <title>{t('chatbot.title')} — TN Hub</title>
</svelte:head>

<div class="bg-white flex-1 flex flex-col w-full min-h-[calc(100vh-4rem)] relative">
  
  {#if messages.length === 0}
    <!-- Clean Minimalist Landing Screen -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 w-full max-w-2xl mx-auto text-center pb-36 pt-12">
      <!-- 8-Petal Minimalist Flower Icon -->
      <div class="flex items-center justify-center mb-6">
        <div class="h-16 w-16 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-600 shadow-xs">
          <svg class="h-8 w-8 text-stone-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 5V3m0 16v-2m-7-7H3m16 0h-2m-2.12-4.88l1.42-1.42M6.7 17.3l1.42-1.42m0-8.48L6.7 6.7m10.6 10.6l-1.42-1.42" />
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2z" />
            <path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2z" />
            <path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4H4a2 2 0 0 1-2-2z" />
            <path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-2-2z" />
          </svg>
        </div>
      </div>

      <h1 class="text-2xl font-black text-slate-800 tracking-tight sm:text-3xl leading-snug">
        {currentLocale === 'ta' ? "உரையாடுவோம்! உங்கள் மனதில் என்ன இருக்கிறது?" : "Let's chat! What's on your mind?"}
      </h1>
      
      <p class="mt-3 text-sm text-slate-500 max-w-md leading-relaxed font-medium">
        {currentLocale === 'ta' ? "கீழே உள்ள கேள்விகளில் இருந்து தேர்ந்தெடுக்கவும் அல்லது கேட்கத் தொடங்கவும். உங்களுக்கு உதவ நான் தயாராக இருக்கிறேன்." : "Choose from the prompts below or start asking queries. I'm here to help with whatever you need."}
      </p>

      <!-- Suggestion Grid -->
      <div class="mt-10 w-full">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          {currentLocale === 'ta' ? "இவற்றை முயற்சிக்கவும்:" : "Try these prompts:"}
        </p>
        
        <div class="grid gap-3 sm:grid-cols-2 w-full max-w-xl mx-auto">
          {#each activeSuggestions as sug}
            <button
              onclick={() => handleSend(sug)}
              class="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs flex items-center gap-3 active:scale-98 duration-100"
            >
              <HelpCircle class="h-4.5 w-4.5 text-stone-400 shrink-0" />
              <span>{sug}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <!-- Active Chat Conversation Screen -->
    <div class="flex-1 overflow-y-auto px-4 py-8 max-w-3xl w-full mx-auto space-y-6 pb-32">
      {#each messages as msg}
        <div class="flex gap-4 max-w-[85%] {msg.sender === 'user' ? 'self-end ml-auto flex-row-reverse' : ''} animate-fade-in">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm
            {msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}">
            {#if msg.sender === 'user'}
              <User class="h-4.5 w-4.5" />
            {:else}
              <Bot class="h-4.5 w-4.5" />
            {/if}
          </div>
          <div class="rounded-3xl px-5 py-3.5 text-slate-800 shadow-xs border
            {msg.sender === 'user'
              ? 'bg-slate-50 border-slate-100 rounded-tr-sm'
              : 'bg-white border-slate-200 rounded-tl-sm'}">
            <p class="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
            <span class="block text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{msg.timestamp}</span>
          </div>
        </div>
      {/each}

      {#if isTyping}
        <div class="flex gap-4 max-w-[85%] animate-fade-in">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
            <Bot class="h-4.5 w-4.5" />
          </div>
          <div class="bg-white border border-slate-200 rounded-3xl rounded-tl-sm px-5 py-3.5 shadow-xs flex items-center gap-2">
            <span class="flex gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></span>
            </span>
            <span class="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Searching...</span>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Bottom Centered Capsule Input Area -->
  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-6 px-4 z-10">
    <div class="max-w-xl mx-auto w-full">
      <form onsubmit={(e) => { e.preventDefault(); handleSend(); }} class="relative flex items-center rounded-full bg-slate-100 p-1.5 border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400/50 focus-within:bg-white focus-within:border-emerald-400 transition-all duration-200">
        <input
          bind:value={query}
          placeholder={currentLocale === 'ta' ? "கேளுங்கள்..." : "Ask Something"}
          class="flex-1 pl-4 pr-3 py-2.5 bg-transparent border-0 focus:outline-none text-xs font-semibold text-slate-900 placeholder:text-slate-400"
          type="text"
        />
        <button
          type="submit"
          disabled={!query.trim() || isTyping}
          aria-label={t('chatbot.send')}
          class="h-9 w-9 bg-transparent hover:bg-slate-200/50 active:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-all disabled:opacity-30 shrink-0"
        >
          <svg class="h-4.5 w-4.5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  </div>

</div>
