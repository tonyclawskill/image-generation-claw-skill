---
name: image-generation-claw-skill
description: Generate image generation claw images using the Neta AI API. Returns a direct image URL.
tools: Bash
---

# Image Generation Skill

Generate stunning ai image generation skill images from a text description. Get back a direct image URL instantly.

## When to use
Use when someone asks to generate or create ai image generation skill images.

## Quick start
```bash
node imagegenerationclaw.js "your description here"
```

## Options
- `--size` — `portrait`, `landscape`, `square`, `tall` (default: `portrait`)


## Token

Requires a Neta API token via the `--token` flag.
- Global: <https://www.neta.art/open/>
- China:  <https://app.nieta.art/security>

```bash
export NETA_TOKEN=your_token_here
node <script> "your prompt" --token "$NETA_TOKEN"
```

## Install
```bash
npx skills add tonyclawskill/image-generation-claw-skill
```
