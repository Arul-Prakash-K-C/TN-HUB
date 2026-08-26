<script lang="ts">
  import { tt, locale } from '$lib/i18n';
  import { currentUser, isAuthenticated, userRole } from '$lib/stores/auth';
  import {
    MessageCircleQuestion,
    Send,
    Shield,
    Clock,
    CheckCircle,
    Loader2,
    AlertTriangle,
    User,
    Mail,
    ChevronDown,
    ChevronUp,
    Reply
  } from '@lucide/svelte';
  import { onMount } from 'svelte';

  const t = $derived($tt);
  const currentLocale = $derived($locale);
  const authenticated = $derived($isAuthenticated);
  const role = $derived($userRole);

  let questions: any[] = $state([]);
  let loading = $state(true);
  let error = $state('');
  let replyLoading = $state<string | null>(null);
  let expandedId = $state<string | null>(null);
  let replyText = $state('');
  let filterTab = $state<'all' | 'pending' | 'replied'>('all');

  const filteredQuestions = $derived(() => {
    if (filterTab === 'pending') return questions.filter(q => !q.reply);
    if (filterTab === 'replied') return questions.filter(q => q.reply);
    return questions;
  });

  async function fetchQuestions() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/admin/questions');
      if (!res.ok) throw new Error('Failed to load questions.');
      const data = await res.json();
      questions = data.questions || [];
    } catch (e: any) {
      error = e.message || 'Unable to load questions.';
    } finally {
      loading = false;
    }
  }

  async function sendReply(questionId: string) {
    if (!replyText.trim()) return;
    replyLoading = questionId;
    error = '';
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionId, reply: replyText.trim() })
      });
      if (!res.ok) throw new Error('Failed to send reply.');
      // Update local state
      questions = questions.map(q => q.id === questionId
        ? { ...q, reply: replyText.trim(), repliedAt: new Date().toISOString() }
        : q
      );
      replyText = '';
      expandedId = null;
    } catch (e: any) {
      error = e.message || 'Unable to send reply.';
    } finally {
      replyLoading = null;
    }
  }

  function formatDate(iso: string): string {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  }

  onMount(() => { fetchQuestions(); });
</script>

<svelte:head>
  <title>Help Desk & Inquiries — TN Hub Admin</title>
</svelte:head>

{#if !authenticated || role !== 'admin'}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-xl mt-10">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Shield class="h-7 w-7" />
      </div>
      <h2 class="text-xl font-bold text-text">Access Denied</h2>
      <p class="mt-2 text-xs text-text-muted">Admin access only.</p>
    </div>
  </div>
{:else}
  <div class="bg-surface-secondary min-h-screen pb-12">
    <div class="public-banner border-b border-border">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-h1 text-white">Help Desk & User Inquiries</h1>
        <p class="text-xs text-white/70">Review and reply to user questions. Replies are sent as notifications.</p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Stats Row -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <div class="text-2xl font-bold text-[#316342]">{questions.length}</div>
          <div class="text-[10px] font-bold text-text-muted uppercase mt-1">Total Questions</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <div class="text-2xl font-bold text-amber-600">{questions.filter(q => !q.reply).length}</div>
          <div class="text-[10px] font-bold text-text-muted uppercase mt-1">Pending Reply</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-5 shadow-sm text-center">
          <div class="text-2xl font-bold text-[#316342]">{questions.filter(q => q.reply).length}</div>
          <div class="text-[10px] font-bold text-text-muted uppercase mt-1">Replied</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6">
        {#each [['all', 'All'], ['pending', 'Pending'], ['replied', 'Replied']] as [tab, label]}
          <button
            onclick={() => filterTab = tab as typeof filterTab}
            class="px-4 py-2 rounded-xl text-xs font-bold transition {filterTab === tab ? 'bg-[#316342] text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}"
          >
            {label}
          </button>
        {/each}
      </div>

      {#if error}
        <div class="mb-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertTriangle class="h-4 w-4 shrink-0" />
          {error}
        </div>
      {/if}

      {#if loading}
        <div class="flex items-center justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-[#316342]" />
          <span class="ml-3 text-sm text-slate-500">Loading inquiries…</span>
        </div>
      {:else if filteredQuestions().length === 0}
        <div class="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#316342]/10 text-[#316342]">
            <CheckCircle class="h-8 w-8" />
          </div>
          <h2 class="text-lg font-bold text-slate-900">No Questions</h2>
          <p class="mt-2 text-xs text-slate-500">
            {filterTab === 'pending' ? 'All questions have been replied to!' : 'No user inquiries yet.'}
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each filteredQuestions() as q (q.id)}
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <!-- Question Header -->
              <button
                onclick={() => { expandedId = expandedId === q.id ? null : q.id; replyText = ''; }}
                class="w-full text-left p-5 flex items-start justify-between gap-3"
              >
                <div class="flex items-start gap-3 flex-1">
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#071A28] to-[#143A14] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {(q.userName || '?')[0].toUpperCase()}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-slate-900">{q.userName || 'User'}</span>
                      <span class="text-[10px] font-medium text-slate-400">{q.userRole || 'citizen'}</span>
                      {#if q.reply}
                        <span class="inline-flex items-center gap-1 rounded-full bg-[#316342]/10 px-2 py-0.5 text-[9px] font-bold text-[#316342] border border-[#316342]/20">
                          <CheckCircle class="h-2.5 w-2.5" /> Replied
                        </span>
                      {:else}
                        <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200">
                          <Clock class="h-2.5 w-2.5" /> Pending
                        </span>
                      {/if}
                    </div>
                    <h3 class="text-sm font-bold text-slate-800 mt-1">{q.subject}</h3>
                    <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{q.question}</p>
                    <span class="text-[10px] text-slate-400 mt-1 block">{formatDate(q.createdAt)}</span>
                  </div>
                </div>
                <div class="shrink-0 text-slate-400">
                  {#if expandedId === q.id}
                    <ChevronUp class="h-4 w-4" />
                  {:else}
                    <ChevronDown class="h-4 w-4" />
                  {/if}
                </div>
              </button>

              <!-- Expanded Detail -->
              {#if expandedId === q.id}
                <div class="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-4">
                  <div class="text-xs text-slate-700 bg-white rounded-xl p-4 border border-slate-200">
                    <strong class="text-slate-900">Full Question:</strong>
                    <p class="mt-1 whitespace-pre-wrap">{q.question}</p>
                  </div>

                  {#if q.reply}
                    <div class="text-xs bg-[#316342]/5 rounded-xl p-4 border border-[#316342]/20">
                      <div class="flex items-center gap-1.5 mb-1">
                        <Reply class="h-3 w-3 text-[#316342]" />
                        <strong class="text-slate-900">Admin Reply:</strong>
                      </div>
                      <p class="text-slate-800 whitespace-pre-wrap">{q.reply}</p>
                      {#if q.repliedAt}
                        <span class="text-[10px] text-slate-500 mt-2 block">Replied on {formatDate(q.repliedAt)}</span>
                      {/if}
                    </div>
                  {:else}
                    <div>
                      <label for="reply-{q.id}" class="block text-xs font-bold text-slate-800 mb-1.5">
                        <Reply class="h-3 w-3 inline text-[#316342] mr-1" />
                        Write a Reply
                      </label>
                      <textarea
                        id="reply-{q.id}"
                        bind:value={replyText}
                        placeholder="Type your response here…"
                        rows="3"
                        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-900 outline-none transition focus:border-[#316342]"
                      ></textarea>
                      <div class="flex justify-end mt-2">
                        <button
                          onclick={() => sendReply(q.id)}
                          disabled={!replyText.trim() || !!replyLoading}
                          class="inline-flex items-center gap-1.5 rounded-xl bg-[#316342] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#254b32] transition disabled:opacity-50"
                        >
                          {#if replyLoading === q.id}
                            <Loader2 class="h-3.5 w-3.5 animate-spin" />
                          {:else}
                            <Send class="h-3.5 w-3.5" />
                          {/if}
                          Send Reply & Notify User
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
