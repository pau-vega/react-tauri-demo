---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [.gitignore]
autonomous: true
requirements: [QUICK-01]
must_haves:
  truths:
    - "git status --short no longer lists .claude/worktrees/ as untracked"
    - "git status --short no longer lists .idea/ as untracked"
    - "git status --short no longer lists apps/tauri-todo/src-tauri/target/ as untracked"
    - "Existing gitignore entries remain unchanged and properly organized"
  artifacts:
    - path: ".gitignore"
      provides: "Root gitignore with new ignore patterns appended in appropriate sections"
      contains: ".claude/worktrees/, .idea/, apps/tauri-todo/src-tauri/target/"
  key_links:
    - from: ".gitignore"
      to: "git status"
      via: "pattern matching on untracked paths"
      pattern: "\\.idea/|\\.claude/worktrees/|apps/tauri-todo/src-tauri/target/"
---

<objective>
Append three missing ignore patterns to the root `.gitignore` so ephemeral agent workspaces, per-user IDE config, and Rust compiler artifacts stop appearing as untracked files.

Purpose: These three paths (.claude/worktrees/, .idea/, apps/tauri-todo/src-tauri/target/) should never be committed — they are local-only artifacts. Currently surfacing as untracked noise in `git status`.

Output: Updated `.gitignore` with new entries placed in semantically appropriate sections.
</objective>

<execution_context>
@/Users/pauvelascogarrofe/Documents/base-monorepo-template/.claude/get-shit-done/workflows/execute-plan.md
@/Users/pauvelascogarrofe/Documents/base-monorepo-template/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.gitignore

<interfaces>
<!-- Current .gitignore structure (key sections relevant to this task) -->
<!-- Section boundaries are marked by `# Section Name` comments -->

Relevant existing sections in .gitignore:
- `# Stores VSCode versions used for testing VSCode extensions` → .vscode-test (line ~126)
- `# macOS` → .DS_Store (line ~141)
- `# Vercel` → .vercel (line ~144)
- `# Turbo` → .turbo (line ~147)
- `# Tauri generated files` → gen/ (line ~150-151)
- `# Playwright MCP session artifacts` → .playwright-mcp/ (line ~153-154)

Placement strategy:
- `.idea/` → new `# JetBrains IDEs` section (no existing IDE section for JetBrains; .vscode-test is a testing-only entry, not a general IDE section)
- `apps/tauri-todo/src-tauri/target/` → adjacent to existing `# Tauri generated files` section (Rust build output for Tauri app)
- `.claude/worktrees/` → new `# Claude Code agent artifacts` section (ephemeral worktrees)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Append missing ignore patterns to root .gitignore</name>
  <files>.gitignore</files>
  <action>
Use the Edit tool to append three new ignore entries to `.gitignore`, each in a semantically appropriate location:

1. **Add `.idea/` as a new JetBrains IDE section** — Insert after the existing `# Stores VSCode versions used for testing VSCode extensions` block (after line 126 `.vscode-test`) by adding a blank line then:
```
# JetBrains IDEs
.idea/
```

2. **Add `apps/tauri-todo/src-tauri/target/` to the existing Tauri section** — Modify the `# Tauri generated files` section (currently lines 150-151) to also include the Rust build output target directory. Replace:
```
# Tauri generated files
gen/
```
with:
```
# Tauri generated files
gen/
apps/tauri-todo/src-tauri/target/
```

3. **Add `.claude/worktrees/` as a new Claude Code section at the bottom** — Append after the existing `.playwright-mcp/` entry:
```

# Claude Code agent artifacts
.claude/worktrees/
```

Do NOT reorder or remove any existing entries. Do NOT add trailing blank lines beyond what is needed for section separation. Preserve the existing style (comment header per section, single blank line between sections).
  </action>
  <verify>
    <automated>cd /Users/pauvelascogarrofe/Documents/react-tauri-demo && git check-ignore -v .claude/worktrees/ .idea/ apps/tauri-todo/src-tauri/target/ 2>&1 | grep -E "\.gitignore:" | wc -l | grep -q "^[[:space:]]*3$" && git status --short | grep -E "^\?\? (\.claude/worktrees/|\.idea/|apps/tauri-todo/src-tauri/target/)" | wc -l | grep -q "^[[:space:]]*0$"</automated>
  </verify>
  <done>
- `.gitignore` contains all three new patterns in semantically correct sections
- `git check-ignore -v` confirms all three paths are matched by rules in `.gitignore`
- `git status --short` no longer lists any of the three paths as untracked (`??`)
- No existing entries removed, reordered, or modified (only the Tauri section gains one additional line)
  </done>
</task>

</tasks>

<verification>
Run after task completion:

1. `git check-ignore -v .claude/worktrees/ .idea/ apps/tauri-todo/src-tauri/target/` — all three should report matches from `.gitignore`
2. `git status --short` — none of the three paths should appear as untracked
3. `git diff .gitignore` — review diff shows ONLY additions (no deletions/reorderings of existing entries)
4. Existing sections (logs, Tauri, Playwright MCP, etc.) are untouched
</verification>

<success_criteria>
- Root `.gitignore` ignores `.claude/worktrees/`, `.idea/`, and `apps/tauri-todo/src-tauri/target/`
- `git status --short` in the repo root no longer surfaces any of the three paths
- Diff shows only additions; no existing entries modified
- Section organization (IDE files, Tauri files, Claude artifacts) is semantically consistent with existing structure
</success_criteria>

<output>
After completion, create `.planning/quick/260417-jon-add-missing-ignores-to-root-gitignore-cl/260417-jon-SUMMARY.md`
</output>
