# Briefing and scope

Use this for a new website, a substantial redesign, or work whose purpose is still unclear. For a small adjustment, inspect the surrounding implementation and resolve only the missing decision.

## Find the facts before asking

Read product copy, routes, available data, brand assets, relevant design documentation, package configuration, and the deployment setup. Locate the actual application root in a monorepo. Check whether an existing preview represents the current source.

Separate three kinds of information:

- **Confirmed facts:** supplied capabilities, terminology, audience, claims, prices, and assets.
- **Existing choices:** implemented visual patterns and technical conventions, which usually remain in force for refinement.
- **Open decisions:** matters the request and project evidence do not settle.

A competitor reference demonstrates a treatment or quality level; it does not supply facts about this product. A filename such as `final-logo.png` does not establish that an asset is current if other evidence conflicts.

## Ask the questions that change the design

Prefer one compact round focused on genuine gaps:

- Who arrives, from where, and what should they do or understand?
- What content or evidence supports that outcome?
- What must remain, and what may change?
- Does an existing brand, technology, deadline, or publishing constraint limit the approach?

Ask about a meaningful conflict explicitly: “The current site targets enterprise buyers, while this brief addresses independent creators; which audience owns this page?” Avoid interviewing the user about information already present.

Resolve consequential unknowns before the dependent work. For reversible presentation choices, state a reasonable assumption and proceed. Do not keep asking for preferences merely because more options exist.

## Set the ambition to the task

| Visitor's main activity | Design emphasis | Common misstep |
|---|---|---|
| Evaluate an offer | Clear proposition, evidence, comparison, action | Spectacle that delays understanding |
| Complete a task | Stable placement, legible state, efficient interaction | Relearning controls on every screen |
| Read or research | Structure, measure, navigation, source clarity | Marketing choreography around essential text |
| Explore work or a place | Artifact prominence, pacing, spatial relationships | UI decoration competing with the subject |

A website may contain all four. Choose per page or flow, not once for the whole organization.

An immersive brief also needs a reason for the journey: reveal assembly, move through a collection, connect cause and effect, or establish a sense of place. “Premium and animated” alone does not determine a useful sequence.

## Agree on a workable direction

Describe the proposal in concrete terms: what dominates the opening, how content progresses, how typography and media behave, and where the main action sits. “A wide product cutaway stays beside three short assembly explanations” is actionable; “bold, modern, elevated” is not.

Offer alternatives when the user must choose a real tradeoff, such as a fast direct sales page versus a longer exploratory story. Do not require several visual concepts for a well-specified request. Naming a direction does not turn it into a restriction against later evidence.

Keep an existing stack. With an empty standalone project, static HTML/CSS/JavaScript is the starting assumption unless the site's behavior or host demands more. Explain a new dependency by the capability it adds.

## Keep durable context small

Reuse the project's own brief or design document when one already serves this role. For larger work without one, a development-only `VENOX-BRIEF.md` can contain:

```markdown
# Website brief

## Outcome and scope
[Audience, intended outcome, included pages, preserved behavior.]

## Confirmed material
[Product facts, copy, assets, brand commitments, evidence paths.]

## Direction
[Opening composition, content progression, visual system, motion purpose.]

## Implementation and checks
[Stack, integration constraints, key states and viewports to inspect.]

## Open items
[Unresolved matters and explicit assumptions. Omit if none.]
```

Write decisions, not a transcript. Update only when the task changes them. Exclude the brief from public assets and build output. For plan-only work, present the plan in chat unless the user requested a saved planning artifact.
