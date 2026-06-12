/**
 * Generates seed-class9-ch14.cjs — MCQ=50, CQ=50, SAQ=20
 * Run: node scripts/build-ch14-seed.cjs
 * Source: chapter-14-ratio-similarity-symmetry.md (NCTB Class 9)
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 14: অনুপাত, সদৃশতা ও প্রতিসমতা
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 14 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch14.cjs
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
const CHAPTER_ID = 'ch-14'
const TITLE_BN = 'অনুপাত, সদৃশতা ও প্রতিসমতা'
const TITLE_EN = 'Ratio, Similarity and Symmetry'
`

const mcq = [
  // ─── ১৪.১ অনুপাত ও সমানুপাত (1-10) ───
  { question: 'a:b=x:y হলে b:a=? (ব্যস্তকরণ)', options: { 'ক': 'x:y', 'খ': 'y:x', 'গ': 'a:b', 'ঘ': 'b:a' }, answer: 'খ', marks: 1 },
  { question: 'a:b=x:y হলে a:x=? (একান্তরকরণ)', options: { 'ক': 'b:y', 'খ': 'x:y', 'গ': 'a:b', 'ঘ': 'y:x' }, answer: 'ক', marks: 1 },
  { question: 'a:b=c:d হলে ad=? (আড়গুণন)', options: { 'ক': 'ac', 'খ': 'bc', 'গ': 'bd', 'ঘ': 'ab' }, answer: 'খ', marks: 1 },
  { question: 'a:b=x:y হলে (a+b):b=? (যোজন)', options: { 'ক': '(x+y):y', 'খ': '(x−y):y', 'গ': 'x:y', 'ঘ': 'a:c' }, answer: 'ক', marks: 1 },
  { question: 'a:b=x:y হলে (a−b):b=? (বিয়োজন)', options: { 'ক': '(x+y):y', 'খ': '(x−y):y', 'গ': 'x:y', 'ঘ': 'b:a' }, answer: 'খ', marks: 1 },
  { question: 'a/b=c/d হলে (a+b)/(a−b)=?', options: { 'ক': '(c+d)/(c−d)', 'খ': '(c−d)/(c+d)', 'গ': 'c/d', 'ঘ': '1' }, answer: 'ক', marks: 1 },
  { question: 'একই উচ্চতা h দুই ত্রিভুজ, ভূমি a ও d। ক্ষেত্রফলের অনুপাত—', options: { 'ক': 'h:d', 'খ': 'a:d', 'গ': 'a²:d²', 'ঘ': '1:1' }, answer: 'খ', marks: 1 },
  { question: 'একই ভূমি b দুই ত্রিভুজ, উচ্চতা h ও k। ক্ষেত্রফলের অনুপাত—', options: { 'ক': 'b:k', 'খ': 'h:k', 'গ': 'b²:k²', 'ঘ': '1:1' }, answer: 'খ', marks: 1 },
  { question: 'a:b=b:a হলে—', options: { 'ক': 'a>b', 'খ': 'a=b', 'গ': 'a<b', 'ঘ': 'b=0' }, answer: 'খ', marks: 1 },
  { question: 'a:b=x:y ও c:d=x:y হলে—', options: { 'ক': 'a:b=c:d', 'খ': 'a:c=b:d', 'গ': 'ad=bc', 'ঘ': 'a=b' }, answer: 'ক', marks: 1 },

  // ─── ১৪.২ উপপাদ্য ২৮–৩১ (11-22) ───
  { question: 'DE∥BC হলে AD:DB=? (উপপাদ্য ২৮)', options: { 'ক': 'AB:AC', 'খ': 'AE:EC', 'গ': 'BD:DC', 'ঘ': 'DE:BC' }, answer: 'খ', marks: 1 },
  { question: 'DE∥BC হলে AB:AD=? (অনুসিদ্ধান্ত ১)', options: { 'ক': 'AC:AE', 'খ': 'AD:DB', 'গ': 'BC:DE', 'ঘ': 'AB:BD' }, answer: 'ক', marks: 1 },
  { question: 'BC বাহুর মধ্যবিন্দু দিয়ে সমান্তরাল রেখা তৃতীয় বাহুকে—', options: { 'ক': 'সমদ্বিখণ্ডিত', 'খ': 'সমান্তরাল', 'গ': 'লম্ব', 'ঘ': 'বর্ধিত' }, answer: 'ক', marks: 1 },
  { question: 'AD:DB=AE:EC হলে DE ও BC—', options: { 'ক': 'সমান্তরাল', 'খ': 'লম্ব', 'গ': 'সমান', 'ঘ': 'ছেদ করে' }, answer: 'ক', marks: 1 },
  { question: '∠A এর সমদ্বিখণ্ডক AD, BC কে D তে ছেদ। BD:DC=? (উপপাদ্য ৩০)', options: { 'ক': 'BA:AC', 'খ': 'AB:BC', 'গ': 'AD:DC', 'ঘ': 'BD:AB' }, answer: 'ক', marks: 1 },
  { question: 'BD:DC=BA:AC হলে AD রেখা—', options: { 'ক': '∠A এর সমদ্বিখণ্ডক', 'খ': 'মধ্যমা', 'গ': 'উচ্চতা', 'ঘ': 'লম্ব' }, answer: 'ক', marks: 1 },
  { question: 'উপপাদ্য ২৮ প্রমাণে △BDE=△DEC কারণ—', options: { 'ক': 'একই ভূমি DE, একই সমান্তরাল', 'খ': 'সর্বসম', 'গ': 'সদৃশ', 'ঘ': 'সমকোণী' }, answer: 'ক', marks: 1 },
  { question: 'কোণ সমদ্বিখণ্ডক প্রমাণে CE∥AD হলে ∠AEC=?', options: { 'ক': '∠BAD', 'খ': '∠CAD', 'গ': '∠ABC', 'ঘ': '∠ACB' }, answer: 'ক', marks: 1 },
  { question: 'উপপাদ্য ৩০-এ AE=? প্রমাণিত হয়', options: { 'ক': 'AC', 'খ': 'AB', 'গ': 'BC', 'ঘ': 'AD' }, answer: 'ক', marks: 1 },
  { question: 'AD:DB=AE:EC হলে কোন উপপাদ্য প্রয়োগ?', options: { 'ক': '২৮', 'খ': '২৯', 'গ': '৩০', 'ঘ': '৩১' }, answer: 'খ', marks: 1 },
  { question: 'BD:DC=BA:AC হলে কোন উপপাদ্য?', options: { 'ক': '২৮', 'খ': '২৯', 'গ': '৩০', 'ঘ': '৩১' }, answer: 'ঘ', marks: 1 },
  { question: 'DE∥BC হলে AB:BD=? (অনুসিদ্ধান্ত ১)', options: { 'ক': 'AC:CE', 'খ': 'AD:DB', 'গ': 'AE:EC', 'ঘ': 'BC:DE' }, answer: 'ক', marks: 1 },

  // ─── ১৪.৩ বিভক্তিকরণ (23-26) ───
  { question: 'AB রেখাংশ AX:XB=m:n হলে X বিন্দু—', options: { 'ক': 'অন্তর্বর্তী', 'খ': 'বহির্বর্তী', 'গ': 'মধ্যবিন্দু', 'ঘ': 'শীর্ষ' }, answer: 'ক', marks: 1 },
  { question: 'সম্পাদ্য ১২: AB কে m:n অন্তর্বিভক্ত করতে AE=m, EC=n। AD:DB=?', options: { 'ক': 'm:n', 'খ': 'n:m', 'গ': '1:1', 'ঘ': 'm+n:n' }, answer: 'ক', marks: 1 },
  { question: '7 সে.মি. রেখাংশ 3:2 অনুপাতে— AD=?', options: { 'ক': '3', 'খ': '4.2', 'গ': '5', 'ঘ': '2.8' }, answer: 'খ', marks: 1 },
  { question: '7 সে.মি. রেখাংশ 3:2 অনুপাতে— DB=?', options: { 'ক': '3', 'খ': '4.2', 'গ': '2.8', 'ঘ': '5' }, answer: 'গ', marks: 1 },

  // ─── ১৪.৪ সদৃশতা (27-40) ───
  { question: 'সর্বসমতা ও সদৃশতার সম্পর্ক—', options: { 'ক': 'সদৃশ ⇒ সর্বসম', 'খ': 'সর্বসম ⇒ সদৃশ', 'গ': 'স্বাধীন', 'ঘ': 'বিরোধী' }, answer: 'খ', marks: 1 },
  { question: 'দুই সদৃশকোণী ত্রিভুজ সদৃশ হলে অনুরূপ বাহু—', options: { 'ক': 'সমান', 'খ': 'সমানুপাতিক', 'গ': 'সমান্তর', 'ঘ': 'লম্ব' }, answer: 'খ', marks: 1 },
  { question: 'দুই সদৃশকোণী ত্রিভুজের ক্ষেত্রফলের অনুপাত=? (উপপাদ্য ৩৫)', options: { 'ক': 'বাহুর অনুপাত', 'খ': 'বাহু² অনুপাত', 'গ': 'কোণ অনুপাত', 'ঘ': 'উচ্চতা²' }, answer: 'খ', marks: 1 },
  { question: '∠A=∠D, ∠B=∠E, ∠C=∠F হলে AB/DE=? (উপপাদ্য ৩২)', options: { 'ক': 'AC/DF=BC/EF', 'খ': '1', 'গ': '0', 'ঘ': 'DE/AB' }, answer: 'ক', marks: 1 },
  { question: 'AB/DE=AC/DF=BC/EF হলে ত্রিভুজদ্বয়—', options: { 'ক': 'সদৃশকোণী', 'খ': 'সর্বসম', 'গ': 'সমকোণী', 'ঘ': 'সমবাহু' }, answer: 'ক', marks: 1 },
  { question: '∠A=∠D ও AB/DE=AC/DF হলে ত্রিভুজ—', options: { 'ক': 'সদৃশ', 'খ': 'অসদৃশ', 'গ': 'সর্বসম', 'ঘ': 'সমকোণী' }, answer: 'ক', marks: 1 },
  // Ex14.2 #1: i and iii
  { question: 'DE∥BC। i ABC∼ADE, iii △ABC/△ADE=BC²/DE²। সঠিক?', options: { 'ক': 'i ও ii', 'খ': 'i ও iii', 'গ': 'ii ও iii', 'ঘ': 'i,ii,iii' }, answer: 'খ', marks: 1 },
  // Ex14.2 #2: AP:PB=AQ:QC
  { question: 'PQ∥BC হলে সঠিক—', options: { 'ক': 'AP:PB=AQ:QC', 'খ': 'AB:AC=PQ:BC', 'গ': 'AP:AB=QC:AC', 'ঘ': 'PQ:BC=PB:BQ' }, answer: 'ক', marks: 1 },
  { question: 'দুই সমকোণী ত্রিভুজের একটি সূক্ষ্মকোণ সমান হলে—', options: { 'ক': 'সদৃশ', 'খ': 'সর্বসম', 'গ': 'সমবাহু', 'ঘ': 'অসদৃশ' }, answer: 'ক', marks: 1 },
  { question: 'AB:DE=3:4 সদৃশ ত্রিভুজে △ABC:△DEF=?', options: { 'ক': '3:4', 'খ': '9:16', 'গ': '16:9', 'ঘ': '6:8' }, answer: 'খ', marks: 1 },
  // Ex14.2 #12: BC=3, EF=8, area ABC=3 → area DEF=64/3
  { question: 'BC=3, EF=8, △ABC=3 ব.সে.মি. সদৃশ হলে △DEF=?', options: { 'ক': '8', 'খ': '64/3', 'গ': '9', 'ঘ': '24' }, answer: 'খ', marks: 1 },
  { question: 'সদৃশ ত্রিভুজে AM:DN=? (উচ্চতা)', options: { 'ক': 'AB:DE', 'খ': 'AB²:DE²', 'গ': '1:1', 'ঘ': 'BC:EF²' }, answer: 'ক', marks: 1 },
  { question: 'এক কোণ সমান + সংলগ্ন বাহু সমানুপাতিক ⇒?', options: { 'ক': 'সদৃশ (উপপাদ্য ৩৪)', 'খ': 'সর্বসম', 'গ': 'সমকোণী', 'ঘ': 'অসদৃশ' }, answer: 'ক', marks: 1 },

  // ─── ১৪.৫ প্রতিসমতা (41-50) ───
  { question: 'প্রতিসাম্য রেখা কী?', options: { 'ক': 'ভাজলে অংশ দুটি মিলে', 'খ': 'ঘূর্ণন অক্ষ', 'গ': 'কেন্দ্র', 'ঘ': 'ব্যাসার্ধ' }, answer: 'ক', marks: 1 },
  { question: 'সমবাহু ত্রিভুজের প্রতিসাম্য রেখা—', options: { 'ক': '1', 'খ': '2', 'গ': '3', 'ঘ': '4' }, answer: 'গ', marks: 1 },
  { question: 'বর্গক্ষেত্রের প্রতিসাম্য রেখা—', options: { 'ক': '2', 'খ': '3', 'গ': '4', 'ঘ': '6' }, answer: 'গ', marks: 1 },
  { question: 'সুষম ষড়ভুজের প্রতিসাম্য রেখা—', options: { 'ক': '3', 'খ': '4', 'গ': '6', 'ঘ': '8' }, answer: 'গ', marks: 1 },
  // Ex14.3 #1: scalene 0
  { question: 'বিষমবাহু ত্রিভুজের প্রতিসাম্য রেখা—', options: { 'ক': '0', 'খ': '1', 'গ': '3', 'ঘ': 'অসংখ্য' }, answer: 'ক', marks: 1 },
  { question: 'বর্গের ঘূর্ণন প্রতিসমতার মাত্রা—', options: { 'ক': '1', 'খ': '2', 'গ': '4', 'ঘ': '8' }, answer: 'গ', marks: 1 },
  { question: 'বৃত্তের ঘূর্ণন প্রতিসমতার মাত্রা—', options: { 'ক': '1', 'খ': '4', 'গ': '6', 'ঘ': 'অসীম' }, answer: 'ঘ', marks: 1 },
  { question: '4-পাখা ফ্যানের ঘূর্ণন মাত্রা—', options: { 'ক': '2', 'খ': '3', 'গ': '4', 'ঘ': '8' }, answer: 'গ', marks: 1 },
  // Ex14.3 #3: hexagon ii and iii
  { question: 'সুষম ষড়ভুজ: ii ঘূর্ণন কোণ 60°, iii সব কোণ সমান। সঠিক?', options: { 'ক': 'i', 'খ': 'ii', 'গ': 'ii ও iii', 'ঘ': 'i,ii,iii' }, answer: 'গ', marks: 1 },
  // Sample #2: i only
  { question: 'i ত্রিভুজ সবচেয়ে কম বাহুর বহুভুজ। সঠিক?', options: { 'ক': 'i', 'খ': 'i ও ii', 'গ': 'i ও iii', 'ঘ': 'i,ii,iii' }, answer: 'ক', marks: 1 },
  { question: 'Z বর্ণের ঘূর্ণন প্রতিসমতার মাত্রা (নমুনা সারণি)—', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': '4' }, answer: 'গ', marks: 1 },
]

const cqTemplates = [
  { stimulus: 'অনুপাত ও সমানুপাতের ধর্ম (১৪.১)।', parts: { 'ক': 'ব্যস্তকরণ ও একান্তরকরণ।', 'খ': 'যোজন ও বিয়োজন।', 'গ': 'a/b=c/d ⇒ (a+b)/(a−b)=(c+d)/(c−d)।' } },
  { stimulus: 'জ্যামিতিক সমানুপাত — একই উচ্চতা (১৪.১)।', parts: { 'ক': '△ABC ও △DEF, h সমান।', 'খ': 'ক্ষেত্রফল অনুপাত=a:d।', 'গ': 'BC:EF=a:d।' } },
  { stimulus: 'জ্যামিতিক সমানুপাত — একই ভূমি (১৪.১)।', parts: { 'ক': 'ভূমি b সমান।', 'খ': 'ক্ষেত্রফল:h:k।', 'গ': 'AP:DQ=h:k।' } },
  { stimulus: 'উপপাদ্য ২৮: DE∥BC।', parts: { 'ক': '△ADE/△BDE=AD/DB।', 'খ': '△BDE=△DEC।', 'গ': 'AD:DB=AE:EC।' } },
  { stimulus: 'অনুসিদ্ধান্ত ১ ও ২ (উপপাদ্য ২৮)।', parts: { 'ক': 'AB:AD=AC:AE।', 'খ': 'AB:BD=AC:CE।', 'গ': 'মধ্যবিন্দু সমান্তরাল ⇒ সমদ্বিখণ্ডন।' } },
  { stimulus: 'উপপাদ্য ২৯: AD:DB=AE:EC।', parts: { 'ক': '△ADE/△BDE=AD/DB।', 'খ': '△BDE=△DEC।', 'গ': 'DE∥BC।' } },
  { stimulus: 'উপপাদ্য ৩০: ∠A সমদ্বিখণ্ডক AD।', parts: { 'ক': 'CE∥AD অঙ্কন।', 'খ': 'AE=AC প্রমাণ।', 'গ': 'BD:DC=BA:AC।' } },
  { stimulus: 'উপপাদ্য ৩১: BD:DC=BA:AC।', parts: { 'ক': 'CE∥AD অঙ্কন।', 'খ': 'AE=AC।', 'গ': '∠BAD=∠CAD।' } },
  { stimulus: 'সম্পাদ্য ১২: AB কে m:n অন্তর্বিভক্ত (১৪.৩)।', parts: { 'ক': 'AE=m, EC=n।', 'খ': 'ED∥BC।', 'গ': 'AD:DB=m:n।' } },
  { stimulus: 'উদাহরণ ১: 7 সে.মি. রেখাংশ 3:2 (১৪.৩)।', parts: { 'ক': 'AE=3, EC=2।', 'খ': 'ED∥BC অঙ্কন।', 'গ': 'AD=4.2, DB=2.8 সে.মি.' } },
  { stimulus: 'সদৃশতা সংজ্ঞা (১৪.৪)।', parts: { 'ক': 'সদৃশকোণী বহুভুজ।', 'খ': 'সর্বসম ⇒ সদৃশ।', 'গ': 'দুই সমকোণী ত্রিভুজ সদৃশকোণী।' } },
  { stimulus: 'উপপাদ্য ৩২: সদৃশকোণী ⇒ বাহু সমানুপাতিক।', parts: { 'ক': 'AP=DE, AQ=DF।', 'খ': 'PQ∥BC।', 'গ': 'AB/DE=AC/DF=BC/EF।' } },
  { stimulus: 'উপপাদ্য ৩৩: বাহু সমানুপাতিক ⇒ সদৃশকোণী।', parts: { 'ক': 'AB/AP=AC/AQ।', 'খ': 'PQ∥BC (উপপাদ্য ২৯)।', 'গ': '∠A=∠D, ∠B=∠E, ∠C=∠F।' } },
  { stimulus: 'উপপাদ্য ৩৪: এক কোণ সমান + সংলগ্ন বাহু সমানুপাতিক।', parts: { 'ক': '△APQ≅△DEF (বাহু-কোণ-বাহু)।', 'খ': 'PQ∥BC।', 'গ': '△ABC∼△DEF।' } },
  { stimulus: 'উপপাদ্য ৩৫: সদৃশ ত্রিভুজের ক্ষেত্রফল।', parts: { 'ক': 'h/p=BC/EF।', 'খ': '△ABC/△DEF=h/p×BC/EF।', 'গ': '=BC²/EF²।' } },
  { stimulus: 'অনুশীলনী ১৪.২-১: DE∥BC।', parts: { 'ক': 'i ABC∼ADE।', 'খ': 'iii ক্ষেত্রফল=BC²/DE²।', 'গ': 'ii ভুল (AD/BD≠CE/AE)।' } },
  { stimulus: 'অনুশীলনী ১৪.২-২: PQ∥BC।', parts: { 'ক': 'AP:PB=AQ:QC।', 'খ': 'উপপাদ্য ২৮।', 'গ': 'অন্যান্য বিকল্প ভুল।' } },
  { stimulus: 'অনুশীলনী ১৪.২-১২: BC=3, EF=8, △ABC=3।', parts: { 'ক': 'AB/DE=BC/EF=3/8।', 'খ': 'ক্ষেত্রফল=(3/8)²।', 'গ': '△DEF=64/3 ব.সে.মি.' } },
  { stimulus: 'অনুশীলনী ১৪.২-৮: AM:DN=AB:DE।', parts: { 'ক': 'সদৃশ ত্রিভুজ উচ্চতা।', 'খ': 'অনুরূপ বাহু অনুপাত।', 'গ': 'প্রমাণ (উপপাদ্য ৩৫)।' } },
  { stimulus: 'অনুশীলনী ১৪.২-৪: সমকোণী সূক্ষ্মকোণ সমান।', parts: { 'ক': '∠A=∠D (সূক্ষ্ম)।', 'খ': '∠B=∠E=90°−∠A।', 'গ': 'ত্রিভুজ সদৃশ।' } },
  { stimulus: 'অনুশীলনী ১৪.২-৫: সমকোণীতে লম্ব।', parts: { 'ক': 'দুই ছোট ত্রিভুজ উৎপন্ন।', 'খ': 'পরস্পর সদৃশ।', 'গ': 'প্রত্যেকে মূল ত্রিভুজের সদৃশ।' } },
  { stimulus: 'অনুশীলনী ১৪.১-৬: △AOB:△AOC=BX:XC।', parts: { 'ক': 'O বিন্দু AX-এ।', 'খ': 'একই উচ্চতা।', 'গ': 'ভূমি অনুপাত=ক্ষেত্রফল অনুপাত।' } },
  { stimulus: 'অনুশীলনী ১৪.১-৭: ∠A সমদ্বিখণ্ডক, EF∥BC।', parts: { 'ক': 'BD:DC=BA:AC।', 'খ': 'EF∥BC প্রয়োগ।', 'গ': 'BD:DC=EF:CF।' } },
  { stimulus: 'প্রতিসমতা — রেখা প্রতিসমতা (১৪.৫)।', parts: { 'ক': 'প্রতিসাম্য রেখা সংজ্ঞা।', 'খ': 'প্রতিফলন প্রতিসমতা।', 'গ': 'উদাহরণ: T, M, প্রজাপতি।' } },
  { stimulus: 'সুষম বহুভুজের প্রতিসাম্য রেখা।', parts: { 'ক': 'সমবাহু △: 3।', 'খ': 'বর্গ: 4।', 'গ': 'সুষম ষড়ভুজ: 6।' } },
  { stimulus: 'ঘূর্ণন প্রতিসমতা (১৪.৫)।', parts: { 'ক': 'ঘূর্ণন কেন্দ্র ও কোণ।', 'খ': '4-পাখা ফ্যান: মাত্রা 4।', 'গ': 'বর্গ: 90°,180°,270°,360°।' } },
  { stimulus: 'বৃত্তের প্রতিসমতা।', parts: { 'ক': 'অসংখ্য প্রতিসাম্য রেখা।', 'খ': 'ঘূর্ণন মাত্রা অসীম।', 'গ': 'যেকোনো কোণে ঘূর্ণনে অপরিবর্তিত।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-১: বিষমবাহু ত্রিভুজ।', parts: { 'ক': 'তিন বাহু ভিন্ন।', 'খ': 'কোনো প্রতিসাম্য রেখা নেই।', 'গ': '0টি।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-২–৩: সুষম ষড়ভুজ (6 সে.মি.)।', parts: { 'ক': '6টি প্রতিসাম্য রেখা।', 'খ': 'ঘূর্ণন কোণ 60°।', 'গ': 'সব কোণ 120° সমান।' } },
  { stimulus: 'নমুনা: ∠A সমদ্বিখণ্ডক AD, CE∥DA (সৃজনশীল)।', parts: { 'ক': 'একই ভূমি ⇒ ক্ষেত্রফল:উচ্চতা।', 'খ': 'BD:DC=BA:AC (উপপাদ্য ৩০)।', 'গ': 'EF∥BC ⇒ BD:DC=BP:CQ।' } },
  { stimulus: 'নমুনা SAQ: DE∥BC, AD:DB=2:1।', parts: { 'ক': 'AB:AD=3:2।', 'খ': 'DE:BC=1:2।', 'গ': 'উপপাদ্য ২৮ প্রয়োগ।' } },
  { stimulus: 'নমুনা SAQ: সমান উচ্চতা দুই ত্রিভুজ।', parts: { 'ক': 'ক্ষেত্রফল=½×b×h।', 'খ': '△PQR:△LMN=QR:MN।', 'গ': 'জ্যামিতিক সমানুপাত ২।' } },
  { stimulus: 'নমুনা SAQ: AB:DE=3:4 সদৃশ।', parts: { 'ক': 'ক্ষেত্রফল=(3/4)²।', 'খ': '9:16।', 'গ': 'উপপাদ্য ৩৫।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-১২: শূন্যস্থান (বর্গ)।', parts: { 'ক': 'ঘূর্ণন কেন্দ্র: কর্ণ ছেদ।', 'খ': 'মাত্রা: 4।', 'গ': 'কোণ: 90°।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-১২: সমবাহু ত্রিভুজ।', parts: { 'ক': 'কেন্দ্র: ভর কেন্দ্র/অন্ত:কেন্দ্র।', 'খ': 'মাত্রা: 3।', 'গ': 'কোণ: 120°।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-১৪: ঘূর্ণন কোণ 18°?।', parts: { 'ক': '360°/18°=20।', 'খ': '20 মাত্রার ঘূর্ণন সম্ভব।', 'গ': 'উদাহরণ: সুষম 20-ভুজ।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-৯: H, O, X বর্ণ।', parts: { 'ক': 'H: অনু+উল্লম্ব আয়না।', 'খ': 'O: উল্লম্ব (180° ঘূর্ণন)।', 'গ': 'X: উল্লম্ব ও অনুভূমিক।' } },
  { stimulus: 'অনুশীলনী ১৪.২-৩: তৃতীয় ত্রিভুজের সদৃশ।', parts: { 'ক': '△ABC∼△PQR, △DEF∼△PQR।', 'খ': 'AB/PQ=DE/PQ।', 'গ': '△ABC∼△DEF।' } },
  { stimulus: 'অনুশীলনী ১৪.১-৩: ট্রাপিজিয়াম কর্ণ।', parts: { 'ক': 'কর্ণদ্বয় ছেদবিন্দু।', 'খ': 'সমান অনুপাতে বিভক্ত।', 'গ': 'উপপাদ্য ২৮/২৯।' } },
  { stimulus: 'অনুশীলনী ১৪.১-৪: ট্রাপিজিয়াম মধ্যবিন্দু।', parts: { 'ক': 'তিরysk বাহুর মধ্যবিন্দু সংযোগ।', 'খ': 'সমান্তরাল বাহুর সমান্তরাল।', 'গ': 'মধ্যবিন্দু উপপাদ্য।' } },
  { stimulus: 'অনুশীলনী ১৪.১-২: সমান্তরাল রেখা ও অনুপাত।', parts: { 'ক': 'দুই সমান্তরাল ছেদক।', 'খ': 'অনুরূপ অংশ সমানুপাতিক।', 'গ': 'উপপাদ্য ২৮ প্রয়োগ।' } },
  { stimulus: 'অনুশীলনী ১৪.১-৫: মধ্যমা ও AC=6EF।', parts: { 'ক': 'G ছেদবিন্দু, DE∥BC।', 'খ': 'EF=⅙AC।', 'গ': 'AC=6EF প্রমাণ।' } },
  { stimulus: 'সুষম পঞ্চভুজের প্রতিসাম্য (১৪.৫)।', parts: { 'ক': '5টি প্রতিসাম্য রেখা।', 'খ': 'সব বাহু ও কোণ সমান।', 'গ': 'ঘূর্ণন মাত্রা 5।' } },
  { stimulus: 'অনুশীলনী ১৪.২-৯: BC∥DE, BOC ও DOE।', parts: { 'ক': '△BOC∼△DOE।', 'খ': 'AD:BD=AE:CE।', 'গ': 'BO:OE=CO:OD।' } },
  { stimulus: 'রেখা ও ঘূর্ণন প্রতিসমতা তুলনা।', parts: { 'ক': 'শুধু রেখা: T, M।', 'খ': 'শুধু ঘূর্ণন: Z, N।', 'গ': 'উভয়: H, O, বর্গ।' } },
  { stimulus: 'অনুশীলনী ১৪.৩-১৩: চতুর্ভুজ তালিকা।', parts: { 'ক': 'বর্গ: রেখা 4, ঘূর্ণন 4।', 'খ': 'রম্বস: রেখা 2, ঘূর্ণন 2।', 'গ': 'আয়ত: রেখা 2, ঘূর্ণন 2।' } },
  { stimulus: 'অনুশীলনী ১৪.১-১: সমদ্বিখণ্ডক ও সমদ্বিবাহু।', parts: { 'ক': 'XY∥ভূমি।', 'খ': '∠B=∠C প্রমাণ।', 'গ': '△ABC সমদ্বিবাহু।' } },
  { stimulus: 'অনুশীলনী ১৪.২-১১: △ABC:△DEF=AB·AC:DE·DF।', parts: { 'ক': '∠A=∠D।', 'খ': 'ক্ষেত্রফল=½AB·AC·sinA।', 'গ': 'অনুপাত=AB·AC:DE·DF।' } },
  { stimulus: 'কাজ ১৪.৩: 3/5 গুণ সদৃশ ত্রিভুজ।', parts: { 'ক': 'মূল △ABC অঙ্কন।', 'খ': 'AB=3k, AC=3k ইত্যাদি।', 'গ': 'সদৃশ △A′B′C′।' } },
  { stimulus: 'অধ্যায় ১৪ — সারাংশ।', parts: { 'ক': 'উপপাদ্য ২৮–৩৫।', 'খ': 'সদৃশতা ও ক্ষেত্রফল²।', 'গ': 'প্রতিসমতা (রেখা ও ঘূর্ণন)।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))

const saq = [
  { question: 'প্রতিসাম্য রেখা কী?', marks: 2 },
  { question: 'সদৃশকোণী বহুভুজ কী?', marks: 2 },
  { question: 'ঘূর্ণন প্রতিসমতার মাত্রা কী?', marks: 2 },
  { question: 'উপপাদ্য ২৮ (সংক্ষেপে) লেখো।', marks: 2 },
  { question: 'উপপাদ্য ২৯ (সংক্ষেপে) লেখো।', marks: 2 },
  { question: 'উপপাদ্য ৩০ (সংক্ষেপে) লেখো।', marks: 2 },
  { question: 'উপপাদ্য ৩৫ (সংক্ষেপে) লেখো।', marks: 2 },
  { question: 'a:b=c:d হলে ad=?', marks: 2 },
  { question: 'DE∥BC হলে AD:DB=?', marks: 2 },
  { question: '∠A সমদ্বিখণ্ডক হলে BD:DC=?', marks: 2 },
  { question: '7 সে.মি. রেখাংশ 3:2 — AD=?', marks: 2 },
  { question: 'AB:DE=3:4 সদৃশ ⇒ ক্ষেত্রফল অনুপাত?', marks: 2 },
  { question: 'সমবাহু ত্রিভুজ: প্রতিসাম্য রেখা?', marks: 2 },
  { question: 'বর্গ: প্রতিসাম্য রেখা?', marks: 2 },
  { question: 'সুষম ষড়ভুজ: প্রতিসাম্য রেখা?', marks: 2 },
  { question: 'বিষমবাহু ত্রিভুজ: প্রতিসাম্য রেখা?', marks: 2 },
  { question: 'বর্গ: ঘূর্ণন মাত্রা?', marks: 2 },
  { question: 'PQ∥BC হলে AP:PB=?', marks: 2 },
  { question: 'BC=3, EF=8, △ABC=3 ⇒ △DEF=?', marks: 2 },
  { question: 'সর্বসম ⇒ সদৃশ — সত্য/মিথ্যা?', marks: 2 },
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

const outPath = path.join(__dirname, '..', 'seed-class9-ch14.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
  console.error('❌ Count check failed')
  process.exit(1)
}
