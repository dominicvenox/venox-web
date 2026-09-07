---
name: venox-website
description: Design, build, and improve websites with clear visual direction, responsive craft, and purposeful motion. Use for landing pages, portfolios, editorial sites, product interfaces, and immersive brand or scroll experiences, including website planning and review. Not for backend-only work or standalone video production.
license: MIT
---

# Venox Website

Build websites whose content, composition, interaction, and implementation support the same idea. Venox is a working method, not a prescribed visual identity. A restrained reading experience and an expressive campaign can meet the same quality standard.

Use the user's language for collaboration and their requested language for website copy. The instructions and resources are in English; requests in German or English work equally well.

## Start with the actual task

Read the request, relevant project instructions, application entry points, existing components, and available content or brand assets. Inspect the running website when possible. Establish what already exists before proposing a new stack or visual system.

- An existing design can be authoritative without a design document.
- A new section normally belongs to its surrounding page's system.
- A redesign changes the agreed visual scope while retaining confirmed product facts and required behavior.
- An unavailable asset or uncertain business claim stays an open item; it does not become invented evidence.

Ask only for information that would materially change the result and cannot be discovered. A complete brief can go directly to implementation. For broad new work, settle purpose, audience, constraints, and one coherent direction; there is no required concept tournament or approval ritual.

If invoked without a task or usable conversational context, explain the available help and ask for the website or intended change. Do not start an unsolicited build.

## Choose the work mode

Natural-language intent takes precedence over these optional labels. Combine modes when that matches the request, while honoring an explicit request to stop at a plan or report.

| Mode | Deliverable and boundary | Load first |
|---|---|---|
| `plan` | Decide the structure, direction, behavior, assets, and implementation approach; leave website source unchanged. | [Briefing](references/briefing.md), [Composition](references/composition.md) |
| `build` | Implement a new website, page, or component at the requested scope. | [Briefing](references/briefing.md), [Implementation](references/implementation.md) |
| `refine` | Improve a named area while preserving the established identity, facts, and surrounding behavior. | [Design](references/design.md), [Implementation](references/implementation.md) |
| `redesign` | Replace the visual direction in the agreed scope; preserve required content and functionality. | [Briefing](references/briefing.md), [Design](references/design.md) |
| `animate` | Add or repair motion that explains a relationship or expresses the page's idea. | [Motion](references/motion.md) |
| `audit` | Inspect and report supported findings; leave website source unchanged. | [Review](references/review.md) |
| `polish` | Finish an implemented path: fix defects, align details, and verify the result. | [Review](references/review.md), [Design](references/design.md) |

Read additional references only where the task needs them. Planning and auditing may produce explicitly requested reports or temporary inspection evidence; they do not silently turn into implementation.

## Resolve direction, then carry it through

For a whole website or significant redesign, establish:

1. **Visitor outcome:** what a person should understand, decide, accomplish, or experience.
2. **Organizing idea:** a specific relationship between this subject and its presentation.
3. **First viewport:** the content hierarchy, media role, primary action, and what continues below.
4. **System:** typography, color roles, spacing, imagery, and interaction language that can support later pages.
5. **Constraints:** existing stack, real content, asset availability, accessibility, and loading costs.

State a recommended direction with its reason. Offer alternatives when there is a meaningful unresolved tradeoff or the user asks for options. Preserve an explicit aesthetic choice, including an intentionally conventional one.

Reuse established project documents. When larger work needs durable decisions, keep a small development-only `VENOX-BRIEF.md` as described in [Briefing](references/briefing.md). A local adjustment does not need a new document. Do not ship planning text in markup, hidden elements, metadata, or client bundles.

## Make the website specific

Use [Design](references/design.md) for visual decisions and [Composition](references/composition.md) for page structure and copy. Distinction comes from how the real material is organized, not a quota of unusual fonts or effects.

- Let content determine section geometry and density. Repetition should express a relationship.
- Give each important page a clear visual emphasis and a useful reading path.
- Use real product details, supplied proof, and meaningful imagery. Decorative statistics and fictional testimonials undermine the result.
- Make controls work and states intelligible. A polished screenshot is only one state of a website.

## Immersive work is a specialty, not a default

For a brand journey, spatial hero, pinned narrative, gallery, or media sequence, load [Motion](references/motion.md) and [Hero and media](references/hero-media.md). Keep a usable document beneath the enhancement.

These independent recipes are implementation examples, not page templates:

- [Layered hero](assets/recipes/layered-hero/index.html): depth around a focal subject.
- [Pinned story](assets/recipes/pinned-story/index.html): several narrative beats around one retained visual.
- [Horizontal gallery](assets/recipes/horizontal-gallery/index.html): a sequence whose spatial relationship matters.
- [Video scrub](assets/recipes/video-scrub/index.html): scroll-linked playback of a supplied local clip.

Read the chosen recipe's HTML and its sibling `recipe.js` before adapting it. Bring only the relevant behavior into the project's architecture; preserve its fallback and cleanup logic. Recipe styling and demonstration copy are not the website's design direction.

## Implement in the environment that exists

Follow [Implementation](references/implementation.md). Preserve the project stack, package manager, component conventions, and established hosting workflow. For an empty standalone website with no hosting constraint, default to static HTML/CSS/JavaScript; use an application framework when actual routing, data, or interaction requirements justify it.

Use CSS and native browser APIs for ordinary interactions. Add GSAP only when complex scroll orchestration benefits from it and the project does not already have a suitable solution. Confirm APIs against the installed version when implementing.

Media generation and specialist website or animation tools are optional capabilities. Use them when available and relevant; a missing provider is not a reason to fail an otherwise feasible website task. A standalone video deliverable belongs to a video workflow.

## Inspect the experience and finish

Use the environment's available browser tools to inspect the implementation. The repository's validation and page-capture tools are optional checkout utilities, not requirements of an installed skill.

Follow [Review](references/review.md): verify representative desktop and mobile layouts, the main interaction path, and meaningful edge states. For scroll work, inspect intermediate positions, reverse scrolling, resizing, and reduced motion as well as the opening and closing frames.

Batch discoveries into a focused correction pass, then confirm affected behavior. Repeat when unresolved defects or changes justify it. Separate measured failures from visual critique, and identify anything that could not be tested.

Finish with what changed, the evidence checked, and any concrete remaining limitation. Provide the usable preview or deliverable through the current environment. Publishing follows the user's authorization and existing hosting workflow; skill invocation alone does not authorize an unrelated deployment.
