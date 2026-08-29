import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import en from '../../src/lib/i18n/en.json';
import ta from '../../src/lib/i18n/ta.json';
import { locale, t } from '../../src/lib/i18n/index.js';

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (['.svelte', '.js', '.ts'].includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripNonMarkup(source) {
  return source.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
}

describe('i18n dictionaries', () => {
  it('loads both dictionaries', () => {
    expect(Object.keys(en).length).toBeGreaterThan(0);
    expect(Object.keys(ta).length).toBeGreaterThan(0);
  });

  it('keeps English and Tamil translation keys in sync both ways', () => {
    expect(Object.keys(ta).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(en).sort()).toEqual(Object.keys(ta).sort());
  });

  it('loads English translations and interpolates parameters', () => {
    locale.set('en');
    expect(t('nav.dashboard')).toBe('Dashboard');
    expect(t('dashboard.welcome', { name: 'Arul' })).toBe('Welcome back, Arul!');
  });

  it('loads Tamil translations and interpolates parameters', () => {
    locale.set('ta');
    expect(t('nav.dashboard')).toBe(ta['nav.dashboard']);
    expect(t('dashboard.welcome', { name: 'Arul' })).toBe(
      ta['dashboard.welcome'].replace('{{name}}', 'Arul')
    );
  });

  it('falls back to the key for unknown translations', () => {
    locale.set('ta');
    expect(t('missing.translation.key')).toBe('missing.translation.key');
  });

  it('switches between Tamil and English', () => {
    locale.set('ta');
    expect(t('common.cancel')).toBe(ta['common.cancel']);
    locale.set('en');
    expect(t('common.cancel')).toBe('Cancel');
  });

  it('has Tamil coverage for high-visibility UI surfaces', () => {
    locale.set('ta');
    const highVisibilityKeys = [
      'auth.loginRequired',
      'feature.notice.title',
      'chatbot.initial.title',
      'chatbot.footer.disclaimer',
      'department.applicationQueue',
      'operator.grievanceDesk',
      'admin.helpdesk.nav',
      'settings.interfaceThemeMode'
    ];

    for (const key of highVisibilityKeys) {
      expect(t(key)).not.toBe(en[key]);
      expect(t(key)).not.toBe(key);
    }
  });

  it('does not leave simple hardcoded English strings in rendered markup', () => {
    const roots = ['src/routes', 'src/lib/components'];
    const textNodePattern = />\s*([A-Za-z][A-Za-z0-9 ,.'!?&/()₹:%+-]*)\s*</g;
    const attributePattern = /\b(placeholder|aria-label|title|alt)="([A-Za-z][^"]*)"/g;
    const hits = [];

    for (const file of roots.flatMap((root) => walk(root))) {
      const source = stripNonMarkup(readFileSync(file, 'utf8'));
      for (const pattern of [textNodePattern, attributePattern]) {
        let match;
        while ((match = pattern.exec(source))) {
          const line = source.slice(0, match.index).split(/\r?\n/).length;
          hits.push(`${file}:${line}: ${match[0].trim()}`);
        }
      }
    }

    expect(hits).toEqual([]);
  });
});
