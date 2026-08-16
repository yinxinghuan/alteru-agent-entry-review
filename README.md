# AlterU Agent Entry Motion Review

Interactive comparison page for the AlterU global Agent entry. The U-born Agent has now been selected as option 2, and the production handoff is reduced to two supported communication states.

Frontend-ready MiniAPP SVG and native Lottie files are in [`handoff/`](handoff/). Open [`handoff/preview.html`](handoff/preview.html) for the final two-state preview and [`handoff/README.md`](handoff/README.md) for the integration contract.

Current handoff: `v1.0.5`. The idle invitation first appears after a random `5–10s`, then repeats after a freshly randomized `10–30s` interval until the state changes. The awaiting-user animation plays once per state entry or target-conversation change.

The U-born Agent is also being tracked as a potential AlterU platform mascot. Its current identity, motion, bubble, and reuse rules are documented in [`doc/character-system.md`](doc/character-system.md). Cross-project decisions are recorded locally at `/Users/yin/code/games/memory/alteru_u_agent_character.md`.

```bash
npm install
npm run dev
npm run build
```

The Vite build uses `base: './'` so the output can run from any GitHub Pages repository subpath.
