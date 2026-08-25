<script lang="ts">
  import { goto } from '$app/navigation';
  import { tt } from '$lib/i18n';
  import { isAuthenticated, userRole } from '$lib/stores/auth';
  import { getPortalRedirectForRole } from '$lib/utils/authGuard';
  import { Search, FileText, CheckCircle2, Bot, ArrowRight, ArrowDown } from '@lucide/svelte';

  const t = $derived($tt);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  $effect(() => {
    if (authenticated) {
      goto(getPortalRedirectForRole(role));
    }
  });

  const conceptSteps = [
    { label: 'DISCOVER', desc: 'Find the exact service you need across all departments.' },
    { label: 'CHECK ELIGIBILITY', desc: 'Instantly verify if you meet the requirements.' },
    { label: 'APPLY', desc: 'Fill out one unified, simple form.' },
    { label: 'UPLOAD DOCUMENTS', desc: 'Pull directly from DigiLocker or upload securely.' },
    { label: 'TRACK', desc: 'Monitor your application status in real-time.' },
    { label: 'GET RESULT', desc: 'Download your approved certificate or result instantly.' }
  ];
</script>

<svelte:head>
  <title>TN Hub — One Center. Every Government Service.</title>
  <meta name="description" content="Discover, apply, track and manage government services from one unified platform." />
</svelte:head>

<!-- Hero Section (Deep Navy) -->
<section class="relative overflow-hidden bg-primary-950 text-primary-foreground py-20 sm:py-28 lg:py-32">
  <!-- Subtle background glow -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,122,255,0.15),rgba(255,255,255,0))]"></div>

  <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl text-center">

      <div class="inline-flex items-center justify-center gap-2 mb-6">
        <span class="text-xs font-bold uppercase tracking-widest text-primary-400">Prototype Release</span>
      </div>

      <h1 class="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
        TN HUB
      </h1>
      <h2 class="mt-4 text-xl font-bold text-slate-300 sm:text-2xl tracking-wide">
        One Center. Every Government Service.
      </h2>

      <p class="mt-8 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto sm:text-lg">
        Discover, apply, track and manage government services from one unified platform. 
        <br class="hidden sm:block"/>
        Government services shouldn't feel fragmented.
      </p>

      <!-- Action CTAs -->
      <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <!-- Primary CTA -->
        <a
          href="/services"
          class="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-primary-500 px-8 py-4 text-sm font-black text-primary-foreground shadow-lg shadow-primary-500/20 transition hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Search class="h-5 w-5" />
          Explore Services
        </a>

        <!-- Secondary CTA -->
        <a
          href={authenticated ? '/applications' : '/login'}
          class="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl border-2 border-slate-700 bg-transparent px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800 hover:border-slate-600 active:scale-95"
        >
          <FileText class="h-5 w-5" />
          Track Application
        </a>
      </div>

      <!-- AI CTA -->
      <div class="mt-6 flex justify-center">
        <a href="/chatbot" class="flex items-center gap-2 rounded-full bg-slate-800/80 border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition">
          <Bot class="h-4 w-4 text-[#007AFF]" />
          Thozhan AI
        </a>
      </div>

    </div>
  </div>
</section>

<!-- The TN Hub Concept Section (AliceBlue) -->
<section class="bg-[#F0F8FF] py-20 sm:py-24 border-y border-slate-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-black text-[#071A28] tracking-tight sm:text-4xl">The TN Hub Concept</h2>
      <p class="mt-4 text-sm font-medium text-slate-600 max-w-2xl mx-auto">
        A unified, predictable experience across every department. No more navigating dozens of disconnected government portals.
      </p>
    </div>

    <!-- Visual Flow -->
    <div class="max-w-4xl mx-auto relative">
      <!-- Desktop Connecting Line -->
      <div class="hidden sm:block absolute top-6 left-[10%] right-[10%] h-1 bg-slate-200 -z-10 rounded-full"></div>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-4 relative z-10">
        {#each conceptSteps as step, i}
          <div class="flex flex-col items-center text-center group">
            <div class="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-4 border-primary-50 bg-white shadow-md text-primary-950 font-black text-sm transition-transform group-hover:scale-110 group-hover:border-primary-100">
              {i + 1}
            </div>
            <h3 class="mt-4 text-xs font-black text-[#071A28] tracking-widest uppercase">{step.label}</h3>
            <p class="mt-2 text-[11px] font-medium text-slate-500 leading-relaxed max-w-[140px]">{step.desc}</p>
            
            {#if i < conceptSteps.length - 1}
              <div class="sm:hidden mt-6 text-slate-300">
                <ArrowDown class="h-6 w-6" />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>


