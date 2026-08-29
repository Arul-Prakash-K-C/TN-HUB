<script>
  import { tt } from '$lib/i18n';
  const t = $derived($tt);
let { data } = $props();
const application = $derived(data.application);
const service = $derived(data.service);
const address = $derived(`${application.formData?.doorNo || ''} ${application.formData?.street || ''}, ${application.formData?.village || application.formData?.district || ''}`.trim());
function printCertificate() {
    window.print();
}
</script>

<svelte:head>
  <title>{t('certificate.title', { number: application.applicationNumber })}</title>
  <style>
    @media print {
      body * {
        visibility: hidden;
      }
      #printable-certificate, #printable-certificate * {
        visibility: visible;
      }
      #printable-certificate {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</svelte:head>

<div class="min-h-screen bg-slate-100 p-8 font-sans flex flex-col items-center">
  <div class="w-full max-w-4xl flex justify-end mb-6 no-print">
    <button
      onclick={printCertificate}
      class="bg-[#062206] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#143A14] transition flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
      {t('certificate.print')}
    </button>
  </div>

  <!-- Certificate Template -->
  <div id="printable-certificate" class="w-full max-w-4xl bg-white p-12 sm:p-16 border-[16px] border-[#062206] shadow-2xl relative">
    
    <!-- Watermark -->
    <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
      <div class="w-96 h-96 rounded-full border-8 border-[#062206] flex items-center justify-center">
        <span class="text-6xl font-black text-[#062206] tracking-tighter transform -rotate-45">{t('certificate.watermark')}</span>
      </div>
    </div>

    <!-- Header -->
    <div class="text-center border-b-2 border-slate-200 pb-8 mb-10 relative z-10">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-[#062206] text-white rounded-full flex items-center justify-center shadow-md">
          <span class="text-2xl font-black">{t('certificate.monogram')}</span>
        </div>
      </div>
      <h1 class="text-3xl font-black text-[#062206] uppercase tracking-widest mb-2">{t('ui.routes.public.certificate.id.e3d1e1cd')}</h1>
      <h2 class="text-xl font-bold text-slate-600 uppercase tracking-wide">
        {service.departmentId === 'dept-revenue' ? t('certificate.department.revenue') : t('certificate.department.local')}
      </h2>
    </div>

    <!-- Certificate Title -->
    <div class="text-center mb-12 relative z-10">
      <h3 class="text-4xl font-black text-[#82da85] uppercase tracking-widest drop-shadow-sm mb-4">
        {service.name}
      </h3>
      <div class="inline-block px-6 py-2 border-2 border-slate-200 rounded-full">
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">
          {t('certificate.number')} <span class="text-slate-900">{application.applicationNumber}</span>
        </p>
      </div>
    </div>

    <!-- Body text -->
    <div class="text-lg text-slate-800 leading-loose text-center max-w-2xl mx-auto mb-16 relative z-10">
      <p class="mb-6">{t('ui.routes.public.certificate.id.1638fb09')}</p>
      <p class="text-3xl font-black text-slate-900 mb-6 uppercase border-b border-slate-300 inline-block px-8 pb-2">
        {application.citizenName}
      </p>
      
      {#if service.slug === 'income-certificate'}
        <p>
          {t('certificate.body.income', { address, amount: `₹${application.formData?.annualIncome || '___'}` })}
        </p>
      {:else if service.slug === 'community-certificate'}
        <p>
          {t('certificate.body.community', { address, religion: application.formData?.religion || '', community: `${application.formData?.subCaste || ''} (${application.formData?.communityCategory || ''})` })}
        </p>
      {:else if service.slug === 'nativity-certificate'}
        <p>
          {t('certificate.body.nativity', { place: application.formData?.placeOfBirth || '', years: application.formData?.residenceDurationYears || '' })}
        </p>
      {:else if service.slug === 'birth-certificate'}
        <p>
          {t('certificate.body.birth', { date: application.formData?.dateOfBirth || '___', place: application.formData?.placeOfBirth || '___' })}
        </p>
      {:else}
        <p>
          {t('certificate.body.default', { purpose: application.formData?.purpose || t('common.officialUse') })}
        </p>
      {/if}
      
      <p class="mt-8 text-base text-slate-600">
        {t('certificate.issuedNotice')}
      </p>
    </div>

    <!-- Footer signatures -->
    <div class="flex justify-between items-end mt-24 pt-8 border-t-2 border-slate-200 relative z-10">
      <div class="text-left">
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{t('ui.routes.public.certificate.id.a45379d8')}</p>
        <p class="text-lg font-bold text-slate-900">{new Date(application.completedAt || application.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div class="text-center relative">
        <div class="w-32 h-32 absolute -top-24 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" class="w-full h-full fill-current text-rose-600">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/>
            <text x="50" y="55" font-size="12" font-weight="bold" text-anchor="middle">{t('certificate.stamp.digital')}</text>
            <text x="50" y="70" font-size="12" font-weight="bold" text-anchor="middle">{t('certificate.stamp.signed')}</text>
          </svg>
        </div>
        <div class="border-b border-slate-400 w-48 mb-2 mx-auto"></div>
        <p class="text-sm font-bold text-slate-900 uppercase">{t('ui.routes.public.certificate.id.3807815b')}</p>
        <p class="text-xs text-slate-500 font-medium">{t('ui.routes.public.certificate.id.bea88498')}</p>
      </div>
    </div>
    
    <!-- Verification Info -->
    <div class="mt-12 text-center relative z-10">
      <p class="text-[10px] text-slate-400 uppercase tracking-widest">
        {t('certificate.verify')}
      </p>
    </div>

  </div>
</div>
