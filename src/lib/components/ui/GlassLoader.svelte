<script>

  import { t } from '$lib/i18n';

let { message = t('loader.loading'), fullScreen = false } = $props();
</script>

{#if fullScreen}
  <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/20 backdrop-blur-md">
    <div class="flex flex-col items-center justify-center bg-surface/60 border border-border/40 shadow-lg rounded-3xl p-8 backdrop-blur-lg">
      <div class="relative w-12 h-12 mb-4">
        <div class="absolute inset-0 rounded-full border-4 border-border/40"></div>
        <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-bold text-text animate-pulse">{message}</p>
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
    <div class="flex flex-col items-center justify-center bg-surface/60 border border-border/40 shadow-sm rounded-3xl p-8 backdrop-blur-lg w-full max-w-sm mx-auto">
      <div class="relative w-10 h-10 mb-4">
        <div class="absolute inset-0 rounded-full border-4 border-border/40"></div>
        <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-bold text-text animate-pulse">{message}</p>
    </div>
  </div>
{/if}
