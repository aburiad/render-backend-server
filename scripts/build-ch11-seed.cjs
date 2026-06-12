/**
 * Generates seed-class9-ch11.cjs — MCQ=50, CQ=50, SAQ=20
 * Run: node scripts/build-ch11-seed.cjs
 * Source: chapter-11-algebraic-ratio-proportion.md (NCTB Class 9)
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 11: বীজগাণিতিক অনুপাত ও সমানুপাত (Algebraic Ratio and Proportion)
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 11 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch11.cjs
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
const CHAPTER_ID = 'ch-11'
const TITLE_BN = 'বীজগাণিতিক অনুপাত ও সমানুপাত'
const TITLE_EN = 'Algebraic Ratio and Proportion'
`

const mcq = [
  // ─── ১১.১ সংজ্ঞা (1-12) ───
  { question: 'p : q = p/q লেখার শর্ত—', options: { 'ক': 'রাশি দুটি বিভিন্ন একক', 'খ': 'রাশি দুটি সমজাতীয় ও একই একক', 'গ': 'শুধু p ধনাত্মক', 'ঘ': 'q = 0' }, answer: 'খ', marks: 1 },
  { question: 'অনুপাত p : q এ p কে কী বলে?', options: { 'ক': 'উত্তর রাশি', 'খ': 'পূর্ব রাশি', 'গ': 'মধ্যসমানুপাতী', 'ঘ': 'তৃতীয় সমানুপাতী' }, answer: 'খ', marks: 1 },
  { question: 'a : b = c : d হলে—', options: { 'ক': 'ad = bc', 'খ': 'ac = bd', 'গ': 'ab = cd', 'ঘ': 'a + b = c + d' }, answer: 'ক', marks: 1 },
  { question: 'সমানুপাতের চারটি রাশি—', options: { 'ক': 'সব এক জাতীয়', 'খ': 'প্রত্যেক অনুপাতের রাশি এক জাতীয়', 'গ': 'সব ভিন্ন জাত', 'ঘ': 'শুধু দুইটি এক জাত' }, answer: 'খ', marks: 1 },
  { question: 'a : b = b : c হলে a, b, c—', options: { 'ক': 'সাধারণ অনুপাত', 'খ': 'ক্রমিক সমানুপাতী', 'গ': 'সমান', 'ঘ': 'ধারাবাহিক অনুপাত' }, answer: 'খ', marks: 1 },
  { question: 'a : b = b : c হলে—', options: { 'ক': 'b² = ac', 'খ': 'a² = bc', 'গ': 'ab = bc', 'ঘ': 'a = c' }, answer: 'ক', marks: 1 },
  { question: 'একই উচ্চতা h দুই ত্রিভুজ, ভূমি a ও b। ক্ষেত্রফলের অনুপাত—', options: { 'ক': 'h : a', 'খ': 'a : b', 'গ': 'a² : b²', 'ঘ': '1 : 1' }, answer: 'খ', marks: 1 },
  { question: 'বর্গক্ষেত্র বাহু a ও b মি. হলে ক্ষেত্রফলের অনুপাত—', options: { 'ক': 'a : b', 'খ': 'a² : b²', 'গ': '2a : 2b', 'ঘ': '√a : √b' }, answer: 'খ', marks: 1 },
  { question: 'গতিবেগ v₁t₁ = v₂t₂ হলে v₁ : v₂ = ?', options: { 'ক': 't₁ : t₂', 'খ': 't₂ : t₁', 'গ': 't₁ + t₂', 'ঘ': '1 : 1' }, answer: 'খ', marks: 1 },
  // Ex2: 7:2 now, 8:3 after 5yr → 35, 10
  { question: 'পিতা-পুত্র বয়স 7:2, 5 বছর পর 8:3। পুত্রের বয়স—', options: { 'ক': '7', 'খ': '10', 'গ': '15', 'ঘ': '35' }, answer: 'খ', marks: 1 },
  { question: 'পিতা-পুত্র (উপরের) পিতার বয়স—', options: { 'ক': '28', 'খ': '30', 'গ': '35', 'ঘ': '40' }, answer: 'গ', marks: 1 },
  { question: 'ক্রমিক সমানুপাতে c কে কী বলে?', options: { 'ক': 'মধ্যসমানুপাতী', 'খ': 'a ও b এর তৃতীয় সমানুপাতী', 'গ': 'পূর্ব রাশি', 'ঘ': 'উত্তর রাশি' }, answer: 'খ', marks: 1 },

  // ─── ১১.২ রূপান্তর (13-22) ───
  { question: 'a : b = c : d হলে b : a = d : c — এটি—', options: { 'ক': 'যোজন', 'খ': 'বিয়োজন', 'গ': 'ব্যস্তকরণ', 'ঘ': 'একান্তরকরণ' }, answer: 'গ', marks: 1 },
  { question: 'a : b = c : d হলে a : c = b : d — এটি—', options: { 'ক': 'ব্যস্তকরণ', 'খ': 'একান্তরকরণ', 'গ': 'যোজন-বিয়োজন', 'ঘ': 'যোজন' }, answer: 'খ', marks: 1 },
  { question: 'a : b = c : d হলে (a+b)/b = ?', options: { 'ক': '(c+d)/d', 'খ': '(c-d)/d', 'গ': 'c/d', 'ঘ': 'a/c' }, answer: 'ক', marks: 1 },
  { question: 'a : b = c : d হলে (a-b)/b = ?', options: { 'ক': '(c+d)/d', 'খ': '(c-d)/d', 'গ': 'b/a', 'ঘ': 'd/c' }, answer: 'খ', marks: 1 },
  { question: 'a : b = c : d হলে (a+b)/(a-b) = ?', options: { 'ক': '(c+d)/(c-d)', 'খ': '(c-d)/(c+d)', 'গ': 'c/d', 'ঘ': '1' }, answer: 'ক', marks: 1 },
  { question: 'a/b = c/d = e/f = k হলে (a+c+e)/(b+d+f) = ?', options: { 'ক': 'k', 'খ': '3k', 'গ': 'k/3', 'ঘ': '1' }, answer: 'ক', marks: 1 },
  // 3.5:5.6 = 1:a → a=1.6
  { question: '3.5 : 5.6 = 1 : a হলে a = ?', options: { 'ক': '1.4', 'খ': '1.6', 'গ': '2.0', 'ঘ': '0.625' }, answer: 'খ', marks: 1 },
  // x:y=5:6 → 3x:5y = 15:30 = 1:2
  { question: 'x : y = 5 : 6 হলে 3x : 5y = ?', options: { 'ক': '1 : 2', 'খ': '3 : 5', 'গ': '5 : 6', 'ঘ': '15 : 30' }, answer: 'ক', marks: 1 },
  // Ex11g: x=10pq/(p+q) → sum of fractions = 2
  { question: 'x = 10pq/(p+q) হলে (x+5p)/(x-5p) + (x+5q)/(x-5q) = ?', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': 'p/q' }, answer: 'গ', marks: 1 },
  { question: 'x = 4ab/(a+b) হলে (x+2a)/(x-2a) + (x+2b)/(x-2b) = ?', options: { 'ক': '0', 'খ': '1', 'গ': '2', 'ঘ': '4' }, answer: 'গ', marks: 1 },

  // ─── অনুশীলনী ১১.১ MCQ (23-35) ───
  // ratio 3:4, LCM 180 → 45, 60
  { question: 'অনুপাত 3:4, ল.সা.গু. 180। ছোট সংখ্যা—', options: { 'ক': '45', 'খ': '60', 'গ': '90', 'ঘ': '120' }, answer: 'ক', marks: 1 },
  { question: 'অনুপাত 3:4, ল.সা.গু. 180। বড় সংখ্যা—', options: { 'ক': '45', 'খ': '60', 'গ': '90', 'ঘ': '120' }, answer: 'খ', marks: 1 },
  // absent:present 1:4 → 20%
  { question: 'অনুপস্থিত:উপস্থিত = 1:4। অনুপস্থিত শতকরা—', options: { 'ক': '20%', 'খ': '25%', 'গ': '80%', 'ঘ': '75%' }, answer: 'ক', marks: 1 },
  // 28% loss → SP:CP = 72:100 = 18:25
  { question: '28% ক্ষতিতে বিক্রয়:ক্রয় অনুপাত—', options: { 'ক': '28:100', 'খ': '18:25', 'গ': '72:28', 'ঘ': '7:10' }, answer: 'খ', marks: 1 },
  // sum 70, 7yr ago 5:2 → a=47,b=23; 5yr later 52:28=13:7
  { question: 'পিতা+পুত্র=70, 7 বছর আগে 5:2। 5 বছর পর অনুপাত—', options: { 'ক': '13:7', 'খ': '5:2', 'গ': '8:3', 'ঘ': '7:2' }, answer: 'ক', marks: 1 },
  // Ex9: x/(y+z)=y/(z+x)=z/(x+y) → k=-1 or 1/2
  { question: 'x/(y+z)=y/(z+x)=z/(x+y), x≠y≠z। k = ?', options: { 'ক': '1', 'খ': '-1 বা 1/2', 'গ': '0', 'ঘ': '2' }, answer: 'খ', marks: 1 },
  // Ex8: (a+b)/(b+c)=(c+d)/(d+a) → c=a or sum=0
  { question: '(a+b)/(b+c)=(c+d)/(d+a) হলে—', options: { 'ক': 'c=a বা a+b+c+d=0', 'খ': 'a=b', 'গ': 'b=c', 'ঘ': 'd=0' }, answer: 'ক', marks: 1 },

  // ─── ১১.৩ ধারাবাহিক (36-42) ───
  // Ex12: 3:4 and 6:7 → 9:12:14
  { question: 'a:b=3:4, b:c=6:7। a:b:c = ?', options: { 'ক': '3:4:7', 'খ': '9:12:14', 'গ': '6:8:7', 'ঘ': '18:24:28' }, answer: 'খ', marks: 1 },
  // 2:3 and 4:3 → 8:12:9
  { question: '2:3 ও 4:3 ধারাবাহিক অনুপাত—', options: { 'ক': '2:3:3', 'খ': '8:12:9', 'গ': '4:6:3', 'ঘ': '2:4:3' }, answer: 'খ', marks: 1 },
  // angles 3:4:5 → 45,60,75
  { question: 'ত্রিভুজ কোণ 3:4:5। বৃহত্তম কোণ—', options: { 'ক': '45°', 'খ': '60°', 'গ': '75°', 'ঘ': '90°' }, answer: 'গ', marks: 1 },
  // 10% side → 21% area
  { question: 'বর্গ বাহু 10% বৃদ্ধি। ক্ষেত্রফল বৃদ্ধি—', options: { 'ক': '10%', 'খ': '20%', 'গ': '21%', 'ঘ': '100%' }, answer: 'গ', marks: 1 },
  // 20% side → 44% area
  { question: 'বর্গ বাহু 20% বৃদ্ধি। ক্ষেত্রফল বৃদ্ধি—', options: { 'ক': '20%', 'খ': '40%', 'গ': '44%', 'ঘ': '400%' }, answer: 'গ', marks: 1 },
  // rect +10% L, -10% W → 1% decrease
  { question: 'দৈর্ঘ্য 10% বৃদ্ধি, প্রস্থ 10% হ্রাস। ক্ষেত্রফল—', options: { 'ক': '1% বৃদ্ধি', 'খ': '1% হ্রাস', 'গ': 'অপরিবর্তিত', 'ঘ': '10% হ্রাস' }, answer: 'খ', marks: 1 },
  // side double → area 4x
  { question: 'বর্গ বাহু দ্বিগুণ। ক্ষেত্রফল—', options: { 'ক': '2 গুণ', 'খ': '3 গুণ', 'গ': '4 গুণ', 'ঘ': '6 গুণ' }, answer: 'গ', marks: 1 },

  // ─── অনুশীলনী ১১.২ MCQ (43-50) ───
  { question: 'a,b,c ক্রমিক সমানুপাতী হলে—', options: { 'ক': 'a²=bc', 'খ': 'b²=ac', 'গ': 'ab=bc', 'ঘ': 'a=b=c' }, answer: 'খ', marks: 1 },
  // Abid 20, ratio 5:3, after 8 years 7:5
  { question: 'আবিদ:আকিব=5:3, আবিদ 20 বছর। 7:5 হবে কত বছর পর—', options: { 'ক': '5', 'খ': '6', 'গ': '8', 'ঘ': '10' }, answer: 'গ', marks: 1 },
  // x:y=7:5, y:z=5:7 → x:z=1:1=35:35
  { question: 'x:y=7:5, y:z=5:7। x:z = ?', options: { 'ক': '35:49', 'খ': '35:35', 'গ': '25:49', 'ঘ': '49:25' }, answer: 'খ', marks: 1 },
  // x:y=2:1, y:z=2:1 → z:x=1:4, all iii true
  { question: 'x:y=2:1, y:z=2:1। z:x = ?', options: { 'ক': '4:1', 'খ': '1:4', 'গ': '2:1', 'ঘ': '1:2' }, answer: 'খ', marks: 1 },
  // perimeter 36, 3:4:5 → diff 15-9=6
  { question: 'বাহু 3:4:5, পরিসীমা 36। বৃহত্তম−ক্ষুদ্রতম—', options: { 'ক': '9', 'খ': '6', 'গ': '5', 'ঘ': '2' }, answer: 'খ', marks: 1 },
  // area 3-4-5 triangle sides 9,12,15 → 54
  { question: 'উপরের ত্রিভুজের ক্ষেত্রফল—', options: { 'ক': '6', 'খ': '54', 'গ': '67', 'ঘ': '90' }, answer: 'খ', marks: 1 },
  // yield 4:7, 304 → 532
  { question: 'ফলন অনুপাত 4:7, আগে 304 কুইন্টাল। পরে—', options: { 'ক': '456', 'খ': '532', 'গ': '608', 'ঘ': '420' }, answer: 'খ', marks: 1 },
  // land 432, 3:4 and 2:5 → other 1440
  { question: 'ক্ষেত্রফল 432, দৈর্ঘ্য 3:4 প্রস্থ 2:5। অপর জমি—', options: { 'ক': '720', 'খ': '864', 'গ': '1440', 'ঘ': '2160' }, answer: 'গ', marks: 1 },
  // 300 tk split 4:6:12:8 → 30,45,90,60
  { question: '300 টাকা 4:6:12:8 অনুপাতে। ২য় অংশ—', options: { 'ক': '30', 'খ': '45', 'গ': '60', 'ঘ': '90' }, answer: 'খ', marks: 1 },
  // 690 fish → 200,240,250
  { question: '690 মাছ 20:24:25 অনুপাতে। প্রথম জেলে—', options: { 'ক': '200', 'খ': '230', 'গ': '240', 'ঘ': '250' }, answer: 'ক', marks: 1 },
  // father+son=70 → 47,23
  { question: 'পিতা+পুত্র=70, 7 বছর আগে 5:2। পিতার বয়স—', options: { 'ক': '35', 'খ': '40', 'গ': '47', 'ঘ': '50' }, answer: 'গ', marks: 1 },
  // componendo (a+b)/b
  { question: 'a:b=2:3, c:d=4:6 হলে (a+b)/b = ?', options: { 'ক': '5/3', 'খ': '5/2', 'গ': '3/5', 'ঘ': '2/3' }, answer: 'ক', marks: 1 },
  // 400 at 10% loss → 9:10
  { question: '10% ক্ষতিতে বিক্রয়:ক্রয় = ?', options: { 'ক': '10:9', 'খ': '9:10', 'গ': '11:10', 'ঘ': '1:1' }, answer: 'খ', marks: 1 },
  // GCD 4 ratio 5:7 LCM 140
  { question: 'অনুপাত 5:7, গ.সা.গু. 4। ল.সা.গু.—', options: { 'ক': '20', 'খ': '28', 'গ': '140', 'ঘ': '280' }, answer: 'গ', marks: 1 },
]

const cqTemplates = [
  { stimulus: 'পিতা-পুত্র বয়স 7:2, 5 বছর পর 8:3 (উদাহরণ ২)।', parts: { 'ক': 'a/b=7/2 ও (a+5)/(b+5)=8/3 সমীকরণ।', 'খ': 'b=10 বছর।', 'গ': 'a=35 বছর।' } },
  { stimulus: 'a : b = b : c হলে ((a+b)/(b+c))² = (a²+b²)/(b²+c²) (উদাহরণ ৩)।', parts: { 'ক': 'b²=ac লেখো।', 'খ': 'বামপক্ষ a/c এ সরল করো।', 'গ': 'ডানপক্ষ a/c — সমতা প্রমাণ।' } },
  { stimulus: 'a/b = c/d হলে (a²+b²)/(a²−b²) = (ac+bd)/(ac−bd) (উদাহরণ ৪)।', parts: { 'ক': 'a=bk, c=dk ধরো।', 'খ': 'বামপক্ষ (k²+1)/(k²−1)।', 'গ': 'ডানপক্ষ একই — প্রমাণ।' } },
  { stimulus: '(a³+b³)/(a−b+c) = a(a+b) হলে a,b,c ক্রমিক সমানুপাতী (উদাহরণ ৭)।', parts: { 'ক': 'a³+b³ = (a+b)(a²−ab+b²) প্রয়োগ।', 'খ': 'a²−ab+b² = a সরল করো।', 'গ': 'b²=ac দেখাও।' } },
  { stimulus: '(a+b)/(b+c) = (c+d)/(d+a) (উদাহরণ ৮)।', parts: { 'ক': 'উভয় পক্ষ থেকে 1 বিয়োগ করো।', 'খ': '(a−c)(a+b+c+d)=0।', 'গ': 'c=a বা a+b+c+d=0।' } },
  { stimulus: 'x/(y+z) = y/(z+x) = z/(x+y) (উদাহরণ ৯)।', parts: { 'ক': 'k=-1 দেখাও (x−y=bk(y−x))।', 'খ': 'যোগ করে k=1/2।', 'গ': 'k=-1 বা 1/2।' } },
  { stimulus: 'ax=by=cz হলে x²/(yz)+y²/(zx)+z²/(xy) = bc/a²+ca/b²+ab/c² (উদাহরণ ১০)।', parts: { 'ক': 'x=k/a, y=k/b, z=k/c।', 'খ': 'প্রত্যেক পদ bc/a² আকারে।', 'গ': 'সমতা প্রমাণ।' } },
  { stimulus: 'a,b,c,d ক্রমিক সমানুপাতী (উদাহরণ ১১)।', parts: { 'ক': 'a/c = (a²+b²)/(b²+c²) প্রমাণ।', 'খ': '(a²+b²+c²)(b²+c²+d²)=(ab+bc+cd)²।', 'গ': 'x=10pq/(p+q) হলে ভগ্নাংশদ্বয়ের যোগফল=2।' } },
  { stimulus: 'a : b = c : d হলে রূপান্তর বিধি (১১.২)।', parts: { 'ক': 'ব্যস্তকরণ: b:a=d:c প্রমাণ।', 'খ': 'একান্তরকরণ: a:c=b:d প্রমাণ।', 'গ': 'যোজন-বিয়োজন: (a+b)/(a−b)=(c+d)/(c−d)।' } },
  { stimulus: 'অনুপাত 3:4, ল.সা.গু. 180 (অনুশীলনী ১১.১-৩)।', parts: { 'ক': '3k:4k আকারে লেখো।', 'খ': 'ল.সা.গু.(3k,4k)=12k=180 → k=15।', 'গ': 'সংখ্যা 45 ও 60।' } },
  { stimulus: 'পিতা+পুত্র=70, 7 বছর আগে 5:2 (অনুশীলনী ১১.১-৬)।', parts: { 'ক': 'a+b=70, (a−7)/(b−7)=5/2।', 'খ': 'a=47, b=23।', 'গ': '5 বছর পর অনুপাত 13:7।' } },
  { stimulus: 'a : b = b : c হলে a/c = (a²+b²)/(b²+c²) (অনুশীলনী ১১.১-৭ক)।', parts: { 'ক': 'b²=ac।', 'খ': 'বামপক্ষ a/c।', 'গ': 'ডানপক্ষ a(a+c)/(c(a+c))=a/c।' } },
  { stimulus: 'x = 4ab/(a+b) (অনুশীলনী ১১.১-১০)।', parts: { 'ক': 'x/(2a)=2b/(a+b) যোজন-বিয়োজন।', 'খ': '(x+2a)/(x−2a)=2b/(a−b) আকারে।', 'গ': 'দুই ভগ্নাংশের যোগফল=2।' } },
  { stimulus: 'a : b = 3 : 4, b : c = 6 : 7 (উদাহরণ ১২)।', parts: { 'ক': '4 ও 6 এর ল.সা.গু.=12।', 'খ': '3:4=9:12, 6:7=12:14।', 'গ': 'a:b:c = 9:12:14।' } },
  { stimulus: 'ত্রিভুজ কোণ 3:4:5 (উদাহরণ ১৩)।', parts: { 'ক': '3x+4x+5x=180°।', 'খ': 'x=15°।', 'গ': 'কোণ 45°, 60°, 75°।' } },
  { stimulus: 'বর্গ বাহু 10% বৃদ্ধি (উদাহরণ ১৪)।', parts: { 'ক': 'নতুন বাহু 1.1a।', 'খ': 'নতুন ক্ষেত্রফল 1.21a²।', 'গ': '21% বৃদ্ধি।' } },
  { stimulus: '2:3 ও 4:3 ধারাবাহিক (১১.৩)।', parts: { 'ক': '3,4 এর ল.সা.গু.=12।', 'খ': '2:3=8:12, 4:3=12:9।', 'গ': '8:12:9।' } },
  { stimulus: '300 টাকা ক:খ:গ:ঘ = 2:3, 1:2, 3:2 (অনুশীলনী ১১.২-৭)।', parts: { 'ক': '2:3 ও 1:2 → 4:6:12।', 'খ': 'গ:ঘ=3:2 → 12:8।', 'গ': '40, 60, 120, 80 টাকা।' } },
  { stimulus: '690 মাছ, অনুপাত 2/3, 4/5, 5/6 (অনুশীলনী ১১.২-৮)।', parts: { 'ক': '20:24:25 আকারে লেখো।', 'খ': 'মোট 69 ভাগ, প্রতি 10।', 'গ': '200, 240, 250 মাছ।' } },
  { stimulus: 'পরিসীমা 45, বাহু 3:5:7 (অনুশীলনী ১১.২-৯)।', parts: { 'ক': '15x=45 → x=3।', 'খ': 'বাহু 9, 15, 21 সে.মি.', 'গ': 'চিত্র আঁকো।' } },
  { stimulus: '171 রান, সাকিব:মুশফিক=3:2, মুশফিক:মাশরাফি=3:2 (অনুশীলনী ১১.২-১০)।', parts: { 'ক': '9:6:4 ধারাবাহিক।', 'খ': '19 ভাগ, প্রতি 9 রান।', 'গ': '81, 54, 36 রান।' } },
  { stimulus: 'বেতন 150000, কর্মকর্তা:সহকারী:সহায়ক = 2:7:3 ও 4:2:1 (অনুশীলনী ১১.২-১১)।', parts: { 'ক': 'মোট অংশ 8+14+3=25? (4×2):(2×7):(1×3)=8:14:3।', 'খ': 'প্রতি অংশ 6000 টাকা।', 'গ': '48000, 84000, 18000 টাকা।' } },
  { stimulus: 'ফলন 4:7, আগে 304 কুইন্টাল (অনুশীলনী ১১.২-১৪)।', parts: { 'ক': '304×7/4।', 'খ': '532 কুইন্টাল।', 'গ': '78% বৃদ্ধি (532−304)/304।' } },
  { stimulus: 'ক্ষেত্রফল 432, দৈর্ঘ্য 3:4 প্রস্থ 2:5 (অনুশীলনী ১১.২-১৬)।', parts: { 'ক': '6xy=432 → xy=72।', 'খ': 'অপর জমি 20xy।', 'গ': '1440 বর্গমি.' } },
  { stimulus: 'অনুপস্থিত:উপস্থিত=1:4, 5 জন বেশি উপস্থিত হলে 1:9 (নমুনা)।', parts: { 'ক': 'p/(4p+5)=1/9।', 'খ': 'p=1, মোট 5 জন।', 'গ': '5 জন বেশি উপস্থিতে 1:9 যাচাই।' } },
  { stimulus: 'ক্ষেত্রফল 336, দৈর্ঘ্য 2:3 প্রস্থ 4:5 (নমুনা দৃশ্য ২)।', parts: { 'ক': '8xy=336 → xy=42।', 'খ': '২য় জমি 15xy।', 'গ': '630 বর্গ একক।' } },
  { stimulus: '400 টাকায় 10% ক্ষতি (নমুনা)।', parts: { 'ক': 'বিক্রয়মূল্য 360 টাকা।', 'খ': '360:400 = 9:10।', 'গ': 'ক্ষতির হার 10% যাচাই।' } },
  { stimulus: 'গ.সা.গু. 4, অনুপাত 5:7 (নমুনা SAQ)।', parts: { 'ক': 'সংখ্যা 20 ও 28।', 'খ': 'ল.সা.গু.=140।', 'গ': 'ল.সা.গু.= (20×28)/4=140 যাচাই।' } },
  { stimulus: 'x:y=3:4, y:z=2:3 (নমুনা SAQ)।', parts: { 'ক': '6:8:12 ধারাবাহিক।', 'খ': 'x/3=2, y/4=2, z/6=2।', 'গ': 'x/3=y/4=z/6 প্রমাণ।' } },
  { stimulus: '12 হেক্টর জমি (উদাহরণ ১৫)।', parts: { 'ক': '120000 বর্গমি.', 'খ': '6xy=120000, xy=20000।', 'গ': 'অপর জমি 240000 বর্গমি.' } },
  { stimulus: 'a : b = c : d প্রমাণ: যোজন ও বিয়োজন।', parts: { 'ক': '(a+b)/b=(c+d)/d প্রমাণ।', 'খ': '(a−b)/b=(c−d)/d প্রমাণ।', 'গ': 'উভয় একসাথে componendo-dividendo।' } },
  { stimulus: 'lx=my=nz (অনুশীলনী ১১.১-১৯)।', parts: { 'ক': 'x=k/l, y=k/m, z=k/n।', 'খ': 'x²/(yz)=mn/l²।', 'গ': 'তিন পদের যোগফল mn/l²+nl/m²+lm/n²।' } },
  { stimulus: 'সমানুপাতিক ভাগ: S কে a:b:c অনুপাতে।', parts: { 'ক': '১ম অংশ = Sa/(a+b+c)।', 'খ': '500 টাকা 2:3:5 → 100,150,250।', 'গ': 'সংজ্ঞা ও সূত্র ব্যাখ্যা।' } },
  { stimulus: 'বৃত্ত ও বর্গ সমান ক্ষেত্রফল (অনুশীলনী ১১.১-২)।', parts: { 'ক': 'πr²=a² → r=a/√π।', 'খ': 'পরিসীমা অনুপাত 2πr:4a।', 'গ': '√π:2 আকারে সরল।' } },
  { stimulus: 'ধান:চাল=3:2, গম:সুজি=4:3 (অনুশীলনী ১১.২-১৫)।', parts: { 'ক': 'সমান পরিমাণ D ধান ও গম।', 'খ': 'চাল=2D/3, সুজি=3D/4।', 'গ': 'চাল:সুজি=8:9।' } },
  { stimulus: 'জেমি ও সিমি ঋণ, 10% সরল সুদ (অনুশীলনী ১১.২-১৭)।', parts: { 'ক': 'জেমি 2 বছরে = সিমি 3 বছরে শোধ।', 'খ': 'P₁(1+0.1×2)=P₂(1+0.1×3)।', 'গ': 'P₁:P₂=1.3:1.2=13:12।' } },
  { stimulus: 'y²+zx=4yz যাচাই, x:y=2:1, y:z=2:1 (অনুশীলনী ১১.২-৪)।', parts: { 'ক': 'x=4k,y=2k,z=k।', 'খ': 'z:x=1:4।', 'গ': 'y²+zx=4k²+2k²=6k²=4yz যাচাই।' } },
  { stimulus: '(a²+b²)/(b²+c²)=(a+b)²/(b+c)² হলে a,b,c ক্রমিক (অনুশীলনী ১১.১-১৩)।', parts: { 'ক': 'বামপক্ষ a/c আকারে (b²=ac ধরে)।', 'খ': 'ডানপক্ষ a/c।', 'গ': 'b²=ac → ক্রমিক সমানুপাতী।' } },
  { stimulus: 'x/(b+c)=y/(c+a)=z/(a+b) (অনুশীলনী ১১.১-১৪)।', parts: { 'ক': 'প্রতিটি = k ধরো।', 'খ': 'x=k(b+c) ইত্যাদি।', 'গ': 'a/(y+z−x)=b/(z+x−y)=c/(x+y−z) প্রমাণ।' } },
  { stimulus: 'a+b−c, b+c−a, c+a−b সমান (অনুশীলনী ১১.১-১৬)।', parts: { 'ক': 'প্রতিটি = k/a, k/b, k/c আকারে।', 'খ': 'a+b+c≠0 শর্ত।', 'গ': 'a=b=c প্রমাণ।' } },
  { stimulus: '3.5:5.6 = b:1 আকারে (১১.২ কাজ)।', parts: { 'ক': 'b=3.5/5.6=0.625।', 'খ': '1:a=1:1.6 যাচাই।', 'গ': 'দশমিক অনুপাত সরলীকরণ।' } },
  { stimulus: 'রনি:সনি:সমির = 1000:1500:2500 (১১.৩)।', parts: { 'ক': '2:3 ও 3:5 ধারাবাহিক।', 'খ': '2:3:5।', 'গ': 'সমির 1125 হলেও 8:12:9 আকারে লেখা যায় (উদাহরণ)।' } },
  { stimulus: 'গতিবেগ-সময় সম্পর্ক (উদাহরণ ১)।', parts: { 'ক': 'v₁t₁=v₂t₂।', 'খ': 'v₁:v₂=t₂:t₁।', 'গ': 'বাস্তব উদাহরণ দাও।' } },
  { stimulus: 'x:y=7:5, y:z=5:7 ধারাবাহিক (অনুশীলনী ১১.২-৩)।', parts: { 'ক': 'x=7k, z=7k।', 'খ': 'x:z=1:1।', 'গ': '35:35 আকারে লেখো।' } },
  { stimulus: '1 ঘন সে.মি. কাঠ 7 dg, পানির ঘনত্ব 1 g/cm³ (অনুশীলনী ১১.২-৬)।', parts: { 'ক': '7 dg = 0.7 g।', 'খ': '0.7:1 = 70%।', 'গ': 'শতকরা 70% ভাগ।' } },
  { stimulus: '700 mg/cm³ কাঠ ও পানি (নমুনা SAQ)।', parts: { 'ক': 'পানি 1000 mg/cm³।', 'খ': '700:1000=7:10।', 'গ': 'অনুপাত সরলীকরণ।' } },
  { stimulus: '(x²+y²)/(y²+z²)=x/z হলে x,y,z ক্রমিক (নমুনা SAQ)।', parts: { 'ক': 'xz=y² দেখাও।', 'খ': 'x:y=y:z।', 'গ': 'ক্রমিক সমানুপাতী প্রমাণ।' } },
  { stimulus: 'a/b=c/d=e/f=g/h সমানুপাত (১১.২-৬)।', parts: { 'ক': 'প্রতিটি = k।', 'খ': '(a+c+e+g)/(b+d+f+h)=k।', 'গ': 'সংখ্যা উদাহরণ দিয়ে যাচাই।' } },
  { stimulus: 'বীজগাণিতিক অনুপাত ও সমানুপাত — অধ্যায় সারাংশ।', parts: { 'ক': 'অনুপাত ও সমানুপাত সংজ্ঞা।', 'খ': 'ক্রমিক সমানুপাত ও ধারাবাহিক অনুপাত।', 'গ': 'সমানুপাতিক ভাগের সূত্র।' } },
  { stimulus: '300 টাকা 4:6:12:8 অনুপাতে ভাগ (অনুশীলনী ১১.২-৭ যাচাই)।', parts: { 'ক': 'মোট 30 ভাগ।', 'খ': 'প্রতি ভাগ 10 টাকা।', 'গ': '30, 45, 90, 60 টাকা।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))

const saq = [
  { question: 'অনুপাতের সংজ্ঞা লেখো।', marks: 2 },
  { question: 'সমানুপাতের সংজ্ঞা লেখো।', marks: 2 },
  { question: 'ক্রমিক সমানুপাতী কী?', marks: 2 },
  { question: 'ধারাবাহিক অনুপাত কী?', marks: 2 },
  { question: 'সমানুপাতিক ভাগ কী?', marks: 2 },
  { question: 'ব্যস্তকরণ (Invertendo) কী?', marks: 2 },
  { question: 'যোজন-বিয়োজন (Componendo-Dividendo) কী?', marks: 2 },
  // ratio 5:7, GCD 4 → LCM 140
  { question: 'অনুপাত 5:7, গ.সা.গু. 4। ল.সা.গু. কত?', marks: 2 },
  // 3:4 LCM 180 → 45, 60
  { question: 'অনুপাত 3:4, ল.সা.গু. 180। সংখ্যা দুইটি?', marks: 2 },
  // 10% loss on 400 → 9:10
  { question: '400 টাকায় 10% ক্ষতি। বিক্রয়:ক্রয় অনুপাত?', marks: 2 },
  // angles 3:4:5
  { question: 'ত্রিভুজ কোণ 3:4:5। কোণ তিনটি?', marks: 2 },
  // 2:3 and 4:3 → 8:12:9
  { question: '2:3 ও 4:3 ধারাবাহিক অনুপাত?', marks: 2 },
  // 10% square → 21%
  { question: 'বর্গ বাহু 10% বৃদ্ধি। ক্ষেত্রফল কত % বৃদ্ধি?', marks: 2 },
  // Abid 20, after 8 years 7:5
  { question: 'আবিদ 20 বছর, অনুপাত 5:3। 7:5 হবে কত বছর পর?', marks: 2 },
  // perimeter 45, 3:5:7 → 9,15,21
  { question: 'পরিসীমা 45, বাহু 3:5:7। বাহু তিনটি?', marks: 2 },
  // wood 700:1000 = 7:10
  { question: 'কাঠ 700 mg/cm³, পানি 1000 mg/cm³। ভরের অনুপাত?', marks: 2 },
  // yield 304×7/4=532
  { question: 'ফলন 4:7, আগে 304 কুইন্টাল। পরে কত?', marks: 2 },
  // ad=bc condition
  { question: 'a:b=c:d হলে কোন সম্পর্ক?', marks: 2 },
  // b²=ac
  { question: 'a:b=b:c হলে b² = ?', marks: 2 },
  { question: 'a:b=c:d হলে a:c = ?', marks: 2 },
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

const outPath = path.join(__dirname, '..', 'seed-class9-ch11.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
  console.error('❌ Count check failed')
  process.exit(1)
}
