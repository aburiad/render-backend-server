require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const { supabaseAdmin } = require('../config/supabase');

(async () => {
  const { data, count, error } = await supabaseAdmin
    .from('vault_questions')
    .select('*', { count: 'exact' })
    .eq('class_num', 7)
    .eq('chapter_id', 'ch-11')

  if (error) {
    console.log('ERROR:', error.message)
    process.exit(1)
  }

  console.log('✅ Total ch-11 rows:', count)
  
  if (data && data.length > 0) {
    const mcq = data.find(d => d.question_type === 'mcq')
    const cq = data.find(d => d.question_type === 'cq')
    const saq = data.find(d => d.question_type === 'saq')
    
    console.log('\n📋 Sample MCQ:', JSON.stringify(mcq?.question_data, null, 2))
    console.log('\n📋 Sample CQ:', JSON.stringify(cq?.question_data, null, 2))
    console.log('\n📋 Sample SAQ:', JSON.stringify(saq?.question_data, null, 2))
  } else {
    console.log('❌ NO DATA FOUND!')
  }
  
  process.exit(0)
})()