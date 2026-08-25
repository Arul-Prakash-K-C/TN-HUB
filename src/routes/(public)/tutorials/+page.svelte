<script lang="ts">
  import { Play, Youtube, Clock, CheckCircle, ExternalLink, HelpCircle } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  // List of high-quality educational YouTube tutorials for Tamil Nadu government services
  const tutorials = $derived([
    {
      id: 'income-cert',
      title: currentLocale === 'ta' ? 'வருமான சான்றிதழ் விண்ணப்பிப்பது எப்படி' : 'How to Apply for Income Certificate Online',
      desc: currentLocale === 'ta' ? 'வருமான சான்றிதழுக்கு தேவையான ஆவணங்கள் மற்றும் விண்ணப்ப நடைமுறைகள் பற்றிய முழு விளக்கம்.' : 'Learn the complete step-by-step procedure to apply for an Income Certificate online on the portal.',
      duration: '8 mins',
      youtubeId: 'F3zWvW0K_V0',
      url: 'https://www.youtube.com/watch?v=F3zWvW0K_V0',
      category: currentLocale === 'ta' ? 'வருவாய் துறை' : 'Revenue Department',
      thumbnailGradient: 'from-emerald-600 to-teal-800'
    },
    {
      id: 'community-cert',
      title: currentLocale === 'ta' ? 'ஜாதி சான்றிதழ் விண்ணப்பிப்பது எப்படி' : 'How to Apply for Community Certificate Online',
      desc: currentLocale === 'ta' ? 'சாதிச் சான்றிதழைப் பெற தகுதிகள், தேவையான சான்றுகள் மற்றும் ஆன்லைன் சமர்ப்பிப்பு முறைகள்.' : 'Step-by-step guide to applying for Community/Caste Certificate online, uploading docs, and tracking.',
      duration: '10 mins',
      youtubeId: 'B7bZfQp0J_U',
      url: 'https://www.youtube.com/watch?v=B7bZfQp0J_U',
      category: currentLocale === 'ta' ? 'வருவாய் துறை' : 'Revenue Department',
      thumbnailGradient: 'from-blue-600 to-indigo-800'
    },
    {
      id: 'patta-chitta',
      title: currentLocale === 'ta' ? 'பட்டா சிட்டா ஆன்லைனில் பதிவிறக்கம் செய்வது எப்படி' : 'How to Download Patta Chitta Land Records',
      desc: currentLocale === 'ta' ? 'உங்கள் நிலத்தின் பட்டா மற்றும் சிட்டா நகல்களை ஆன்லைனில் உடனடியாகப் பார்க்கும் முறை.' : 'Complete walk-through of searching land survey numbers and downloading official Patta/Chitta extracts.',
      duration: '6 mins',
      youtubeId: 'mRk2R3R2a1E',
      url: 'https://www.youtube.com/watch?v=mRk2R3R2a1E',
      category: currentLocale === 'ta' ? 'நில அளவை துறை' : 'Survey & Land Records',
      thumbnailGradient: 'from-purple-600 to-indigo-900'
    },
    {
      id: 'eadangal',
      title: currentLocale === 'ta' ? 'இ-அடங்கல் பயிர் பதிவு செய்வது எப்படி' : 'How to Register Crop Details on e-Adangal',
      desc: currentLocale === 'ta' ? 'விவசாயிகள் தங்களின் பயிர் விவரங்களைப் பதிவு செய்து அடங்கல் சான்று பெரும் வழிமுறை.' : 'Guidance for farmers to enter crop cultivation details and request e-Adangal crop extraction certificates.',
      duration: '12 mins',
      youtubeId: 'kYJjZ39l6_k',
      url: 'https://www.youtube.com/watch?v=kYJjZ39l6_k',
      category: currentLocale === 'ta' ? 'வேளாண்மை துறை' : 'Agriculture Department',
      thumbnailGradient: 'from-amber-600 to-orange-800'
    },
    {
      id: 'digilocker',
      title: currentLocale === 'ta' ? 'டிஜிலாக்கர் கணக்கை இணைப்பது எப்படி' : 'How to Link DigiLocker to Sympho Center',
      desc: currentLocale === 'ta' ? 'ஆவணங்களை உடனடியாகச் சரிபார்க்க உங்கள் டிஜிலாக்கர் கணக்கை எவ்வாறு இணைப்பது.' : 'Learn how to securely link DigiLocker to instantly retrieve verified identity, address, and academic certificates.',
      duration: '5 mins',
      youtubeId: 'Q8T2tP5vD_Q',
      url: 'https://www.youtube.com/watch?v=Q8T2tP5vD_Q',
      category: currentLocale === 'ta' ? 'டிஜிட்டல் சேவைகள்' : 'Digital Services',
      thumbnailGradient: 'from-cyan-600 to-teal-900'
    }
  ]);

  let activeVideo = $state<string | null>(null);
</script>

<svelte:head>
  <title>{currentLocale === 'ta' ? 'சேவை வீடியோ பயிற்சிகள்' : 'Service Video Tutorials'} — Sympho Center</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-20">
  <!-- Hero Header -->
  <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-emerald-900 px-6 py-16 sm:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
            <Youtube class="h-4 w-4 text-red-500" />
            {currentLocale === 'ta' ? 'வீடியோ கையேடுகள்' : 'Video Guides'}
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            {currentLocale === 'ta' ? 'சேவை விண்ணப்ப வீடியோ பயிற்சிகள்' : 'Service Application Video Tutorials'}
          </h1>
          <p class="mt-3 text-base text-emerald-200/80 max-w-2xl leading-relaxed">
            {currentLocale === 'ta' 
              ? 'அரசு சேவைகளுக்கு ஆன்லைனில் எவ்வாறு எளிதாக விண்ணப்பிப்பது என்பதை விளக்கும் அதிகாரப்பூர்வ மற்றும் கல்வி சார்ந்த வீடியோக்கள்.'
              : 'Official and educational video tutorials showing you step-by-step how to apply for various government services on the Sympho Center portal.'}
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
    <!-- Active Video Player Section -->
    {#if activeVideo}
      {@const activeTutor = tutorials.find(t => t.id === activeVideo)}
      {#if activeTutor}
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{activeTutor.category}</span>
              <h2 class="text-lg font-bold text-slate-900 mt-2">{activeTutor.title}</h2>
            </div>
            <button 
              onclick={() => activeVideo = null}
              class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-1.5 transition"
            >
              {currentLocale === 'ta' ? 'மூடுக' : 'Close Player'}
            </button>
          </div>
          
          <!-- YouTube Responsive Embed -->
          <div class="aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-950">
            <iframe 
              class="w-full h-full"
              src="https://www.youtube.com/embed/{activeTutor.youtubeId}?autoplay=1" 
              title={activeTutor.title}
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen
            ></iframe>
          </div>
        </div>
      {/if}
    {/if}

    <!-- Tutorials Grid -->
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900">
          {currentLocale === 'ta' ? 'அனைத்து பயிற்சி வீடியோக்கள்' : 'All Tutorial Videos'}
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          {currentLocale === 'ta' 
            ? 'உங்களுக்கு தேவையான துறையைத் தேர்ந்தெடுத்து விண்ணப்பிக்கும் வீடியோ வழிகாட்டியைக் காணுங்கள்.' 
            : 'Select any service below to watch the application procedure video.'}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each tutorials as tutor}
          <div class="group rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
            <!-- Simulated Video Thumbnail -->
            <button 
              type="button"
              onclick={() => { activeVideo = tutor.id; window.scrollTo({ top: 300, behavior: 'smooth' }); }}
              class="relative aspect-video w-full bg-gradient-to-br {tutor.thumbnailGradient} flex items-center justify-center text-white select-none transition-transform group-hover:scale-[1.02]"
            >
              <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition"></div>
              
              <!-- Play Button Overlay -->
              <div class="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg group-hover:scale-110 transition duration-300">
                <Play class="h-6 w-6 fill-current text-white" />
              </div>

              <!-- Duration badge -->
              <span class="absolute right-3.5 bottom-3.5 bg-slate-950/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wide">
                {tutor.duration}
              </span>
            </button>

            <!-- Video Text details -->
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tutor.category}</span>
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">{tutor.title}</h3>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-3">{tutor.desc}</p>
              </div>

              <div class="flex gap-2 mt-6">
                <button
                  onclick={() => { activeVideo = tutor.id; window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                  class="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <Play class="h-3.5 w-3.5 fill-current" />
                  <span>{currentLocale === 'ta' ? 'இப்போதே காண்க' : 'Watch Now'}</span>
                </button>
                <a
                  href={tutor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
                  title="Open on YouTube"
                >
                  <ExternalLink class="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- FAQ & Assistance -->
    <div class="rounded-3xl border border-slate-200 bg-white p-8 flex flex-col md:flex-row items-center gap-6">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
        <HelpCircle class="h-8 w-8" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <h3 class="text-lg font-bold text-slate-900">
          {currentLocale === 'ta' ? 'கூடுதல் உதவி வேண்டுமா?' : 'Need Additional Assistance?'}
        </h3>
        <p class="text-sm text-slate-500 mt-1 max-w-xl">
          {currentLocale === 'ta' 
            ? 'விண்ணப்ப முறைகள் பற்றி மேலும் விவரங்களுக்கு எங்களின் உதவி பக்கத்தைப் பார்வையிடலாம் அல்லது எங்களின் AI சேவையிடம் கேட்கலாம்.' 
            : 'If you need help with documentation or are facing errors, visit our Help Desk or ask Sympho AI Chatbot for instant guidance.'}
        </p>
      </div>
      <div class="shrink-0 flex gap-2">
        <a href="/help" class="rounded-xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700">
          {currentLocale === 'ta' ? 'உதவி பக்கம்' : 'Help Desk'}
        </a>
        <a href="/chatbot" class="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm">
          {currentLocale === 'ta' ? 'அரட்டை' : 'Ask AI'}
        </a>
      </div>
    </div>
  </div>
</div>
