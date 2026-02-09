# Ramp Design System (DYSEM)

## 1. Design Principles

Ramp is a professional projection mapping tool. The interface should be:

- **Immersive:** The UI is secondary to the canvas. Dark mode is default/preferred for projection environments.
- **Precise:** Controls should feel mechanical and responsive.
- **Unified:** All surfaces, inputs, and feedback mechanisms should share a common language.

## 2. Token System

### Colors

We use the OKLCH color space for perceptually uniform colors.

| Token                | Role            | Value (Ref)          | Description                                               |
| -------------------- | --------------- | -------------------- | --------------------------------------------------------- |
| `primary`            | Brand Action    | `#e54d2e`            | Used for primary buttons, active states, and focus rings. |
| `primary-foreground` | Text on Primary | `#ffffff`            | White text on orange background.                          |
| `background`         | App Background  | `oklch(0.145 0 0)`   | Deep neutral black/gray (Zinc 950).                       |
| `foreground`         | Content         | `oklch(0.985 0 0)`   | High contrast text (Zinc 50).                             |
| `card`               | Surfaces        | `oklch(0.205 0 0)`   | Panel backgrounds (Zinc 900).                             |
| `muted`              | Secondary bg    | `oklch(0.269 0 0)`   | Hover states, secondary buttons (Zinc 800).               |
| `border`             | Dividers        | `oklch(1 0 0 / 10%)` | Subtle borders.                                           |

### Typography

- **Font Family:** `Inter` (sans-serif) for UI, `JetBrains Mono` (monospace) for values/code.
- **Scale:**
  - `xs`: 12px
  - `sm`: 13px (Base UI size)
  - `base`: 14px
  - `lg`: 16px
  - `xl`: 20px
  - `2xl`: 24px

### Spacing & Sizing

- **Base Unit:** 4px (0.25rem).
- **Radius:**
  - `sm`: 4px
  - `md`: 8px
  - `lg`: 10px (Standard component radius)
  - `full`: 9999px

## 3. Component Usage

### Buttons

Use the `<Button />` component from `@/components/ui/button`.

- **Primary:** `variant="default"` - Main calls to action (Save, Sign In).
- **Secondary:** `variant="secondary"` - Alternative actions.
- **Ghost/Glass:** `variant="ghost"` - Toolbar items, overlay controls.
- **Destructive:** `variant="destructive"` - Delete, remove.

### Forms

Use `<Input />`, `<Label />`, and form layouts.

- Inputs have a standard height of 36px (`h-9`).
- Labels are `text-xs` or `text-sm` and `muted-foreground` by default.

### Toolbar

The toolbar is a specialized control surface.

- Background: Glassmorphism (Black/75% opacity + Blur).
- Location: Floating (Top or Bottom).

## 4. Development Guidelines

- **Do not** hardcode hex values (e.g., `bg-[#e54d2e]`). Use `bg-primary`.
- **Do not** use raw `<button>` tags. Use `<Button />`.
- **Do not** set arbitrary font sizes (e.g., `text-[13px]`). Use `text-sm` (remapped if necessary) or defined utilities.
