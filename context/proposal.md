# Reforma Digital: what already exists

github.com/samuelcorsan/reforma-digital

Open project by Samuel Corsán and Leo. Code under MIT, data under CC BY 4.0. Very active (daily commits).

## El Congreso (reforma-digital.es/congreso)

- Every Plenary vote with each deputy's vote
- Bills from when they are filed until they are published, with filters
- Summarized plenary sessions and analyzed interventions (over 1,500)
- "Quién te representa": a profile per deputy
- 21 fixed topics (housing, health, pensions…) assigned by keywords, without AI

## Elecciones 29N (reforma-digital.es/elecciones)

- Electoral calendar, what expires (304 bills), the legislature in figures
- Polls, seat projections, markets and how accurate they were
- History since 1977, municipality-by-municipality map, seat distribution by province

## Reusable data

- Public read-only API with CORS: /api/congreso/votaciones, /preguntas, /sesiones, /datasets, and full download at /api/congreso/descarga
- Python collector based on Escaño Abierto (Jorge Garcelán), with official sources from the Congreso and the BOE

## Done but not published on the website

- promesas.py: cross-references the 2023 manifestos of 10 parties with how each candidacy voted afterwards. It does not measure whether a promise was kept, only what the party voted on what it promised.

## What it does not have

- An affinity test of the kind "which party votes as you think". That is our gap: we can build it on top of their API without redoing the ingestion.

# Proposal: what we contribute on top of Reforma Digital

## Approach

Reforma Digital is organized by institution (sessions, deputies, votes). We start from the voter's question: "what did each party do about what I care about?". Elections only, advisory only: we never say whom to vote for.

We reuse their public API: each vote already carries the vote of each group, so there is no need to build ingestion.

## Three levels, from simple to detailed

1. Overview: a card per topic with 3-5 key votes in plain language and a color dot per party (in favor / against / abstention).
2. Topic: all its votes, filterable, with what each group said in the debate.
3. Source: the official vote on congreso.es and the Reforma Digital profile with each deputy's vote.

Every data point links to the next level: clean front page, free investigation.

## Pieces

- Positions by topic: grid of parties x topics (housing, health, pensions, immigration…). This is the central piece.
- Comparator: you pick 2-3 parties and see where they voted the same and where they differed.
- Promises vs votes: the 2023 manifesto against what each party voted afterwards (Reforma Digital computes this but does not publish it; we need to confirm whether the data is downloadable).
- Your province: candidates (lists in the BOE on 28 Oct), who is running again and how they voted.
- Personal consultation: the user marks their position on key votes and sees matches with each party, topic by topic.
- Extra if time allows: 2026 manifestos by topic with literal quotes, once they are published.

## Rules to keep it advisory

- No winner, no podium, no "your party is…".
- Parties in alphabetical or random order, never ranked by result.
- The user chooses which topics matter to them and how much they weigh.
- Every match has a linked "see why" pointing to the vote.
- Honest notices: parties with no voting record (e.g. SALF), procedural votes, abstention shown as abstention.
- Public method; everything is computed in the browser and no answers are stored.

## Open decision

In the personal consultation, should we show only matches per topic ("on housing you match 4 of 5 with X") or also an overall % per party? Proposal: per topic only, as it is the least likely to push towards a vote.

# Architecture recommendation

## Stack

- Next.js in a monorepo (pnpm + Turborepo), Postgres and a Python collector. Same stack as Reforma Digital: what we build could end up inside their project as one more module, and their community already knows it.

## Data: static site, no backend

- A daily GitHub Action downloads what we need from their API and stores it as versioned JSON in the repo. The website never calls their API while someone is using it: it is faster, does not depend on their service being up, and does not add traffic to them.
- The key votes of each topic, explained in plain language, live in YAML files inside the repo; every change is reviewed via PR. Anyone can see who chose which vote and why, which gives credibility to an advisory project.
- All pages are generated at build time (static Next.js) and deployed to Vercel or Cloudflare Pages, free at this volume.
- The comparator and the personal consultation are computed in the browser. There is no database or accounts, no answer is stored, and no cookie banner is needed.

## Clear design

- Tailwind + shadcn/ui (accessible components on top of Radix). Their repo has a DESIGN.md; if we follow it, we will look like part of the same family.
- Mobile first: each topic card must be readable in full on a phone screen.
- Votes are never indicated by color alone: icon and text ("In favor", "Against", "Abstention"), for color-blind users and screen readers. WCAG AA target.
- Neutral palette: party colors only serve to identify parties, never to highlight one.
- Charts with CSS or Observable Plot, without heavy libraries.
- Search with Pagefind, static, no server.
- A shareable image generated per topic ("Housing: how each party voted"), since that is how it will spread.
- Cookie-free analytics (Plausible) or none.

## Mandatory

- Their data is CC BY 4.0: Reforma Digital and Escaño Abierto must be cited on every page that uses it.
