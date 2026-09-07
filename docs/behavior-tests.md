# Independent behavior tests

Run these after substantive workflow changes. These are agent tasks, not string
matching tests. Use a fresh task/context for each case and a disposable directory.
Give the evaluator only the skill, the scenario's input files, and the user request.
Do not include the expected outcomes below in the evaluator's prompt.

Use `$venox-website` in Codex or `/venox-website` in Claude Code. Keep the tasks
local-only, disable external service use, and place screenshots outside website
source. The four baseline directories are in `tests/behavior/`.

## Company website

Request: “Build a local-only static German homepage for the fictional architecture
studio in brief.txt. Make it calm and precise, with a clear route from what the
studio does to email contact. Use original HTML/CSS and any simple original SVG
that is useful. Work from the supplied facts. Finish the implementation; do not
deploy or contact anyone.”

Review the artifact: does the composition support a calm service decision, do its
contact links resolve to the supplied address, and are invented projects or proof
absent? Inspect narrow screens, keyboard focus and overflow.

## Immersive product story

Request: “Build a local-only static immersive product page for Nocturne Field One
from brief.txt and product.svg. Use a short scroll-led recording story with the
supplied product illustration. Make it work on phones and for reduced motion.
Primary action is to read the workflow; no store or sign-up. Finish the HTML/CSS/JS;
do not deploy, install dependencies or contact external services.”

Review the artifact: does the recording sequence determine the motion, is the
supplied illustration used, and does the page remain usable without animation?
Inspect intermediate and reverse positions, mobile layout and preference changes.
Compare with the company result: the design should differ in structure and behavior,
not only palette and text.

## Preserve an existing brand

Request: “Refine the existing local-only Quay Books website. Add a compact events
section with Saturday Reading Circle, 19 September 2026 at 16:00, and Small Press
Evening, 26 September 2026 at 18:00. Add an Events navigation link. Keep the existing
brand, palette, type character, content and working reading-note button. Make the
addition usable on narrow screens. Implement in this directory only; do not deploy,
install dependencies or access external services.”

Compare source and browser results before/after. The existing identity and button
behavior must survive. Inspect event content, anchor navigation and stacked rows on
mobile. A new overall visual system is outside this request.

## Read-only audit

Request: “Audit this local-only Meter Studio website. Inspect index.html and
style.css and provide a prioritized report. Do not modify website source or implement
fixes. A browser is not available in this evaluation: distinguish source-supported
findings from rendered behavior that remains unverified. Do not install dependencies,
deploy or access external services. Return your report directly.”

Hash the source files before and after. Review whether the report identifies the
fake successful submission, non-keyboard control, removed focus styling, low-contrast
copy, wide fixed layout and missing persistent label. The report must identify its
source-only scope rather than claiming a browser test.

## Record evidence

Record agent/runtime, completed files, source preservation or changes, actual
browser checks, screenshots inspected and limitations. Judge behavior from the
artifacts and tool traces, not the evaluator's final assertion alone.
Initial results are recorded in [validation.md](validation.md).
