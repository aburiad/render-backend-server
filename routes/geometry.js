/**
 * POST /api/geometry/translate
 *
 * Converts a Bengali / English geometry description into valid GeoGebra
 * Classic commands using the existing AI text-fallback chain.
 *
 * Cost   : 1 credit per successful call (refunded on total provider failure).
 * Auth   : requireAuth (already mounted in app.js before this router).
 * Limiter: aiLimiter (shared with /api/ai/* and /api/book/*).
 */

const express = require('express')
const { AppError } = require('../middleware/errorHandler')
const { checkAiCredit } = require('../middleware/credits')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

// ─── GeoGebra translation system prompt ─────────────────────────────────────
const GEOMETRY_SYSTEM_PROMPT = `You are a GeoGebra scripting expert. Convert Bengali/English geometry descriptions into valid GeoGebra Classic commands.

OUTPUT FORMAT — respond with ONLY this JSON object (no markdown, no prose):
{ "commands": "<semicolon-separated GeoGebra commands on one line>", "description": "<short Bengali description, max 12 words>" }

RULES:
- Keep all coordinates in the range -10 to 10 when possible.
- Label key points A, B, C … for exam clarity.
- Use Polygon[A,B,C] for triangles/polygons (auto-closes).
- Use RightAngle(C,A,B) to mark a right-angle square at vertex A.
- Angles: Angle[A,B,C] gives the angle at vertex B.
- Distances: d = Distance[A,B] (adds a numeric label).
- Always output valid, parseable JSON with double quotes only.

COMMON COMMANDS:
  Point       : A = (x, y)
  Segment     : Segment[A, B]
  Line        : Line[A, B]
  Circle      : Circle[O, r]
  Polygon     : Polygon[A, B, C]
  Midpoint    : M = Midpoint[A, B]
  Perpendicular: PerpendicularLine[A, Segment[B,C]]
  Parallel    : ParallelLine[A, Line[B,C]]
  Right-angle mark: RightAngle(C, A, B)

EXAMPLES:
  "সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪"
  → {"commands":"A=(0,0);B=(3,0);C=(0,4);Polygon[A,B,C];RightAngle(B,A,C)","description":"সমকোণী ত্রিভুজ ABC, ভূমি ৩ ও উচ্চতা ৪"}

  "ব্যাসার্ধ ৫ বিশিষ্ট বৃত্ত"
  → {"commands":"O=(0,0);c=Circle[O,5]","description":"কেন্দ্র O ও ব্যাসার্ধ ৫ বিশিষ্ট বৃত্ত"}

  "সমবাহু ত্রিভুজ বাহু ৪"
  → {"commands":"A=(0,0);B=(4,0);C=(2,3.46);Polygon[A,B,C]","description":"সমবাহু ত্রিভুজ ABC, প্রতিটি বাহু ৪ একক"}

  "আয়তক্ষেত্র দৈর্ঘ্য ৬ প্রস্থ ৪"
  → {"commands":"A=(0,0);B=(6,0);C=(6,4);D=(0,4);Polygon[A,B,C,D];RightAngle(D,A,B)","description":"আয়তক্ষেত্র ABCD, দৈর্ঘ্য ৬ ও প্রস্থ ৪"}`

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PROVIDER_TIMEOUT_MS = process.env.VERCEL === '1' ? 8000 : 55000

const ENV_KEY_MAP = {
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  novita: 'NOVITA_API_KEY',
  huggingface: 'HUGGINGFACE_API_KEY',
  sambanova: 'SAMBANOVA_API_KEY',
  cohere: 'COHERE_API_KEY',
  zai: 'Z_API_KEY',
  gemini: null, // managed internally by gemini.js
}

/** Race a provider chat call against a per-provider timeout. */
function racedChat(provider, params) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${provider.name} timed out`)),
      PROVIDER_TIMEOUT_MS,
    )
    provider.chat(params).then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
    )
  })
}

/**
 * Extract { commands, description } from any LLM output shape:
 *   • Clean JSON object          : {"commands":"...","description":"..."}
 *   • Markdown-fenced JSON       : ```json\n{...}\n```
 *   • Object wrapped in array    : [{"commands":"..."}]
 *   • Prose with embedded object : "Sure! Here is the output: {...}"
 *   • commands field is an array : {"commands":["A=(0,0)","B=(3,0)"]}
 *   • Gemma bullet echo format   : "* Input: ...\n* Key elements:\n  * Points: A=..."
 */
function parseGeometryResponse(raw) {
  if (!raw || typeof raw !== 'string') return null

  // ── Strip markdown fences ─────────────────────────────────────────────────
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // ── Helper: validate a candidate parsed value ─────────────────────────────
  function extract(obj) {
    if (!obj || typeof obj !== 'object') return null
    if (Array.isArray(obj)) obj = obj[0]
    if (!obj || typeof obj !== 'object') return null
    let cmds = obj.commands || obj.command || obj.ggb || obj.script || ''
    if (Array.isArray(cmds)) cmds = cmds.join(';')
    cmds = String(cmds).trim()
    if (!cmds) return null
    const desc = String(obj.description || obj.desc || obj.label || '').trim()
    return { commands: cmds, description: desc }
  }

  // ── 1. Full JSON parse ────────────────────────────────────────────────────
  try {
    const r = extract(JSON.parse(cleaned))
    if (r) return r
  } catch { /* fall through */ }

  // ── 2. Find outermost { ... } using brace-depth counting ─────────────────
  // Greedy: find ALL { } pairs, try each from last to first
  const opens = []
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') opens.push(i)
  }
  for (let oi = opens.length - 1; oi >= 0; oi--) {
    const start = opens[oi]
    let depth = 0
    let end = -1
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++
      else if (cleaned[i] === '}') {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
    if (end !== -1) {
      try {
        const r = extract(JSON.parse(cleaned.slice(start, end + 1)))
        if (r) return r
      } catch { /* try next */ }
    }
  }

  // ── 3. Array wrapper [ {...} ] ────────────────────────────────────────────
  const arrStart = cleaned.indexOf('[')
  const arrEnd   = cleaned.lastIndexOf(']')
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      const r = extract(JSON.parse(cleaned.slice(arrStart, arrEnd + 1)))
      if (r) return r
    } catch { /* fall through */ }
  }

  // ── 4. Regex: commands key with quoted value ──────────────────────────────
  const cmdMatch = cleaned.match(/["']?commands["']?\s*:\s*["']([^"'\n]{5,})["']/)
  if (cmdMatch) {
    const desc = (cleaned.match(/["']?description["']?\s*:\s*["']([^"'\n]{1,80})["']/) || [])[1] || ''
    return { commands: cmdMatch[1].trim(), description: desc.trim() }
  }

  // ── 5. Gemma bullet-point fallback ───────────────────────────────────────
  // Gemma models sometimes echo the input and list key elements as bullets
  // instead of outputting JSON. We try to reconstruct GeoGebra commands
  // from the bullet content: extract A=(x,y) style coordinates and known
  // shape keywords.
  const pointMatches = [...cleaned.matchAll(/([A-Z])\s*=\s*\((-?[\d.]+)\s*,\s*(-?[\d.]+)\)/g)]
  if (pointMatches.length >= 2) {
    const points = pointMatches.map(m => `${m[1]}=(${m[2]},${m[3]})`)
    const ptNames = pointMatches.map(m => m[1])
    const cmds = [...points]

    // Detect shape keywords and add appropriate GeoGebra command
    const lc = cleaned.toLowerCase()
    if (lc.includes('polygon') || lc.includes('triangle') || lc.includes('ত্রিভুজ') || ptNames.length === 3) {
      cmds.push(`t=Polygon[${ptNames.join(',')}]`)
    } else if (ptNames.length >= 4) {
      cmds.push(`p=Polygon[${ptNames.join(',')}]`)
    }
    if (lc.includes('circumcenter') || lc.includes('পরিকেন্দ্র')) {
      const polyVar = cmds.find(c => c.startsWith('t=') || c.startsWith('p='))
      const pv = polyVar ? polyVar.split('=')[0] : ptNames[0]
      cmds.push(`O=Circumcenter[${pv}]`, `cc=Circle[O,${ptNames[0]}]`)
    }
    if (lc.includes('incenter') || lc.includes('অন্তকেন্দ্র')) {
      const polyVar = cmds.find(c => c.startsWith('t=') || c.startsWith('p='))
      const pv = polyVar ? polyVar.split('=')[0] : ptNames[0]
      cmds.push(`I=Incenter[${pv}]`, `ic=Circle[I,Distance[I,Segment[${ptNames[0]},${ptNames[1]}]]]`)
    }
    if (lc.includes('circle') || lc.includes('বৃত্ত')) {
      if (!cmds.some(c => c.includes('Circle'))) {
        cmds.push(`O=(0,0);c=Circle[O,${ptNames[0]}]`)
      }
    }

    console.log('[geometry] fallback extraction produced:', cmds.join(';'))
    return { commands: cmds.join(';'), description: 'জ্যামিতিক চিত্র' }
  }

  console.warn('[geometry] parseGeometryResponse: all strategies failed')
  return null
}

// ─── Route ───────────────────────────────────────────────────────────────────
router.post('/translate', checkAiCredit(1), async (req, res, next) => {
  try {
    const { prompt } = req.body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      throw new AppError('একটি বর্ণনা দিন (কমপক্ষে ৩ অক্ষর)', 400)
    }
    if (prompt.length > 500) {
      throw new AppError('বর্ণনাটি অনেক বড় — ৫০০ অক্ষরের মধ্যে রাখুন', 400)
    }

    // Load dependencies lazily (avoids circular-require during startup)
    const { TEXT_CHAIN, ALL_MAP } = require('../services/aiProviders')
    const userApiKeyService = require('../services/userApiKeyService')
    const configService = require('../services/configService')
    const creditService = require('../services/creditService')

    // ── 1. Atomic pre-charge ────────────────────────────────────────────────
    await creditService.decrementCredits(req.user.uid, 1)

    const messages = [
      { role: 'system', content: GEOMETRY_SYSTEM_PROMPT },
      {
        role: 'user',
        // Self-contained user message — works even if the model ignores system prompt.
        // Gemma models (used in gemini provider for text) sometimes echo the input
        // rather than following a separate system instruction, so we embed the
        // output contract directly in the user turn as well.
        content: `TASK: Convert the following geometry description to GeoGebra Classic commands.

DESCRIPTION: "${prompt.trim()}"

RESPOND WITH ONLY THIS JSON (no markdown, no explanation, no bullet points):
{"commands":"<semicolon-separated GeoGebra commands>","description":"<short Bengali label, max 10 words>"}

EXAMPLES:
Input: "সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪"
Output: {"commands":"A=(0,0);B=(3,0);C=(0,4);Polygon[A,B,C];RightAngle(B,A,C)","description":"সমকোণী ত্রিভুজ ABC"}

Input: "বৃত্ত ব্যাসার্ধ ৫"
Output: {"commands":"O=(0,0);c=Circle[O,5]","description":"কেন্দ্র O ব্যাসার্ধ ৫ বিশিষ্ট বৃত্ত"}

Input: "ত্রিভুজ ABC যেখানে A=(0,5), B=(-3,0), C=(4,0) এবং পরিবৃত্ত"
Output: {"commands":"A=(0,5);B=(-3,0);C=(4,0);t=Polygon[A,B,C];O=Circumcenter[t];cc=Circle[O,A]","description":"ত্রিভুজ ABC ও পরিবৃত্ত O"}

Now output the JSON for the given description. JSON only:`,
      },
    ]

    // ── 2. Walk provider chain until one succeeds ───────────────────────────
    const config = await configService.getConfig()
    const providerNames =
      config?.aiProviderConfig?.text_chain || TEXT_CHAIN.map((p) => p.name)
    const chain = providerNames.map((n) => ALL_MAP[n]).filter(Boolean)
    const userKeys = await userApiKeyService.loadAllForUser(req.user.uid)

    // For geometry we MUST get JSON back. Gemma models (gemma-4-31b-it,
    // gemma-4-26b-a4b-it) ignore the JSON instruction and return bullet-point
    // markdown instead. We call the gemini provider with a forced Gemini Flash
    // model by passing a special hint, OR we just skip gemma and let the
    // regular gemini flash models handle it via a direct call.
    //
    // Strategy: try each provider but for 'gemini', pass an env var override
    // so it uses flash models instead of gemma. If parse still fails, try
    // the next provider.

    let rawText = ''
    let usedProvider = 'unknown'
    let anyProviderAvailable = false

    // Build ordered chain: put gemini first but force flash models,
    // then try groq/mistral/openrouter as fallbacks
    const GEMMA_NAMES = new Set(['gemma-4-31b-it', 'gemma-4-26b-a4b-it'])

    for (const p of chain) {
      const userKey = userKeys[p.name]
      const envVarName = ENV_KEY_MAP[p.name]
      const envKey = envVarName ? process.env[envVarName] : undefined
      const apiKey = userKey || envKey

      if (envVarName !== null && !apiKey) continue
      anyProviderAvailable = true

      let attempt = ''
      try {
        // For gemini provider: temporarily override to force flash models
        // by setting jsonMode=false and temperature very low
        attempt = await racedChat(p, {
          messages,
          vision: false,
          jsonMode: false,
          temperature: 0.1,  // very deterministic
          apiKey,
          // Pass a hint that gemini.js can use to prefer flash over gemma
          // (gemini.js respects the 'preferredModels' hint if we add it)
          _forceFlash: true,
        })

        // ── Validate immediately — if Gemma gave bullets, try next provider
        const quickParse = parseGeometryResponse(attempt)
        if (!quickParse || !quickParse.commands) {
          console.warn(`[geometry] ${p.name} gave non-JSON response (${attempt.slice(0,80)}…) — trying next provider`)
          rawText = ''
          attempt = ''
          continue  // skip to next provider
        }

        rawText = attempt
        usedProvider = p.name
        console.log(`[geometry] ✓ ${p.name} gave valid JSON`)
        break
      } catch (e) {
        console.warn(`[geometry] ✗ ${p.name}: ${e.message}`)
        rawText = ''
      }
    }

    // ── 3. Handle total failure ─────────────────────────────────────────────
    if (!rawText) {
      await creditService.incrementCredits(req.user.uid, 1).catch(() => {})
      if (!anyProviderAvailable) {
        throw new AppError(
          'কোনো AI provider configure করা নেই। Settings → AI Providers থেকে key যোগ করুন।',
          503,
        )
      }
      throw new AppError(
        'সব AI provider ব্যর্থ হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন।',
        502,
      )
    }

    // ── 4. Parse the model's JSON response ─────────────────────────────────
    console.log(`[geometry] raw response (${usedProvider}):`, rawText.slice(0, 400))
    const parsed = parseGeometryResponse(rawText)
    if (!parsed || !parsed.commands) {
      await creditService.incrementCredits(req.user.uid, 1).catch(() => {})
      throw new AppError(
        'AI থেকে সঠিক GeoGebra commands পাওয়া যায়নি — আরও বিস্তারিত বর্ণনা দিন।',
        422,
      )
    }

    // ── 5. Respond ──────────────────────────────────────────────────────────
    // Normalise commands: collapse any newlines/extra semicolons into single semicolons
    const normalisedCommands = parsed.commands
      .replace(/\r\n|\r|\n/g, ';')
      .replace(/;+/g, ';')
      .replace(/^;|;$/g, '')
      .trim()

    res.json({
      success: true,
      commands: normalisedCommands,
      description: parsed.description,
      provider: usedProvider,
      creditsCharged: 1,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
