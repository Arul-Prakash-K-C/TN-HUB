<script>
"use strict";
let { data } = $props();
const application = $derived(data.application);
const service = $derived(data.service);
function printCertificate() {
    window.print();
}
</script>

<svelte:head>
  <title>Certificate - {application.applicationNumber}</title>
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
      Print Certificate (PDF)
    </button>
  </div>

  <!-- Certificate Template -->
  <div id="printable-certificate" class="w-full max-w-4xl bg-white p-12 sm:p-16 border-[16px] border-[#062206] shadow-2xl relative">
    
    <!-- Watermark -->
    <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
      <div class="w-96 h-96 rounded-full border-8 border-[#062206] flex items-center justify-center">
        <span class="text-6xl font-black text-[#062206] tracking-tighter transform -rotate-45">TN HUB</span>
      </div>
    </div>

    <!-- Header -->
    <div class="text-center border-b-2 border-slate-200 pb-8 mb-10 relative z-10">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-[#062206] text-white rounded-full flex items-center justify-center shadow-md">
          <span class="text-2xl font-black">TN</span>
        </div>
      </div>
      <h1 class="text-3xl font-black text-[#062206] uppercase tracking-widest mb-2">Government of Tamil Nadu</h1>
      <h2 class="text-xl font-bold text-slate-600 uppercase tracking-wide">
        {service.departmentId === 'dept-revenue' ? 'Revenue Department' : 'Department of Local Government'}
      </h2>
    </div>

    <!-- Certificate Title -->
    <div class="text-center mb-12 relative z-10">
      <h3 class="text-4xl font-black text-[#82da85] uppercase tracking-widest drop-shadow-sm mb-4">
        {service.name}
      </h3>
      <div class="inline-block px-6 py-2 border-2 border-slate-200 rounded-full">
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Certificate No: <span class="text-slate-900">{application.applicationNumber}</span>
        </p>
      </div>
    </div>

    <!-- Body text -->
    <div class="text-lg text-slate-800 leading-loose text-center max-w-2xl mx-auto mb-16 relative z-10">
      <p class="mb-6">This is to certify that</p>
      <p class="text-3xl font-black text-slate-900 mb-6 uppercase border-b border-slate-300 inline-block px-8 pb-2">
        {application.citizenName}
      </p>
      
      {#if service.slug === 'income-certificate'}
        <p>
          residing at <strong class="font-bold">{application.formData?.doorNo || ''} {application.formData?.street || ''}, {application.formData?.village || application.formData?.district || ''}</strong> 
          has an annual family income of <strong class="font-bold">₹{application.formData?.annualIncome || '___'}</strong>.
        </p>
      {:else if service.slug === 'community-certificate'}
        <p>
          residing at <strong class="font-bold">{application.formData?.doorNo || ''} {application.formData?.street || ''}, {application.formData?.village || application.formData?.district || ''}</strong> 
          belongs to the <strong class="font-bold">{application.formData?.religion || ''}</strong> religion and 
          <strong class="font-bold">{application.formData?.subCaste || ''} ({application.formData?.communityCategory || ''})</strong> community.
        </p>
      {:else if service.slug === 'nativity-certificate'}
        <p>
          was born in <strong class="font-bold">{application.formData?.placeOfBirth || ''}</strong> and 
          has been residing in Tamil Nadu for the past <strong class="font-bold">{application.formData?.residenceDurationYears || ''} years</strong>.
        </p>
      {:else if service.slug === 'birth-certificate'}
        <p>
          was born on <strong class="font-bold">{application.formData?.dateOfBirth || '___'}</strong> 
          at <strong class="font-bold">{application.formData?.placeOfBirth || '___'}</strong>.
        </p>
      {:else}
        <p>
          has successfully fulfilled the requirements for the issuance of this certificate 
          for the purpose of <strong class="font-bold">{application.formData?.purpose || 'Official Use'}</strong>.
        </p>
      {/if}
      
      <p class="mt-8 text-base text-slate-600">
        This certificate is issued based on the verified application and digital records maintained by the department.
      </p>
    </div>

    <!-- Footer signatures -->
    <div class="flex justify-between items-end mt-24 pt-8 border-t-2 border-slate-200 relative z-10">
      <div class="text-left">
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Issue</p>
        <p class="text-lg font-bold text-slate-900">{new Date(application.completedAt || application.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div class="text-center relative">
        <div class="w-32 h-32 absolute -top-24 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" class="w-full h-full fill-current text-rose-600">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/>
            <text x="50" y="55" font-size="12" font-weight="bold" text-anchor="middle">DIGITALLY</text>
            <text x="50" y="70" font-size="12" font-weight="bold" text-anchor="middle">SIGNED</text>
          </svg>
        </div>
        <div class="border-b border-slate-400 w-48 mb-2 mx-auto"></div>
        <p class="text-sm font-bold text-slate-900 uppercase">Issuing Authority</p>
        <p class="text-xs text-slate-500 font-medium">Digital Signature Valid</p>
      </div>
    </div>
    
    <!-- Verification Info -->
    <div class="mt-12 text-center relative z-10">
      <p class="text-[10px] text-slate-400 uppercase tracking-widest">
        To verify this certificate, visit tnhub.gov.in/verify and enter the Certificate No.
      </p>
    </div>

  </div>
</div>
