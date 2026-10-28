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
- **Full-screen clips.** When a modal opens, every video in a `.clip` figure or `.case-video` gets a `.clip-fullscreen` button in its top-right corner. Clicking the button or the video plays it full screen with the player controls, which matters for the long editor walkthroughs. Leaving full screen hides the controls and the clip keeps looping in place. iPhones use `webkitEnterFullscreen`. The desktop app's preview pane does not complete full-screen requests, so test this in Chrome.
- **Visitor stats.** GoatCounter counts visits without cookies (added 25 October 2026). The dashboard is `aniltahmaz.goatcounter.com`, on Anil's account. `count.js` loads at the end of `index.html` and counts each page load. The `stats` module in `script.js` adds the rest:
  - Every project that opens counts as a page `/project/<id>` with the card title, whether it was opened by a click, a link or Back.
  - Clicks on the resume PDF links count as the event `resume-download`, and `mailto:` links as `email-click`.
  - Counts made before `count.js` has loaded wait for it.
  - The page load always counts under the home page's title, even when the visit lands on a project.
  - GoatCounter does not count on localhost, so local previews stay out of the numbers.
- **Scrolling.** The home page scrolls the window as normal. An open project is a full page over it that scrolls inside `.modal-container`, so scroll code for a case study must target that element. `body.modal-open` stops the list behind it from scrolling.

## Case study layout

All cards share one structure. Copy an existing card rather than inventing new markup:

1. `.case-head` contains `h2.modal-title` and `p.modal-pitch`, then `dl.case-facts` (My role / Team / Duration / Engine / tools). After that comes `.case-intro`: `.case-video` beside `.case-did`, which holds "What I did" as `ul.modal-did` and an optional `p.modal-note` for NDA notes and teammate credits.
2. `.modal-body.is-stacked` → `.modal-details[data-section-nav]` → "How it works", then one `section.iteration` per topic. The first section is usually "Overview".
3. Each section starts with `h4.section-heading`, where `<span class="section-name">` holds the short label the nav uses, followed by a headline. When the heading is only a title, as in the combat and turn-based cards, add `title-only` to the `h4`; then the name is the heading itself and the nav label. Within a section, text comes before the table it explains. Each image or clip sits **right after the text it shows**, not gathered at the end of the section (Anil, 22 October 2026):
   - `.design-brief` holds three `.tech-block`s: `problem` ("Design problem"), `decision` ("Design decision") and `solution` ("Why this decision").
   - `p.iteration-note` is used for paragraphs. A `a.graph-link` reading "See the graph →" opens a Blueprint screenshot in the lightbox.
   - `.design-table-wrap > table.design-table` holds tables. A `p.table-title` line can name the table above it. Permission tables (`.perm-table`) use `perm-yes` / `perm-no` cells and `perm-time` for the "Allowed" time. The reason for each row goes in a list under the table.
   - `.media-row` (variants `single`, `shots-tall`) contains `figure.design-figure` for screenshots and `figure.design-figure.clip` for videos. It holds at most two side by side. More items wrap to the next row, and an odd last item sits alone in the middle at the same size. Anil asked for no more than two in a row. Split a group of three or more and move each item to the text it shows. Images link to the full-size file and carry `width`, `height`, `alt` and `loading="lazy"`.
   - `.split` puts one image or clip beside the text it talks about: `.split-text` on the left, the figure on the right. Use it when a short point, list or "How I built it" paragraph has one matching visual. `.split.is-tall-media` gives a tall paper design the narrower column and shows only its top 420px; the full image opens on click. Splits stack at 900px and below.
   - `.table-slot` pairs a draw.io flow chart (`figure.design-figure.drawn`) with an equivalent table. At 768px and below the drawing is hidden and the table is shown. On wider screens the table is visually hidden but still read by screen readers.
   - `.video-slot` frames, and `.video-placeholder` on card fronts, mark videos that are not recorded yet.

The title, role and facts appear twice: on the card front (`.card-summary`) and in the case head. Keep both copies in sync.

## Visual style (October 2026)

On 20 October 2026 the site was rebuilt in several passes with Anil. He first asked for a plain site like his mentor's minimal portfolio, because the old dark style with the neon accent had too much decoration. He then said it should not be a copy of that site. He asked for a dark page again, not as black as `#0a0a0a`, a standard readable font, and a minimal but orderly look with thin frames and light decoration. On 22 October he pointed to three case-study pages he likes (Max Pears' Mafia: The Old Country, David Shaver's The Last of Us Part II and Dean Tate's BioShock 2). He asked for a pass that stays minimal: a home page that catches recruiters' attention and case studies that lead designers read easily. Keep it that way:

- **Type and colour.** Inter everywhere, with `--mono` only for `code`. Body text is one colour (`--text: #e6e6e6`) on a grey page (`--bg: #212226`). Anil found `#141414` still too black. There are no muted greys for captions or meta lines; size and weight set the hierarchy. Headings and labels use normal capitalisation at readable sizes. Small spaced-out capitals looked odd to Anil, and only the role in the header keeps them.
- **Accent.** One soft blue (`--accent: #7fb8d6`), used sparingly. It marks the role in the header, the experience numbers, the "See the projects" button, the "Case study →" line on each card, the case-fact labels, each section's number and short name, the "What I did" bullets and the current contents item. Hovered cards and the "Next project" link get a blue frame, and hovered links get a blue underline. Do not spread it further or add a second colour.
- **Frames.** Framed parts sit on `--surface` with a 1px `--line` border and `--radius` (10px) corners: the four experience numbers, project cards, the case facts, section headings, tables, the contents panel, the "Next project" link, figures and clips (6px). Buttons such as Close, Resume, Email me and the contents items are outlined. Only "See the projects" is filled blue. Do not use shadows, glows, hover lifts or emoji.
- **Sidebar.** `aside.side-panel` is a full-height sidebar fixed to the left edge, like the old site's. It is `--panel` (230px) wide, has its own background (`--panel-bg`) and a thin right border. It holds the photo, location and focus, then "Skills" one per line, then "Contact" links and a framed Resume button, with thin rules between the groups. `body` is padded by its width. At 1100px and below it becomes a band between the header and the intro: the photo beside the location, with skills and links flowing as text.
- **Home.** The header has "Anil Tahmaz" large (2rem, bold), then "Technical Game Designer" in spaced capitals (1rem) after a thin rule, under the name at 720px and below. Projects / About sit on the right. The project page's header repeats the name and role the same way. The header, the intro and the projects are centred in the space right of the sidebar, up to `--page` (1400px). The intro (`section.hero#about`, 22 October 2026) is for recruiters. It opens with a one-line headline taken from the About text ("I design gameplay systems, combat and levels…"), then the rest of the About text up to 780px wide. Below it come the four experience numbers as small framed labels, number first, and three buttons: "See the projects", "Resume (PDF)" and "Email me". Anil asked for the numbers small, not as big boxes, and the first one says "5+ years designing and building gameplay" to fit a technical designer. Then comes the "Projects" label with a rule running out to the right, and two large framed cards per row, one at 720px and below. Above 1100px the first card spans both columns, with its clip on the left and the text on the right. Each card shows its clip, the title, the pitch, and the role on a ruled line at the foot with "Case study →" on the right. The design-area, engine, team and duration `.tag`s stay in the markup for later category filters but are hidden. The "View details" overlay is hidden.
- **Project page.** The modal is a full page with the same header and an outlined "Close ×" button (`.modal-close`, which the script focuses). Then come the title, the pitch, the four facts in one frame and the framed video beside "What I did" (stacked at 900px and below). The case study is 1080px wide, and text is limited to about 78 characters per line. The contents sit in a framed panel that floats 12px from the top while the page scrolls, so it stays visible. The section names are outlined buttons, and the current one is blue. Each section heading sits in a frame with its number (01, 02…) in blue on the left, from a CSS counter, so a reader always knows where they are. Design-point and `.tech-block` labels are bold short headings on their own line above their text, as in Anil's PDF drafts, and are not coloured. Spacing is generous so the text reads easily: 24px between points, 28px around tables and media rows, 48px between the design and "How I built it", and 72px between sections.

## Positioning decisions (October 2026)

The site presents Anil as one thing: a **Technical Designer** who designs mechanics and systems, prototypes them, decides by feel and builds them. Cards follow these rules:

- **Role label.** Use "Technical Designer" for projects Anil designed and built. Keep the real team role where it was different: "Combat & Technical Designer" on the combat card, "Technical & Combat Designer" on the turn-based card (Anil's choice), and "Game Designer & Developer" at Tolian Games. Do not lead a role with "Programmer".
- **Design areas.** Each card front has a row of `.tag.design` items (`.project-tags.design-tags`) under the role. Since 20 October 2026 they are hidden with the other tags (see Visual style); keep them up to date for the future filters. A project can have several areas, because one project often covered more than one discipline. Engine, team and duration stay in the plain tag row below. Category filters were left out on purpose until there are more projects.
- **Card pitch.** Lead with the design (what the player does or feels) and follow with the technique. Technical numbers such as draw calls or build size belong in the case study, not in the opening line.
- **Sections are design goals.** Name each case-study section after what the player should feel, not after a system part. The short `.section-name` label is for the contents nav and the headline after it states the goal, e.g. "Combat flow — Fast, but not easy". Labels should be common terms a reader knows at a glance, not design jargon. Put player-facing sections first and data or architecture sections last. The combat card was rebuilt this way first. Apply it to the other cards when we go through each one.
- **Design, then how it was built.** Each section has two `.phase` blocks:
  - **Design part (no title).** The section headline already states the goal. It holds `p.design-point.problem` ("Design problem", or "Design goal" when it is a goal), `.decision` ("Design decision") and `.reason` ("Why this decision"). Then further details: notes, lists and tables. Design-side visuals, meaning gameplay clips and paper designs, sit next to the point they show, in a `.media-row` under it or a `.split` beside it. Other labels follow the same pattern when Anil uses them: "Technical problem", "Solution", "What I would change", "What I would add", "Parry rules". Each is a `.design-point`, and a `div.design-point` can hold a list. "What I would change" sits where it applies, in place of a separate "Next" section at the end.
  - **Build part.** It is headed `h5.phase-title` "How I built it", in sentence case. "Execution" read oddly. It holds a short explanation of how the decision was built, with its engine visuals (montages, Blueprint graphs and data assets) under or beside the paragraph they belong to. A paragraph with one graph is a `.split`. In the combat and turn-based cards, Blueprint graphs are `design-figure fit fit-dark` thumbnails, which show the whole graph uncropped and open full size, rather than "See the graph →" links.
  - **Formatting.** The text is plain, never boxed. Anil asked for no boxes around text. Design-point labels are bold headings on their own line (see Visual style).
  - **Voice.** Keep text short and first person: "I wrote `TryAttack`…", "I built one `BP_BaseCharacter`…". Design decisions and reasons also start from "I" ("I split…", "I wanted…"). Team decisions use "We" (Boss fight). Write one idea per sentence and avoid chains of "so" and "and", which makes proofreading easier. Captions are a few words, e.g. "ApplyHitStop: slow-down, timer, camera shake."
  - **Coverage.** The combat and turn-based cards use this layout. The other cards still use the `.design-brief` / `.tech-block` trio until they are converted. The style shows those the same way as design points, without boxes.
- **Only real work.** Never add mechanics, numbers or techniques that Anil has not confirmed, such as ledge detection, coyote time, input buffering, StateTree, cooldowns or invented hit-stop values. Ask instead. Other AI tools (e.g. a Gemini conversation) suggested many of these, and they are not in the projects. In the combat project, StateTree is used only in Jakub's enemy AI.
- **Wording.** Write in the site's own plain voice. Do not copy phrasing from other AI tools. Anil does a final wording pass on each card. Once his wording is in, keep it. Fix only clear grammar slips and tell him which ones. Avoid jargon he would not use himself, even standard design terms. For example, write "lock the player for a moment" instead of "commit".
- **Edit copies.** Anil may review a card in an edit copy (Word or PDF) of the case study:
  - English text is the site copy.
  - Brown italic text holds notes for him and does not go on the site.
  - Text in `[brackets]` is an instruction to carry out.
  - A file name under an image says which asset it is.

## Open items

These were deferred for later and will be done when we go through each card in detail:

- **Combat** ("Horde & Boss Combat Design"). Rebuilt around design goals in October 2026:
  - **19 October, on the other PC.** A wording pass and a lead-designer review were applied, with numbers checked in the project through the Unreal MCP.
  - **22 October.** Anil's PDF draft became the text. It was merged with the 19 October media.
  - **Sections.** Combat flow: Player, Combat flow: Enemies, Player moveset, Hit feedback, 3-stage boss fight, and Weapons for variety.
  - **Multiplayer.** Montages play on the server and every client, and `EquipWeapon` sets the weapon up on every client. Hit detection runs only on the server.
  - **Boss fight.** It has three phases, designed as a team. Jakub built the Boss AI and the phase sequences, as the credits note says.
  - **Confirmed numbers:**
    - Hit-stop slows the attack to 20% for 0.1 s. A `Can Hit Stop` flag keeps hits that land together from stacking it.
    - Combo steps last 1.6 / 1.4 / 2.1 s, the dash attack 1.0 s and the air attack 0.9 s.
    - After a stagger, the player is immune for 1 s.
    - The horde has 20 HP and deals 5 damage; the player has 100 HP.
  - **Boss wind-up.** It is 0.65 s, Anil's call. The PDF and the 19 October card said 0.6 s.
  - **Elite health (open).** The PDF says 5x a horde enemy's health, but the 19 October project check found 11×. The card follows the PDF until Anil confirms.
  - **Timing tables.** They show the PDF's final timings: wind-up / weapon trace / combo window / recovery, and startup / immune / recovery. Each row's reason is in a list under its table. The dodge-table "Dodge" reason was fixed to match that table.
  - **Screenshots.** They show an earlier state of the project than the current one (ComboSteps, FAttackSlowRate, the OnHitLanded binding). Anil chose to leave this as it is.
  - **Media placement.** The class diagram and Jakub's AI task sit in the boss fight's "How I built it". `ApplyHitStop` and `PlayHitFeedback` sit with the Hit feedback clips.
  - **Unused assets.** These are left out on purpose: `weapon-equipped-bind`, `handle-trace-notify`, `sweep-trace-1`, `sweep-trace-2`, `start-trace`, `damage-received`, `player-on-damage`, `receive-damage`, `player-can-receive-damage`, `weapon-setup-1/2`, `anim-direction` and the two blend-space clips.
  - **Weapons.** Only the sword family was finished in the one-month scope. Update the Weapons section when new weapon types are added.
- **Turn-based** ("Cinematic Turn-Based Combat"):
  - **History.**
    - On 19–20 October, on the other PC, it was rebuilt from scratch. It followed a section outline Anil liked from Gemini, corrected against the project through the editor MCP, and the videos were recorded.
    - On 22 October, Anil's PDF draft replaced the title area and the first three sections: Every phase of a turn is a cutscene, Camera system, and Parry and QTE.
    - Skills, Tactics and Team workflow are the 20 October versions.
  - **Card facts.** The role is "Technical & Combat Designer", with a team of 7 and 5 weeks. Design tags: Systems Design, Combat Design, Game Feel.
  - **Function names.** The project now names them `NewStartSequence`, `NewBindActiveCharacter` and `StartAttackSequence`. The graph screenshots show `StartSequence`, `BindActiveCharacter` and `StartSkillSequence`, and Anil asked the text to match the screenshots: the card says `StartSequence` and `BindActiveCharacter`. `StartAttackSequence` is still as in the PDF.
  - **Binding names.** The sequence binding names are `Player` and `Enemy`. Anil renamed them from `BP_Hero01` and `BP_Enemy01` on 20 October so they read more easily. Older Blueprint screenshots and editor videos still show the old names.
  - **Parry.**
    - The window is 0.5 s, and a press stays active 0.3 s, so an early press counts.
    - Only taking a hit fails a parry. After that, the hero cannot parry the rest of the attack.
    - A parried hit also blocks its status.
    - The counter therefore needs every hit parried. It plays on the last hit at half speed (0.5 time dilation) and cancels the enemy attack.
    - The parry table says this.
  - **QTE.**
    - The multiplier starts at 1.0 per skill. Perfect adds 0.25, up to 2.0. Good changes nothing.
    - Fail, timeout or a prompt still open at `QTEEnd` subtracts 0.25, down to 0.5.
    - It scales damage, heals and buff stacks. Self-damage uses `max(2 − m, 0.5)`.
  - **Tactics.**
    - Tactics (AP, types and resistances, statuses) were a team design, so the section uses "We".
    - Enemy targeting is Anil's own work. It lives in `BP_CharacterParent`.
    - `EnemyPlayRandomAttack` is an overridable event. The dog overrides it: right after `DA_DogShieldBuff` it plays one of its two laser attacks, then goes back to random attacks.
    - `PickEnemyTarget` takes a taunting hero first, otherwise a random one.
    - The heroes share one AP pool: `WBP_Skills.ApplySkillCost` checks `CanAffordAP` on the arena's `AC_TeamAP`.
  - **Loadout.** The player picks 3 of each hero's 5 skills in the main menu (`BP_GameInstance.GetActiveSkillSlots`). Anil designed this planning part. A teammate implemented the menu, so the card says "my design" and credits the menu in the note.
  - **Distances.** The defender stands 3 m in front of the attacker (`GetTargetAttackLocation`, 300 units). Anil confirmed it, and the paper design's 4 m is outdated.
  - **Flow charts.** Only the one-turn flow and the event-key flow are kept. `flow-parry`, `flow-qte`, `flow-system-overview`, `graph-move-to-attack-position`, `class-hierarchy.svg` and `skill-life-leech` are unused on purpose. The SVG is also wrong: it puts the enemy logic in `BP_EnemyParent`. Skills follows one example, Guardian's Blood, through its data asset, the event-key diagram and the in-game clip.
  - **Rejected claims.**
    - The Fixes section was dropped. None of its four claims from `Docs/PortfolioCopy_EN.md` match the project: the caster is still the arena's active character, enemy logic was not moved to `BP_EnemyParent`, there is no HP>0 guard, and the multi-ally camera helpers were not found.
    - A Gemini review (20 October) was applied only where it held up. These claims were rejected because the project says otherwise:
      - the hero turn also binding the target to `Enemy`;
      - both characters turning to face each other (only the defender turns);
      - the dog's lasers starting "after its Shield breaks";
      - the health bar showing resistances;
      - "Scaling" meaning QTE scaling;
      - "Built 15 multi-step skills" (teammates made skills through the workflow).
  - **Videos.** All were recorded on 20 October, and every slot has one. The Parry and QTE section's QTE clip reuses Full turn flow. Skills' Result shows Guardian's Blood, trimmed before the editor shows at the end.
  - **Sources.** The Unreal project is `PrismoOfDarkness.uproject` in `Documents/Unreal Projects/GP4New`. **Its `Docs/` drafts and the GP4 project memory are outdated.** Verify every claim through the editor MCP, which runs on `http://127.0.0.1:18000/mcp` (read-only use).
  - **Open questions.** The card follows the PDF until Anil confirms these:
    - The PDF credits tactics to "a team of 4 designers"; the 20 October notes said two.
    - The PDF's "What I would change" says only the first hero counters a multi-target attack; the 20 October check found that only the last counter plays.
  - **Still open.** The three "What I would change" items still hold as of 19 October:
    - Back mid-transition uses `PlayReverse` from the end.
    - `ReturnToStartPosition` snaps location and rotation.
    - There is no counter queue.
    Anil asked Claude to handle them. Fixing them in the project needs the editor MCP, so ask first.
- **Parkour:** add a level design section showing how the geometry teaches each move. This needs a layout image and any metrics.
- **Voice Runner:** decide whether the role becomes "Technical Designer" with an input-design focus, if Anil made those decisions, or whether the card moves to the bottom or is removed. It has no design-area tags until then.
- **Clean Energy:** the design story is weak. Keep it as is, add the cable-cost balancing, or remove the card.
- **Card order:** on 22 October 2026 Anil set it to turn-based, combat, parkour, curve bullet, Fancy Restaurant and voxel destruction. The rest follow in no particular order; they are now flight physics, voice runner and clean energy. The same order drives the "Next project" links. Revisit it together with category filters when more projects are added.

## Content and assets

- Images go in `assets/images/<project>/`. Card video posters go in `assets/images/posters/` (800×450 JPG), videos in `assets/videos/` (H.264 MP4, flat, named `<project>-<clip>.mp4`), and the resume in `assets/docs/`.
- The resume (`assets/docs/Anil_Tahmaz_Resume.pdf`) was rebuilt on 22 October 2026 as one A4 page that matches the site. It uses the site's wording, roles, team sizes and durations. Wanted Curve Bullet is left out of it on purpose (Anil's call). Its source is `drafts/resume/resume.html` on the second PC, printed with headless Edge: `msedge --headless=new --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf=<out.pdf> <file URL>`. When the PDF changes, bump `?v=N` on both resume links in `index.html`. Anil confirmed his current studies: the Futuregames Warsaw Game Designer program (09/2025 – present, ends 06/2027) and, at the same time, a full-time Master's in Computer Engineering at Vistula University (10/2026 – 03/2028, from the acceptance letter). The university's own English site (vistula.edu.pl/en) calls it "Vistula University" (AFiB Vistula); use that name. The SmartRecruiters autocomplete offered "University of Economics and Computer Sciences in Warsaw", which looks like a different school. Anil's acceptance letter (23 June 2026) settles it: "Master program in Computer Engineering" (Polish "Informatyka"), full-time, 3 semesters, 19 October 2026 to 31 March 2028. All documents and LinkedIn now say Computer Engineering, expected Mar 2028. The phone is the Polish +48 number.
  - **27 October.** The source was rebuilt on this PC from the PDF's measurements as `drafts/resume/resume.html` and printed with the same Edge command. The second PC's copy is now out of date. Changes: Vistula is "Master's Degree, Computer Engineering" without "(full-time)", and Indie work starts 10/2019 (also on LinkedIn). Ongoing studies show the expected end instead of "present": Futuregames 09/2025 – 06/2027 (expected), and Vistula "Expected 03/2028" with no start date, so the resume does not read as two programs that just started. Degrees are written out ("Master's Degree", "Bachelor's Degree"). The Tolian title is "Co-Founder, Lead Game Designer & Developer" on the resume and LinkedIn; the Techland version says "Co-Founder & Lead Game Designer". Work dates follow Anil's Techland application form (27 October): Tolian 10/2021 – 12/2024, UDO 02/2021 – 10/2021, Indie 10/2019 – 02/2021; on LinkedIn also Bilkent Sep 2013 – Jan 2019 and Hacettepe Sep 2020 – Dec 2021. The resume links are at `?v=9`. Skills has an Animation row that Anil added on 27 October: Animation Blueprints, IK Rig goals for procedural foot movement and hands reaching for targets, and Montages and Notifies. C++ sits in the Unreal Engine 5 row (Anil, 27 October), not under Other. He has not named the project he did the IK in, so it stays out of the project bullets.
  - **LinkedIn (27 October).** Updated in the app's browser to match: headline "Technical Game Designer | Systems, Combat & 3C | Unreal Engine 5 & Unity | Futuregames Warsaw" (no "student"), About studies sentence and a Parkour bullet, Indie from Oct 2019, Vistula Computer Engineering Oct 2026 – Mar 2028, Futuregames Sep 2025 – Jun 2027. The three old projects (Dungeon, Idle Civilization, Slime Z) were removed; the three portfolio projects carry their case-study links as media. Industry is "Computer Games" (was "Mobile Gaming Apps"). The open-to-work job preference, which drives job recommendations and alerts, reads "Full-time Technical Game Designer, Combat Designer, Gameplay Designer or Systems Designer at PC and console game studios (Unreal Engine)" (it named Product Manager before). Skills were cleaned to 32, all in English: the Turkish duplicates, Scriptwriting, Negotiation and French were deleted, and Analytical Skills was added. Leadership stays. Java keeps its passed skill assessment. Monetization, A/B Testing and Economy Design stay because they are real Tolian work. `drafts/resume/` is committed from now on; on the second PC, delete its old untracked `drafts/resume/resume.html` before pulling.
  - **Techland version.** A Combat/3C version for a Techland application lives in a Claude Doc ([Anil Tahmaz CV – Techland Combat/3C Designer](https://claude.ai/artifact/WKEULDspMqjPVV24SBksM4)). It plays down mobile work (no publishers or monetization), puts Horde → Parkour → Turn-based first, and adds other prototypes on one line. UDO dates follow LinkedIn (02/2021 – 10/2021). Its cover letter is a second Claude Doc ([Cover Letter – Techland Combat/3C Designer](https://claude.ai/artifact/W9DKwh8c4Mi3h16H6QQzsP)). Neither is in the repo on purpose: the repo is public, and application-specific documents should not be.
- Compress new recordings with FFmpeg (installed with `winget install Gyan.FFmpeg`) before committing: `-an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart`, with CRF 28 for a long card-front video. Add `fps=30` for 60 fps recordings. Editor walkthroughs stay 1920 wide at CRF 28 so their text reads in full screen. Recordings often carry a silent audio track, which `-an` drops. This took the turn-based recordings from 195 MB to 46 MB. Keep the originals outside the repo.
- Some assets are committed before they are used on the page. To list the ones `index.html` does not reference yet:
  ```bash
  for f in $(git ls-files assets); do grep -q "$f" index.html || echo "$f"; done
  ```
- `projects/curving-bullet/index.html` is a legacy standalone page from February 2026. Nothing links to it any more, because that project now lives in the modal (`curve-bullet`).
- Anil sometimes edits a card's copy and layout in a Word export rather than in chat. Site text goes in English and notes to him in Turkish brown italics. Images sit in 3-column rows with the asset path under each and in the alt text. He edits it in Google Docs and sends it back with Turkish instructions in brackets. Google Docs renames the media files but keeps the alt text. Check new claims in his text against the project and ask about anything unconfirmed before applying. Keep exports in `drafts/`, which is excluded from git locally.
- Copy style: first person, short plain sentences, concrete (what was built, why, what changed after playtesting), with no marketing language. Teammates are credited by name with links in `.modal-note`.

## Commits

Commits use a descriptive subject line with a bulleted body explaining what changed and why.
