# Visual direction and system

Use this to establish a visual language or improve an existing one. Begin with the actual subject, content, and usage context. Venox imposes no house palette, font list, corner radius, or visual genre.

## Make the idea visible

Choose a small set of decisions that reinforce each other: a typographic voice, a spatial rhythm, a color relationship, and an image treatment. Make those decisions visible in the first viewport and sustainable across ordinary content later on.

For example, a field-equipment manufacturer might use close material photography, compact specification typography, generous product silhouettes, and a strong service action. That direction comes from the product; a random laboratory grid would add little without a measuring task or relevant story.

Ask whether the composition remains recognizable when a headline is replaced. If its character depends entirely on a fashionable gradient or font, strengthen the relationships between content, layout, and imagery.

When refining, find the dominant existing pattern and preserve it. Distinguish a deliberate exception from accumulated inconsistency before “normalizing” it.

## Typography is a layout decision

- Evaluate the actual words in a candidate typeface: long product names, German compounds, numerals, punctuation, and required language coverage.
- Select display type for the headline's shape and voice; select body type for sustained reading at the intended density. One suitable family can be enough.
- Make hierarchy visible through size, weight, placement, and spacing together. Several nearly identical text styles create little hierarchy despite many tokens.
- Give headlines a deliberate width. Inspect wrapping at intermediate widths, not just the widest screenshot. Use fluid scaling with useful minimum and maximum values instead of shrinking every element together.
- Set paragraph measure for the content and audience. Roughly 45–80 characters is a useful reading starting range, not a constraint on captions or data tables.
- Check fallback-font layout and late font loading. A headline that briefly covers a control still has a layout problem even if the final screenshot looks correct.

Do not replace an established brand font merely because it is common. Do not select an obscure one if glyph coverage, licensing, or loading cost makes it unsuitable.

## Color carries roles

Define the background, primary text, secondary text, borders, emphasis, interactive actions, and feedback states. Reuse the project's token system when present. Distinguish brand expression from semantic feedback so that an accent color does not accidentally imply an error or success.

Check colors in their actual surroundings. Text on a moving image must remain readable across the image's full sequence; one sampled frame is insufficient. A stable text panel, local scrim, or different placement may work better than increasing shadow.

For typical WCAG AA text contrast checks, use 4.5:1 for normal text and 3:1 for qualifying large text. Check control boundaries and focus visibility separately. Do not infer contrast from perceived brightness or from a design token's name.

Dark and light treatments should follow the brief and context. Add a theme only when requested or part of the existing product; an audit should not penalize a deliberate single-theme site for lacking another.

## Layout gives content relationships

Use grouping to reveal meaning. Tight space connects a label to its value; a larger interval separates topics. Align important edges across sections, then break that alignment intentionally when the story benefits.

Cards are useful for comparable independent units, selectable items, or contained tasks. A page made entirely from equal cards may conceal which idea matters most. Change the structure when content roles differ: comparison, narrative, quote, specification, and gallery need not share one container.

Choose density by the job. A control panel can be compact and clear; a material image may deserve space. Empty space should separate or emphasize something, not substitute for missing content.

Test optical as well as numerical alignment. Rounded letters, diagonal marks, icons, and mixed numeral widths can look displaced despite identical CSS bounds.

## Surface treatment supports the world

Borders, shadows, radii, texture, gradients, and translucency are available materials. Give each a role: separation, elevation, enclosure, atmosphere, or emphasis. Remove a treatment when it competes with the subject or makes states harder to read.

Use one coherent icon family unless mixed styles are an intentional part of the identity. Preserve clear silhouettes at the rendered size. A decorative icon should not masquerade as a control.

Treat photographic assets, diagrams, and abstract graphics differently. Explain a mechanism with a diagram; show material with an image. Avoid using an attractive visual merely to fill an empty rectangle.

## Carry the system beyond the hero

Check a dense section, an ordinary form, a long headline, and the footer before calling the system complete. A direction that works only for a sparse opening has not yet solved the website.

Inspect default, hover, focus, selected, disabled, and feedback states where applicable. The primary action should remain recognizable in all contexts. Keep keyboard focus visible even when it differs from pointer styling.

For review, explain aesthetic concerns through their consequence: “The testimonial and primary action have equal weight, so the next step is hard to locate.” Avoid declaring a design wrong solely because it uses a familiar technique.
