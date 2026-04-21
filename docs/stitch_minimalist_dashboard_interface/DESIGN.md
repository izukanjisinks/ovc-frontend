# Design System Specification: The Lucid Sanctuary

## 1. Overview & Creative North Star
This design system moves away from the rigid, boxy constraints of traditional enterprise software to create **"The Lucid Sanctuary."** For an OVC (Orphans and Vulnerable Children) Management Information System, the interface must feel authoritative yet empathetic, high-density yet breathable.

Our Creative North Star is defined by **Luminous Depth**. We reject the "standard SaaS" look of gray lines and flat boxes. Instead, we use intentional asymmetry, layered translucency, and sophisticated tonal shifts to guide the user’s eye. This is a system where data doesn't just sit on a page—it lives within a structured, airy environment that feels premium and intentional.

---

## 2. Colors & Tonal Architecture
The palette is rooted in crisp whites and cool-toned grays, punctuated by a deep, vibrant electric indigo (`primary: #3525cd`).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section off content. Boundaries must be defined through background color shifts. 
- Use `surface` (`#f7f9fb`) for the main application background.
- Use `surface_container_low` (`#f2f4f6`) for sidebars or secondary panels.
- Use `surface_container_lowest` (`#ffffff`) for primary content cards.
This creates a natural, soft distinction that feels modern and high-end.

### Surface Hierarchy & Nesting
Think of the UI as physical layers of fine paper. 
- **Base Level:** `surface`
- **Mid Level:** `surface_container`
- **Elevated Level:** `surface_container_lowest` (White)
When nesting elements (e.g., a search bar inside a header), always shift one step in the container tier. Never place two identical surface colors on top of each other.

### The Glass & Gradient Rule
To add "soul" to the data:
- **Primary CTAs:** Use a subtle linear gradient from `primary` (#3525cd) to `primary_container` (#4f46e5) at a 135-degree angle.
- **Floating Elements:** Use Glassmorphism for overlays. Apply `surface_container_lowest` at 80% opacity with a 20px backdrop blur.

---

## 3. Typography: Editorial Authority
We utilize **Inter** to bridge the gap between technical precision and human readability.

- **The Power of Scale:** Use `display-md` for high-level dashboard metrics to give them "Editorial Weight." 
- **Information Hierarchy:**
    - **Headlines:** Use `headline-sm` for section titles to command attention without shouting.
    - **Labels:** Use `label-md` in `on_surface_variant` (#464555) for metadata. This provides a clear contrast between "Data" and "Description."
- **Intentional Asymmetry:** Don't feel forced to center-align everything. Use left-aligned, oversized typography for headers to create a "magazine" layout feel that breaks the monotony of data tables.

---

## 4. Elevation & Depth
In this system, depth is a tool for focus, not just decoration.

### The Layering Principle
Achieve lift through color, not just shadow. A `surface_container_lowest` card placed on a `surface` background provides enough "Visual Lift" for 90% of use cases.

### Ambient Shadows
When a component must float (e.g., a dropdown or a high-priority modal), use **Ambient Shadows**:
- **Color:** A 6% opacity tint of `on_surface`.
- **Blur:** Large (24px - 40px) to mimic natural light dispersion. 
- **Instruction:** Never use "Drop Shadows" that are harsh or dark grey.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in a high-density table), use a **Ghost Border**:
- Token: `outline_variant` (#c7c4d8)
- **Opacity:** 15% maximum. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `md` (0.75rem) rounded corners. White text.
- **Secondary:** `surface_container_high` background with `on_secondary_container` text. No border.
- **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions.

### Dashboard Stats (High Density)
- **Container:** `surface_container_lowest` with `md` rounded corners.
- **Layout:** Use `headline-lg` for the primary figure. Place a `label-md` trend indicator (using `error` or `primary` depending on context) in the top right corner.
- **Visual Soul:** Add a micro-gradient sparkline in the background using `surface_tint` at 5% opacity.

### Input Fields
- **Default State:** `surface_container_highest` background, no border, `sm` rounded corners.
- **Focus State:** 1px `primary` ghost border (20% opacity) and a soft `primary` ambient shadow.
- **Labeling:** Use `label-md` placed 8px above the input, never inside as a placeholder.

### Cards & Lists
- **The "No-Divider" Rule:** Forbid the use of horizontal lines. Separate list items using 12px of vertical white space and a very subtle hover state change to `surface_container_low`.
- **Card Radius:** Always use `lg` (1rem) for main dashboard cards to maintain the "Soft Minimalism" aesthetic.

---

## 6. Do's and Don'ts

### Do:
- **Use Generous Whitespace:** If you think there is enough padding, add 8px more. The system relies on "Breathing Room" to stay readable.
- **Embrace Tonal Shifts:** Use the `surface_container` tiers to guide the user through the information hierarchy.
- **Check Contrast:** Ensure `on_surface` text against `surface` containers meets WCAG AA standards.

### Don't:
- **Don't use 100% Black:** Use `on_surface` (#191c1e) for text to keep the interface feeling premium and soft.
- **Don't use Earthy Tones:** Strictly avoid browns or tans. Stick to the cool-blue/grey spectrum.
- **Don't use Hard Borders:** If you feel the need to draw a line, try using a background color change or a Ghost Border instead.
- **Don't Over-Shadow:** Shadows are for floating elements only. If it’s sitting on the page, use tonal layering.