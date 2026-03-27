---
name: image-generation-claw-skill
description: Generate ai image generation skill images with AI via the Neta AI image generation API (free trial at neta.art/open).
tools: Bash
---

# Image Generation Skill

Generate stunning ai image generation skill images from a text description. Get back a direct image URL instantly.

## Token

Requires a Neta API token. Free trial available at <https://www.neta.art/open/>.

```bash
export NETA_TOKEN=your_token_here
node <script> "your prompt" --token "$NETA_TOKEN"
```

## When to use
Use when someone asks to generate or create ai image generation skill images.

## Quick start
```bash
node imagegenerationclaw.js "your description here" --token YOUR_TOKEN
```

## Options
- `--size` — `portrait`, `landscape`, `square`, `tall` (default: `portrait`)
- `--style` — `anime`, `cinematic`, `realistic` (default: `anime`)

## Install
```bash
npx skills add tonyclawskill/image-generation-claw-skill
```
