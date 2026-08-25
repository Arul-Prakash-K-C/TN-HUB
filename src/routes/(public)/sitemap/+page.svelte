<script lang="ts">
  import { Map, Link2, Building2 } from '@lucide/svelte';
  import { t } from '$lib/i18n';

  const sitemapGroups = [
    { title: 'Main Navigation', links: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'Services Offered', href: '/services' },
      { name: 'Application Tracking', href: '/applications' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Service Tutorials', href: '/tutorials' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help & FAQs', href: '/help' },
      { name: 'Sitemap', href: '/sitemap' }
    ]},
    { title: 'Department Services', isDeptList: true, departments: [
      { name: 'Revenue Department', href: '/services?department=revenue', count: '15+ services' },
      { name: 'Civil Supplies', href: '/services?department=civil_supplies', count: '8+ services' },
      { name: 'Transport Department', href: '/services?department=transport', count: '10+ services' },
      { name: 'Health & Family Welfare', href: '/services?department=health', count: '12+ services' },
      { name: 'Education Department', href: '/services?department=education', count: '6+ services' },
      { name: 'Social Welfare', href: '/services?department=social_welfare', count: '9+ services' },
      { name: 'Labour Department', href: '/services?department=labour', count: '5+ services' },
      { name: 'Agriculture Department', href: '/services?department=agriculture', count: '7+ services' },
      { name: 'Local Government', href: '/services?department=local_government', count: '8+ services' },
      { name: 'Drugs Control', href: '/services?department=drugs_control', count: '4+ services' }
    ]},
    { title: 'Help & Support', links: [
      { name: 'Frequently Asked Questions', href: '/help' },
      { name: 'Grievances / Complaints', href: '/complaints' },
      { name: 'Policies & Guidelines', href: '/help#policies' },
      { name: 'Contact Support', href: '/contact' },
      { name: 'Service Tutorials', href: '/tutorials' }
    ]}
  ];
</script>

<svelte:head>
  <title>{t('sitemap.title')}</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen pb-16">
  <div class="bg-primary-950 text-white border-b border-primary-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl text-white">{t('sitemap.heading')}</h1>
      <p class="mt-2 text-sm text-slate-300">{t('sitemap.subheading')}</p>
    </div>
  </div>

  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {#each sitemapGroups as group}
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm {group.isDeptList ? 'sm:col-span-2 lg:col-span-1' : ''}">
          <h2 class="text-base font-bold text-primary-950 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            {#if group.isDeptList}
              <Building2 class="h-4 w-4 text-primary-600" />
            {:else}
              <Map class="h-4 w-4 text-primary-600" />
            {/if}
            {group.title}
          </h2>

          {#if group.isDeptList && group.departments}
            <ul class="space-y-2 text-xs font-semibold">
              {#each group.departments as dept}
                <li>
                  <a href={dept.href} class="flex items-center justify-between gap-2 text-slate-600 hover:text-primary-600 transition py-1.5 group">
                    <span class="flex items-center gap-2">
                      <Building2 class="h-3.5 w-3.5 text-primary-400 group-hover:text-primary-600 transition" />
                      {dept.name}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">{dept.count}</span>
                  </a>
                </li>
              {/each}
            </ul>
          {:else if group.links}
            <ul class="space-y-2 text-xs font-semibold">
              {#each group.links as item}
                <li>
                  <a href={item.href} class="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition py-1">
                    <Link2 class="h-3.5 w-3.5 text-primary-500" />
                    {item.name}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
