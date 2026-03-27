#!/usr/bin/env node

// --- CLI parsing ---
const args = process.argv.slice(2);
let prompt = null;
let size = "portrait";
let token = null;
let ref = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--size" && args[i + 1]) { size = args[++i]; }
  else if (args[i] === "--token" && args[i + 1]) { token = args[++i]; }
  else if (args[i] === "--ref" && args[i + 1]) { ref = args[++i]; }
  else if (!args[i].startsWith("--") && prompt === null) { prompt = args[i]; }
}

if (!prompt) {
  prompt = "high quality AI generated image, detailed, professional";
}

// --- Token resolution ---
function resolveToken() { return tokenFlag; }

const TOKEN = resolveToken();
if (!TOKEN) {
  console.error('\n✗ Token required. Pass via: --token YOUR_TOKEN');
console.error('  Get yours at: https://www.neta.art/open/');
  console.error('  Global: sign up at https://www.neta.art/ → get token at https://www.neta.art/open/');
  console.error('  China:  sign up at https://app.nieta.art/ → get token at https://app.nieta.art/security');
  console.error('  Then:   export NETA_TOKEN=your_token_here');
  process.exit(1);
}

// --- Size map ---
const SIZES = {
  square:    { width: 1024, height: 1024 },
  portrait:  { width: 832,  height: 1216 },
  landscape: { width: 1216, height: 832  },
  tall:      { width: 704,  height: 1408 },
};

const { width, height } = SIZES[size] ?? SIZES.portrait;

// --- Shared headers ---
const HEADERS = {
  "x-token": TOKEN,
  "x-platform": "nieta-app/web",
  "content-type": "application/json",
};

// --- Build request body ---
const body = {
  storyId: "DO_NOT_USE",
  jobType: "universal",
  rawPrompt: [{ type: "freetext", value: prompt, weight: 1 }],
  width,
  height,
  meta: { entrance: "PICTURE,CLI" },
  context_model_series: "8_image_edit",
};

if (ref) {
  body.inherit_params = { collection_uuid: ref, picture_uuid: ref };
}

// --- Submit image generation task ---
const makeRes = await fetch(`https://api.talesofai.com/v3/make_image`, {
  method: "POST",
  headers: HEADERS,
  body: JSON.stringify(body),
});

if (!makeRes.ok) {
  console.error(`Error: make_image returned ${makeRes.status} ${makeRes.statusText}`);
  process.exit(1);
}

const makeData = await makeRes.text();
let task_uuid;
try {
  const parsed = JSON.parse(makeData);
  task_uuid = parsed.task_uuid ?? parsed;
} catch {
  task_uuid = makeData.trim();
}

if (!task_uuid || typeof task_uuid !== "string") {
  console.error("Error: could not extract task_uuid from response:", makeData);
  process.exit(1);
}

// --- Poll for result ---
const MAX_ATTEMPTS = 90;
const POLL_INTERVAL_MS = 2000;

for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
  await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

  const pollRes = await fetch(
    `https://api.talesofai.com/v1/artifact/task/${task_uuid}`,
    { headers: HEADERS }
  );

  if (!pollRes.ok) {
    console.error(`Poll error: ${pollRes.status} ${pollRes.statusText}`);
    process.exit(1);
  }

  const pollData = await pollRes.json();
  const status = pollData.task_status;

  if (status === "PENDING" || status === "MODERATION") {
    continue; // still running
  }

  // Done — extract image URL
  const url =
    pollData.artifacts?.[0]?.url ??
    pollData.result_image_url;

  if (!url) {
    console.error("Error: task finished but no image URL found:", JSON.stringify(pollData));
    process.exit(1);
  }

  console.log(url);
  process.exit(0);
}

console.error("Error: timed out waiting for image generation after 90 attempts.");
process.exit(1);
