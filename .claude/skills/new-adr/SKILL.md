---
name: new-adr
description: Use when making or proposing a technical decision that should be recorded as an ADR (architecture decision record) in docs/adr/.
---

# new-adr

1. Find the next number:
   ```bash
   ls docs/adr/ | grep -E '^[0-9]{4}-' | sort | tail -1
   ```
   Add 1 and pad to four digits (`0007`). If the number is already reserved for another task in the plan, use the reserved one for that task and the next free one otherwise.
2. Pick a short kebab-case English title: `docs/adr/NNNN-kebab-case-title.md`, e.g. `docs/adr/0007-sqlite-cache-by-coordinates.md`.
3. Write it with this structure, in English, short:
   ```markdown
   # NNNN. Title in plain words

   ## Status

   Accepted (YYYY-MM-DD)

   ## Context

   The problem and the constraints, in a few sentences.

   ## Options considered

   1. **Option A**: what it is; pros and cons.
   2. **Option B**: ...

   ## Decision

   What we chose and the main reason.

   ## Consequences

   What gets easier, what gets harder, and what must be revisited later.
   ```
4. Status:
   - `Accepted` only when Nico has already decided it (say where: plan, decision log, or his message).
   - `Proposed` when it is a recommendation or a future improvement that is documented but not implemented.
   - Never change the decision of an existing Accepted ADR on your own. To change one, write a new ADR that says `Supersedes NNNN`, and set the old one to `Superseded by MMMM` after Nico agrees.
5. Commit it in the PR of the task that applies it: `docs: add ADR NNNN <title>`.
