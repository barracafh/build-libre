# DESIGN.md

Visual and interaction rules for the site. [AGENTS.md](AGENTS.md), then
[docs/COMPETITION.md](docs/COMPETITION.md) (section «Diseño»), win on any conflict. Tokens live in
[src/app/globals.css](src/app/globals.css) and [src/styles/tema.css](src/styles/tema.css); this
file says what they mean and when to use them.

## Principles

1. **Calm public record, modern web app.** Pure neutral greys (no hue), Sol type, white page and
   white cards separated by borders, clear sections. No gradients, hero images, illustrations or party
   branding.
2. **Overview first, source always.** Every screen has three depths: a one-line summary, the
   per-party detail, and a link to the official vote on congreso.es. The source link is never more
   than one tap away.
3. **Same treatment for every party.** One component renders every party. No party gets a bigger
   card, a different colour weight, or a highlighted position.
4. **Meaning never by colour alone.** Every vote shows a shape and its text label; the tone is the
   third signal.

## Layout

- Design at **360 px** first, then check **1440 px**. Breakpoints: `sm` (640 px) for two-column
  grids, `lg` (1024 px) for the desktop web app (horizontal navigation, three-column grids, larger
  headings).
- **Shell** (`src/app/layout.tsx`, `src/components/site-header.tsx`):
  - Top bar in one row, 57 px tall at every width: site name on the left; on phones a «Menú»
    button opens the sections, from `lg` the sections are a single horizontal row after the name.
  - The menu is a native `<details>` (`name="site-header"`), so it opens without JavaScript. With JavaScript they also close on Escape (focus
    returns to the button), when focus leaves them, on a click outside and after navigating.
  - While the phone menu is open, a light scrim (black at 30 %) covers the page below the top bar
    and the page does not scroll (`.site-menu` in `globals.css`). The scrim is part of the menu's
    `<summary>`, so tapping it closes the menu, also without JavaScript.
  - The current section has `aria-current` (`page` on its own page, `true` on a page inside it,
    e.g. a vote under Votaciones) and is shown with a bold label on a grey fill plus a bar: a 3 px
    bottom bar on desktop, a 4 px left bar in the phone menu. Never colour alone.
  - Skip link to `#contenido` first in the tab order. The top bar is not sticky.
  - Footer: the link to *Método*, credits and the «Web en construcción» note, small muted text on
    white.
- **Container:** `max-w-6xl` (1152 px) centred, `px-4` on phones and `px-6` from `sm`; 1104 px of
  content at 1440 px. Running text keeps a readable measure inside it: paragraphs and bulleted
  lists in `main` are capped at `72ch` and the `h1` at `48rem` (zero-specificity rule in
  `globals.css`, any utility overrides it).
- **Vertical rhythm:** `mt-6` to `mt-10` between sections, `mt-2`/`mt-3` inside a section,
  `gap-3` in card grids, `py-6` (`lg:py-10`) around the page content.
- **Grids** of cards: 1 column on phones, 2 from `sm`, 3 from `lg` (home sections, topics). The
  home stat cards use the same three columns from `lg` (votes, topics, period), so they line up with
  the sections below; on phones they are two columns with the period across both.
- **Filter pages** (explorer and comparison, `src/components/filter-layout.tsx`):
  - From `lg`: the filters in a left sidebar, 288 px wide, sticky 16 px from the top and scrolling
    on its own when taller than the window; the results on the right, with a results header (the
    count in an `aria-live` region, active filters as removable chips, «Limpiar filtros»).
  - On phones the results come first: a «Filtros (N activos)» button (`aria-expanded`) opens the
    filters above them; a «Ver X votaciones» button stays at the bottom of the screen while they
    are open, closes them and moves focus to the count. Escape also closes them.
  - «Más filtros» starts closed unless the URL uses one of its filters.
  - The comparison's group pickers sit at the top of the sidebar (top of the page on phones, in two
    columns); the per-pair counts are cards side by side (3 columns from `lg`).
  - Without JavaScript the explorer shows a closed «Filtros» disclosure with the topic pages (the
    filter that works without it), then the 50 newest votes.
- **Vote page** (`src/app/votacion/[id]/page.tsx`):
  - From `lg`: the main column on the left (title, official text, sources, «Cómo votó cada grupo»,
    why each group voted, who voted differently, the deputy table) and a 26 rem (416 px) aside on
    the right, sticky 16 px from the top and scrolling on its own when taller than the window:
    metadata, the link to the official record, the tally with its bar, and the hemicycle across
    the full aside width.
  - On phones: title, metadata, official record and tally first (the tally is above the fold at
    360 × 800), then the official text, sources and the groups; the hemicycle comes after the
    groups, across the full screen width.
  - The metadata and tally block is rendered twice (`lg:hidden` under the title, `hidden lg:block`
    in the aside), so the reading and focus order match the screen at each width; only one is
    ever displayed.
- **Tu provincia** (`src/app/provincia/[slug]/page.tsx`): a compact row with the link to every
  circunscripción and the province picker; the title and intro, with a «Escaños de …» card
  (seats in 2023 and 2026 with their sources, link to the seat allocation) beside them from `lg`
  and below them on phones. Each candidacy is a section of deputy cards: 1 column on phones, 2
  from `sm`, 3 from `lg`, aligned to the top, in alphabetical order.
- **Calendar**: from `lg` the timeline on the left (7 parts) and «Cómo votar» on the right (5
  parts) as three cards: in person, by post, from abroad.
- **Seat allocation**: the index page has the picker as a compact row under the intro, then the
  explanation in a 38 rem column with the table of every circunscripción beside it from `lg`.
  A province page has its title, intro and results table in a 42.5 rem (680 px) column with the
  2023 data and electors per seat as cards beside it; the D'Hondt table below uses the full
  width, and the picker to change province is at the end of the page, after the data already
  chosen.
- No horizontal scroll down to 320 px. A wide table scrolls inside `ScrollTable`, never the page.
- **Targets:** links and controls that stand alone are at least **44 px** tall (`min-h-11`);
  the phone menu rows are 48 px. The figure labels of a deputy card, which link to *Método*, are
  24 px tall (the WCAG 2.2 AA minimum) to keep the card compact.

## Colour

Tokens are Sol's (`src/styles/tema.css`, the Build night design system): never change their values
or add colours, fonts, radii or shadows. Every value used here is a neutral grey. Ratios are WCAG 2 contrast ratios.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--background` / `--card` | `#ffffff` | Page, cards, inputs | — |
| `--foreground` | ≈ `#0a0a0a` | Body text, links, headings; focus (`ring`) | 19.8 on white, 18.2 on muted |
| `--muted` | ≈ `#f5f5f5` | Notice bar, hover fill, current item fill, active filter chips | — |
| `--text-secondary` | `#4d4d4d` | Secondary text in Sol pieces (notice, sources) | 8.5 on white, 7.8 on muted |
| `--muted-foreground` | ≈ `#737373` | Secondary text: labels, dates, footer; control boundaries (`input`) | 4.7 on white; 4.3 on muted, so no muted text on a muted fill |
| `--primary` / `--primary-foreground` | ≈ `#171717` / ≈ `#fafafa` | Pressed chip, current page number. Never a party or a vote | 17.9 |
| `--border` | ≈ `#e5e5e5` | Decorative edges of cards and dividers | decorative, not a control boundary |

Sol's own `--input` and `--ring` are below 3:1 on white, so `globals.css` points the Tailwind
`input` and `ring` colours at `--muted-foreground` and `--foreground`. Text needs ≥ 4.5:1 and
controls, focus and vote marks ≥ 3:1 against the surface they sit on. The red `brand` and the sun
(`sunset` button, one per screen) are Sol accents, never a vote or a party.

### Vote tones and marks

Two clearly different neutral tones, never a hue: the old blue was close to a party colour, the
amber close to red, and the slate greys that replaced them still had a blue cast (decision in
[docs/DECISIONS.md](docs/DECISIONS.md)). The shape and the text label carry the vote; the tone
only helps.

| Vote | Mark (`src/components/vote-mark.tsx`) | Token | Value | Contrast |
|---|---|---|---|---|
| Sí | Filled circle | `--vote-yes` (`--foreground`) | ≈ `#0a0a0a` | 19.8 on white; 4.2 against `--vote-no` |
| No | Filled square | `--vote-no` (`--muted-foreground`) | ≈ `#737373` | 4.7 on white |
| Abstención | Thick ring | `--vote-abst` (`--text-secondary`) | `#4d4d4d` | 8.5 on white. Always labelled «Abstención», never grouped with *no* |
| No vota | Small thin hollow ring (9 px, 1.5 px line) | `--vote-none` (`--muted-foreground`) | ≈ `#737373` | 4.7 on white |
| Voto dividido (group) | Half-filled circle | `--vote-abst` | | |
| Sin datos | Dashed ring | `--vote-none` | | |

- Marks are CSS boxes (`.vote-mark-*`, or `voteCell` for a table cell), always next to their
  label, and keep their shape in Windows high-contrast mode (`forced-color-adjust: none`).
- The hemicycle uses the same shapes. Sí, No and Abstención seats are the same size (8.4 units of
  the 540-unit plan: about 6.5 px across the 416 px aside on desktop, 5.6 px across the full 360 px
  screen); No vota is a hollow ring of 7 units. In greyscale the four positions differ by shape
  (circle, square, thick ring, thin ring) and by lightness (relative luminance 0.003, 0.171, 0.074
  ring, 0.171 thin ring). On phones a legend follows the plan; from `lg` the tally right above it
  in the aside is the legend.

### Party colours

Visualizations use party colours (`color` in `src/config/partidos.json`), an exception to the
competition's rule against adding colours (see [docs/DECISIONS.md](docs/DECISIONS.md)).

- Colour identifies the party (a row, a series, a swatch), never the vote: votes keep their neutral
  marks and labels above.
- The party name is always visible next to its colour; the colour alone never tells parties apart.
- Every mark filled with a party colour has a 1 px `--foreground` edge, for all parties alike. Four
  colours are below the 3:1 graphics contrast on white (ERC 2.21, EH Bildu 2.74, Junts 2.93,
  VOX 2.95); the edge gives the contrast without changing the colours.

## Typography

- Sol fonts: Geist (`font-sans`) for everything, including buttons, menus and list titles;
  the serif (`font-heading`, Georgia, normal weight) only in `h1`, `h2` and big figures; Geist Mono
  (`font-mono`) for data, URLs and short labels. `next/font` serves Geist from the site. Reading text from 16 px
  (`text-base/normal`); `text-sm` (14 px) only for data, labels, dates and notes, never for running
  text. An `h2` used as a list title
  adds `font-sans`.
- Type scale, utilities in `globals.css`; one `h1` per page:

| Utility | Phone | From `lg` | Use |
|---|---|---|---|
| `text-h1` | 28 px, serif | 36 px | Page title, balanced wrapping |
| `text-title` | 22 px, serif | 28 px | A vote's title as its `h1`: titles reach ~800 characters |
| `text-h2` | 20 px, serif | 24 px | Section title |
| `text-h3` | 17 px, semibold | 17 px | Sub-section, calendar entry, section titles in the vote aside |
| `text-figure` | 32 px, serif, tabular | 40 px | Big figure in a stat card |
| `.calendar-date` | 20 px, bold, tabular | 24 px | The date of a calendar entry, its most prominent text |

- Counts use `tabular-nums`. Numbers and dates via `Intl.NumberFormat` / `Intl.DateTimeFormat`
  with the page locale (`src/lib/i18n.ts`). Numbers in table columns use `formatTableNumber`, which
  also groups four-digit numbers (`1.234`), so the digits of a column line up.
- **Titles are never cut by our code**, and never end in «…». About half of the titles arrive
  shortened upstream with «…»; for those we show the first paragraph of the official text
  (`texto`) followed by the vote's note, e.g. «(enmienda 9)» or «(punto 2)», which tells apart the
  votes on the same initiative (`fullTitle` in `src/lib/titles.ts`). A vote's `h1` wraps in full. In
  lists (topics, explorer, comparison, *Tu provincia*) the link text is the full title, clamped to
  three lines (`line-clamp-3`) on screen; the keyword search reads the full title.

## Components

Use the Sol components in `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Textarea`)
with their variants wherever one fits; hand-built pieces below only where none does, in plain HTML
and Tailwind. No icon library: the few icons (chevron, menu bars, «×» of a filter chip, vote marks) are CSS shapes.

- **Card** (`Card`, `src/components/ui/card.tsx`, with composition classes only): stat cards,
  calendar entries, deputy cards, seat and province boxes. Boxes that hold controls or a scrolling
  table are hand-built (`rounded-lg border bg-card`).
- **Card link** (`src/components/card-link.tsx`, `.card-link`): a whole card that is one link. Title
  in semibold, optional muted description, chevron on the right; no underline; edge turns
  `--input` on hover, with no shadow (shadows only on what floats). Home sections and topics.
- **Stat card**: a `Card` inside a `<dl>`, label (`dt`, small muted) above the figure (`dd`,
  `text-figure`). Never a link. Home page: votes, topics and period.
- **Tally** (`src/components/tally.tsx`, `.tally`): *Sí · No · Abstención · No vota* in that fixed
  order, each with its mark, label and count; an item never wraps inside, the list wraps between
  items. Used wherever the four counts appear (vote page, topic lists, explorer, the hemicycle
  legend). The vote page adds a thin proportional bar (`bar`), decoration only: solid dark, solid
  mid, hatched with an edge, and hollow with an edge, in the same order, so they differ in
  greyscale. Every non-zero count keeps at least 4 px, 2 px apart, each part with its own 2 px
  corners (the bar is not clipped to a pill), so a count of 1 reads as a small block, not a stray
  sliver. A zero count has no part.
- **Metadata list** (`.meta-list`): a `<dl>` in two columns, labels muted and at most 45 % wide so
  a long label wraps (vote metadata, 2023 facts of a circunscripción, seats of a province). Every
  label/value list uses it.
- **Deputy card** (*Tu provincia*, `src/components/province-deputy.tsx`): a `Card` with the name,
  «Alta: … · Baja: …» on one `text-sm` muted line (medium dates), the parliamentary group only
  when it differs from the one under the candidacy heading (which is itself left out when it
  repeats the candidacy's name), then the two figures side by side above a divider: «Participación
  · Votó en X de Y» and «Votó distinto a su grupo · N», each label a link to its section of
  *Método*. A deputy who was in the Grupo Mixto the whole time gets «No se aplica» and a one-line
  reason in the same place; one who was there for part of it gets the count and how many votes
  were left out. «Ver las N votaciones» is always the last line of the card when N > 0.
- **Group rows on a vote page** («Cómo votó cada grupo», `src/components/vote-groups.tsx`): one row
  per group in alphabetical order, name | position (mark and text) | how its deputies voted. A
  group whose deputies all cast the same vote shows «N diputados»; a group that split shows each
  count, mark plus «Sí 6» as one link with one continuous underline. From `sm` the three cells
  line up as columns (position 10 rem); on phones a split group's counts take a second line. The
  Grupo Mixto gets the same row: its position carries a «*» that points to a note under the list
  (the most voted option within the group, not a common position), and the vote of each of its
  deputies is in a disclosure on the row.
- **Tables** (`src/components/scroll-table.tsx`): the title above the box, a muted note that explains
  the short headers («%», «≥ 3 %», «2023», «Censo»), and a `<caption>` with both for screen
  readers; each short header has its full name for screen readers. Every number is
  `tabular-nums` and grouped. Tables fit the column at 360 px: the results table hides «≥ 3 %»
  and the table of every circunscripción hides «Censo» below `sm`. The D'Hondt table is the one
  meant to scroll: its candidacy column is sticky, and a line under the title says there are more
  columns when the table is wider than the screen.
- **Province picker** (`src/components/province-select.tsx`): label, select and button in one compact
  row; only with JavaScript (without it, the pages link every province).
- **Calendar timeline**: a 2 px line with a dot level with each date. Once JavaScript knows
  today's date in Spain, an entry whose last day has passed shows a «Ya pasó» tag and is dimmed
  (muted text, lighter date, hollow dot); the build date is not today, so without JavaScript no
  entry is marked.
- **Links**: underlined inside text (`underline-offset-2`, thicker on hover). Card, navigation and
  list-row links have no underline but show they are links by their edge, chevron or hover fill.
  Standalone links (back links, «Ver este tema en el explorador…») must be at least 44 px tall;
  the shell, home, topics, topic lists, vote, province, calendar and seat pages follow it.
- **Controls**: inputs, selects, buttons and chips have a `--input` border on `--card`; a pressed
  chip is `--primary` with white text and `aria-pressed`.
- **Filter counts**: next to each filter value, how many votes it would give with the other active
  filters (explorer and comparison alike). A value that would give none is dimmed (dashed lighter
  edge, muted text, no fill), `aria-disabled` and cannot be selected; one that is already selected
  stays pressed and can always be removed.
- **Active filter chips**: `--muted` fill, «Name: value» and a CSS «×»; the accessible name starts
  with «Quitar filtro:». Removing one moves focus to the results count.
- **Comparison list**: on phones each vote lists «Group: position»; from `lg` the positions line up
  in one column per group (8.5 rem each) under a visual header, and each cell keeps the group's
  name for screen readers.
- **Party vote row** (planned): party name, swatch, then one segment per vote option in the fixed
  order *sí · no · abstención · no vota*, each with mark, count and label, and a link to the source.
- **Party order**: alphabetical by the party's short name, or random per page load. Never sorted by
  a result.
- **Empty and error states**: say what is missing in plain words and link to *Método*. No blank
  areas, no spinners (the site is static).

## Interaction and accessibility

- WCAG 2.2 AA. Semantic HTML first (`nav`, `main`, `section` + `aria-labelledby`, `dl`, `table`).
- Visible focus everywhere: `outline-2 outline-offset-2 outline-ring` from `globals.css`. Never
  remove it.
- Skip link to `#contenido` on every page.
- Current item marked with `aria-current`, not colour only.
- Menus work with the keyboard and without JavaScript (native `<details>`).
- Respect `prefers-reduced-motion`; motion is optional and never carries meaning (the only
  transition is the card edge on hover).
- Every UI string from `src/dictionaries/es.json`, including short labels like the language code.
  No fixed widths on text, allow wrapping, so longer strings fit if other languages come back. The
  desktop navigation fits in one row at 1024 px.

## Not now

- Dark mode: the competition rules it out.
- Charts library. Plain HTML/CSS bars first.
- Web fonts, illustrations, logos.
- A sticky top bar (anchored sections would need scroll padding; revisit with the page layouts).
