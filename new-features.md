# New Features — The Classroom Manager

A curated brainstorm of new **in-class tools** for the app. Ideas are grouped by effort. Each entry notes what it reuses from the existing codebase and what new surfaces (routes / tables / stores) it would need.

**Effort tags:** `S` = ~1 day · `M` = 3–5 days · `L` = 1–2 weeks

---

## Implementation Progress

Checked off as features ship. Order follows the suggested prioritization at the bottom of this doc.

1. - [x] **Attendance Taker UI** `M`
2. - [x] **Soundboard** `S`
3. - [x] **Traffic Light (Voice Level)** `S`
4. - [x] **Lesson Agenda / Multi-Timer** `M`
5. - [x] **Behavior Points** `L`
6. - [x] **Seating Chart Builder** `L`
7. - [x] **Classroom Display Mode** `M`
8. - [x] **Spinner Wheel** `S`
9. - [x] **Stopwatch + Laps** `S`
10. - [x] **Countdown Transition** `S`
11. - [x] **Score Keeper** `S`
12. - [x] **Custom Dice** `S`
13. - [x] **Line-Up Generator** `S`
14. - [x] **Clap/Echo Attention Getter** `S`
15. - [x] **Hall Pass Tracker** `M`
16. - [x] **Reward Badges** `M`

---

## Quick Wins

Small, focused tools that slot into the current architecture (Next.js App Router, Zustand stores, shadcn/ui, Supabase).

### Spinner Wheel `S`
Visual spinning wheel for picking students, deciding activities, or gamifying cold calls.
- **Why teachers want it:** more engaging than the plain random picker; doubles as a game prop.
- **Reuses:** `stores/classStore.ts` (student list), audio from `stores/settingsStore.ts`.
- **New:** route `app/(app)/spinner/page.tsx`, dashboard card in `app/page.tsx`.

### Soundboard `S`
One-tap classroom sound effects: applause, drumroll, ding, fail, bell, crickets.
- **Why teachers want it:** reward/feedback moments, attention cues, humor.
- **Reuses:** Web Audio setup already used by Noise + Timer alerts.
- **New:** route `app/(app)/soundboard/page.tsx`, a small `/public/sounds/` asset folder.

### Stopwatch + Laps `S`
Count-up stopwatch with lap splits — distinct from the existing count-down Timer.
- **Why teachers want it:** timed reading, races, repeat-drill activities.
- **Reuses:** Timer display/fullscreen patterns from `app/(app)/timer/page.tsx`.
- **New:** route `app/(app)/stopwatch/page.tsx`.

### Traffic Light (Voice Level) `S`
Fullscreen green / yellow / red indicator the teacher toggles to signal expected volume.
- **Why teachers want it:** non-verbal classroom management on the projector.
- **Reuses:** fullscreen pattern from Timer; `uiStore` for state.
- **New:** route `app/(app)/voice-level/page.tsx`.

### Countdown Transition `S`
Oversized "5…4…3…2…1" screen with sound for transitions ("back to seats in 10").
- **Why teachers want it:** smoother transitions between activities.
- **Reuses:** Timer logic; could ship as a preset mode inside `app/(app)/timer/page.tsx`.
- **New:** none if embedded in Timer, or `app/(app)/countdown/page.tsx` if standalone.

### Score Keeper `S`
Team score counter for games — add/remove points, rename teams, reset.
- **Why teachers want it:** review games, team challenges, Jeopardy-style activities.
- **Reuses:** `uiStore` or localStorage for ephemeral session state.
- **New:** route `app/(app)/scoreboard/page.tsx`.

### Custom Dice `S`
Extend the current Dice tool with d4 / d8 / d10 / d12 / d20 and custom-labeled dice (e.g., reading prompts on faces).
- **Why teachers want it:** math games, random prompt generation.
- **Reuses:** existing `app/(app)/dice/page.tsx` animation + audio.
- **New:** dice-type selector UI; no new tables.

### Line-Up Generator `S`
Randomize student order for lining up, presentation order, or cleanup duty.
- **Why teachers want it:** removes "who goes first" disputes.
- **Reuses:** `stores/classStore.ts` student list, exclusion logic from Picker.
- **New:** route `app/(app)/lineup/page.tsx`.

### Clap/Echo Attention Getter `S`
Plays a short rhythmic clap pattern for students to echo back — classic attention reset.
- **Why teachers want it:** quick, silent-classroom trigger without yelling.
- **Reuses:** Web Audio system.
- **New:** can live inside the Soundboard, or as a dashboard button.

---

## Big Bets

Larger features that expand the product beyond "single-screen tools" — new routes, new Supabase tables, or new display modes.

### Seating Chart Builder `L`
Drag-and-drop classroom grid. Save a layout per class. Integrates with other tools: Picker can pull "from row 3," Groups can group by proximity.
- **Why teachers want it:** real classrooms are spatial; many decisions depend on who sits where.
- **Reuses:** `stores/classStore.ts` student roster; shadcn primitives.
- **New:**
  - Route `app/(app)/seating/page.tsx`.
  - Supabase table `seating_layouts (id, class_id, name, positions JSONB, created_at)` with RLS mirroring `classes`.
  - Integration hooks into Picker + Groups.

### Attendance Taker UI `M`
The `attendance` table already exists in `supabase/schema.sql` with no UI. Build a tap-through daily taker plus weekly/monthly summary.
- **Why teachers want it:** fastest win for a "real" data feature — schema is done.
- **Reuses:** existing `attendance` table; `stores/classStore.ts` sync patterns.
- **New:** route `app/(app)/attendance/page.tsx`, summary view, CSV export.

### Behavior Points `L`
Award or deduct points per student with a reason. Daily tally, session leaderboard, class history.
- **Why teachers want it:** the ClassDojo-style loop — positive reinforcement with a record.
- **Reuses:** `stores/classStore.ts`, Supabase RLS pattern from `students`.
- **New:**
  - Supabase table `behavior_events (id, student_id, delta INT, reason, created_at)`.
  - Route `app/(app)/behavior/page.tsx`.
  - Per-student running totals surfaced in Class List.

### Lesson Agenda / Multi-Timer `M`
Chain timed segments (e.g., 10 min warmup → 20 min lesson → 15 min activity → 5 min wrap-up) with auto-advance and sound cues.
- **Why teachers want it:** replaces juggling 4 separate timers; keeps pacing honest.
- **Reuses:** Timer logic from `app/(app)/timer/page.tsx`; `settingsStore` presets extended to "agendas."
- **New:** route `app/(app)/agenda/page.tsx`; JSONB agenda presets in `user_settings`.

### Classroom Display Mode `M`
Composable fullscreen projector view combining Timer + Noise Meter + Voice Level + current tool in one screen — designed for the room display, not the teacher's laptop.
- **Why teachers want it:** one projector view that handles a whole lesson without tab switching.
- **Reuses:** all existing tool components; fullscreen pattern.
- **New:** route `app/(app)/display/page.tsx` with widget layout config.

### Hall Pass Tracker `M`
Log who's out of the room, for how long, with a soft auto-return warning. Daily history.
- **Why teachers want it:** accountability + safety record.
- **Reuses:** student list, shadcn Dialog.
- **New:**
  - Supabase table `hall_passes (id, student_id, left_at, returned_at, reason)`.
  - Route `app/(app)/hall-pass/page.tsx`.

### Reward Badges `M`
Pairs with Behavior Points. Digital stickers/badges awarded to students (e.g., "Team Player," "Kind Listener"), shown on their profile.
- **Why teachers want it:** positive reinforcement loop beyond a point number.
- **Reuses:** behavior-points flow.
- **New:**
  - Supabase table `student_badges (id, student_id, badge_slug, awarded_at)`.
  - Badge catalog config; surfaces in Class List and (future) Student Profile.

---

## Cross-Cutting Enhancements

Ideas that touch multiple existing tools rather than introducing new ones.

- **Finish Dark Mode** — the toggle exists in `user_settings` + Settings UI but isn't fully wired. Add `class="dark"` on `<html>` and audit Tailwind classes.
- **Student Profile View** — per-student page consolidating attendance, behavior points, badges, notes. Becomes the natural hub once the big-bet features land.
- **Exportable Reports (PDF/CSV)** — end-of-term attendance + behavior summaries, per class. Uses existing export patterns in Settings.
- **Keyboard Shortcut Palette (`?` overlay)** — discoverable cheatsheet for all the hidden keyboard shortcuts already implemented across tools.
- **Recently Used Tools** — reorder the dashboard grid based on usage, or pin favorites.

---

## Suggested Prioritization (not binding)

If shipping in order, a reasonable sequence:

1. **Attendance Taker UI** — schema is done, highest value-to-effort ratio.
2. **Soundboard + Traffic Light** — two quick wins that pair nicely, teachers will feel the upgrade immediately.
3. **Lesson Agenda** — compounding value; every class uses it every day.
4. **Behavior Points** — unlocks Badges and the Student Profile view.
5. **Seating Chart** — the unlock for richer Picker/Groups behavior.
6. **Classroom Display Mode** — once enough widgets exist, compose them.

---

## Reference: Existing Code Touchpoints

- `app/(app)/*/page.tsx` — pattern for new tool routes (see `timer`, `picker`, `dice`).
- `app/page.tsx` — dashboard grid to add new tool cards.
- `stores/classStore.ts` — students / classes / attendance / notes CRUD + Supabase sync.
- `stores/settingsStore.ts` — audio, volume, timer presets, noise threshold, time-loss data.
- `stores/uiStore.ts` — transient UI state (sidebar, toggles).
- `supabase/schema.sql` — where new tables + RLS policies would be added.
- `components/ui/*` — shadcn primitives to reuse (Button, Card, Dialog, Slider, Input).
