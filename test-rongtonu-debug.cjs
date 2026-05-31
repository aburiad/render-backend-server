/**
 * Quick debug test — 1 user on rongtonu.com to see actual error
 */
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://evzqkhirqqqadulekqwe.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2enFraGlycXFxYWR1bGVrcXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODk0MjcsImV4cCI6MjA5MDg2NTQyN30.8wZUwIOPa68tAyrVGvgBFckZ4gB388lhyvTFWxytBRQ'

;(async () => {
  // Login
  console.log('Logging in testuser1...')
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON },
    body: JSON.stringify({ email: 'testuser1@proshnoshala.com', password: 'test123456' }),
  })
  const authData = await authRes.json()
  if (!authData.access_token) {
    console.error('Login failed:', authData)
    process.exit(1)
  }
  console.log('✅ Logged in\n')

  // Read image
  const imgBuf = fs.readFileSync(path.join(__dirname, 'test-question.jpg'))
  const imgBase64 = `data:image/jpeg;base64,${imgBuf.toString('base64')}`
  console.log(`Image: ${Math.round(imgBuf.length / 1024)}KB\n`)

  // Scan
  console.log('Sending scan request to rongtonu.com...')
  const start = Date.now()
  const res = await fetch('https://rongtonu.com/api/ai/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.access_token}`,
    },
    body: JSON.stringify({ image: imgBase64, questionType: 'mcq' }),
  })
  const elapsed = Date.now() - start

  console.log(`Status: ${res.status} ${res.statusText}`)
  console.log(`Time: ${elapsed}ms`)
  console.log(`Headers:`)
  res.headers.forEach((v, k) => console.log(`  ${k}: ${v}`))
  
  const text = await res.text()
  console.log(`\nRaw response (${text.length} chars):`)
  console.log(text.slice(0, 2000))
})()