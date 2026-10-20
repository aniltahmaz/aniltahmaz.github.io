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
- **Full-screen clips.** When a modal opens, every video in a `.clip` figure or `.case-video` gets a `.clip-fullscreen` button in its top-right corner. Clicking the button or the video plays it full screen with the player controls, which matters for the long editor walkthroughs. Leaving full screen hides the controls and the clip keeps looping in place. iPhones use `webkitEnterFullscreen`. The desktop app's preview pane does not complete full-screen requests, so test this in Chrome.
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
  - **Coverage.** The combat and turn-based cards use this layout. The other cards still use the boxed `.design-brief` / `.tech-block` trio until they are converted.
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
- **Turn-based:** rebuilt from scratch in the phased layout (19 October 2026). It follows a section outline Anil liked from Gemini, corrected against the current project through the editor MCP.
  - The title is "Cinematic Turn-Based Combat" (it was "Sequence-Driven…"). The role is "Technical & Combat Designer". Design tags: Systems Design, Combat Design, Game Feel.
  - Facts: team of 7, 5 weeks.
  - Six sections: Turn flow, Camera system, Timing (parry and QTE), Skills, Tactics and Team workflow.
  - The Fixes section was dropped. None of its four claims from `Docs/PortfolioCopy_EN.md` match the current project: the caster is still the arena's active character, enemy logic was not moved to `BP_EnemyParent`, there is no HP>0 guard, and the multi-ally camera helpers were not found.
  - Tactics (AP, types and resistances, statuses) were designed by a team of two designers, so it is written with "We". Enemy targeting is Anil's own work. It lives in `BP_CharacterParent`: `EnemyPlayRandomAttack` is an overridable event (the dog overrides it: right after `DA_DogShieldBuff` it plays one of its two laser attacks, then goes back to random attacks) and `PickEnemyTarget` takes a taunting hero first, otherwise a random one.
  - Parry rules: a 0.5 s window; a press stays active 0.3 s, so an early press counts; only taking a hit fails, and then that hero cannot parry the rest of the attack; a parried hit also blocks its status; a last-hit parry counters at once at 0.5 time dilation and cancels the enemy attack. QTE: the multiplier starts at 1.0 per skill; Perfect +0.25 up to 2.0; Good no change; Fail, timeout or a prompt still open at `QTEEnd` −0.25 down to 0.5. It scales damage, heals and buff stacks. Self-damage uses `max(2 − m, 0.5)`.
  - Only two flow charts are kept: one-turn flow and event keys. `flow-parry`, `flow-qte`, `flow-system-overview`, `graph-move-to-attack-position`, `class-hierarchy.svg` and `skill-life-leech` are unused on purpose. Skills follows one example, Guardian's Blood, through its data asset, the event-key diagram and the in-game clip. The SVG is also wrong: it puts the enemy logic in `BP_EnemyParent`.
  - The defender stands 3 m in front of the attacker (`GetTargetAttackLocation`, 300 units). Anil confirmed it; the paper design's 4 m is outdated.
  - Loadout: the player picks 3 of each hero's 5 skills in the main menu (`BP_GameInstance.GetActiveSkillSlots`). Anil designed this planning part; a teammate implemented the menu, so the card says "my design" and credits the menu in the note.
  - Sequence binding names are `Player` and `Enemy`. Anil renamed them from `BP_Hero01` and `BP_Enemy01` on 20 October so they read more easily. Older Blueprint screenshots and editor videos still show the old names.
  - The heroes share one AP pool: `WBP_Skills.ApplySkillCost` checks `CanAffordAP` on the arena's `AC_TeamAP`.
  - A Gemini review (20 October) was applied only where it held up. Rejected because the project says otherwise: the hero turn also binding the target to `Enemy`, both characters turning to face each other (only the defender turns), the dog's lasers starting "after its Shield breaks", the health bar showing resistances, "Scaling" meaning QTE scaling, and "Built 15 multi-step skills" (teammates made skills through the workflow).
  - Trimmed for repetition (20 October): "What I did" has four bullets like the combat card (Cinematic turns with the camera merged in, Parry and QTE, Skills as data, Team workflow in Anil's wording). The Turn flow phase table and the Life Leech / Guardian's Blood step table were removed, because the one-turn diagram and the data asset screenshots show the same. The Parry and QTE notes keep only what their tables do not say.
  - Sources: the Unreal project is `PrismoOfDarkness.uproject` in `Documents/Unreal Projects/GP4New`. **Its `Docs/` drafts and the GP4 project memory are outdated.** Verify every claim through the editor MCP, which runs on `http://127.0.0.1:18000/mcp` (read-only use).
  - Still open:
    - Recorded on 20 October: the card-front video (also the case video, poster from its QTE frame), Menu transitions, Full turn flow, three parry clips (all three parries with the counter, a missed parry, a counter from each hero), Preparing a sequence, Dynamic binding, Adding a skill, Creating a new skill and its result (an enemy attack, trimmed before the editor shows at the end). Timing's QTE clip reuses Full turn flow, and Skills' Result shows Guardian's Blood (trimmed before the editor shows at the end). Every slot now has a video.
    - The three "What I would change" items still hold as of 19 October: Back mid-transition uses `PlayReverse` from the end, `ReturnToStartPosition` snaps location and rotation, and there is no counter queue. Anil asked Claude to handle them. Fixing them in the project needs the editor MCP, so ask first.
- **Parkour:** add a level design section showing how the geometry teaches each move. This needs a layout image and any metrics.
- **Voice Runner:** decide whether the role becomes "Technical Designer" with an input-design focus, if Anil made those decisions, or whether the card moves to the bottom or is removed. It has no design-area tags until then.
- **Clean Energy:** the design story is weak. Keep it as is, add the cable-cost balancing, or remove the card.
- **Card order:** leave it as is for now. Revisit it together with category filters when more projects are added.

## Content and assets

- Images go in `assets/images/<project>/`. Card video posters go in `assets/images/posters/` (800×450 JPG), videos in `assets/videos/` (H.264 MP4, flat, named `<project>-<clip>.mp4`), and the resume in `assets/docs/`.
- Compress new recordings with FFmpeg (installed with `winget install Gyan.FFmpeg`) before committing: `-an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart`, with CRF 28 for a long card-front video. Add `fps=30` for 60 fps recordings. Editor walkthroughs stay 1920 wide at CRF 28 so their text reads in full screen. Recordings often carry a silent audio track, which `-an` drops. This took the turn-based recordings from 195 MB to 46 MB. Keep the originals outside the repo.
- Some assets are committed before they are used on the page. To list the ones `index.html` does not reference yet:
  ```bash
  for f in $(git ls-files assets); do grep -q "$f" index.html || echo "$f"; done
  ```
- `projects/curving-bullet/index.html` is a legacy standalone page from February 2026. Nothing links to it any more, because that project now lives in the modal (`curve-bullet`).
- Copy style: first person, short plain sentences, concrete (what was built, why, what changed after playtesting), with no marketing language. Teammates are credited by name with links in `.modal-note`.

## Commits

Commits use a descriptive subject line with a bulleted body explaining what changed and why.
