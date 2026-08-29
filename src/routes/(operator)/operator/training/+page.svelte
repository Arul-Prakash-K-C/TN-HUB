<script>

  import { Play, BookOpen, CheckCircle2, Clock, Users, Monitor, FileText, Shield, Layers } from '@lucide/svelte';
  
const t = $derived($tt);
import { tt } from '$lib/i18n';

const modules = [
    {
        title: 'TN Kuviyam Service Navigation',
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
function getLevelColor(level) {
    return 'bg-primary-soft text-primary-soft-text border-primary/20';
}
function getAccentColor(color) {
    return 'from-primary to-primary-hover';
}
</script>

<svelte:head>
  <title>{t('ui.routes.operator.operator.training.024a0a94')}</title>
</svelte:head>

<div class="bg-background text-text min-h-screen pb-20 flex flex-col w-full">
  <!-- Page Header (Green Banner matching Public Pages) -->
  <div class="bg-primary text-white px-6 py-8 sm:px-8 shadow-md">
    <div class="mx-auto max-w-7xl flex flex-col lg:flex-row items-start lg:items-center gap-8">
      <div class="flex-grow">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-bold text-white">
          <Monitor class="h-3.5 w-3.5" />
          {t('ui.operator.training')}
        </div>
        <h1 class="text-3xl font-black mt-2">{t('ui.routes.operator.operator.training.d702cc94')}</h1>
        <p class="mt-1 text-xs text-green-100 max-w-2xl leading-relaxed">{t('ui.routes.operator.operator.training.e234709a')}</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:min-w-[260px]">
        {#each stats as stat}
          <div class="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm px-3.5 py-3 text-center">
            <div class="flex items-center justify-center mb-1.5">
              <stat.icon class="h-4.5 w-4.5 text-green-300" />
            </div>
            <div class="text-base font-extrabold text-white leading-none">{stat.value}</div>
            <div class="text-[9px] font-bold text-green-200 uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Modules Grid -->
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow w-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-xl font-bold text-text">{t('ui.routes.operator.operator.training.3628412f')}</h2>
      </div>
      <div class="hidden sm:flex items-center gap-2">
        <span class="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-[10px] font-bold text-primary-soft-text">
          <CheckCircle2 class="h-3 w-3" /> {t('ui.beginner')}
        </span>
        <span class="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-[10px] font-bold text-primary-soft-text">
          <CheckCircle2 class="h-3 w-3" /> {t('ui.intermediate')}
        </span>
        <span class="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-[10px] font-bold text-primary-soft-text">
          <CheckCircle2 class="h-3 w-3" /> {t('ui.official')}
        </span>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each modules as mod}
        <div class="group rounded-3xl border border-border bg-surface shadow-vazhi-1 hover:shadow-vazhi-2 transition-all duration-300 overflow-hidden flex flex-col hover:border-primary/30">
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
              <span class="flex items-center gap-1 text-[11px] text-text-faint font-medium">
                <Clock class="h-3 w-3" /> {mod.duration}
              </span>
              <span class="flex items-center gap-1 text-[11px] text-text-faint font-medium">
                <BookOpen class="h-3 w-3" /> {mod.lessons} lessons
              </span>
            </div>

            <p class="text-xs text-text-muted leading-relaxed mb-5">{mod.desc}</p>

            <!-- Topics Preview -->
            <div class="flex-1">
              <p class="text-[10px] font-bold text-text-faint uppercase tracking-wider mb-2">{t('ui.routes.operator.operator.training.d3ec607b')}</p>
              <ul class="space-y-1.5">
                {#each mod.topics.slice(0, 4) as topic}
                  <li class="flex items-start gap-2 text-xs text-text-muted">
                    <CheckCircle2 class="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{topic}</span>
                  </li>
                {/each}
                {#if mod.topics.length > 4}
                  <li class="text-[11px] text-text-faint font-medium pl-5">+{mod.topics.length - 4} more topics</li>
                {/if}
              </ul>
            </div>
          </div>

          <!-- Module Footer -->
          <div class="px-6 pb-6 pt-2">
            <button
              onclick={() => alert(t('training.starting', { title: mod.title }))}
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-vazhi-1 hover:bg-primary-hover hover:shadow-vazhi-2 transition-all duration-300"
            >
              <Play class="h-4 w-4 fill-current" />
              {t('training.startBtn')}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>

</div>
