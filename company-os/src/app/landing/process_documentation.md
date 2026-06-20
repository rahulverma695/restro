# Process Documentation: Editorial Bento Grid Landing Page

This document logs the design system implementation, bento grid layout mapping, and technical verification process for the public marketing landing page of **Company OS** (`/landing`).

---

## 1. Blueprint Layout Mapping

The hero section was re-architected to fit the user's asymmetrical layout blueprint. On desktop, this is implemented as a **12-column Bento Grid** (`grid grid-cols-12`) that stacks into a single sequential layout on mobile:

```
+-----------------------------------------------------------------------+
|                        1. HEADER / NAVIGATION                         |
+------------------------------------+----------------------------------+
|                                    |                                  |
|        2. EDITORIAL HERO           |       3. INTERACTIVE TOUR        |
|      "Visual Power" Headline       |        "IMAGE" Simulator         |
|             (5 Cols)               |             (7 Cols)             |
|                                    |                                  |
+------------------------------------+----------------------------------+
|                                    |                 |                |
|         4. SAAS COST AUDIT         |  5. TELEMETRY   |   6. PRICING   |
|            "TEXT" Card             |  "MICRORITM"    |  "TEXT" Card   |
|             (6 Cols)               |    (3 Cols)     |    (3 Cols)    |
|                                    |                 |                |
+------------------------------------+-----------------+----------------+
```

### Component Details
1. **Header Block (12 cols):** Minimalist navigation bar with logo, live active node indicator, anchor links, and action button.
2. **Editorial Hero (5 cols):** Sunset gradient (`from-[#3B0764] via-[#9D174D] to-[#F97316]`) container displaying the Playfair Display serif headline *"Visual power. Own your software."* with monospace metadata logs and creative direction timestamps.
3. **Interactive Tour (7 cols):** Houses the desktop browser mockup with active tab indicators and direct links. It coordinates all 15 React state simulator widgets (CRM, Leaves, Ticketing, Chat, Vault, etc.).
4. **SaaS Cost Audit (6 cols):** Comparative matrix demonstrating rented seat-license overheads vs. Company OS, complete with automatic Year 1 net savings calculation.
5. **Telemetry Monitor (3 cols):** Real-time ticking operational vitals (CPU load, db query latency, active nodes), an SVG dynamic line graph plotting CPU load history, and a scrolling query log stream capturing simulator events.
6. **Pricing & Licensing (3 cols):** Details setup, source code handover rights, raw serverless database configurations, and standard action buttons.

---

## 2. Typography System & Tailwind v4 Theme

To achieve the editorial, high-fashion aesthetic seen in the reference templates, we integrated Google Fonts and mapped them to Tailwind CSS v4 directives:

### Fonts Imported (globals.css):
*   **Playfair Display (Serif):** Elegant, high-contrast serif font used for primary headlines (e.g., *"Visual power"*).
*   **Outfit (Sans-Serif):** Modern, clean body font for text blocks, form fields, and navigation.
*   **IBM Plex Mono (Monospace):** Clean technical monospace font for telemetry counters, timestamps, metadata labels, and audits.

### Theme Mappings:
```css
@theme {
  --font-serif: "Playfair Display", Georgia, serif;
  --font-sans: "Outfit", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

---

## 3. Interactive Telemetry ("MICRORITM")

The **Telemetry Monitor** operates dynamically on the client side using a state interval ticking every 2.5 seconds:
*   **Vitals Loop:** Generates bounded random values representing DB latency ($8-13\text{ ms}$), CPU load ($12-19\%$), and connected network nodes ($22-26$).
*   **Dynamic SVG Graph:** Keeps a history array of the last 10 CPU readings and renders them as a dynamic SVG `<path>` line graph.
*   **Log Feed Ticker:** Pulls randomly from a list of simulated operations (e.g., `[Sales] Qualified lead`, `[IT] Ticket resolved`, `[Vault] Credentials rotated`) and appends them to a scrolling terminal feed with live time-stamps.

---

## 4. Compilation & Verification

The page compiled successfully with:
*   Zero hydration issues (initial telemetry and logs initialized with static server-safe constants).
*   Zero TypeScript compile warnings.
*   Full static pre-rendering optimization for dynamic features subpage routes `/landing/features/[id]`.
