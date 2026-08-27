<script>

  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import OperatorSidebar from '$lib/components/layout/OperatorSidebar.svelte';
  import MobileHeader from '$lib/components/layout/MobileHeader.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import GlassLoader from '$lib/components/ui/GlassLoader.svelte';
  import { isRestored, userRole } from '$lib/stores/auth';
  import { t } from '$lib/i18n';

let { data, children } = $props();
let isMobileMenuOpen = $state(false);
const restored = $derived($isRestored || data.user !== undefined);
const role = $derived($userRole ?? data.user?.role ?? null);
</script>

{#if !restored}
  <main id="main-content" class="min-h-screen bg-background">
    <GlassLoader message={t('auth.restoringSession')} />
  </main>
{:else if role === 'citizen' || role === 'operator'}
  <div class="flex h-dvh overflow-hidden">
    {#if role === 'operator'}
      <OperatorSidebar bind:isOpen={isMobileMenuOpen} />
    {:else}
      <Sidebar bind:isOpen={isMobileMenuOpen} />
    {/if}

    <main id="main-content" class="flex-1 flex flex-col md:ml-64 h-dvh overflow-y-auto">
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
