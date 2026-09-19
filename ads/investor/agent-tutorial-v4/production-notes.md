# AlterU — A 2D RPG, one sentence at a time / V4

English internal product walkthrough. 1920 × 1080, 24 fps, 99.29 seconds.

## Scope and disclosure

Uses the existing AlterU product UI handoff and the approved V3 original 2D art. The UI conversation and gameplay are scripted simulations, not a live generation recording. Generation time is compressed; this is not a speed benchmark. Dialogue choices illustrate one played route, not proof of a deployed branching game.

## Edit

- 00:00–00:30: describe a forest village, add a ranger, request an elder and a rune quest, then open Preview.
- 00:30–00:57: multi-turn NPC conversation, questions and answers, choice confirmation and receiving the Wayfinder charm.
- 00:57–01:10: explore, cross the bridge, collect three runes and return to the elder.
- 01:10–01:23: state-aware follow-up conversation; the elder acknowledges the collected runes and explains how to open the shrine.
- 01:23–01:27: restore the runes and unlock the doorway.
- 01:27–01:39: request a dash in the Agent UI, test the new movement and enter the shrine.

## Played dialogue

**Elder Rowan:** Stranger, the forest shrine has gone quiet. Will you help?

Choices: **What happened to it?** / I’m looking for the shrine.

**You:** What happened to it?

**Elder Rowan:** The storm scattered its three runes. The doorway is sealed.

Choices: I’ll take a look. / **Where should I search?**

**You:** Where should I search?

**Elder Rowan:** Across the bridge. Follow the broken stones toward the old steps.

Choices: **I’ll find all three.** / Not right now.

**You:** I’ll find all three.

**Elder Rowan:** Take this charm. It glows when a rune is near.

Feedback: charm received; quest accepted; inventory indicator appears. The charm highlights when the ranger approaches a remaining rune.

### Return after collecting all three runes

**Elder Rowan:** You found them—all three. The charm led you well.

Choices: Will you come with me? / **How do I open the shrine?**

**You:** How do I open the shrine?

**Elder Rowan:** Set the runes in the doorway. I’ll keep watch here.

Feedback: objective updates to opening the shrine; all three runes remain collected.

## Motion and sound

Retains full-width input close-ups, pull-backs, sprite movement and exploration tracking shots. Dialogue uses short text reveals, readable holds, small speaker reframing and visible selection/confirmation. No split-screen explanatory columns. Reuses the existing generated music bed, with synthesized input, choice, item and shrine cues. No spoken voice-over.

## Source

Shot plan: `scripts/ads/tutorial-v4-shots.cjs`.
Renderer: `scripts/ads/tutorial-v3-rpg-scene.mjs` (shared V3/V4 renderer).
Build: `scripts/ads/build-investor-tutorial-v3.cjs --edition=4`.
Art generation provenance is retained with the V3 assets.
