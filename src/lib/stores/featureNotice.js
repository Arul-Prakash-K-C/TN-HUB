import { writable } from 'svelte/store';

export const featureNotice = writable({
  isOpen: false,
  featureName: ''
});

export function triggerFeatureNotice(featureName) {
  featureNotice.set({
    isOpen: true,
    featureName
  });
}
