# AlterU — A 2D RPG, one sentence at a time

V3 · English · 1920×1080 · 24 fps · approximately 61 seconds

## Purpose

An internal/client/investor walkthrough of creating, previewing, playing and refining a 2D sprite exploration RPG. Not a brand advertisement. The main subject is the creation workflow, not the mascot or visual-identity system.

## What changed

- Removed the split explanatory-column/phone layout.
- Every shot occupies one widescreen frame with a clear subject.
- Composer close-up → send → pull back to Agent response → cut to the game result.
- All-new 2D woodland village, ranger sprite, elder, quest objects and shrine states.
- Most non-input shots last 1.4–3 seconds. Longer input/dialogue shots are reserved for reading.
- Independent walking sprites, camera tracking, conversation choice, three pickups, a persistent counter, shrine unlock and a follow-up dash test.
- Music and timed typing, send, selection, pickup, unlock and dash effects. No narration.

## Script and edit

| Time | Input / action | Visible consequence / camera |
| --- | --- | --- |
| 00:00–00:09 | “Make a 2D RPG set in a forest village.” | Composer close-up, send, pull back to response, reveal a village linked by a bridge to forest ruins. |
| 00:09–00:17 | “Add a young ranger I can move around.” | Introduce the sprite, pull out and track the ranger walking through the village. |
| 00:17–00:27 | “An elder sends me to find three forest runes.” | Elder appears, camera travels to the forest quest route, push into Preview. |
| 00:27–00:35 | Approach Elder Rowan; “I’ll find them.” | Movement, facing the NPC, readable dialogue and accepted quest. |
| 00:35–00:44 | Cross the bridge and collect the runes. | Tracking and tighter pickup cuts. Counter advances 0/3 → 1/3 → 2/3 → 3/3. |
| 00:44–00:49 | Approach the shrine. | Rune restoration unlocks the entrance and reveals a passage. |
| 00:49–00:54 | “Add a dash so I can explore faster.” | Return to input close-up; Agent confirms the update and preserved progress. |
| 00:54–01:01 | Test Space to dash and enter the shrine. | Repeated short dashes, trail feedback, traversal and quest-complete ending. |

## Source and truthfulness

The composer, message bubbles, Agent emblem, task card and Preview/Publish buttons use the existing `alteru-agent-demo/handoff` design materials. They are adapted to a widescreen recording surface; this is not a pixel-identical recording of the shipping mobile app.

Conversations and generation are scripted. The game is an original deterministic 2D simulation for the film, not a playable released game or an actual live Agent-generated session. Small on-screen notes identify simulated footage and compressed generation timing. The video does not demonstrate or promise a specific generation speed.

## Production

New map, sprite atlas and open-shrine artwork were produced with the built-in GPT image-generation tool, then rendered as a camera-directed 2D scene. The map is a background layer; the ranger, elder, quest objects, UI and state transitions are independently rendered. The production source retains the full shot list and deterministic timing. Animation principles informed short anticipation, quick feedback and eased camera travel; UI Foundation informed the preview page’s controls, mobile layout and playback recovery.

Image prompt set: `assets/generation-notes.md`. Existing project music: `rpg-create-play-v4-bed.mp3`. Event effects are newly synthesized and timed to this cut.

## Review priorities

1. Does the 2D sprite exploration style match the intended product demonstration?
2. Are input close-ups and the send→result relationship clear?
3. Are the faster cuts readable without becoming rushed?
4. Does the play section feel like movement, dialogue and progression rather than a slideshow?
