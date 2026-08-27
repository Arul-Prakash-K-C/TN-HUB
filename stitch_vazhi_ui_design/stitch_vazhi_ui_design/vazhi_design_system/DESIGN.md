---
name: Vazhi Design System
colors:
  surface: '#f9f9f6'
  surface-dim: '#dadad7'
  surface-bright: '#f9f9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414942'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#717971'
  outline-variant: '#c1c9bf'
  surface-tint: '#376847'
  primary: '#316342'
  on-primary: '#ffffff'
  primary-container: '#4a7c59'
  on-primary-container: '#e1ffe5'
  inverse-primary: '#9dd3aa'
  secondary: '#47664b'
  on-secondary: '#ffffff'
  secondary-container: '#c6e9c7'
  on-secondary-container: '#4b6a4f'
  tertiary: '#834751'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f5f69'
  on-tertiary-container: '#fff5f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9efc5'
  primary-fixed-dim: '#9dd3aa'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#1e5031'
  secondary-fixed: '#c8ebca'
  secondary-fixed-dim: '#adcfaf'
  on-secondary-fixed: '#03210c'
  on-secondary-fixed-variant: '#304d35'
  tertiary-fixed: '#ffd9dd'
  tertiary-fixed-dim: '#ffb2bc'
  on-tertiary-fixed: '#380b16'
  on-tertiary-fixed-variant: '#6d363f'
  background: '#f9f9f6'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
  success: '#3f7d55'
  warning: '#8a6220'
  danger: '#a63b3b'
  map-land: '#f2f2ec'
  map-water: '#dfe8e6'
  surface-dark: '#1b1f1d'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is crafted for the unique cultural and geographic landscape of Tamil Nadu. It balances the utility of a navigation tool with a serene, nature-inspired aesthetic that reflects the region's diverse terrain—from the lush Western Ghats to coastal paths.

The visual direction follows a **Modern / Corporate** approach with **Minimalist** sensibilities. It prioritizes clarity and legibility, using a sophisticated organic color palette to reduce "GPS fatigue." The experience is intended to feel dependable, calm, and culturally resonant, moving away from the aggressive high-contrast blues of traditional navigation apps toward a grounded, earth-toned interface.

## Colors
The color strategy uses a **Primary Green** as the main functional anchor for actions and active routes, paired with an **Accent Sage** for supplementary information and soft UI states. 

The system utilizes a dual-mode semantic structure. In **Light Mode**, the background is a warm off-white (`#fafaf7`) to reduce glare during daytime travel. In **Dark Mode**, the interface shifts to a deep charcoal-green (`#141716`) to maintain legibility while preserving night vision. Semantic "Soft" tokens are provided for low-emphasis backgrounds, such as chips and alerts, ensuring high text contrast without visual clutter.

## Typography
The system uses **Hanken Grotesk** as the primary typeface for its modern, sharp, and highly legible characteristics. For Tamil script support, **Noto Sans Tamil** is integrated as a sibling font to ensure a seamless bilingual experience that maintains consistent stroke weights across both languages.

Headlines utilize tighter letter spacing and heavier weights for immediate hierarchy, especially useful for transit directions. Body text is set with generous line heights to improve readability during movement. For navigation-specific data (distances, durations), a monospaced font like **JetBrains Mono** should be used to ensure numerical alignment.

## Layout & Spacing
This design system utilizes a **Fluid Grid** model with a base 4px rhythm. On mobile devices (the primary touchpoint for navigation), a 4-column layout is used with 16px margins. Desktop layouts expand to a 12-column grid to accommodate wider map views and sidebars.

Spacing is designed for high "tapability." Interactive elements should maintain a minimum 48px touch target. Dynamic padding is used for map overlays and floating action buttons to ensure they do not obscure critical map data or navigation controls.

## Elevation & Depth
Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

1.  **Level 0 (Base):** The map or primary canvas.
2.  **Level 1 (Surface):** Cards and search bars use a subtle shadow (`vazhi-shadow-1`) to lift from the map without creating harsh edges.
3.  **Level 2 (Overlays):** Bottom sheets and navigation modals use a deeper, more diffused shadow (`vazhi-shadow-2`) to indicate temporary, high-priority interactions.

In Dark Mode, elevation is communicated primarily through lighter surface tones (e.g., `--c-surface-container`) rather than heavy shadows to maintain a clean, glare-free interface.

## Shapes
The shape language is **Rounded**, reflecting the approachable and organic nature of the brand. 
- **Standard (0.5rem):** Used for input fields, list items, and standard cards.
- **Large (1rem):** Used for prominent map overlays and bottom sheets to give them a "friendly" feel.
- **Pill (Full):** Reserved for status badges (e.g., "Fastest Route") and primary floating action buttons to distinguish them from structural content.

## Components
- **Buttons:** Primary buttons use `--c-primary` with white text. Ghost buttons use `--c-primary-soft-text` for secondary actions. All buttons have a minimum height of 48px for outdoor utility.
- **Input Fields:** Search bars should be prominent, featuring a white surface in light mode with `--vazhi-shadow-1` and a search icon.
- **Chips:** Used for filtering travel modes or POIs. Active chips use `--c-primary`, while inactive chips use `--c-accent-soft`.
- **Lists:** Travel results use a clean list style with `--c-border` separators and 16px vertical padding.
- **Cards:** Direction cards use a "Container" surface with a 1px border (`--c-border`) to separate route segments clearly.
- **Map Overlays:** Floating buttons for "Current Location" and "Zoom" should be circular (pill-shaped) with high elevation to remain accessible over complex map backgrounds.