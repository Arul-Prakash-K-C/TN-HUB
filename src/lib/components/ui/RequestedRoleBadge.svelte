<script>
  import { ShieldCheck } from '@lucide/svelte';

  let { role = 'operator' } = $props();

  function getRoleLabel(value) {
    if (value === 'operator') return 'Kiosk Operator';
    if (value === 'department_user') return 'Department Officer';
    return value || 'User Role';
  }
</script>

<span class="requested-role-badge" aria-label={`Requested role: ${getRoleLabel(role)}`}>
  <ShieldCheck class="h-3.5 w-3.5 shrink-0" />
  <span>{getRoleLabel(role)}</span>
</span>

<style>
  .requested-role-badge {
    display: inline-flex;
    width: fit-content;
    min-height: 30px;
    align-items: center;
    gap: 0.45rem;
    border: 1px solid var(--role-badge-border);
    border-radius: 0.5rem;
    background: var(--role-badge-bg);
    color: var(--role-badge-text);
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }

  .requested-role-badge :global(svg) {
    color: var(--role-badge-accent);
  }
</style>
