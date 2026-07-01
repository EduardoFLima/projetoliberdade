---
name: Organic Freedom
colors:
  surface: '#faf9f6'
  surface-dim: '#dadad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#eeeeea'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#3d4a3f'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ed'
  outline: '#6d7b6e'
  outline-variant: '#bccabb'
  surface-tint: '#006d38'
  primary: '#006d38'
  on-primary: '#ffffff'
  primary-container: '#00aa5a'
  on-primary-container: '#003518'
  inverse-primary: '#57df88'
  secondary: '#5656a3'
  on-secondary: '#ffffff'
  secondary-container: '#acabff'
  on-secondary-container: '#3d3c88'
  tertiary: '#5b5f5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#919593'
  on-tertiary-container: '#2a2e2d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#76fca2'
  primary-fixed-dim: '#57df88'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#100a5d'
  on-secondary-fixed-variant: '#3e3d8a'
  tertiary-fixed: '#e0e3e1'
  tertiary-fixed-dim: '#c4c7c5'
  on-tertiary-fixed: '#181c1b'
  on-tertiary-fixed-variant: '#434846'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3df'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system embodies "Organic Freedom"—a philosophy that balances structured reliability with natural, fluid movement. It is designed for platforms that bridge the gap between productivity and wellness, targeting a demographic that values clarity, growth, and a rhythmic user experience.

The style is a fusion of **Minimalism** and **Soft-Tactile** design. It utilizes expansive whitespace to reduce cognitive load while employing subtle depth and organic curves to make digital interactions feel more human. The aesthetic response should be one of "energized calm": professional enough for deep work, yet vibrant enough to feel life-centric and unconstrained.

## Colors
The palette is rooted in a "Forest & Twilight" harmony. 

- **Primary (#00AA5A):** A vibrant, growth-oriented green used for primary actions, success states, and key brand moments. It provides high energy and clear affordance.
- **Secondary (#3A3985):** A deep, intellectual indigo. Used for secondary navigation, structural elements, and to provide a professional grounding to the vibrant primary green.
- **Tertiary (#F4F7F5):** A soft, mint-tinted off-white used for large surface areas to reduce eye strain and maintain the organic feel.
- **Neutral (#1A1C1A):** A near-black charcoal for high-contrast typography and essential borders.

Accessibility is maintained by ensuring the secondary indigo is used for text on light backgrounds, while the primary green is reserved for large UI components or icons with sufficient surrounding contrast.

## Typography
The typography strategy pairs the friendly, contemporary curves of **Plus Jakarta Sans** for headlines with the functional, grounded clarity of **Work Sans** for body and UI labels.

Headlines should use tighter letter-spacing and heavier weights to create a strong visual anchor. Body text prioritizes legibility with generous line heights. On mobile devices, display sizes scale down significantly to ensure three-line headings do not overwhelm the viewport, maintaining the "Freedom" of the whitespace.

## Layout & Spacing
This design system utilizes a **Fluid Grid** based on an 8px rhythmic scale. 

- **Desktop:** 12-column grid with 24px gutters and 64px outer margins. Content is capped at a max-width of 1440px to ensure readability.
- **Tablet:** 8-column grid with 24px gutters and 32px margins.
- **Mobile:** 4-column grid with 16px gutters and 16px margins.

Spacing should be used to create "islands" of information. High-density layouts should be avoided; instead, use the `lg` and `xl` spacing tokens to separate distinct conceptual sections, allowing the UI to breathe.

## Elevation & Depth
Elevation is communicated through **Tonal Layers** and **Ambient Shadows**. This design system avoids harsh dropshadows.

1.  **Level 0 (Base):** The Tertiary (#F4F7F5) background.
2.  **Level 1 (Cards/Surface):** Pure White (#FFFFFF) surfaces with a very soft, diffused shadow (Offset: 0, 4px; Blur: 20px; Opacity: 4% of Secondary Color).
3.  **Level 2 (Interaction/Popovers):** Pure White with a slightly more defined shadow (Offset: 0, 8px; Blur: 32px; Opacity: 8% of Secondary Color).

The use of the Secondary color in the shadow tint ensures that the depth feels integrated into the environment rather than a generic gray overlay.

## Shapes
Shapes follow a **Rounded** logic to reinforce the "Organic" part of the brand narrative.

- **Standard Buttons/Inputs:** 0.5rem (8px) radius.
- **Cards/Containers:** 1rem (16px) radius.
- **Featured Banners/Modals:** 1.5rem (24px) radius.

Icons should always use rounded caps and corners. Sharp 90-degree angles are to be avoided in all UI elements to maintain a friendly and safe atmosphere.

## Components
- **Buttons:** Primary buttons use the Primary Green (#00AA5A) with white text. Secondary buttons use a transparent background with a 1px border and text in the Secondary Indigo (#3A3985).
- **Chips:** Small, rounded pills using a 10% opacity tint of the Primary or Secondary colors to denote categories without overwhelming the hierarchy.
- **Input Fields:** Use a subtle 1px border in a lightened version of the Secondary color. Upon focus, the border thickens to 2px and changes to the Primary Green.
- **Lists:** Items are separated by generous padding rather than lines. A subtle hover state (Tertiary color) indicates interactivity.
- **Checkboxes & Radios:** When active, these are filled with Primary Green. They use the `roundedness` logic—checkboxes have a slight 4px radius, while radios are perfectly circular.
- **Progress Bars:** Thin, organic lines using the Primary Green on a Tertiary background to visualize growth and movement.