#!/usr/bin/env bash
# PreToolUse hook (Bash): Claude never pushes. The user pushes from their own
# terminal, only to their branch. Exit 2 blocks the command; stderr goes to Claude.
cmd=$(jq -r '.tool_input.command // ""')
if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]_])git([[:space:]]+[^[:space:]|;&]+)*[[:space:]]+push([[:space:]]|$)'; then
  echo "Bloqueado: Claude no hace push. Pídeselo al usuario; lo hace él desde su terminal, solo a su rama (git push -u origin raul)." >&2
  exit 2
fi
exit 0
