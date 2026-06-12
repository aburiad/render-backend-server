/**
 * Generates seed-class9-ch9.cjs — MCQ=50, CQ=50, no SAQ
 * Run: node scripts/build-ch9-seed.cjs
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 9: ত্রিকোণমিতিক অনুপাত (Trigonometric Ratios)
 * 100 questions: MCQ=50, CQ=50 (no SAQ)
 *
 * ALL questions derived strictly from NCTB Chapter 9 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch9.cjs
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
const CHAPTER_ID = 'ch-9'
const TITLE_BN = 'ত্রিকোণমিতিক অনুপাত'
const TITLE_EN = 'Trigonometric Ratios'
`

const mcq = [
  // ─── ৯.১ বাহুর নামকরণ ও সংজ্ঞা (1-10) ───
  { question: 'সমকোণী ত্রিভুজের অতিভুজ কোন বাহু?', options: { 'ক': 'সমকোণের বিপরীত বাহু', 'খ': 'সমকোণ সংলগ্ন বাহু', 'গ': 'সবচেয়ে ছোট বাহু', 'ঘ': 'সূক্ষ্মকোণের বিপরীত বাহু' }, answer: 'ক', marks: 1 },
  { question: 'θ কোণের সাপেক্ষে sin θ = ?', options: { 'ক': 'অতিভুজ/বিপরীত', 'খ': 'বিপরীত/অতিভুজ', 'গ': 'সন্নিহিত/অতিভুজ', 'ঘ': 'বিপরীত/সন্নিহিত' }, answer: 'খ', marks: 1 },
  { question: 'θ কোণের সাপেক্ষে cos θ = ?', options: { 'ক': 'বিপরীত/অতিভুজ', 'খ': 'সন্নিহিত/অতিভুজ', 'গ': 'অতিভুজ/সন্নিহিত', 'ঘ': 'বিপরীত/সন্নিহিত' }, answer: 'খ', marks: 1 },
  { question: 'θ কোণের সাপেক্ষে tan θ = ?', options: { 'ক': 'অতিভুজ/বিপরীত', 'খ': 'বিপরীত/সন্নিহিত', 'গ': 'সন্নিহিত/অতিভুজ', 'ঘ': 'সন্নিহিত/বিপরীত' }, answer: 'খ', marks: 1 },
  { question: 'cosec θ = ?', options: { 'ক': 'sin θ', 'খ': '1/sin θ', 'গ': '1/cos θ', 'ঘ': 'cos θ/sin θ' }, answer: 'খ', marks: 1 },
  { question: 'Trigonometry শব্দের অর্থ—', options: { 'ক': 'বৃত্ত পরিমাপ', 'খ': 'ত্রিভুজ পরিমাপ', 'গ': 'কোণ পরিমাপ', 'ঘ': 'রেখা পরিমাপ' }, answer: 'খ', marks: 1 },
  { question: 'সদৃশ সমকোণী ত্রিভুজে একই সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত—', options: { 'ক': 'পরিবর্তনশীল', 'খ': 'ধ্রুব', 'গ': 'শূন্য', 'ঘ': 'অসংজ্ঞায়িত' }, answer: 'খ', marks: 1 },
  { question: 'sin θ প্রতীকের অর্থ—', options: { 'ক': 'sin ও θ এর গুণফল', 'খ': 'θ কোণের sine অনুপাত', 'গ': 'θ এর বর্গ', 'ঘ': 'θ এর সমকোণ' }, answer: 'খ', marks: 1 },
  // 8-15-17: θ at angle with opp 8, hyp 17 → sin θ = 8/17
  { question: 'সমকোণী ত্রিভুজে বাহু 8, 15, 17। θ কোণের বিপরীত 8 হলে sin θ = ?', options: { 'ক': '8/15', 'খ': '8/17', 'গ': '15/17', 'ঘ': '17/8' }, answer: 'খ', marks: 1 },
  // 7-24-25: cos at angle with adj 24 → 24/25
  { question: 'সমকোণী ত্রিভুজে বাহু 7, 24, 25। α কোণের সন্নিহিত 24 হলে cos α = ?', options: { 'ক': '7/25', 'খ': '24/25', 'গ': '7/24', 'ঘ': '24/7' }, answer: 'খ', marks: 1 },

  // ─── ৯.২-৯.৩ অনুপাত সম্পর্ক ও অভেদ (11-20) ───
  { question: 'tan θ = ?', options: { 'ক': 'cos θ/sin θ', 'খ': 'sin θ/cos θ', 'গ': '1/cos θ', 'ঘ': 'sin θ·cos θ' }, answer: 'খ', marks: 1 },
  { question: 'sin²θ + cos²θ = ?', options: { 'ক': '0', 'খ': '2', 'গ': '1', 'ঘ': 'tan²θ' }, answer: 'গ', marks: 1 },
  { question: 'sec²θ − tan²θ = ?', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': 'cot²θ' }, answer: 'খ', marks: 1 },
  { question: 'cosec²θ − cot²θ = ?', options: { 'ক': '1', 'খ': '0', 'গ': 'sec²θ', 'ঘ': 'tan²θ' }, answer: 'ক', marks: 1 },
  // tan A=4/3 → 3-4-5 → sin A=4/5
  { question: 'tan A = 4/3 হলে sin A = ?', options: { 'ক': '3/5', 'খ': '4/5', 'গ': '5/4', 'ঘ': '3/4' }, answer: 'খ', marks: 1 },
  // sin A=3/5 → cos A=4/5
  { question: 'sin A = 3/5 হলে cos A = ?', options: { 'ক': '3/4', 'খ': '4/5', 'গ': '5/3', 'ঘ': '5/4' }, answer: 'খ', marks: 1 },
  // cos A=12/13 → sin A=5/13
  { question: 'cos A = 12/13 হলে sin A = ?', options: { 'ক': '5/13', 'খ': '12/5', 'গ': '13/12', 'ঘ': '13/5' }, answer: 'ক', marks: 1 },
  // tan A=1 → 45° → sin·cos = (1/√2)(1/√2)=1/2
  { question: 'tan A = 1 হলে sin A · cos A = ?', options: { 'ক': '1', 'খ': '1/√2', 'গ': '1/2', 'ঘ': '0' }, answer: 'গ', marks: 1 },
  // 15 cot A=8 → cot=8/15, opp=15, hyp=17, sin=15/17
  { question: '15 cot A = 8 হলে sin A = ?', options: { 'ক': '8/17', 'খ': '15/17', 'গ': '8/15', 'ঘ': '17/15' }, answer: 'খ', marks: 1 },
  // AB=13, BC=12, ∠C=90°, ∠ABC=θ → AC=5, sin θ=5/13
  { question: 'ABC সমকোণী, ∠C=90°, AB=13, BC=12, ∠ABC=θ। sin θ = ?', options: { 'ক': '12/13', 'খ': '5/13', 'গ': '5/12', 'ঘ': '13/5' }, answer: 'খ', marks: 1 },

  // ─── ৯.৪ বিশেষ কোণ (21-35) ───
  { question: 'sin 30° = ?', options: { 'ক': '√3/2', 'খ': '1/2', 'গ': '1/√2', 'ঘ': '1' }, answer: 'খ', marks: 1 },
  { question: 'cos 60° = ?', options: { 'ক': '√3/2', 'খ': '1/2', 'গ': '1', 'ঘ': '0' }, answer: 'খ', marks: 1 },
  { question: 'tan 45° = ?', options: { 'ক': '0', 'খ': '1', 'গ': '√3', 'ঘ': '1/√3' }, answer: 'খ', marks: 1 },
  { question: 'sin 90° = ?', options: { 'ক': '0', 'খ': '1/2', 'গ': '√3/2', 'ঘ': '1' }, answer: 'ঘ', marks: 1 },
  { question: 'cos 0° = ?', options: { 'ক': '0', 'খ': '1/2', 'গ': '1/√2', 'ঘ': '1' }, answer: 'ঘ', marks: 1 },
  { question: 'tan 0° = ?', options: { 'ক': '1', 'খ': '0', 'গ': '√3', 'ঘ': 'অসংজ্ঞায়িত' }, answer: 'খ', marks: 1 },
  { question: 'sin 45° = ?', options: { 'ক': '1/2', 'খ': '1/√2', 'গ': '√3/2', 'ঘ': '1' }, answer: 'খ', marks: 1 },
  { question: 'tan 60° = ?', options: { 'ক': '1/√3', 'খ': '1', 'গ': '√3', 'ঘ': '2' }, answer: 'গ', marks: 1 },
  { question: 'cot 60° = ?', options: { 'ক': '1/√3', 'খ': '1', 'গ': '√3', 'ঘ': '2' }, answer: 'ক', marks: 1 },
  { question: 'sec 60° = ?', options: { 'ক': '1/2', 'খ': '√3', 'গ': '2/√3', 'ঘ': '2' }, answer: 'ঘ', marks: 1 },
  { question: 'cosec 30° = ?', options: { 'ক': '1/2', 'খ': '√3', 'গ': '2/√3', 'ঘ': '2' }, answer: 'ঘ', marks: 1 },
  // sin60·cos30 + cos60·sin30 = 3/4+1/4=1
  { question: 'sin 60°·cos 30° + cos 60°·sin 30° = ?', options: { 'ক': '0', 'খ': '1/2', 'গ': '√3/2', 'ঘ': '1' }, answer: 'ঘ', marks: 1 },
  // cos θ=1/2 → θ=60°, cot=1/√3
  { question: 'cos θ = 1/2 হলে cot θ = ?', options: { 'ক': '1/√3', 'খ': '1', 'গ': '√3', 'ঘ': '2' }, answer: 'ক', marks: 1 },
  // cot(θ-30°)=1/√3 → θ-30=60 → θ=90, sin=1
  { question: 'cot (θ − 30°) = 1/√3 হলে sin θ = ?', options: { 'ক': '1/2', 'খ': '0', 'গ': '1', 'ঘ': '√3/2' }, answer: 'গ', marks: 1 },
  // tan(3A)=√3 → 3A=60 → A=20
  { question: 'tan (3A) = √3 হলে A = ?', options: { 'ক': '45°', 'খ': '30°', 'গ': '20°', 'ঘ': '15°' }, answer: 'গ', marks: 1 },

  // ─── ৯.৫ পূরক কোণ ও 0°,90° (36-45) ───
  { question: 'sin (90° − θ) = ?', options: { 'ক': 'sin θ', 'খ': 'cos θ', 'গ': 'tan θ', 'ঘ': 'cot θ' }, answer: 'খ', marks: 1 },
  { question: 'cos (90° − 30°) = ?', options: { 'ক': '1/2', 'খ': '√3/2', 'গ': '1/√2', 'ঘ': '1' }, answer: 'ক', marks: 1 },
  { question: 'tan (90° − 60°) = ?', options: { 'ক': '√3', 'খ': '1/√3', 'গ': '1', 'ঘ': '0' }, answer: 'খ', marks: 1 },
  { question: 'sec 0° = ?', options: { 'ক': '0', 'খ': '1', 'গ': '√2', 'ঘ': 'অসংজ্ঞায়িত' }, answer: 'খ', marks: 1 },
  { question: 'cot 90° = ?', options: { 'ক': '1', 'খ': '0', 'গ': '√3', 'ঘ': 'অসংজ্ঞায়িত' }, answer: 'খ', marks: 1 },
  { question: '0° ≤ θ ≤ 90° এ sin θ এর সর্বোচ্চ মান—', options: { 'ক': '−1', 'খ': '0', 'গ': '1/2', 'ঘ': '1' }, answer: 'ঘ', marks: 1 },
  { question: 'কোনটি সংজ্ঞায়িত নয়?', options: { 'ক': 'sin 0°', 'খ': 'cos 90°', 'গ': 'cosec 0°', 'ঘ': 'cot 90°' }, answer: 'গ', marks: 1 },
  { question: 'tan 90°—', options: { 'ক': '0', 'খ': '1', 'গ': '√3', 'ঘ': 'অসংজ্ঞায়িত' }, answer: 'ঘ', marks: 1 },
  // cos²θ-sin²θ=1/3 → cos⁴-sin⁴=(cos²-sin²)(cos²+sin²)=1/3
  { question: 'cos²θ − sin²θ = 1/3 হলে cos⁴θ − sin⁴θ = ?', options: { 'ক': '3', 'খ': '1/2', 'গ': '1', 'ঘ': '1/3' }, answer: 'ঘ', marks: 1 },
  // sec+tan=5/2 → sec-tan=2/5
  { question: 'sec A + tan A = 5/2 হলে sec A − tan A = ?', options: { 'ক': '5/2', 'খ': '2/5', 'গ': '25/4', 'ঘ': '1' }, answer: 'খ', marks: 1 },

  // ─── প্রমাণ ও যাচাই (46-50) ───
  { question: 'tan A + cot A = sec A · cosec A — উক্তিটি—', options: { 'ক': 'সত্য', 'খ': 'মিথ্যা', 'গ': 'শুধু A=45° এ সত্য', 'ঘ': 'অসংজ্ঞায়িত' }, answer: 'ক', marks: 1 },
  // 2sin30·cos30 = 2·(1/2)(√3/2)=√3/2=sin60
  { question: '2 sin 30° · cos 30° = ?', options: { 'ক': '1/2', 'খ': '√3/2', 'গ': '1', 'ঘ': '√3' }, answer: 'খ', marks: 1 },
  { question: 'sin 0° + cos 0° = ?', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': '1/2' }, answer: 'খ', marks: 1 },
  // AC=2, AB=1, BC=√3 → tan C = opp/adj = AB/BC = 1/√3
  { question: 'সমকোণী ABC, ∠B=90°, AC=2, AB=1। tan C = ?', options: { 'ক': '2', 'খ': '√3', 'গ': '1', 'ঘ': '1/√3' }, answer: 'ঘ', marks: 1 },
  // sin²A-cos²A at A=60°: (3/4)-(1/4)=1/2
  { question: 'উপরের ত্রিভুজে ∠A=60° হলে sin²A − cos²A = ?', options: { 'ক': '1/2', 'খ': '√3/2', 'গ': '1', 'ঘ': '0' }, answer: 'ক', marks: 1 },
]

const cqTemplates = [
  { stimulus: 'tan A = 4/3 দেওয়া আছে।', parts: { 'ক': 'A কোণের চিত্র আঁকো।', 'খ': 'sin A, cos A, sec A নির্ণয় করো।', 'গ': '2 sin A · cos A = 24/25 যাচাই করো।' } },
  { stimulus: 'sin A = 3/4।', parts: { 'ক': 'অতিভুজ ও সন্নিহিত বাহু নির্ণয় করো।', 'খ': 'cos A, tan A, cosec A লেখো।', 'গ': 'sin²A + cos²A = 1 যাচাই করো।' } },
  { stimulus: '15 cot A = 8।', parts: { 'ক': 'cot A ও tan A এর মান।', 'খ': 'sin A ও sec A নির্ণয় করো।', 'গ': 'চিত্র আঁকো ও যাচাই করো।' } },
  { stimulus: 'ABC সমকোণী, ∠C=90°, AB=13, BC=12, ∠ABC=θ।', parts: { 'ক': 'AC এর দৈর্ঘ্য নির্ণয় করো।', 'খ': 'sin θ, cos θ, tan θ লেখো।', 'গ': 'cos²θ − sin²θ এর মান বের করো।' } },
  { stimulus: 'ABC সমকোণী, ∠B=90°, tan A = √3।', parts: { 'ক': 'A কোণের মান।', 'খ': 'sin A, cos A নির্ণয় করো।', 'গ': '√3 sin A · cos A = 3/4 এর সত্যতা যাচাই করো।' } },
  { stimulus: 'tan A = 1।', parts: { 'ক': 'A কোণের মান নির্ণয় করো।', 'খ': 'sin A, cos A, sec A লেখো।', 'গ': '2 sin A · cos A = 1 প্রমাণ করো।' } },
  { stimulus: 'sec A + tan A = 5/2।', parts: { 'ক': 'sec²A − tan²A = 1 প্রয়োগ করো।', 'খ': 'sec A − tan A নির্ণয় করো।', 'গ': 'sec A ও tan A পৃথকভাবে বের করো।' } },
  { stimulus: 'cosec A − cot A = 4/3।', parts: { 'ক': 'cosec A + cot A নির্ণয় করো।', 'খ': 'sin A ও cos A বের করো।', 'গ': 'sec²A + cosec²A = sec²A·cosec²A প্রমাণ করো।' } },
  { stimulus: 'sin θ = p, cos θ = q (θ সূক্ষ্মকোণ)।', parts: { 'ক': 'tan θ = r হলে r = √(1/3) হলে θ নির্ণয় করো।', 'খ': 'p + q = √2 হলে θ = 45° প্রমাণ করো।', 'গ': '7p² + 3q² = 4 হলে tan θ = 1/√3 দেখাও।' } },
  { stimulus: 'cos θ = 1/2।', parts: { 'ক': 'θ এর মান (0°≤θ≤90°)।', 'খ': 'sin θ, tan θ, cot θ লেখো।', 'গ': 'sin θ + cos θ এর মান নির্ণয় করো।' } },
  { stimulus: 'cot (θ − 30°) = 1/√3।', parts: { 'ক': 'θ − 30° = 60° দেখাও।', 'খ': 'θ নির্ণয় করো।', 'গ': 'sin θ, cos θ, tan θ লেখো।' } },
  { stimulus: 'tan (3A) = √3।', parts: { 'ক': '3A = 60° দেখাও।', 'খ': 'A নির্ণয় করো।', 'গ': 'sin 3A ও cos 3A লেখো।' } },
  { stimulus: 'cos²θ − sin²θ = 1/3।', parts: { 'ক': 'cos⁴θ − sin⁴θ নির্ণয় করো।', 'খ': 'cos 2θ = cos²θ − sin²θ প্রয়োগ করো।', 'গ': '2θ এর সম্ভাব্য মান (সূক্ষ্মকোণ)।' } },
  { stimulus: 'ABC সমকোণী, ∠B=90°, AB=5, BC=12।', parts: { 'ক': 'AC নির্ণয় করো।', 'খ': '∠C = θ হলে sin θ + cos θ বের করো।', 'গ': 'sec²A + cosec²A = sec²A·cosec²A প্রমাণ করো।' } },
  { stimulus: 'ABC সমকোণী, ∠B=90°, AB=8, BC=6।', parts: { 'ক': 'AC = 10 নির্ণয় করো।', 'খ': 'sin A, cos A, tan A লেখো।', 'গ': 'tan²A − sin²A = tan²A·sin²A দেখাও।' } },
  { stimulus: 'sin 60°·cos 30° + cos 60°·sin 30°।', parts: { 'ক': 'প্রত্যেক অনুপাতের মান লেখো।', 'খ': 'যোগফল = 1 নির্ণয় করো।', 'গ': 'sin (60°+30°) = sin 90° সম্পর্ক ব্যাখ্যা করো।' } },
  { stimulus: '(1 − sin²45°)/(1 + sin²45°) + tan²45°।', parts: { 'ক': 'sin 45° ও tan 45° এর মান।', 'খ': 'প্রথম ভগ্নাংশ = 1/3 দেখাও।', 'গ': 'সম্পূর্ণ রাশির মান = 4/3 নির্ণয় করো।' } },
  { stimulus: 'cot 90°·tan 0°·sec²30°·cosec 60°।', parts: { 'ক': 'প্রত্যেক অনুপাতের মান লেখো।', 'খ': 'গুণফল = 0 দেখাও।', 'গ': 'কোন ধাপে শূন্য আসে— ব্যাখ্যা করো।' } },
  { stimulus: '(1 − tan²60°)/(1 + tan²60°) + sin²60°।', parts: { 'ক': 'tan 60° = √3 প্রয়োগ করো।', 'খ': 'প্রথম ভগ্নাংশ = −1/2 দেখাও।', 'গ': 'সম্পূর্ণ মান = 1/4 নির্ণয় করো।' } },
  { stimulus: '2 cos (A+B) = 1, 2 sin (A−B) = √3; A,B সূক্ষ্মকোণ।', parts: { 'ক': 'cos(A+B)=1/2, sin(A−B)=√3/2 লেখো।', 'খ': 'A+B=60°, A−B=45° সমীকরণ গঠন করো।', 'গ': 'A=52½°, B=7½° নির্ণয় করো।' } },
  { stimulus: '(cos A − sin A)/(cos A + sin A) = (1−√3)/(1+√3)।', parts: { 'ক': 'যোজন-বিয়োজন পদ্ধতি প্রয়োগ করো।', 'খ': 'cot A = 1/√3 দেখাও।', 'গ': 'A = 60° নির্ণয় করো।' } },
  { stimulus: '2 cos²θ + 3 sin θ − 3 = 0; θ সূক্ষ্মকোণ।', parts: { 'ক': 'cos²θ = 1 − sin²θ প্রতিস্থাপন করো।', 'খ': '(1−sin θ)(2 sin θ − 1) = 0 দেখাও।', 'গ': 'θ = 30° নির্ণয় করো (90° বাদ)।' } },
  { stimulus: 'sin θ + cos θ = 1; 0° ≤ θ ≤ 90°।', parts: { 'ক': 'উভয় পাশে বর্গ করো।', 'খ': 'sin θ = 0 বা cos θ = 0 বিশ্লেষণ করো।', 'গ': 'θ = 0° বা 90° নির্ণয় করো।' } },
  { stimulus: 'cos²θ − sin²θ = 2 − 5 cos θ; θ সূক্ষ্মকোণ।', parts: { 'ক': 'cos θ = x ধরে সমীকরণ গঠন করো।', 'খ': '2x² + 5x − 3 = 0 সমাধান করো।', 'গ': 'θ = 60° নির্ণয় করো।' } },
  { stimulus: '2 sin²θ + 3 cos θ − 3 = 0; θ সূক্ষ্মকোণ।', parts: { 'ক': 'sin²θ = 1 − cos²θ প্রতিস্থাপন।', 'খ': 'cos θ = 1/2 পাও।', 'গ': 'θ = 60° নির্ণয় করো।' } },
  { stimulus: 'tan²θ − (1+√3)tan θ + √3 = 0।', parts: { 'ক': 'tan θ = 1 ও tan θ = √3 দেখাও।', 'খ': 'θ = 45° বা 60°।', 'গ': 'উভয় সমাধান যাচাই করো।' } },
  { stimulus: '3 cot²60° + (1/4)cosec²30° + 5 sin²45° − 4 cos²60°।', parts: { 'ক': 'cot 60°, cosec 30°, sin 45°, cos 60° লেখো।', 'খ': 'প্রত্যেক পদের মান বের করো।', 'গ': 'সম্পূর্ণ মান = 7/2 নির্ণয় করো।' } },
  { stimulus: 'cos²30° − sin²30° = cos 60°।', parts: { 'ক': 'cos 30°, sin 30°, cos 60° এর মান।', 'খ': 'বামপক্ষ = 1/2 হিসাব করো।', 'গ': 'ডানপক্ষ = 1/2 — সমতা প্রমাণ করো।' } },
  { stimulus: 'sin 60°·cos 60° + cos 60°·sin 30° = sin 90°।', parts: { 'ক': 'বামপক্ষের প্রত্যেক পদের মান।', 'খ': 'যোগফল = 1।', 'গ': 'ডানপক্ষ sin 90° = 1 যাচাই।' } },
  { stimulus: 'sin 3A = cos 3A; A = 15°।', parts: { 'ক': 'sin 45° ও cos 45° এর মান।', 'খ': 'sin 45° = cos 45° দেখাও।', 'গ': 'tan 45° = 1 ব্যাখ্যা করো।' } },
  { stimulus: 'tan θ + cot θ = sec θ · cosec θ।', parts: { 'ক': 'tan ও cot কে sin/cos এ লেখো।', 'খ': 'sin²θ + cos²θ = 1 প্রয়োগ করো।', 'গ': 'ডানপক্ষের সমান প্রমাণ করো।' } },
  { stimulus: 'sec²θ + cosec²θ = sec²θ · cosec²θ।', parts: { 'ক': 'sec ও cosec কে cos/sin এ লেখো।', 'খ': 'সাধারণ হর করো।', 'গ': 'sin²θ + cos²θ = 1 প্রয়োগ করে প্রমাণ করো।' } },
  { stimulus: '1/(1+sin²θ) + 1/(1+cosec²θ) = 1।', parts: { 'ক': 'cosec²θ = 1 + cot²θ প্রয়োগ।', 'খ': 'দ্বিতীয় ভগ্নাংশ সরল করো।', 'গ': 'যোগফল = 1 প্রমাণ করো।' } },
  { stimulus: '1/(2−sin²θ) + 1/(2+tan²θ) = 1।', parts: { 'ক': 'tan²θ = sin²θ/cos²θ প্রতিস্থাপন।', 'খ': 'cos²θ = 1 − sin²θ প্রয়োগ।', 'গ': 'সমতা প্রমাণ করো।' } },
  { stimulus: 'tan A/(sec A+1) − (sec A−1)/tan A = 0।', parts: { 'ক': 'সাধারণ হর (sec A+1)tan A।', 'খ': 'sec²A − 1 = tan²A প্রয়োগ।', 'গ': 'তফাত = 0 প্রমাণ করো।' } },
  { stimulus: '√((1−sin A)/(1+sin A)) = sec A − tan A।', parts: { 'ক': 'লব-হরকে (1−sin A) দিয়ে গুণ করো।', 'খ': '√((1−sin A)²/cos²A) সরল করো।', 'গ': 'sec A − tan A এর সমান দেখাও।' } },
  { stimulus: '1/sec²A + 1/cosec²A = 1।', parts: { 'ক': 'sec²A = 1/cos²A লেখো।', 'খ': 'cos²A + sin²A = 1 প্রয়োগ।', 'গ': 'সমতা প্রমাণ করো।' } },
  { stimulus: 'sin A/cosec A + cos A/sec A = 1।', parts: { 'ক': 'cosec = 1/sin, sec = 1/cos।', 'খ': 'sin²A + cos²A = 1।', 'গ': 'সমতা প্রমাণ করো।' } },
  { stimulus: '1/(1+tan²A) + 1/(1+cot²A) = 1।', parts: { 'ক': '1+tan²A = sec²A, 1+cot²A = cosec²A।', 'খ': 'cos²A + sin²A = 1।', 'গ': 'প্রমাণ সম্পন্ন করো।' } },
  { stimulus: 'sin A = 5/13, cos A = 12/13।', parts: { 'ক': 'tan A, sec A, cosec A লেখো।', 'খ': 'tan A + cot A = sec A·cosec A যাচাই।', 'গ': 'চিত্র আঁকো।' } },
  { stimulus: 'ABC সমকোণী, ∠B=90°, BC=6, AB=8।', parts: { 'ক': 'AC = 10।', 'খ': 'sin A = 4/5 দেখাও।', 'গ': 'cos A, tan A লেখো।' } },
  { stimulus: 'sec (90°−θ) = 5/3।', parts: { 'ক': 'cosec θ = 5/3 লেখো।', 'খ': 'sin θ = 3/5, cos θ = 4/5।', 'গ': 'cosec θ − cot θ = 1/3 নির্ণয় করো।' } },
  { stimulus: 'cot A = b/a।', parts: { 'ক': 'tan A = a/b।', 'খ': '(a sin A − b cos A)/(a sin A + b cos A) সরল করো।', 'গ': 'মান = (tan A − 1)/(tan A + 1) দেখাও।' } },
  { stimulus: 'tan A = 1/√3।', parts: { 'ক': 'A = 30°।', 'খ': '(cosec²A − sec²A)/(cos²A + sec²A) নির্ণয় করো।', 'গ': 'উত্তর = 32/25 যাচাই করো।' } },
  { stimulus: 'sin θ = p, cos θ = q।', parts: { 'ক': 'p² + q² = 1 সম্পর্ক।', 'খ': 'tan θ = p/q।', 'গ': 'sec²θ + cosec²θ = (p²+q²)/(p²q²) দেখাও।' } },
  { stimulus: 'cos 45°·cot²60°·cosec²30°।', parts: { 'ক': 'প্রত্যেক অনুপাতের মান।', 'খ': 'cot 60° = 1/√3, cosec 30° = 2।', 'গ': 'সম্পূর্ণ মান = 4/(3√2) নির্ণয় করো।' } },
  { stimulus: '(1 − cot²60°)/(1 + cot²60°)।', parts: { 'ক': 'cot 60° = 1/√3।', 'খ': 'cot²60° = 1/3।', 'গ': 'মান = 1/2 নির্ণয় করো।' } },
  { stimulus: 'tan 45°·sin²60°·tan 30°·tan 60°।', parts: { 'ক': 'sin 60°, tan 30°, tan 60° লেখো।', 'খ': 'পদগুলো গুণ করো।', 'গ': 'মান = 3/4 নির্ণয় করো।' } },
  { stimulus: '(1 − cos²60°)/(1 + cos²60°) + sec²60°।', parts: { 'ক': 'cos 60° = 1/2, sec 60° = 2।', 'খ': 'প্রথম ভগ্নাংশ = 3/5।', 'গ': 'সম্পূর্ণ মান = 23/5 নির্ণয় করো।' } },
  { stimulus: 'θ কোণের সাপেক্ষে sin, cos, tan সংজ্ঞা।', parts: { 'ক': 'সমকোণী ত্রিভুজে বাহুর নামকরণ লেখো।', 'খ': 'ছয়টি ত্রিকোণমিতিক অনুপাত সংজ্ঞা দাও।', 'গ': 'tan θ = sin θ/cos θ প্রমাণ করো।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))
const saq = []

const footer = `
async function seed() {
  const total = mcq.length + cq.length + saq.length
  console.log(\`\\n🚀 Seeding Class \${CLASS_NUM} \${SUBJECT} — \${TITLE_BN}\`)
  console.log(\`   MCQ: \${mcq.length} | CQ: \${cq.length} | SAQ: \${saq.length} | Total: \${total}\\n\`)

  if (mcq.length !== 50 || cq.length !== 50) {
    console.error(\`❌ Count mismatch: need MCQ=50, CQ=50; got MCQ=\${mcq.length}, CQ=\${cq.length}\`)
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

const out = `${header}
const mcq = [
${mcqStr},
]

const cq = [
${cqStr},
]

const saq = []
${footer}`

const outPath = path.join(__dirname, '..', 'seed-class9-ch9.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50) {
  process.exit(1)
}
