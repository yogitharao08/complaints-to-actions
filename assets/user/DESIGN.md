---
name: Civic Resolve
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434654'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1353d8'
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#005438'
  on-tertiary: '#ffffff'
  tertiary-container: '#006f4b'
  on-tertiary-container: '#68f5b8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  status-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
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
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width-content: 1280px
---

## Brand & Style

The design system is engineered for **Civic Technology**, prioritizing institutional authority, transparency, and accessible service delivery. The brand personality is dependable and responsive, aimed at bridging the gap between citizen grievances and government action.

The visual style follows a **Corporate / Modern** aesthetic with strong influences from **Minimalism**. It avoids unnecessary decorative elements to ensure that information—specifically complaint status and tracking IDs—remains the focal point. The interface must feel "official" but approachable, replacing bureaucratic complexity with functional clarity. High legibility and intuitive navigation are the primary drivers of the user experience.

## Colors

The palette is built on a foundation of "Trust Blue," signaling stability and government-grade reliability. 

- **Primary (#1A56DB):** Used for primary actions, navigation headers, and authoritative branding.
- **Secondary (#F97316):** Reserved for "Action" items—urgent alerts, pending statuses, and notifications that require citizen or official attention.
- **Success (#10B981):** Specifically for "Resolved" or "Completed" states to provide a clear, positive emotional payoff.
- **Surface & Background:** A light-mode first approach using whites and cool grays (#F9FAFB) to maintain a clean, document-like feel that reduces cognitive load during form entry.

## Typography

The design system utilizes **Inter** for its exceptional legibility and systematic, neutral tone. 

The hierarchy is structured to highlight **Complaint IDs** and **Status Labels** above all else. Headline styles use a tighter letter-spacing and heavier weights to command authority. Label styles (status-label) utilize semi-bold weights to ensure they remain legible even when reduced in size on mobile tracking cards. Body text is optimized for readability with generous line heights to accommodate long-form grievance descriptions.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a hard max-width for desktop to ensure readability of data tables and complaint lists. 

A strict **8px spacing scale** governs all margins and paddings. On mobile devices, the system shifts to a single-column layout with 16px side margins to maximize the horizontal space for card content. Desktop layouts utilize a 12-column grid with 24px gutters. 

Touch targets for all interactive elements (buttons, category filters, chevron links) are strictly enforced at a minimum of **48x48px** to ensure accessibility for all citizens, including those using the platform in outdoor or high-stress environments.

## Elevation & Depth

To maintain a professional and "flat" institutional feel, depth is created primarily through **Tonal Layers** rather than heavy shadows.

- **Level 0 (Background):** The base canvas uses the surface gray (#F9FAFB).
- **Level 1 (Cards):** Complaints and list items sit on white backgrounds with a subtle 1px border (#E5E7EB).
- **Level 2 (Active/Hover):** A very soft, diffused ambient shadow (0px 4px 6px rgba(0,0,0,0.05)) is applied only to interactive cards to indicate pressability.

This approach ensures that the UI feels structured and organized—like a digital filing system—without the visual clutter of skeuomorphism or neon blurs.

## Shapes

The design system uses a **Soft (1)** shape language. Corner radiuses are kept to 4px (0.25rem) for standard components like input fields and buttons, increasing to 8px (0.5rem) for complaint cards. 

This subtle rounding strikes a balance: it is modern and friendly enough to be approachable for citizens, yet sharp enough to maintain a serious, professional, and law-abiding character. Fully rounded "pill" shapes are avoided to keep the aesthetic grounded and official.

## Components

### Buttons
Primary buttons use the Deep Trust Blue with white text. Secondary buttons use a thick 2px outline of the blue. All buttons feature a 48px height on mobile to facilitate easy "Action" submission.

### Complaint Cards
The central component of the system. Cards feature a white background, an 8px corner radius, and a 1px gray border. The Status Chip is always located in the top-right corner, while the Complaint ID is styled with `label-bold` in the top-left.

### Status Chips
High-contrast badges with background tints:
- **Pending:** Light Orange background / Dark Orange text.
- **In Progress:** Light Blue background / Dark Blue text.
- **Resolved:** Light Green background / Dark Green text.
- **Escalated:** Light Red background / Dark Red text.

### Input Fields
Inputs use a white background with a 1px border. On focus, the border thickens and changes to Deep Trust Blue. Labels are always visible above the field (no floating labels) to ensure maximum accessibility and clarity for form-heavy grievances.

### Category Icons
Icons for Sanitation, Roads, Water, and Electricity should be enclosed in a circular container with a light blue background, using simple, bold glyphs to ensure they are recognizable at small sizes.