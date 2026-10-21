# AGENTS.md

This project is a consultative website for the Spanish general election of 29 November 2026. Its
goal is to let anyone check, topic by topic and down to the official source, what each party voted
in the Congreso during the XV legislature. It informs; it never tells anyone how to vote. It is
being built for a hackathon competition, the Build night (BARRACA x SOTI, 22 October 2026, track
`libre`), so it follows the organizer's rules.

Read these first:

- [docs/COMPETITION.md](docs/COMPETITION.md): the competition's mandatory rules (the `build-libre`
  template's `AGENTS.md`, verbatim). They win on any conflict.
- [SETUP.md](SETUP.md): the track's brief: challenge, expected demo and out-of-scope list. Also
  mandatory.
- [docs/DECISIONS.md](docs/DECISIONS.md): choices the team can revisit (mobile first, static
  export, stack, scope).
- [DESIGN.md](DESIGN.md): visual and interaction rules.

The project rules below apply them here.

## Repo map

```text
src/        the site: pages, components, logic, UI strings
data/       generated snapshot, never hand-edited
scripts/    data download and search index
docs/       competition rules, decisions
public/     static files
ficha.json  tool description
SETUP.md, comun/, datos/, .buildnight/   organizer material, do not edit
```

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
3. **When in doubt**, say it cannot be confirmed and link the official site. Never invent amounts,
   deadlines or requirements.
4. **Personal data.** No real personal data: no DNI, case files or passwords; simulate them.
   Nothing the citizen types is stored: no database and no logs with their text.
5. **Keys.** API keys live only on the server, never with the `NEXT_PUBLIC_` prefix, and never in
   the repository (`.env.local` locally).
6. **Every page keeps** the notice «Herramienta experimental. No es un servicio oficial.» and the
   «¿Algo está mal? Avísanos» button (`src/components/boton-aviso.tsx`).
7. **`ficha.json`** describes the tool: name, phrase, icon, sources and `datos` (`simulados`, or
   `reales` for public data). Never change `equipo`: the base path `/libre` comes from it.
8. **Base path.** `<Link>` and `router.push` add `/libre`; a raw `<a>` to an internal page, a
   `fetch` or a file from `public/` goes through `ruta()` from `src/config/sitio.ts`.
9. **Do not edit** `SETUP.md`, `docs/COMPETITION.md`, `comun/`, `datos/`, `contexto.md` or
   `.buildnight/`: organizer material. Our data lives in `data/`.
10. **Accessibility.** AA contrast, visible focus, keyboard navigation, native controls (`button`,
    `select`, `input`, `label`), `prefers-reduced-motion`, no horizontal scroll at 320 px. Never
    encode meaning with colour alone: vote positions always use the shared marks in
    `src/components/vote-mark.tsx` (shape + text) and the `--vote-*` colours in
    `src/app/globals.css`, never green for yes and red for no. Party colours only identify the
    party.
11. **Languages.** Every UI string comes from the locale dictionaries; never hard-code user-facing
    text in components. Spanish is the source; a missing translation falls back to Spanish.
12. **Design.** Visual and interaction rules live in [DESIGN.md](DESIGN.md). Tokens come from Sol,
    the visual system of Reforma Digital (`src/styles/tema.css`, origin in [AVISO.md](AVISO.md)):
    never change its values or add colours, fonts, radii or shadows; no dark mode, no new
    gradients. One `sunset` button per screen. On a conflict between this file and `DESIGN.md`,
    this file wins.
13. **Publishing.** Every push to `main` is published, and branches get no preview: to see
    something live it has to reach `main` (see "Team agreements"). Before every push to `dev` or
    `main`: `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`,
    `bun run test`, `bun run build`. If the build fails, nothing is published.
14. **Git.** Conventional Commits in English. Code and comments in English; site copy in the
    locale dictionaries. Branch flow in "Team agreements".
15. **Decisions.** Read [docs/DECISIONS.md](docs/DECISIONS.md) before proposing a change to scope,
    data or stack, and add an entry following the contract below when a new decision is taken.

## Team agreements

Flow: personal branch → `dev` → `main`.

1. **One branch per person and task**, always from an up-to-date `dev`:
   `git switch dev && git pull`, then `git switch -c <name>/<task>` (e.g. `ana/vote-table`).
   Keep branches short: merge within hours, not at the end.
2. **Merge into `dev`:** `git pull --rebase origin dev` on your branch, the rule 13 checks green,
   then merge. No PR required; tell the team chat when you merge.
3. **`dev` always builds.** If you break it, fixing it comes before anything else.
4. **`main` only receives merges from `dev`**, never direct commits, and every merge publishes.
   One person at a time, announced first, with the checks green and the demo reviewed locally.
5. **Freeze `main`** 30 minutes before the demo: only critical fixes. The team adjusts the time.
6. **Split the files:** each person owns an area (screen, route, component). Announce in the chat
   before touching shared files (`package.json`, `bun.lock`, `layout.tsx`, `ficha.json`,
   `src/components/ui/`).
7. **No `push --force`** and no history rewrites on `dev` or `main`.
8. **Small commits**, one change each, Conventional Commits (`feat:`, `fix:`, `docs:`).
9. **Secrets stay out of the repo:** keys only in `.env.local`, never in commits, screenshots or chat.
10. **Conflicts** are resolved on your branch before merging, keeping both sides' work. If unsure,
    ask whoever wrote the other change.

## Data

- Source: [Escaño Abierto](https://github.com/jorgegarcelan/escano-abierto) (code MIT, data
  CC BY 4.0), pinned to one commit in `data/source.json`. Credit it on the site, together with
  [Reforma Digital](https://github.com/samuelcorsan/reforma-digital) as reference (our data does
  not come from it).
- `data/` is generated by `scripts/fetch-data.ts` (`bun run data:fetch`) and committed. Never
  hand-edit it. The organizer's `datos/` is a different folder and is not ours to edit.
- Text generated by a language model upstream (reasons per group, session summaries, tone or
  position of interventions) is always labelled as generated, shown next to the official record,
  and never used as a filter or facet.
- Parties map: `src/config/partidos.json`, keyed by the group code of the data, gives each party
  its current name, former names (`anteriores`), swatch colour and `fuente` (official URL, or `null`
  while unchecked). Add an entry for every new party group; `bun run test` fails if one is missing.
  Names change over time, so use it for names and swatches, not the data's names. No candidates
  and no entry for the Grupo Mixto (not a party). The colour only identifies the party, as a small
  swatch next to its name (`DESIGN.md`).

## Decision records

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

- **Two lines per field at most**, wrapped at 100 characters, no sub-bullets. The entry says what
  was decided; the detail (rules, counts, layouts) lives in the code, `/metodo/` or `DESIGN.md`,
  and the entry links to it.

- **Timestamp:** `YYYY-MM-DD HH:MM ±HH:MM` in `Europe/Madrid` when the decision is taken, with the
  offset that applies on that date (`+02:00` in summer time, `+01:00` in winter; summer time ends
  on 25 October 2026). Get it with `TZ=Europe/Madrid date '+%Y-%m-%d %H:%M %:z'`; never type it
  by hand or use UTC.
- **Estado:** `vigente` or `sustituida por «<título de la nueva entrada>»`.
- **Order:** oldest first. A new entry goes at the end, just above `## Pendiente`.
- **Append-only:** never rewrite an existing entry. Any change, however small, is a new entry, and
  the old one only changes its Estado. Typos and broken links can be fixed.
- **One decision per entry.** Link details (`DESIGN.md`, code paths) instead of copying them.
- **Open questions** go under `## Pendiente` as `- <pregunta>. Propuesta: <respuesta propuesta>.`
  and become an entry once decided.

## References

- [barracafh/build-registro](https://github.com/barracafh/build-registro): information about the
  hackathon.
- [barracafh/build-libre](https://github.com/barracafh/build-libre): where the solution is
  submitted.
- [samuelcorsan/reforma-digital](https://github.com/samuelcorsan/reforma-digital): reference
  project; our data does not come from it.
- [jorgegarcelan/escano-abierto](https://github.com/jorgegarcelan/escano-abierto): source of our
  data (code MIT, data CC BY 4.0).
