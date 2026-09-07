# Motion and scroll behavior

Use motion to communicate a relationship, make a state change clear, or express a specific part of the site's identity. Choose the behavior before the library.

## Define the motion's job

State what remains stable, what changes, and why the change matters. For example: “The product stays in view while three assembly layers separate beside their explanations.” This is enough to guide implementation and review without inventing a named animation style.

Distinguish brief feedback from a visual sequence. A button confirmation should respond immediately; a narrative transition may take longer because the movement itself conveys information. Do not make a routine task wait for page-load choreography.

For a whole page, identify the primary authored moment and use supporting motion consistently. Repeating the same entrance on every section often adds delay without new meaning.

## Select the smallest suitable mechanism

| Need | Starting point |
|---|---|
| Hover, focus, selected-state feedback | CSS transitions |
| A bounded decorative or state sequence | CSS keyframes or Web Animations API |
| Start or stop work when visible | IntersectionObserver |
| Continuous relationship to document scroll | Supported native scroll animation or a small measured progress controller |
| Several coordinated pinned, scrubbed, or responsive sequences | Existing motion library; GSAP when its orchestration materially helps |

Match capabilities to supported browsers and the installed framework. Detect optional APIs and retain a useful fallback. If a library is already in use, work within its lifecycle instead of introducing a second system for the same task.

## Map scroll to content, not elapsed time

Derive a normalized scene progress from its current geometry, clamp it to the scene, and map that progress to explicit beat ranges. Scrolling backward should restore earlier states without depending on which events fired before.

Decide whether each visual is continuously scrubbed or triggered when entering a range. Do not mix a timed entrance with a scrubbed transform on the same property unless their ownership is explicit.

Account for deep links, reload at a restored scroll position, and immediate jumps to the end. Initialize from the current position. Recalculate geometry after relevant size changes, media dimensions, and font loading; avoid doing full layout measurement on every frame.

Read geometry together, then write styles together. Schedule scroll updates through one animation-frame path. Update only when inputs change, and keep handlers passive unless preventing an event is essential to a deliberate interaction.

## Pinning and spatial movement

Prefer normal document flow and CSS sticky where that solves the scene. Inspect ancestor overflow, transforms, available height, and containing blocks when sticky behaves unexpectedly.

The scroll distance should provide enough time to read each beat at normal movement. Do not allocate several viewport heights to one short label. Keep text in a stable region while it is meant to be read.

A horizontal sequence still lives in a vertically navigated document. Ensure keyboard focus can reach and reveal every interactive item, touch behavior is intentional, and the scene has a clear exit. Narrow screens may use a vertical list or native horizontal overflow instead of a pinned transform.

## Effects and performance

Transforms and opacity are useful foundations. Masks, filters, shadows, and canvas can be appropriate when their visual purpose justifies their cost. Bound expensive effects to the smallest practical region and measure the result rather than assuming an API is fast.

Avoid persistent compositing hints across the whole page. Apply `will-change` only where measurement or a known sequence warrants it, and remove it when no longer useful. Pause optional loops when offscreen or the document is hidden.

Time-based motion should use elapsed time, not a fixed increment per frame. Bound smoothing so content does not lag far behind the user's scroll or remain in an unfinished state after input stops.

## Reduced motion and lifecycle

Provide a meaningful reduced-motion layout: remove large spatial travel, parallax, prolonged pinning, and automatic scrubbing where those are nonessential. Preserve readable content and understandable feedback. Do not merely accelerate a large movement into a flash.

Listen for preference changes when the page can remain open. Ensure the transition between modes clears stale transforms, pin spacers, and heights. Mobile and reduced motion are separate conditions; implement both intentionally.

Register cleanup with the framework or controller that owns the scene. Remove event listeners and observers, cancel scheduled frames, stop animations, and restore modified inline styles. With GSAP, scope animations and revert their context on teardown; remove related ScrollTriggers and refresh after meaningful layout changes.

## Adapt a recipe

The [layered hero](../assets/recipes/layered-hero/index.html), [pinned story](../assets/recipes/pinned-story/index.html), [horizontal gallery](../assets/recipes/horizontal-gallery/index.html), and [video scrub](../assets/recipes/video-scrub/index.html) are independent examples. Read the selected HTML and its sibling `recipe.js` together. Preserve the static content and fallback behavior while replacing demonstration styling and content.

Verify the beginning, each transition, an intermediate resting position, and the end. Then reverse, jump, resize, toggle reduced motion, and repeat after navigation or remount. A sequence that looks correct only when scrolled slowly forward is unfinished.
