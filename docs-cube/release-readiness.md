# Release preparation: 0.3.0-alpha.1

Status: the complete release gate and final packaging refinements are verified
on 2026-10-20 for 0.3.0-alpha.1. This is not approval to publish, and no package
has been published or pushed.

Completed:

- Replaced embedded static styles with 84 CSS files and direct stylesheet
  imports. Local CSS imports are flattened for shadow roots, ESM/CJS and category
  clients. Source-only Vite imports are rejected in published JavaScript.
- Captured 342 Storybook views before and after extraction: 340 pixel-identical;
  the other two baseline frames were an empty Hover Card and a loading chart.
  Completed views were inspected without styling regressions.
- Upgraded direct dependencies to latest releases. TypeScript 7 no longer
  exposes its JavaScript compiler API, so source-contract tests now use Babel.
  `npm outdated` reports no outdated direct dependencies. Runtime npm audit
  reports no advisories. Typechecks and 60 unit tests pass after the upgrade.
- Removed unused legacy source, old documentation, and Jest/ESLint setup from
  the working tree. Git history retains tracked historical implementations.
- Bumped package and registration version to 0.3.0-alpha.1. Nothing published.
- Completed the unstyled List refactor and 11 behavioral regressions (three
  consecutive successful runs before stylesheet extraction).
- Added colocated, typed stylesheet/public-behavior contracts for all 99
  components. The first full production run passed 350/351 checks and exposed
  minified class names in Storybook control groups. Preserving class names fixed
  the remaining regression; its targeted rerun passed.
- Found and fixed numeric-only masked-input values/masks being parsed as numbers
  by the runtime. The regression covers programmatic values, attributes and typing.
- Built Storybook and the current 20-page documentation site in five languages.
- Restricted npm payload and tested a real archive in an isolated installed
  consumer: SSR-safe ESM/CJS entrypoints, all component declarations and category
  clients resolve. The archive contains no legacy source, tests, source maps,
  design assets or build reports.
- Verified a clean `npm ci`, release scripts, package/registration version
  consistency, external-runtime bundles, and preserved third-party notices.

- Executed `npm run verify:release` end-to-end after the clean dependency
  installation: both typecheck projects, 60 unit tests, all 351 browser checks
  against production Storybook, package/category exports, catalog, documentation
  and Storybook builds, runtime audit (zero advisories), and installed archive
  verification pass. No required local release gates remain.
- The inspected `release-artifacts/beforesemicolon-cube-0.3.0-alpha.1.tgz` contains
  1,387 allowed files: 834,700 packed bytes / 5,322,306 unpacked bytes. Redundant
  ESM/CJS browser bootstraps, their declarations, and four unused CSS text modules
  per format are omitted; all 16 flat browser bundles remain. The package
  whitelist excludes repository source, tests, design boards, build reports,
  source maps and documentation build tools. CI and prepublish hooks run the same
  verification; no GitHub check result is claimed for these unpushed changes.
- The archive verifier checks the real tar listing and checksum, installs it
  outside this repository, and compiles all public component declarations with
  full library checking enabled. Prerelease publishing defaults to public access
  under `alpha`, never `latest`. The release gate checks those defaults.
- CI invokes the single `verify:release` command, including runtime auditing.
  The obsolete source/node_modules review-snapshot upload has been removed.
- The final clean-install release run passed all 60 unit and 351 browser tests.
  Normal `npm pack` also passed its prepack lifecycle and produced the exact
  checksum verified by the isolated installed-consumer test. All 99 concrete
  component renderer folders contain a colocated spec, independently checked
  against the filesystem rather than only the component catalog.
- Stylesheet emission now tracks direct module imports. All 80 emitted CSS text
  modules are referenced; nested CSS imports remain flattened in their users.
  Regression tests cover symlinked macOS temporary paths as well as omitted
  redundant modules.

Known development-tool advisory:

- Full `npm audit` reports five moderate entries for one transitive chain:
  `@beforesemicolon/site-builder -> front-matter -> js-yaml -> argparse -> sprintf-js`
  ([GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)).
  These are documentation-build dependencies, not dependencies of the published
  runtime package. The latest site-builder still contains this chain; npm's
  suggested downgrade is not applied. Avoid processing untrusted documentation
  inputs. The release gate audits runtime dependencies separately.

The earlier per-prop audit remains separate: no statement here certifies every
contextual combination of every component prop.
