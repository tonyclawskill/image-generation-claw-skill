#!/usr/bin/env node
/**
 * imagegen.js — Neta Image Generation helper (zero neta-skills dependency)
 *
 * Commands:
 *   node imagegen.js soul [soul_path]                          → {name, picture_uuid}
 *   node imagegen.js search <keywords>                         → [{uuid, name, type}]
 *   node imagegen.js gen <prompt> [options]                    → {status, url, task_uuid}
 *
 * Options for gen:
 *   --char <name>         Character name (auto-resolved to vtoken)
 *   --pic  <uuid>         Character picture UUID (used as reference)
 *   --ref  <uuid>         Extra reference picture UUID (repeatable)
 *   --size portrait|landscape|square|tall   (default: portrait = 576×768)
 *   --style <name>        Style element, e.g. "manga" (repeatable)
 *
 * Token resolved from: NETA_TOKEN env → ~/.openclaw/workspace/.env → clawhouse .env
 */

import { readFileSync } from 'node:fs';
import { homedir }      from 'node:os';
import { resolve }      from 'node:path';

// ── Config ────────────────────────────────────────────────────────────────────

const BASE = 'https://api.talesofai.cn';

function getToken() {
  if (process.env.NETA_TOKEN) return process.env.NETA_TOKEN;
  const envFiles = [
    resolve(homedir(), '.openclaw/workspace/.env'),
    resolve(homedir(), 'developer/clawhouse/.env'),
  ];
  for (const p of envFiles) {
    try {
      const m = readFileSync(p, 'utf8').match(/NETA_TOKEN=(.+)/);
      if (m) return m[1].trim();
    } catch { /* try next */ }
  }
  throw new Error('NETA_TOKEN not found. Add it to ~/.openclaw/workspace/.env');
}

const HEADERS = {
  'x-token': getToken(),
  'x-platform': 'nieta-app/web',
  'content-type': 'application/json',
};

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: HEADERS,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

const log = msg => process.stderr.write(msg + '\n');
const out = data => console.log(JSON.stringify(data));

// ── Parse argv ────────────────────────────────────────────────────────────────

const [,, cmd, ...rawArgs] = process.argv;

function parseFlags(args) {
  const flags = { _: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      if (flags[key] === undefined) {
        flags[key] = val;
      } else {
        // repeatable flag → array
        flags[key] = [].concat(flags[key], val);
      }
    } else {
      flags._.push(args[i]);
    }
  }
  return flags;
}

// ── Size map ──────────────────────────────────────────────────────────────────

const SIZES = {
  portrait:  { width: 576,  height: 768  },  // 3:4  (default)
  landscape: { width: 1024, height: 576  },  // 16:9
  square:    { width: 768,  height: 768  },  // 1:1
  tall:      { width: 576,  height: 1024 },  // 9:16
};

// ── soul ──────────────────────────────────────────────────────────────────────

if (cmd === 'soul') {
  const candidates = [
    rawArgs[0],
    resolve(homedir(), '.openclaw/workspace/SOUL.md'),
    resolve(homedir(), 'developer/clawhouse/SOUL.md'),
  ].filter(Boolean);

  let content;
  for (const p of candidates) {
    try { content = readFileSync(p, 'utf8'); break; } catch { /* try next */ }
  }
  if (!content) throw new Error('SOUL.md not found. Run adopt first.');

  const name = content
    .match(/名字[^：:\n]*[：:]\s*([^\n*]+)/)?.[1]
    ?.trim()
    ?.replace(/（龙虾化）$/, '')
    ?.replace(/\*+/g, '');

  const picUuid = content
    .match(/\/picture\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/)?.[1];

  if (!name) throw new Error('No 名字 field found in SOUL.md. Run adopt first.');
  out({ name, picture_uuid: picUuid ?? null });
}

// ── search ────────────────────────────────────────────────────────────────────

else if (cmd === 'search') {
  const keywords = rawArgs.join(' ');
  if (!keywords) throw new Error('Usage: imagegen.js search <keywords>');

  const data = await api('GET',
    `/v2/travel/parent-search?keywords=${encodeURIComponent(keywords)}&parent_type=oc&sort_scheme=exact&page_index=0&page_size=10`);

  const results = (data.list ?? []).map(r => ({
    uuid: r.uuid,
    name: r.name,
    type: r.type,
  }));

  out(results);
}

// ── gen ───────────────────────────────────────────────────────────────────────

else if (cmd === 'gen') {
  const flags   = parseFlags(rawArgs);
  const prompt  = flags._.join(' ');
  const charName = flags.char ?? null;
  const picUuid  = flags.pic  ?? null;
  const sizeKey  = flags.size ?? 'portrait';
  const styles   = [].concat(flags.style ?? []);
  const refs     = [].concat(flags.ref   ?? []);

  if (!prompt && !charName) {
    throw new Error('Usage: imagegen.js gen <prompt> [--char name] [--pic uuid] [--size portrait|landscape|square|tall] [--style name] [--ref uuid]');
  }

  const { width, height } = SIZES[sizeKey] ?? SIZES.portrait;

  // 1. Resolve character vtoken
  const vtokens = [];
  let resolvedChar = null;

  if (charName) {
    log(`🔍 Looking up character: ${charName}...`);
    const search = await api('GET',
      `/v2/travel/parent-search?keywords=${encodeURIComponent(charName)}&parent_type=oc&sort_scheme=exact&page_index=0&page_size=1`);
    resolvedChar = search.list?.find(r => r.type === 'oc');
    if (resolvedChar) {
      vtokens.push({
        type: 'oc_vtoken_adaptor',
        uuid: resolvedChar.uuid,
        name: resolvedChar.name,
        value: resolvedChar.uuid,
        weight: 1,
      });
      log(`✅ Character resolved: ${resolvedChar.name}`);
    } else {
      log(`⚠️  Character "${charName}" not found — using freetext fallback`);
    }
  }

  // 2. Style vtokens
  for (const style of styles) {
    vtokens.push({ type: 'freetext', value: `/${style}`, weight: 1 });
  }

  // 3. Reference image vtokens
  for (const ref of refs) {
    vtokens.push({ type: 'freetext', value: `参考图-全图参考-${ref}`, weight: 1 });
  }

  // 4. Freetext prompt (strip @charName if already in vtoken)
  let promptText = prompt;
  if (resolvedChar && promptText) {
    promptText = promptText.replace(new RegExp(`@${charName}[,，\\s]*`, 'g'), '').trim();
  }
  if (promptText) vtokens.push({ type: 'freetext', value: promptText, weight: 1 });

  // 5. Submit
  log(`🎨 Generating image (${width}×${height})...`);
  const taskUuid = await api('POST', '/v3/make_image', {
    storyId: 'DO_NOT_USE',
    jobType: 'universal',
    rawPrompt: vtokens,
    width,
    height,
    meta: { entrance: 'PICTURE' },
    ...(picUuid ? { inherit_params: { picture_uuid: picUuid } } : {}),
  });

  const task_uuid = typeof taskUuid === 'string' ? taskUuid : taskUuid?.task_uuid;
  log(`⏳ Task submitted: ${task_uuid}`);

  // 6. Poll (max 3 min)
  let warnedSlow = false;
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 2000));
    if (!warnedSlow && i >= 14) {
      log('⏳ Still rendering, hang tight...');
      warnedSlow = true;
    }
    const result = await api('GET', `/v1/artifact/task/${task_uuid}`);
    if (result.task_status !== 'PENDING' && result.task_status !== 'MODERATION') {
      out({
        status: result.task_status,
        url:    result.artifacts?.[0]?.url ?? null,
        task_uuid,
        width,
        height,
      });
      process.exit(0);
    }
  }

  out({ status: 'TIMEOUT', url: null, task_uuid, width, height });
}

else {
  process.stderr.write([
    'Usage:',
    '  node imagegen.js soul [soul_path]',
    '  node imagegen.js search <keywords>',
    '  node imagegen.js gen <prompt> [--char name] [--pic uuid] [--size portrait|landscape|square|tall] [--style name] [--ref uuid]',
  ].join('\n') + '\n');
  process.exit(1);
}
