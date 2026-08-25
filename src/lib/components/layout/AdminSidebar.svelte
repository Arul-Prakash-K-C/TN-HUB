<script lang="ts">
  import { page } from '$app/stores';
  import { LayoutDashboard, UserCheck, MessageCircleQuestion, BarChart3, Settings, UserCircle, HelpCircle, LogOut } from '@lucide/svelte';
  import { auth, isAuthenticated } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { t } from '$lib/i18n';

  const authenticated = $derived($isAuthenticated);
  
  function isActive(path: string) {
    const currentPath = $page.url.pathname as string;
    if (path === '/admin' && currentPath === '/admin') return true;
    if (path !== '/admin' && currentPath.startsWith(path)) return true;
    return false;
  }

  let { isOpen = $bindable(false) } = $props();
  let showLogoutModal = $state(false);

  $effect(() => {
    if ($page.url.pathname) {
      isOpen = false;
    }
  });

  const mainLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', labelTA: 'டாஷ்போர்டு' },
    { href: '/admin/approvals', icon: UserCheck, label: 'Registration Approvals', labelTA: 'பதிவு ஒப்புதல்கள்' },
    { href: '/admin/helpdesk', icon: MessageCircleQuestion, label: 'Help Desk & Inquiries', labelTA: 'உதவி மையம்' },
  ];

  const bottomLinks = [
    { href: '/admin/profile', icon: UserCircle, label: 'Profile', labelTA: 'சுயவிவரம்' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', labelTA: 'அமைப்புகள்' },
    { href: '/admin/help', icon: HelpCircle, label: 'Help & FAQ', labelTA: 'உதவி' },
  ];
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#071A28]/60 backdrop-blur-xs z-30 md:hidden transition-opacity" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="flex flex-col py-6 px-4 gap-6 h-screen w-64 fixed left-0 top-0 z-40 bg-[#062206] text-white border-r border-[#143A14] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/admin" class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <div class="w-10 h-10 rounded-full bg-[#82da85] text-[#062206] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
      TN
    </div>
    <div class="flex flex-col overflow-hidden">
      <span class="font-extrabold text-sm tracking-tight text-white leading-tight">TN Hub</span>
      <span class="text-[10px] font-bold text-[#9df79e] uppercase tracking-wider truncate">
        {t('admin.portal')}
      </span>
    </div>
  </a>

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    {#each mainLinks as link}
      <a 
        href={link.href} 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive(link.href) ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <link.icon class="h-4 w-4 shrink-0" />
        <span>{link.label}</span>
      </a>
    {/each}
  </nav>

  <div class="mt-auto flex flex-col gap-1 border-t border-[#143A14] pt-4">
    {#each bottomLinks as link}
      <a 
        href={link.href} 
        class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive(link.href) ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
      >
        <link.icon class="h-4 w-4 shrink-0" />
        <span>{link.label}</span>
      </a>
    {/each}

    <button 
      onclick={() => showLogoutModal = true}
      class="flex items-center gap-3 px-3.5 py-2.5 text-rose-300 font-bold text-xs rounded-lg hover:bg-rose-950/40 transition-all w-full text-left"
    >
      <LogOut class="h-4 w-4 shrink-0" />
      <span>{t('logout.confirmBtn')}</span>
    </button>
  </div>
</aside>

<LogoutModal 
  bind:isOpen={showLogoutModal} 
  onConfirm={async () => {
    await auth.logout();
    window.location.href = '/';
  }} 
/>
