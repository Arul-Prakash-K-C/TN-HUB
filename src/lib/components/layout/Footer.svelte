<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { Shield, Sparkles, Heart } from '@lucide/svelte';
  import { getDepartmentName } from '$lib/data/departments';
  const t = $derived($tt);
</script>

<footer class="border-t border-primary-900 bg-primary-950 text-primary-foreground">
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    
    <!-- HACKATHON DISCLAIMER (CRITICAL) -->
    <div class="mb-10 rounded-xl bg-[#E53935]/10 border border-[#E53935]/30 p-4 text-center text-sm font-bold text-red-200">
      ⚠️ {t('footer.prototype')}
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      <!-- Brand -->
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 font-extrabold text-white text-lg shadow-md">
            S
          </div>
          <div>
            <div class="text-sm font-black tracking-wide">{t('app.name')}</div>
            <div class="text-xs font-bold text-primary-300">{t('app.tagline')}</div>
          </div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          {t('footer.prototype')} — Engineered for speed, clarity, and zero-paper government services.
        </p>
      </div>

      <!-- Department Services -->
      <div>
        <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-primary-400">{t('footer.services')}</h3>
        <ul class="space-y-2 text-xs font-medium">
          <li><a href="/services?department=dept-revenue" class="text-slate-300 hover:text-white transition">{getDepartmentName('dept-revenue', $locale)}</a></li>
          <li><a href="/services?department=dept-civil-supplies" class="text-slate-300 hover:text-white transition">{getDepartmentName('dept-civil-supplies', $locale)}</a></li>
          <li><a href="/services?department=dept-transport" class="text-slate-300 hover:text-white transition">{getDepartmentName('dept-transport', $locale)}</a></li>
          <li><a href="/services?department=dept-health" class="text-slate-300 hover:text-white transition">{getDepartmentName('dept-health', $locale)}</a></li>
          <li><a href="/services?department=dept-social-welfare" class="text-slate-300 hover:text-white transition">{getDepartmentName('dept-social-welfare', $locale)}</a></li>
          <li><a href="/services" class="text-[#007AFF] font-bold hover:underline transition">{t('common.viewMore')} →</a></li>
        </ul>
      </div>

      <!-- Quick Navigation -->
      <div>
        <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-primary-400">{t('nav.dashboard')}</h3>
        <ul class="space-y-2 text-xs font-medium">
          <li><a href="/applications" class="text-slate-300 hover:text-white transition">{t('nav.track')}</a></li>
          <li><a href="/dashboard" class="text-slate-300 hover:text-white transition">{t('nav.dashboard')}</a></li>
          <li><a href="/documents" class="text-slate-300 hover:text-white transition">{t('nav.digilocker')}</a></li>
          <li><a href="/complaints" class="text-slate-300 hover:text-white transition">{t('footer.grievance')}</a></li>
        </ul>
      </div>

      <!-- Information & Organization -->
      <div>
        <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-primary-400">{t('footer.help')}</h3>
        <ul class="space-y-2 text-xs font-medium">
          <li><a href="/about" class="text-slate-300 hover:text-white transition">{t('footer.about')}</a></li>
          <li><a href="/contact" class="text-slate-300 hover:text-white transition">{t('footer.contact')}</a></li>
          <li><a href="/help" class="text-slate-300 hover:text-white transition">{t('footer.help')}</a></li>
        </ul>
      </div>
    </div>

    <div class="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p class="text-[11px] text-slate-500 font-medium">{t('footer.rights')}</p>
      <div class="flex items-center gap-2 rounded-full bg-slate-800 px-3.5 py-1.5 border border-slate-700 shadow-sm">
        <div class="h-2 w-2 rounded-full bg-primary-500 animate-pulse"></div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">{t('app.demo')}</span>
      </div>
    </div>
  </div>
</footer>
