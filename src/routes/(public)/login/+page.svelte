<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth, userRole } from '$lib/stores/auth';
  import { getPortalRedirectForRole } from '$lib/utils/authGuard';
  import { departments } from '$lib/data/departments';
  import { tt, locale } from '$lib/i18n';
  import { User, Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserPlus, Monitor } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  let activeTab = $state<'citizen' | 'operator' | 'department' | 'admin'>('citizen');
  let authMode = $state<'login' | 'register'>('login');
  let email = $state('meena@demo.com');
  let password = $state('demo123');
  let displayName = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let error = $state('');
  let loading = $state(false);
  let desiredDeptId = $state('dept-revenue');
  let registrationSuccess = $state(false);

  import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
  import { getFirebaseAuth } from '$lib/firebase/client';

  function selectTab(tab: 'citizen' | 'operator' | 'department' | 'admin') {
    activeTab = tab;
    if (tab === 'admin') authMode = 'login';
    error = '';
    registrationSuccess = false;
    if (tab === 'citizen') {
      email = 'meena@demo.com';
      password = 'demo123';
    } else if (tab === 'operator') {
      email = 'kannan@demo.com';
      password = 'demo123';
    } else if (tab === 'department') {
      email = 'rajesh@demo.com';
      password = 'demo123';
    } else if (tab === 'admin') {
      email = 'priya@demo.com';
      password = 'demo123';
    }
  }

  async function handleAuthentication() {
    if (!email || !password) { error = 'Please enter email and password'; return; }
    if (authMode === 'register' && (!displayName.trim() || password !== confirmPassword)) {
      error = 'Please fill all fields and match passwords.';
      return;
    }
    loading = true;
    error = '';
    registrationSuccess = false;
    
    try {
      if (authMode === 'register') {
        if (activeTab === 'citizen') {
          const success = await auth.registerCitizen(email, password, displayName);
          if (success) {
            const redirectParam = $page.url.searchParams.get('redirect');
            goto(redirectParam || getPortalRedirectForRole($userRole));
          } else {
            error = 'Registration failed. Email might already be registered.';
          }
        } else {
          // Official registration flow (Operator/Officer)
          const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
          if (displayName.trim()) {
            await updateProfile(credential.user, { displayName: displayName.trim() });
          }
          
          const registerRes = await fetch('/api/auth/register-official', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              uid: credential.user.uid,
              email: credential.user.email,
              name: displayName.trim(),
              desiredRole: activeTab === 'operator' ? 'operator' : 'department_user',
              departmentId: activeTab === 'department' ? desiredDeptId : null
            })
          });
          
          if (!registerRes.ok) {
            const body = await registerRes.json();
            throw new Error(body.message || 'Registration failed at admin registry.');
          }
          
          registrationSuccess = true;
          displayName = '';
          confirmPassword = '';
          authMode = 'login';
        }
      } else {
        const success = await auth.login(email, password);
        if (success) {
          const redirectParam = $page.url.searchParams.get('redirect');
          goto(redirectParam || getPortalRedirectForRole($userRole));
        } else {
          error = 'Invalid email, password, or your account is pending approval.';
        }
      }
    } catch (cause: any) {
      error = cause instanceof Error ? cause.message : 'Authentication failed.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Single Sign-On — TN Hub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
  <div class="w-full max-w-lg">
    <!-- Card Container -->
    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

      <!-- Top Branding Header -->
      <div class="bg-[#062206] px-6 py-8 text-center text-white sm:px-8 border-b border-[#143A14]">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#82da85] text-2xl font-black text-[#062206] shadow-md">
          SC
        </div>
        <h1 class="text-2xl font-black tracking-tight text-white">{t('auth.portalTitle')}</h1>
        <p class="mt-1 text-[11px] font-bold text-[#9df79e] uppercase tracking-wider">{t('auth.portalDesc')}</p>
      </div>

      <!-- Tab Switcher: Citizen vs Department vs Onboarding -->
      <div class="p-6 sm:p-8">
        <div class="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
          <button
            type="button"
            onclick={() => selectTab('citizen')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'citizen' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}"
          >
            <User class="h-3.5 w-3.5 {activeTab === 'citizen' ? 'text-emerald-600' : ''}" />
            <span>{t('auth.tabCitizen')}</span>
          </button>

          <button
            type="button"
            onclick={() => selectTab('operator')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'operator' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}"
          >
            <Monitor class="h-3.5 w-3.5 {activeTab === 'operator' ? 'text-emerald-600' : ''}" />
            <span>{currentLocale === 'ta' ? 'ஈ-சேவை' : 'Operator'}</span>
          </button>

          <button
            type="button"
            onclick={() => selectTab('department')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'department' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}"
          >
            <Building2 class="h-3.5 w-3.5 {activeTab === 'department' ? 'text-emerald-600' : ''}" />
            <span>{currentLocale === 'ta' ? 'அதிகாரி' : 'Officer'}</span>
          </button>

          <button
            type="button"
            onclick={() => selectTab('admin')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'admin' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}"
          >
            <ShieldCheck class="h-3.5 w-3.5 {activeTab === 'admin' ? 'text-emerald-600' : ''}" />
            <span>{currentLocale === 'ta' ? 'நிர்வாகி' : 'Admin'}</span>
          </button>
        </div>

        {#if registrationSuccess}
          <div class="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            Official account registration request submitted! Your account is currently pending administrator verification. You can log in once approved.
          </div>
        {/if}

        {#if error}
          <div class="mb-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
            {error}
          </div>
        {/if}

        <!-- Info Notice -->
        <div class="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck class="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              {#if activeTab === 'citizen'}
                <strong>{t('auth.tabCitizen')} Workspace:</strong> {t('auth.citizenWorkspace')}
              {:else if activeTab === 'operator'}
                <strong>{currentLocale === 'ta' ? 'உதவி கியோஸ்க் போர்டல்' : 'Assisted Kiosk Portal'}:</strong> {currentLocale === 'ta' ? 'குடிமக்களுக்கு உதவ விண்ணப்ப வரைவுகளை உருவாக்கவும்.' : 'Assist citizens and create application drafts on their behalf.'}
              {:else if activeTab === 'department'}
                <strong>{t('auth.tabDepartment')} Official Workspace:</strong> {t('auth.officerWorkspace')}
              {:else}
                <strong>{currentLocale === 'ta' ? 'நிர்வாக கன்சோல்' : 'Administration Console'}:</strong> {currentLocale === 'ta' ? 'அமைப்புகளை நிர்வகிக்கவும் மற்றும் தணிக்கை பதிவுகளை சரிபார்க்கவும்.' : 'Manage platform configurations and review audit logs.'}
              {/if}
            </div>
          </div>

          <!-- Credentials Form -->
          <form onsubmit={(e) => { e.preventDefault(); handleAuthentication(); }} class="space-y-4">
            {#if authMode === 'register'}
              <div>
                <label for="display-name" class="block text-xs font-bold text-slate-800 mb-1.5">{t('auth.name')}</label>
                <div class="relative">
                  <User class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="display-name"
                    type="text"
                    bind:value={displayName}
                    required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
              
              {#if activeTab === 'department'}
                <div class="mt-4">
                  <label for="dept-select" class="block text-xs font-bold text-slate-800 mb-1.5">Select Assigned Department *</label>
                  <select id="dept-select" bind:value={desiredDeptId} required class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500">
                    {#each departments as dept}
                      <option value={dept.id}>{currentLocale === 'ta' ? dept.nameTA : dept.name}</option>
                    {/each}
                  </select>
                </div>
              {/if}
            {/if}
            
            <div>
              <label for="user-email" class="block text-xs font-bold text-slate-800 mb-1.5">
                {#if activeTab === 'citizen'}
                  {t('auth.citizenEmail')}
                {:else if activeTab === 'operator'}
                  {currentLocale === 'ta' ? 'இயக்குநர் மின்னஞ்சல்' : 'Operator Email Address'}
                {:else if activeTab === 'department'}
                  {t('auth.officerEmail')}
                {:else}
                  {currentLocale === 'ta' ? 'நிர்வாகி மின்னஞ்சல்' : 'Admin Email Address'}
                {/if}
              </label>
              <div class="relative">
                <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  bind:value={email}
                  required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {#if authMode === 'register'}
              <div>
                <label for="confirm-password" class="block text-xs font-bold text-slate-800 mb-1.5">{t('auth.confirmPassword')}</label>
                <div class="relative">
                  <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={confirmPassword}
                    required
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            {/if}

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="user-password" class="block text-xs font-bold text-slate-800">
                  {t('auth.password')}
                </label>
              </div>
              <div class="relative">
                <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="user-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  bind:value={password}
                  required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="button"
                  onclick={() => showPassword = !showPassword}
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {#if showPassword}
                    <EyeOff class="h-4 w-4" />
                  {:else}
                    <Eye class="h-4 w-4" />
                  {/if}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#062206] hover:bg-[#143A14] py-3.5 text-xs font-bold text-white shadow-lg transition disabled:opacity-50"
            >
              {#if loading}
                <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>{t('common.loading')}</span>
              {:else}
                <span>
                  {#if authMode === 'register'}
                    {t('auth.registerButton')}
                  {:else}
                    {t('auth.signInTo', { 
                      portal: activeTab === 'citizen' ? t('auth.tabCitizen') : 
                              activeTab === 'operator' ? (currentLocale === 'ta' ? 'இயக்குநர் போர்டல்' : 'Operator Kiosk') :
                              activeTab === 'department' ? t('auth.tabDepartment') : 
                              (currentLocale === 'ta' ? 'நிர்வாக போர்டல்' : 'Admin Console')
                    })}
                  {/if}
                </span>
                <ArrowRight class="h-4 w-4" />
              {/if}
            </button>
          </form>

          {#if activeTab !== 'admin'}
            <div class="mt-4 text-center text-xs font-medium text-slate-500">
              {#if authMode === 'login'}
                {t('auth.noAccount')}
                <button type="button" onclick={() => { authMode = 'register'; error = ''; registrationSuccess = false; }} class="ml-1 font-bold text-emerald-700 hover:underline">{t('auth.register')}</button>
              {:else}
                {t('auth.hasAccount')}
                <button type="button" onclick={() => { authMode = 'login'; error = ''; registrationSuccess = false; }} class="ml-1 font-bold text-emerald-700 hover:underline">{t('auth.login')}</button>
              {/if}
            </div>
          {/if}

          <!-- Quick Demo Account Switchers -->
          <div class="mt-6 border-t border-slate-100 pt-4">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">Quick Demo Portal Accounts</span>
            <div class="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onclick={() => { email = 'meena@demo.com'; password = 'demo123'; activeTab = 'citizen'; }}
                class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-800 border border-slate-200"
              >
                Citizen (Meena)
              </button>
              <button
                type="button"
                onclick={() => { email = 'rajesh@demo.com'; password = 'demo123'; activeTab = 'department'; }}
                class="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[10px] font-bold text-emerald-900 border border-emerald-200"
              >
                Revenue Officer (Rajesh)
              </button>
              <button
                type="button"
                onclick={() => { email = 'kavitha@demo.com'; password = 'demo123'; activeTab = 'department'; }}
                class="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-900 border border-blue-200"
              >
                Civil Supplies Officer (Kavitha)
              </button>
              <button
                type="button"
                onclick={() => { email = 'kannan@demo.com'; password = 'demo123'; activeTab = 'department'; }}
                class="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[10px] font-bold text-indigo-900 border border-indigo-200"
              >
                Kiosk Operator (Kannan)
              </button>
              <button
                type="button"
                onclick={() => { email = 'priya@demo.com'; password = 'demo123'; activeTab = 'department'; }}
                class="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[10px] font-bold text-purple-900 border border-purple-200"
              >
                Admin (Priya)
              </button>
            </div>
          </div>
      </div>

      <!-- Footer Note -->
      <div class="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center">
        <p class="text-[11px] text-slate-400">
          {t('auth.govtPrototype')}
        </p>
      </div>
    </div>
  </div>
</div>
