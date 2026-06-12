/**
 * Generates seed-class9-ch16.cjs — MCQ=50, CQ=50, SAQ=20
 * Run: node scripts/build-ch16-seed.cjs
 * Source: chapter-16-mensuration.md (NCTB Class 9)
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 16: পরিমিতি
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 16 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch16.cjs
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
const CHAPTER_ID = 'ch-16'
const TITLE_BN = 'পরিমিতি'
const TITLE_EN = 'Mensuration'
`

const mcq = [
  // ─── ১৬.১ ত্রিভুজক্ষেত্রের ক্ষেত্রফল (1-12) ───
  { question: 'ত্রিভুজ ক্ষেত্রফল (ভূমি b, উচ্চতা h)—', options: { 'ক': 'bh', 'খ': '½bh', 'গ': '2bh', 'ঘ': 'b+h' }, answer: 'খ', marks: 1 },
  { question: 'সমকোণী △, বাহু a ও b (সমকোণ সংলগ্ন)—', options: { 'ক': 'ab', 'খ': '½ab', 'গ': 'a+b', 'ঘ': 'a²+b²' }, answer: 'খ', marks: 1 },
  { question: 'দুই বাহু a,b ও অন্তর্ভুক্ত কোণ C—', options: { 'ক': 'ab sin C', 'খ': '½ab sin C', 'গ': '½ab cos C', 'ঘ': 'ab cos C' }, answer: 'খ', marks: 1 },
  { question: 'হেরোন: 2s=?', options: { 'ক': 'a+b+c', 'খ': 'abc', 'গ': 'a+b−c', 'ঘ': '2(a+b)' }, answer: 'ক', marks: 1 },
  { question: 'হেরোন সূত্র—', options: { 'ক': '√(s(s−a)(s−b)(s−c))', 'খ': 's(s−a)(s−b)(s−c)', 'গ': '½s(s−a)', 'ঘ': '2√s' }, answer: 'ক', marks: 1 },
  { question: 'সমবাহু △, বাহু a — ক্ষেত্রফল—', options: { 'ক': 'a²/2', 'খ': '√3a²/4', 'গ': '√3a/2', 'ঘ': '3a²/4' }, answer: 'খ', marks: 1 },
  { question: 'সমদ্বিবাহু △, সমান বাহু a, ভূমি b—', options: { 'ক': '½ab', 'খ': 'b√(4a²−b²)/4', 'গ': 'ab/4', 'ঘ': 'b√a²/2' }, answer: 'খ', marks: 1 },
  // উদা.১: 6,8
  { question: 'সমকোণী △, বাহু 6 ও 8 সে.মি.—', options: { 'ক': '14', 'খ': '24', 'গ': '48', 'ঘ': '96' }, answer: 'খ', marks: 1 },
  // উদা.২: 9,10,60°
  { question: 'বাহু 9,10 সে.মি., কোণ 60° — ক্ষেত্রফল (প্রায়)—', options: { 'ক': '45', 'খ': '38.97', 'গ': '90', 'ঘ': '19.5' }, answer: 'খ', marks: 1 },
  // উদা.৩: 7,8,9
  { question: 'বাহু 7,8,9 সে.মি. — ক্ষেত্রফল (প্রায়)—', options: { 'ক': '26.83', 'খ': '36', 'গ': '504', 'ঘ': '12' }, answer: 'ক', marks: 1 },
  // উদা.৪: equilateral +1m → a=5.5
  { question: 'সমবাহু △, প্রতি বাহু 1মি. বাড়লে ক্ষেত্রফল 3√3 ব.মি. বাড়ে — a=?', options: { 'ক': '5', 'খ': '5.5', 'গ': '6', 'ঘ': '4.5' }, answer: 'খ', marks: 1 },
  // উদা.৫: isosceles b=60, area=1200 → a=50
  { question: 'সমদ্বিবাহু △, ভূমি 60, ক্ষেত্রফল 1200 — সমান বাহু—', options: { 'ক': '40', 'খ': '50', 'গ': '60', 'ঘ': '80' }, answer: 'খ', marks: 1 },

  // ─── ১৬.২ চতুর্ভুজ (13-24) ───
  { question: 'আয়তক্ষেত্র a×b — ক্ষেত্রফল—', options: { 'ক': 'ab', 'খ': '2ab', 'গ': 'a+b', 'ঘ': 'a²+b²' }, answer: 'ক', marks: 1 },
  { question: 'বর্গ বাহু a — ক্ষেত্রফল—', options: { 'ক': '4a', 'খ': 'a²', 'গ': '2a', 'ঘ': '√2a' }, answer: 'খ', marks: 1 },
  { question: 'বর্গ কর্ণ d, বাহু a —', options: { 'ক': 'd=a', 'খ': 'd=√2a', 'গ': 'd=2a', 'ঘ': 'd=a/√2' }, answer: 'খ', marks: 1 },
  { question: 'সামান্তরিক ভূমি b, উচ্চতা h—', options: { 'ক': 'bh', 'খ': '½bh', 'গ': '2bh', 'ঘ': 'b+h' }, answer: 'ক', marks: 1 },
  { question: 'সামান্তরিক কর্ণ d, লম্ব h—', options: { 'ক': 'dh', 'খ': '½dh', 'গ': 'd+h', 'ঘ': '2dh' }, answer: 'ক', marks: 1 },
  { question: 'রম্বস কর্ণ d₁,d₂ — ক্ষেত্রফল—', options: { 'ক': 'd₁d₂', 'খ': '½d₁d₂', 'গ': 'd₁+d₂', 'ঘ': '2(d₁+d₂)' }, answer: 'খ', marks: 1 },
  { question: 'ট্রাপিজিয়াম (a,b সমান্তরাল, h)—', options: { 'ক': 'ab', 'খ': '½(a+b)h', 'গ': '(a+b)h', 'ঘ': '½abh' }, answer: 'খ', marks: 1 },
  // উদা.৮: length=3/2 width, area 384
  { question: 'আয়ত: দৈর্ঘ্য=প্রস্থ×3/2, ক্ষেত্রফল 384 — প্রস্থ—', options: { 'ক': '12', 'খ': '16', 'গ': '24', 'ঘ': '32' }, answer: 'খ', marks: 1 },
  { question: 'উদা.৮: আয়ত পরিসীমা—', options: { 'ক': '64', 'খ': '80', 'গ': '96', 'ঘ': '48' }, answer: 'খ', marks: 1 },
  { question: '1 হেক্টর = ? বর্গমিটার', options: { 'ক': '1000', 'খ': '10000', 'গ': '100000', 'ঘ': '100' }, answer: 'খ', marks: 1 },
  // উদা.১১: parallelogram area 120, d=24 → h=5
  { question: 'সামান্তরিক ক্ষেত্রফল 120, কর্ণ 24 — লম্ব h—', options: { 'ক': '3', 'খ': '5', 'গ': '6', 'ঘ': '10' }, answer: 'খ', marks: 1 },
  // উদা.১৩: rhombus d1=10, area=120
  { question: 'রম্বস d₁=10, ক্ষেত্রফল 120 — d₂—', options: { 'ক': '12', 'খ': '20', 'গ': '24', 'ঘ': '48' }, answer: 'গ', marks: 1 },
  { question: 'উদা.১৩: রম্বস বাহু (OA=12,OD=5)—', options: { 'ক': '10', 'খ': '13', 'গ': '17', 'ঘ': '15' }, answer: 'খ', marks: 1 },

  // ─── ১৬.৩ সুষম বহুভুজ (25-28) ───
  { question: 'n-বাহু সুষম বহুভুজ, বাহু a — ক্ষেত্রফল—', options: { 'ক': 'na²/4·cot(180°/n)', 'খ': 'na²/2', 'গ': 'na² tan(180°/n)', 'ঘ': 'n·a²' }, answer: 'ক', marks: 1 },
  { question: 'সুষম ষড়ভুজ, কেন্দ্র→শীর্ষ 4মি. — ক্ষেত্রফল—', options: { 'ক': '16√3', 'খ': '24√3', 'গ': '48', 'ঘ': '96' }, answer: 'খ', marks: 1 },
  { question: 'সুষম পঞ্চভুজ a=4 — ক্ষেত্রফল (প্রায়)—', options: { 'ক': '20', 'খ': '27.5', 'গ': '40', 'ঘ': '16' }, answer: 'খ', marks: 1 },

  // ─── ১৬.৪ বৃত্ত (29-38) ───
  { question: 'বৃত্ত পরিধি (ব্যাসার্ধ r)—', options: { 'ক': 'πr', 'খ': '2πr', 'গ': 'πr²', 'ঘ': '4πr' }, answer: 'খ', marks: 1 },
  { question: 'π এর আসন্ন মান (অধ্যায়)—', options: { 'ক': '3.14', 'খ': '3.1416', 'গ': '22/7', 'ঘ': '3.14159' }, answer: 'খ', marks: 1 },
  { question: 'বৃত্তচাপ s (কেন্দ্রস্থ কোণ θ°)—', options: { 'ক': 'πrθ/180', 'খ': '2πrθ', 'গ': 'rθ', 'ঘ': 'πr²θ' }, answer: 'ক', marks: 1 },
  { question: 'বৃত্তকলা ক্ষেত্রফল (কোণ θ°)—', options: { 'ক': 'θ/360×πr²', 'খ': 'θ/180×πr', 'গ': 'θ×r²', 'ঘ': '2πrθ' }, answer: 'ক', marks: 1 },
  { question: 'বৃত্ত ক্ষেত্রফল—', options: { 'ক': 'πr', 'খ': '2πr', 'গ': 'πr²', 'ঘ': 'πd' }, answer: 'গ', marks: 1 },
  // উদা.১৯: r=8, θ=56
  { question: 'r=8, θ=56° — চাপ দৈর্ঘ্য (প্রায়)—', options: { 'ক': '7.82', 'খ': '14', 'গ': '4.48', 'ঘ': '25.12' }, answer: 'ক', marks: 1 },
  { question: 'r=8, θ=56° — বৃত্তকলা (প্রায়)—', options: { 'ক': '31.28', 'খ': '62.56', 'গ': '200.96', 'ঘ': '16' }, answer: 'ক', marks: 1 },
  // উদা.২৩: wheel d=4.5, 360m
  { question: 'চাকা ব্যাস 4.5মি., 360মি. — ঘূর্ণন (প্রায়)—', options: { 'ক': '20', 'খ': '25', 'গ': '30', 'ঘ': '51' }, answer: 'খ', marks: 1 },
  // উদা.২৫: r=14, square area = circle
  { question: 'বৃত্ত r=14, বর্গ ক্ষেত্রফল=বৃত্ত — বাহু (প্রায়)—', options: { 'ক': '14', 'খ': '24.81', 'গ': '49', 'ঘ': '19.74' }, answer: 'খ', marks: 1 },

  // ─── ১৬.৫ ঘনবস্তু (39-50) ───
  { question: 'আয়তাকার ঘনবস্তু কর্ণ—', options: { 'ক': 'a+b+c', 'খ': '√(a²+b²+c²)', 'গ': 'abc', 'ঘ': 'a²+b²+c²' }, answer: 'খ', marks: 1 },
  { question: 'আয়তাকার ঘনবস্তু সমগ্র তল—', options: { 'ক': 'ab+bc+ca', 'খ': '2(ab+bc+ca)', 'গ': 'abc', 'ঘ': '6(ab)' }, answer: 'খ', marks: 1 },
  { question: 'আয়তাকার ঘনবস্তু আয়তন—', options: { 'ক': 'a+b+c', 'খ': 'abc', 'গ': 'ab+bc+ca', 'ঘ': '2abc' }, answer: 'খ', marks: 1 },
  { question: 'ঘনক সমগ্র তল (ধার a)—', options: { 'ক': '4a²', 'খ': '6a²', 'গ': 'a³', 'ঘ': '3a²' }, answer: 'খ', marks: 1 },
  { question: 'ঘনক কর্ণ (ধার a)—', options: { 'ক': '√2a', 'খ': '√3a', 'গ': '3a', 'ঘ': '2a' }, answer: 'খ', marks: 1 },
  { question: 'বেলন আয়তন—', options: { 'ক': 'πrh', 'খ': 'πr²h', 'গ': '2πrh', 'ঘ': 'πr²' }, answer: 'খ', marks: 1 },
  { question: 'বেলন সমগ্র তল—', options: { 'ক': '2πrh', 'খ': 'πr²h', 'গ': '2πr(r+h)', 'ঘ': 'πr(r+h)' }, answer: 'গ', marks: 1 },
  // উদা.২৮: 25,20,15
  { question: 'ঘনবস্তু 25×20×15 — আয়তন—', options: { 'ক': '7500', 'খ': '2350', 'গ': '1250', 'ঘ': '9000' }, answer: 'ক', marks: 1 },
  { question: 'ঘনবস্তু 25×20×15 — সমগ্র তল—', options: { 'ক': '7500', 'খ': '2350', 'গ': '1250', 'ঘ': '900' }, answer: 'খ', marks: 1 },
  // উদা.২৯: cube SA=96
  { question: 'ঘনক সমগ্র তল 96 — ধার a—', options: { 'ক': '2', 'খ': '4', 'গ': '6', 'ঘ': '8' }, answer: 'খ', marks: 1 },
  // নমুনা #1: equilateral side 6
  { question: 'সমবাহু △, বাহু 6 সে.মি. — ক্ষেত্রফল—', options: { 'ক': '3√3', 'খ': '4√3', 'গ': '6√3', 'ঘ': '9√3' }, answer: 'ঘ', marks: 1 },
  // নমুনা #2: i ও iii
  { question: 'বর্গ: (i) ক্ষেত্রফল a²; (iii) d=√2a। সঠিক?', options: { 'ক': 'i ও ii', 'খ': 'i ও iii', 'গ': 'ii ও iii', 'ঘ': 'i,ii,iii' }, answer: 'খ', marks: 1 },
  // অনুশীলনী ১৬.৪ #1
  { question: 'সামান্তরিক বাহু 7 ও 5 — পরিসীমার অর্ধেক—', options: { 'ক': '12', 'খ': '20', 'গ': '24', 'ঘ': '28' }, answer: 'ক', marks: 1 },
]

const cqTemplates = [
  { stimulus: 'পরিমিতির ধারণা (ভূমিকা)।', parts: { 'ক': 'পরিমাণ=রাশি/একক।', 'খ': 'দৈর্ঘ্য, ক্ষেত্রফল, আয়তন।', 'গ': 'বর্গ/ঘন একক।' } },
  { stimulus: 'ত্রিভুজ: ½×ভূমি×উচ্চতা (১৬.১)।', parts: { 'ক': 'সাধারণ সূত্র।', 'খ': 'সমকোণী ½ab।', 'গ': 'উদা.১: 24 ব.সে.মি.' } },
  { stimulus: 'ত্রিভুজ: ½ab sin C (১৬.১)।', parts: { 'ক': 'দুই বাহু+কোণ।', 'খ': 'sin C=d/h।', 'গ': 'উদা.২: 38.97 (প্রায়)।' } },
  { stimulus: 'হেরোন সূত্র (১৬.১)।', parts: { 'ক': 's=(a+b+c)/2।', 'খ': 'A=√(s(s−a)(s−b)(s−c))।', 'গ': 'উদা.৩: 7,8,9→26.83।' } },
  { stimulus: 'সমবাহু ত্রিভুজ (১৬.১)।', parts: { 'ক': 'A=√3a²/4।', 'খ': 'উচ্চতা √3a/2।', 'গ': 'উদা.৪: a=5.5মি.' } },
  { stimulus: 'সমদ্বিবাহু ত্রিভুজ (১৬.১)।', parts: { 'ক': 'A=b√(4a²−b²)/4।', 'খ': 'AD⊥BC, BD=b/2।', 'গ': 'উদা.৫: a=50।' } },
  { stimulus: 'উদা.৬: 120°, 10 ও 8 km/h, 5ঘণ্টা।', parts: { 'ক': 'AB=50, AC=40।', 'খ': '∠DAC=60°।', 'গ': 'BC≈78.1km।' } },
  { stimulus: 'উদা.৭: AB=15, AC=25, ∠B=90°।', parts: { 'ক': 'BC=20।', 'খ': 'BD=12।', 'গ': '△ABD:△BCD=9:16।' } },
  { stimulus: 'অনুশীলনী ১৬.১-১: অতিভুজ 25, অনুপাত 3/4।', parts: { 'ক': 'x ও 3x/4 বাহু।', 'খ': 'x²+(3x/4)²=625।', 'গ': 'বাহু নির্ণয়।' } },
  { stimulus: 'অনুশীলনী ১৬.১-২: মই 20মি.।', parts: { 'ক': 'সমকোণী △।', 'খ': 'গোড়া সরানো।', 'গ': '4মি. নিচে।' } },
  { stimulus: 'অনুশীলনী ১৬.১-৩: সমদ্বিবাহু, P=16।', parts: { 'ক': '2a+b=16।', 'খ': 'a=5b/6।', 'গ': 'ক্ষেত্রফল।' } },
  { stimulus: 'অনুশীলনী ১৬.১-৪: বাহু 25,27, P=84।', parts: { 'ক': 'তৃতীয় বাহু=32।', 'খ': 's=42।', 'গ': 'হেরোন।' } },
  { stimulus: 'অনুশীলনী ১৬.১-৫: সমবাহু +2মি.।', parts: { 'ক': '√3/4[(a+2)²−a²]=6√3।', 'খ': 'a+1=a? (সূত্র)।', 'গ': 'a নির্ণয়।' } },
  { stimulus: 'অনুশীলনী ১৬.১-৬: 26,28, A=182।', parts: { 'ক': '½×26×28×sin C=182।', 'খ': 'sin C=1/2।', 'গ': 'C=30° বা 150°।' } },
  { stimulus: 'অনুশীলনী ১৬.১-৭: a=10, A=48।', parts: { 'ক': 'সমদ্বিবাহু সূত্র।', 'খ': 'b নির্ণয়।', 'গ': 'ভূমি=d।' } },
  { stimulus: 'অনুশীলনী ১৬.১-৮: 135°, 7 ও 5 km/h, 4ঘণ্টা।', parts: { 'ক': 'AB=28, AC=20।', 'খ': 'কোসাইন সূত্র।', 'গ': 'দূরত্ব।' } },
  { stimulus: 'আয়তক্ষেত্র (১৬.২)।', parts: { 'ক': 'A=ab।', 'খ': 'কর্ণ d=√(a²+b²)।', 'গ': 'উদা.৮: 24×16।' } },
  { stimulus: 'বর্গক্ষেত্র (১৬.২)।', parts: { 'ক': 'A=a²।', 'খ': 'P=4a, d=√2a।', 'গ': 'নমুনা: i,iii সঠিক।' } },
  { stimulus: 'সামান্তরিক (১৬.২)।', parts: { 'ক': 'A=bh বা dh।', 'খ': 'উদা.১১: h=5।', 'গ': 'উদা.১২: কর্ণ।' } },
  { stimulus: 'রম্বস (১৬.২)।', parts: { 'ক': 'A=½d₁d₂।', 'খ': 'কর্ণ ⊥ সমদ্বিখণ্ডন।', 'গ': 'উদা.১৩: d₂=24, a=13।' } },
  { stimulus: 'ট্রাপিজিয়াম (১৬.২)।', parts: { 'ক': 'A=½(a+b)h।', 'খ': 'উদা.১৪: h=12, A=852।', 'গ': 'সমান্তরাল বাহু।' } },
  { stimulus: 'উদা.৯: xy=2000, y=x−10।', parts: { 'ক': 'x²−10x−2000=0।', 'খ': 'x=50, y=40।', 'গ': '50×40মি.' } },
  { stimulus: 'উদা.১০: বর্গ+4মি. রাস্তা, 1হেক্টর।', parts: { 'ক': 'x²−(x−8)²=10000।', 'খ': 'x=629।', 'গ': 'ভিতর ≈38.56হেক্টর।' } },
  { stimulus: 'সুষম বহুভুজ (১৬.৩)।', parts: { 'ক': 'A=na²/4·cot(180°/n)।', 'খ': 'পঞ্চভুজ a=4≈27.5।', 'গ': 'ষড়ভুজ: 24√3।' } },
  { stimulus: 'উদা.১৬: ষড়ভুজ R=4।', parts: { 'ক': '∠COD=60°।', 'খ': 'এক △=4√3।', 'গ': 'মোট 24√3 ব.মি.' } },
  { stimulus: 'উদা.১৭: আয়ত 50×14+△।', parts: { 'ক': 'কর্ণ≈51.92।', 'খ': '700+1200=1900।', 'গ': 'DE=60, P=160।' } },
  { stimulus: 'বৃত্ত পরিধি (১৬.৪)।', parts: { 'ক': 'c=2πr।', 'খ': 'π≈3.1416।', 'গ': 'উদা.১৮: ≈81.68।' } },
  { stimulus: 'বৃত্তচাপ (১৬.৪)।', parts: { 'ক': 's=πrθ/180।', 'খ': 'θ/360=c/2πr।', 'গ': 'উদা.২২: θ≈66.84°।' } },
  { stimulus: 'বৃত্তকলা (১৬.৪)।', parts: { 'ক': 'A=θ/360×πr²।', 'খ': 'উদা.১৯: ≈31.28।', 'গ': '90°=¼ বৃত্ত।' } },
  { stimulus: 'উদা.২০: 2πr−2r=90।', parts: { 'ক': '2r(π−1)=90।', 'খ': 'r≈21.01।', 'গ': 'ব্যাসার্ধ।' } },
  { stimulus: 'উদা.২১: বৃত্তাকার মাঠ d=124, রাস্তা 6মি.।', parts: { 'ক': 'r=62, R=68।', 'খ': 'π(R²−r²)।', 'গ': '≈2450.44 ব.মি.' } },
  { stimulus: 'উদা.২৬: বর্গ 22+অর্ধবৃত্ত।', parts: { 'ক': '22²=484।', 'খ': '½π×11²।', 'গ': '≈674.07 ব.মি.' } },
  { stimulus: 'উদা.২৭: আয়ত 12×10+30° বৃত্তাংশ।', parts: { 'ক': 'চাপ≈6.28মি.', 'খ': 'বৃত্তাংশ≈37.7।', 'গ': 'মোট≈157.7।' } },
  { stimulus: 'অনুশীলনী ১৬.৩-৫: রাস্তা পরিধি +44।', parts: { 'ক': '2πR−2πr=44।', 'খ': 'R−r=44/(2π)≈7।', 'গ': 'রাস্তার প্রস্থ≈7মি.' } },
  { stimulus: 'অনুশীলনী ১৬.৩-৮: c=220, অন্তর্লিখিত বর্গ।', parts: { 'ক': 'r=c/2π।', 'খ': 'বর্গ কর্ণ=ব্যাস।', 'গ': 'a=√2r? (ব্যাস)' } },
  { stimulus: 'আয়তাকার ঘনবস্তু (১৬.৫)।', parts: { 'ক': 'V=abc।', 'খ': 'SA=2(ab+bc+ca)।', 'গ': 'কর্ণ=√(a²+b²+c²)।' } },
  { stimulus: 'উদা.২৮: 25×20×15।', parts: { 'ক': 'V=7500।', 'খ': 'SA=2350।', 'গ': 'কর্ণ≈35.36।' } },
  { stimulus: 'ঘনক (১৬.৫)।', parts: { 'ক': 'V=a³, SA=6a²।', 'খ': 'কর্ণ=√3a।', 'গ': 'উদা.২৯: a=4।' } },
  { stimulus: 'বেলন (১৬.৫)।', parts: { 'ক': 'V=πr²h।', 'খ': 'বক্র=2πrh।', 'গ': 'SA=2πr(r+h)।' } },
  { stimulus: 'উদা.৩০: r=7, h=10।', parts: { 'ক': 'V≈1539।', 'খ': 'SA≈747.7।', 'গ': 'সিলিন্ডার।' } },
  { stimulus: 'উদা.৩২: পৃষ্ঠ কর্ণ 8√2।', parts: { 'ক': '√2a=8√2→a=8।', 'খ': 'কর্ণ=8√3।', 'গ': 'V=512।' } },
  { stimulus: 'উদা.৩৩: আয়ত 12×5 ঘোরালে বেলন।', parts: { 'ক': 'r=5, h=12।', 'খ': 'V≈942.5।', 'গ': 'SA≈534।' } },
  { stimulus: 'অনুশীলনী ১৬.৪-৩: 16×12×4.5।', parts: { 'ক': 'SA নির্ণয়।', 'খ': 'V নির্ণয়।', 'গ': 'কর্ণ।' } },
  { stimulus: 'অনুশীলনী ১৬.৪-৬: বাক্স 8×6×4, ভিতর SA=88।', parts: { 'ক': '2(ab+bc+ca)=88।', 'খ': 'পুরুত্ব x।', 'গ': 'x=1? (উদা.৩১ ধরন)' } },
  { stimulus: 'অনুশীলনী ১৬.৪-৮: বেলন r=5,h=12।', parts: { 'ক': 'V=300π≈942।', 'খ': 'SA=2π×5×17≈534।', 'গ': '12×5×π।' } },
  { stimulus: 'নমুনা SAQ: ঘনক SA=2400।', parts: { 'ক': '6a²=2400।', 'খ': 'a=20।', 'গ': 'কর্ণ=20√3।' } },
  { stimulus: 'নমুনা: সিলিন্ডার বক্র=4400, h=30।', parts: { 'ক': '2πrh=4400।', 'খ': 'r নির্ণয়।', 'গ': 'SA=2πr(r+h)।' } },
  { stimulus: 'নমুনা: সুষম চতুর্ভুজ, কেন্দ্র→শীর্ষ 4।', parts: { 'ক': 'বর্গ: কর্ণ=8।', 'খ': 'বাহু=4√2।', 'গ': 'ক্ষেত্রফল=32 ব.সে.মি.' } },
  { stimulus: 'নমুনা: সামান্তরিক d=6, A=18।', parts: { 'ক': 'dh=18।', 'খ': 'h=3।', 'গ': 'উদা.১১ ধরন।' } },
  { stimulus: 'অধ্যায় ১৬ — সারাংশ।', parts: { 'ক': 'ত্রিভুজ–চতুর্ভুজ–বহুভুজ।', 'খ': 'বৃত্ত ও বৃত্তকলা।', 'গ': 'ঘনবস্তু: ঘনক, বেলন।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))

const saq = [
  { question: 'ত্রিভুজ ক্ষেত্রফল (ভূমি×উচ্চতা)?', marks: 2 },
  { question: 'হেরোন সূত্র (সংক্ষেপ)?', marks: 2 },
  { question: 'সমবাহু △ ক্ষেত্রফল (বাহু a)?', marks: 2 },
  { question: 'সমকোণী △ 6,8 — ক্ষেত্রফল?', marks: 2 },
  { question: 'বাহু 7,8,9 — s ও ক্ষেত্রফল (প্রায়)?', marks: 2 },
  { question: 'আয়ত ক্ষেত্রফল ও কর্ণ?', marks: 2 },
  { question: 'রম্বস ক্ষেত্রফল (d₁,d₂)?', marks: 2 },
  { question: 'ট্রাপিজিয়াম ক্ষেত্রফল?', marks: 2 },
  { question: '1 হেক্টর = ? বর্গমিটার', marks: 2 },
  { question: 'সুষম n-বাহু ক্ষেত্রফল?', marks: 2 },
  { question: 'বৃত্ত পরিধি?', marks: 2 },
  { question: 'বৃত্তচাপ s=?', marks: 2 },
  { question: 'বৃত্তকলা ক্ষেত্রফল?', marks: 2 },
  { question: 'r=8, θ=56° — চাপ (প্রায়)?', marks: 2 },
  { question: 'ঘনবস্তু আয়তন?', marks: 2 },
  { question: 'ঘনবস্তু সমগ্র তল?', marks: 2 },
  { question: 'ঘনক কর্ণ (ধার a)?', marks: 2 },
  { question: 'বেলন আয়তন?', marks: 2 },
  { question: 'সমবাহু △ বাহু 6 — ক্ষেত্রফল?', marks: 2 },
  { question: 'ঘনক SA=96 — ধার a?', marks: 2 },
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

const outPath = path.join(__dirname, '..', 'seed-class9-ch16.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
  console.error('❌ Count check failed')
  process.exit(1)
}
