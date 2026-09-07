# Hero, imagery, and media sequences

Use this when a website depends on photography, illustration, layered scenes, or video. Decide the visual role before sourcing or generating an asset.

## Write an asset brief that can be implemented

Record subject, purpose, aspect ratio, focal placement, background, required empty space, and the content it must support. Include the smallest and largest intended crops.

For a layered hero, distinguish the foreground subject, background, intervening elements, and any mask or alpha channel the implementation needs. A finished flat image cannot reliably become a scene with independently moving layers unless those parts can be separated.

Examples of useful direction:

- A close product photograph shows material and construction; its subject sits clear of the headline region.
- An architectural view supplies depth while the page title occupies an intentionally quiet sky area.
- A diagram explains the relationship between three actual components and uses live text for labels.

Avoid generating a complete website screenshot as the production UI. Real text, controls, and semantic structure belong in the implementation. A visual mockup can inform composition when useful, but is not a required stage.

## Source from the available capabilities

Prefer relevant supplied or existing assets. Verify that the file is usable, current, and permitted for the intended use. Search, licensed libraries, stock providers, image generation, and manual asset creation are options according to the available environment.

Keep the workflow provider-neutral. Use a tool that can meet the asset brief; do not require a particular service, account, or personal skill. If a capability is missing, adapt the concept with available material or identify the specific asset gap.

Record the source and relevant usage terms when introducing an external asset. For generated assets, retain a brief description or prompt and the tool/provider when known. Put working prompts and source notes in development documentation, not public UI or hidden markup.

Do not invent third-party logos, product details, certifications, or proof. Generated product imagery should not misrepresent a real product's supplied appearance or features.

## Make the image work in a browser

Inspect the actual output before using it. Check subject geometry, text artifacts, edges, transparent regions, and whether the required crop survives mobile.

Reserve image dimensions to avoid layout shifts. Supply responsive sources and suitable encoding when the pipeline supports them. Load the opening's essential image promptly; lazy-load media that is genuinely below the initial view. Do not apply lazy loading blindly to the main hero.

Choose `object-fit` and focal positioning deliberately. A face, label, or product feature must not disappear at a breakpoint. If one crop cannot work across the range, use a distinct mobile composition or art-directed source.

Keep meaningful descriptions in accessible text. Decorative layers should not create repeated announcements or intercept pointer events. Avoid placing crucial information only inside a raster image.

## Layered and spatial heroes

Use depth to reveal the subject or support the story. Plan which layer may move, how far, and what becomes exposed behind it. Test overscan and edge coverage at maximum travel; a moving background can reveal an unintended empty strip.

Keep the heading and action in a dependable reading area. Foreground layers should not obscure controls during motion or after a viewport change. Test pointer movement only as an enhancement, with an equivalent stable touch experience.

The [layered-hero recipe](../assets/recipes/layered-hero/index.html) demonstrates an independent scene. Read its sibling `recipe.js` before adaptation. Replace the example artwork with assets that match the chosen subject and retain the non-moving fallback.

## Video scrubbing has an asset dependency

Use the [video-scrub recipe](../assets/recipes/video-scrub/index.html) with a supplied, locally served, optimized clip and a useful poster. Read its sibling `recipe.js`; the recipe does not supply footage, an encoder, or a media provider.

Browser seeking quality depends on encoding and keyframe placement as well as JavaScript. A short clip prepared for random access may behave well; a long heavily compressed delivery file may stall. Verify the actual file on target browsers and devices before committing the page to continuous scrubbing.

Wait for valid metadata before mapping progress to duration. Handle an unavailable or invalid duration. Coalesce progress updates and avoid piling new seek requests on an outstanding one. On metadata/load/decode failure, keep the poster and ordinary page content usable.

Use an intentional narrow-screen and reduced-motion fallback, usually a poster with the narrative in normal flow. Do not make textual information available only at selected video frames. A supplied clip may also need an accessible normal-play option if its content is important.

Scroll is not permission to autoplay audible media. Keep decorative sequences silent; use explicit user controls when sound or normal playback is part of the experience.

## Evaluate the cost of the effect

Inspect transfer size, first useful render, decode behavior, seeking, memory pressure, and scrolling with the actual assets. Test on a modest viewport and slower loading path where practical. Asset production and delivery are separate problems: a beautiful source file can still be an unsuitable browser asset.

If encoding work is needed, use available tooling within the requested scope and preserve the source. Otherwise explain the asset requirement and keep a working fallback. Do not install an unrelated media production stack merely to satisfy an optional effect.
