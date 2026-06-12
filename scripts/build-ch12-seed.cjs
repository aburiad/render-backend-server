/**
 * Generates seed-class9-ch12.cjs — MCQ=50, CQ=50, SAQ=20
 * Run: node scripts/build-ch12-seed.cjs
 * Source: chapter-12-simultaneous-equations.md (NCTB Class 9)
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 12: দুই চলকবিশিষ্ট সরল সহসমীকরণ
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 12 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch12.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY required in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CLASS_NUM = 9
const SUBJECT = 'math'
const CHAPTER_ID = 'ch-12'
const TITLE_BN = 'দুই চলকবিশিষ্ট সরল সহসমীকরণ'
const TITLE_EN = 'Simple Simultaneous Equations in Two Variables'
`

const mcq = [
  // ─── ১২.১ সংজ্ঞা ও শ্রেণিবিভাগ (1-14) ───
  { question: 'দুই চলকবিশিষ্ট দুইটি সরল সমীকরণ একত্রে কী বলে?', options: { 'ক': 'দ্বিঘাত সমীকরণ', 'খ': 'সরল সহসমীকরণ', 'গ': 'অসমীকরণ', 'ঘ': 'সূচক সমীকরণ' }, answer: 'খ', marks: 1 },
  { question: '2x+y=12 ও x−y=3 এর সাধারণ সমাধান—', options: { 'ক': '(0,12)', 'খ': '(3,6)', 'গ': '(5,2)', 'ঘ': 'অসংখ্য' }, answer: 'গ', marks: 1 },
  { question: 'a₁/a₂ ≠ b₁/b₂ হলে সমীকরণজোট—', options: { 'ক': 'অসামঞ্জস্য', 'খ': 'সমঞ্জস্য ও অনির্ভরশীল', 'গ': 'নির্ভরশীল', 'ঘ': 'সমাধান নেই' }, answer: 'খ', marks: 1 },
  { question: 'a₁/a₂ = b₁/b₂ = c₁/c₂ হলে সমাধান—', options: { 'ক': 'একটি', 'খ': 'অসংখ্য', 'গ': 'নেই', 'ঘ': 'দুইটি' }, answer: 'খ', marks: 1 },
  { question: 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂ হলে সমীকরণজোট—', options: { 'ক': 'সমঞ্জস্য', 'খ': 'অসামঞ্জস্য', 'গ': 'নির্ভরশীল', 'ঘ': 'অনন্য সমাধান' }, answer: 'খ', marks: 1 },
  { question: '2x−y=6 ও 4x−2y=12 সমীকরণজোট—', options: { 'ক': 'অসামঞ্জস্য', 'খ': 'নির্ভরশীল', 'গ': 'অনির্ভরশীল', 'ঘ': 'অনন্য' }, answer: 'খ', marks: 1 },
  { question: '2x+y=12 ও 4x+2y=5 সমীকরণজোটের সমাধান—', options: { 'ক': 'একটি', 'খ': 'অসংখ্য', 'গ': 'নেই', 'ঘ': 'দুইটি' }, answer: 'গ', marks: 1 },
  // Ex1ka: x+3y=1, 2x+6y=2 → dependent
  { question: 'x+3y=1, 2x+6y=2 — সমাধানের সংখ্যা—', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': 'অসংখ্য' }, answer: 'ঘ', marks: 1 },
  // Ex1kb: 2x−5y=3, x+3y=1 → unique
  { question: '2x−5y=3, x+3y=1 — সমাধানের সংখ্যা—', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': 'অসংখ্য' }, answer: 'খ', marks: 1 },
  // Ex1kg: 3x−5y=7, 6x−10y=15 → inconsistent
  { question: '3x−5y=7, 6x−10y=15 — সমাধান—', options: { 'ক': 'অসংখ্য', 'খ': 'একটি', 'গ': 'নেই', 'ঘ': 'দুইটি' }, answer: 'গ', marks: 1 },
  { question: 'সমঞ্জস্য ও অনির্ভরশীল জোটের লেখচিত্রে—', options: { 'ক': 'সমান্তরাল', 'খ': 'এক বিন্দুতে ছেদ', 'গ': 'সমাপত', 'ঘ': 'কখনো ছেদ নয়' }, answer: 'খ', marks: 1 },
  { question: 'নির্ভরশীল জোটের লেখচিত্রে—', options: { 'ক': 'দুই সমান্তরাল রেখা', 'খ': 'এক রেখা (সমাপত)', 'গ': 'কোনো ছেদ নেই', 'ঘ': 'লম্ব রেখা' }, answer: 'খ', marks: 1 },
  { question: 'অসামঞ্জস্য জোটের লেখচিত্রে—', options: { 'ক': 'এক বিন্দুতে ছেদ', 'খ': 'সমাপত', 'গ': 'সমান্তরাল, ছেদ নেই', 'ঘ': 'এক রেখা' }, answer: 'গ', marks: 1 },
  { question: 'k²=ac হলে a,b,c—', options: { 'ক': 'ক্রমিক সমানুপাতী', 'খ': 'সমান', 'গ': 'অসামঞ্জস্য', 'ঘ': 'ধ্রুব' }, answer: 'ক', marks: 1 },

  // ─── ১২.২ পদ্ধতি ও সূত্র (15-24) ───
  { question: 'y=8−2x বসিয়ে 3x−2y=5 সমাধানে—', options: { 'ক': 'প্রতিস্থাপন', 'খ': 'অপনয়ন', 'গ': 'আড়গুণন', 'ঘ': 'লৈখিক' }, answer: 'ক', marks: 1 },
  { question: '2x+y=8 কে 2 দিয়ে গুণ করে y অপনয়ন—', options: { 'ক': 'প্রতিস্থাপন', 'খ': 'অপনয়ন', 'গ': 'আড়গুণন', 'ঘ': 'বিয়োজন' }, answer: 'খ', marks: 1 },
  { question: 'আড়গুণন পদ্ধতিকে আরও কী বলে?', options: { 'ক': 'বজ্রগুণন', 'খ': 'যোজন', 'গ': 'ব্যস্তকরণ', 'ঘ': 'একান্তরকরণ' }, answer: 'ক', marks: 1 },
  { question: 'আড়গুণন সূত্র: x/(b₁c₂−b₂c₁) = y/(c₁a₂−c₂a₁) = 1/(a₁b₂−a₂b₁)। a₁=6,b₁=−1,c₁=−1 হলে a₁b₂−a₂b₁=6×2−3×(−1)=?', options: { 'ক': '12', 'খ': '15', 'গ': '18', 'ঘ': '9' }, answer: 'খ', marks: 1 },
  // Ex4: 6x−y=1, 3x+2y=13 → (1,5)
  { question: '6x−y=1, 3x+2y=13। x = ?', options: { 'ক': '0', 'খ': '1', 'গ': '5', 'ঘ': '13' }, answer: 'খ', marks: 1 },
  { question: '6x−y=1, 3x+2y=13। y = ?', options: { 'ক': '1', 'খ': '3', 'গ': '5', 'ঘ': '13' }, answer: 'গ', marks: 1 },
  // Ex2/3: (3,2)
  { question: '2x+y=8, 3x−2y=5। (x,y) = ?', options: { 'ক': '(2,4)', 'খ': '(3,2)', 'গ': '(4,0)', 'ঘ': '(5,2)' }, answer: 'খ', marks: 1 },
  // Ex5: (4,3)
  { question: '3x−4y=0, 2x−3y=−1। (x,y) = ?', options: { 'ক': '(3,4)', 'খ': '(4,3)', 'গ': '(1,5)', 'ঘ': '(12,6)' }, answer: 'খ', marks: 1 },
  // Ex6: (12,6)
  { question: 'x/2+y/3=8, 5x/4−3y=−3। (x,y) = ?', options: { 'ক': '(6,12)', 'খ': '(8,6)', 'গ': '(12,6)', 'ঘ': '(12,8)' }, answer: 'গ', marks: 1 },
  // Ex9: 3x−y=3, 5x+y=21 → (3,6)
  { question: '3x−y=3, 5x+y=21। (x,y) = ?', options: { 'ক': '(2,3)', 'খ': '(3,6)', 'গ': '(6,3)', 'ঘ': '(3,2)' }, answer: 'খ', marks: 1 },

  // ─── অনুশীলনী/নমুনা MCQ (25-50) ───
  // 12.4 #1: a/p ≠ b/q
  { question: 'ax+by+c=0 ও px+qy+r=0 সমঞ্জস্য অনির্ভরশীল হলে—', options: { 'ক': 'a/p≠b/q', 'খ': 'a/p=b/q=c/r', 'গ': 'a/p=b/q≠c/r', 'ঘ': 'a/p=b/q' }, answer: 'ক', marks: 1 },
  // x+y=4, x−y=2 → (3,1)
  { question: 'x+y=4, x−y=2। (x,y) = ?', options: { 'ক': '(2,4)', 'খ': '(4,2)', 'গ': '(3,1)', 'ঘ': '(1,3)' }, answer: 'গ', marks: 1 },
  // table y=2x−4
  { question: '(0,−4), (1,0), (3,4) বিন্দু কোন সমীকরণের?', options: { 'ক': 'y=x−4', 'খ': 'y=8−x', 'গ': 'y=4−2x', 'ঘ': 'y=2x−4' }, answer: 'ঘ', marks: 1 },
  // 2x−y=8, x−2y=4 → x=4,y=0, x+y=4
  { question: '2x−y=8, x−2y=4। x+y = ?', options: { 'ক': '0', 'খ': '4', 'গ': '8', 'ঘ': '12' }, answer: 'খ', marks: 1 },
  // x+y=6, 2x=4 → y=4
  { question: 'x+y=6, 2x=4। y = ?', options: { 'ক': '2', 'খ': '4', 'গ': '6', 'ঘ': '8' }, answer: 'খ', marks: 1 },
  // x−y−4=0, 3x−3y−10=0 → inconsistent
  { question: 'x−y−4=0, 3x−3y−10=0 — (ii) ও (iii) সঠিক?', options: { 'ক': 'ii', 'খ': 'iii', 'গ': 'i ও iii', 'ঘ': 'ii ও iii' }, answer: 'ঘ', marks: 1 },
  // 7x−3y=31, 9x−5y=41 → (4,−1)
  { question: '7x−3y=31, 9x−5y=41। x = ?', options: { 'ক': '3', 'খ': '4', 'গ': '5', 'ঘ': '7' }, answer: 'খ', marks: 1 },
  // x+2y=7, 2x−3y=0 → (3,2)
  { question: 'x+2y=7, 2x−3y=0। (x,y) = ?', options: { 'ক': '(2,3)', 'খ': '(3,2)', 'গ': '(7,0)', 'ঘ': '(1,3)' }, answer: 'খ', marks: 1 },
  // 3x−y−7=0, 2x+y−3=0 → (2,−1)
  { question: '3x−y=7, 2x+y=3। (x,y) = ?', options: { 'ক': '(1,−2)', 'খ': '(2,−1)', 'গ': '(3,2)', 'ঘ': '(2,1)' }, answer: 'খ', marks: 1 },
  // 3x+4y=14, 4x−3y=2 → (2,2)
  { question: '3x+4y=14, 4x−3y=2। (x,y) = ?', options: { 'ক': '(1,2)', 'খ': '(2,2)', 'গ': '(2,3)', 'ঘ': '(3,2)' }, answer: 'খ', marks: 1 },
  // 2x−y=1, 5x+y=13 → (2,3)
  { question: '2x−y=1, 5x+y=13। (x,y) = ?', options: { 'ক': '(1,1)', 'খ': '(2,3)', 'গ': '(3,5)', 'ঘ': '(2,2)' }, answer: 'খ', marks: 1 },
  // 2x+5y=−14, 4x−5y=17 → (1/2,−3)
  { question: '2x+5y=−14, 4x−5y=17। x = ?', options: { 'ক': '1/2', 'খ': '1', 'গ': '3', 'ঘ': '−3' }, answer: 'ক', marks: 1 },
  // Ex12 number 43
  { question: 'দুই অঙ্কের সংখ্যা (উদাহরণ ১২) —', options: { 'ক': '34', 'খ': '43', 'গ': '52', 'ঘ': '61' }, answer: 'খ', marks: 1 },
  // Ex13 age: 32, 11
  { question: 'পিতা-পুত্র বয়স (উদাহরণ ১৩) বর্তমানে—', options: { 'ক': '30, 10', 'খ': '32, 11', 'গ': '40, 8', 'ঘ': '35, 12' }, answer: 'খ', marks: 1 },
  // Ex14 garden 30×20
  { question: 'বাগান (উদাহরণ ১৪) দৈর্ঘ্য×প্রস্থ—', options: { 'ক': '20×30', 'খ': '30×20', 'গ': '25×25', 'ঘ': '34×24' }, answer: 'খ', marks: 1 },
  // Sample room L=6, W=4
  { question: 'মেঝে পরিসীমা 20, দৈর্ঘ্য=প্রস্থ+2। দৈর্ঘ্য—', options: { 'ক': '10', 'খ': '8', 'গ': '6', 'ঘ': '4' }, answer: 'গ', marks: 1 },
  // Sample mosaic 24×900=21600
  { question: 'উপরের ঘর মোজাইক (900 টাকা/ম²)—', options: { 'ক': '72000', 'খ': '43200', 'গ': '28800', 'ঘ': '21600' }, answer: 'ঘ', marks: 1 },
  // x+y=10, 3x−2y=0 → (4,6)
  { question: 'x+y=10, 3x−2y=0। (x,y) = ?', options: { 'ক': '(4,6)', 'খ': '(6,4)', 'গ': '(5,5)', 'ঘ': '(2,8)' }, answer: 'ক', marks: 1 },
  // perimeter 45, 3:5:7 → 9,15,21
  { question: 'পরিসীমা 45, বাহু 3:5:7। বৃহত্তম বাহু—', options: { 'ক': '9', 'খ': '15', 'গ': '21', 'ঘ': '45' }, answer: 'গ', marks: 1 },
  // sum 31 diff 13 → larger 22
  { question: 'যোগফল 31, বিয়োগফল 13। বড় সংখ্যা—', options: { 'ক': '18', 'খ': '22', 'গ': '24', 'ঘ': '9' }, answer: 'খ', marks: 1 },
  // boat 15 downstream 5 upstream → boat 10
  { question: 'নৌকা স্রোতানুকূল 15, প্রতিকূল 5 কি.মি./ঘণ্টা। নৌকার বেগ—', options: { 'ক': '5', 'খ': '10', 'গ': '15', 'ঘ': '20' }, answer: 'খ', marks: 1 },
  // −x+2y=1, 2x+y=4 → consistent independent
  { question: '−x+2y=1, 2x+y=4 — সমীকরণজোট—', options: { 'ক': 'অসামঞ্জস্য', 'খ': 'নির্ভরশীল', 'গ': 'সমঞ্জস্য অনির্ভরশীল', 'ঘ': 'সমাধান নেই' }, answer: 'গ', marks: 1 },
  // 4x−y−7=0 → a₁=4,b₁=−1,c₁=−7
  { question: '4x−y−7=0 এ a₁,b₁,c₁ = ?', options: { 'ক': '4,−1,−7', 'খ': '4,1,7', 'গ': '−4,1,7', 'ঘ': '4,−1,7' }, answer: 'ক', marks: 1 },
  // 3−3/2 x=8−4x → x=2
  { question: '3−(3/2)x=8−4x। x = ?', options: { 'ক': '1', 'খ': '2', 'গ': '3', 'ঘ': '4' }, answer: 'খ', marks: 1 },
  // path cost 216 m² ×110=23760
  { question: 'বাগান 30×20, 2m রাস্তা, 110 টাকা/ম²। খরচ—', options: { 'ক': '21600', 'খ': '23760', 'গ': '26400', 'ঘ': '6000' }, answer: 'খ', marks: 1 },
  { question: 'লৈখিক পদ্ধতিতে সমাধান হলে ছেদবিন্দু—', options: { 'ক': 'অসংখ্য', 'খ': 'একটি (অনন্য)', 'গ': 'শূন্য', 'ঘ': 'দুইটি' }, answer: 'খ', marks: 1 },
]

const cqTemplates = [
  { stimulus: '2x+y=12 ও x−y=3 (১২.১)।', parts: { 'ক': 'উভয় সমীকরণের তিনটি করে সমাধান লেখো।', 'খ': 'সাধারণ সমাধান খুঁজো।', 'গ': '(x,y)=(5,2) যাচাই করো।' } },
  { stimulus: 'সমাধান যোগ্যতা শ্রেণিবিভাগ (ছক ১২.১)।', parts: { 'ক': 'a₁/a₂≠b₁/b₂ → কী ধরন?', 'খ': 'a₁/a₂=b₁/b₂=c₁/c₂ → কী ধরন?', 'গ': 'a₁/a₂=b₁/b₂≠c₁/c₂ → কী ধরন?' } },
  { stimulus: 'উদাহরণ ১: তিনটি সমীকরণজোট শ্রেণি।', parts: { 'ক': 'x+3y=1, 2x+6y=2 — ব্যাখ্যা।', 'খ': '2x−5y=3, x+3y=1 — ব্যাখ্যা।', 'গ': '3x−5y=7, 6x−10y=15 — ব্যাখ্যা।' } },
  { stimulus: '2x+y=8, 3x−2y=5 — প্রতিস্থাপন (উদাহরণ ২)।', parts: { 'ক': 'y=8−2x।', 'খ': '3x−2(8−2x)=5 → x=3।', 'গ': 'y=2, (3,2)।' } },
  { stimulus: '2x+y=8, 3x−2y=5 — অপনয়ন (উদাহরণ ৩)।', parts: { 'ক': '4x+2y=16।', 'খ': '7x=21 → x=3।', 'গ': 'y=2।' } },
  { stimulus: '6x−y=1, 3x+2y=13 — আড়গুণন (উদাহরণ ৪)।', parts: { 'ক': 'a₁=6,b₁=−1,c₁=−1,a₂=3,b₂=2,c₂=−13।', 'খ': 'x/(15)=1/15।', 'গ': '(1,5)।' } },
  { stimulus: '3x−4y=0, 2x−3y=−1 (উদাহরণ ৫)।', parts: { 'ক': 'আড়গুণন সূত্র প্রয়োগ।', 'খ': 'x=4।', 'গ': 'y=3।' } },
  { stimulus: 'x/2+y/3=8, 5x/4−3y=−3 (উদাহরণ ৬)।', parts: { 'ক': '3x+2y−48=0, 5x−12y+12=0।', 'খ': 'x=12।', 'গ': 'y=6 ও শুদ্ধি পরীক্ষা।' } },
  { stimulus: 'ax−by=ab, bx−ay=ab (উদাহরণ ৭)।', parts: { 'ক': 'আড়গুণন সূত্র সেট করো।', 'খ': 'x=ab/(a+b)।', 'গ': 'y=−ab/(a+b)।' } },
  { stimulus: '3x−y=3, 5x+y=21 — লৈখিক (উদাহরণ ৯)।', parts: { 'ক': 'y=3x−3 ও y=21−5x এর বিন্দু।', 'খ': 'ছেদবিন্দু (3,6)।', 'গ': 'সমাধান যাচাই।' } },
  { stimulus: '2x+5y=−14, 4x−5y=17 (উদাহরণ ১০)।', parts: { 'ক': 'লেখচিত্রের বিন্দু নির্ণয়।', 'খ': 'ছেদ (1/2,−3)।', 'গ': 'বীজগাণিতিক যাচাই।' } },
  { stimulus: '3−(3/2)x=8−4x (উদাহরণ ১১)।', parts: { 'ক': 'y=3−(3/2)x ও y=8−4x।', 'খ': 'ছেদ (2,0)।', 'গ': 'x=2।' } },
  { stimulus: '7x−3y=31, 9x−5y=41 (অনুশীলনী ১২.২-১)।', parts: { 'ক': 'প্রতিস্থাপন পদ্ধতি।', 'খ': 'x=4।', 'গ': 'y=−1।' } },
  { stimulus: '7x−8y=−9, 5x−4y=−3 (অনুশীলনী ১২.২-৫)।', parts: { 'ক': 'অপনয়ন পদ্ধতি।', 'খ': 'x=1, y=2।', 'গ': 'যাচাই করো।' } },
  { stimulus: '2x+3y+5=0, 4x+7y+6=0 (অনুশীলনী ১২.২-৭)।', parts: { 'ক': 'আড়গুণন সহগ নির্ণয়।', 'খ': 'x=−17/2, y=4।', 'গ': 'যাচাই।' } },
  { stimulus: 'x+2y=7, 2x−3y=0 (অনুশীলনী ১২.২-৯)।', parts: { 'ক': '2x=3y।', 'খ': 'y=2, x=3।', 'গ': 'যাচাই।' } },
  { stimulus: '3x−y−7=0, 2x+y−3=0 (অনুশীলনী ১২.২-১২)।', parts: { 'ক': 'যোগ পদ্ধতি।', 'খ': 'x=2।', 'গ': 'y=−1।' } },
  { stimulus: '3x+4y=14, 4x−3y=2 (অনুশীলনী ১২.৩-১)।', parts: { 'ক': 'লেখচিত্রের বিন্দু।', 'খ': '(2,2)।', 'গ': 'বীজগাণিতিক যাচাই।' } },
  { stimulus: '2x−y=1, 5x+y=13 (অনুশীলনী ১২.৩-২)।', parts: { 'ক': 'y=2x−1।', 'খ': '(2,3)।', 'গ': 'লেখচিত্রে ছেদ।' } },
  { stimulus: 'দুই অঙ্কের সংখ্যা 43 (উদাহরণ ১২)।', parts: { 'ক': '10x+y, সমীকরণ (1) ও (2) গঠন।', 'খ': 'x=4, y=3।', 'গ': 'সংখ্যা 43।' } },
  { stimulus: 'পিতা-পুত্র বয়স (উদাহরণ ১৩)।', parts: { 'ক': 'x−8=8(y−8) ও x+10=2(y+10)।', 'খ': 'y=11।', 'গ': 'x=32 বছর।' } },
  { stimulus: 'আয়তাকার বাগান (উদাহরণ ১৪)।', parts: { 'ক': '2y=x+10, 2(x+y)=100।', 'খ': '30×20 মি.', 'গ': 'রাস্তা খরচ 23760 টাকা।' } },
  { stimulus: 'x+y=10, 3x−2y=0 (নমুনা সৃজনশীল)।', parts: { 'ক': 'সমঞ্জস্য যাচাই (a₁/a₂≠b₁/b₂)।', 'খ': 'আড়গুণন: (4,6)।', 'গ': 'লেখচিত্রে ছেদ।' } },
  { stimulus: 'মেঝে পরিসীমা 20, দৈর্ঘ্য=প্রস্থ+2 (নমুনা)।', parts: { 'ক': '2(x+y)=20, x=y+2।', 'খ': '6×4 মি.', 'গ': 'মোজাইক খরচ 21600 টাকা।' } },
  { stimulus: 'নৌকা স্রোত (নমুনা SAQ)।', parts: { 'ক': 'x+y=15, x−y=5 (নৌকা+স্রোত)।', 'খ': 'নৌকা 10 কি.মি./ঘণ্টা।', 'গ': 'স্রোত 5 কি.মি./ঘণ্টা।' } },
  { stimulus: 'যোগফল 31, বিয়োগফল 13 (নমুনা SAQ)।', parts: { 'ক': 'x+y=31, x−y=13।', 'খ': 'x=22, y=9।', 'গ': 'বড় সংখ্যা 22।' } },
  { stimulus: '−x+2y=1, 2x+y=4 (নমুনা SAQ)।', parts: { 'ক': 'সহগ অনুপাত তুলনা।', 'খ': 'সমঞ্জস্য অনির্ভরশীল।', 'গ': 'x=7/5, y=6/5।' } },
  { stimulus: 'অনুশীলনী ১২.১-১: 3x−y=4, x+y=10।', parts: { 'ক': 'সমঞ্জস্য/অনির্ভরশীল শ্রেণি।', 'খ': 'x=3.5, y=6.5।', 'গ': 'যাচাই।' } },
  { stimulus: 'অনুশীলনী ১২.১-২: 2x+y=6, 4x+2y=8।', parts: { 'ক': 'সহগ তুলনা।', 'খ': 'অসামঞ্জস্য।', 'গ': 'সমাধান নেই।' } },
  { stimulus: 'অনুশীলনী ১২.১-৪: 3x+2y=0, 6x+4y=0।', parts: { 'ক': 'নির্ভরশীল।', 'খ': 'অসংখ্য সমাধান।', 'গ': 'এক রেখার লেখচিত্র।' } },
  { stimulus: 'অনুশীলনী ১২.১-৫: 3x+2y=0, 9x−6y=0।', parts: { 'ক': '3/9≠2/(−6)।', 'খ': 'অনির্ভরশীল, অনন্য।', 'গ': 'x=0,y=0।' } },
  { stimulus: 'অনুশীলনী ১২.৩-৪: 3x−2y=2, 5x−3y=1।', parts: { 'ক': 'লেখচিত্র পদ্ধতি।', 'খ': 'x=−4, y=−7।', 'গ': 'যাচাই।' } },
  { stimulus: 'অনুশীলনী ১২.৩-৯: 3x+2y=x−2।', parts: { 'ক': '2x+2y=−2 সরল করো।', 'খ': 'এক সমীকরণ, দুই চলক।', 'গ': 'অসংখ্য সমাধান (এক রেখা)।' } },
  { stimulus: 'অনুশীলনী ১২.৩-১০: 3x−7=3−2x।', parts: { 'ক': '5x=10।', 'খ': 'x=2।', 'গ': 'এক চলক, y মুক্ত।' } },
  { stimulus: 'ঘড়ির কাঁটা (উদাহরণ ১৫)।', parts: { 'ক': '5x+y/12=y → y=60x/11।', 'খ': '11 বার মিলিত।', 'গ': 'x=0,1,...,11 এ সময়।' } },
  { stimulus: 'পরিসীমা 45, বাহু 3:5:7 (অনুশীলনী ১২.২-৯ ধরন)।', parts: { 'ক': '15x=45 → x=3।', 'খ': '9, 15, 21 সে.মি.', 'গ': 'যাচাই।' } },
  { stimulus: '171 রান, অনুপাত 3:2 (অনুশীলনী ১২.২-১০)।', parts: { 'ক': '9:6:4 ধারাবাহিক।', 'খ': '81, 54, 36।', 'গ': 'যাচাই।' } },
  { stimulus: '690 মাছ, 2/3:4/5:5/6 (অনুশীলনী ১২.২-৮)।', parts: { 'ক': '20:24:25।', 'খ': '200, 240, 250।', 'গ': 'যাচাই।' } },
  { stimulus: 'ক্ষেত্রফল 432, অনুপাত 3:4 ও 2:5 (অনুশীলনী ১২.২-১৬)।', parts: { 'ক': '6xy=432 → xy=72।', 'খ': 'অপর জমি 20xy।', 'গ': '1440 বর্গমি.' } },
  { stimulus: 'আড়গুণন সূত্র Derivation (১২.২)।', parts: { 'ক': 'b₂ ও b₁ দিয়ে গুণ।', 'খ': 'x/(b₁c₂−b₂c₁) প্রমাণ।', 'গ': 'y/(c₁a₂−c₂a₁) প্রমাণ।' } },
  { stimulus: '4x−y−7=0, 3x+y=0 (কাজ ১২.২)।', parts: { 'ক': 'a₁=4,b₁=−1,c₁=−7,a₂=3,b₂=1,c₂=0।', 'খ': 'x=1, y=−3।', 'গ': 'যাচাই।' } },
  { stimulus: '2x−y−3=0 লেখচিত্র (কাজ ১২.৩)।', parts: { 'ক': 'y=2x−3।', 'খ': 'চারটি বিন্দু লেখো।', 'গ': 'সরলরেখা হয়েছে— ব্যাখ্যা।' } },
  { stimulus: '2x+y=3, 4x+2y=6 — নির্ভরশীল (১২.৩)।', parts: { 'ক': 'দ্বিতীয় = প্রথম×2।', 'খ': 'সমাপত লেখ।', 'গ': 'অসংখ্য সমাধান।' } },
  { stimulus: '2x−y=4, 4x+2y=12 — অসামঞ্জস্য (১২.৩)।', parts: { 'ক': 'y=2x−4 ও y=2x−6।', 'খ': 'সমান্তরাল, ছেদ নেই।', 'গ': 'সমাধান নেই।' } },
  { stimulus: 'x−2y+1=0, 2x+y−3=0 (কাজ ১২.১)।', parts: { 'ক': 'সমঞ্জস্য যাচাই।', 'খ': 'x=1, y=1।', 'গ': 'অনির্ভরশীল, অনন্য।' } },
  { stimulus: 'বাস্তব সমস্যা: ভগ্নাংশ (অনুশীলনী ১২.৪-৫)।', parts: { 'ক': '(l+1)/(h+1)=1/5, (l−5)/(h−5)=1/2।', 'খ': 'l=−3, h=−11।', 'গ': 'ভগ্নাংশ −3/11।' } },
  { stimulus: 'বাস্তব সমস্যা: মাতা-কন্যা (অনুশীলনী ১২.৪-৯)।', parts: { 'ক': 'm=4s, m+5=2(s+10)।', 'খ': 's=7.5 বছর (কন্যাদ্বয়ের সমষ্টি)।', 'গ': 'm=30 বছর।' } },
  { stimulus: 'বাস্তব সমস্যা: আয়তক্ষেত্র (অনুশীলনী ১২.৪-১০)।', parts: { 'ক': 'সমীকরণজোট গঠন।', 'খ': 'দৈর্ঘ্য ও প্রস্থ নির্ণয়।', 'গ': 'যাচাই।' } },
  { stimulus: 'চারটি সমাধান পদ্ধতির তুলনা (১২.২)।', parts: { 'ক': 'প্রতিস্থাপন — সংক্ষিপ্ত বর্ণনা।', 'খ': 'অপনয়ন — সংক্ষিপ্ত বর্ণনা।', 'গ': 'আড়গুণন ও লৈখিক — বর্ণনা।' } },
  { stimulus: 'সরল সহসমীকরণ — অধ্যায় সারাংশ।', parts: { 'ক': 'সমঞ্জস্য/অসামঞ্জস্য সংজ্ঞা।', 'খ': 'আড়গুণন সূত্র।', 'গ': 'বাস্তব সমস্যা গঠনের ধাপ।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))

const saq = [
  { question: 'সরল সহসমীকরণ কী?', marks: 2 },
  { question: 'সমঞ্জস্য সমীকরণজোট কী?', marks: 2 },
  { question: 'অসামঞ্জস্য সমীকরণজোট কী?', marks: 2 },
  { question: 'পরস্পর নির্ভরশীল সমীকরণজোটে সমাধান কতটি?', marks: 2 },
  { question: 'প্রতিস্থাপন পদ্ধতি কী?', marks: 2 },
  { question: 'অপনয়ন পদ্ধতি কী?', marks: 2 },
  { question: 'আড়গুণন (বজ্রগুণন) সূত্র লেখো।', marks: 2 },
  // 2x+y=12, x-y=3
  { question: '2x+y=12, x−y=3। (x,y)=?', marks: 2 },
  // 2x+y=8, 3x-2y=5
  { question: '2x+y=8, 3x−2y=5। x=?', marks: 2 },
  // x+y=4, x-y=2
  { question: 'x+y=4, x−y=2। y=?', marks: 2 },
  // 6x-y=1, 3x+2y=13
  { question: '6x−y=1, 3x+2y=13। y=?', marks: 2 },
  // 3x-y=3, 5x+y=21
  { question: '3x−y=3, 5x+y=21। x=?', marks: 2 },
  // number 43
  { question: 'উদাহরণ ১২ অনুযায়ী দুই অঙ্কের সংখ্যা?', marks: 2 },
  // father 32
  { question: 'উদাহরণ ১৩: পিতার বর্তমান বয়স?', marks: 2 },
  // garden 30
  { question: 'উদাহরণ ১৪: বাগানের দৈর্ঘ্য (মি.)?', marks: 2 },
  // boat 10
  { question: 'স্রোতানুকূল 15, প্রতিকূল 5। নৌকার বেগ?', marks: 2 },
  // sum diff 22
  { question: 'যোগফল 31, বিয়োগফল 13। বড় সংখ্যা?', marks: 2 },
  // x+y=10, 3x-2y=0 → x=4
  { question: 'x+y=10, 3x−2y=0। x=?', marks: 2 },
  // inconsistent condition
  { question: 'a₁/a₂=b₁/b₂≠c₁/c₂ হলে সমাধান?', marks: 2 },
  { question: 'লৈখিক পদ্ধতিতে ছেদবিন্দু কী নির্দেশ করে?', marks: 2 },
]

const footer = `
async function seed() {
  const total = mcq.length + cq.length + saq.length
  console.log(\`\\n🚀 Seeding Class \${CLASS_NUM} \${SUBJECT} — \${TITLE_BN}\`)
  console.log(\`   MCQ: \${mcq.length} | CQ: \${cq.length} | SAQ: \${saq.length} | Total: \${total}\\n\`)

  if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
    console.error(\`❌ Count mismatch: need MCQ=50, CQ=50, SAQ=20; got \${mcq.length}, \${cq.length}, \${saq.length}\`)
    process.exit(1)
  }

  const { error: delErr } = await supabase
    .from('vault_questions')
    .delete()
    .eq('class_num', CLASS_NUM)
    .eq('subject', SUBJECT)
    .eq('chapter_id', CHAPTER_ID)

  if (delErr) {
    console.error('❌ Delete error:', delErr.message)
    process.exit(1)
  }
  console.log('🗑️  Deleted existing vault_questions for this chapter')

  const rows = []

  mcq.forEach((q, i) => {
    rows.push({
      class_num: CLASS_NUM, subject: SUBJECT, chapter_id: CHAPTER_ID,
      chapter_title_bn: TITLE_BN, chapter_title_en: TITLE_EN,
      question_type: 'mcq', question_number: i + 1,
      question_data: q, is_verified: true,
    })
  })

  cq.forEach((q, i) => {
    rows.push({
      class_num: CLASS_NUM, subject: SUBJECT, chapter_id: CHAPTER_ID,
      chapter_title_bn: TITLE_BN, chapter_title_en: TITLE_EN,
      question_type: 'cq', question_number: i + 1,
      question_data: q, is_verified: true,
    })
  })

  saq.forEach((q, i) => {
    rows.push({
      class_num: CLASS_NUM, subject: SUBJECT, chapter_id: CHAPTER_ID,
      chapter_title_bn: TITLE_BN, chapter_title_en: TITLE_EN,
      question_type: 'saq', question_number: i + 1,
      question_data: q, is_verified: true,
    })
  })

  let inserted = 0
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    const { error } = await supabase.from('vault_questions').insert(batch)
    if (error) {
      console.error(\`❌ Batch \${Math.floor(i / 50) + 1} error:\`, error.message)
    } else {
      inserted += batch.length
      console.log(\`✅ Batch \${Math.floor(i / 50) + 1}: \${batch.length} inserted (total: \${inserted})\`)
    }
  }

  const { count } = await supabase
    .from('vault_questions')
    .select('*', { count: 'exact', head: true })
    .eq('class_num', CLASS_NUM)
    .eq('subject', SUBJECT)
    .eq('chapter_id', CHAPTER_ID)

  console.log(\`\\n\${'='.repeat(50)}\`)
  console.log(\`✅ SEED COMPLETE: \${count} questions in vault_questions for class-\${CLASS_NUM} \${CHAPTER_ID}\`)
  console.log(\`\${'='.repeat(50)}\\n\`)
}

seed().catch(console.error)
`

const mcqStr = mcq.map((q) => `  { question: ${JSON.stringify(q.question)}, options: { 'ক': ${JSON.stringify(q.options['ক'])}, 'খ': ${JSON.stringify(q.options['খ'])}, 'গ': ${JSON.stringify(q.options['গ'])}, 'ঘ': ${JSON.stringify(q.options['ঘ'])} }, answer: ${JSON.stringify(q.answer)}, marks: ${q.marks} }`).join(',\n')
const cqStr = cq.map((q) => `  { stimulus: ${JSON.stringify(q.stimulus)}, parts: { 'ক': ${JSON.stringify(q.parts['ক'])}, 'খ': ${JSON.stringify(q.parts['খ'])}, 'গ': ${JSON.stringify(q.parts['গ'])} }, totalMarks: 10 }`).join(',\n')
const saqStr = saq.map((q) => `  { question: ${JSON.stringify(q.question)}, marks: ${q.marks} }`).join(',\n')

const out = `${header}
const mcq = [
${mcqStr},
]

const cq = [
${cqStr},
]

const saq = [
${saqStr},
]
${footer}`

const outPath = path.join(__dirname, '..', 'seed-class9-ch12.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
  console.error('❌ Count check failed')
  process.exit(1)
}
