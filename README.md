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

## About Neta

[Neta](https://www.neta.art/) (by TalesofAI) is an AI image and video generation platform with a powerful open API. It uses a **credit-based system (AP — Action Points)** where each image generation costs a small number of credits. Subscriptions are available for heavier usage.

### Register

| Region | Sign up | Get token |
|--------|---------|-----------|
| Global | [neta.art](https://www.neta.art/) | [Open Portal → API Token](https://www.neta.art/open/) |
| China  | [nieta.art](https://app.nieta.art/) | [Security Settings](https://app.nieta.art/security) |

New accounts receive free credits to get started.

### Pricing

Neta uses a pay-per-generation credit model. View current plans and credit packages on the [pricing page](https://www.neta.art/pricing).

- Free tier: limited credits on signup
- Subscription: monthly AP allowance via Stripe
- One-time packs: top up credits as needed

### Get your API token

1. Sign in at [neta.art/open](https://www.neta.art/open/) (global) or [nieta.art/security](https://app.nieta.art/security) (China)
2. Generate a new API token
3. Set it as `NETA_TOKEN` in your environment or pass via `--token`

```bash
export NETA_TOKEN=your_token_here
node imagegenerationclaw.js "your prompt"

# or inline
node imagegenerationclaw.js "your prompt" --token your_token_here
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

Built with [Claude Code](https://claude.ai/claude-code) · Powered by [Neta](https://www.neta.art/) · [API Docs](https://www.neta.art/open/)