// ============================================
// i18n — Store-based Internationalization
// ============================================
import { writable, derived, get } from 'svelte/store';
import en from './en.json';
import ta from './ta.json';

const localeModules = { en, ta };
const translations = localeModules;

function applyDocumentLocale(value) {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = value;
    document.documentElement.dataset.locale = value;
}

function persistLocale(value) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('tnhub-locale', value);
    } catch {
        // Safe fallback if localStorage is restricted
    }
    try {
        document.cookie = `tnhub-locale=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {
        // Safe fallback if cookies restricted
    }
}

function readStoredLocale() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('tnhub-locale');
        if (stored && stored in translations) return stored;
    } catch {
        // ignore
    }
    try {
        const match = document.cookie.match(/(?:^|;\s*)tnhub-locale=([^;]+)/);
        if (match && match[1] in translations) return decodeURIComponent(match[1]);
    } catch {
        // ignore
    }
    return null;
}

// Create locale store with browser persistence and cookie synchronization
function createLocaleStore() {
    const stored = readStoredLocale();
    const initial = stored && stored in translations ? stored : 'en';
    applyDocumentLocale(initial);
    const { subscribe, set, update } = writable(initial);

    return {
        subscribe,
        set: (value) => {
            const resolved = value in translations ? value : 'en';
            persistLocale(resolved);
            applyDocumentLocale(resolved);
            set(resolved);
        },
        toggle: () => {
            update(current => {
                const next = current === 'en' ? 'ta' : 'en';
                persistLocale(next);
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

// Translation function — looks up keys with optional parameters
export function t(key, params) {
    const currentLocale = get(locale);
    const dict = translations[currentLocale] || translations.en;
    let value = dict[key] || translations.en[key] || key;
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
