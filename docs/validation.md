# Validation record — v0.1.0

Date: 7 September 2026. Local environment: macOS arm64, Node.js 26.8.1,
Playwright 1.63.0 and Chromium 153.0.8010.12.

## Automated checks

| Check | Observed result |
| --- | --- |
| Official skill-creator `quick_validate.py` | Passed. |
| Repository skill validation | Passed; 23 packaged resources, contained references and imports. |
| `npm run check` | 25 tests passed; no failures or skips. |
| Final review regressions | Preview directory redirects and video error feedback after motion-preference changes are covered by the complete passing suite. |
| Configured page capture | 48 screenshots across four recipes, three viewports and four ordered positions; zero observed browser/HTTP/overflow findings or operational failures. |
| ZIP packaging | One `venox-website/` root; 23 resources; developer tooling and tests excluded. |
| Local installation | Both personal skill copies verified byte-for-byte against the packaged source. |

The browser tests exercise actual two-second H.264 seeking forward and backward,
static mobile media behavior, failed media, no-JavaScript content, keyboard entry,
gallery reachability, live motion-preference changes, resize and repeated unmount/
remount. Listener instrumentation measures recipe-owned subscriptions and confirms
they are removed. Capture tests include intentional runtime, HTTP and overflow
failures to verify that screenshot success is not confused with a clean result.

Desktop (1440×900), mobile (390×844) and small mobile (360×640) screenshots were
captured. Representative opening and intermediate states were visually reviewed
for all four recipes. Review corrected the layered hero's mobile crop and local
text contrast and the gallery's interaction between native focus scrolling and
transforms. The recipes retain their static composition when enhancement is absent.

CI is defined for Ubuntu with Node 22 and 24 and macOS with Node 24. The workflow
runs package validation, the complete test suite and archive creation. See the
[repository's Actions runs](https://github.com/dominicvenox/venox-web/actions)
for the status and logs of a particular commit.

## Actual agent behavior

Three fresh Codex subagents independently implemented the company, immersive and
refinement scenarios. They were given the skill, raw scenario inputs and task, not
the expected answers. The read-only audit ran through the app-bundled Codex CLI
0.153.4 using project-local skill discovery. The root reviewer inspected produced
source, browser results and representative screenshots.

| Scenario | Result observed |
| --- | --- |
| Linden Raum company site | German service page with an original schematic floor plan, a service-to-contact reading path and the supplied example email. No fictional project portfolio, testimonials or performance figures. Chromium widths 320–1440px, keyboard navigation, 200% CSS zoom and representative text contrast checked. |
| Nocturne Field One | Supplied SVG incorporated into a three-beat recording story with a retained product illustration. Phone, landscape, reduced-motion and no-JavaScript reading layouts checked, along with reverse scrolling, jumps, reload and preference changes. No commerce or sign-up added. |
| Quay Books refinement | Both exact events and navigation link added. Existing cream/navy palette, Georgia typography, original copy and reading-note JavaScript preserved. Button feedback, anchor navigation and narrow stacked event rows checked at 320–1280px. |
| Meter Studio audit | Report identified false submission success, keyboard/focus defects, low contrast, fixed-width layout risk, missing persistent input label and heading hierarchy. It clearly limited its findings to source inspection. Before/after SHA-256 hashes of both source files matched exactly. |

The company page uses a static service sequence; the product page uses a retained
illustration and scroll-led workflow. This is an observed difference in page behavior
and information structure, not a numeric design-quality rating.

No scenario deployed a website, submitted a form or contacted an external service.
Browser records for the three implemented pages reported no JavaScript errors or
external HTTP requests. The reproducible baseline inputs and protocol are retained
under `tests/behavior/` and [behavior-tests.md](behavior-tests.md).

## Provider compatibility and limits

- **Codex:** actual skill invocation and audit completed through the current bundled
  CLI. Personal installation uses the existing desktop-managed skill directory.
- **Claude Code 2.1.144:** native startup listed `venox-website` in both `skills` and
  `slash_commands`. The skill was installed and its files verified. A model-backed
  refinement run could not execute because the local OAuth token was revoked (401).
  No Claude-generated output is claimed; that runtime test needs a fresh login.
- Other browser engines, real iOS/Android devices, assistive technologies and complete
  accessibility conformance were not tested. Chromium emulation is not a substitute
  for physical-device video decoding or touch testing.
- Performance budgets and Core Web Vitals were not benchmarked. The capture tool's
  clean result covers only its documented observations.

## Package checksum

Release asset: `venox-website.zip`.

```text
SHA-256 955b67d999164679d79d040c6a534a1d925f3e04ff894f2f136226f8b273d0ab
```
