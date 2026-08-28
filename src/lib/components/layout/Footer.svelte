<script>

  import { tt, locale } from '$lib/i18n';
  import { getDepartmentName } from '$lib/data/departments';
  import BrandLogo from '$lib/components/ui/BrandLogo.svelte';

const t = $derived($tt);
</script>

<footer class="border-t border-border bg-[var(--color-sidebar-bg)] text-white/88">
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-10 rounded-xl border border-warning/25 bg-warning-soft p-4 text-center text-sm font-semibold text-warning">
      ⚠️ {t('footer.prototype')}
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <BrandLogo showWordmark={true} subtitle={t('app.tagline')} sizeClass="h-12 w-44" wordmarkClass="text-sm text-white" subtitleClass="text-xs text-primary/90" />
        </div>
        <p class="text-xs leading-relaxed text-white/68">
          One Center. Every Government Service. Engineered for speed, clarity, and zero-paper citizen workflow orchestration.
        </p>
      </div>

      <div>
        <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-primary/90">{t('footer.services')}</h3>
        <ul class="space-y-2 text-xs font-medium">
          <li><a href="/services?department=dept-revenue" class="text-white/78 transition hover:text-white">{getDepartmentName('dept-revenue', $locale)}</a></li>
          <li><a href="/services?department=dept-civil-supplies" class="text-white/78 transition hover:text-white">{getDepartmentName('dept-civil-supplies', $locale)}</a></li>
          <li><a href="/services?department=dept-transport" class="text-white/78 transition hover:text-white">{getDepartmentName('dept-transport', $locale)}</a></li>
          <li><a href="/services?department=dept-health" class="text-white/78 transition hover:text-white">{getDepartmentName('dept-health', $locale)}</a></li>
          <li><a href="/services?department=dept-social-welfare" class="text-white/78 transition hover:text-white">{getDepartmentName('dept-social-welfare', $locale)}</a></li>
          <li><a href="/services" class="font-bold text-primary transition hover:underline">{t('common.viewMore')} →</a></li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-primary/90">{t('nav.dashboard')}</h3>
        <ul class="space-y-2 text-xs font-medium">
          <li><a href="/applications" class="text-white/78 transition hover:text-white">{t('nav.track')}</a></li>
          <li><a href="/dashboard" class="text-white/78 transition hover:text-white">{t('nav.dashboard')}</a></li>
          <li><a href="/documents" class="text-white/78 transition hover:text-white">{t('nav.digilocker')}</a></li>
          <li><a href="/complaints" class="text-white/78 transition hover:text-white">{t('footer.grievance')}</a></li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-primary/90">{t('footer.help')}</h3>
        <ul class="space-y-2 text-xs font-medium">
          <li><a href="/about" class="text-white/78 transition hover:text-white">{t('footer.about')}</a></li>
          <li><a href="/contact" class="text-white/78 transition hover:text-white">{t('footer.contact')}</a></li>
          <li><a href="/help" class="text-white/78 transition hover:text-white">{t('footer.help')}</a></li>
        </ul>
      </div>
    </div>

    <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
      <p class="text-[11px] font-medium text-white/40">{t('footer.rights')}</p>
      <div class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 shadow-xs">
        <div class="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-primary">{t('app.demo')}</span>
      </div>
    </div>
  </div>
</footer>
