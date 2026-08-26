<script lang="ts">
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { loadSavedTheme } from '$lib/utils/theme';

  import { t, locale } from '$lib/i18n';

  let { data, children } = $props();
  let AiChatWidgetComponent = $state<any>(null);

  onMount(() => {
    auth.setInitialUser(data.user);
    auth.restore();
    loadSavedTheme();

    // Lazy load AI Chat Widget after initial render
    import('$lib/components/ui/AiChatWidget.svelte').then((module) => {
      AiChatWidgetComponent = module.default;
    });
  });
</script>

<svelte:head>
  <title>{t('app.title')}</title>
</svelte:head>

<div class="min-h-screen bg-background font-sans text-text">
  {@render children()}

  <!-- Global Floating AI Chat Widget -->
  {#if !$page.url.pathname.includes('/chatbot') && AiChatWidgetComponent}
    <AiChatWidgetComponent />
  {/if}
</div>
