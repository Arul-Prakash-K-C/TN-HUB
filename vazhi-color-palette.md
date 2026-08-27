# VAZHI Color Palette

Extracted directly from the live app's CSS custom properties (`https://vazhi-9a321.web.app`). This is a semantic design-token system with a light theme and a dark theme sharing the same variable names, so it's easy to drop into another project as-is.

## Base brand colors

| Token | Light | Dark |
|---|---|---|
| `--vazhi-primary` | `#4a7c59` | `#4a7c59` |
| `--vazhi-accent` | `#86a789` | `#86a789` |
| `--vazhi-bg-light` | `#fafaf7` | — |
| `--vazhi-bg-dark` | — | `#141716` |
| `--vazhi-surface-dark` | — | `#1b1f1d` |
| `--vazhi-text-dark-primary` | `#1a1a1a` | — |
| `--vazhi-text-dark-secondary` | `#555555` | — |
| `--vazhi-text-light-primary` | `#ffffff` | — |
| `--vazhi-text-light-secondary` | `#9ca3af` | — |

## Semantic tokens — Light theme

```css
:root {
  color-scheme: light;

  /* Primary */
  --c-primary: #4a7c59;
  --c-primary-hover: #3e6a4b;
  --c-primary-active: #33583e;
  --c-on-primary: #ffffff;
  --c-primary-soft: #e6efe8;
  --c-primary-soft-text: #2f5340;

  /* Accent */
  --c-accent: #86a789;
  --c-accent-soft: #eaf1eb;

  /* Surfaces */
  --c-background: #fafaf7;
  --c-surface: #ffffff;
  --c-surface-container: #f1f1ec;
  --c-surface-container-high: #e8e8e2;
  --c-surface-inverse: #222624;
  --c-on-surface-inverse: #f2f3f0;

  /* Text */
  --c-text: #1a1a1a;
  --c-text-muted: #555555;
  --c-text-faint: #6e766f;

  /* Borders */
  --c-border: #e2e3dd;
  --c-border-strong: #c9cdc5;

  /* Status */
  --c-success: #3f7d55;
  --c-success-soft: #e5f0e8;
  --c-warning: #8a6220;
  --c-warning-soft: #f7efdf;
  --c-danger: #a63b3b;
  --c-danger-soft: #f7e6e6;

  /* Map-specific */
  --c-map-land: #f2f2ec;
  --c-map-water: #dfe8e6;
  --c-map-line-inactive: #86a789;

  /* Shadows */
  --vazhi-shadow-1: 0 2px 8px #0000000a;
  --vazhi-shadow-2: 0 10px 24px #00000014;
}
```

## Semantic tokens — Dark theme

```css
[data-theme="dark"] {
  color-scheme: dark;

  /* Primary */
  --c-primary: #4a7c59;
  --c-primary-hover: #558c66;
  --c-primary-active: #61996f;
  --c-on-primary: #ffffff;
  --c-primary-soft: #223027;
  --c-primary-soft-text: #86a789;

  /* Accent */
  --c-accent: #86a789;
  --c-accent-soft: #1f2a22;

  /* Surfaces */
  --c-background: #141716;
  --c-surface: #1b1f1d;
  --c-surface-container: #232725;
  --c-surface-container-high: #2b302d;
  --c-surface-inverse: #f2f3f0;
  --c-on-surface-inverse: #1a1c1b;

  /* Text */
  --c-text: #ffffff;
  --c-text-muted: #9ca3af;
  --c-text-faint: #7f8a82;

  /* Borders */
  --c-border: #2d3331;
  --c-border-strong: #3d4441;

  /* Status */
  --c-success: #7ec091;
  --c-success-soft: #1e2a22;
  --c-warning: #dcb066;
  --c-warning-soft: #2c2519;
  --c-danger: #e08b8b;
  --c-danger-soft: #2e1f1f;

  /* Map-specific */
  --c-map-land: #1b1f1d;
  --c-map-water: #171d1c;
  --c-map-line-inactive: #4a5c4e;

  /* Shadows */
  --vazhi-shadow-1: 0 2px 8px #00000066;
  --vazhi-shadow-2: 0 10px 24px #00000080;
}
```

## Quick-reference swatch list (hex only)

**Core**
- Primary (green): `#4a7c59`
- Accent (sage): `#86a789`
- Light background: `#fafaf7`
- Dark background: `#141716`

**Status**
- Success: `#3f7d55` (light) / `#7ec091` (dark)
- Warning: `#8a6220` (light) / `#dcb066` (dark)
- Danger: `#a63b3b` (light) / `#e08b8b` (dark)

**Fonts (also pulled from the same stylesheet)**
- Sans: `"Hanken Grotesk", "Noto Sans Tamil", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Mono: `"JetBrains Mono", ui-monospace, "Cascadia Mono", "Courier New", monospace`

## Notes for reuse in another project

- This is a **semantic token system**, not just a flat swatch list — `--c-primary`, `--c-background`, etc. reference the base `--vazhi-*` brand colors, so if you rebrand you only need to change the small "Base brand colors" table and everything downstream updates.
- Both theme blocks use identical variable names (`--c-primary`, `--c-text`, etc.) so theme switching is just toggling which block is active (e.g. via a `[data-theme="dark"]` attribute or a `.dark` class on `<html>`), the same pattern VAZHI itself uses.
- If the target project uses Tailwind v4, these can be dropped straight into `@theme` or a `:root`/`[data-theme]` block since Tailwind v4 reads CSS custom properties natively.
- "Soft" variants (`-soft`, `-soft-text`) are tinted/muted backgrounds meant for badges, chips, and status pills — not raw fills.
