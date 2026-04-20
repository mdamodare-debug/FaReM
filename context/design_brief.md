## DESIGN BRIEF

```
DESIGN_BRIEF_START
THEME: warm-light

PERSONALITY: grounded purposeful

FONTS:
  Heading: Sora SemiBold (600)
  Body:    DM Sans Regular (400)
  Accent:  JetBrains Mono Regular (for GPS coords, crop stage codes, IDs)

COLORS (CSS variables — all hex values):
  --color-bg:          #F7F4EE   ← warm off-white, evokes sunlit paper
  --color-surface:     #FFFFFF   ← clean card surfaces
  --color-border:      #DDD8CE   ← warm stone dividers
  --color-text:        #1E1C18   ← near-black with warmth
  --color-text-muted:  #6B6658   ← earthy secondary text
  --color-primary:     #2B7A3B   ← deep agricultural green (brand anchor)
  --color-accent:      #D4620A   ← burnt orange — high contrast CTAs, alerts, overdue badges
  --color-success:     #2A7A48   ← forest green confirmations
  --color-warning:     #B87D0C   ← harvest amber
  --color-danger:      #C0341D   ← terracotta red

BACKGROUND:  Warm off-white base (#F7F4EE) with a subtle 40px diagonal fine-grain hatching in #EDE9E0 at 6% opacity — evokes the texture of field notebook paper without being decorative
MOTION:      Page load: cards stagger in with 60ms delay increments at translateY(8px) → 0 + opacity 0 → 1 over 200ms; key interactions: visit-log submit button compresses to scale(0.96) on tap with 80ms spring return, overdue badge pulses once on first load
LAYOUT:      High information density with generous vertical rhythm; farmer cards use a compact list-row pattern (56px tall) on mobile, expanding to detail panels on tap; tables preferred over cards for manager dashboards; minimum 48×48dp tap targets enforced throughout
AVOID:       Generic SaaS green (#22c55e Tailwind green-500 — too bright, no agricultural weight); loading spinner on every action (use optimistic UI instead — this is a field tool, not a web store); hero illustrations of smiling farmers (patronising and irrelevant to a professional operations tool)
REFERENCE:   Linear.app's information density and interaction precision, mapped onto the warmth of a well-worn field notebook — not a consumer app, not a government portal
DESIGN_BRIEF_END
```
