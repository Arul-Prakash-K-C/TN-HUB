<script lang="ts">
  import { GraduationCap, Play, BookOpen, Award, CheckCircle2, Clock, Users, Monitor, FileText, Shield, Layers } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  const modules = [
    {
      title: 'TN Hub Service Navigation',
      module: 'Module 1',
      duration: '20 mins',
      level: 'Beginner',
      color: 'primary',
      icon: Monitor,
      lessons: 5,
      desc: 'Learn how to discover services, check eligibility, and prepare required identity & income documents.',
      topics: ['Service catalogue browsing', 'Search and filter services', 'Eligibility checker', 'Document checklist', 'Application submission']
    },
    {
      title: 'e-Adangal Extract & Land Records',
      module: 'Module 2',
      duration: '30 mins',
      level: 'Intermediate',
      color: 'blue',
      icon: FileText,
      lessons: 7,
      desc: 'Step-by-step guide for agriculturalists and citizens to search survey numbers and download verified crop extracts.',
      topics: ['Understanding e-Adangal', 'Survey number lookup', 'District/Taluk/Village selection', 'Crop extract download', 'Digital signature verification', 'Print & save options', 'Troubleshooting']
    },
    {
      title: 'Department Officer Review Workflows',
      module: 'Module 3',
      duration: '45 mins',
      level: 'Official',
      color: 'purple',
      icon: Shield,
      lessons: 10,
      desc: 'Training for Village Administrative Officers (VAO) and Revenue Inspectors on field verification and SLA approvals.',
      topics: ['Officer portal login', 'Application queue management', 'Document verification', 'Field verification reports', 'Approval/rejection workflows', 'SLA compliance tracking', 'Correction requests', 'Bulk operations', 'Audit trail review', 'Performance reports']
    },
    {
      title: 'DigiLocker Integration & Vault Management',
      module: 'Module 4',
      duration: '25 mins',
      level: 'Beginner',
      color: 'amber',
      icon: Layers,
      lessons: 4,
      desc: 'Connecting MeitY DigiLocker for instant zero-paper certificate verification.',
      topics: ['DigiLocker overview', 'Connecting accounts', 'Fetching documents', 'Using verified certificates']
    },
    {
      title: 'Citizen Dashboard & Application Tracking',
      module: 'Module 5',
      duration: '15 mins',
      level: 'Beginner',
      color: 'cyan',
      icon: Monitor,
      lessons: 4,
      desc: 'Master your personalized citizen dashboard to track applications, manage documents, and receive notifications.',
      topics: ['Dashboard overview', 'Application timeline', 'Notifications setup', 'Profile management']
    },
    {
      title: 'Grievance Filing & Resolution',
      module: 'Module 6',
      duration: '20 mins',
      level: 'Intermediate',
      color: 'rose',
      icon: FileText,
      lessons: 5,
      desc: 'Learn how to file, track, and escalate complaints about government service delivery through the grievance portal.',
      topics: ['Filing a grievance', 'Attaching evidence', 'Tracking resolution', 'Escalation procedures', 'Resolution feedback']
    }
  ];

  const stats = [
    { label: 'Training Modules', value: '6', icon: BookOpen },
    { label: 'Total Lessons', value: '35', icon: FileText },
    { label: 'For Citizens & Officials', value: '2 Tracks', icon: Users },
    { label: 'Avg. Completion Time', value: '~3 hrs', icon: Clock }
  ];

  function getLevelColor(level: string) {
    return 'bg-primary-500/10 text-primary-700 border-primary-200';
  }

  function getAccentColor(color: string) {
    return 'from-primary-600 to-primary-800';
  }
</script>

<svelte:head>
  <title>Operator Training Portal — TN Hub</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-20">
  <!-- Hero Section -->
  <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-primary-900">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-8">
        <div class="flex-1">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">Operator Kiosk Training</h1>
          <p class="mt-3 text-base text-primary-200/80 max-w-2xl leading-relaxed">Boost your e-Sevai Kiosk performance and navigate workflows effectively.</p>
          <p class="mt-2 text-sm text-slate-400">Self-paced digital literacy courses designed for Tamil Nadu citizens, e-Sevai operators, and government officers.</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-2.5 w-full lg:w-auto lg:min-w-[260px]">
          {#each stats as stat}
            <div class="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm px-3.5 py-3 text-center">
              <div class="flex items-center justify-center mb-1.5">
                <stat.icon class="h-4.5 w-4.5 text-primary-400" />
              </div>
              <div class="text-base font-extrabold text-white leading-none">{stat.value}</div>
              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Modules Grid -->
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Training Modules</h2>
        <p class="text-sm text-slate-500 mt-1">Complete all modules to earn your TN Hub digital proficiency certification.</p>
      </div>
      <div class="hidden sm:flex items-center gap-2">
        <span class="flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-[10px] font-bold text-primary-700">
          <CheckCircle2 class="h-3 w-3" /> Beginner
        </span>
        <span class="flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-[10px] font-bold text-primary-700">
          <CheckCircle2 class="h-3 w-3" /> Intermediate
        </span>
        <span class="flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-[10px] font-bold text-primary-700">
          <CheckCircle2 class="h-3 w-3" /> Official
        </span>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each modules as mod}
        <div class="group rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
          <!-- Module Header Bar -->
          <div class="bg-gradient-to-r {getAccentColor(mod.color)} px-6 py-4 text-white">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-extrabold uppercase tracking-widest text-white/70">{mod.module}</span>
              <mod.icon class="h-5 w-5 text-white/50" />
            </div>
            <h3 class="text-base font-bold mt-1 leading-snug">{mod.title}</h3>
          </div>

          <!-- Module Body -->
          <div class="flex-1 flex flex-col p-6">
            <!-- Meta badges -->
            <div class="flex items-center gap-2 mb-4">
              <span class="rounded-full border px-2.5 py-0.5 text-[10px] font-bold {getLevelColor(mod.level)}">
                {mod.level}
              </span>
              <span class="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Clock class="h-3 w-3" /> {mod.duration}
              </span>
              <span class="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <BookOpen class="h-3 w-3" /> {mod.lessons} lessons
              </span>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed mb-5">{mod.desc}</p>

            <!-- Topics Preview -->
            <div class="flex-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">What you'll learn</p>
              <ul class="space-y-1.5">
                {#each mod.topics.slice(0, 4) as topic}
                  <li class="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 class="h-3.5 w-3.5 text-primary-500 mt-0.5 shrink-0" />
                    <span>{topic}</span>
                  </li>
                {/each}
                {#if mod.topics.length > 4}
                  <li class="text-[11px] text-slate-400 font-medium pl-5">+{mod.topics.length - 4} more topics</li>
                {/if}
              </ul>
            </div>
          </div>

          <!-- Module Footer -->
          <div class="px-6 pb-6 pt-2">
            <button
              onclick={() => alert(`Starting: ${mod.title}\n\nThis is a prototype demonstration. Full training content will be available in the production release.`)}
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 group-hover:shadow-md transition-all"
            >
              <Play class="h-4 w-4 fill-current" />
              Start Training
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Certification Notice -->
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="rounded-3xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 p-8 flex flex-col md:flex-row items-center gap-6">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-primary-200 shrink-0">
        <Award class="h-8 w-8 text-primary-600" />
      </div>
      <div class="flex-1 text-center md:text-left">
        <h3 class="text-lg font-bold text-slate-900">Digital Proficiency Certification</h3>
        <p class="text-sm text-slate-500 mt-1 max-w-xl">Complete all 6 training modules to receive a TN Hub Digital Proficiency Certificate. This certification validates your ability to navigate and utilize Tamil Nadu government e-services effectively.</p>
      </div>
      <div class="shrink-0">
        <span class="rounded-full bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm">
          Coming Soon
        </span>
      </div>
    </div>
  </div>
</div>
