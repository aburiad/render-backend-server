/**
 * LIVE Concurrent Load Test — 20 Users on rongtonu.com
 * Uses test-question.jpg
 * 
 * Usage:  node test-rongtonu-live.cjs
 */

const fs = require('fs')
const path = require('path')

// ─── Config ───
const SUPABASE_URL = 'https://evzqkhirqqqadulekqwe.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2enFraGlycXFxYWR1bGVrcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODk0MjcsImV4cCI6MjA5MDg2NTQyN30.8wZUwIOPa68tAyrVGvgBFckZ4gB388lhyvTFWxytBRQ'
const LIVE_URL = 'https://www.rongtonu.com'

const TOTAL_USERS = 20
const EMAIL_PREFIX = 'testuser'
const EMAIL_DOMAIN = 'proshnoshala.com'
const PASSWORD = 'test123456'
const LOGIN_DELAY_MS = 1200
const IMAGE_PATH = path.join(__dirname, 'test-question.jpg')

// ─── Helpers ───
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function login(email, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON },
        body: JSON.stringify({ email, password: PASSWORD }),
      })
      const data = await res.json()
      if (data.access_token) return data.access_token
      if (res.status === 429) {
        const wait = attempt * 3000
        console.log(`    ⏳ Rate limited on ${email}, waiting ${wait / 1000}s (attempt ${attempt}/${retries})...`)
        await sleep(wait)
        continue
      }
      throw new Error(`Login failed: ${JSON.stringify(data)}`)
    } catch (e) {
      if (attempt === retries) throw e
      console.log(`    ⚠️ ${email} attempt ${attempt} failed: ${e.message.slice(0, 80)}`)
      await sleep(2000)
    }
  }
  throw new Error(`All retries exhausted for ${email}`)
}

async function scan(token, userNum, imgBase64) {
  const start = Date.now()
  try {
    const res = await fetch(`${LIVE_URL}/api/ai/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ image: imgBase64, questionType: 'mcq' }),
    })
    const elapsed = Date.now() - start
    const data = await res.json()
    return {
      user: userNum,
      status: res.status,
      time: elapsed,
      provider: data.provider || 'unknown',
      questions: data.count || data.questions?.length || 0,
      error: data.error || data.message || (res.status === 402 ? 'insufficient credits' : null),
      creditsCharged: data.creditsCharged || 0,
    }
  } catch (e) {
    return {
      user: userNum,
      status: 0,
      time: Date.now() - start,
      provider: 'error',
      questions: 0,
      error: e.message.slice(0, 120),
      creditsCharged: 0,
    }
  }
}

// ─── Main ───
;(async () => {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🚀 LIVE TEST — 20 CONCURRENT USERS on rongtonu.com`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`   Server:   ${LIVE_URL}`)
  console.log(`   Image:    ${IMAGE_PATH}`)
  console.log(`   Login delay: ${LOGIN_DELAY_MS}ms\n`)

  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`❌ Image not found: ${IMAGE_PATH}`)
    process.exit(1)
  }

  const imgBuf = fs.readFileSync(IMAGE_PATH)
  const imgBase64 = `data:image/jpeg;base64,${imgBuf.toString('base64')}`
  console.log(`   Image size: ${Math.round(imgBuf.length / 1024)}KB\n`)

  // ── Phase 1: Login ──
  console.log(`📋 Phase 1: Logging in ${TOTAL_USERS} users...`)
  const tokens = []
  let loginErrors = 0

  for (let i = 1; i <= TOTAL_USERS; i++) {
    const email = `${EMAIL_PREFIX}${i}@${EMAIL_DOMAIN}`
    try {
      const token = await login(email)
      tokens.push({ num: i, token })
      process.stdout.write(`  ✅ ${String(i).padStart(2)}/${TOTAL_USERS} ${email}\n`)
    } catch (e) {
      console.log(`  ❌ ${String(i).padStart(2)}/${TOTAL_USERS} ${email} — ${e.message.slice(0, 80)}`)
      loginErrors++
    }
    if (i < TOTAL_USERS) await sleep(LOGIN_DELAY_MS)
  }

  console.log(`\n   Logged in: ${tokens.length}/${TOTAL_USERS}${loginErrors ? ` (${loginErrors} failed)` : ''}\n`)

  if (tokens.length === 0) {
    console.error('❌ No users logged in — aborting.')
    return
  }

  // ── Phase 2: Concurrent scans ──
  console.log(`📋 Phase 2: Firing ${tokens.length} concurrent scan requests to rongtonu.com...\n`)
  const overallStart = Date.now()

  const promises = tokens.map(({ num, token }) => scan(token, num, imgBase64))
  const results = await Promise.all(promises)
  const totalElapsed = Date.now() - overallStart

  // ── Phase 3: Results ──
  results.sort((a, b) => a.user - b.user)

  console.log(`\n${'─'.repeat(70)}`)
  console.log(`  USER  STATUS   TIME    PROVIDER     Qs  CRED  ERROR`)
  console.log(`${'─'.repeat(70)}`)

  for (const r of results) {
    const icon = r.status === 200 ? '✅' : '❌'
    const tag = `U${String(r.user).padStart(2, '0')}`
    const timeStr = `${String(r.time).padStart(5)}ms`
    const errStr = r.error ? ` ${String(r.error).slice(0, 40)}` : ''
    console.log(`  ${tag}  ${icon} ${String(r.status).padStart(3)}  ${timeStr}  ${r.provider.padEnd(12)} ${String(r.questions).padStart(2)}   ${String(r.creditsCharged).padStart(2)}  ${errStr}`)
  }

  // Summary
  const success = results.filter(r => r.status === 200)
  const failed = results.filter(r => r.status !== 200)
  const gemini = success.filter(r => r.provider === 'gemini')
  const groq = success.filter(r => r.provider === 'groq')
  const mistral = success.filter(r => r.provider === 'mistral')
  const other = success.filter(r => !['gemini', 'groq', 'mistral'].includes(r.provider))

  const avgTime = Math.round(results.reduce((s, r) => s + r.time, 0) / results.length)
  const sorted = [...results].sort((a, b) => a.time - b.time)
  const p50 = sorted[Math.floor(sorted.length * 0.5)]?.time || 0
  const p90 = sorted[Math.floor(sorted.length * 0.9)]?.time || 0
  const maxTime = Math.max(...results.map(r => r.time))
  const minTime = Math.min(...results.map(r => r.time))

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📊 SUMMARY — ${tokens.length} CONCURRENT USERS (rongtonu.com)`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`Total requests:   ${results.length}`)
  console.log(`Successful:       ${success.length} ✅`)
  console.log(`Failed:           ${failed.length} ❌`)
  console.log(`Total wall time:  ${(totalElapsed / 1000).toFixed(1)}s`)
  console.log(``)
  console.log(`Response times:`)
  console.log(`  Min:    ${minTime}ms`)
  console.log(`  Avg:    ${avgTime}ms`)
  console.log(`  P50:    ${p50}ms`)
  console.log(`  P90:    ${p90}ms`)
  console.log(`  Max:    ${maxTime}ms`)
  console.log(``)
  console.log(`Provider breakdown:`)
  console.log(`  Gemini:   ${gemini.length}/${success.length}`)
  console.log(`  Groq:     ${groq.length}/${success.length}`)
  console.log(`  Mistral:  ${mistral.length}/${success.length}`)
  if (other.length) {
    const others = {}
    other.forEach(r => { others[r.provider] = (others[r.provider] || 0) + 1 })
    Object.entries(others).forEach(([name, count]) => console.log(`  ${name}: ${count}`))
  }
  console.log(``)
  console.log(`Throughput: ${(success.length / (totalElapsed / 1000)).toFixed(1)} scans/sec`)

  if (failed.length > 0) {
    console.log(`\n❌ Failed requests:`)
    const byStatus = {}
    failed.forEach(r => {
      const key = `${r.status}: ${r.error || 'unknown'}`
      byStatus[key] = (byStatus[key] || 0) + 1
    })
    Object.entries(byStatus).forEach(([key, count]) => console.log(`  ${key} (${count}x)`))
  }

  console.log(`\n✅ Done!\n`)
})()