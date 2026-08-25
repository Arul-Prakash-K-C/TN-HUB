// ============================================
// i18n — Store-based Internationalization
// ============================================

import { writable, derived, get } from 'svelte/store';
import en from './en.json';
import ta from './ta.json';

// Add a locale here and the existing component calls remain unchanged.
const localeModules = { en, ta } as const;
export type Locale = keyof typeof localeModules;
const translations: Record<Locale, Record<string, string>> = localeModules;

// Create locale store with browser persistence
function createLocaleStore() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('sympho-locale') : null;
  const initial: Locale = stored && stored in translations ? stored as Locale : 'en';
  const { subscribe, set, update } = writable<Locale>(initial);

  return {
    subscribe,
    set: (value: Locale) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sympho-locale', value);
        document.documentElement.lang = value;
      }
      set(value);
    },
    toggle: () => {
      update(current => {
        const next: Locale = current === 'en' ? 'ta' : 'en';
        if (typeof window !== 'undefined') {
          localStorage.setItem('sympho-locale', next);
          document.documentElement.lang = next;
        }
        return next;
      });
    }
  };
}

export const locale = createLocaleStore();

// Translation function — looks up nested keys like "nav.services"
export function t(key: string, params?: Record<string, string | number>): string {
  const currentLocale = get(locale);
  const dict = translations[currentLocale] || translations.en;
  
  let value = dict[key] || translations.en[key] || key;
  
  // Replace template parameters {{param}}
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }
  
  return value;
}

// Reactive translation — for use in Svelte components
export const tt = derived(locale, ($locale) => {
  return (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[$locale] || translations.en;
    let value = dict[key] || translations.en[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      });
    }
    
    return value;
  };
});

// Helper to check if current locale is Tamil
export const isTamil = derived(locale, ($locale) => $locale === 'ta');
