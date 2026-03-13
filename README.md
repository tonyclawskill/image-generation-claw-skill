---
name: image-generation-claw-skill
description: |
  Generate AI images of Neta characters with custom prompts, styles, and aspect ratios.

  **Trigger conditions (proactive — no explicit user request needed):**
  - User says: draw / generate / create an image / make a picture / illustrate / render
  - User shares a prompt-like description after adopting a character
  - User says "same character, different style/scene/pose"

  **Prerequisites:** SOUL.md with character name + picture UUID; imagegen.js in this skill directory.
  **Response principle:** Output feedback after each step, don't wait for full completion.
  **Language:** Match the user's language throughout.
  **Interaction:** Present all next-step options as clickable quick buttons — `@{bot_name} {option}`.
---

# Image Generation Claw Skill

> Core tool: `node imagegen.js` — wraps all API calls, no neta-skills dependency required.

---

## 0. Initialization (silent, output first line immediately)

On trigger, **immediately output**:
```
🎨 Got it! Loading your character...
```

Then silently load the character:
```bash
node imagegen.js soul
# → {"name":"Guan Yu","picture_uuid":"9a5d4786-..."}
```

> If SOUL.md is not at the default path, pass it explicitly:
> `node imagegen.js soul /path/to/SOUL.md`

**Token check** (silent): imagegen.js auto-reads from `NETA_TOKEN` env or `~/.openclaw/workspace/.env`. On failure, prompt the user to configure it.

**After reading the character, output intro + confirm:**
```
══════════════════════════════════════
✨ Image Generator Ready

Describe any scene, mood, or style — and I'll paint {name} into it.

You can specify:
  • Scene / environment
  • Art style (e.g. manga, oil painting, watercolor, cinematic)
  • Aspect ratio: portrait / landscape / square / tall
  • Reference images for consistency

Current character: {name}
══════════════════════════════════════

What would you like to create?
```

Quick buttons: `Quick portrait 🖼️` → `@{bot_name} generate a portrait of {name}` | `Browse styles 🎨` → `@{bot_name} show me style options`

---

## 1. Prompt Building

Parse the user's description and extract:

| Field | How to detect | Example |
|-------|--------------|---------|
| Main scene | Natural language description | "standing in a bamboo forest" |
| Art style | Keywords like "manga", "oil painting", "pixel art" | `--style 漫画风格` |
| Aspect ratio | "portrait", "landscape", "square", "tall", or inferred from scene | `--size portrait` |
| Extra references | User shares image URLs or UUIDs | `--ref <uuid>` |

**Default size selection:**
| Scene type | Recommended size |
|-----------|-----------------|
| Portrait / character focus | `portrait` (576×768) |
| Landscape / wide environment | `landscape` (1024×576) |
| Profile picture / avatar | `square` (768×768) |
| Phone wallpaper / full body | `tall` (576×1024) |

If the user's intent is ambiguous, default to `portrait`.

---

## 2. Generation

```bash
node imagegen.js gen "<prompt>" --char "{name}" --pic "{picture_uuid}" --size portrait --style "漫画风格"
# stderr: 🔍 Looking up character: {name}...
# stderr: ✅ Character resolved: {name}
# stderr: 🎨 Generating image (576×768)...
# stderr: ⏳ Task submitted: xxx
# stdout: {"status":"SUCCESS","url":"https://...","task_uuid":"...","width":576,"height":768}
```

- **Forward all stderr lines in real-time** to the user (🔍 / ✅ / 🎨 / ⏳)
- `status=FAILURE` → output `⚠️ Generation failed. Try rephrasing the prompt or picking a different style?`
- `status=TIMEOUT` → output `⏳ Render timed out. Retry or simplify the prompt?`

---

## 3. Display Result

On success, output the image URL **on its own line** (auto-expands as preview):

```
━━━━━━━━━━━━━━━━━━━━━━━━
✨ {name} · {scene summary}
{image_url}
━━━━━━━━━━━━━━━━━━━━━━━━
```

Follow up with:
```
Like it? Here's what you can do next:
```

Quick buttons:
- `Try another style 🎨` → `@{bot_name} same scene, different style`
- `Change the scene 🌄` → `@{bot_name} generate a new scene`
- `Different angle 🔄` → `@{bot_name} same prompt, different composition`
- `Save & share 💾` → `@{bot_name} save this image`

---

## 4. Style Quick Picks

When the user asks for style options or says "show me styles", output:

```
Here are some popular styles to try:

🖌️  **Illustration**   → "high quality illustration, detailed"
📖  **Manga**          → "manga style, black and white"
🎬  **Cinematic**      → "cinematic lighting, movie still"
🎨  **Oil Painting**   → "oil painting, textured brushstrokes"
💻  **Pixel Art**      → "pixel art, 16-bit retro"
🌊  **Watercolor**     → "watercolor, soft edges, pastel tones"
🌑  **Dark Fantasy**   → "dark fantasy, dramatic shadows"
📸  **Photorealistic** → "photorealistic, 8k, studio lighting"
```

Quick buttons: `[Style name]` → `@{bot_name} generate with [style name] style`

---

## 5. Character Search

If the user wants to use a different character:

```bash
node imagegen.js search "<keywords>"
# → [{"uuid":"...","name":"...","type":"oc"}, ...]
```

Present results as a numbered list and let the user pick one.

---

## 6. Error Handling

| Error | User message |
|-------|-------------|
| SOUL.md missing | "Please run adopt first to set up your character." |
| NETA_TOKEN missing | "Add `NETA_TOKEN=...` to `~/.openclaw/workspace/.env` and try again." |
| Character not found | Fall back to freetext prompt, warn the user |
| status=FAILURE | ⚠️ Generation failed — try rephrasing or simplifying the prompt |
| status=TIMEOUT | ⏳ Timed out — retry or reduce prompt complexity |
| Network error | Suggest checking connection or token validity |

---

## CLI Reference

```bash
# Read character from SOUL.md
node imagegen.js soul [/path/to/SOUL.md]

# Search for a character by name
node imagegen.js search <keywords>

# Generate an image
node imagegen.js gen "<prompt>" \
  --char  "<character name>" \   # optional: auto-resolved to character vtoken
  --pic   "<picture uuid>"  \    # optional: character reference image
  --size  portrait           \   # portrait | landscape | square | tall
  --style "漫画风格"          \   # optional, repeatable
  --ref   "<artifact uuid>"      # optional extra reference, repeatable
```

**Output (stdout, JSON):**
```json
{
  "status": "SUCCESS",
  "url": "https://oss.talesofai.cn/picture/<task_uuid>.webp",
  "task_uuid": "...",
  "width": 576,
  "height": 768
}
```

---

## Environment

| Variable | Source | Required |
|----------|--------|----------|
| `NETA_TOKEN` | env / `~/.openclaw/workspace/.env` / `~/developer/clawhouse/.env` | Yes |
