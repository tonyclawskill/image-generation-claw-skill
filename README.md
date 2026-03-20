# Image Generation Skill

Generate stunning AI images from a text description in seconds. Powered by the Neta talesofai API, this skill returns a direct image URL ready to embed or download.

---

## Install

**Via npx skills:**
```bash
npx skills add tonyclawskill/image-generation-claw-skill
```

**Via ClawHub:**
```bash
clawhub install image-generation-claw-skill
```

---

## Usage

```bash
# Basic — uses default prompt
node imagegenerationclaw.js

# Custom prompt
node imagegenerationclaw.js "a futuristic city at sunset"

# With size and style options
node imagegenerationclaw.js "a futuristic city at sunset" --size landscape

# Using a reference image (picture UUID)
node imagegenerationclaw.js "same scene, winter version" --ref <picture_uuid>

# Pass token inline
node imagegenerationclaw.js "portrait of a samurai" --token YOUR_NETA_TOKEN
```

The script prints a single image URL to stdout on success.

---

## Options

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--size` | `portrait`, `landscape`, `square`, `tall` | `portrait` | Output image dimensions |
| `--token` | string | — | Neta API token (overrides env/file) |
| `--ref` | picture UUID | — | Reference image for style inheritance |

### Size dimensions

| Name | Width | Height |
|------|-------|--------|
| `square` | 1024 | 1024 |
| `portrait` | 832 | 1216 |
| `landscape` | 1216 | 832 |
| `tall` | 704 | 1408 |

---

## Token Setup

The skill resolves your `NETA_TOKEN` in this order:

1. `--token` CLI flag
2. `NETA_TOKEN` environment variable
3. `~/.openclaw/workspace/.env` (line matching `NETA_TOKEN=...`)
4. `~/developer/clawhouse/.env` (line matching `NETA_TOKEN=...`)

**Recommended — add to your shell profile:**
```bash
export NETA_TOKEN=your_token_here
```

**Or add to `~/.openclaw/workspace/.env`:**
```
NETA_TOKEN=your_token_here
```

---

## Default prompt

When called with no prompt argument, the skill uses:

> `high quality AI generated image, detailed, professional`

---

## Requirements

- Node.js 18+ (native `fetch` support)
- A valid Neta API token

---

Built with Claude Code · Powered by Neta

## Example Output

```bash
node imagegenerationclaw.js "high quality AI generated image, detailed, professional"
```

![Example output](https://oss.talesofai.cn/picture/7cdef033-b8cc-4de8-8ea3-ba743fd5f29e.webp)

> Prompt: *"high quality AI generated image, detailed, professional"*
