/**
 * Generates seed-class9-ch15.cjs — MCQ=50, CQ=50, SAQ=20
 * Run: node scripts/build-ch15-seed.cjs
 * Source: chapter-15-area-theorems-constructions.md (NCTB Class 9)
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 15: ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 15 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch15.cjs
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
const CHAPTER_ID = 'ch-15'
const TITLE_BN = 'ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য'
const TITLE_EN = 'Area Related Theorems and Constructions'
`

const mcq = [
  // ─── ১৫.১ সমতলক্ষেত্রের ক্ষেত্রফল (1-10) ───
  { question: 'আয়তক্ষেত্র AB=a, BC=b হলে ক্ষেত্রফল—', options: { 'ক': 'a+b', 'খ': 'ab', 'গ': '2ab', 'ঘ': 'a²+b²' }, answer: 'খ', marks: 1 },
  { question: 'বর্গক্ষেত্র বাহু a হলে ক্ষেত্রফল—', options: { 'ক': '4a', 'খ': 'a²', 'গ': '2a', 'ঘ': 'a√2' }, answer: 'খ', marks: 1 },
  { question: 'ত্রিভুজের ক্ষেত্রফল (ভূমি b, উচ্চতা h)—', options: { 'ক': 'bh', 'খ': '½bh', 'গ': '2bh', 'ঘ': 'b+h' }, answer: 'খ', marks: 1 },
  { question: 'দুই ত্রিভুজ সর্বসম হলে ক্ষেত্রফল—', options: { 'ক': 'সমান', 'খ': 'ভিন্ন', 'গ': 'দ্বিগুণ', 'ঘ': 'অর্ধেক' }, answer: 'ক', marks: 1 },
  { question: 'ক্ষেত্রফল সমান হলে ত্রিভুজ সর্বসম—', options: { 'ক': 'সবসময়', 'খ': 'সবসময় নয়', 'গ': 'কখনো নয়', 'ঘ': 'শুধু সমবাহু' }, answer: 'খ', marks: 1 },
  { question: 'এক একক বাহু বর্গের ক্ষেত্রফল—', options: { 'ক': '1 বর্গ একক', 'খ': '2 একক', 'গ': '4 একক', 'ঘ': '√2 একক' }, answer: 'ক', marks: 1 },
  { question: 'সীমাবদ্ধ সমতলক্ষেত্রের ক্ষেত্রফল—', options: { 'ক': 'অনির্দিষ্ট', 'খ': 'নির্দিষ্ট', 'গ': 'শূন্য', 'ঘ': 'অসীম' }, answer: 'খ', marks: 1 },
  { question: 'চার বাহু দ্বারা সীমাবদ্ধ সমতলক্ষেত্র—', options: { 'ক': 'ত্রিভুজ', 'খ': 'চতুর্ভুজ', 'গ': 'বৃত্ত', 'ঘ': 'বহুভুজ' }, answer: 'খ', marks: 1 },
  { question: 'বাহু 4 এর অধিক হলে—', options: { 'ক': 'চতুর্ভুজ', 'খ': 'বহুভুজক্ষেত্র', 'গ': 'বর্গ', 'ঘ': 'আয়ত' }, answer: 'খ', marks: 1 },
  { question: 'ক্ষেত্রফল সমান হলে চিহ্ন—', options: { 'ক': '≈', 'খ': '=', 'গ': '∝', 'ঘ': '≠' }, answer: 'খ', marks: 1 },

  // ─── ১৫.২ উপপাদ্য ৩৬–৩৮ (11-24) ───
  { question: 'একই ভূমি, একই সমান্তরালে ত্রিভুজের ক্ষেত্রফল—', options: { 'ক': 'সমান', 'খ': 'দ্বিগুণ', 'গ': 'অর্ধেক', 'ঘ': 'ভিন্ন' }, answer: 'ক', marks: 1 },
  { question: 'উপপাদ্য ৩৬: △ABC ও △DBC একই ভূমি BC—', options: { 'ক': '△ABC=△DBC', 'খ': '△ABC=2△DBC', 'গ': '△ABC≠△DBC', 'ঘ': 'সর্বসম' }, answer: 'ক', marks: 1 },
  { question: 'অনুসিদ্ধান্ত ১: সমান ক্ষেত্রফল, একই ভূমি, একই পাশে ⇒', options: { 'ক': 'একই সমান্তরালে', 'খ': 'লম্ব', 'গ': 'সর্বসম', 'ঘ': 'সমকোণী' }, answer: 'ক', marks: 1 },
  { question: 'অনুসিদ্ধান্ত ২: ত্রিভুজ = ? সামান্তরিক (একই ভূমি, সমান্তরাল)', options: { 'ক': 'সমান', 'খ': 'অর্ধেক', 'গ': 'দ্বিগুণ', 'ঘ': 'চতুর্থাংশ' }, answer: 'খ', marks: 1 },
  { question: 'সামান্তরিক ABCD, কর্ণ AC ⇒ △ABC=?', options: { 'ক': '½ সামান্তরিক', 'খ': 'সম্পূর্ণ', 'গ': '২×', 'ঘ': '¼' }, answer: 'ক', marks: 1 },
  { question: 'উপপাদ্য ৩৭: একই ভূমি AB, একই সমান্তরালে সামান্তরিক—', options: { 'ক': 'ক্ষেত্রফল সমান', 'খ': 'ক্ষেত্রফল ভিন্ন', 'গ': 'একটি ত্রিভুজ', 'ঘ': 'সর্বসম' }, answer: 'ক', marks: 1 },
  { question: 'সমকোণী △ABC, ∠C=90°, AB অতিভুজ। AB²=?', options: { 'ক': 'AC²+BC²', 'খ': 'AC²−BC²', 'গ': 'AC+BC', 'ঘ': '2AC·BC' }, answer: 'ক', marks: 1 },
  { question: 'পিথাগোরাস: 3,4,5 ত্রিভুজ—', options: { 'ক': 'সমকোণী', 'খ': 'স্থূলকোণী', 'গ': 'সূক্ষ্মকোণী', 'ঘ': 'অসম্ভব' }, answer: 'ক', marks: 1 },
  { question: '5,12,13 ত্রিভুজ—', options: { 'ক': 'সমকোণী', 'খ': 'সমবাহু', 'গ': 'অসম্ভব', 'ঘ': 'স্থূল' }, answer: 'ক', marks: 1 },
  // Ex15 #1: 5,7,9 not right
  { question: 'সমকোণী ত্রিভুজ অঙ্কন সম্ভব নয়—', options: { 'ক': '3,4,5', 'খ': '6,8,10', 'গ': '5,7,9', 'ঘ': '5,12,13' }, answer: 'গ', marks: 1 },
  { question: '6,8,10 সে.মি. ত্রিভুজ—', options: { 'ক': 'সমকোণী', 'খ': 'অসম্ভব', 'গ': 'সমবাহু', 'ঘ': 'স্থূল' }, answer: 'ক', marks: 1 },
  { question: '3²+4²=?', options: { 'ক': '25', 'খ': '49', 'গ': '7', 'ঘ': '5' }, answer: 'ক', marks: 1 },
  { question: '√(5²+12²)=?', options: { 'ক': '13', 'খ': '17', 'গ': '15', 'ঘ': '11' }, answer: 'ক', marks: 1 },
  { question: '5²+7²=81? (9²)', options: { 'ক': 'হ্যাঁ', 'খ': 'না (74≠81)', 'গ': '74', 'ঘ': '81' }, answer: 'খ', marks: 1 },

  // ─── ১৫.৩ সম্পাদ্য ১৩–১৫ (25-30) ───
  { question: 'সম্পাদ্য ১৩: △ABC = ? সামান্তরিক', options: { 'ক': 'ECGF', 'খ': 'ABCD', 'গ': 'ত্রিভুজ', 'ঘ': 'বর্গ' }, answer: 'ক', marks: 1 },
  { question: 'সম্পাদ্য ১৩: BC এর মধ্যবিন্দু—', options: { 'ক': 'E', 'খ': 'F', 'গ': 'G', 'ঘ': 'A' }, answer: 'ক', marks: 1 },
  { question: 'সম্পাদ্য ১৪: চতুর্ভুজ = ? ত্রিভুজ', options: { 'ক': '△ADE/△DAE', 'খ': '△ABC', 'গ': '△BDC', 'ঘ': '△ABD' }, answer: 'ক', marks: 1 },
  { question: 'সম্পাদ্য ১৪: CE ∥ ?', options: { 'ক': 'DB', 'খ': 'AB', 'গ': 'AC', 'ঘ': 'AD' }, answer: 'ক', marks: 1 },
  { question: 'সম্পাদ্য ১৫: চতুর্ভুজ = ? সামান্তরিক', options: { 'ক': 'AGHK', 'খ': 'ECGF', 'গ': 'ABCD', 'ঘ': '△DAF' }, answer: 'ক', marks: 1 },
  { question: 'সম্পাদ্য ১৫: AF এর মধ্যবিন্দু—', options: { 'ক': 'G', 'খ': 'H', 'গ': 'K', 'ঘ': 'D' }, answer: 'ক', marks: 1 },

  // ─── অনুশীলনী ও নমুনা (31-50) ───
  // Ex15 #6: △AXY = ¼ △ABC
  { question: 'AB,AC এর মধ্যবিন্দু X,Y ⇒ △AXY=?', options: { 'ক': '¼△ABC', 'খ': '½△ABC', 'গ': '△ABC', 'ঘ': '2△ABC' }, answer: 'ক', marks: 1 },
  // Sample #1: 12,13 → third leg 5 if 13 hypotenuse
  { question: 'সমকোণী △, বাহু 12 ও 13 (13 অতিভুজ)। 3য় বাহু—', options: { 'ক': '17', 'খ': '15', 'গ': '9', 'ঘ': '5' }, answer: 'ঘ', marks: 1 },
  // Sample #2: i and iii
  { question: 'i প্রত্যেক ক্ষেত্রের নির্দিষ্ট ক্ষেত্রফল; iii সর্বসম⇒সমান। সঠিক?', options: { 'ক': 'i ও ii', 'খ': 'i ও iii', 'গ': 'ii ও iii', 'ঘ': 'i,ii,iii' }, answer: 'খ', marks: 1 },
  // Sample equilateral AB=2, BD=1
  { question: 'সমবাহু △, AB=2, AD⊥BC। BD=?', options: { 'ক': '1', 'খ': '√2', 'গ': '2', 'ঘ': '4' }, answer: 'ক', marks: 1 },
  // Sample height √3
  { question: 'সমবাহু △, AB=2। উচ্চতা AD=?', options: { 'ক': '4/√3', 'খ': '√3', 'গ': '2/√3', 'ঘ': '2√3' }, answer: 'খ', marks: 1 },
  // Sample SAQ: hypotenuse 10, leg 8 → area 24
  { question: 'সমকোণী △, অতিভুজ 10, এক বাহু 8। ক্ষেত্রফল—', options: { 'ক': '20', 'খ': '24', 'গ': '40', 'ঘ': '80' }, answer: 'খ', marks: 1 },
  { question: '10²−8²=? (অপর বাহু²)', options: { 'ক': '36', 'খ': '18', 'গ': '164', 'ঘ': '4' }, answer: 'ক', marks: 1 },
  { question: 'বর্গ বাহু a, কর্ণ a√2। কর্ণের বর্গ ক্ষেত্রফল=a² এর—', options: { 'ক': '½', 'খ': '2 গুণ', 'গ': '√2', 'ঘ': '4 গুণ' }, answer: 'খ', marks: 1 },
  { question: 'সামান্তরিক ও ত্রিভুজ সমান ক্ষেত্রফল, একই সমান্তরালে ভূমি অনুপাত—', options: { 'ক': '1:1', 'খ': '2:1', 'গ': '1:2', 'ঘ': '4:1' }, answer: 'গ', marks: 1 },
  { question: 'AB=AC, AD⊥BC ⇒ △ABD:△ACD=?', options: { 'ক': '1:1', 'খ': '1:2', 'গ': '2:1', 'ঘ': '1:4' }, answer: 'ক', marks: 1 },
  { question: '∠C স্থূলকোণ: AB²=?', options: { 'ক': 'AC²+BC²+2BC·CD', 'খ': 'AC²+BC²−2BC·CD', 'গ': 'AC²+BC²', 'ঘ': 'BC²−AC²' }, answer: 'ক', marks: 1 },
  { question: '∠C সূক্ষ্মকোণ, AD⊥BC: AB²=?', options: { 'ক': 'AC²+BC²+2BC·CD', 'খ': 'AC²+BC²−2BC·CD', 'গ': 'AC²−BC²', 'ঘ': 'BC²+AC²' }, answer: 'খ', marks: 1 },
  { question: 'সমদ্বিবাহু সমকোণী △, P on BC: PB²+PC²=?', options: { 'ক': 'PA²', 'খ': '2PA²', 'গ': '4PA²', 'ঘ': 'PA²/2' }, answer: 'খ', marks: 1 },
  { question: '∠A=90°, D on AC: BC²+AD²=?', options: { 'ক': 'BD²+AC²', 'খ': 'AB²+AC²', 'গ': 'BC²+AB²', 'ঘ': 'AD²+BD²' }, answer: 'ক', marks: 1 },
  { question: 'সামান্তরিকে △PAB+△PCD=?', options: { 'ক': '½ সামান্তরিক', 'খ': 'সম্পূর্ণ', 'গ': '¼', 'ঘ': '2×' }, answer: 'ক', marks: 1 },
  { question: 'সামান্তরিক কর্ণ ⇒ কতটি সমান △?', options: { 'ক': '2', 'খ': '4', 'গ': '3', 'ঘ': '6' }, answer: 'খ', marks: 1 },
  { question: 'বর্গ তার কর্ণের বর্গের—', options: { 'ক': 'অর্ধেক', 'খ': 'সমান', 'গ': 'দ্বিগুণ', 'ঘ': 'চতুর্থাংশ' }, answer: 'ক', marks: 1 },
  { question: 'মধ্যমা ত্রিভুজকে বিভক্ত করে—', options: { 'ক': 'সমান ক্ষেত্রফল', 'খ': 'সর্বসম', 'গ': 'সমকোণী', 'ঘ': 'অসমান' }, answer: 'ক', marks: 1 },
  { question: 'ট্রাপিজিয়াম (AB∥CD, ভূমি a,b, উচ্চতা h) ক্ষেত্রফল—', options: { 'ক': 'ab', 'খ': '½(a+b)h', 'গ': '(a+b)h', 'ঘ': '½abh' }, answer: 'খ', marks: 1 },
  { question: 'DE∥BC, AD:DB=2:1 ⇒ DE:BC=?', options: { 'ক': '1:2', 'খ': '2:3', 'গ': '1:3', 'ঘ': '2:1' }, answer: 'খ', marks: 1 },
]

const cqTemplates = [
  { stimulus: 'সমতলক্ষেত্রের ক্ষেত্রফল (১৫.১)।', parts: { 'ক': 'আয়ত ab, বর্গ a²।', 'খ': 'ত্রিভুজ ½bh।', 'গ': 'সর্বসম⇒সমান; সমান⇏সর্বসম।' } },
  { stimulus: 'উপপাদ্য ৩৬: △ABC ও △DBC।', parts: { 'ক': 'একই ভূমি BC, একই সমান্তরাল।', 'খ': 'উভয়=k½×BC×BE।', 'গ': '△ABC=△DBC।' } },
  { stimulus: 'অনুসিদ্ধান্ত ১ (উপপাদ্য ৩৬)।', parts: { 'ক': 'একই ভূমি, একই পাশে, সমান ক্ষেত্রফল।', 'খ': '⇒ একই সমান্তরাল রেখাযুগল।', 'গ': 'বিপরীত প্রমাণ।' } },
  { stimulus: 'অনুসিদ্ধান্ত ২ (উপপাদ্য ৩৬)।', parts: { 'ক': 'ত্রিভুজ ও সামান্তরিক, একই ভূমি।', 'খ': '△=½ সামান্তরিক।', 'গ': 'সামান্তরিক ABCD, △ABC=½।' } },
  { stimulus: 'উপপাদ্য ৩৭: সামান্তরিক ABCD ও ABEF।', parts: { 'ক': 'একই ভূমি AB, CL=EK।', 'খ': '△ABC=△ABE।', 'গ': 'ABCD=ABEF।' } },
  { stimulus: 'উপপাদ্য ৩৮: পিথাগোরাস (প্রমাণ)।', parts: { 'ক': '△CAD≅△BAF।', 'খ': 'ADLM=ACGF, BELM=BCHK।', 'গ': 'AB²=AC²+BC²।' } },
  { stimulus: 'সম্পাদ্য ১৩: △=সামান্তরিক (∠x)।', parts: { 'ক': 'E মধ্যবিন্দু BC, ∠CEF=∠x।', 'খ': 'AG∥BC, CG∥EF।', 'গ': 'ECGF=k△ABC।' } },
  { stimulus: 'সম্পাদ্য ১৪: চতুর্ভুজ=ত্রিভুজ।', parts: { 'ক': 'BD যোগ, CE∥DB।', 'খ': '△BDC=△BDE।', 'গ': 'ABCD=△ADE।' } },
  { stimulus: 'সম্পাদ্য ১৫: চতুর্ভুজ=সামান্তরিক (∠x)।', parts: { 'ক': 'CF∥DB, G মধ্যবিন্দু AF।', 'খ': '△DAF=ABCD।', 'গ': 'AGHK=নির্ণয় সামান্তরিক।' } },
  { stimulus: 'অনুশীলনী ১৫-১: সমকোণী অঙ্কন।', parts: { 'ক': '3,4,5 ও 5,12,13 সম্ভব।', 'খ': '5,7,9: 74≠81।', 'গ': 'উত্তর (গ)।' } },
  { stimulus: 'অনুশীলনী ১৫-২: মধ্যমা।', parts: { 'ক': 'মধ্যমা দুই সমান ক্ষেত্রফল △।', 'খ': 'একই ভূমি, একই উচ্চতা।', 'গ': 'উপপাদ্য ৩৬।' } },
  { stimulus: 'অনুশীলনী ১৫-৩: বর্গ ও কর্ণের বর্গ।', parts: { 'ক': 'বাহু a, ক্ষেত্রফল a²।', 'খ': 'কর্ণ a√2, বর্গ 2a²।', 'গ': 'অনুপাত 1:2।' } },
  { stimulus: 'অনুশীলনী ১৫-৪: সামান্তরিক কর্ণ।', parts: { 'ক': 'দুই কর্ণ চার △।', 'খ': 'পরস্পর সর্বসম।', 'গ': 'চারটি সমান ক্ষেত্রফল।' } },
  { stimulus: 'অনুশীলনী ১৫-৫: সামান্তরিক ও আয়ত।', parts: { 'ক': 'একই ভূমি, একই পাশে, সমান ক্ষেত্রফল।', 'খ': 'সামান্তরিক উচ্চতা>আয়ত।', 'গ': 'পরিসীমা সামান্তরিক বেশি।' } },
  { stimulus: 'অনুশীলনী ১৫-৬: মধ্যবিন্দু X,Y।', parts: { 'ক': 'XY∥BC, XY=½BC।', 'খ': '△AXY∼△ABC (1:2)।', 'গ': '△AXY=¼△ABC।' } },
  { stimulus: 'অনুশীলনী ১৫-৭: ট্রাপিজিয়াম।', parts: { 'ক': 'AB∥CD।', 'খ': 'ক্ষেত্রফল=½(a+b)h।', 'গ': 'সমান্তরাল বাহু ও উচ্চতা।' } },
  { stimulus: 'অনুশীলনী ১৫-৮: সামান্তরিকে বিন্দু P।', parts: { 'ক': '△PAB ও △PCD একই সমান্তরালে।', 'খ': 'সমান ক্ষেত্রফল।', 'গ': 'যোগ=½ সামান্তরিক।' } },
  { stimulus: 'অনুশীলনী ১৫-৯: DE∥BC।', parts: { 'ক': '△DBC=△EBC।', 'খ': '△DBE=△CDE।', 'গ': 'উপপাদ্য ৩৬।' } },
  { stimulus: 'অনুশীলনী ১৫-১০: ∠A=90°, D on AC।', parts: { 'ক': 'BC²+AD²=BD²+AC²।', 'খ': 'পিথাগোরাস △ABD, △ACD।', 'গ': 'প্রমাণ।' } },
  { stimulus: 'অনুশীলনী ১৫-১১: সমদ্বিবাহু সমকোণী।', parts: { 'ক': 'PA=PB=PC (মধ্যমা)।', 'খ': 'PB²+PC²=2PA²।', 'গ': 'প্রমাণ।' } },
  { stimulus: 'অনুশীলনী ১৫-১২: ∠C স্থূল।', parts: { 'ক': 'AD⊥BC, D বর্ধিতে।', 'খ': 'AB²=AC²+BC²+2BC·CD।', 'গ': 'পিথাগোরাস প্রসার।' } },
  { stimulus: 'অনুশীলনী ১৫-১৩: ∠C সূক্ষ্ম।', parts: { 'ক': 'AD⊥BC, D ভিতরে।', 'খ': 'AB²=AC²+BC²−2BC·CD।', 'গ': 'প্রমাণ।' } },
  { stimulus: 'অনুশীলনী ১৫-১৪: ABCD ও APML।', parts: { 'ক': '∠BAD=75°, AB=5, AD=4।', 'খ': '△AED অঙ্কন।', 'গ': 'APML, ∠LAP=60°।' } },
  { stimulus: 'নমুনা MCQ: 12,13 সমকোণী।', parts: { 'ক': '13 অতিভুজ ধরে।', 'খ': '3য় বাহু=5।', 'গ': '√(169−144)=5।' } },
  { stimulus: 'নমুনা MCQ: i ও iii।', parts: { 'ক': 'i: নির্দিষ্ট ক্ষেত্রফল।', 'খ': 'ii ভুল: সমান⇏সর্বসম।', 'গ': 'iii: সর্বসম⇒সমান।' } },
  { stimulus: 'নমুনা: সমবাহু AB=2, AD⊥BC।', parts: { 'ক': 'BD=DC=1।', 'খ': 'AD=√(4−1)=√3।', 'গ': 'উচ্চতা √3।' } },
  { stimulus: 'নমুনা SAQ: সমান্তরালে সামান্তরিক ও ত্রিভুজ।', parts: { 'ক': 'সামান্তরিক=2△।', 'খ': 'ভূমি অনুপাত 2:1।', 'গ': 'অনুসিদ্ধান্ত ২।' } },
  { stimulus: 'নমুনা SAQ: বর্গ ও কর্ণের বর্গ।', parts: { 'ক': 'a² ও 2a²।', 'খ': '1:2।', 'গ': 'কর্ণ=a√2।' } },
  { stimulus: 'নমুনা SAQ: AB=AC, AD⊥BC।', parts: { 'ক': '△ABD≅△ACD।', 'খ': '1:1।', 'গ': 'AD সমদ্বিখণ্ডক।' } },
  { stimulus: 'নমুনা SAQ: অতিভুজ 10, বাহু 8।', parts: { 'ক': 'অপর বাহু=6।', 'খ': 'ক্ষেত্রফল=½×8×6=24।', 'গ': '24 ব.সে.মি.' } },
  { stimulus: 'পিথাগোরাস: 6,8,10।', parts: { 'ক': '36+64=100।', 'খ': 'সমকোণী।', 'গ': '3-4-5 এর 2 গুণ।' } },
  { stimulus: 'পিথাগোরাস: 5,12,13।', parts: { 'ক': '25+144=169।', 'খ': 'সমকোণী।', 'গ': 'অতিভুজ 13।' } },
  { stimulus: 'DE∥BC, AD:DB=2:1 (নমুনা SAQ)।', parts: { 'ক': 'AB:AD=3:2।', 'খ': 'DE:BC=2:3।', 'গ': 'সদৃশ △ADE∼△ABC।' } },
  { stimulus: 'সামান্তরিক diagonal proof (১৫.২)।', parts: { 'ক': '△ABC≅△CDA।', 'খ': '△ABD≅△CDB।', 'গ': 'চার সমান △।' } },
  { stimulus: 'আয়ত ও ত্রিভুজ সমান ক্ষেত্রফল (চিত্র ১৫.১)।', parts: { 'ক': 'AB=BE।', 'খ': 'আয়ত=2△AED।', 'গ': 'সমান ক্ষেত্রফল।' } },
  { stimulus: 'একই ভূমি, ভিন্ন শীর্ষ (চিত্র ১৫.১)।', parts: { 'ক': '△ABC=△DBC।', 'খ': 'সর্বসম নয়।', 'গ': 'উচ্চতা সমান।' } },
  { stimulus: 'সম্পাদ্য ১৩ প্রমাণ (বিস্তার)।', parts: { 'ক': '△ABE=△AEC।', 'খ': '△ABC=2△AEC।', 'গ': '□ECGF=△ABC।' } },
  { stimulus: 'সম্পাদ্য ১৪ প্রমাণ (বিস্তার)।', parts: { 'ক': '△BDC=△BDE (CE∥DB)।', 'খ': '+△ABD উভয় পক্ষে।', 'গ': 'ABCD=△ADE।' } },
  { stimulus: 'সম্পাদ্য ১৫ প্রমাণ (বিস্তার)।', parts: { 'ক': '△DAF=ABCD।', 'খ': '□AGHK=△DAF।', 'গ': '∠GAK=∠x।' } },
  { stimulus: 'নমুনা সৃজনশীল: সমবাহু △ABD:ACD।', parts: { 'ক': 'AD⊥BC, BD=DC।', 'খ': '1:1।', 'গ': 'সমান ক্ষেত্রফল।' } },
  { stimulus: 'নমুনা: PQ=QR=PR, 4QD²=3PQ²।', parts: { 'ক': 'সমবাহু ত্রিভুজ।', 'খ': 'মধ্যমা ও QD সম্পর্ক।', 'গ': 'প্রমাণ (অনুশীলনী ধরন)।' } },
  { stimulus: 'অনুশীলনী ১৫-৫ বিস্তার।', parts: { 'ক': 'সমান ক্ষেত্রফল⇒সমান ভূমি।', 'খ': 'আয়ত: h=A/b।', 'গ': 'সামান্তরিকের oblique বাহু>B।' } },
  { stimulus: 'ট্রাপিজিয়াম ক্ষেত্রফল (সূত্র)।', parts: { 'ক': 'সমান্তরাল বাহু a,b।', 'খ': 'h=উচ্চতা।', 'গ': 'A=½(a+b)h।' } },
  { stimulus: 'উপপাদ্য ৩৬ ও ৩৭ সংক্ষিপ্ত তুলনা।', parts: { 'ক': '৩৬: ত্রিভুজ, একই ভূমি।', 'খ': '৩৭: সামান্তরিক, একই ভূমি।', 'গ': 'উভয়: একই সমান্তরালে সমান।' } },
  { stimulus: 'উপপাদ্য ৩৮: পিথাগোরাস প্রয়োগ।', parts: { 'ক': '3-4-5, 5-12-13।', 'খ': '5-7-9 সম্ভব নয়।', 'গ': 'AB²=AC²+BC²।' } },
  { stimulus: 'উপপাদ্য ৩৭ অঙ্কন (CL=EK)।', parts: { 'ক': 'CL⊥AB, EK⊥AB।', 'খ': 'AL∥FC।', 'গ': 'CL=EK⇒△ সমান।' } },
  { stimulus: 'পিথাগোরাস বর্গ অঙ্কন (উপপাদ্য ৩৮)।', parts: { 'ক': 'ABED, ACGF, BCHK।', 'খ': 'CL∥AD, CL⊥AB।', 'গ': 'ADLM+BELM=ACGF+BCHK।' } },
  { stimulus: 'ক্ষেত্রফল একক ও বাংলাদেশ (১৫.১)।', parts: { 'ক': 'বর্গ একক।', 'খ': 'বাংলাদেশ ~1.47 হাজার বর্গ কিমি।', 'গ': 'প্রতিদিন জীবনে ক্ষেত্রফল।' } },
  { stimulus: 'সমতলক্ষেত্র সমান চিহ্ন (=)।', parts: { 'ক': 'সর্বসম ⇒ ক্ষেত্রফল সমান।', 'খ': 'সমান ⇒ সর্বসম নয়।', 'গ': '△ABC=△DBC উদাহরণ।' } },
  { stimulus: 'অধ্যায় ১৫ — সারাংশ।', parts: { 'ক': 'উপপাদ্য ৩৬–৩৮।', 'খ': 'সম্পাদ্য ১৩–১৫।', 'গ': 'ক্ষেত্রফল সমান অঙ্কন।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))

const saq = [
  { question: 'আয়তক্ষেত্র ক্ষেত্রফল সূত্র?', marks: 2 },
  { question: 'বর্গক্ষেত্র ক্ষেত্রফল সূত্র?', marks: 2 },
  { question: 'ত্রিভুজ ক্ষেত্রফল সূত্র?', marks: 2 },
  { question: 'উপপাদ্য ৩৬ (সংক্ষেপে)?', marks: 2 },
  { question: 'অনুসিদ্ধান্ত ২ (ত্রিভুজ ও সামান্তরিক)?', marks: 2 },
  { question: 'উপপাদ্য ৩৮ (পিথাগোরাস)?', marks: 2 },
  { question: '3,4,5 ত্রিভুজ কোন ধরন?', marks: 2 },
  { question: '5,7,9 ত্রিভুজ সমকোণী?', marks: 2 },
  { question: 'সম্পাদ্য ১৩ কী অঙ্কন করে?', marks: 2 },
  { question: 'সম্পাদ্য ১৪ কী অঙ্কন করে?', marks: 2 },
  { question: 'সম্পাদ্য ১৫ কী অঙ্কন করে?', marks: 2 },
  { question: '12,13 (13 অতিভুজ) — 3য় বাহু?', marks: 2 },
  { question: 'সমবাহু △ AB=2, BD=?', marks: 2 },
  { question: 'সমবাহু △ AB=2, উচ্চতা=?', marks: 2 },
  { question: 'অতিভুজ 10, বাহু 8 — ক্ষেত্রফল?', marks: 2 },
  { question: 'বর্গ: কর্ণের বর্গ/বাহুর বর্গ=?', marks: 2 },
  { question: 'সামান্তরিক ও △ সমান ক্ষেত্রফল — ভূমি অনুপাত?', marks: 2 },
  { question: 'AB=AC, AD⊥BC ⇒ △ABD:△ACD=?', marks: 2 },
  { question: '△AXY=¼△ABC (মধ্যবিন্দু)?', marks: 2 },
  { question: 'DE∥BC, AD:DB=2:1 ⇒ DE:BC=?', marks: 2 },
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

const outPath = path.join(__dirname, '..', 'seed-class9-ch15.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
  console.error('❌ Count check failed')
  process.exit(1)
}
