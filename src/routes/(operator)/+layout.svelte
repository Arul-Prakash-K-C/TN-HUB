<script lang="ts">
  import OperatorSidebar from '$lib/components/layout/OperatorSidebar.svelte';
  import MobileHeader from '$lib/components/layout/MobileHeader.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';

  let { children } = $props();
  let isMobileMenuOpen = $state(false);
</script>

<div class="flex h-screen overflow-hidden">
  <OperatorSidebar bind:isOpen={isMobileMenuOpen} />
  
  <main id="main-content" class="flex-1 flex flex-col md:ml-64 h-screen overflow-y-auto">
    <MobileHeader bind:isOpen={isMobileMenuOpen} portal="operator" />
    
    <div class="flex-1 flex flex-col">
      {@render children()}
    </div>
    
    <Footer />
  </main>
</div>
