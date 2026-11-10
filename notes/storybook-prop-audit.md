# Storybook prop behavior audit

Status: in progress. This is not a claim that all props work.

Scope: every public component in `scripts/component-entries.ts`, including own,
family and global props exposed in Storybook. A prop must be exercised in the
state where it applies (keyboard, validation, form submission, open overlay,
variant-specific content, media playback, etc.). Presence in Controls or a DOM
mutation alone does not prove the intended behavior.

## Verified on 2026-10-20

- Real Storybook manager controls: Skeleton text/card `lines`; table `rows` and
  `columns`; switching all three variants. Regression:
  `tests/browser/storybook-controls.spec.ts`. Rows/columns now appear only for
  table; lines only for text/card. Changing rows to 4 and columns to 2/5 produces
  8/20 cells, not just updated args.
- Shared field `errorText`: text-input, textarea, number-input, unit-input,
  stepper, range-slider, checkbox and switch. Adding/removing custom error text
  updates native validity, accessible description, `aria-invalid` and invalid
  styling. Fixed stale `source.error` reads in the shared renderer. Regression:
  `tests/browser/prop-behavior.spec.ts`.
- Number-input, unit-input, stepper, range-slider: live `value`, `min`, `max`,
  `step`, `required`, `readOnly`, `disabled` and `name`. Tests inspect native
  constraints, actual editing restrictions, range Home/End behavior and actual
  FormData inclusion/omission. Number-field cases also exercise each validity
  failure and recovery after changing bounds/step/required.
- Catalog triage: 1,723 exposed prop entries matched their runtime default's
  control type (with select/union/null contextual values excluded from this
  primitive-type check). This is configuration evidence only, not behavior
  coverage. The existing catalog test separately verifies missing controls and
  initialized args.

## Remaining completion gates

Current regression baseline after these fixes: 229 browser tests and 56 unit
tests pass; component typecheck and `git diff --check` pass. The full browser
suite uses the running local Storybook dev server. This baseline does not
establish complete per-prop coverage.

- Audit remaining own/family props and contextual combinations across the full
  catalog. No category is certified complete by the checks above.
- Map existing browser tests to specific props before counting them as covered.
- Add direct Storybook-manager regressions for discovered arg/control wiring
  problems; test component behavior separately when needed.
- Fix confirmed ineffective props and misleading contextual controls; do not
  hide a genuinely broken API behind conditional Controls or logging filters.
- Re-run package and Storybook builds plus the full browser suite after changes.
- Final completion requires per-prop evidence, not merely a green existing suite.

Next batch: remaining text/choice/token and composite form props, followed by
layout/navigation, overlays, data display/collaboration, styling/editor, media,
charts, and remaining feedback props. Global props must be classified by their
meaning for each consumer rather than assumed applicable everywhere.
