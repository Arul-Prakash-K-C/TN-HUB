<script>
  import { LogOut, X } from "@lucide/svelte";
  import { t } from "$lib/i18n";

  let { isOpen = $bindable(false), onConfirm } = $props();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop with custom backdrop-blur and animation -->
    <div
      class="absolute inset-0 bg-background/78 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
      onclick={() => (isOpen = false)}
    ></div>

    <!-- Modal Container -->
    <div
      class="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface shadow-vazhi-2 animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="p-6">
        <!-- Icon Container with Animated Glow and Rings -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="absolute inset-0 rounded-full bg-danger/20 blur-md animate-pulse"></div>
            <div class="relative w-14 h-14 bg-danger-soft text-danger border border-danger/10 rounded-full flex items-center justify-center shadow-inner">
              <LogOut class="w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- Title & Description -->
        <div class="text-center mb-6">
          <h3 class="text-lg font-extrabold text-text tracking-tight mb-2">
            {t("logout.confirmTitle")}
          </h3>
          <p class="text-xs text-text-muted px-2 leading-relaxed font-medium">
            {t("logout.confirmText")}
          </p>
        </div>

        <!-- Action Buttons with micro-interactions -->
        <div class="flex items-center gap-3 w-full">
          <button
            onclick={() => (isOpen = false)}
            class="flex-1 rounded-2xl border border-border bg-muted px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted transition-all duration-200 hover:bg-surface-container-high hover:text-text active:scale-95 cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            onclick={() => {
              isOpen = false;
              onConfirm();
            }}
            class="flex-1 rounded-2xl bg-danger px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-danger/10 transition-all duration-200 hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/20 active:scale-95 cursor-pointer"
          >
            {t("logout.confirmBtn")}
          </button>
        </div>
      </div>

      <!-- Close icon button -->
      <button
        onclick={() => (isOpen = false)}
        class="absolute top-4 right-4 rounded-lg p-1 text-text-faint transition-colors hover:bg-muted hover:text-text cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
{/if}
