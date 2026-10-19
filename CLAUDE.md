# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Anil Tahmaz's portfolio as a Technical Game Designer (systems & combat, Unity / Unreal Engine). A static single-page site on GitHub Pages, served at `aniltahmaz.com` (see `CNAME`). The site copy is in English. The user often talks to Claude in Turkish.

There is no build step, package manager, linter or test suite. Pushing to `main` deploys the site.

## Previewing

```bash
py -m http.server 5500 --bind 127.0.0.1
```

Then open `http://localhost:5500/`. To open a project's case study directly, go to `http://localhost:5500/#project/<id>`. The `<id>` comes from the card's `data-project-id`. The same server is the `site` entry in `.claude/launch.json` for the desktop app's preview pane.

On the Windows machine, `python` in Git Bash opens the Microsoft Store alias, so use `py`. Port 8000 is taken there by a Windows service (`Manager.exe`), so binding to it fails with WinError 10013.

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

## Positioning decisions (October 2026)

The site presents Anil as one thing: a **Technical Designer** who designs mechanics and systems, prototypes them, decides by feel and builds them. Cards follow these rules:

- **Role label.** Use "Technical Designer" for projects Anil designed and built. Keep the real team role where it was different: "Combat & Technical Designer" on the combat card, and "Game Designer & Developer" at Tolian Games. Do not lead a role with "Programmer".
- **Design areas.** Each card front has a row of `.tag.design` chips (`.project-tags.design-tags`) under the role. A project can have several areas, because one project often covered more than one discipline. Engine, team and duration stay in the plain tag row below. Category filters were left out on purpose until there are more projects.
- **Card pitch.** Lead with the design (what the player does or feels) and follow with the technique. Technical numbers such as draw calls or build size belong in the case study, not in the opening line.
- **Sections are design goals.** Name each case-study section after what the player should feel, not after a system part. The short `.section-name` label is for the contents nav and the headline after it states the goal, e.g. "Combat flow — Fast, but not easy". Labels should be common terms a reader knows at a glance, not design jargon. Put player-facing sections first and data or architecture sections last. The combat card was rebuilt this way first. Apply it to the other cards when we go through each one.
- **Design, then how it was built.** Each section has two or three `.phase` blocks:
  - **Design part (no title).** The section headline already states the goal. It holds `p.design-point.problem` ("Design problem", or "Design goal" when it is a goal), `.decision` ("Design decision") and `.reason` ("Why this decision"). Then further details: notes, lists and tables. Then a `.media-row.cols-3` of design-side visuals, meaning gameplay clips and paper designs.
  - **Build part.** It is headed `h5.phase-title` "How I built it", in sentence case, below a thin line. "Execution" read oddly. It holds a short explanation of how the decision was built, then a `.media-row.cols-3` of engine visuals: montages, Blueprint graphs and data assets. Blueprint graphs are shown as `design-figure fit fit-dark` thumbnails, which display the whole graph uncropped and open full size, rather than as "See the graph →" links.
  - **Change part (only where it applies).** It is headed `h5.phase-title` "What I would change". It holds the design lessons and the unfinished work that belong to that section, such as the dodge chaining limit or per-attack hit-stop. These replace a separate "Next" section at the end.
  - **Formatting.** The text is plain, never boxed. Anil asked for no boxes around text. Design-point labels sit in their own 160px column, at the same size as the text and colored. On phones they stack above the text.
  - **Readability.** Converted cards put `is-phased` on `.modal-details`. That class caps text lines at 760px, sets line-height to 1.7 and adds room between parts and sections. Friends who read the card got lost in long, full-width lines. Section headings sit flush left and the content is indented 28px under them (14px on phones). The timeline line and dots are hidden there, because those sections are not chronological.
  - **Voice.** Keep text short and first person: "I wrote `TryAttack`…", "I built one `BP_BaseCharacter`…". Design decisions and reasons also start from "I" ("I split…", "I wanted…"). Team decisions use "We" (Boss fight). Write one idea per sentence and avoid chains of "so" and "and", which makes proofreading easier. Captions are a few words, e.g. "ApplyHitStop: slow-down, timer, camera shake."
  - **Coverage.** So far only the combat card uses this layout. The other cards still use the boxed `.design-brief` / `.tech-block` trio until they are converted.
- **Only real work.** Never add mechanics, numbers or techniques that Anil has not confirmed, such as ledge detection, coyote time, input buffering, StateTree, cooldowns or invented hit-stop values. Ask instead. Other AI tools (e.g. a Gemini conversation) suggested many of these, and they are not in the projects. In the combat project, StateTree is used only in Jakub's enemy AI.
- **Wording.** Write in the site's own plain voice. Do not copy phrasing from other AI tools. Anil does a final wording pass on each card. Once his wording is in, keep it. Fix only clear grammar slips and tell him which ones. Avoid jargon he would not use himself, even standard design terms. For example, write "lock the player for a moment" instead of "commit".
- **Edit copies.** Anil may review a card in an edit copy (Word or PDF) of the case study:
  - English text is the site copy.
  - Brown italic text holds notes for him and does not go on the site.
  - Text in `[brackets]` is an instruction to carry out.
  - A file name under an image says which asset it is.

## Open items

These were deferred for later and will be done when we go through each card in detail:

- **Combat:** sections were rebuilt around design goals and split into Design, How I built it and, where it applies, What I would change (October 2026). Anil's wording pass from an edit copy (PDF) is applied (19 October 2026):
  - The Overview section and, later, the "Teamwork & architecture" section were removed. The class diagram and the teamwork result now sit in Enemies → How I built it. The multiplayer note is split between Combat flow (montages) and Weapons (replicated rows). The card has five sections.
  - The permission tables are stacked, times are rounded to one decimal, and Move and Sprint share a row. Each row has a `td.perm-why` reason. The "Also" rows were dropped. The tables are deliberately the **paper design**: they are labelled as such, "before the playtest changes", and Anil chose not to update them to match the Blueprints.
  - Hit-stop is a slow rate of 0.2 for 0.1 s. A `Can Hit Stop` flag keeps hits that land together from stacking it. The combat is replicated for multiplayer.
  - Weapon diversity was the goal, but only the sword family was finished in the one-month scope. Update the Weapons section when new weapon types are added.

  - Lead-designer review applied (19 October 2026):
    - Tables use Startup / Recovery wording, and Move/Sprint explains the recovery cancel.
    - Moves shows each move's length (1.6 / 1.4 / 2.1 s, dash 1.0 s, air 0.9 s).
    - Enemies uses real stats: horde 20 HP and 5 damage, Elite 11× health and faster than the player walks, player 100 HP, 1 s anti-stun-lock immunity.
    - Impact states that hit detection is server-only.
    - A "Boss fight" section covers the three phases. They were designed as a team, and Jakub built the Boss AI and the phase sequences, as the credits note says.
    These numbers come from the project via the Unreal MCP.
    - The title is now "Horde Combat Design" (it was "Data-Driven Combat Design"). Anil wants a generic title without the game's name, and only the Weapons section is about data.
  - The screenshots on the site show an earlier state of the project than the current one (ComboSteps, FAttackSlowRate, the OnHitLanded binding). Anil chose to leave this as it is.

  Still open:
  - Some assets were trimmed to keep the card clean and are unused on purpose: `weapon-equipped-bind`, `handle-trace-notify`, `sweep-trace-1`, `start-trace`, `damage-received`, `player-on-damage`, `weapon-setup-1/2`, `anim-direction` and the two blend-space clips.
- **Turn-based:** add duration and team size to the card tags and case facts, and an "Intended player feeling" note about the cinematic cameras. Anil also made the boss skills and the Level Sequences, which the case study does not mention yet. Six `.video-slot`s and the card-front video still need recordings.
- **Parkour:** add a level design section showing how the geometry teaches each move. This needs a layout image and any metrics.
- **Voice Runner:** decide whether the role becomes "Technical Designer" with an input-design focus, if Anil made those decisions, or whether the card moves to the bottom or is removed. It has no design-area tags until then.
- **Clean Energy:** the design story is weak. Keep it as is, add the cable-cost balancing, or remove the card.
- **Card order:** leave it as is for now. Revisit it together with category filters when more projects are added.

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
