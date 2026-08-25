<script lang="ts">
	import { t } from '$lib/i18n';
	import { Search, FileText, CheckCircle2, Clock, ShieldAlert } from '@lucide/svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let selectedApp = $state<typeof data.applications[number] | null>(null);

	const filteredApplications = $derived(
		data.applications.filter(app => 
			!searchQuery.trim() ||
			app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
			app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			app.citizenName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>{t('operator.assistedApplications')} — Sympho Center</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl">
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-black text-slate-900">{t('operator.assistedApplications')}</h1>
				<p class="mt-1 text-xs font-medium text-slate-500">Only drafts and applications created with your operator account are shown here.</p>
			</div>
			<a href="/operator/dashboard" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition">
				{t('operator.createAssistedDraftBtn')}
			</a>
		</div>

		<!-- Search & Filter Bar -->
		<div class="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
			<div class="relative">
				<Search class="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by Tracking ID (SYM-...), citizen name, or service..."
					class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-indigo-500 focus:bg-white transition"
				/>
			</div>
		</div>

		{#if filteredApplications.length === 0}
			<div class="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
				{searchQuery ? 'No matching assisted applications found.' : t('operator.noApplications')}
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2">
				{#each filteredApplications as application}
					<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition hover:border-indigo-300">
						<div class="flex items-start justify-between gap-3">
							<div>
								<span class="inline-block rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-700">
									{application.applicationNumber}
								</span>
								<h3 class="mt-2 text-base font-bold text-slate-900">{application.serviceName}</h3>
								<p class="mt-1 text-xs font-medium text-slate-600">Citizen: <span class="font-bold text-slate-900">{application.citizenName}</span></p>
							</div>
							<span class="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
								{application.status}
							</span>
						</div>

						<div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
							<span class="flex items-center gap-1.5">
								<Clock class="h-3.5 w-3.5 text-slate-400" />
								Created: {new Date(application.createdAt).toLocaleDateString()}
							</span>
							<div class="flex items-center gap-2.5">
								{#if application.status === 'DRAFT'}
									<a 
										href="/operator/applications/{application.id}/edit"
										class="font-bold text-emerald-600 hover:text-emerald-800 transition"
									>
										Edit Draft
									</a>
									<span class="text-slate-300">|</span>
								{/if}
								<button 
									onclick={() => selectedApp = application}
									class="font-bold text-indigo-600 hover:text-indigo-800 transition"
								>
									View Details
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Assisted Application Detail Modal -->
{#if selectedApp}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-[#071A28]/60 p-4 backdrop-blur-sm">
		<div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<div>
					<span class="font-mono text-xs font-bold text-indigo-700">{selectedApp.applicationNumber}</span>
					<h2 class="text-lg font-bold text-slate-900">{selectedApp.serviceName}</h2>
				</div>
				<span class="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 uppercase">
					{selectedApp.status}
				</span>
			</div>

			<div class="my-4 space-y-3 text-xs">
				<div class="rounded-xl bg-slate-50 p-3 border border-slate-200">
					<span class="text-slate-500 block text-[10px] uppercase font-bold">Assisted Citizen</span>
					<span class="font-bold text-slate-900 text-sm">{selectedApp.citizenName}</span>
				</div>

				<div class="rounded-xl bg-slate-50 p-3 border border-slate-200">
					<span class="text-slate-500 block text-[10px] uppercase font-bold">Workflow State</span>
					<span class="font-semibold text-slate-800">{selectedApp.status} (Managed via Sympho Workflow Engine)</span>
				</div>
			</div>

			<div class="flex justify-end gap-2 pt-2">
				<button 
					onclick={() => selectedApp = null}
					class="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
				>
					Close
				</button>
				{#if selectedApp.status === 'DRAFT'}
					<a
						href="/operator/applications/{selectedApp.id}/edit"
						class="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
					>
						Resume / Edit Draft
					</a>
				{/if}
			</div>
		</div>
	</div>
{/if}
