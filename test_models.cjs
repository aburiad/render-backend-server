require('dotenv').config()
const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_TWO,
  process.env.GEMINI_API_KEY_THREE,
  process.env.GEMINI_API_KEY_FOUR
].filter(Boolean)

const models = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

(async () => {
  console.log('Keys found:', keys.length)
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}?key=${keys[0]}`
      const r = await fetch(url)
      if (r.ok) {
        const d = await r.json()
        console.log(`✅ ${m} => ${r.status} (displayName: ${d.displayName})`)
      } else {
        const t = await r.text()
        console.log(`❌ ${m} => ${r.status}: ${t.slice(0, 150)}`)
      }
    } catch (e) {
      console.log(`💥 ${m} => ERROR: ${e.message}`)
    }
  }
})()