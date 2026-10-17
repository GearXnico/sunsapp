# 0016. User interface renewal

## Status

Accepted (2026-10-17)

Nico approved the R5 wireframe; the build follows it and removes Bootstrap in favor of own CSS with design tokens (light and dark through `prefers-color-scheme`), with no new dependencies.

## Context

The screen still has the layout of the first version (May 2025): Bootstrap, a background image and a form that moves up when results appear. It works, but it looks dated and does not leave room for the proposed additions (ADR 0011 matched place, ADR 0013 chart bands, ADR 0014 language toggle, ADR 0015 CSV export).

## Options considered

1. **Wireframe first, then build:** a low-fidelity wireframe of the whole screen (desktop and mobile) that Nico validates before any code; then a new layout on the existing components.
2. **Restyle the current layout:** faster, but the additions would still be squeezed in later.
3. **Adopt a component library or design system:** more consistency, but a large dependency for one screen.

## Decision

Option 1. The renewal starts with a wireframe that Nico validates; nothing is built before that approval. The build keeps the current components and contract and decides then whether Bootstrap stays.

## Consequences

- One more review step, but no rework on a design Nico did not want.
- The wireframe groups the pending UI ADRs so they land in one coherent screen.
- Accessibility (labels, contrast, keyboard use) is part of the wireframe review, not an afterthought.
