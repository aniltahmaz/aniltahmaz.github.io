# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Anil Tahmaz's portfolio as a Technical Game Designer (systems & combat, Unity / Unreal Engine). A static single-page site on GitHub Pages, served at `aniltahmaz.com` (see `CNAME`). The site copy is in English. The user often talks to Claude in Turkish.

There is no build step, package manager, linter or test suite. Pushing to `main` deploys the site.

## Previewing

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. To open a project's case study directly, go to `http://localhost:8000/#project/<id>`. The `<id>` comes from the card's `data-project-id`.

## Cache busting (easy to forget)

- `index.html` loads `style.css?v=…` and `script.js?v=…`. When either file changes, bump **both** values to the same new string. The current format is date plus a letter, e.g. `20261010t`.
- When you replace an image in place under the same filename, add or bump `?v=N` on both its `<a href>` and its `<img src>`.

## Architecture

There are three source files: `index.html`, `style.css` and `script.js`. Each project lives entirely inside `index.html`:

```
<article class="project-card" data-project-id="<id>">
  <a class="card-trigger" href="#project/<id>"> …card front: video, h3, pitch, role, tags… </a>
  <template class="project-detail-template"> …the full case study… </template>
</article>
```

The modal (`#project-modal`) starts empty. `script.js` clones the card's `<template>` into `#modal-content` when the project opens. Most behaviour comes from markup conventions, so get the classes and attributes right and no JS changes are needed:

- **Routing.** Each project has the address `#project/<id>`. Opening a project pushes a history entry, so Back closes it. "Next project" replaces the entry instead. Plain clicks on `.card-trigger` open the modal. Modified clicks follow the link normally. Any element with `[data-open-project="<id>"]` also opens that project.
- **Card order.** The order of `<article>`s on the page is also the order of the "Next project" link, which wraps around at the end.
- **Contents nav.** This is built from the `section.iteration` elements inside `.modal-details[data-section-nav]`. Each button's label is the section's `.section-name` text. It only appears when there are at least 4 sections. Wide screens show it as a rail left of the panel, narrow screens as a sticky bar inside the panel.
- **Lightbox.** Clicking `.design-figure a` or an `a[data-lightbox]` inside the modal opens the image. Text links can set `data-alt` and `data-caption`. Otherwise the caption comes from the `<figcaption>`.
- **Video loading.** Card-front videos use `preload="none"` with a `poster`. They play only while on screen and pause while a modal is open. Modal videos autoplay. Add `data-lazy-video` (with `preload="none"`, no `autoplay`) to a clip further down a case study so it loads and plays only when scrolled into view.
- **Scrolling.** `body` has `overflow: hidden`. The page scrolls inside `.content` and the modal scrolls inside `.modal-container`, so scroll code must target those elements and not `window`.

## Case study layout

All cards share one structure. Copy an existing card rather than inventing new markup:

1. `.case-head` contains `h2.modal-title` and `p.modal-pitch`, then `dl.case-facts` (My role / Team / Duration / Engine / tools). After that comes `.case-intro`: `.case-video` beside `.case-did`, which holds "What I did" as `ul.modal-did` and an optional `p.modal-note` for NDA notes and teammate credits.
2. `.modal-body.is-stacked` → `.modal-details[data-section-nav]` → "How it works", then one `section.iteration` per topic. The first section is usually "Overview".
3. Each section starts with `h4.section-heading`, where `<span class="section-name">` holds the short label the nav uses, followed by a headline. Within a section, the order is **text above tables above media**:
   - `.design-brief` holds three `.tech-block`s: `problem` ("Design problem"), `decision` ("Design decision") and `solution` ("Why this decision").
   - `p.iteration-note` is used for paragraphs. A `a.graph-link` reading "See the graph →" opens a Blueprint screenshot in the lightbox.
   - `.design-table-wrap > table.design-table` holds tables. Permission tables use `perm-yes` / `perm-no` cells.
   - `.media-row` (variants `single`, `shots-tall`) contains `figure.design-figure` for screenshots and `figure.design-figure.clip` for videos. Images link to the full-size file and carry `width`, `height`, `alt` and `loading="lazy"`.
   - `.table-slot` pairs a draw.io flow chart (`figure.design-figure.drawn`) with an equivalent table. At 768px and below the drawing is hidden and the table is shown. On wider screens the table is visually hidden but still read by screen readers.
   - `.video-slot` frames, and `.video-placeholder` on card fronts, mark videos that are not recorded yet.

The title, role and facts appear twice: on the card front (`.card-summary`) and in the case head. Keep both copies in sync.

## Content and assets

- Images go in `assets/images/<project>/`. Card video posters go in `assets/images/posters/`, videos in `assets/videos/` (H.264 MP4), and the resume in `assets/docs/`.
- Some assets are committed before they are used on the page. To list the ones `index.html` does not reference yet:
  ```bash
  for f in $(git ls-files assets); do grep -q "$f" index.html || echo "$f"; done
  ```
- `projects/curving-bullet/index.html` is a legacy standalone page from February 2026. Nothing links to it any more, because that project now lives in the modal (`curve-bullet`).
- Copy style: first person, short plain sentences, concrete (what was built, why, what changed after playtesting), with no marketing language. Teammates are credited by name with links in `.modal-note`.

## Commits

Commits use a descriptive subject line with a bulleted body explaining what changed and why.
