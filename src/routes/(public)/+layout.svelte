<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import MobileHeader from '$lib/components/layout/MobileHeader.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import GlassLoader from '$lib/components/ui/GlassLoader.svelte';
  import { isAuthenticated, isLoading, isRestored, userRole } from '$lib/stores/auth';
  import { t } from '$lib/i18n';

  let { data, children } = $props();
  let isMobileMenuOpen = $state(false);
  const authenticated = $derived($isAuthenticated || Boolean(data.user));
  const loading = $derived($isLoading && !data.user);
  const restored = $derived($isRestored || data.user !== undefined);
  const role = $derived($userRole ?? data.user?.role ?? null);
</script>

{#if loading || !restored}
  <div class="flex min-h-screen flex-col bg-slate-50">
    <main id="main-content" class="flex-1">
      <GlassLoader message={t('auth.restoringSession')} />
    </main>
  </div>
{:else if authenticated && role === 'citizen'}
  <div class="flex h-screen overflow-hidden">
    <Sidebar bind:isOpen={isMobileMenuOpen} />
    
    <main id="main-content" class="flex-1 flex flex-col md:ml-64 h-screen overflow-y-auto">
      <MobileHeader bind:isOpen={isMobileMenuOpen} />
      
      <div class="flex-1 flex flex-col">
        {@render children()}
      </div>
      
      <Footer />
    </main>
  </div>
{:else}
  <div class="flex min-h-screen flex-col">
    <Header />
    
    <main id="main-content" class="flex-1 flex flex-col">
      <div class="flex-1 flex flex-col">
        {@render children()}
      </div>
      
      <Footer />
    </main>
  </div>
{/if}
