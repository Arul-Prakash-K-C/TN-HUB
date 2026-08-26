export function applyTheme(themeName: string) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  localStorage.setItem('theme-color', themeName);
  
  if (themeName === 'navy') {
    root.style.setProperty('--theme-primary', '#071A28');
    root.style.setProperty('--theme-primary-hover', '#030c14');
    root.style.setProperty('--theme-primary-light', 'rgba(7, 26, 40, 0.1)');
    root.style.setProperty('--theme-sidebar-bg', '#071A28');
    root.style.setProperty('--theme-sidebar-active', '#1b2c3a');
  } else if (themeName === 'blue') {
    root.style.setProperty('--theme-primary', '#1565C0');
    root.style.setProperty('--theme-primary-hover', '#0d47a1');
    root.style.setProperty('--theme-primary-light', 'rgba(21, 101, 192, 0.1)');
    root.style.setProperty('--theme-sidebar-bg', '#0f3d73');
    root.style.setProperty('--theme-sidebar-active', '#1565C0');
  } else { // default green
    root.style.setProperty('--theme-primary', '#316342');
    root.style.setProperty('--theme-primary-hover', '#254b32');
    root.style.setProperty('--theme-primary-light', 'rgba(49, 99, 66, 0.1)');
    root.style.setProperty('--theme-sidebar-bg', '#143520');
    root.style.setProperty('--theme-sidebar-active', '#316342');
  }
}

export function applyThemeMode(mode: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  localStorage.setItem('theme-mode', mode);
  if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

export function getPreferredThemeMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function loadSavedTheme() {
  if (typeof window === 'undefined') return 'green';
  const saved = localStorage.getItem('theme-color') || 'green';
  applyTheme(saved);
  
  const mode = getPreferredThemeMode();
  applyThemeMode(mode);
  
  return saved;
}
