# Review, audit, and polish

Use this to inspect a website or finish implemented work. An `audit` produces findings without changing website source. `polish` may fix issues within the agreed scope. Neither is permission for an unrequested redesign.

## Establish the target and evidence

Resolve the actual route, page, component, or flow. Confirm which source and preview represent it. Read the brief and relevant surrounding patterns so intentional choices are not reported as defects.

Use available browser tools for the rendered experience. A source read can reveal likely problems but cannot prove how a page lays out or behaves. If the app cannot run, inspect available screenshots with their provenance and describe the verification limit.

Optional repository capture tools can collect screenshots and browser observations from a development checkout. They are not dependencies of the installed skill. Consult the checkout's documented interface rather than assuming script names or flags exist in every installed copy.

## Separate three kinds of finding

| Kind | Evidence | Example |
|---|---|---|
| Objective defect | Reproducible behavior or measurement | A focused link is clipped outside the horizontal gallery |
| Visual or UX critique | Observed consequence with a reason | Equal emphasis makes the primary action difficult to identify |
| Unverified concern | A concrete risk that could not be exercised | Submission recovery could not be tested without the unavailable service |

Do not convert taste into a numerical quality score. Do not describe a screenshot, detector result, or automated accessibility scan as proof of full accessibility, performance, or browser compatibility.

## Inspect a representative path

Start with the page's primary task. Follow arrival, navigation, interaction, feedback, and the next destination. Check at least a representative narrow mobile width and desktop width, adding intermediate sizes where layouts change. Respect the project's actual supported devices.

For an interactive feature, exercise the relevant loading, empty, error, success, disabled, or long-content states. Avoid making a general checklist grow the product scope; inspect states the implementation can actually encounter.

Check keyboard navigation and visible focus through the main path. Inspect headings, labels, accessible names, and meaningful image descriptions. Use actual contrast measurements for questionable combinations, including text over changing media.

Inspect horizontal overflow and clipping at rest and while focused. A transformed element outside the viewport is not automatically a defect; determine whether intended content or a reachable control is lost.

Use the project's existing build, type, and behavior checks where relevant. Treat console messages and failed requests as observations to investigate: establish whether they affect this task, predate it, or are unrelated environmental noise.

## Verify scroll work as an interaction

Inspect more than attractive keyframes:

1. The opening state before and after optional media loads.
2. Entry and exit of each pinned or transformed region.
3. A resting position between each important pair of beats.
4. Reverse scrolling and a quick jump across the scene.
5. Resize, route re-entry or remount, and restored scroll position.
6. Narrow-screen behavior and reduced-motion mode.

Check that text remains readable, media does not cover controls, no empty edges appear, and focus can reach content throughout. A reversed or interrupted transition should settle into the state implied by the current input.

For video scrub, check metadata readiness, seeking response, poster behavior, failed media, and the mobile/reduced-motion fallback. For a layered hero, inspect maximum travel and crop. For a gallery, reach the final item with keyboard and touch as applicable.

## Review the design on its own terms

Evaluate whether the first viewport explains the place, the hierarchy supports the main outcome, and the imagery contributes relevant information or atmosphere. Check whether section changes follow content roles or merely repeat a template.

Inspect the ordinary parts too: a dense paragraph, long title, form, footer, and narrow layout. A strong hero cannot compensate for unreadable supporting content or a broken next step.

Compare the result with the established direction and factual material. Distinguish inconsistent execution from an intentional style. Recommend a different concept only when the brief or observed user path warrants that larger change.

## Fix and confirm efficiently

Prioritize blocked tasks and inaccessible content, then misleading or missing states, then layout/system inconsistencies, then decorative details. Fix the narrowest cause that resolves the problem; a shared token or component is appropriate only when it owns the inconsistency.

Batch related discoveries into one correction pass. Confirm the affected viewports and interaction paths after changes. Repeat when a real defect remains or a new change creates uncertainty, rather than running an arbitrary endless polish cycle.

Keep review evidence out of public assets. In a source change, inspect the final diff for unrelated edits and leftover demonstration content. In a read-only audit, preserve the website and offer prioritized recommendations without implementing them silently.

## Report what the evidence supports

For each important issue, give a location, reproduction or observation, user impact, and a concrete next step. Use a small severity vocabulary such as blocking, major, and minor; do not overwhelm the user with subjective tiny adjustments.

Finish with the result, the main routes/viewports/behaviors inspected, and specific remaining limitations. State “not tested” when appropriate. Mention useful existing behavior when it helps the user preserve it, and avoid claiming coverage beyond the actual checks.
