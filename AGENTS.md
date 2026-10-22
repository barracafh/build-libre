# AGENTS.md

This project is a consultative website for the Spanish general election of 29 November 2026. Its
goal is to show, for a fixed list of predefined topics, the position of each party, backed by the
facts that confirm it: the votes and sessions of the Congreso in the XV legislature, each linked to
its official source. A visitor picks a topic, sees each party's position, and opens the votes and
sessions behind it. The position is the list of the party's votes on that topic, with no summary
label; any figure is a plain count. It informs; it never tells anyone how to vote. It is being
built for a hackathon competition, the Build night (BARRACA x SOTI, 22 October 2026, track `libre`),
so it follows the organizer's rules.

On any conflict this file wins, then `docs/COMPETITION.md` and `SETUP.md`, then `DESIGN.md` and
`docs/DECISIONS.md`. Where this file departs from the organizer's rules (party colours), the
organizers still judge the entry against theirs: the risk is recorded in `docs/DECISIONS.md`.

Read these first:

- [docs/COMPETITION.md](docs/COMPETITION.md): the competition's mandatory rules (the `build-libre`
  template's `AGENTS.md`, verbatim).
- [SETUP.md](SETUP.md): the track's brief: challenge, expected demo and out-of-scope list. Also
  mandatory.
- [docs/DECISIONS.md](docs/DECISIONS.md): choices the team can revisit (mobile first, static
  export, stack, scope).
- [DESIGN.md](DESIGN.md): visual and interaction rules.
- [context/*](context/*): ignore files inside this folder.

The rules below apply them here.

Project information follows progressive disclosure: this file holds only what every contributor
must know. Specific or non-mandatory detail goes in its own file and is linked from here (as
`DESIGN.md` and `docs/DECISIONS.md` are). Do not copy it back into this file.

Code follows KISS: the simplest solution that works. No abstraction, dependency or option until a
second use needs it.

## Development

### Repo map

```text
src/        the site: pages, components, logic, UI strings
data/       generated snapshot, never hand-edited
scripts/    data download and search index
docs/       competition rules, decisions
public/     static files
ficha.json  tool description
SETUP.md, comun/, datos/, .buildnight/   organizer material, do not edit
```

### Workflow

This is a one-night hackathon project, not a production system: keep the process light.

- Each person owns a view; there are no other roles. Work on your own branch from `dev`
  (`<name>/<view>`); `git pull --rebase origin dev` before merging.
- Changes only inside your view's folders (`src/app/<view>/`, `src/components/<view>/`) and its
  line in `src/config/vistas.ts` merge into `dev` once the view is done (below). No PR needed.
- Shared code (the shell, `src/components/` outside a view folder, `src/lib/`, `data/`, `scripts/`,
  this file, `DESIGN.md`) goes through a PR into `dev` that someone else reviews. Say it in the chat.
- Anyone can take `dev` into `main` when there is something worth showing: say it in the chat
  first and run the checks below. Every push to `main` is published.
- Commit small and often, Conventional Commits in English (`feat:`, `fix:`, `docs:`). No
  `push --force` on `dev` or `main`.
- Resolve conflicts on your branch, keeping both sides' work. If unsure, ask who wrote the other
  change. Say it in the chat before touching `package.json`, `bun.lock` or `ficha.json`.
- Before every push to `main`: `bun install --frozen-lockfile`, `bun run lint` (once the script
  exists), `bun run typecheck`, `bun run test`, `bun run build`. If the build fails, nothing is
  published. If new Tailwind classes are missing from a build, delete `.next/cache` and rebuild.
- For GitHub, push over HTTPS.

### Frontend structure

One app, one shell, one route per view. Stack fixed by the contest: Next.js (App Router), React,
TypeScript, Tailwind with Sol, shadcn/ui on Base UI, Bun.

- **Shell** (`src/app/layout.tsx`): notice, top bar, footer with «Avísanos» and credits. The menu
  and the home cards come from `src/config/vistas.ts`; a new view adds one line there.
- **Views:** `src/app/<view>/` and `src/components/<view>/`. `/tema/[slug]/` is the example.
- **Shared components** in `src/components/` (kebab-case files): `vote-mark`, `scroll-table`,
  `partido`, `card-link`, `fuentes`, `boton-aviso`. A piece moves here only when a second view
  needs it.
- **Data** only through `src/lib/datos.ts`, read at build time in Server Components; client
  components get plain props. Heavy derivations go to a generated, committed file with a test
  (as `data/temas.json` from `scripts/temas.ts`).
- **Charts:** no chart library; SVG and CSS by hand, with the vote marks of `DESIGN.md`.
- **Language:** Spanish for routes, UI text, identifiers and file names of the domain; English for
  comments, tests, commits and PRs. No i18n layer.

### Definition of done for a view

1. `bun run typecheck`, `bun run test` and `bun run build` pass.
2. Checked at 360 px and 1440 px; no horizontal page scroll at 320 px (wide tables and charts
   scroll in their own box).
3. Keyboard, visible focus, 44 px targets, AA contrast, a text or table alternative for each chart.
4. The page keeps the notice, «Avísanos» and `<Fuentes />` with the page that backs each figure.
5. Neutrality rules below hold; AI text is labelled as generated.
6. Data comes from `src/lib/datos.ts`; a new function there has a test.
7. Follows `DESIGN.md`.

## Project rules

1. **Neutrality.** The tool shows verifiable facts and each person draws their own conclusions; it
   never helps anyone choose a party.
   - Nothing that guides the vote: no recommendations, no «¿a quién voto?» affinity tests, no
     summaries of manifestos or candidates, no polls, seat projections or prediction markets. The
     organization rejects proposals that break this.
   - No ranking, winner, podium or "your party is…" message anywhere. No percentage of affinity
     between a user and a party, or between parties.
   - Parties are always listed in a neutral order (alphabetical or random), never by result.
   - Same rules and wording for every party. An abstention is shown as an abstention, never as a
     vote against.
   - Figures about deputies or parties are counts only: never ordered by a figure, never
     qualified ("rebel", "loyal", "best", "worst"). An absence is never counted as dissent.
   - The Grupo Mixto is not a party: its members are never compared with the group's majority
     (see `docs/DECISIONS.md`).
2. **Sources.** Every answer cites its official source with `<Fuentes />`
   (`src/components/fuentes.tsx`), linking the page that backs it. Every figure links to its own
   source: the official vote on congreso.es, or for facts that are not votes (election dates,
   seats per province) the official source (BOE, the administration). Prefer an official source
   whenever one exists; cite a third party (Escaño Abierto, a press article) only for what no
   official source publishes, and say so.
3. **Every page keeps** the notice «Herramienta experimental. No es un servicio oficial.» and the
   «¿Algo está mal? Avísanos» button (`src/components/boton-aviso.tsx`).
4. **Decisions.** Read `docs/DECISIONS.md` before proposing a change to scope, data or stack, and
   add an entry ("Decision records") when a new decision is taken.

## Data

- Source: [Escaño Abierto](https://github.com/jorgegarcelan/escano-abierto) (code MIT, data
  CC BY 4.0), pinned to one commit in `data/source.json`. Credit it on the site, together with
  [Reforma Digital](https://github.com/samuelcorsan/reforma-digital) as reference (our data does
  not come from it).
- `data/` is generated by `scripts/fetch-data.ts` (`bun run data:fetch`) and committed. Never
  hand-edit it.
- Text generated by a language model upstream (reasons per group, session summaries, tone or
  position of interventions) is always labelled as generated, shown next to the official record,
  and never used as a filter or facet.
- Parties map: `src/config/partidos.json`, keyed by the group code of the data, gives each party
  its current name, former names (`anteriores`), swatch colour and `fuente` (official URL, or `null`
  while unchecked). Add an entry for every new party group; `bun run test` fails if one is missing.
  Names change over time, so use it for names and swatches, not the data's names. No candidates
  and no entry for the Grupo Mixto (not a party).

## Decision records

Add an entry only for a decision that changes the structure or the functionality of the repo.

- **Add:** scope (what the product does or does not do), data (source, pipeline, what is shown),
  stack and architecture (framework, folders, dependencies), and rules every contributor follows.
- **Do not add:** copy, colours, spacing or naming already covered by `DESIGN.md`, refactors, bug
  fixes, and anything a reader can recover from the code or a commit message.
- **Unsure:** put it under `## Pendiente`.

Every entry in `docs/DECISIONS.md` follows this shape, in Spanish:

```markdown
## 2026-10-21 17:00 +02:00 · <Título corto>

- **Estado:** vigente
- **Contexto:** <the problem or question behind it>
- **Decisión:** <what is done>
- **Motivo:** <why this option>
- **Alternativas:** <optional: what was rejected and why>
- **Riesgo abierto:** <optional: what is still unresolved and who decides it>
```

- **Short.** Two lines per field at most, wrapped at 100 characters, no sub-bullets. The entry says
  what was decided; the detail (rules, counts, layouts) lives in the code, `/metodo/` or
  `DESIGN.md`, and the entry links to it instead of copying it.
- **Timestamp:** `YYYY-MM-DD HH:MM ±HH:MM` in `Europe/Madrid` when the decision is taken, with the
  offset that applies on that date (`+02:00` in summer time, `+01:00` in winter; summer time ends
  on 25 October 2026). Get it with `TZ=Europe/Madrid date '+%Y-%m-%d %H:%M %:z'`; never type it
  by hand or use UTC.
- **Estado:** `vigente` or `sustituida por «<título de la nueva entrada>»`.
- **Order:** oldest first. A new entry goes at the end, just above `## Pendiente`.
- **Append-only:** never rewrite an existing entry. Any change, however small, is a new entry, and
  the old one only changes its Estado. Typos and broken links can be fixed.
- **One decision per entry.**
- **Open questions** go under `## Pendiente` as `- <pregunta>. Propuesta: <respuesta propuesta>.`
  and become an entry once decided.

## References

- [barracafh/build-registro](https://github.com/barracafh/build-registro): information about the
  hackathon.
- [barracafh/build-libre](https://github.com/barracafh/build-libre): where the solution is
  submitted.
- [jorgegarcelan/escano-abierto](https://github.com/jorgegarcelan/escano-abierto): source of our
  data (code MIT, data CC BY 4.0).
- [samuelcorsan/reforma-digital](https://github.com/samuelcorsan/reforma-digital): reference
  project; our data does not come from it.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
