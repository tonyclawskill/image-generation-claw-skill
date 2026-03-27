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

## Example Output

![Generated example](https://oss.talesofai.cn/picture/7cdef033-b8cc-4de8-8ea3-ba743fd5f29e.webp)

---

## About Neta

[Neta](https://www.neta.art/) (by TalesofAI) is an AI image and video generation platform with a powerful open API. It uses a **credit-based system (AP — Action Points)** where each image generation costs a small number of credits. Subscriptions are available for heavier usage.

### Register & Get Token

| Region | Sign up | Get API token |
|--------|---------|---------------|
| Global | [neta.art](https://www.neta.art/) | [neta.art/open](https://www.neta.art/open/) |
| China  | [nieta.art](https://app.nieta.art/) | [nieta.art/security](https://app.nieta.art/security) |

New accounts receive free credits to get started. No credit card required to try.

### Pricing

Neta uses a pay-per-generation credit model. View current plans on the [pricing page](https://www.neta.art/pricing).

- **Free tier:** limited credits on signup — enough to test
- **Subscription:** monthly AP allowance via Stripe
- **Credit packs:** one-time top-up as needed

### Set up your token

```bash
# Step 1 — get your token:
#   Global: https://www.neta.art/open/
#   China:  https://app.nieta.art/security

# Step 2 — set it
export NETA_TOKEN=your_token_here

# Step 3 — run
node imagegenerationclaw.js "your prompt"
```

Or pass it inline:
```bash
node imagegenerationclaw.js "your prompt" --token your_token_here
```

> **API endpoint:** defaults to `api.talesofai.com` (Open Platform tokens).  
> China users: set `NETA_API_BASE_URL=https://api.talesofai.com` to use the China endpoint.

---

## Default prompt

When called with no prompt argument, the skill uses:

> `high quality AI generated image, detailed, professional`

---

## Requirements

- Node.js 18+ (native `fetch` support)
- A valid Neta API token

