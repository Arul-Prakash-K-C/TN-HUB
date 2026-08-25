<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { MessageSquare, X, Send, Sparkles, Bot, User } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  let isOpen = $state(false);
  let query = $state('');
  let isTyping = $state(false);

  interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
  }

  let messages = $state<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Vanakkam! 🙏 I am Sympho AI. How can I help you with Tamil Nadu government services today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const suggestions = [
    'How to get e-Adangal extract?',
    'Income Certificate documents',
    'Track my application',
    'New Ration Card process'
  ];

  function toggleOpen() {
    isOpen = !isOpen;
  }

  function handleSend(textOverride?: string) {
    const textToSend = textOverride || query;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages = [...messages, userMsg];
    if (!textOverride) query = '';
    isTyping = true;

    setTimeout(() => {
      let botText = "To apply for an Income Certificate in Tamil Nadu: Submit your Aadhaar card, Ration card, and income self-declaration. The standard processing time is 5-7 working days with zero government fee.";
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('adangal')) {
        botText = "The e-Adangal Extract is an official digital record of land cultivation details maintained by the TN Revenue Department. You can request your extract using your survey number, district, and taluk under 'Services > e-Adangal Extract'.";
      } else if (lower.includes('ration') || lower.includes('pds')) {
        botText = "For Smart Ration Card services: Provide Aadhaar cards of all family members, gas consumer details, and address proof. You can track your request under 'Track Application'.";
      } else if (lower.includes('track') || lower.includes('status')) {
        botText = "You can track your submitted application by clicking 'Track Application' in the top menu or navigating to your Citizen Dashboard.";
      }

      messages = [...messages, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      isTyping = false;
    }, 800);
  }
</script>

<!-- Floating Trigger Button -->
<div class="fixed bottom-6 right-6 z-50">
  {#if !isOpen}
    <button
      onclick={toggleOpen}
      aria-label="Open Sympho AI Assistant"
      class="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 px-5 py-3.5 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-500/30"
    >
      <div class="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow">
        <Sparkles class="h-4 w-4" />
        <span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
        </span>
      </div>
      <span class="text-xs font-bold tracking-wide">Ask Sympho AI</span>
    </button>
  {/if}
</div>

<!-- Chat Panel — Fixed bottom-right, no expand/slide -->
{#if isOpen}
  <div class="fixed z-50 bottom-6 right-6 w-full sm:w-[400px] h-[540px] max-w-[calc(100vw-3rem)] animate-fade-in">
    <div class="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between bg-gradient-to-r from-[#062206] to-[#0a3d0a] px-5 py-4 text-white">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow">
            <Sparkles class="h-5 w-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="text-sm font-bold leading-none">Sympho AI</h3>
              <span class="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p class="mt-0.5 text-[11px] text-white/50">Tamil Nadu Citizen Services</p>
          </div>
        </div>

        <button
          onclick={toggleOpen}
          aria-label="Close Chat"
          class="rounded-xl p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
        {#each messages as msg}
          <div class="flex items-start gap-2.5 {msg.sender === 'user' ? 'flex-row-reverse' : ''}">
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
              {msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}">
              {#if msg.sender === 'user'}
                <User class="h-3.5 w-3.5" />
              {:else}
                <Bot class="h-3.5 w-3.5" />
              {/if}
            </div>

            <div class="max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm
              {msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'}">
              {msg.text}
              <div class="mt-1 text-[9px] text-right opacity-50">{msg.timestamp}</div>
            </div>
          </div>
        {/each}

        {#if isTyping}
          <div class="flex items-center gap-2">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Bot class="h-3.5 w-3.5" />
            </div>
            <div class="rounded-2xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2">
              <span class="flex gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></span>
              </span>
              Searching...
            </div>
          </div>
        {/if}
      </div>

      <!-- Suggestions -->
      <div class="border-t border-slate-100 bg-white px-3 py-2 overflow-x-auto flex gap-1.5">
        {#each suggestions as sug}
          <button
            onclick={() => handleSend(sug)}
            class="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
          >
            {sug}
          </button>
        {/each}
      </div>

      <!-- Input Footer -->
      <div class="border-t border-slate-100 bg-white p-3">
        <form onsubmit={(e) => { e.preventDefault(); handleSend(); }} class="flex items-center gap-2">
          <input
            type="text"
            bind:value={query}
            placeholder="Ask about any TN service..."
            class="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-800 outline-none focus:border-emerald-400 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={!query.trim() || isTyping}
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white transition hover:shadow-md disabled:opacity-40"
          >
            <Send class="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  </div>
{/if}
