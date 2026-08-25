<script lang="ts">
  import { page } from '$app/stores';
  import { LayoutDashboard, Inbox, Bell, User, Settings, LogOut, BarChart3, ShieldCheck, PhoneCall } from '@lucide/svelte';
  import { auth, currentUser } from '$lib/stores/auth';
  import LogoutModal from '$lib/components/ui/LogoutModal.svelte';
  import { t } from '$lib/i18n';

  let { isOpen = $bindable(false) } = $props();
  let showLogoutModal = $state(false);

  const user = $derived($currentUser);

  function isActive(path: string) {
    if (path === '/department/dashboard' && $page.url.pathname === '/department/dashboard') return true;
    if (path !== '/department/dashboard' && $page.url.pathname.startsWith(path)) return true;
    return false;
  }

  $effect(() => {
    if ($page.url.pathname) {
      isOpen = false;
    }
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#071A28]/60 backdrop-blur-xs z-40 md:hidden transition-opacity" onclick={() => isOpen = false} aria-hidden="true"></div>
{/if}

<aside class="flex flex-col py-6 px-4 gap-6 h-screen w-64 fixed left-0 top-0 z-50 bg-[#062206] text-white border-r border-[#143A14] transition-transform duration-300 ease-in-out md:translate-x-0 {isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}">
  <!-- Brand Header -->
  <a href="/department/dashboard" class="flex items-center gap-3 px-2 hover:opacity-90 transition">
    <div class="w-10 h-10 rounded-full bg-[#82da85] text-[#062206] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
      TN
    </div>
    <div class="flex flex-col overflow-hidden">
      <span class="font-extrabold text-sm tracking-tight text-white leading-tight">Sympho Center</span>
      <span class="text-[10px] font-bold text-[#9df79e] uppercase tracking-wider truncate">
        {user?.departmentName || 'Revenue Department'}
      </span>
    </div>
  </a>

  <!-- Officer Department Badge Card -->
  {#if user}
    <div class="rounded-xl border border-[#143A14] bg-[#0c310c]/80 p-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-[#9df79e]/20 border border-[#9df79e]/30 text-[#9df79e] font-bold flex items-center justify-center text-xs shrink-0">
          {user.name.charAt(0)}
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-bold text-white truncate">{user.name}</div>
          <div class="text-[10px] text-slate-300 font-medium truncate">{user.role || 'DEPARTMENT_USER'}</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Navigation Links -->
  <nav class="flex flex-col gap-1 flex-grow">
    <a 
      href="/department/dashboard" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/department/dashboard') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <LayoutDashboard class="h-4 w-4 shrink-0" />
      <span>{t('nav.dashboard')}</span>
    </a>

    <a 
      href="/department/applications" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/department/applications') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <Inbox class="h-4 w-4 shrink-0" />
      <span>{t('dept.applicationsQueue')}</span>
    </a>

    <a 
      href="/department/notifications" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/department/notifications') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <Bell class="h-4 w-4 shrink-0" />
      <span>{t('nav.notifications')}</span>
    </a>

    <a 
      href="/department/reports" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/department/reports') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <BarChart3 class="h-4 w-4 shrink-0" />
      <span>{t('dept.reports')}</span>
    </a>

    <a 
      href="/department/profile" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/department/profile') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <User class="h-4 w-4 shrink-0" />
      <span>{t('department.profile')}</span>
    </a>

    <a 
      href="/department/settings" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/department/settings') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <Settings class="h-4 w-4 shrink-0" />
      <span>{t('nav.settings')}</span>
    </a>

    <a 
      href="/contact" 
      class="flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-lg transition-all text-xs {isActive('/contact') ? 'bg-[#143A14] text-white font-bold border-l-4 border-[#9df79e]' : 'text-white/70 hover:text-white hover:bg-[#143A14]/50'}"
    >
      <PhoneCall class="h-4 w-4 shrink-0" />
      <span>{t('footer.contact')}</span>
    </a>
  </nav>

  <!-- Sign out -->
  <div class="mt-auto border-t border-[#143A14] pt-4">
    <button 
      onclick={() => showLogoutModal = true}
      class="flex items-center gap-3 px-3.5 py-2.5 text-rose-300 font-bold text-xs rounded-lg hover:bg-rose-950/40 transition-all w-full text-left"
    >
      <LogOut class="h-4 w-4 shrink-0" />
      <span>{t('logout.officialBtn')}</span>
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
