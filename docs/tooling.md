# Optional repository tools

These commands run from a repository checkout after `npm ci`. They are not installed
alongside the standalone skill, and the skill can use the host's browser tools instead.

## Validate

```sh
node scripts/validate.mjs
node scripts/validate.mjs --skill-dir /path/to/venox-website
```

Validation checks metadata, package-contained links, source imports, the license file and
unfinished scaffold markers. Symlinks and references that escape the skill folder
are rejected so that an installation cannot silently depend on the author's machine.

## Preview

```sh
node scripts/serve.mjs --port 4173
```

The server binds to loopback and serves the four recipe directories. It is a
development preview, not a production web server or a deployment workflow.

## Capture

```sh
node scripts/capture.mjs --url http://127.0.0.1:4173 --out work/captures --config docs/capture.example.json
```

`--url` accepts an explicit HTTP(S) URL. Without configuration it captures that URL's path at
five scroll fractions (0, .25, .5, .75, 1) for 1440×900, 390×844 and 360×640 viewports.
A configuration file accepts four fields:

| Field | Shape | Meaning |
| --- | --- | --- |
| `routes` | Array of path strings | Routes to visit relative to the provided URL. |
| `viewports` | Array of `{name, width, height}` | Named CSS-pixel viewport sizes. |
| `positions` | Array of `{name, progress}` | Ordered fractions from 0 to 1 of the page's scroll range. Repeat lower fractions after higher ones to inspect reverse scrolling. |
| `reducedMotion` | Boolean | Emulate the reduced-motion media preference. |

Only these declarative options are supported. The config does not execute code or
submit forms. Choose additional positions around the transitions of the particular
page; fixed fractions cannot guarantee that every intermediate state was inspected.

Each run creates a fresh `capture-*` directory under `--out`; existing runs remain.
The JSON report records screenshots separately from console errors, failed requests,
HTTP failures and page overflow observations. It also records operational errors and
the properties that this tool did not test. Review screenshot content directly.

Fonts and rendering are given a bounded settling period. Capture is a sample of the
rendered page, not a guarantee that asynchronous third-party content has finished.
Use the host's interactive browser tools to inspect loading, focus, controls and
video seeking when those behaviors matter. Do not put authenticated or sensitive
page captures into a public repository.

Exit codes: **0** completed without objective findings; **2** completed with
findings; **1** operational failure (including a partially failed run).

## Pack

```sh
node scripts/pack.mjs --out dist/venox-website.zip
```

The packer validates first and writes a ZIP with exactly one `venox-website/` root.
It contains the canonical skill resources, the MIT LICENSE.
Dependencies, browser captures, repository tooling and tests do not travel with it.
Extract into one supported skill directory; do not install the whole repository as
the skill when only the release package is needed.
