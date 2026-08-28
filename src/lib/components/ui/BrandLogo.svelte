<script>
  let {
    showWordmark = false,
    subtitle = '',
    sizeClass = '',
    subtitleClass = 'text-[9px]',
    subtitleOffsetClass = ''
  } = $props();

  const imageSizeClass = $derived(sizeClass || (showWordmark ? 'w-full max-w-[236px] max-h-[84px]' : 'w-10 max-w-10 max-h-10'));
</script>

<div class="flex min-w-0 flex-col items-center justify-center gap-2">
  <div class={`shrink-0 bg-transparent ${imageSizeClass}`}>
    <img src="/logo.png" alt="TN Kuviyam logo" class="block h-full w-full rounded-lg object-contain" />
  </div>

  {#if showWordmark && subtitle}
    <div class="flex min-w-0 flex-col text-center">
      {#if subtitle}
        <div class={`font-bold uppercase tracking-wider text-[var(--color-sidebar-text-muted)] leading-tight ${subtitleOffsetClass} ${subtitleClass}`}>
          {subtitle}
        </div>
      {/if}
    </div>
  {/if}
</div>
