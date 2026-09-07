# Implementation and integration

Use this when building or editing a website. Start by finding the existing route, component, style, asset, and hosting boundaries that own the requested change.

## Work with the project

Inspect package scripts, lockfiles, framework configuration, routing, shared components, tokens, and representative neighboring code. Use the installed package manager and established conventions. In a monorepo, operate within the correct app instead of adding a second root scaffold.

Retain the existing stack. For an empty standalone site without a host constraint, start with static HTML/CSS/JavaScript. Adopt a framework when requirements such as data integration, shared route structure, rendering, or application state justify it, or when the host supplies one.

Follow the active environment's website-building and hosting instructions. Specialist tools may own deployment, media creation, or a separate video artifact when available and relevant. The skill does not require them or replace their integration contracts.

## Build a usable document first

Use meaningful landmarks, ordered headings, real links, and controls with the correct semantics. Preserve readable content before optional animation initializes. Distinguish links that navigate from buttons that change state.

Keep source order sensible when visual placement changes. CSS reordering should not make the keyboard path contradict the visible hierarchy. Reserve space for images and embedded content; avoid relying on late JavaScript to create the basic page geometry.

Progressive enhancement is especially important for immersive pages: the static document should retain its content order and main action when motion support, media, or initialization fails.

## Integrate behavior completely

Reuse existing state, validation, routing, and submission patterns. A visible control must have an honest outcome. Do not claim a form submitted successfully if no submission integration exists.

For a prototype without a backend, make the intended boundary explicit and show appropriate local feedback without pretending data was saved remotely. Preserve real endpoints and product behavior when refining an existing implementation.

Match labels, focus behavior, selected state, and error recovery to the control. Test a navigation menu with both keyboard and touch. Ensure dialogs, when needed, handle focus entry, escape, and return; reuse a project component that already does this correctly.

Do not add product states that the feature cannot encounter. Do handle the important states it can: loading, empty data, invalid input, long content, and failure are common examples.

## Make responsiveness structural

Choose breakpoints where content stops working, informed by existing tokens or conventions. Test intermediate widths, not only named devices. Use fluid dimensions where appropriate and minimum content sizes that prevent compression into unreadability.

Adapt the composition rather than scaling a desktop canvas. A side-by-side explanation may become a sequence; a pinned gallery may become ordinary overflow or a vertical list. Keep primary actions, text, and media intelligible in each arrangement.

Check long words, translations, zoom, landscape orientation when relevant, and mobile viewport changes from browser chrome. Avoid fixing a viewport issue with arbitrary extra heights that only work on one capture.

## Keep animation ownership explicit

Use CSS and native APIs for straightforward effects. Use an existing library where it already solves the problem. Add GSAP for coordinated complex scroll scenes only when the benefit outweighs its dependency and lifecycle cost.

In a server-rendered framework, initialize DOM-dependent behavior in the client lifecycle. Do not read `window` or element geometry during server rendering. Ensure initial markup remains useful and avoid hydration differences introduced solely by animation state.

Scope selectors to the component or scene. Register and invoke cleanup on unmount, route changes, or enhancement teardown. Development remounts should not create duplicate observers or scroll listeners. Review [Motion](motion.md) before integrating a recipe.

Read each recipe's `index.html` and sibling `recipe.js`; adapt their behavior into the project rather than embedding a second application inside it. Keep relative asset paths correct for the framework's public directory and deployment base path.

## Handle assets and dependencies intentionally

Use the project's asset pipeline, design tokens, and icon system. Keep fonts and media local when appropriate and permitted. Do not introduce a CDN dependency for a small effect the current stack can express; when an external dependency is chosen, follow the project's versioning and loading policy.

Confirm newly used APIs against the installed package version or authoritative documentation. Recipe code is a starting point, not evidence that an API exists in every browser or framework version.

Remove temporary examples, unused imports, stale selectors, and duplicate event paths introduced by the change. Avoid refactoring unrelated components merely because the skill is active.

## Preview, verify, and deliver

Use the project's documented development command and relevant checks. Use native browser tools available in the environment. The public repository's validation and capture scripts are optional development utilities; an installed skill need not include Node, Playwright, or that checkout.

Run checks proportional to the change: the established build/type checks when appropriate, relevant existing tests, and real interaction inspection. A visual-only tweak may need browser verification rather than a new unit test that mirrors CSS values.

Follow [Review](review.md), fix supported defects, and inspect the final diff for accidental scope expansion. Keep development briefs, screenshots, and temporary assets outside public build output.

Provide the usable preview or requested files. Deploy through the established host when the user has authorized publishing; creating or editing a website does not by itself authorize creating a hosting account, changing production settings, or posting the result elsewhere.
