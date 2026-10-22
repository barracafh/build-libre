@../AGENTS.md

## Models (Claude Code)

The main session runs on Fable: it plans, splits the work, delegates and reviews. It makes trivial
fixes itself (a line, a typo); everything else goes to the subagent for that tier.

| Task | Subagent | Model |
|---|---|---|
| Write, edit, refactor or debug code; anything that changes `src/` or `scripts/` | `programador` | Opus |
| Minor work: docs, copy, decision entries, commit messages, running checks and reporting | `asistente` | Sonnet |
| Find code, files or data fields; answer "where is…" questions | `Explore` | Haiku |

- Delegate by name with the Agent tool. If you pass `model` on the call, it must match the table.
- Brief each subagent with the goal, the files involved and the rules that apply (neutrality,
  sources); it does not see this conversation.
- The definitions live in `.claude/agents/`. Change the table and the file together.

## Parallel work

Work is not linear. Before starting a task, split it into independent pieces and launch them at
once, in a single message, each on its tier's subagent.

- Two coders in parallel only on disjoint files: one page and its data loader can go together,
  two edits to the same file cannot. Split by file, not by step.
- Searches and checks always run in parallel with each other and with the coding they do not
  block (`Explore` for lookups, `asistente` for lint/typecheck/test/build and docs).
- The main session waits for the results, integrates them and runs `bun run build` once at the end.
- Do not delegate what takes one or two tool calls.
