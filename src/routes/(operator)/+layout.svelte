<script>

  import OperatorSidebar from '$lib/components/layout/OperatorSidebar.svelte';
  
const t = $derived($tt);
import MobileHeader from '$lib/components/layout/MobileHeader.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import GlassLoader from '$lib/components/ui/GlassLoader.svelte';
  import { isRestored, userRole } from '$lib/stores/auth';
  import { tt } from '$lib/i18n';

let { data, children } = $props();
let isMobileMenuOpen = $state(false);
const restored = $derived($isRestored || data.user !== undefined);
const role = $derived($userRole ?? data.user?.role ?? null);
</script>

{#if !restored}
  <main id="main-content" class="min-h-screen bg-background text-text">
    <GlassLoader message={t('auth.restoringSession')} />
  </main>
{:else if role === 'operator'}
  <div class="flex h-dvh overflow-hidden">
    <OperatorSidebar bind:isOpen={isMobileMenuOpen} />

    <main id="main-content" class="flex-1 flex flex-col md:ml-64 h-dvh overflow-y-auto">
      <MobileHeader bind:isOpen={isMobileMenuOpen} portal="operator" />
      <div class="flex-1 flex flex-col">
        {@render children()}
      </div>
      <Footer />
    </main>
  </div>
{:else}
  <main id="main-content" class="min-h-screen bg-background text-text">
    {@render children()}
  </main>
{/if}
