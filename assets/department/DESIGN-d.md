---
name: Civic Resolve Dark
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system is engineered for institutional trust, civic engagement, and high-stakes clarity. It targets a diverse audience requiring accessible information in government, public health, or financial sectors. The UI evokes a sense of calm authority, reliability, and modern efficiency.

The aesthetic follows a **Corporate / Modern** direction with a focus on **Minimalism**. It prioritizes high-legibility typography and purposeful whitespace to reduce cognitive load. The dark mode implementation is not merely an inversion of light mode but a deliberate application of deep navy depths to maintain focus during extended periods of use. All elements are structured to feel grounded, professional, and accessible to users with varying needs.

## Colors

The palette is anchored by a deep navy primary surface (#0f172a) to ensure a sophisticated, non-stark dark environment. The primary blue has been adjusted to **#3b82f6** to ensure it exceeds WCAG AA contrast requirements (4.5:1) against the dark background, maintaining brand recognition while ensuring accessibility.

Secondary colors are kept neutral to support the primary blue without competing for attention. Tonal variations of slate and navy are used to define information hierarchy:
- **Primary:** Actionable elements and highlights.
- **Surface:** The foundational navy for cards and modules.
- **Surface-Container:** Used for nested elements or distinct content sections.
- **Text Primary:** High-contrast off-white for maximum readability.

## Typography

This design system utilizes **Hanken Grotesk** for headlines to provide a sharp, contemporary institutional feel. **Public Sans** is used for all body text and labels; it is a typeface specifically designed for public interfaces, ensuring exceptional clarity and accessibility.

Hierarchy is established through weight and scale. Large headlines use tight letter spacing and bold weights to command attention, while body text uses a generous 1.5x line height to ensure readability in dark mode, where "halation" (text bleeding) can often occur.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop, centering content within a 1280px container to prevent excessive line lengths. Mobile and tablet views transition to a **Fluid Grid**.

- **Desktop (1024px+):** 12-column grid, 24px gutters, 64px margins.
- **Tablet (768px - 1023px):** 8-column grid, 24px gutters, 32px margins.
- **Mobile (0px - 767px):** 4-column grid, 16px gutters, 16px margins.

Spacing follows a 4px baseline rhythm. Internal component padding (e.g., inside cards or buttons) should prioritize the `md` (16px) and `lg` (24px) units to maintain a spacious, accessible feel.

## Elevation & Depth

In this dark mode environment, depth is communicated through **Tonal Layers** rather than heavy shadows. Shadows are often lost on deep navy backgrounds, so elevation is achieved by lightening the surface color as it moves closer to the user.

- **Level 0 (Background):** Deepest navy (#020617).
- **Level 1 (Cards/Containers):** Primary surface (#0f172a).
- **Level 2 (Modals/Overlays):** Lighter container (#1e293b) with a subtle 1px stroke (#334155).
- **Level 3 (Popovers/Tooltips):** The lightest surface (#334155).

When shadows are used for high-level overlays (like modals), they should be large, soft, and tinted with the primary navy, using a "Multiply" or "Normal" blend mode with low opacity to avoid a muddy look.

## Shapes

The shape language is **Soft**, utilizing a 0.25rem (4px) base radius. This provides a balance between the rigid "sharp" look of traditional government systems and the overly "bubbly" feel of consumer apps. 

- **Small elements (Checkboxes, Inputs):** 4px radius.
- **Medium elements (Buttons, Chips):** 8px (rounded-lg).
- **Large elements (Cards, Modals):** 12px (rounded-xl).

This slight rounding maintains a professional tone while making the interface feel modern and approachable.

## Components

### Buttons
Primary buttons use the adjusted Blue (#3b82f6) with white text. Secondary buttons use a transparent background with a 1px border (#334155) and white text. Focus states must include a 2px offset ring in the primary color to ensure keyboard navigation visibility.

### Input Fields
Inputs use the `surface-container` color (#1e293b) with a subtle border (#334155). Labels are always persistent (not floating) using `label-md` in `text-secondary`.

### Cards
Cards use the `surface` color (#0f172a) and a 1px subtle stroke (#1e293b). For interactive cards, the stroke color should transition to the primary blue on hover.

### Chips & Tags
Used for status indicators. Success uses a muted emerald tint, Warning uses a muted amber, and Error uses a muted rose. In all cases, text contrast must be manually verified against the dark surface.

### Lists
List items are separated by subtle horizontal lines (#1e293b). For high-density data, use alternating row tints using the `surface-container` color.