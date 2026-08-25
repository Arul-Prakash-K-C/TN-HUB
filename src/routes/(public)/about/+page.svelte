<script lang="ts">
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
      content: 'Tamil Nadu has progressively aligned its e-Governance strategies in consonance with NeGP since its formulation in May 2006. TN Hub extends this vision into a modern, unified citizen interface layer.'
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

<div class="bg-slate-50 min-h-screen pb-12">
  <!-- Hero -->
  <div class="bg-gradient-to-br from-[#062206] via-[#0a3d0a] to-[#062206] text-white border-b border-emerald-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{t('about.heading')}</h1>
      <p class="mt-3 text-base text-emerald-200/80 max-w-2xl leading-relaxed">{t('about.desc')}</p>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-6 py-8 sm:px-8 space-y-8">
    <!-- Nodal Agency & Vision Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- About TNeGA -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
            <Shield class="h-5 w-5" />
          </div>
          <h2 class="text-base font-bold text-slate-900 mb-2">Tamil Nadu e-Governance Agency (TNeGA)</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Formed as the State Nodal Agency under the Information Technology Department, Government of Tamil Nadu, TNeGA is mandated to drive all e-Governance initiatives across the state.
          </p>
          <p class="text-xs text-slate-600 leading-relaxed mt-2">
            TNeGA implements key projects with the core objective of making all government services accessible to the common man through efficient, transparent, and reliable digital delivery channels, reducing administrative costs and processing times.
          </p>
        </div>
        <div class="mt-4 border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-400">
          Formed vide G.O. (Ms.) No.8 IT (Admin.1) Dept
        </div>
      </div>

      <!-- Fulfilling the Vision -->
      <div class="rounded-2xl border border-slate-200 bg-[#F0F8FF] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-4">
            <Eye class="h-5 w-5" />
          </div>
          <h2 class="text-base font-bold text-slate-900 mb-2">Fulfilling the Vision</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            The guiding policy is to achieve integrated service delivery to citizens at the nearest location at an affordable cost. This is made possible by combining:
          </p>
          <ul class="mt-3 space-y-2 text-xs font-medium text-slate-700">
            <li class="flex items-start gap-2">
              <CheckCircle2 class="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Simple and unified front-end delivery interfaces (TN Hub)</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Robust backend computerization and database management</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Secure, high-bandwidth state network connectivity</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Comprehensive MIS and analytics dashboards for operational tracking</span>
            </li>
          </ul>
        </div>
        <div class="mt-4 border-t border-slate-200/50 pt-3 text-[11px] font-bold text-slate-400">
          Mandate: Affordability, Accessibility, and Reliability
        </div>
      </div>
    </div>

    <!-- Governing Committee -->
    <div class="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm overflow-hidden relative">
      <!-- Decorative background -->
      <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary-50 blur-3xl opacity-50"></div>
      
      <div class="text-center mb-12 sm:mb-16 relative z-10">
        <h2 class="text-2xl font-black text-primary-950">Agency Governing Committee</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
          Under official guidelines, TNeGA consists of members guiding technology policies and administrative approvals.
        </p>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto">
        <!-- Vertical Line connecting top nodes -->
        <div class="absolute left-1/2 top-0 bottom-8 w-px bg-gradient-to-b from-primary-200 via-primary-200/50 to-transparent -translate-x-1/2 hidden sm:block"></div>

        <div class="space-y-6 sm:space-y-10">
          
          <!-- Chairman -->
          <div class="relative flex justify-center">
            <div class="bg-primary-950 text-white rounded-2xl px-6 py-4 shadow-lg w-full sm:w-96 text-center z-10 relative transform transition hover:scale-105">
              <span class="block text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Chairman</span>
              <h3 class="text-sm font-bold leading-tight">{committeeMembers[0].position}</h3>
            </div>
          </div>

          <!-- Member Secretary -->
          <div class="relative flex justify-center">
            <div class="bg-white border-2 border-primary-100 rounded-2xl px-6 py-4 shadow-sm w-full sm:w-96 text-center z-10 relative transform transition hover:border-primary-300">
              <span class="block text-[10px] font-black uppercase tracking-widest text-primary-600 mb-1">Member Secretary</span>
              <h3 class="text-sm font-bold text-primary-950 leading-tight">{committeeMembers[1].position}</h3>
            </div>
          </div>

          <!-- Members Grid (Clean list format) -->
          <div class="pt-6 sm:pt-10 relative">
            <!-- Horizontal connecting line -->
            <div class="absolute top-0 left-[15%] right-[15%] h-px bg-primary-200 hidden sm:block"></div>
            <!-- Small vertical ticks down to the columns -->
            <div class="absolute top-0 left-[15%] w-px h-8 bg-primary-200 hidden sm:block"></div>
            <div class="absolute top-0 left-1/2 w-px h-8 bg-primary-200 -translate-x-1/2 hidden sm:block"></div>
            <div class="absolute top-0 right-[15%] w-px h-8 bg-primary-200 hidden sm:block"></div>
            
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2 sm:pt-8 relative z-10">
              {#each committeeMembers.slice(2) as member}
                <div class="flex items-start gap-3 group bg-white sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-none border-slate-100">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-md">
                    <div class="h-2 w-2 rounded-full bg-current transition-colors"></div>
                  </div>
                  <div>
                    <span class="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{member.role}</span>
                    <h3 class="text-xs font-bold text-slate-800 leading-snug group-hover:text-primary-700 transition">{member.position}</h3>
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
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
            <init.icon class="h-5 w-5" />
          </div>
          <h3 class="text-sm font-black text-primary-950 mb-2">{init.title}</h3>
          <p class="text-xs text-slate-500 leading-relaxed font-medium">{init.content}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
