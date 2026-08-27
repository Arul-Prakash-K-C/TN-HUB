<script>

  import { LogOut, X } from "@lucide/svelte";
  import { t } from "$lib/i18n";

let { isOpen = $bindable(false), onConfirm } = $props();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-[#071A28]/60 backdrop-blur-sm transition-opacity"
      onclick={() => (isOpen = false)}
    ></div>

    <div
      class="relative bg-surface dark:bg-surface-container-highest rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="p-6">
        <div
          class="w-12 h-12 bg-danger-soft text-danger rounded-full flex items-center justify-center mb-4"
        >
          <LogOut class="w-6 h-6" />
        </div>

        <h3 class="text-lg font-bold text-text mb-2">
          {t("logout.confirmTitle")}
        </h3>
        <p class="text-sm text-text-muted mb-6">{t("logout.confirmText")}</p>

        <div class="flex items-center gap-3 w-full">
          <button
            onclick={() => (isOpen = false)}
            class="flex-1 py-2.5 px-4 bg-surface-container text-text-muted font-bold text-sm rounded-xl hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onclick={() => {
              isOpen = false;
              onConfirm();
            }}
            class="flex-1 py-2.5 px-4 bg-danger text-white font-bold text-sm rounded-xl hover:bg-danger/90 shadow-sm shadow-danger/20 transition-colors"
          >
            {t("logout.confirmBtn")}
          </button>
        </div>
      </div>

      <button
        onclick={() => (isOpen = false)}
        class="absolute top-4 right-4 text-text-faint hover:text-text transition-colors"
      >
        <X class="w-5 h-5" />
      </button>
    </div>
  </div>
{/if}
