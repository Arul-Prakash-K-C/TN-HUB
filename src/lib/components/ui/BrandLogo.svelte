<script>
  let {
    showWordmark = false,
    subtitle = '',
    sizeClass = 'h-10 w-10',
    wordmarkClass = 'text-sm',
    subtitleClass = 'text-[9px]'
  } = $props();
</script>

<div class="flex items-center gap-3">
  <div class={`overflow-hidden rounded-2xl border border-border bg-white shadow-sm ${sizeClass}`}>
    <img src="/logo.png" alt="TN Hub logo" class="h-full w-full object-contain p-1.5" />
  </div>

  {#if showWordmark}
    <div class="flex flex-col overflow-hidden">
      <div class={`font-extrabold tracking-tight leading-none text-primary ${wordmarkClass}`}>TN Hub</div>
      {#if subtitle}
        <div class={`mt-0.5 font-bold uppercase tracking-wider text-primary/90 leading-tight ${subtitleClass}`}>
          {subtitle}
        </div>
      {/if}
    </div>
  {/if}
</div>
