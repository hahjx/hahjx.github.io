<!-- 这个是一个注释，避免md文档被vitepress当成页面处理 -->

---

name: blank-skill
description: TODO: Explain when Codex should use this skill. Include task type, trigger words, expected inputs, and boundaries. Keep this description clear because Codex uses it to decide whether to load the skill.

---

# Blank Skill

> This is a learning template. Replace TODO sections when creating a real skill.
> Keep `SKILL.md` concise. Move long examples, schemas, or reference material into `references/`.

## Purpose

TODO: Write one or two sentences explaining the goal of this skill.

Example:

- Help Codex follow a repeatable workflow for a specific task type.

## Scope

TODO: List what this skill is responsible for.

Example:

- Parse user inputs for this task type.
- Follow a fixed investigation or execution workflow.
- Return a predictable result format.

## Out Of Scope

TODO: List what this skill must not do.

Example:

- Do not modify files unless the user explicitly asks.
- Do not deploy, publish, or perform destructive operations.
- Do not invent missing business rules.

## Inputs

TODO: Describe what information the user may provide.

Example:

- Route, file path, UI text, API name, field name, screenshot, error message, or target behavior.

## Workflow

TODO: Write the main steps Codex should follow.

1. Parse the user's request and identify key anchors.
2. Read only the files or references needed for the task.
3. Perform the task-specific analysis or action.
4. Validate the result when validation is possible.
5. Report the outcome clearly.

## References

Use `references/` for detailed material that should be loaded only when needed.

Example:

- Read `references/README.md` to understand what kind of reference files belong there.
- Add domain-specific reference files only when the skill needs them.

## Scripts

Use `scripts/` for deterministic helper commands.

Example:

- Add scripts when a repeated operation should not be rewritten each time.
- Keep script usage documented in this section.

## Assets

Use `assets/` for templates or files that the skill may copy or adapt into outputs.

Example:

- UI templates, document templates, sample files, images, or starter code.

## Output

TODO: Describe what Codex should return.

Example:

```text
Result:
- ...

Evidence:
- ...

Validation:
- ...

Risks:
- ...
```

## Guardrails

TODO: Add safety and quality constraints.

Example:

- Prefer exact user-provided anchors before broad search.
- Ask a concise question only when the missing information blocks progress.
- Keep edits scoped to the requested task.
- Report validation failures instead of hiding them.
