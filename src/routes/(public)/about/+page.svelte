<script>

  import { Eye, Building2, Shield, Briefcase, FileText, Users, Award, Sparkles, Network, Layers, CheckCircle2 } from '@lucide/svelte';
  import { tt } from '$lib/i18n';

const t = $derived($tt);

const committeeMembers = [
    { nr: 1, positionKey: 'about.committee.principalSecretary', roleKey: 'about.committee.chairman', class: 'bg-primary-950 text-white' },
    { nr: 2, positionKey: 'about.committee.ceo', roleKey: 'about.committee.memberSecretary', class: 'bg-primary-500/10 border-primary-500/30 text-primary-950' },
    { nr: 3, positionKey: 'about.committee.stateInformaticsOfficer', roleKey: 'about.committee.member', class: 'bg-slate-50 border-slate-200' },
    { nr: 4, positionKey: 'about.committee.financeSecretary', roleKey: 'about.committee.member', class: 'bg-slate-50 border-slate-200' },
    { nr: 5, positionKey: 'about.committee.elcotManagingDirector', roleKey: 'about.committee.member', class: 'bg-slate-50 border-slate-200' },
    { nr: 6, positionKey: 'about.committee.tactvManagingDirector', roleKey: 'about.committee.member', class: 'bg-slate-50 border-slate-200' },
    { nr: 7, positionKey: 'about.committee.cooperativeRegistrar', roleKey: 'about.committee.member', class: 'bg-slate-50 border-slate-200' },
    { nr: 8, positionKey: 'about.committee.womenDevelopmentManagingDirector', roleKey: 'about.committee.member', class: 'bg-slate-50 border-slate-200' }
];
const initiatives = [
    {
        titleKey: 'about.initiatives.negp.title',
        icon: Network,
        contentKey: 'about.initiatives.negp.content'
    },
    {
        titleKey: 'about.initiatives.csc.title',
        icon: Building2,
        contentKey: 'about.initiatives.csc.content'
    },
    {
        titleKey: 'about.initiatives.infrastructure.title',
        icon: Layers,
        contentKey: 'about.initiatives.infrastructure.content'
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
      <!-- About TN Kuviyam -->
      <div class="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Shield class="h-5 w-5" />
          </div>
          <h2 class="mb-2 text-base font-bold text-text">{t('about.agencyTitle')}</h2>
          <p class="text-xs leading-relaxed text-text-muted">
            {t('ui.formed.state.nodal.agency.under.the.information.technology.department.government')}
          </p>
          <p class="mt-2 text-xs leading-relaxed text-text-muted">
            {t('about.agencyP2')}
          </p>
        </div>
        <div class="mt-4 border-t border-border pt-3 text-[11px] font-bold text-text-faint">
          {t('ui.formed.vide.g.o.ms.no.8.it.admin.1.dept')}
        </div>
      </div>

      <!-- Fulfilling the Vision -->
      <div class="rounded-2xl border border-border bg-surface-container p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Eye class="h-5 w-5" />
          </div>
          <h2 class="mb-2 text-base font-bold text-text">{t('ui.routes.public.about.be36cc4c')}</h2>
          <p class="text-xs leading-relaxed text-text-muted">
            {t('about.visionDesc')}
          </p>
          <ul class="mt-3 space-y-2 text-xs font-medium text-text">
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t('ui.routes.public.about.72d3d57b')}</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t('ui.routes.public.about.9119d548')}</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t('ui.routes.public.about.b500d84f')}</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t('ui.routes.public.about.01ce1cc5')}</span>
            </li>
          </ul>
        </div>
        <div class="mt-4 border-t border-border pt-3 text-[11px] font-bold text-text-faint">
          {t('ui.mandate.affordability.accessibility.and.reliability')}
        </div>
      </div>
    </div>

    <!-- Governing Committee -->
    <div class="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary-soft blur-3xl opacity-40"></div>
      
      <div class="text-center mb-12 sm:mb-16 relative z-10">
        <h2 class="text-2xl font-black text-text">{t('ui.routes.public.about.3b699834')}</h2>
        <p class="mx-auto mt-2 max-w-2xl text-xs text-text-muted sm:text-sm">
          {t('ui.under.official.guidelines.kuviyam.consists.of.members.guiding.technology.policies.')}
        </p>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto">
        <!-- Vertical Line connecting top nodes -->
        <div class="absolute bottom-8 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-border-strong via-border to-transparent sm:block"></div>

        <div class="space-y-6 sm:space-y-10">
          
          <!-- Chairman -->
          <div class="relative flex justify-center">
            <div class="relative z-10 w-full transform rounded-2xl bg-primary px-6 py-4 text-center text-white shadow-lg transition hover:scale-105 sm:w-96">
              <span class="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/65">{t('ui.routes.public.about.5dffd3e6')}</span>
              <h3 class="text-sm font-bold leading-tight">{t(committeeMembers[0].positionKey)}</h3>
            </div>
          </div>

          <!-- Member Secretary -->
          <div class="relative flex justify-center">
            <div class="relative z-10 w-full transform rounded-2xl border-2 border-primary/20 bg-surface-container px-6 py-4 text-center shadow-sm transition hover:border-primary/40 sm:w-96">
              <span class="mb-1 block text-[10px] font-black uppercase tracking-widest text-primary">{t('ui.routes.public.about.48a5a2e1')}</span>
              <h3 class="text-sm font-bold leading-tight text-text">{t(committeeMembers[1].positionKey)}</h3>
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
                    <span class="mb-0.5 block text-[9px] font-black uppercase tracking-widest text-text-faint">{t(member.roleKey)}</span>
                    <h3 class="text-xs font-bold leading-snug text-text transition group-hover:text-primary">{t(member.positionKey)}</h3>
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
          <h3 class="mb-2 text-sm font-black text-text">{t(init.titleKey)}</h3>
          <p class="text-xs font-medium leading-relaxed text-text-muted">{t(init.contentKey)}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
