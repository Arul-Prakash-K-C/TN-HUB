<script lang="ts">
  import DepartmentSidebar from '$lib/components/layout/DepartmentSidebar.svelte';
  import MobileHeader from '$lib/components/layout/MobileHeader.svelte';

  let { children } = $props();
  let isMobileMenuOpen = $state(false);
</script>

<div class="flex h-screen overflow-hidden">
  <DepartmentSidebar bind:isOpen={isMobileMenuOpen} />
  
  <main id="main-content" class="flex-1 flex flex-col md:ml-64 h-screen overflow-y-auto">
    <MobileHeader bind:isOpen={isMobileMenuOpen} portal="department" />
    
    <div class="flex-1 flex flex-col">
      {@render children()}
    </div>
  </main>
</div>
