<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth, userRole } from '$lib/stores/auth';
  import { getPortalRedirectForRole } from '$lib/utils/authGuard';
  import { departments } from '$lib/data/departments';
  import { demoCredentials } from '$lib/data/users';
  import { tt, locale } from '$lib/i18n';
  import { User, Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserPlus, Monitor } from '@lucide/svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);

  let activeTab = $state<'citizen' | 'operator' | 'department' | 'admin'>('citizen');
  let authMode = $state<'login' | 'register'>('login');
  let email = $state('');
  let password = $state('');
  let displayName = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let error = $state('');
  let loading = $state(false);
  let desiredDeptId = $state('dept-revenue');
  let registrationSuccess = $state(false);

  import { getFirebaseAuth } from '$lib/firebase/client';

  const demoRoleByTab = {
    citizen: 'citizen',
    operator: 'operator',
    department: 'department_user',
    admin: 'tnhub_admin'
  } as const;

  const demoAccount = $derived(
    demoCredentials.find((credential) => credential.role === demoRoleByTab[activeTab]) ?? null
  );

  function selectTab(tab: 'citizen' | 'operator' | 'department' | 'admin') {
    activeTab = tab;
    if (tab === 'admin') authMode = 'login';
    error = '';
    registrationSuccess = false;
    email = '';
    password = '';
  }

  function applyDemoCredentials() {
    if (!demoAccount) return;
    authMode = 'login';
    registrationSuccess = false;
    error = '';
    email = demoAccount.email;
    password = demoAccount.password;
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
          const [{ createUserWithEmailAndPassword, updateProfile }, firebaseAuth] = await Promise.all([
            import('firebase/auth'),
            getFirebaseAuth()
          ]);
          const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
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

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-10 font-sans text-text sm:px-6 lg:px-8">
  <div class="w-full max-w-lg">
    <!-- Card Container -->
    <div class="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">

      <!-- Top Branding Header -->
      <div class="public-banner px-6 py-8 text-center sm:px-8">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-2xl font-black text-primary shadow-sm">
          TN
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight text-white">{t('auth.portalTitle')}</h1>
        <p class="public-banner-subtitle mt-1.5 text-xs font-semibold uppercase tracking-wider">{t('auth.portalDesc')}</p>
      </div>

      <!-- Tab Switcher: Citizen vs Department vs Onboarding -->
      <div class="p-6 sm:p-8">
        <div class="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-muted p-1.5 lg:grid-cols-4">
          <button
            type="button"
            onclick={() => selectTab('citizen')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'citizen' ? 'bg-primary text-white shadow-sm border border-primary/40' : 'text-text-muted hover:bg-surface hover:text-text'}"
          >
            <User class="h-3.5 w-3.5 {activeTab === 'citizen' ? 'text-white' : ''}" />
            <span>{t('auth.tabCitizen')}</span>
          </button>

          <button
            type="button"
            onclick={() => selectTab('operator')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'operator' ? 'bg-primary text-white shadow-sm border border-primary/40' : 'text-text-muted hover:bg-surface hover:text-text'}"
          >
            <Monitor class="h-3.5 w-3.5 {activeTab === 'operator' ? 'text-white' : ''}" />
            <span>{currentLocale === 'ta' ? 'ஈ-சேவை' : 'Operator'}</span>
          </button>

          <button
            type="button"
            onclick={() => selectTab('department')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'department' ? 'bg-primary text-white shadow-sm border border-primary/40' : 'text-text-muted hover:bg-surface hover:text-text'}"
          >
            <Building2 class="h-3.5 w-3.5 {activeTab === 'department' ? 'text-white' : ''}" />
            <span>{currentLocale === 'ta' ? 'அதிகாரி' : 'Officer'}</span>
          </button>

          <button
            type="button"
            onclick={() => selectTab('admin')}
            class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] sm:text-[11px] font-bold transition-all
              {activeTab === 'admin' ? 'bg-primary text-white shadow-sm border border-primary/40' : 'text-text-muted hover:bg-surface hover:text-text'}"
          >
            <ShieldCheck class="h-3.5 w-3.5 {activeTab === 'admin' ? 'text-white' : ''}" />
            <span>{currentLocale === 'ta' ? 'நிர்வாகி' : 'Admin'}</span>
          </button>
        </div>

        {#if registrationSuccess}
          <div class="mb-4 rounded-2xl border border-success/30 bg-success-soft px-4 py-3 text-xs font-bold text-success">
            Official account registration request submitted! Your account is currently pending administrator verification. You can log in once approved.
          </div>
        {/if}

        {#if error}
          <div class="mb-4 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-xs font-medium text-danger">
            {error}
          </div>
        {/if}

        {#if authMode === 'login' && demoAccount}
          <div class="mb-4 rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3 text-xs text-text">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="font-bold text-primary">{t('auth.demoNote')}</p>
                <p><span class="font-semibold">Email:</span> {demoAccount.email}</p>
                <p><span class="font-semibold">Password:</span> {demoAccount.password}</p>
              </div>
              <button
                type="button"
                onclick={applyDemoCredentials}
                class="shrink-0 rounded-xl border border-primary/30 bg-surface px-3 py-2 text-[11px] font-bold text-primary transition hover:bg-primary-soft"
              >
                Use
              </button>
            </div>
          </div>
        {/if}

        <!-- Info Notice -->
        <div class="mb-6 flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary-soft p-3.5 text-xs text-text">
            <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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

          <!-- Standard Email/Password Credentials Form -->
          <form onsubmit={(e) => { e.preventDefault(); handleAuthentication(); }} class="space-y-4">
            {#if authMode === 'register'}
              <div>
                <label for="display-name" class="mb-1.5 block text-xs font-bold text-text">{t('auth.name')}</label>
                <div class="relative">
                  <User class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
                  <input
                    id="display-name"
                    type="text"
                    bind:value={displayName}
                    required
                    class="w-full rounded-2xl border border-border bg-muted py-3 pl-10 pr-4 text-xs font-medium text-text outline-none transition focus:border-primary focus:bg-surface"
                  />
                </div>
              </div>
              
              {#if activeTab === 'department'}
                <div class="mt-4">
                  <label for="dept-select" class="mb-1.5 block text-xs font-bold text-text">Select Assigned Department *</label>
                  <select id="dept-select" bind:value={desiredDeptId} required class="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-xs font-medium text-text outline-none transition focus:border-primary">
                    {#each departments as dept}
                      <option value={dept.id}>{currentLocale === 'ta' ? dept.nameTA : dept.name}</option>
                    {/each}
                  </select>
                </div>
              {/if}
            {/if}
            
            <div>
              <label for="user-email" class="mb-1.5 block text-xs font-bold text-text">
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
                <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  bind:value={email}
                  required
                  class="w-full rounded-2xl border border-border bg-muted py-3 pl-10 pr-4 text-xs font-medium text-text outline-none transition focus:border-primary focus:bg-surface"
                />
              </div>
            </div>

            {#if authMode === 'register'}
              <div>
                <label for="confirm-password" class="mb-1.5 block text-xs font-bold text-text">{t('auth.confirmPassword')}</label>
                <div class="relative">
                  <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={confirmPassword}
                    required
                    class="w-full rounded-2xl border border-border bg-muted py-3 pl-10 pr-4 text-xs font-medium text-text outline-none transition focus:border-primary focus:bg-surface"
                  />
                </div>
              </div>
            {/if}

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="user-password" class="block text-xs font-bold text-text">
                  {t('auth.password')}
                </label>
              </div>
              <div class="relative">
                <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-faint" />
                <input
                  id="user-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  bind:value={password}
                  required
                  class="w-full rounded-2xl border border-border bg-muted py-3 pl-10 pr-11 text-xs font-medium text-text outline-none transition focus:border-primary focus:bg-surface"
                />
                <button
                  type="button"
                  onclick={() => showPassword = !showPassword}
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
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
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-primary-hover disabled:opacity-50"
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
            <div class="mt-4 text-center text-xs font-medium text-text-muted">
              {#if authMode === 'login'}
                {t('auth.noAccount')}
                <button type="button" onclick={() => { authMode = 'register'; error = ''; registrationSuccess = false; }} class="ml-1 font-bold text-primary hover:underline">{t('auth.register')}</button>
              {:else}
                {t('auth.hasAccount')}
                <button type="button" onclick={() => { authMode = 'login'; error = ''; registrationSuccess = false; }} class="ml-1 font-bold text-primary hover:underline">{t('auth.login')}</button>
              {/if}
            </div>
          {/if}

      </div>

      <!-- Footer Note -->
      <div class="border-t border-border bg-muted px-6 py-4 text-center">
        <p class="text-[11px] text-text-faint">
          {t('auth.govtPrototype')}
        </p>
      </div>
    </div>
  </div>
</div>

