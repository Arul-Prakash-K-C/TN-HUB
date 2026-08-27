<script>
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { loadSavedTheme } from '$lib/utils/theme';
  import FeatureNoticeModal from '$lib/components/ui/FeatureNoticeModal.svelte';
  import { toasts, showToast } from '$lib/stores/toast';
  import { Bell } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  import { t, locale } from '$lib/i18n';

  let { data, children } = $props();
  let AiChatWidgetComponent = $state(null);
  const currentLocale = $derived($locale);

  onMount(() => {
    auth.setInitialUser(data.user);
    auth.restore();
    loadSavedTheme();
    
    // Lazy load AI Chat Widget after initial render
    import('$lib/components/ui/AiChatWidget.svelte').then((module) => {
      AiChatWidgetComponent = module.default;
    });

    // Poll for real-time in-app notifications
    let lastFetchedTime = Date.now();
    const interval = setInterval(async () => {
      // Only poll if user is authenticated and session is active
      if (!data.user) return;
      try {
        const res = await fetch('/api/notifications', { credentials: 'same-origin' });
        if (!res.ok) return;
        const body = await res.json();
        const notifications = body.notifications || [];
        
        // Filter for unread notifications that arrived after layout mount/last check
        const newUnread = notifications.filter(n => !n.isRead && new Date(n.createdAt).getTime() > lastFetchedTime);
        if (newUnread.length > 0) {
          lastFetchedTime = Math.max(...newUnread.map(n => new Date(n.createdAt).getTime()));
          newUnread.reverse().forEach(n => {
            showToast(
              currentLocale === 'ta' ? n.titleTA : n.title,
              currentLocale === 'ta' ? n.messageTA : n.message,
              'info'
            );
          });
        }
      } catch (err) {
        // fail silently
      }
    }, 10000);

    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>{t('app.title')}</title>
</svelte:head>

<div class="min-h-screen bg-background font-sans text-text">
  {@render children()}

  <!-- Global Floating AI Chat Widget -->
  {#if !$page.url.pathname.includes('/chatbot') && !$page.url.pathname.startsWith('/login') && !$page.url.pathname.startsWith('/admin') && AiChatWidgetComponent}
    <AiChatWidgetComponent />
  {/if}

  <!-- Global Feature Notice Modal -->
  <FeatureNoticeModal />

  <!-- Global Toasts Container -->
  <div class="fixed bottom-6 right-6 z-[120] space-y-3 pointer-events-none max-w-sm w-full">
    {#each $toasts as toast (toast.id)}
      <div
        transition:fade={{ duration: 150 }}
        class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface p-4 shadow-2xl border-border/60 animate-scale-up text-xs font-semibold text-text"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary-soft text-primary">
          <Bell class="h-4 w-4" />
        </div>
        <div class="flex-1">
          <div class="font-black text-text">{toast.title}</div>
          <div class="text-text-muted mt-0.5 leading-relaxed font-medium">{toast.message}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
