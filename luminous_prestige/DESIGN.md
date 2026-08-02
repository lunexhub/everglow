---
name: Luminous Prestige
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4c4548'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#7e7578'
  outline-variant: '#cfc4c7'
  surface-tint: '#655c5f'
  primary: '#655c5f'
  on-primary: '#ffffff'
  primary-container: '#fff1f5'
  on-primary-container: '#776d70'
  inverse-primary: '#d0c3c7'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#745b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff3dc'
  on-tertiary-container: '#886c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eddfe3'
  primary-fixed-dim: '#d0c3c7'
  on-primary-fixed: '#201a1d'
  on-primary-fixed-variant: '#4d4448'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffe08b'
  tertiary-fixed-dim: '#eac249'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
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
  lg: 32px
  xl: 48px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system embodies "Luminous Prestige," a visual framework designed for a high-end MLM ecosystem. The brand personality is aspirational yet accessible, blending the sophistication of luxury beauty with the structural reliability of a financial platform. It targets South African entrepreneurs who value professional growth and elegance.

The design style is a hybrid of **Minimalism** and **Soft Glamour**. It utilizes generous white space, delicate gold accents, and a refined editorial layout to evoke an emotional response of trust, success, and personal empowerment. The interface feels "clean" and "expensive," mirroring the quality of the products the community represents.

## Colors

The palette is centered on the contrast between soft, organic tones and metallic precision.

*   **Primary (Blush):** `#FFF1F5` - Used for large surfaces, card backgrounds, and subtle section highlights to maintain a soft, inviting atmosphere.
*   **Accent (Rose Gold):** `#D4AF37` - Reserved for high-priority actions, interactive states, and achievement indicators. Use `#C5A028` for hover/active states to maintain depth.
*   **Neutrals:**
    *   **Charcoal (`#2D2D2D`):** Used for primary headings and body text to ensure high legibility and a grounded, professional feel.
    *   **Slate Grey (`#6B7280`):** Used for secondary labels and metadata.
    *   **White (`#FFFFFF`):** The base foundation to ensure the "clean" brand promise is met.

## Typography

The typography strategy employs a classic serif-on-sans pairing. **Playfair Display** provides an editorial, high-fashion feel for headlines, signaling prestige. **Inter** is used for all functional UI elements and body copy to ensure clarity and speed of reading on mobile devices.

Use `label-caps` for small metadata, like "Total Earnings" or "Member Tier," to provide a structured, organized look to the financial data. Maintain a high contrast ratio for all Inter-based text against the Blush or White backgrounds.

## Layout & Spacing

This design system utilizes a **Fluid Grid** optimized for mobile-first consumption. 

*   **Mobile (Default):** 4-column grid with 20px outside margins and 16px gutters.
*   **Desktop:** 12-column grid with a max-width of 1140px.

Spacing follows a 4px base unit. Use larger vertical spacing (`xl`) between major sections to maintain a high-end, airy feel. Content should never feel cramped; prioritize "white space" even when the white space is actually the Blush color.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

*   **Low Elevation:** Cards sit on the white background using the Blush (`#FFF1F5`) fill without shadows, or a white fill with a 1px Blush border.
*   **High Elevation:** Interactive elements or featured achievement cards use a very soft, diffused shadow: `box-shadow: 0 10px 30px rgba(212, 175, 55, 0.08)`.
*   **Metallic Depth:** Use subtle linear gradients on Gold buttons (e.g., from `#D4AF37` to `#B8952E`) to give them a "glowing" physical presence without being skeuomorphic.

## Shapes

The shape language is **Soft** and tailored. A standard radius of `0.25rem` (4px) is used for inputs and smaller components, while `0.75rem` (12px) is used for main container cards. This creates a balanced look that feels modern and professional, avoiding the overly "bubbly" look of high-radius corners to maintain a serious, business-oriented tone.

## Components

*   **Buttons:**
    *   *Primary:* Solid Gold (`#D4AF37`) with Charcoal text for maximum contrast and "glow."
    *   *Secondary:* Solid Blush (`#FFF1F5`) with a 1px Gold border and Gold text.
*   **Cards:** Use the Blush color for the background. For premium dashboard widgets (like "Total Commissions"), add a 1px Rose Gold top border to denote importance.
*   **Badges:** 
    *   *Active:* Soft Emerald background with Dark Green text.
    *   *Pending:* Soft Amber background with Dark Brown text.
    *   *Delivered:* Soft Blush background with Gold text.
*   **Progress Bars:** The track should be a light grey (`#F3F4F6`), with the progress fill being a Rose Gold gradient. Ensure the percentage text uses `label-caps` for a professional finish.
*   **Input Fields:** White background with a 1px light grey border. On focus, the border transitions to Gold with a soft 2px Gold outer glow.
*   **Lists:** Transaction and recruitment lists should use thin Blush-colored dividers (`1px`) to separate items, maintaining a clean, vertical rhythm.