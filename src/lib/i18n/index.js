// ============================================
// i18n — Store-based Internationalization
// ============================================
import { writable, derived, get } from 'svelte/store';
import en from './en.json';
import ta from './ta.json';
// Add a locale here and the existing component calls remain unchanged.
const localeModules = { en, ta };
const translations = localeModules;
function applyDocumentLocale(value) {
    if (typeof document === 'undefined')
        return;
    document.documentElement.lang = value;
    document.documentElement.dataset.locale = value;
}
// Create locale store with browser persistence
function createLocaleStore() {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('tnhub-locale') : null;
    const initial = stored && stored in translations ? stored : 'en';
    applyDocumentLocale(initial);
    const { subscribe, set, update } = writable(initial);
    return {
        subscribe,
        set: (value) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('tnhub-locale', value);
            }
            applyDocumentLocale(value);
            set(value);
        },
        toggle: () => {
            update(current => {
                const next = current === 'en' ? 'ta' : 'en';
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tnhub-locale', next);
                }
                applyDocumentLocale(next);
                return next;
            });
        }
    };
}
export const locale = createLocaleStore();
const regexCache = new Map();
function getParamRegex(paramName) {
    let regex = regexCache.get(paramName);
    if (!regex) {
        regex = new RegExp(`\\{\\{${paramName}\\}\\}`, 'g');
        regexCache.set(paramName, regex);
    }
    return regex;
}
// Translation function — looks up nested keys like "nav.services"
export function t(key, params) {
    const currentLocale = get(locale);
    const dict = translations[currentLocale] || translations.en;
    let value = dict[key] || translations.en[key] || key;
    // Replace template parameters {{param}}
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            value = value.replace(getParamRegex(k), String(v));
        });
    }
    return value;
}
// Reactive translation — for use in Svelte components
export const tt = derived(locale, ($locale) => {
    return (key, params) => {
        const dict = translations[$locale] || translations.en;
        let value = dict[key] || translations.en[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                value = value.replace(getParamRegex(k), String(v));
            });
        }
        return value;
    };
});
// Helper to check if current locale is Tamil
export const isTamil = derived(locale, ($locale) => $locale === 'ta');
