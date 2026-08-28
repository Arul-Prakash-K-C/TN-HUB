<script>

  import { Eye, Building2, Shield, Briefcase, FileText, Users, Award, Sparkles, Network, Layers, CheckCircle2 } from '@lucide/svelte';
  import { t } from '$lib/i18n';

const committeeMembers = [
    { nr: 1, position: 'The Principal Secretary to Government, IT Department', role: 'Chairman', class: 'bg-primary-950 text-white' },
    { nr: 2, position: 'The Chief Executive Officer, TNeGA', role: 'Member Secretary', class: 'bg-primary-500/10 border-primary-500/30 text-primary-950' },
    { nr: 3, position: 'The State Informatics Officer, National Informatics Centre (NIC)', role: 'Member', class: 'bg-slate-50 border-slate-200' },
    { nr: 4, position: 'The Secretary to Government, Finance (Expenditure) Department', role: 'Member', class: 'bg-slate-50 border-slate-200' },
    { nr: 5, position: 'The Managing Director, ELCOT', role: 'Member', class: 'bg-slate-50 border-slate-200' },
    { nr: 6, position: 'The Managing Director, TACTV', role: 'Member', class: 'bg-slate-50 border-slate-200' },
    { nr: 7, position: 'The Registrar of Co-operative Societies', role: 'Member', class: 'bg-slate-50 border-slate-200' },
    { nr: 8, position: 'The Managing Director, TN Corporation for Development of Women', role: 'Member', class: 'bg-slate-50 border-slate-200' }
];
const initiatives = [
    {
        title: 'National e-Governance Plan (NeGP)',
        icon: Network,
        content: 'Tamil Nadu has progressively aligned its e-Governance strategies in consonance with NeGP since its formulation in May 2006. TN Kuviyam extends this vision into a modern, unified citizen interface layer.'
    },
    {
        title: 'Common Service Centres (CSCs / e-Sevai)',
        icon: Building2,
        content: 'CSCs and e-Sevai Centres across rural and urban districts act as essential last-mile delivery networks, ensuring citizens are supported by assisted service operators.'
    },
    {
        title: 'State Infrastructure Backbone',
        icon: Layers,
        content: 'Secured via high-speed Tamil Nadu State Wide Area Network (TNSWAN), State Data Centre (SDC), and State Resident Data Hub (SRDH) to ensure authenticated, real-time service orchestration.'
    }
];
</script>

<svelte:head>
  <title>{t('about.title')}</title>
</svelte:head>

<div class="bg-background min-h-screen pb-12 text-text">
  <!-- Hero Banner -->
  <div class="public-banner">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-bold tracking-tight leading-tight">{t('about.heading')}</h1>
      <p class="public-banner-subtitle mt-2 max-w-2xl text-sm leading-relaxed">{t('about.desc')}</p>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-6 py-8 sm:px-8 space-y-8">
    <!-- Nodal Agency & Vision Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- About TNeGA -->
      <div class="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Shield class="h-5 w-5" />
          </div>
          <h2 class="mb-2 text-base font-bold text-text">Tamil Nadu e-Governance Agency (TNeGA)</h2>
          <p class="text-xs leading-relaxed text-text-muted">
            Formed State Nodal Agency under the Information Technology Department, Government of Tamil Nadu, TNeGA is mandated to drive all e-Governance initiatives across the state.
          </p>
          <p class="mt-2 text-xs leading-relaxed text-text-muted">
            TNeGA implements key projects with the core objective of making all government services accessible to the common man through efficient, transparent, and reliable digital delivery channels, reducing administrative costs and processing times.
          </p>
        </div>
        <div class="mt-4 border-t border-border pt-3 text-[11px] font-bold text-text-faint">
          Formed vide G.O. (Ms.) No.8 IT (Admin.1) Dept
        </div>
      </div>

      <!-- Fulfilling the Vision -->
      <div class="rounded-2xl border border-border bg-surface-container p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Eye class="h-5 w-5" />
          </div>
          <h2 class="mb-2 text-base font-bold text-text">Fulfilling the Vision</h2>
          <p class="text-xs leading-relaxed text-text-muted">
            The guiding policy is to achieve integrated service delivery to citizens at the nearest location at an affordable cost. This is made possible by combining:
          </p>
          <ul class="mt-3 space-y-2 text-xs font-medium text-text">
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Simple and unified front-end delivery interfaces (TN Kuviyam)</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Robust backend computerization and database management</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Secure, high-bandwidth state network connectivity</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Comprehensive MIS and analytics dashboards for operational tracking</span>
            </li>
          </ul>
        </div>
        <div class="mt-4 border-t border-border pt-3 text-[11px] font-bold text-text-faint">
          Mandate: Affordability, Accessibility, and Reliability
        </div>
      </div>
    </div>

    <!-- Governing Committee -->
    <div class="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary-soft blur-3xl opacity-40"></div>
      
      <div class="text-center mb-12 sm:mb-16 relative z-10">
        <h2 class="text-2xl font-black text-text">Agency Governing Committee</h2>
        <p class="mx-auto mt-2 max-w-2xl text-xs text-text-muted sm:text-sm">
          Under official guidelines, TNeGA consists of members guiding technology policies and administrative approvals.
        </p>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto">
        <!-- Vertical Line connecting top nodes -->
        <div class="absolute bottom-8 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-border-strong via-border to-transparent sm:block"></div>

        <div class="space-y-6 sm:space-y-10">
          
          <!-- Chairman -->
          <div class="relative flex justify-center">
            <div class="relative z-10 w-full transform rounded-2xl bg-primary px-6 py-4 text-center text-white shadow-lg transition hover:scale-105 sm:w-96">
              <span class="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/65">Chairman</span>
              <h3 class="text-sm font-bold leading-tight">{committeeMembers[0].position}</h3>
            </div>
          </div>

          <!-- Member Secretary -->
          <div class="relative flex justify-center">
            <div class="relative z-10 w-full transform rounded-2xl border-2 border-primary/20 bg-surface-container px-6 py-4 text-center shadow-sm transition hover:border-primary/40 sm:w-96">
              <span class="mb-1 block text-[10px] font-black uppercase tracking-widest text-primary">Member Secretary</span>
              <h3 class="text-sm font-bold leading-tight text-text">{committeeMembers[1].position}</h3>
            </div>
          </div>

          <!-- Members Grid (Clean list format) -->
          <div class="pt-6 sm:pt-10 relative">
            <!-- Horizontal connecting line -->
            <div class="absolute top-0 left-[15%] right-[15%] hidden h-px bg-border-strong sm:block"></div>
            <div class="absolute top-0 left-[15%] hidden h-8 w-px bg-border-strong sm:block"></div>
            <div class="absolute top-0 left-1/2 hidden h-8 w-px -translate-x-1/2 bg-border-strong sm:block"></div>
            <div class="absolute top-0 right-[15%] hidden h-8 w-px bg-border-strong sm:block"></div>
            
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2 sm:pt-8 relative z-10">
              {#each committeeMembers.slice(2) as member}
                <div class="group flex items-start gap-3 rounded-2xl border border-border bg-surface-container p-4 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white group-hover:shadow-md">
                    <div class="h-2 w-2 rounded-full bg-current transition-colors"></div>
                  </div>
                  <div>
                    <span class="mb-0.5 block text-[9px] font-black uppercase tracking-widest text-text-faint">{member.role}</span>
                    <h3 class="text-xs font-bold leading-snug text-text transition group-hover:text-primary">{member.position}</h3>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Infrastructure & Delivery Channels -->
    <div class="grid gap-6 md:grid-cols-3">
      {#each initiatives as init}
        <div class="rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <init.icon class="h-5 w-5" />
          </div>
          <h3 class="mb-2 text-sm font-black text-text">{init.title}</h3>
          <p class="text-xs font-medium leading-relaxed text-text-muted">{init.content}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
