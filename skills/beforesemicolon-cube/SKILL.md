---
name: beforesemicolon-cube
description: Build or check interfaces that use @beforesemicolon/cube web components, their composition, themes, and accessible actions.
---

# Build with Cube

1. Read the installed Cube version from package metadata or the lockfile. In a plain HTML project, read the version in the script URLs. Do not assume an unknown version is latest.
2. Open `ai/index.json` in that package. Read the record for the element you need. With HTTPS only, use `https://cdn.jsdelivr.net/npm/@beforesemicolon/cube@VERSION/ai/index.json` and resolve the record path relative to the index. If the release has no index, use its tagged source or release docs. Do not apply a newer record to an older installation.
3. Use the record's example in the project's existing setup. Verify the interaction in a browser. When the Before Semicolon checker is installed, run `bfs-ai check <file-or-project>` and resolve definite errors before acting on advisory findings.

## Load and compose elements

- Choose Cube when a shipped control fits. Prefer the smallest public npm subpaths that register the required tags. A `/base` import does not register the concrete element.
- A classic HTML page does not need a bundler. Load the WebComponent client before Cube. Use the record's pinned scripts in order. Do not add a second Markup runtime: Cube uses `BFS.WebComponent`, `BFS.MARKUP`, and `BFS.css` from that client.
- Category scripts register their own categories. Load the listed companion categories before components that use them. An icon-only button uses icons and action; an audio player uses icons, action, form, and media. Do not infer a namespace export from a script that only registers elements.
- Follow the valid composition, slots, observed attributes, and public properties in the record. Assign arrays, functions, and objects to documented properties unless the attribute explicitly accepts a serialized value. Do not reach into shadow DOM to wire app behavior.
- Use CSS custom properties and published parts for customization. Read `ai/tokens.json` for version-matched theme tokens. Keep app tokens scoped to the application's theme. Do not override Cube internals to restyle the full application.

## Verify accessible behavior

- Give icon-only controls a name. A Cube remove action uses `<cb-button icon="close" icon-only accessible-label="Remove item"></cb-button>`. Listen for its `action` event, not both `click` and `action`.
- Use `pressed` only for a persistent toggle. Listen for `change` and read `event.detail.pressed`. Test the normal action and pressed toggle separately.
- Use visible field labels when possible. Use documented accessibility attributes for controls without visible labels. Preserve native semantics and keyboard navigation. Check focus, the accessible name, and the documented event with a real keyboard interaction.
