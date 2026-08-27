import { writable } from 'svelte/store';

export const toasts = writable([]);

export function showToast(title, message, type = 'info') {
  const id = Date.now();
  toasts.update(current => [...current, { id, title, message, type }]);
  
  // Auto-remove after 6 seconds
  setTimeout(() => {
    toasts.update(current => current.filter(t => t.id !== id));
  }, 6000);
}
