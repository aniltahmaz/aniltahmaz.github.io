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

On the Windows machine, `python` in Git Bash opens the Microsoft Store alias, so use `py`. Port 8000 is reserved there and fails with WinError 10013.

Anil also works from a second Windows PC that has no Python, Node, Word or LibreOffice, so the `site` entry fails there. To preview on that PC, use a small PowerShell static server (a `TcpListener` loop) started from a temporary `launch.json` entry, then revert the entry. The browser pane does not open `file://` pages.

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
- **Contents nav.** This is built from the `section.iteration` elements inside `.modal-details[data-section-nav]`. Each button's label is the section's `.section-name` text. It only appears when there are at least 4 sections. At every width it is a sticky text bar at the top of the case study. The script also fills `#section-rail` for a side rail, but the current style hides it.
- **Lightbox.** Clicking `.design-figure a` or an `a[data-lightbox]` inside the modal opens the image. Text links can set `data-alt` and `data-caption`. Otherwise the caption comes from the `<figcaption>`.
- **Video loading.** Card-front videos use `preload="none"` with a `poster`. They play only while on screen and pause while a modal is open. Modal videos autoplay. Add `data-lazy-video` (with `preload="none"`, no `autoplay`) to a clip further down a case study so it loads and plays only when scrolled into view.
- **Scrolling.** The home page scrolls the window as normal. An open project is a full page over it that scrolls inside `.modal-container`, so scroll code for a case study must target that element. `body.modal-open` stops the list behind it from scrolling.

## Case study layout

All cards share one structure. Copy an existing card rather than inventing new markup:

1. `.case-head` contains `h2.modal-title` and `p.modal-pitch`, then `dl.case-facts` (My role / Team / Duration / Engine / tools). After that comes `.case-intro`: `.case-video` beside `.case-did`, which holds "What I did" as `ul.modal-did` and an optional `p.modal-note` for NDA notes and teammate credits.
2. `.modal-body.is-stacked` → `.modal-details[data-section-nav]` → "How it works", then one `section.iteration` per topic. The first section is usually "Overview".
3. Each section starts with `h4.section-heading`, where `<span class="section-name">` holds the short label the nav uses, followed by a headline. When the heading is only a title, as in the combat and turn-based cards, add `title-only` to the `h4`; then the name is the heading itself and the nav label. Within a section, the order is **text above tables above media**:
   - `.design-brief` holds three `.tech-block`s: `problem` ("Design problem"), `decision` ("Design decision") and `solution` ("Why this decision").
   - `p.iteration-note` is used for paragraphs. A `a.graph-link` reading "See the graph →" opens a Blueprint screenshot in the lightbox.
   - `.design-table-wrap > table.design-table` holds tables. A `p.table-title` line can name the table above it. Permission tables (`.perm-table`) use `perm-yes` / `perm-no` cells and `perm-time` for the "Allowed" time. The reason for each row goes in a list under the table.
   - `.media-row` (variants `single`, `shots-tall`) contains `figure.design-figure` for screenshots and `figure.design-figure.clip` for videos. It holds at most two side by side, and more items wrap to the next row. Anil asked for no more than two in a row. Images link to the full-size file and carry `width`, `height`, `alt` and `loading="lazy"`.
   - `.table-slot` pairs a draw.io flow chart (`figure.design-figure.drawn`) with an equivalent table. At 768px and below the drawing is hidden and the table is shown. On wider screens the table is visually hidden but still read by screen readers.
   - `.video-slot` frames, and `.video-placeholder` on card fronts, mark videos that are not recorded yet.

The title, role and facts appear twice: on the card front (`.card-summary`) and in the case head. Keep both copies in sync.

## Visual style (October 2026)

On 20 October 2026 the site was rebuilt in several passes with Anil. He first asked for a plain site like his mentor's minimal portfolio, because the old dark style with the neon accent had too much decoration. He then said it should not be a copy of that site. He asked for a dark page again, not as black as `#0a0a0a`, a standard readable font, and a minimal but orderly look with thin frames and light decoration. Keep it that way:

- **Type and colour.** Inter everywhere, with `--mono` only for `code`. Body text is one colour (`--text: #e6e6e6`) on a grey page (`--bg: #212226`). Anil found `#141414` still too black. There are no muted greys for captions or meta lines; size and weight set the hierarchy. Headings and labels use normal capitalisation at readable sizes. Small spaced-out capitals looked odd to Anil, and only the role in the header keeps them.
- **Accent.** One soft blue (`--accent: #7fb8d6`), used sparingly. It marks the role in the header, the experience numbers, the case-fact labels, each section's short name, the "What I did" bullets and the current contents item. Hovered cards and the "Next project" link get a blue frame, and hovered links get a blue underline. Do not spread it further or add a second colour.
- **Frames.** Framed parts sit on `--surface` with a 1px `--line` border and `--radius` (10px) corners: the four experience numbers, project cards, the case facts, tables, the contents panel, the "Next project" link, figures and clips (6px). Buttons such as Close, Resume and the contents items are outlined. Do not use shadows, glows, hover lifts or emoji.
- **Sidebar.** `aside.side-panel` is a full-height sidebar fixed to the left edge, like the old site's. It is `--panel` (230px) wide, has its own background (`--panel-bg`) and a thin right border. It holds the photo, location and focus, then "Skills" one per line, then "Contact" links and a framed Resume button, with thin rules between the groups. `body` is padded by its width. At 1100px and below it becomes a band between the header and the intro: the photo beside the location, with skills and links flowing as text.
- **Home.** The header has "Anil Tahmaz" large (2rem, bold), then "Technical Game Designer" in spaced capitals (1rem) after a thin rule, under the name at 720px and below. Projects / About sit on the right. The project page's header repeats the name and role the same way. The header, the intro and the projects are centred in the space right of the sidebar, up to `--page` (1400px). The intro is the About text, up to 860px wide, then the four experience numbers as small framed labels in one row, number first. Anil asked for them small, not as big boxes, and the first one says "5+ years designing and building gameplay" to fit a technical designer. Then comes the "Projects" label with a rule running out to the right, and two large framed cards per row, one at 720px and below. Each card shows its clip, the title, the pitch and the role on a ruled line at the foot. The design-area, engine, team and duration `.tag`s stay in the markup for later category filters but are hidden. The "View details" overlay is hidden.
- **Project page.** The modal is a full page with the same header and an outlined "Close ×" button (`.modal-close`, which the script focuses). Then come the title, the pitch, the four facts in one frame and the framed video beside "What I did" (stacked at 900px and below). The case study is 1080px wide, and text is limited to about 78 characters per line. The contents sit in a framed panel that floats 12px from the top while the page scrolls, so it stays visible. The section names are outlined buttons, and the current one is blue. Design-point and `.tech-block` labels are bold short headings on their own line above their text, as in Anil's PDF drafts, and are not coloured. Spacing is generous so the text reads easily: 24px between points, 28px around tables and media rows, 48px between the design and "How I built it", and 56px between sections.

## Positioning decisions (October 2026)

The site presents Anil as one thing: a **Technical Designer** who designs mechanics and systems, prototypes them, decides by feel and builds them. Cards follow these rules:

- **Role label.** Use "Technical Designer" for projects Anil designed and built. Keep the real team role where it was different: "Combat & Technical Designer" on the combat card, "Technical & Combat Designer" on the turn-based card (Anil's choice), and "Game Designer & Developer" at Tolian Games. Do not lead a role with "Programmer".
- **Design areas.** Each card front has a row of `.tag.design` items (`.project-tags.design-tags`) under the role. Since 20 October 2026 they are hidden with the other tags (see Visual style); keep them up to date for the future filters. A project can have several areas, because one project often covered more than one discipline. Engine, team and duration stay in the plain tag row below. Category filters were left out on purpose until there are more projects.
- **Card pitch.** Lead with the design (what the player does or feels) and follow with the technique. Technical numbers such as draw calls or build size belong in the case study, not in the opening line.
- **Sections are design goals.** Name each case-study section after what the player should feel, not after a system part. The short `.section-name` label is for the contents nav and the headline after it states the goal, e.g. "Combat flow — Fast, but not easy". Labels should be common terms a reader knows at a glance, not design jargon. Put player-facing sections first and data or architecture sections last. The combat card was rebuilt this way first. Apply it to the other cards when we go through each one.
- **Design, then how it was built.** Each section has two `.phase` blocks:
  - **Design part (no title).** The section headline already states the goal. It holds `p.design-point.problem` ("Design problem", or "Design goal" when it is a goal), `.decision` ("Design decision") and `.reason` ("Why this decision"). Then further details: notes, lists and tables. Then a `.media-row` of design-side visuals, meaning gameplay clips and paper designs. Other labels follow the same pattern when Anil uses them: "Technical problem", "Solution", "What I would change", "What I would add", "Parry rules". Each is a `.design-point`, and a `div.design-point` can hold a list.
  - **Build part.** It is headed `h5.phase-title` "How I built it", in sentence case. "Execution" read oddly. It holds a short explanation of how the decision was built, then a `.media-row` of engine visuals: montages, Blueprint graphs and data assets.
  - **Formatting.** The text is plain, never boxed. Anil asked for no boxes around text. Design-point labels are bold headings on their own line (see Visual style).
  - **Coverage.** The combat card and the first three sections of the turn-based card use this layout. The other cards, and the last three turn-based sections, still use the `.design-brief` / `.tech-block` trio until they are converted. The style shows those the same way as design points, without boxes.
- **Only real work.** Never add mechanics, numbers or techniques that Anil has not confirmed, such as ledge detection, coyote time, input buffering, StateTree, cooldowns or invented hit-stop values. Ask instead. Other AI tools (e.g. a Gemini conversation) suggested many of these, and they are not in the projects. In the combat project, StateTree is used only in Jakub's enemy AI.
- **Wording.** Write in the site's own plain voice. Do not copy phrasing from other AI tools. Anil will do a final wording pass on each card.

## Open items

These were deferred for later and will be done when we go through each card in detail:

- **Combat** ("Horde & Boss Combat Design"): on 22 October 2026 the card was rebuilt from Anil's PDF draft. Its sections are Combat flow: Player, Combat flow: Enemies, Player moveset, Hit feedback, 3-stage boss fight and Weapons for variety. Overview, Architecture and Next were dropped; the class diagram now sits in Weapons. The PDF confirms these facts:
  - The game is multiplayer: montages play on the server and the clients, and `EquipWeapon` sets the weapon up on every client.
  - The boss fight has three phases. Jakub built the boss AI and the phase sequences.
  - Hit-stop slows the attack to 20% for 0.1 s.
  - Elites have 5x a horde enemy's health. After a stagger, the player is immune to further stagger for 1 s.
  - The combo steps last 1.6, 1.4 and 2.1 s, the dash attack 1.0 s and the air attack 0.9 s.
  - The boss wind-up is 0.65 s. The PDF said 0.6 s, and Anil had it set back to 0.65 s.
  - The PDF's dodge-table "Dodge" reason repeated the attack table's. On Anil's request it now matches the dodge table: dodging is locked in the startup and the immune phase and can be chained in the recovery.
  - There is no input buffer and no stamina. Both appear as "What I would change".
- Still to do on the combat card:
  - Several "How I built it" parts have one visual or none. Unused screenshots in `assets/images/slavic-dome/` are candidates, matched by filename only so far: `montage-notify-dodge`, `montage-play-notify-routing` (Combat flow); `hit-feedback`, `start-trace`, `handle-trace-notify`, `sweep-trace-2` (Hit feedback); `damage-received`, `player-on-damage`, `player-can-receive-damage` (Enemies); `weapon-setup-1/2`, `equip-weapon`, `weapon-equipped-bind` (Weapons); `aim-mode` (the bow). `assets/videos/slavic-dodge-enemy-attack.mp4` could be a Combat flow design clip.
- **Turn-based** ("Cinematic Turn-Based Combat"): on 22 October 2026 the title, pitch, facts (Technical & Combat Designer, 7 people, 5 weeks), "What I did" and the first three sections (Every phase of a turn is a cutscene, Camera system, Parry and QTE) were rebuilt from Anil's PDF. Sequence events, Skill steps and Preparing skills are unchanged. Overview was dropped, and its diagram moved to the first section's "How I built it". The PDF names the functions NewStartSequence, NewBindActiveCharacter and StartAttackSequence. The graph screenshots show StartSequence, BindActiveCharacter and StartSkillSequence, and Anil agreed the text should use the screenshot names. The counter-attack needs every hit of the enemy attack parried, not only the last one. The old `flow-parry.png` drawing showed only the last-hit check, so it was removed and its corrected table is shown at every width. Redraw it in draw.io to bring the drawing back. Still to do:
  - Add an "Intended player feeling" note about the cinematic cameras.
  - Mention the boss skills and the Level Sequences, which Anil also made.
  - Record the six `.video-slot`s and the card-front video.
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
- Anil sometimes edits a card's copy and layout in a Word export rather than in chat. Site text goes in English and notes to him in Turkish brown italics. Images sit in 3-column rows with the asset path under each and in the alt text. He edits it in Google Docs and sends it back with Turkish instructions in brackets. Google Docs renames the media files but keeps the alt text. Check new claims in his text against the project and ask about anything unconfirmed before applying. Keep exports in `drafts/`, which is excluded from git locally.
- Copy style: first person, short plain sentences, concrete (what was built, why, what changed after playtesting), with no marketing language. Teammates are credited by name with links in `.modal-note`.

## Commits

Commits use a descriptive subject line with a bulleted body explaining what changed and why.
