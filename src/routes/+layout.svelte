<script lang="ts">
  import '../app.css';
  import AiChatWidget from '$lib/components/ui/AiChatWidget.svelte';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  import { t, locale } from '$lib/i18n';

  let { children } = $props();

  onMount(() => {
    auth.restore();
  });
</script>

<svelte:head>
  <title>{t('app.title')}</title>
</svelte:head>

<div class="bg-slate-50 font-sans text-slate-900 min-h-screen">
  {@render children()}

  <!-- Global Floating AI Chat Widget -->
  <AiChatWidget />
</div>
