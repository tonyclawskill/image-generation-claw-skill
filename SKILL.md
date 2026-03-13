---
name: image-generation-claw-skill
description: Generate Neta AI images of characters with custom prompts, styles, and aspect ratios. Zero-dependency Node.js helper — no neta-skills install needed.
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - NETA_TOKEN
      bins:
        - node
    primaryEnv: NETA_TOKEN
    emoji: "🎨"
    homepage: https://github.com/tonyclawskill/image-generation-claw-skill
---

# Image Generation Claw Skill

Generate Neta AI images of characters with custom prompts, styles, and aspect ratios.

## Commands

```bash
node imagegen.js soul [soul_path]       # Read character from SOUL.md
node imagegen.js search <keywords>      # Search for characters
node imagegen.js gen <prompt> [options] # Generate an image
```

## Options for `gen`

| Flag | Description | Default |
|------|-------------|---------|
| `--char <name>` | Character name (auto-resolved to vtoken) | — |
| `--pic <uuid>` | Character picture UUID for reference | — |
| `--size portrait\|landscape\|square\|tall` | Aspect ratio | `portrait` |
| `--style <name>` | Style element, repeatable | — |
| `--ref <uuid>` | Extra reference image UUID, repeatable | — |

## Setup

Add your Neta token to `~/.openclaw/workspace/.env`:
```
NETA_TOKEN=your_token_here
```
