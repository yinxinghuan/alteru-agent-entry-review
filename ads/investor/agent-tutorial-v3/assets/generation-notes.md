# V3 image-generation assets

Method: built-in GPT image-generation tool. All three selected images are copied into this project; no dependency on transient generated-image paths. They are original illustrative film assets, not captured product output.

## Forest map — `forest-map.png`

Use case: stylized-concept. Production asset for an actual 2D top-down sprite RPG walkthrough film. Create a NEW crisp premium 16-bit pixel-art game map, wide landscape 16:9, preferably 2048x1152. Orthographic top-down with small visible south-facing facades, absolutely not isometric or 3D. Scene: a tranquil fantasy woodland village LEFT third, a walkable dirt road across center, lush mysterious forest RIGHT third, a small ancient stone shrine at far right with a visibly locked teal rune doorway. Warm terracotta rooftops, cream cottage walls, deep jade and olive tree canopies, tiny flowers, warm ivory paths, teal flowing stream. Left village has 3 modest cottages around an OPEN town square at x25%, y60%; central path clear from (25%,60%) across to (75%,60%) and then to shrine entrance (87%,47%). A small wooden bridge crosses a vertical narrow stream near x53%. Woodland clearings along path at (63%,60%), (74%,58%), (82%,48%). Large trees mainly above and below the path, walking route unobstructed and wide. Consistent small tile scale across full map, excellent recognizable pixel art with clustered pixel shading, no blur, no tiltshift, no depth of field. NO characters, NO monsters, NO pickups, NO text, NO UI, NO logos. We will animate character sprites separately. Map should fill all edges, full-bleed continuous playable map, no frame, no sky, no horizon. Do not add names or labels.

## Sprite atlas — `ranger-elder.png`

Reference: forest map, art direction only.

Use case: stylized-concept. Reference image is ONLY art direction for a new standalone RPG CHARACTER SPRITESHEET, do not include map. Create 1024x1024 transparent PNG sprite atlas, exact FOUR columns and FOUR rows of equal 256x256 cells, no grid lines, no labels. 16 crisp pixel-art sprites, same pixel density and 3/4 top-down RPG perspective as reference. Each sprite centered horizontally in its cell; feet at y=220 within cell, head begins around y=55, body about 170 pixels tall, ample transparent space. Rows 1,2,3: SAME young ranger with auburn hair, teal green hood down, cream shirt, small red scarf, brown leather boots, small satchel. Row 1 faces DOWN towards viewer, four-frame walk cycle (idle,left step,idle,right step). Row 2 faces RIGHT, four-frame walk cycle. Row 3 faces UP showing back, four-frame walk cycle. Row 4: SAME elderly village elder, grey-white hair and beard, ochre cloak over cream tunic, a wooden staff, facing down, four subtle idle frames. Keep limbs clearly defined, friendly 2D sprite proportions about 2.5 heads tall, detailed clustered pixel shading. Nothing outside the characters, no floor shadows, no environment, no text. Transparent alpha background mandatory. All 16 sprites completely separated in exact equal cells, no touching.

## Shrine open — `forest-map-open.png`

Edit target: original forest map.

Precise-object-edit. This is an existing 2D pixel-art RPG map; keep the full image exactly the same size, framing, composition, style and every pixel outside the upper-right shrine's teal locked door. Change ONLY that teal door: remove the padlock, open the two teal rune-carved door leaves outward, revealing a dark intriguing stone passage with a few warm gold-lit steps going inward. Keep the shrine facade, arch, stairs and nearby trees all perfectly aligned and unchanged. Preserve orthographic top-down sprite RPG perspective and crisp clustered pixel texture. No glow effects spilling outside the arch, no characters, no UI, no text. The interior should look hand-pixelled, NOT a flat gradient or smooth polygon. This will be overlaid onto the exact original door area for an opening animation.

## Actual generated output

Requested dimensions above are prompt targets, not guaranteed tool parameters. The renderer reads the actual image dimensions and uses the original map aspect ratio and equal-grid atlas cells. No image is stretched into an incorrect scene aspect ratio; final movie output is 1920×1080.

Verified output: both map states are 1672×941; the transparent sprite atlas is 1254×1254. The atlas contains four equally spaced rows and columns and is sampled at its actual dimensions.
