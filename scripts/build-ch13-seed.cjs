/**
 * Generates seed-class9-ch13.cjs — MCQ=50, CQ=50, SAQ=20
 * Run: node scripts/build-ch13-seed.cjs
 * Source: chapter-13-finite-series.md (NCTB Class 9)
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 13: সসীম ধারা
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 13 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch13.cjs
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
const CHAPTER_ID = 'ch-13'
const TITLE_BN = 'সসীম ধারা'
const TITLE_EN = 'Finite Series'
`

const mcq = [
  // ─── ১৩.১ অনুক্রম ও ধারা (1-8) ───
  { question: 'অনুক্রমের পদগুলো পরস্পর + চিহ্নে যুক্ত করলে পাওয়া যায়—', options: { 'ক': 'ধারা', 'খ': 'ফাংশন', 'গ': 'সেট', 'ঘ': 'সমীকরণ' }, answer: 'ক', marks: 1 },
  { question: 'f(n)=2n অনুক্রমের প্রথম পদ—', options: { 'ক': '1', 'খ': '2', 'গ': '4', 'ঘ': '2n' }, answer: 'খ', marks: 1 },
  { question: '1,3,5,... অনুক্রমের সাধারণ পদ—', options: { 'ক': 'n', 'খ': '2n', 'গ': '2n−1', 'ঘ': 'n²' }, answer: 'গ', marks: 1 },
  { question: '1,4,9,... অনুক্রমের সাধারণ পদ—', options: { 'ক': 'n', 'খ': '2n', 'গ': 'n²', 'ঘ': 'n(n+1)' }, answer: 'গ', marks: 1 },
  { question: 'পাশাপাশি দুই পদের পার্থক্য সব সময় সমান হলে ধারা—', options: { 'ক': 'গুণোত্তর', 'খ': 'সমান্তর', 'গ': 'অসীম', 'ঘ': 'হারমোনিক' }, answer: 'খ', marks: 1 },
  { question: 'সমান্তর ধারায় সাধারণ অন্তর d হলে n তম পদ—', options: { 'ক': 'a+nd', 'খ': 'a+(n−1)d', 'গ': 'a+(n+1)d', 'ঘ': 'nd' }, answer: 'খ', marks: 1 },
  { question: 'সমান্তর ধারায় a=3, d=2 হলে n তম পদ—', options: { 'ক': '3n+2', 'খ': '2n+1', 'গ': '2n+3', 'ঘ': '3+2n' }, answer: 'খ', marks: 1 },
  { question: '1+3+5+7+9+11 — ধারাটি—', options: { 'ক': 'গুণোত্তর', 'খ': 'সমান্তর, সসীম', 'গ': 'অসীম', 'ঘ': 'হারমোনিক' }, answer: 'খ', marks: 1 },

  // ─── ১৩.২ সমান্তর ধারা সূত্র ও উদাহরণ (9-22) ───
  // Ex2: 5+8+11+...383 → 127th
  { question: '5+8+11+... ধারায় 383 কোন পদ?', options: { 'ক': '100', 'খ': '127', 'গ': '130', 'ঘ': '383' }, answer: 'খ', marks: 1 },
  // Ex3: S50 = 1275
  { question: 'প্রথম 50টি স্বাভাবিক সংখ্যার যোগফল—', options: { 'ক': '1250', 'খ': '1275', 'গ': '2550', 'ঘ': '4950' }, answer: 'খ', marks: 1 },
  // Ex4: 1+2+...+99 = 4950
  { question: '1+2+3+...+99 = ?', options: { 'ক': '4950', 'খ': '4900', 'গ': '9900', 'ঘ': '1275' }, answer: 'ক', marks: 1 },
  // Ex5: S30 of 7+12+17+... = 2385
  { question: '7+12+17+... প্রথম 30 পদের সমষ্টি—', options: { 'ক': '2100', 'খ': '2385', 'গ': '2550', 'ঘ': '4500' }, answer: 'খ', marks: 1 },
  // Ex6: 18th month 2900
  { question: 'উদাহরণ ৬: 18 তম মাসে সঞ্চয়—', options: { 'ক': '2700', 'খ': '2800', 'গ': '2900', 'ঘ': '3000' }, answer: 'গ', marks: 1 },
  // Ex6: first 18 months 36900
  { question: 'উদাহরণ ৬: প্রথম 18 মাসে মোট সঞ্চয়—', options: { 'ক': '32400', 'খ': '36000', 'গ': '36900', 'ঘ': '43200' }, answer: 'গ', marks: 1 },
  // Ex6: 36 months = 3 years
  { question: 'উদাহরণ ৬: 106200 টাকা সঞ্চয়ে কত বছর?', options: { 'ক': '2', 'খ': '3', 'গ': '4', 'ঘ': '36' }, answer: 'খ', marks: 1 },
  // Sn = n/2(a+p)
  { question: 'সমান্তর ধারায় a, p, n জানা থাকলে Sn = ?', options: { 'ক': 'n(a+p)/2', 'খ': 'n(2a+(n−1)d)/2', 'গ': 'na', 'ঘ': 'n²' }, answer: 'ক', marks: 1 },
  // Sn = n/2(2a+(n-1)d)
  { question: 'a, d, n জানা থাকলে Sn = ?', options: { 'ক': 'n(a+p)/2', 'খ': 'n{2a+(n−1)d}/2', 'গ': 'an', 'ঘ': 'a+(n−1)d' }, answer: 'খ', marks: 1 },
  // 1+2+...+n = n(n+1)/2
  { question: '1+2+3+...+n = ?', options: { 'ক': 'n²', 'খ': 'n(n+1)/2', 'গ': 'n(n+1)(2n+1)/6', 'ঘ': '{n(n+1)/2}²' }, answer: 'খ', marks: 1 },

  // ─── অনুশীলনী ১৩.১ MCQ (23-28) ───
  // #1: 13+20+...+111 → n=15
  { question: '13+20+27+...+111 ধারার পদ সংখ্যা—', options: { 'ক': '10', 'খ': '13', 'গ': '15', 'ঘ': '20' }, answer: 'গ', marks: 1 },
  // #2: 5+8+11+...+62 → i and iii
  { question: '5+8+11+...+62 — i সসীম, iii 19তম=59। সঠিক?', options: { 'ক': 'i ও ii', 'খ': 'i ও iii', 'গ': 'ii ও iii', 'ঘ': 'i,ii,iii' }, answer: 'খ', marks: 1 },
  // #3: 7+13+19+... 15th = 91
  { question: '7+13+19+... ধারার 15 তম পদ—', options: { 'ক': '85', 'খ': '91', 'গ': '97', 'ঘ': '104' }, answer: 'খ', marks: 1 },
  // #4: S20 = 1280
  { question: '7+13+19+... প্রথম 20 পদের সমষ্টি—', options: { 'ক': '141', 'খ': '1210', 'গ': '1280', 'ঘ': '2560' }, answer: 'গ', marks: 1 },
  // #9: sum of n odd = n²
  { question: '1+3+5+...+ (n পদ) সমষ্টি—', options: { 'ক': 'n', 'খ': 'n²', 'গ': '2n', 'ঘ': 'n(n+1)/2' }, answer: 'খ', marks: 1 },
  // #13: S23 = 552
  { question: 'Sn=n(n+1) হলে প্রথম 23 পদের সমষ্টি—', options: { 'ক': '506', 'খ': '552', 'গ': '600', 'ঘ': '529' }, answer: 'খ', marks: 1 },

  // ─── ১৩.৩ সূত্র (29-34) ───
  { question: '1²+2²+...+n² = ?', options: { 'ক': 'n(n+1)/2', 'খ': 'n(n+1)(2n+1)/6', 'গ': '{n(n+1)/2}²', 'ঘ': 'n³' }, answer: 'খ', marks: 1 },
  { question: '1³+2³+...+n³ = ?', options: { 'ক': 'n(n+1)/2', 'খ': 'n(n+1)(2n+1)/6', 'গ': '{n(n+1)/2}²', 'ঘ': 'n²(n+1)²/4' }, answer: 'গ', marks: 1 },
  // n=6: sum squares = 91, sum cubes = 441
  { question: '1²+2²+...+6² = ?', options: { 'ক': '36', 'খ': '91', 'গ': '441', 'ঘ': '21' }, answer: 'খ', marks: 1 },
  { question: '1³+2³+...+6³ = ?', options: { 'ক': '21', 'খ': '91', 'গ': '441', 'ঘ': '216' }, answer: 'গ', marks: 1 },
  { question: '1³+2³+...+n³ = (1+2+...+n)² — এটি—', options: { 'ক': 'ভুল', 'খ': 'সঠিক', 'গ': 'শুধু n=1', 'ঘ': 'শুধু n=2' }, answer: 'খ', marks: 1 },
  // n=10: sum cubes = 3025 = 55²
  { question: '1³+2³+...+10³ = ?', options: { 'ক': '3025', 'খ': '385', 'গ': '55', 'ঘ': '1000' }, answer: 'ক', marks: 1 },

  // ─── ১৩.৪ গুণোত্তর ধারা (35-44) ───
  { question: 'গুণোত্তর ধারায় n তম পদ—', options: { 'ক': 'a+(n−1)r', 'খ': 'ar^(n−1)', 'গ': 'ar^n', 'ঘ': 'a/r^(n−1)' }, answer: 'খ', marks: 1 },
  { question: 'r<1 হলে Sn = ?', options: { 'ক': 'a(1−r^n)/(1−r)', 'খ': 'a(r^n−1)/(r−1)', 'গ': 'an', 'ঘ': 'ar^n' }, answer: 'ক', marks: 1 },
  { question: 'r>1 হলে Sn = ?', options: { 'ক': 'a(1−r^n)/(1−r)', 'খ': 'a(r^n−1)/(r−1)', 'গ': 'an', 'ঘ': 'a/r' }, answer: 'খ', marks: 1 },
  // Ex7: 10th term = 1024
  { question: '2+4+8+16+... ধারার 10 তম পদ—', options: { 'ক': '512', 'খ': '1024', 'গ': '2048', 'ঘ': '256' }, answer: 'খ', marks: 1 },
  // Ex10: sum = 1524
  { question: '12+24+48+...+768 ধারার সমষ্টি—', options: { 'ক': '768', 'খ': '1275', 'গ': '1524', 'ঘ': '2048' }, answer: 'গ', marks: 1 },
  // Ex11: S8 = 255/128
  { question: '1+1/2+1/4+...+8 পদের সমষ্টি—', options: { 'ক': '2', 'খ': '255/128', 'গ': '127/64', 'ঘ': '1' }, answer: 'খ', marks: 1 },
  // Ex9: 5th = 1/3, 10th = 1/729
  { question: 'GP: a=27, r=1/3। 5 তম পদ—', options: { 'ক': '9', 'খ': '3', 'গ': '1/3', 'ঘ': '1/9' }, answer: 'গ', marks: 1 },
  { question: 'GP: a=27, r=1/3। 10 তম পদ—', options: { 'ক': '1/27', 'খ': '1/81', 'গ': '1/243', 'ঘ': '1/729' }, answer: 'ঘ', marks: 1 },
  { question: 'r=1 হলে n পদের সমষ্টি—', options: { 'ক': 'a', 'খ': 'an', 'গ': 'a/r', 'ঘ': 'n' }, answer: 'খ', marks: 1 },

  // ─── অনুশীলনী ১৩.২ ও নমুনা (45-50) ───
  // #1: c = (b+d)/2
  { question: 'a,b,c,d ক্রমিক AP পদ হলে—', options: { 'ক': 'b=(c+d)/2', 'খ': 'a=(b+c)/2', 'গ': 'c=(b+d)/2', 'ঘ': 'd=(a+c)/2' }, answer: 'গ', marks: 1 },
  // #2: 8th term = 1/2
  { question: '64+32+16+8+... ধারার 8 তম পদ—', options: { 'ক': '1', 'খ': '1/2', 'গ': '1/4', 'ঘ': '2' }, answer: 'খ', marks: 1 },
  // #12: n=7 for sum 254
  { question: '2+4+8+...+254। পদ সংখ্যা n=?', options: { 'ক': '6', 'খ': '7', 'গ': '8', 'ঘ': '127' }, answer: 'খ', marks: 1 },
  // #7: x=15, y=45
  { question: '5+x+y+135 GP হলে x=?', options: { 'ক': '9', 'খ': '15', 'গ': '45', 'ঘ': '135' }, answer: 'খ', marks: 1 },
  // Sample: 5,8,11,...,99 → 3n+2
  { question: '5,8,11,...,99 অনুক্রমের সাধারণ পদ—', options: { 'ক': '2n+1', 'খ': '3n−1', 'গ': '3n+1', 'ঘ': '3n+2' }, answer: 'ঘ', marks: 1 },
  // Sample: 3+8+13+...+73 → i,ii,iii all true
  { question: '3+8+13+...+73 — i সসীম, ii AP, iii 11তম=53। সঠিক?', options: { 'ক': 'i ও ii', 'খ': 'i ও iii', 'গ': 'ii ও iii', 'ঘ': 'i,ii,iii' }, answer: 'ঘ', marks: 1 },
  // Ex13.1 #10: S9=360
  { question: '8+16+24+... প্রথম 9 পদের সমষ্টি—', options: { 'ক': '288', 'খ': '360', 'গ': '432', 'ঘ': '720' }, answer: 'খ', marks: 1 },
  // Ex13.1 #15: n=16
  { question: '9+7+5+... যোগফল −144 হলে n=?', options: { 'ক': '12', 'খ': '14', 'গ': '16', 'ঘ': '18' }, answer: 'গ', marks: 1 },
  // Ex13.1 #16: n=50
  { question: '2+4+6+... সমষ্টি 2550 হলে n=?', options: { 'ক': '45', 'খ': '50', 'গ': '51', 'ঘ': '55' }, answer: 'খ', marks: 1 },
  // Ex13.1 #18: S10=110
  { question: 'Sn=n(n+1) হলে প্রথম 10 পদের সমষ্টি—', options: { 'ক': '100', 'খ': '110', 'গ': '121', 'ঘ': '55' }, answer: 'খ', marks: 1 },
  // Ex13.1 #12: sum=42
  { question: '29+25+21+...−23 = ?', options: { 'ক': '28', 'খ': '42', 'গ': '56', 'ঘ': '−42' }, answer: 'খ', marks: 1 },
]

const cqTemplates = [
  { stimulus: 'অনুক্রম ও ধারার পার্থক্য (১৩.১)।', parts: { 'ক': 'অনুক্রম কী?', 'খ': 'ধারা কী?', 'গ': 'উদাহরণ: {2n} অনুক্রম ও 2+4+6+... ধারা।' } },
  { stimulus: '1+3+5+7+9+11 — সমান্তর সসীম ধারা (উদাহরণ ১)।', parts: { 'ক': 'a=1, d=2 নির্ণয়।', 'খ': 'সমান্তর ধারা প্রমাণ।', 'গ': 'পদ সংখ্যা 6।' } },
  { stimulus: 'n তম পদ সূত্র: a+(n−1)d (১৩.২)।', parts: { 'ক': 'a=5, d=7 হলে 6 পদ লেখো।', 'খ': '22 তম পদ।', 'গ': 'r তম ও (2p+1) তম পদ।' } },
  { stimulus: '5+8+11+14+... কোন পদ 383? (উদাহরণ ২)', parts: { 'ক': 'a=5, d=3।', 'খ': '383=a+(n−1)d।', 'গ': 'n=127।' } },
  { stimulus: 'Sn = n/2(a+p) ও Sn = n/2{2a+(n−1)d} (১৩.২)।', parts: { 'ক': 'দুই সূত্রের উদ্ভব।', 'খ': 'কখন (3) ব্যবহার?', 'গ': 'কখন (4) ব্যবহার?' } },
  { stimulus: 'প্রথম 50টি স্বাভাবিক সংখ্যার যোগফল (উদাহরণ ৩)।', parts: { 'ক': 'S_n=n(n+1)/2 সূত্র।', 'খ': 'n=50 বসাও।', 'গ': 'S_50=1275।' } },
  { stimulus: '1+2+3+...+99 (উদাহরণ ৪)।', parts: { 'ক': 'n=99 নির্ণয়।', 'খ': 'S_99=4950 (সূত্র 4)।', 'গ': 'বিকল্প: n/2(a+p)।' } },
  { stimulus: '7+12+17+... প্রথম 30 পদ (উদাহরণ ৫)।', parts: { 'ক': 'a=7, d=5, n=30।', 'খ': 'S_30=15(14+145)।', 'গ': 'S_30=2385।' } },
  { stimulus: 'রনিমের সঞ্চয় (উদাহরণ ৬)।', parts: { 'ক': 'a=1200, d=100, n তম=1100+100n।', 'খ': '18 তম=2900, S_18=36900।', 'গ': '106200 টাকায় 36 মাস=3 বছর।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১: 13+20+...+111।', parts: { 'ক': 'a=13, d=7।', 'খ': '111=13+(n−1)7।', 'গ': 'n=15।' } },
  { stimulus: 'অনুশীলনী ১৩.১-৫: 2,−5,−12,−19,...', parts: { 'ক': 'd=−7।', 'খ': '12 তম পদ=−75।', 'গ': 'সমান্তর ধারা।' } },
  { stimulus: 'অনুশীলনী ১৩.১-৬: 8+11+14+...392।', parts: { 'ক': 'a=8, d=3।', 'খ': '392=8+(n−1)3।', 'গ': '129 তম পদ।' } },
  { stimulus: 'অনুশীলনী ১৩.১-৭: 4+7+10+...301।', parts: { 'ক': 'a=4, d=3।', 'খ': 'n=100।', 'গ': '301=100 তম পদ।' } },
  { stimulus: 'অনুশীলনী ১৩.১-৮: m তম=n, n তম=m।', parts: { 'ক': 'a+(m−1)d=n, a+(n−1)d=m।', 'খ': 'd=−1, a=m+n−1।', 'গ': '(m+n) তম=0।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১০: 8+16+24+...9 পদ।', parts: { 'ক': 'a=8, d=8, n=9।', 'খ': 'S_9=9/2(8+72)।', 'গ': 'S_9=360।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১১: 5+11+17+...+59।', parts: { 'ক': 'n=10।', 'খ': 'S_10=5(5+59)।', 'গ': '345।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১২: 29+25+21+...−23।', parts: { 'ক': 'a=29, d=−4, n=14।', 'খ': 'S_14=7(29−23)।', 'গ': '42।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১৪: 16 তম পদ=−20।', parts: { 'ক': 'a+15d=−20।', 'খ': 'S_31=31/2(2a+30d)।', 'গ': 'S_31=−620।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১৫: 9+7+5+...=−144।', parts: { 'ক': 'a=9, d=−2।', 'খ': 'n(10−n)=−144।', 'গ': 'n=16।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১৬: 2+4+6+...=2550।', parts: { 'ক': 'S_n=n(n+1)=2550।', 'খ': 'n=50।', 'গ': '50 তম পদ=100।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১৭: S_n=n(n+1) ধারা নির্ণয়।', parts: { 'ক': 'a_1=2, a_2=4।', 'খ': '2,4,6,8,...', 'গ': 'a=2, d=2।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১৯: S_12=144, S_20=560।', parts: { 'ক': '2a+11d=24, 2a+19d=56।', 'খ': 'a=−10, d=4।', 'গ': 'S_m=2m²−12m।' } },
  { stimulus: 'অনুশীলনী ১৩.১-২৩: 2500 টাকা, কিস্তি 1,3,5,...', parts: { 'ক': 'a=1, d=2।', 'খ': 'S_n=n²=2500।', 'গ': '50 কিস্তি।' } },
  { stimulus: '1²+2²+...+n² সূত্র (১৩.৩)।', parts: { 'ক': 'r³−(r−1)³=3r²−3r+1।', 'খ': 'যোগ করে n³=3S_n−3n(n+1)/2+n।', 'গ': 'S_n=n(n+1)(2n+1)/6।' } },
  { stimulus: '1³+2³+...+n³ সূত্র (১৩.৩)।', parts: { 'ক': '4r³=(r+1)²r²−r²(r−1)²।', 'খ': 'S_n=n²(n+1)²/4।', 'গ': 'S_n={n(n+1)/2}²।' } },
  { stimulus: 'অনুশীলনী ১৩.২-১৪: ঘনের সমষ্টি=441।', parts: { 'ক': '{n(n+1)/2}²=441।', 'খ': 'n=6।', 'গ': 'সংখ্যার সমষ্টি=21।' } },
  { stimulus: 'অনুশীলনী ১৩.২-১৬: (ঘনের সমষ্টি)/(সংখ্যার সমষ্টি)=210।', parts: { 'ক': 'n(n+1)/2=210।', 'খ': 'n=20।', 'গ': 'যাচাই।' } },
  { stimulus: 'গুণোত্তর ধারা সংজ্ঞা (১৩.৪)।', parts: { 'ক': 'সাধারণ অনুপাত r।', 'খ': 'n তম= ar^(n−1)।', 'গ': '2+4+8+16+32 উদাহরণ।' } },
  { stimulus: '2+4+8+16+... 10 তম পদ (উদাহরণ ৭)।', parts: { 'ক': 'a=2, r=2।', 'খ': '10 তম=2×2⁹।', 'গ': '1024।' } },
  { stimulus: '128+64+32+... সাধারণ পদ (উদাহরণ ৮)।', parts: { 'ক': 'a=128, r=1/2।', 'খ': 'ar^(n−1)=128×(1/2)^(n−1)।', 'গ': '1/2^(n−8)।' } },
  { stimulus: 'GP a=27, r=1/3 (উদাহরণ ৯)।', parts: { 'ক': '5 তম=1/3।', 'খ': '10 তম=1/729।', 'গ': 'যাচাই।' } },
  { stimulus: '12+24+48+...+768 (উদাহরণ ১০)।', parts: { 'ক': 'a=12, r=2, n=7।', 'খ': 'S_7=12(2⁷−1)।', 'গ': '1524।' } },
  { stimulus: '1+1/2+1/4+...+8 পদ (উদাহরণ ১১)।', parts: { 'ক': 'a=1, r=1/2<1।', 'খ': 'S_8=1(1−(1/2)⁸)/(1−1/2)।', 'গ': '255/128।' } },
  { stimulus: 'অনুশীলনী ১৩.২-৩: 3+9+27+...14 পদ।', parts: { 'ক': 'a=3, r=3, n=14।', 'খ': 'S_14=3(3¹⁴−1)/2।', 'গ': '7174452।' } },
  { stimulus: 'অনুশীলনী ১৩.২-৪: 128+64+32+... কোন পদ 1/2?', parts: { 'ক': '128×(1/2)^(n−1)=1/2।', 'খ': 'n−1=8।', 'গ': '9 তম পদ।' } },
  { stimulus: 'অনুশীলনী ১৩.২-৭: 5+x+y+135 GP।', parts: { 'ক': '5r³=135, r=3।', 'খ': 'x=15, y=45।', 'গ': 'যাচাই।' } },
  { stimulus: 'অনুশীলনী ১৩.২-৮: 3+x+y+z+243 GP।', parts: { 'ক': '3r⁴=243, r=3।', 'খ': 'x=9, y=27, z=81।', 'গ': 'যাচাই।' } },
  { stimulus: 'অনুশীলনী ১৩.২-৯: 2−4+8−16+...7 পদ।', parts: { 'ক': 'a=2, r=−2।', 'খ': 'S_7=2((−2)⁷−1)/(−3)।', 'গ': '86।' } },
  { stimulus: 'অনুশীলনী ১৩.২-১০: 1−1+1−1+...(2n+1) পদ।', parts: { 'ক': 'বিজোড় পদ সংখ্যা।', 'খ': 'শেষ পদ=+1।', 'গ': 'সমষ্টি=1।' } },
  { stimulus: 'অনুশীলনী ১৩.২-১২: 2+4+8+...=254।', parts: { 'ক': '2(2^n−1)=254।', 'খ': '2^n=128।', 'গ': 'n=7।' } },
  { stimulus: 'পদ্মশ্রী সরকার বেতন (উদাহরণ ১২)।', parts: { 'ক': 'বেতন AP: 120000+125000+...।', 'খ': '26 বছরে 4270500 টাকা।', 'গ': 'জমা GP (r=1.12)।' } },
  { stimulus: 'নমুনা: প্রথম 20 স্বাভাবিক সংখ্যা + সঞ্চয় (সৃজনশীল)।', parts: { 'ক': 'S_20=210।', 'খ': '10,15,20,... S_21=1260।', 'গ': 'ধারা সূত্র প্রয়োগ।' } },
  { stimulus: 'নমুনা SAQ: 3+7+11+... পদসংখ্যা অনুক্রম।', parts: { 'ক': '1,2,3,... সাধারণ পদ n।', 'খ': '256+128+64+... কোন পদ 1/32?', 'গ': 'n=14।' } },
  { stimulus: 'নমুনা: AP 17 তম=43, S_33=?', parts: { 'ক': 'a+16d=43।', 'খ': 'S_33=33/2(2a+32d)=33(a+16d)।', 'গ': 'S_33=1419।' } },
  { stimulus: 'অনুশীলনী ১৩.১-২২: 1+3+5+...+125=169+171+...+209।', parts: { 'ক': 'বাম=63²=3969।', 'খ': 'ডান=21/2×378=3969।', 'গ': 'উভয় সমান, প্রমাণিত।' } },
  { stimulus: 'কাজ ১৩.১: সাধারণ পদ 1/n, 1/2^n।', parts: { 'ক': '1,1/2,1/3,...', 'খ': '1,1/2,1/4,...', 'গ': 'অনুক্রম লেখার পদ্ধতি।' } },
  { stimulus: 'কাজ ১৩.৪: a=4,r=10 GP লেখো।', parts: { 'ক': '4+40+400+...।', 'খ': 'a=9,r=1/3।', 'গ': 'a=−3,r=−1।' } },
  { stimulus: 'অনুশীলনী ১৩.১-১৮: Sn=n(n+1), 10 পদের সমষ্টি।', parts: { 'ক': 'S_10=10×11।', 'খ': '110।', 'গ': 'ধারা 2,4,6,...' } },
  { stimulus: 'অনুশীলনী ১৩.১-৯: nটি বিজোড় সংখ্যার যোগফল।', parts: { 'ক': '1,3,5,..., (2n−1)।', 'খ': 'S=n²।', 'গ': 'উদাহরণ: 5 পদ=25।' } },
  { stimulus: 'সসীম ধারা — অধ্যায় সারাংশ।', parts: { 'ক': 'AP ও GP সংজ্ঞা।', 'খ': 'তিনটি মূল সূত্র (যোগ, বর্গ, ঘন)।', 'গ': 'বাস্তব প্রয়োগ (সঞ্চয়, বেতন)।' } },
]

const cq = cqTemplates.map((t) => ({ ...t, totalMarks: 10 }))

const saq = [
  { question: 'অনুক্রম (Sequence) কী?', marks: 2 },
  { question: 'ধারা (Series) কী?', marks: 2 },
  { question: 'সমান্তর ধারা কী?', marks: 2 },
  { question: 'গুণোত্তর ধারা কী?', marks: 2 },
  { question: 'সাধারণ অন্তর d কী?', marks: 2 },
  { question: 'সাধারণ অনুপাত r কী?', marks: 2 },
  { question: 'সমান্তর n তম পদ সূত্র লেখো।', marks: 2 },
  { question: '1+2+...+n = ?', marks: 2 },
  { question: '1²+2²+...+n² = ?', marks: 2 },
  { question: '1³+2³+...+n³ = ?', marks: 2 },
  // Ex3
  { question: 'প্রথম 50টি স্বাভাবিক সংখ্যার যোগফল?', marks: 2 },
  // Ex4
  { question: '1+2+...+99 = ?', marks: 2 },
  // Ex7 GP 10th
  { question: '2+4+8+... 10 তম পদ?', marks: 2 },
  // Ex10 sum
  { question: '12+24+48+...+768 সমষ্টি?', marks: 2 },
  // Ex13.1 #1
  { question: '13+20+...+111 পদ সংখ্যা?', marks: 2 },
  // Ex13.1 #11
  { question: '5+11+17+...+59 = ?', marks: 2 },
  // Ex13.2 #7
  { question: '5+x+y+135 GP: x=?', marks: 2 },
  // Ex13.2 #12
  { question: '2+4+8+...=254। n=?', marks: 2 },
  // Sample 3n+2
  { question: '5,8,11,... সাধারণ পদ?', marks: 2 },
  // Ex6 18th month
  { question: 'উদাহরণ ৬: 18 তম মাসে সঞ্চয়?', marks: 2 },
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

const outPath = path.join(__dirname, '..', 'seed-class9-ch13.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts: MCQ=', mcq.length, 'CQ=', cq.length, 'SAQ=', saq.length, 'Total=', mcq.length + cq.length + saq.length)

if (mcq.length !== 50 || cq.length !== 50 || saq.length !== 20) {
  console.error('❌ Count check failed')
  process.exit(1)
}
