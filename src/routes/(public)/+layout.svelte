<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import MobileHeader from '$lib/components/layout/MobileHeader.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { isAuthenticated } from '$lib/stores/auth';

  let { children } = $props();
  let isMobileMenuOpen = $state(false);
  const authenticated = $derived($isAuthenticated);
</script>

{#if authenticated}
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
