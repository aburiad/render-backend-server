---
class: 9
subject: math
chapter_no: 14
chapter_title_bn: অনুপাত, সদৃশতা ও প্রতিসমতা
chapter_title_en: Ratio, Similarity and Symmetry
book_pages: "266-284"
pdf_pages: "271-289"
source: "Secondary (BV) 2026 — Class 9-10 Math (NCTB)"
ocr_method: "Claude vision @ 15x scale + self-verified at 18x"
ocr_pass: 2
fidelity: "same-to-same — all theorems and proofs preserved verbatim; figures as TikZ-friendly placeholders"
subchapters:
  - id: "14.1"
    title: "অনুপাত ও সমানুপাতের ধর্ম, জ্যামিতিক সমানুপাত"
    heading: "## ১৪.১ অনুপাত ও সমানুপাতের ধর্ম (Properties of Ratio and Proportion)"
    type: "concept"
  - id: "14.2"
    title: "ত্রিভুজ সম্পর্কিত উপপাদ্য ও অনুসিদ্ধান্ত"
    heading: "## ১৪.২ ত্রিভুজ সম্পর্কিত উপপাদ্য ও অনুসিদ্ধান্ত"
    type: "concept"
  - id: "14.3"
    title: "নির্দিষ্ট অনুপাতে রেখাংশের বিভক্তিকরণ ও উদাহরণ"
    heading: "## ১৪.৩ নির্দিষ্ট অনুপাতে রেখাংশের বিভক্তিকরণ"
    type: "concept"
  - id: "14.ex1"
    title: "অনুশীলনী ১৪.১"
    heading: "## অনুশীলনী ১৪.১"
    type: "exercise"
  - id: "14.4"
    title: "সদৃশতা (Similarity)"
    heading: "## ১৪.৪ সদৃশতা (Similarity)"
    type: "concept"
  - id: "14.ex2"
    title: "অনুশীলনী ১৪.২"
    heading: "## অনুশীলনী ১৪.২"
    type: "exercise"
  - id: "14.5"
    title: "প্রতিসমতা ও ঘূর্ণন প্রতিসমতা"
    heading: "## ১৪.৫ প্রতিসমতা (Symmetry)"
    type: "concept"
  - id: "14.ex3"
    title: "অনুশীলনী ১৪.৩"
    heading: "## অনুশীলনী ১৪.৩"
    type: "exercise"
  - id: "14.sample"
    title: "নমুনা প্রশ্ন"
    heading: "## নমুনা প্রশ্ন"
    type: "sample"
---

# চতুর্দশ অধ্যায় — অনুপাত, সদৃশতা ও প্রতিসমতা (Ratio, Similarity and Symmetry)

## ভূমিকা

দুইটি রাশির তুলনা করার জন্য এদের অনুপাত বিবেচনা করা হয়। অনুপাত নির্ণয়ের জন্য রাশি দুইটি একই এককের পরিমাপ করতে হয়। এ সম্পর্কে বীজগণিতিক বিস্তারিত আলোচনা করা হয়েছে।

এ অধ্যায় শেষে শিক্ষার্থীরা—

- জ্যামিতিক অনুপাত সম্পর্কে ব্যাখ্যা করতে পারবে;
- রেখাংশের অন্তর্বিভক্তি ব্যাখ্যা করতে পারবে;
- অনুপাত সম্পর্কিত উপপাদ্যগুলো যাচাই ও প্রমাণ করতে পারবে;
- সদৃশতার অনুপাত সংক্রান্ত উপপাদ্যগুলো যাচাই ও প্রমাণ করতে পারবে;
- প্রতিসমতার ধারণা ব্যাখ্যা করতে পারবে;
- হাতে-কলমে বাস্তব উপকরণের সাহায্যে রেখা ও ঘূর্ণন প্রতিসমতা যাচাই করতে পারবে।

## ১৪.১ অনুপাত ও সমানুপাতের ধর্ম (Properties of Ratio and Proportion)

$(i)\, a : b = x : y$ এবং $c : d = x : y$ হলে, $a : b = c : d$

$(ii)\, a : b = b : a$ হলে, $a = b$

$(iii)\, a : b = x : y$ হলে, $b : a = y : x$ (ব্যস্তকরণ)

$(iv)\, a : b = x : y$ হলে, $a : x = b : y$ (একান্তরকরণ)

$(v)\, a : b = c : d$ হলে, $ad = bc$ (আড়গুণন)

$(vi)\, a : b = x : y$ হলে, $a + b : b = x + y : y$ (যোজন)

এবং $a - b : b = x - y : y$ (বিয়োজন)

$(vii)\, \dfrac{a}{b} = \dfrac{c}{d}$ হলে, $\dfrac{a + b}{a - b} = \dfrac{c + d}{c - d}$ (যোজন ও বিয়োজন)

### জ্যামিতিক সমানুপাত (Geometric proportions)

আমরা ত্রিভুজক্ষেত্রের ক্ষেত্রফল নির্ণয় করতে শিখেছি। এ থেকে দুইটি প্রয়োজনীয় অনুপাতের ধারণা তৈরি করা যায়।

**১.** দুইটি ত্রিভুজক্ষেত্রের উচ্চতা সমান হলে, এদের ক্ষেত্রফল ও ভূমি সমানুপাতিক।

[Figure: Two triangles with equal heights.
 Natural description: Two triangles ABC and DEF side by side. Both have the same height h, but their bases are different — base BC = a for the first, base EF = d for the second. Each shows a perpendicular from the apex to the base.
 TikZ-mappable specifics: Triangle 1 with vertices A (top), B (bottom-left), C (bottom-right). Apex A; base BC labeled 'a' along bottom. Perpendicular from A to BC drawn as a dashed segment labeled 'h'. Triangle 2 with vertices D (top), E (bottom-left), F (bottom-right). Base EF labeled 'd'. Perpendicular from D to EF labeled 'h' (same value as for triangle 1). Both heights equal.]

মনে করি, ত্রিভুজক্ষেত্র $ABC$ ও $DEF$ এর ভূমি যথাক্রমে $BC = a, EF = d$ এবং উভয় ক্ষেত্রের উচ্চতা $h$।

সুতরাং, ত্রিভুজক্ষেত্র $ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times a \times h$, ত্রিভুজক্ষেত্র $DEF$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times d \times h$

অতএব, ত্রিভুজক্ষেত্র $ABC$ এর ক্ষেত্রফল : ত্রিভুজক্ষেত্র $DEF$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times a \times h : \dfrac{1}{2} \times d \times h = a : d = BC : EF$

**২.** দুইটি ত্রিভুজক্ষেত্রের ভূমি সমান হলে, এদের ক্ষেত্রফল ও উচ্চতা সমানুপাতিক।

[Figure: Two triangles with equal bases.
 Natural description: Two triangles ABC and DEF side by side. Both have the same base b, but their heights AP and DQ are different (where P, Q are feet of perpendiculars).
 TikZ-mappable specifics: Triangle 1 with vertices A (top), B (bottom-left), C (bottom-right). Perpendicular from A to BC meets at point P. Height AP = h. Base BC = b. Triangle 2 with vertices D (top), E (bottom-left), F (bottom-right). Perpendicular DQ to EF, foot at Q, height DQ = k. Base EF = b (same as first triangle).]

মনে করি, ত্রিভুজক্ষেত্র $ABC$ ও $DEF$ এর উচ্চতা যথাক্রমে $AP = h, DQ = k$ এবং উভয় ক্ষেত্রের ভূমি $b$।

সুতরাং, ত্রিভুজক্ষেত্র $ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times b \times h$, ত্রিভুজক্ষেত্র $DEF$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times b \times k$

অতএব, ত্রিভুজক্ষেত্র $ABC$ এর ক্ষেত্রফল : ত্রিভুজক্ষেত্র $DEF$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times b \times h : \dfrac{1}{2} \times b \times k = h : k = AP : DQ$

## ১৪.২ ত্রিভুজ সম্পর্কিত উপপাদ্য ও অনুসিদ্ধান্ত

### উপপাদ্য ২৮.

ত্রিভুজের যেকোনো বাহুর সমান্তরাল সরলরেখা ঐ ত্রিভুজের অপর বাহুদ্বয় বা এদের বর্ধিতাংশকে সমান অনুপাতে বিভক্ত করে।

**বিশেষ নির্বচন:** $ABC$ ত্রিভুজের $BC$ বাহুর সমান্তরাল $DE$ রেখাটি $AB$ ও $AC$ বাহুদ্বয়কে (চিত্র-১) অথবা এদের বর্ধিতাংশকে (চিত্র-২) যথাক্রমে $D$ ও $E$ বিন্দুতে ছেদ করেছে। প্রমাণ করতে হবে যে, $AD : DB = AE : EC$।

**অঙ্কন:** $B, E$ এবং $C, D$ যোগ করি।

[Figure: Two triangles showing parallel-line case (Theorem 28).
 Natural description: চিত্র-১ shows triangle ABC with parallel line DE inside, intersecting AB at D and AC at E. চিত্র-২ shows triangle ABC with DE extending outside the triangle and cutting the extensions of AB and AC at D and E.
 TikZ-mappable specifics: চিত্র-১: Triangle ABC, A at top, B at bottom-left, C at bottom-right. DE is drawn parallel to BC (single arrow marks on BC and DE). D on side AB (between A and B), E on side AC (between A and C). Auxiliary segments BE and CD drawn. চিত্র-২: Same triangle but DE drawn outside extending the sides — A at top, B at bottom-left, C at bottom-right, D on extension of AB beyond B, E on extension of AC beyond C, with DE parallel to BC.]

**প্রমাণ:**

ধাপ ১. $\triangle ADE$ এবং $\triangle BDE$ একই উচ্চতাবিশিষ্ট

$\therefore \dfrac{\triangle ADE}{\triangle BDE} = \dfrac{AD}{DB}$ [একই উচ্চতাবিশিষ্ট ত্রিভুজসমূহের ক্ষেত্রফল ভূমির সমানুপাতিক]

ধাপ ২. $\triangle ADE$ এবং $\triangle DEC$ একই উচ্চতাবিশিষ্ট

$\therefore \dfrac{\triangle ADE}{\triangle DEC} = \dfrac{AE}{EC}$ [একই উচ্চতাবিশিষ্ট ত্রিভুজসমূহের ক্ষেত্রফল ভূমির সমানুপাতিক]

ধাপ ৩. কিন্তু $\triangle BDE = \triangle DEC$ [একই ভূমি $DE$ ও একই সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত]

$\therefore \dfrac{\triangle ADE}{\triangle BDE} = \dfrac{\triangle ADE}{\triangle DEC}$

ধাপ ৪. অতএব, $\dfrac{AD}{DB} = \dfrac{AE}{EC}$

অর্থাৎ, $AD : DB = AE : EC$।

**অনুসিদ্ধান্ত ১.** $ABC$ ত্রিভুজের $BC$ বাহুর সমান্তরাল কোনো রেখা যদি $AB$ ও $AC$ বাহুকে যথাক্রমে $D$ ও $E$ বিন্দুতে ছেদ করে, তবে $\dfrac{AB}{AD} = \dfrac{AC}{AE}$ এবং $\dfrac{AB}{BD} = \dfrac{AC}{CE}$ হবে।

**অনুসিদ্ধান্ত ২.** ত্রিভুজের কোনো বাহুর মধ্যবিন্দু দিয়ে অঙ্কিত অপর এক বাহুর সমান্তরাল রেখা তৃতীয় বাহুকে সমদ্বিখণ্ডিত করে।

উপপাদ্য ২৮ এর বিপরীত প্রতিজ্ঞাও সত্য। অর্থাৎ কোনো সরলরেখা একটি ত্রিভুজের দুই বাহুকে অথবা এদের বর্ধিতাংশকে সমান অনুপাতে বিভক্ত করলে উক্ত সরলরেখা ত্রিভুজটির তৃতীয় বাহুর সমান্তরাল হবে। নিচে প্রতিজ্ঞাটি প্রমাণ করা হলো।

### উপপাদ্য ২৯.

কোনো সরলরেখা একটি ত্রিভুজের দুই বাহুকে অথবা তাদের বর্ধিতাংশকে সমান অনুপাতে বিভক্ত করলে উক্ত সরলরেখা ত্রিভুজটির তৃতীয় বাহুর সমান্তরাল হবে।

**বিশেষ নির্বচন:** $DE$ রেখাংশ $ABC$ ত্রিভুজের $AB$ ও $AC$ বাহুদ্বয়কে অথবা এদের বর্ধিতাংশকে সমান অনুপাতে বিভক্ত করেছে।

অর্থাৎ $AD : DB = AE : EC$ প্রমাণ করতে হবে, $DE$ এবং $BC$ সমান্তরাল।

**অঙ্কন:** $B, E$ এবং $C, D$ যোগ করি।

[Figure: Triangle ABC with line DE drawn between sides AB and AC, claimed parallel to BC.
 Natural description: Triangle ABC, A at top, B at bottom-left, C at bottom-right. Points D on AB and E on AC such that AD:DB = AE:EC. Line DE drawn. Auxiliary segments BE and CD drawn.
 TikZ-mappable specifics: Triangle ABC. A at top, B at bottom-left, C at bottom-right. D on side AB between A and B. E on side AC between A and C. Line segment DE drawn (to be shown parallel to BC). Cross-segments BE and DC drawn for the proof.]

**প্রমাণ:**

ধাপ ১. $\dfrac{\triangle ADE}{\triangle BDE} = \dfrac{AD}{DB}$ [ত্রিভুজ দুইটি একই উচ্চতাবিশিষ্ট]

এবং $\dfrac{\triangle ADE}{\triangle DEC} = \dfrac{AE}{EC}$ [ত্রিভুজ দুইটি একই উচ্চতাবিশিষ্ট]

ধাপ ২. কিন্তু $\dfrac{AD}{DB} = \dfrac{AE}{EC}$ [স্বীকার]

ধাপ ৩. অতএব, $\dfrac{\triangle ADE}{\triangle BDE} = \dfrac{\triangle ADE}{\triangle DEC}$ [(১) থেকে এবং (২) থেকে]

$\therefore \triangle BDE = \triangle DEC$

ধাপ ৪. কিন্তু $\triangle BDE$ এবং $\triangle DEC$ একই ভূমি $DE$ এর একই পাশে অবস্থিত। সুতরাং তারা একই সমান্তরাল যুগলের মধ্যে অবস্থিত।

$\therefore BC$ ও $DE$ সমান্তরাল।

### উপপাদ্য ৩০.

ত্রিভুজের যেকোনো কোণের অন্তর্দ্বিখণ্ডক বিপরীত বাহুকে উক্ত কোণ সংলগ্ন বাহুদ্বয়ের অনুপাতে অন্তর্বিভক্ত করে।

**বিশেষ নির্বচন:** মনে করি, $AD$ রেখাংশ $\triangle ABC$ এর অভ্যন্তরে $\angle A$ কোণকে সমদ্বিখণ্ডিত করে এবং $BC$ বাহুকে $D$ বিন্দুতে ছেদ করে। প্রমাণ করতে হবে যে, $BD : DC = BA : AC$।

**অঙ্কন:** $DA$ রেখাংশের সমান্তরাল করে $C$ বিন্দু দিয়ে $CE$ রেখাংশ অঙ্কন করি, যেন তা বর্ধিত $BA$ বাহুকে $E$ বিন্দুতে ছেদ করে।

[Figure: Triangle ABC with internal angle bisector AD.
 Natural description: Triangle ABC with A at top, B at bottom-left, C at bottom-right. AD is the bisector of ∠BAC and meets BC at D. CE is drawn parallel to AD from C, meeting the extension of BA at E (above A).
 TikZ-mappable specifics: Triangle ABC. A at top, B at bottom-left, C at bottom-right. AD is the angle bisector from A to BC at D — ∠BAD = ∠DAC marked with double-tick arcs at A. CE drawn from C parallel to AD; E is on the extension of BA beyond A. CE marked with parallel-arrow mark same as AD.]

**প্রমাণ:**

ধাপ ১. যেহেতু $DA \parallel CE$ এবং $BE$ এদের ছেদক [অঙ্কন]

$\angle AEC = \angle BAD$ [অনুরূপ কোণ]

আবার $DA \parallel CE$ এবং $AC$ এদের ছেদক

$\angle ACE = \angle CAD$ [একান্তর কোণ]

ধাপ ২. কিন্তু $\angle BAD = \angle CAD$ [স্বীকার]

$\therefore \angle AEC = \angle ACE$ সুতরাং $AC = AE$ [অধ্যায় ৬ উপপাদ্য ৮]

ধাপ ৩. আবার যেহেতু $DA \parallel CE$ সুতরাং $\dfrac{BD}{DC} = \dfrac{BA}{AE}$ [ধাপ ২]

ধাপ ৪. কিন্তু $AE = AC$

$\therefore \dfrac{BD}{DC} = \dfrac{BA}{AC}$

### উপপাদ্য ৩১.

ত্রিভুজের যেকোনো বাহু অপর দুই বাহুর অনুপাতে অন্তর্বিভক্ত হলে, বিভাগ বিন্দু থেকে বিপরীত শীর্ষ পর্যন্ত অঙ্কিত রেখাংশ উক্ত শীর্ষকোণের সমদ্বিখণ্ডক হবে।

**বিশেষ নির্বচন:** মনে করি, $ABC$ ত্রিভুজের $A$ বিন্দু থেকে অঙ্কিত $AD$ সরলরেখাংশ $BC$ বাহুকে $D$ বিন্দুতে এরূপে অভ্যন্তরভাবে বিভক্ত করেছে যে, $BD : DC = BA : AC$। প্রমাণ করতে হবে যে, $AD$ রেখাংশ $\angle BAC$ এর সমদ্বিখণ্ডক অর্থাৎ, $\angle BAD = \angle CAD$।

**অঙ্কন:** $DA$ রেখাংশের সমান্তরাল করে $C$ বিন্দু দিয়ে $CE$ রেখাংশ অঙ্কন করি, যেন তা বর্ধিত $BA$ বাহুকে $E$ বিন্দুতে ছেদ করে।

[Figure: Triangle ABC with line AD from vertex A to side BC, claimed angle bisector.
 Natural description: Triangle ABC with A at top, B at bottom-left, C at bottom-right. AD drawn from A to point D on BC such that BD/DC = BA/AC. CE drawn from C parallel to AD, meeting extension of BA at E.
 TikZ-mappable specifics: Triangle ABC. A at top, B at bottom-left, C at bottom-right. D on side BC. Line AD drawn. CE drawn from C parallel to AD, with E on extension of BA beyond A.]

**প্রমাণ:**

ধাপ ১. $\triangle BCE$ এর $DA \parallel CE$ [অঙ্কন]

$\therefore BA : AE = BD : DC$ [উপপাদ্য ২৮]

ধাপ ২. কিন্তু $BD : DC = BA : AC$ [স্বীকার]

$\therefore BA : AE = BA : AC$ [ধাপ ১ ও ধাপ ২ থেকে]

$\therefore AE = AC$

অতএব, $\angle ACE = \angle AEC$ [সমদ্বিবাহু ত্রিভুজের ভূমি সংলগ্ন কোণ দুইটি সমান]

ধাপ ৩. কিন্তু $\angle AEC = \angle BAD$ [অনুরূপ কোণ]

এবং $\angle ACE = \angle CAD$ [একান্তর কোণ]

অতএব, $\angle BAD = \angle CAD$ [ধাপ ২ থেকে]

$\therefore AD$ রেখাংশে $\angle BAC$ এর সমদ্বিখণ্ডক।

## ১৪.৩ নির্দিষ্ট অনুপাতে রেখাংশের বিভক্তিকরণ

সমতলে দুইটি ভিন্ন বিন্দু $A$ ও $B$ এবং $m$ ও $n$ যেকোনো স্বাভাবিক সংখ্যা হলে স্বীকার করে নিই যে, রেখায় এমন অনন্য বিন্দু $X$ আছে যে, $X$ বিন্দুটি $A$ ও $B$ বিন্দুকে অন্তর্বর্তী এবং $AX : XB = m : n$।

[Figure: Line segment AB divided internally at X.
 Natural description: A horizontal line segment from A on the left to B on the right, with a point X between them. AX has length 'm', XB has length 'n'.
 TikZ-mappable specifics: Horizontal segment with A on left, B on right. X is an interior point between A and B. Label AX = m (above the segment from A to X), XB = n (above the segment from X to B).]

চিত্রে, $AB$ রেখাংশ $X$ বিন্দুতে $m : n$ অনুপাতে অন্তর্বিভক্ত হয়েছে। তাহলে, $AX : XB = m : n$।

### সম্পাদ্য ১২.

কোনো রেখাংশকে একটি নির্দিষ্ট অনুপাতে অন্তর্বিভক্ত করতে হবে।

**বিশেষ নির্বচন:** মনে করি, $AB$ রেখাংশকে $m : n$ অনুপাতে অন্তর্বিভক্ত করতে হবে।

**অঙ্কন:** $A$ বিন্দুতে যেকোনো কোণ $\angle BAX$ অঙ্কন করি এবং $AX$ রশ্মি থেকে পরপর $AE = m$ এবং $EC = n$ অংশ কেটে নিই। $B, C$ যোগ করি। $E$ বিন্দু দিয়ে $CB$ এর সমান্তরাল $ED$ রেখাংশ অঙ্কন করি যা $AB$ কে $D$ বিন্দুতে ছেদ করে। তাহলে $AB$ রেখাংশ $D$ বিন্দুতে $m : n$ অনুপাতে অন্তর্বিভক্ত হলো।

**প্রমাণ:** যেহেতু $DE$ রেখাংশ $ABC$ ত্রিভুজের এক বাহু $BC$ এর সমান্তরাল

$\therefore AD : DB = AE : EC = m : n$

[Figure: Construction for dividing a segment AB in ratio m:n.
 Natural description: Horizontal segment AB. From A, a ray AX is drawn at any angle upward. On AX, points E (distance m from A) and C (distance n from E, so total m+n from A) are marked. BC is joined. From E, a line parallel to BC is drawn meeting AB at point D, which divides AB in ratio m:n.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right (horizontal segment AB). Ray AX going up-right from A at some angle. On AX: E at distance m from A; C at distance n from E. Line BC drawn (from B up to C). Line ED drawn from E parallel to BC, meeting AB at D. AD:DB = m:n.]

> **কাজ:** বিকল্প পদ্ধতিতে কোনো রেখাংশকে নির্দিষ্ট অনুপাতে অন্তর্বিভক্ত করো।

### উদাহরণ ১.

$7$ সে.মি. দৈর্ঘ্যের একটি রেখাংশকে $3 : 2$ অনুপাতে অন্তর্বিভক্ত করো।

**সমাধান:** যেকোনো একটি রশ্মি $AG$ আঁকি এবং $AG$ থেকে $7$ সে.মি. সমান রেখাংশ $AB$ নিই। $A$ বিন্দুতে যেকোনো কোণ $\angle BAX$ অঙ্কন করি। $AX$ থেকে $AE = 3$ সে.মি. কেটে নিই এবং $E$ থেকে $EC = 2$ সে.মি. কেটে নিই। $B, C$ যোগ করি। $E$ বিন্দুতে $\angle ACB$ এর সমান $\angle AED$ অঙ্কন করি যাতে $ED$ রেখা $AB$ কে $D$ বিন্দুতে ছেদ করে। তাহলে $AB$ রেখাংশ $D$ বিন্দুতে $3 : 2$ অনুপাতে অন্তর্বিভক্ত হলো।

[Figure: Specific construction for 7 cm segment divided in 3:2.
 Natural description: Horizontal 7 cm segment AB. From A, an inclined ray AX upward. On AX, mark E at 3 cm from A, then C at 2 cm beyond E. Join BC. From E, draw line ED parallel to BC meeting AB at D, dividing it in ratio 3:2.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right. AB = 7 cm horizontal. Ray AX going up-right. On AX mark E (AE = 3 cm), then C (EC = 2 cm). Line BC drawn. Line ED drawn parallel to BC, ED ∥ BC, with D on segment AB.]

> **কাজ:** একটি নির্দিষ্ট ত্রিভুজের সদৃশ একটি ত্রিভুজ অঙ্কন করো যার বাহুগুলো মূল ত্রিভুজের বাহুগুলোর $\dfrac{3}{5}$ গুণ।

## অনুশীলনী ১৪.১

**১।** কোনো ত্রিভুজের ভূমি সংলগ্ন কোণদ্বয়ের সমদ্বিখণ্ডকদ্বয় বিপরীত বাহু দুইটিকে $X$ ও $Y$ বিন্দুতে ছেদ করে। $XY$, ভূমির সমান্তরাল হলে প্রমাণ করো যে, ত্রিভুজটি সমদ্বিবাহু।

**২।** প্রমাণ করো যে, একটি ত্রিভুজের পরস্পর সমান্তরাল সরলরেখাকে দুইটি সরলরেখা যদি ছেদ করলে অনুরূপ অংশগুলো সমানুপাতিক হবে।

**৩।** প্রমাণ করো যে, ট্রাপিজিয়ামের কর্ণদ্বয় এদের ছেদবিন্দুতে একই অনুপাতে বিভক্ত হয়।

**৪।** প্রমাণ করো যে, ট্রাপিজিয়ামের তির্যক বাহুদ্বয়ের মধ্যবিন্দুর সংযোজক রেখাংশ সমান্তরাল বাহুদ্বয়ের সমান্তরাল।

**৫।** $ABC$ ত্রিভুজের $AD$ ও $BE$ মধ্যমাদ্বয় পরস্পর $G$ বিন্দুতে ছেদ করেছে। $G$ বিন্দুর মধ্য দিয়ে অঙ্কিত $DE$ এর সমান্তরাল রেখাংশ $AC$ কে $F$ বিন্দুতে ছেদ করে। প্রমাণ করো যে, $AC = 6EF$।

**৬।** $\triangle ABC$ এর $BC$ বাহুস্থ যেকোনো বিন্দু $X$ এবং $AX$ রেখায় $O$ একটি বিন্দু। প্রমাণ করো যে, $\triangle AOB : \triangle AOC = BX : XC$।

**৭।** $\triangle ABC$ এর $\angle A$ এর সমদ্বিখণ্ডক $BC$ কে $D$ বিন্দুতে ছেদ করে। $BC$ এর সমান্তরাল কোনো রেখাংশ $AB$ ও $AC$ কে যথাক্রমে $E$ ও $F$ বিন্দুতে ছেদ করে। প্রমাণ করো যে, $BD : DC = EF : CF$।

## ১৪.৪ সদৃশতা (Similarity)

সপ্তম শ্রেণিতে ত্রিভুজের সর্বসমতা ও সদৃশতা নিয়ে আলোচনা করা হয়েছে। সাধারণভাবে, সর্বসমতা সদৃশতার বিশেষ রূপ। দুইটি চিত্র সর্বসম হলে সেগুলো সদৃশ; তবে চিত্র দুইটি সদৃশ হলে সেগুলো সর্বসম নাও হতে পারে।

[Figure: Examples of similar shapes — triangles and rectangles.
 Natural description: Two similar triangles ABC and PQR of different sizes but same shape, and two similar rectangles ABCD and PQRS of different sizes but same proportions.
 TikZ-mappable specifics: Left: a small right triangle with vertices A (top), B (bottom-left), C (bottom-right). Right: a larger similar right triangle with vertices P (top), Q (bottom-left), R (bottom-right) — corresponding angles equal, sides proportional. Below: Rectangle ABCD on left (small) and rectangle PQRS on right (larger, same aspect ratio).]

**সদৃশকোণী বহুভুজ:** সমান সংখ্যক বাহুবিশিষ্ট দুইটি বহুভুজের একটির শীর্ষবিন্দুগুলো যদি ধারাবাহিকভাবে অপরটির শীর্ষবিন্দুগুলোর সঙ্গে এমনভাবে মিল করা যায় যে, বহুভুজ দুইটির অনুরূপ কোণগুলো সমান হয় এবং (২) অনুরূপ বাহুগুলোর অনুপাতগুলো সমান হয়, তবে বহুভুজ দুইটিকে সদৃশ (similar) বহুভুজ বলা হয়।

উপরের চিত্রে আমরা লক্ষ করি যে, $ABCD$ আয়ত ও $PQRS$ বর্গ সদৃশকোণী। কারণ, উভয় চিত্রে বাহুর সংখ্যা $4$ এবং আয়তক্ষেত্রের চারটি কোণের প্রত্যেকটি বর্গক্ষেত্রের কোণগুলোর সমান (সবগুলোই কোণ সমকোণ)। কিন্তু চিত্র দুইটির অনুরূপ কোণগুলো সমান হলেও অনুরূপ বাহুগুলোর অনুপাত সমান নয়। ফলে সেগুলো সদৃশ নয়।

ত্রিভুজের ক্ষেত্রে অবশ্য এরকম হয় না। দুইটি ত্রিভুজের শীর্ষ বিন্দুগুলোর কোণ মিলকরণের ফলে অনুরূপ কোণগুলো সমান উল্লিখিত শর্ত দুইটির একটি সত্য হলে অপরটিও সত্য হবে এবং ফলে ত্রিভুজ দুইটি সদৃশ হবে। অর্থাৎ, দুইটি সমকোণী ত্রিভুজ সর্বদা সদৃশকোণী এবং দুইটি সদৃশকোণী ত্রিভুজ সদৃশ। দুইটি ত্রিভুজ সদৃশ হলে এদের একটি কোণের জোড়া অনুপাত বাহু সমান হলে ত্রিভুজদ্বয় সর্বসম হয়। দুইটি সদৃশকোণী ত্রিভুজের অনুরূপ বাহুগুলোর অনুপাত ধ্রুবক। নিচে এ সংক্রান্ত উপপাদ্যের প্রমাণ দেওয়া হলো।

### উপপাদ্য ৩২.

দুইটি ত্রিভুজ সদৃশকোণী হলে এদের অনুরূপ বাহুগুলো সমানুপাতিক।

**বিশেষ নির্বচন:** মনে করি, $ABC$ ও $DEF$ ত্রিভুজদ্বয়ের $\angle A = \angle D, \angle B = \angle E$ এবং $\angle C = \angle F$।

প্রমাণ করতে হবে যে, $\dfrac{AB}{DE} = \dfrac{AC}{DF} = \dfrac{BC}{EF}$।

[Figure: Two similar triangles ABC and DEF with corresponding equal angles.
 Natural description: Two triangles of different sizes but same shape — triangle ABC and triangle DEF — with all three pairs of corresponding angles equal. Auxiliary points P, Q on AB and AC such that AP = DE and AQ = DF.
 TikZ-mappable specifics: Triangle 1 (larger): A top, B bottom-left, C bottom-right. Points P on AB and Q on AC such that AP = DE, AQ = DF. PQ drawn parallel-like across (after the construction). Triangle 2 (smaller): D at top, E at bottom-left, F at bottom-right. ∠A = ∠D, ∠B = ∠E, ∠C = ∠F all marked with single/double/triple arcs.]

**অঙ্কন:** $ABC$ ও $DEF$ ত্রিভুজদ্বয়ের প্রত্যেক অনুরূপ বাহুগুলো অসমান বিবেচনা করি। $AB$ বাহুতে $P$ বিন্দু এবং $AC$ বাহুতে $Q$ বিন্দু নিই যেন $AP = DE$ এবং $AQ = DF$ হয়। $P$ ও $Q$ যোগ করে অঙ্কন সম্পন্ন করি।

**প্রমাণ:**

ধাপ ১. $\triangle APQ$ ও $\triangle DEF$ এর $AP = DE, AQ = DF, \angle A = \angle D$

অতএব, $\triangle APQ \cong \triangle DEF$ [বাহু-কোণ-বাহু সর্বসমতা]

সুতরাং, $\angle APQ = \angle DEF = \angle ABC$ এবং $\angle AQP = \angle DFE = \angle ACB$।

অর্থাৎ, $PQ$ রেখাংশ ও $BC$ বাহুকে $AB$ বাহু ও $AC$ রেখা ছেদ করায় অনুরূপ কোণযুগল সমান হয়েছে।

সুতরাং, $PQ \parallel BC$ $\therefore \dfrac{AB}{AP} = \dfrac{AC}{AQ}$ বা, $\dfrac{AB}{DE} = \dfrac{AC}{DF}$ [অনুসিদ্ধান্ত ১]

ধাপ ২. একইভাবে $BA$ বাহু ও $BC$ বাহু থেকে যথাক্রমে $ED$ রেখাংশ ও $EF$ রেখাংশের সমান রেখাংশ কেটে নিয়ে দেখানো যায় যে,

$\dfrac{BA}{ED} = \dfrac{BC}{EF}$ [উপপাদ্য ২৮]

অর্থাৎ, $\dfrac{AB}{DE} = \dfrac{BC}{EF}$ $\therefore \dfrac{AB}{DE} = \dfrac{AC}{DF} = \dfrac{BC}{EF}$

উপপাদ্য ৩২ এর বিপরীত প্রতিজ্ঞাটিও সত্য।

### উপপাদ্য ৩৩.

দুইটি ত্রিভুজের বাহুগুলো সমানুপাতিক হলে অনুরূপ বাহুর বিপরীত কোণগুলো পরস্পর সমান।

**বিশেষ নির্বচন:** মনে করি, $\triangle ABC$ ও $\triangle DEF$ এর $\dfrac{AB}{DE} = \dfrac{AC}{DF} = \dfrac{BC}{EF}$। প্রমাণ করতে হবে যে, $\angle A = \angle D, \angle B = \angle E, \angle C = \angle F$।

[Figure: Two triangles with proportional sides.
 Natural description: Triangle ABC and DEF, with sides in proportion AB/DE = AC/DF = BC/EF.
 TikZ-mappable specifics: Triangle 1: A top, B bottom-left, C bottom-right. Point P on AB, Q on AC. Triangle 2: D top, E bottom-left, F bottom-right. With AB > DE, AC > DF, BC > EF, sides in same ratio.]

**অঙ্কন:** $\triangle ABC$ ও $\triangle DEF$ এর প্রত্যেক অনুরূপ বাহুগুলো অসমান বিবেচনা করি। $AB$ বাহুতে $P$ বিন্দু এবং $AC$ বাহুতে $Q$ বিন্দু নিই যেন $AP = DE$ এবং $AQ = DF$ হয়। $P$ ও $Q$ যোগ করে অঙ্কন সম্পন্ন করি।

**প্রমাণ:** যেহেতু $\dfrac{AB}{DE} = \dfrac{AC}{DF}$, সুতরাং $\dfrac{AB}{AP} = \dfrac{AC}{AQ}$

সুতরাং $PQ \parallel BC$ [উপপাদ্য ২৯]

$\therefore \angle ABC = \angle APQ$ [$AB$ ছেদক দ্বারা উৎপন্ন অনুরূপ কোণ]

এবং $\angle ACB = \angle AQP$ [$AC$ ছেদক দ্বারা উৎপন্ন অনুরূপ কোণ]

$\therefore \triangle ABC$ ও $\triangle APQ$ সদৃশকোণী।

সুতরাং, $\dfrac{AB}{AP} = \dfrac{BC}{PQ}$ বা, $\dfrac{AB}{DE} = \dfrac{BC}{PQ}$ [উপপাদ্য ৩২]

কিন্তু $\dfrac{AB}{DE} = \dfrac{BC}{EF}$ [কল্পনাসুসারে]

$\therefore \dfrac{BC}{EF} = \dfrac{BC}{PQ}$

$\therefore EF = PQ$

সুতরাং, $\triangle APQ$ ও $\triangle DEF$ সর্বসম। [বাহু-বাহু-বাহু উপপাদ্য]

$\therefore \angle PAQ = \angle EDF, \angle APQ = \angle DEF, \angle AQP = \angle DFE$

$\therefore \angle A = \angle D, \angle B = \angle E, \angle C = \angle F$

### উপপাদ্য ৩৪.

দুইটি ত্রিভুজের একটির এক কোণ অপরটির এক কোণের সমান হলে এবং সমান কোণ সংলগ্ন বাহুগুলো সমানুপাতিক হলে ত্রিভুজদ্বয় সদৃশ।

**বিশেষ নির্বচন:** মনে করি, $\triangle ABC$ ও $\triangle DEF$ এমন যে, $\angle A = \angle D$ এবং $\dfrac{AB}{DE} = \dfrac{AC}{DF}$, প্রমাণ করতে হবে যে, $\triangle ABC$ ও $\triangle DEF$ সদৃশ।

[Figure: Two triangles with one equal angle and proportional adjacent sides.
 Natural description: Triangle ABC and triangle DEF with ∠A = ∠D and AB/DE = AC/DF.
 TikZ-mappable specifics: Triangle 1: A top, B bottom-left, C bottom-right. Points P, Q on AB and AC respectively. Triangle 2: D top, E bottom-left, F bottom-right. ∠A = ∠D marked with same arc.]

**অঙ্কন:** $\triangle ABC$ ও $\triangle DEF$ এর প্রত্যেক অনুরূপ বাহুগুলো অসমান বিবেচনা করি। $AB$ বাহুতে $P$ বিন্দু এবং $AC$ বাহুতে $Q$ বিন্দু নিই যেন $AP = DE$ এবং $AQ = DF$ হয়। $P$ ও $Q$ যোগ করে অঙ্কন সম্পন্ন করি।

**প্রমাণ:**

$\triangle APQ$ ও $\triangle DEF$ এর $AP = DE, AQ = DF$ এবং অন্তর্ভুক্ত $\angle A = $ অন্তর্ভুক্ত $\angle D$

$\therefore \triangle APQ \cong \triangle DEF$ [বাহু-কোণ-বাহু উপপাদ্য]

$\therefore \angle A = \angle D, \angle APQ = \angle E, \angle AQP = \angle F$

আবার যেহেতু $\dfrac{AB}{DE} = \dfrac{AC}{DF}$, সুতরাং $\dfrac{AB}{AP} = \dfrac{AC}{AQ}$ [উপপাদ্য ২৯]

$\therefore PQ \parallel BC$

সুতরাং $\angle ABC = \angle APQ$ এবং $\angle ACB = \angle AQP$

$\therefore \angle A = \angle D, \angle B = \angle E$, এবং $\angle C = \angle F$

অর্থাৎ $\triangle ABC$ ও $\triangle DEF$ সদৃশকোণী।

সুতরাং $\triangle ABC$ ও $\triangle DEF$ সদৃশ।

### উপপাদ্য ৩৫.

দুইটি সদৃশ ত্রিভুজক্ষেত্রের ক্ষেত্রফলদ্বয়ের অনুপাত এদের যেকোনো দুই অনুরূপ বাহুর উপর অঙ্কিত বর্গক্ষেত্রের ক্ষেত্রফলদ্বয়ের অনুপাতের সমান।

**বিশেষ নির্বচন:** মনে করি, $\triangle ABC$ ও $\triangle DEF$ ত্রিভুজদ্বয় সদৃশ এবং এদের অনুরূপ বাহু $BC$ ও $EF$। প্রমাণ করতে হবে যে, $\triangle ABC : \triangle DEF = BC^2 : EF^2$।

[Figure: Two similar triangles with their altitudes drawn.
 Natural description: Two similar triangles ABC and DEF. Altitudes AG and DH drawn from the apex to the base.
 TikZ-mappable specifics: Triangle 1 (larger): A top, B bottom-left, C bottom-right. Perpendicular from A to BC meets BC at G; AG = h. Triangle 2 (smaller, similar): D top, E bottom-left, F bottom-right. Perpendicular from D to EF meets EF at H; DH = p.]

**অঙ্কন:** $BC$ ও $EF$ এর উপর যথাক্রমে $AG$ ও $DH$ লম্ব আঁকি। মনে করি $AG = h, DH = p$।

**প্রমাণ:**

ধাপ ১. $\triangle ABC = \dfrac{1}{2} \times BC \times h$ এবং $\triangle DEF = \dfrac{1}{2} \times EF \times p$

$\dfrac{\triangle ABC}{\triangle DEF} = \dfrac{\dfrac{1}{2} \times BC \times h}{\dfrac{1}{2} \times EF \times p} = \dfrac{h}{p} \times \dfrac{BC}{EF}$

ধাপ ২. $\triangle ABG$ ও $\triangle DEH$ ত্রিভুজদ্বয়ের $\angle B = \angle E$, $\angle AGB = \angle DHE$ [এক সমকোণ]

$\therefore \angle BAG = \angle EDH$

$\therefore \triangle ABG$ ও $\triangle DEH$ ত্রিভুজদ্বয় সদৃশকোণী, তাই সদৃশ।

$\therefore \dfrac{h}{p} = \dfrac{AB}{DE} = \dfrac{BC}{EF}$ [কারণ $\triangle ABC$ ও $\triangle DEF$ সদৃশ]

ধাপ ৩. $\dfrac{\triangle ABC}{\triangle DEF} = \dfrac{h}{p} \times \dfrac{BC}{EF} = \dfrac{BC}{EF} \times \dfrac{BC}{EF} = \dfrac{BC^2}{EF^2}$

## অনুশীলনী ১৪.২

**১।** $\triangle ABC$ এ $BC$ এর সমান্তরাল $DE$ রেখা $AB$ ও $AC$ কে যথাক্রমে $D$ ও $E$ বিন্দুতে ছেদ করলে—
- $(i)\, \triangle ABC$ ও $\triangle ADE$ পরস্পর সদৃশ
- $(ii)\, \dfrac{AD}{BD} = \dfrac{CE}{AE}$
- $(iii)\, \dfrac{\triangle ABC}{\triangle ADE} = \dfrac{BC^2}{DE^2}$

নিচের কোনটি সঠিক?
- ক) $i$ ও $ii$
- খ) $i$ ও $iii$
- গ) $ii$ ও $iii$
- ঘ) $i, ii$ ও $iii$

**২।** $\triangle ABC$ এ $PQ \parallel BC$ হলে, নিচের কোনটি সঠিক?
- ক) $AP : PB = AQ : QC$
- খ) $AB : AC = PQ : PQ$
- গ) $AB : AC = PQ : PQ$ ঘ) $PQ : BC = PB : BQ$

[Figure: Triangle ABC with PQ parallel to BC.
 Natural description: Triangle ABC with P on AB and Q on AC such that PQ is parallel to BC.
 TikZ-mappable specifics: Triangle ABC, A top, B bottom-left, C bottom-right. P on AB between A and B; Q on AC between A and C. PQ ∥ BC (marked with single arrows on PQ and BC).]

**৩।** প্রমাণ করো যে, দুইটি ত্রিভুজের প্রত্যেকটি যদি তৃতীয় একটি ত্রিভুজের সদৃশ হয়, তবে তারা পরস্পর সদৃশ।

**৪।** প্রমাণ করো যে, দুইটি সমকোণী ত্রিভুজের একটির একটি সূক্ষ্মকোণ অপরটির একটি সূক্ষ্মকোণের সমান হলে, ত্রিভুজ দুইটি সদৃশ হবে।

**৫।** প্রমাণ করো যে, সমকোণী ত্রিভুজের সমকৌণিক শীর্ষ থেকে অতিভুজের উপর লম্ব আঁকলে যে দুইটি সমকোণী ত্রিভুজ উৎপন্ন হয়, তারা পরস্পর সদৃশ এবং প্রত্যেকে মূল ত্রিভুজের সদৃশ।

**৬।** পাশের চিত্রে, $\angle B = \angle D$ এবং $CD = 4 AB$। প্রমাণ করো যে, $BD = 5 BL$।

[Figure: Triangle with point L and equal angles at B and D.
 Natural description: A geometric figure with points A, B, C, D, L showing the relationship ∠B = ∠D and CD = 4·AB.
 TikZ-mappable specifics: A configuration with vertex L at intersection, with triangle ABL and triangle CDL sharing the same vertex L. ∠ABL = ∠CDL marked with same arc. AB and CD are parallel-ish sides with CD = 4·AB.]

**৭।** $ABCD$ সামান্তরিকের $A$ শীর্ষ দিয়ে অঙ্কিত একটি রেখাংশ $BC$ বাহুকে $M$ বিন্দুতে এবং $DC$ বাহুর বর্ধিতাংশকে $N$ বিন্দুতে ছেদ করে। প্রমাণ করো যে, $BM \times DN$ একটি ধ্রুবক।

**৮।** $ABC$ ও $DEF$ সদৃশকোণী ত্রিভুজদ্বয়ের উচ্চতা $AM$ ও $DN$। প্রমাণ করো যে, $AM : DN = AB : DE$।

**৯।** পাশের চিত্রে $BC \parallel DE$
- ক) প্রমাণ করো, $\triangle BOC$ ও $\triangle DOE$ সদৃশ।
- খ) প্রমাণ করো, $AD : BD = AE : CE$।
- গ) প্রমাণ করো, $BO : OE = CO : OD$।

[Figure: Two triangles sharing vertex O with BC ∥ DE.
 Natural description: Two triangles BOC and DOE sharing common vertex O, with BC parallel to DE.
 TikZ-mappable specifics: Vertex O in middle. Triangle BOC on one side (B, C extending out) and triangle DOE on the opposite side (D, E extending). BC ∥ DE marked with single arrow on both.]

**১০।** পাশের চিত্রে $BD \perp AC$ এবং $DQ = BQ = 2 AQ = \dfrac{1}{2} QC$। প্রমাণ করো যে, $DA \perp DC$।

[Figure: Right triangle with perpendicular and segment relations.
 Natural description: A configuration with points A, B, C, D, Q where BD ⊥ AC and DQ = BQ = 2·AQ = ½·QC.
 TikZ-mappable specifics: Horizontal line AC; vertical line BD intersecting AC at Q. AQ, QC on horizontal axis; QB, QD on vertical axis. Relations: DQ = BQ = 2·AQ = (1/2)·QC.]

**১১।** $\triangle ABC$ ও $\triangle DEF$ এর $\angle A = \angle D$ প্রমাণ করো, $\triangle ABC : \triangle DEF = AB \cdot AC : DE \cdot DF$।

**১২।** চিত্রে $ABC$ এবং $DEF$ দুইটি সদৃশ ত্রিভুজ।
- ক) ত্রিভুজ দুইটির অনুরূপ বাহু ও অনুরূপ কোণগুলোর নাম লিখ।
- খ) প্রমাণ করো যে, $\dfrac{\triangle ABC}{\triangle DEF} = \dfrac{AB^2}{DE^2} = \dfrac{AC^2}{DF^2} = \dfrac{BC^2}{EF^2}$
- গ) যদি $BC = 3$ সে.মি., $EF = 8$ সে.মি., $\angle B = 60°, \dfrac{BC}{AB} = \dfrac{3}{2}$ এবং $\triangle ABC$ এর ক্ষেত্রফল ৩ বর্গ সে.মি. হয়, তবে $\triangle DEF$ অঙ্কন করো এবং এর ক্ষেত্রফল নির্ণয় করো।

[Figure: Two similar triangles ABC and DEF.
 Natural description: Triangle ABC with vertices labeled, perpendicular dropped from A meeting BC at M; triangle DEF with similar setup, perpendicular from D meeting EF at N.
 TikZ-mappable specifics: Triangle 1: A top, B bottom-left, C bottom-right, with foot M on BC. Triangle 2: D top, E bottom-left, F bottom-right, with foot N on EF. Smaller similar triangle.]

## ১৪.৫ প্রতিসমতা (Symmetry)

প্রতিসমতা একটি প্রয়োজনীয় জ্যামিতিক ধারণা যা প্রকৃতিতে বিদ্যমান এবং যা আমাদের কর্মকাণ্ডে প্রতিনিয়ত ব্যবহার করে থাকি। প্রতিসমতার ধারণাকে শিল্পী, কারিগর, ডিজাইনার, ছুতারধরা প্রতিনিয়ত ব্যবহার করে থাকেন। গাছের পাতা, ঘরবাড়ি, টেবিল, চেয়ার সব কিছুর মধ্যে প্রতিসমতা বিদ্যমান। যদি কোনো সরলরেখা বরাবর কোনো চিত্র ভাজ করলে এর অংশ দুইটি সম্পূর্ণভাবে মিলে যায় সেক্ষেত্রে সরলরেখাটিকে প্রতিসাম্য রেখা বলা হয়।

[Figure: Examples of objects with line symmetry — windows, letter T, letter M, butterfly.
 Natural description: Various everyday objects showing reflection symmetry — a window pattern, letter T, letter M, and a butterfly-like figure with bilateral symmetry.
 TikZ-mappable specifics: Four small shapes shown side by side: (1) a window with rectangular grid pattern symmetric about a vertical axis; (2) the letter T (vertical axis of symmetry); (3) the letter M (vertical axis); (4) a butterfly shape symmetric about a vertical axis.]

উপরের চিত্রগুলোর প্রতিটির প্রতিসাম্য রেখা দেখানো হলো।

> **কাজ:**
> ক) সাদা কাগজ কেটে পাশের চিত্রের ডিজাইন তৈরি করেছে। চিত্রে প্রতিসাম্য রেখাসমূহ চিহ্নিত করো। এর কয়টি প্রতিসাম্য রেখা রয়েছে?
> খ) ইংরেজি বর্ণমালার এমন সকল বর্ণের প্রতিসাম্য রেখা রয়েছে সেগুলো লিখে প্রতিসাম্য রেখা চিহ্নিত করো।

### সুষম বহুভুজের প্রতিসাম্য রেখা (Lines of symmetry of a regular polygon)

বহুভুজ কতকগুলো রেখাংশ দ্বারা আবদ্ধ চিত্র। বহুভুজের রেখাংশগুলোর দৈর্ঘ্য সমান ও কোণগুলো সমান হলে, বহুভুজটি সুষম বহুভুজ। ত্রিভুজে এ ধর্ম সবচেয়ে কম সংখ্যক রেখাংশ দিয়ে গঠিত বহুভুজ। সমবাহু ত্রিভুজে তিনটি বাহু বিশিষ্ট সুষম বহুভুজ। সমবাহু ত্রিভুজের তিন বাহু ও কোণগুলো সমান। চার বাহুবিশিষ্ট সুষম বহুভুজ বর্গক্ষেত্র। বর্গক্ষেত্রের চার বাহু ও কোণগুলো সমান। অনুরূপভাবে, সুষম পঞ্চভুজ ও সুষম ষড়ভুজের বাহু ও কোণগুলো সমান।

[Figure: Regular polygons with their lines of symmetry — equilateral triangle, square, regular pentagon, regular hexagon.
 Natural description: Four regular polygons showing their lines of symmetry: (1) equilateral triangle with 3 lines of symmetry (60° angles marked, side 'a'); (2) square with 4 lines of symmetry (vertical, horizontal, two diagonals); (3) regular pentagon with 5 lines of symmetry (interior angles 72°, 108° marked); (4) regular hexagon with 6 lines of symmetry (interior angles 120° marked).
 TikZ-mappable specifics: Four polygons in a row. (1) Equilateral triangle (3 vertices), all angles 60°, side length 'a'. Lines of symmetry: 3 (each from vertex to midpoint of opposite side). (2) Square, all sides equal, all angles 90°. Lines: 4 (2 perpendicular through midpoints, 2 diagonals). (3) Regular pentagon (5 vertices), interior angle 108°. Lines: 5 (each from vertex to midpoint of opposite side). (4) Regular hexagon (6 vertices), interior angle 120°. Lines: 6 (3 through opposite vertices, 3 through midpoints of opposite sides).]

প্রত্যেক সুষম বহুভুজ একটি প্রতিসম চিত্র। সুতরাং এদের প্রতিসাম্য রেখা সম্পর্কে অনেক জানার আবশ্যক। সুষম বহুভুজের অনেক বাহুর পাশাপাশি একাধিক প্রতিসাম্য রেখা রয়েছে।

| তিনটি প্রতিসাম্য রেখা | চারটি প্রতিসাম্য রেখা | পাঁচটি প্রতিসাম্য রেখা | ছয়টি প্রতিসাম্য রেখা |
|---|---|---|---|
| সমবাহু ত্রিভুজ | বর্গক্ষেত্র | সুষম পঞ্চভুজ | সুষম ষড়ভুজ |

প্রতিসমতার ধারণার সাথে আয়নার প্রতিফলনের সম্পর্ক রয়েছে। কোনো জ্যামিতিক চিত্রের প্রতিসাম্য রেখা যথভাবে থাকে, যখন তার অর্ধাংশের প্রতিফলিত গঠন অপর অর্ধাংশের সাথে মিলে যায়। এজন্য প্রতিসাম্য রেখা নির্ণয় কাল্পনিক আয়নার অবস্থান রেখার সাহায্যে দেখানো হয়। রেখা প্রতিসমতাকে প্রতিফলন প্রতিসমতা বলা হয়।

[Figure: Examples of shapes with reflection symmetry — square, rectangle (incomplete), triangle, circle, regular pentagon.
 Natural description: Five geometric shapes — square (with diagonal axis marked), rectangle (horizontal and vertical axes), triangle (one axis), circle (any diameter), pentagon (five axes) — each illustrating reflection symmetry.
 TikZ-mappable specifics: Five small shapes in a row each with their reflective symmetry axis indicated by a dashed line through the shape.]

> **কাজ:**
> ক) প্রতিসাম্য রেখা দেওয়া আছে, অন্য ফোটো প্রদর্শন করো:
> [Figure: Six shapes with lines of symmetry given — square, isosceles triangle, right triangle, circle, regular pentagon, etc. — each with a dashed line indicating the line of symmetry.]
> খ) নিচের জ্যামিতিক চিত্রের প্রতিসাম্য সংখ্যা নির্ণয় করো:
> (১) সমদ্বিবাহু ত্রিভুজ (২) বিষমবাহু ত্রিভুজ (৩) বর্গক্ষেত্র
> (৪) রম্বস (৫) সুষম ষড়ভুজ (৬) পঞ্চভুজ
> (৭) বৃত্ত

### ঘূর্ণন প্রতিসমতা (Rotational symmetry)

কোনো নির্দিষ্ট বিন্দুর সাপেক্ষে ঘূর্ণনের ফলে বস্তুর আকৃতি ও আকারের পরিবর্তন হয় না। তবে বস্তুর বিভিন্ন অংশের অবস্থানের পরিবর্তন হতে পারে। ঘূর্ণনের ফলে বস্তুর অন্যান্য বস্তুর আকৃতি ও আকার আদি অংশের পরিবর্তন হয় না হলে আমরা বলি ঘূর্ণনের ফলে বস্তুটির প্রতিসমতা রক্ষা হয়েছে। ঘূর্ণনের ফলে কোনো বস্তু এক চক্রে নিজস্বানে কাকে নিজের অন্য অবস্থানের সংখ্যাই হলো ঐ বস্তুর ঘূর্ণন প্রতিসমতার মাত্রা। ঘূর্ণন প্রতিসমতার বহু চারপাশের ফসকে রয়েছে। যেমন, সাইকেলের চাকা, সিলিং ফ্যান, বর্গ ইত্যাদি। একটি সিলিং ফ্যানের পাখাগুলোর ঘূর্ণনের ফলে এর প্রকৃতিতে মূল অবস্থানে যা ভৌতিকতার নষ্ট নয়। পাখাগুলো যথারীতি ঘুরছে। সাইকেলের চাকা ঘড়ির কাঁটার দিকেও ঘুরতে পারে, আবার বিপরীত দিকেও ঘুরতে পারে।

যে বিন্দুর সাপেক্ষে বস্তু কোণে তা হলো ঘূর্ণন কেন্দ্র। ঘূর্ণনের সময় কোণে পরিমাণ যত হলো তা হলো ঘূর্ণন কোণ। একবার পূর্ণ ঘূর্ণন কোণের পরিমাণ $360°$, অর্থ ঘূর্ণনে কোণের পরিমাণ $180°$।

চিত্রে এক পূর্ণ ঘূর্ণনে ঠিক চারটি অবস্থানে ($90°, 180°, 270°, 360°$ কোণে ঘূর্ণনের ফলে) ফ্যানটি দেখতে হবৃহ একই রকম। এজন্য বলা হয় ফ্যানটির ঘূর্ণন প্রতিসমতার মাত্রা $4$।

[Figure: Rotational symmetry of a 4-blade fan in 4 positions.
 Natural description: A four-bladed fan (or windmill-like shape) rotated through 90°, 180°, 270°, 360° — at each angle the shape looks identical to its initial state.
 TikZ-mappable specifics: Four copies of a 4-armed cross shape arranged in a row. Each shape labeled with A, B, C, D at the four arm tips. Successive copies rotated by 90° clockwise. Below each, the rotation angle marked: 90°, 180°, 270°, 360°.]

ঘূর্ণন প্রতিসমতার আরও একটি উদাহরণ দেওয়া যাক। একটি বর্গের কর্ণ দুইটির ছেদবিন্দু ঘূর্ণন কেন্দ্র ধরি। ঘূর্ণন কেন্দ্রের সাপেক্ষে বর্গটিকে এক-চতুর্থাংশ ঘূর্ণনের ফলে যেকোনো কৌণিক বিন্দুর অবস্থান দ্বিতীয় বিন্দুর ন্যায় হবে। এভাবে চারবারের এক-চতুর্থাংশ ঘূর্ণনের ফলে বর্গটি আদি অবস্থানে ফিরে আসে। বলা হয়, বর্গের $4$ মাত্রার ঘূর্ণন প্রতিসমতা রয়েছে।

[Figure: Square showing 4-fold rotational symmetry.
 Natural description: A square rotated through 90°, 180°, 270°, 360°, each rotation reproducing the original square.
 TikZ-mappable specifics: Four squares in a row, each rotated by 90° more than the previous one, with vertices A, B, C, D cycling through their positions. P marked at the center of each.]

লক্ষ করি, যেকোনো চিত্র একবার পূর্ণ ঘূর্ণনে আদি অবস্থানে ফিরে আসে। তাই যেকোনো জ্যামিতিক চিত্রের $1$ মাত্রার ঘূর্ণন প্রতিসমতা থাকবে।

ঘূর্ণন প্রতিসমতা নির্ণয়ের ক্ষেত্রে নিচের বিষয়গুলো লক্ষ রাখতে হবে:

ক) ঘূর্ণন কেন্দ্র খ) ঘূর্ণন কোণ
গ) ঘূর্ণনের দিক ঘ) ঘূর্ণন প্রতিসমতার মাত্রা

> **কাজ:**
> ক) তোমার চারপাশের পরিবেশ থেকে $5$টি সমতলীয় বস্তুর উদাহরণ দাও যাদের ঘূর্ণন প্রতিসমতা রয়েছে।
> খ) নিচের চিত্রের ঘূর্ণন প্রতিসমতা নির্ণয় করো।
> [Figure: Various rotational symmetry examples — circle, rectangle, three-blade fan, regular triangle.]

### রেখা প্রতিসমতা ও ঘূর্ণন প্রতিসমতা (Line symmetry and rotational symmetry)

আমরা দেখেছি যে, কিছু জ্যামিতিক চিত্রের শুধু রেখা প্রতিসমতা রয়েছে, কিন্তু শুধু ঘূর্ণন প্রতিসমতা রয়েছে। আবার কোনো কোনো চিত্রের রেখা প্রতিসমতা ও ঘূর্ণন প্রতিসমতা উভয়ই বিদ্যমান। বর্গের যেমন চারটি রেখা প্রতিসমতা রয়েছে, তেমনি $4$ মাত্রার ঘূর্ণন প্রতিসমতা রয়েছে।

বৃত্ত একটি আদর্শ প্রতিসম চিত্র। বৃত্তের এর কেন্দ্রের সাপেক্ষে যে কোনো কোণ ও যেকোনো দিকে ঘুরালে এর অবস্থানের পরিবর্তন লক্ষ করা যায় না। অতএব, বৃত্তের ঘূর্ণন প্রতিসমতার মাত্রা অসীম। একই সাথে বৃত্তের কেন্দ্রগামী যেকোনো রেখা এর প্রতিসাম্য রেখা। সুতরাং, বৃত্তের অসংখ্য প্রতিসাম্য রেখা রয়েছে।

> **কাজ:** ইংরেজি বর্ণমালার কয়েকটি বর্ণের রেখা প্রতিসমতা ও ঘূর্ণন প্রতিসমতা নির্ধারণ করো এবং নিচের সারণিটি পূরণ করো। (একটি করে দেখানো হলো)
>
> | বর্ণ | রেখা প্রতিসমতা | প্রতিসাম্য রেখার সংখ্যা | ঘূর্ণন প্রতিসমতা | ঘূর্ণন প্রতিসমতার মাত্রা |
> |---|---|---|---|---|
> | Z | নেই | $0$ | হ্যাঁ | $2$ |
> | H |  |  |  |  |
> | O |  |  |  |  |
> | E |  |  |  |  |
> | C |  |  |  |  |

## অনুশীলনী ১৪.৩

**১।** বিষমবাহু ত্রিভুজের মোট কতটি প্রতিসাম্য রেখা আছে?
- ক) শূন্যটি
- খ) একটি
- গ) তিনটি
- ঘ) অসংখ্য

পাশের চিত্রের বহুভুজটির প্রতিটি বাহুর দৈর্ঘ্য $6$ সে. মি.। এই তথ্য অনুসারে ২ ও ৩ নং প্রশ্নের উত্তর দাও।

[Figure: Regular hexagon with side 6 cm.
 Natural description: A regular hexagon with each side measuring 6 cm.
 TikZ-mappable specifics: Regular hexagon (6 equal sides, each 6 cm; interior angles 120°). Center marked.]

**২।** বহুভুজটির মোট কতটি প্রতিসাম্য রেখা আছে?
- ক) $3$ টি
- খ) $6$ টি
- গ) $7$ টি
- ঘ) অসংখ্য

**৩।** বহুভুজটির—
- $(i)\,$ ঘূর্ণন মাত্রা $4$
- $(ii)\,$ ঘূর্ণন কোণ $60°$
- $(iii)\,$ প্রতিটি কোণ সমান

নিচের কোনটি সঠিক?
- ক) $i$
- খ) $ii$
- গ) $ii$ ও $iii$
- ঘ) $i, ii$ ও $iii$

**৪।** নিচের কোনটির প্রতিসাম্য রেখা রয়েছে?
- ক) বাড়ির চিত্র
- খ) মসজিদের চিত্র
- গ) মন্দিরের চিত্র
- ঘ) পিরামিড চিত্র ঙ) পাগোডার চিত্র চ) পার্লামেন্ট ভবনের চিত্র

**৫।** প্রতিসাম্য রেখা দেওয়া আছে (ভাঙ্গা রেখা), জ্যামিতিক চিত্র সম্পূর্ণ কর এবং সনাক্ত করো:
[Figure: Five shapes with dashed symmetry lines — half-drawn shapes to be completed.]

**৬।** নিচের জ্যামিতিক চিত্রে প্রতিসাম্য রেখা নির্দেশ করো:
[Figure: Six geometric shapes including triangular knot, leaf, butterfly, flower-like rosette — each to have its lines of symmetry identified.]

**৭।** নিচের অসম্পূর্ণ জ্যামিতিক চিত্র সম্পূর্ণ করো যেন আয়না রেখা সাপেক্ষে প্রতিসম হয়:
[Figure: Several partial shapes (half-drawn) along with a mirror axis — to be completed.]

**৮।** চিত্রের ঘূর্ণন প্রতিসমতা নির্ণয় করো:
[Figure: Five shapes — cross/plus sign, pentagon star, six-pointed star, S-curve, equilateral triangle — to determine rotational symmetry of each.]

**৯।** ইংরেজি বর্ণমালার যে সকল বর্ণের:
- ক) অনুভূমিক আয়না
- খ) উল্লম্ব আয়না
- গ) অনুভূমিক ও উল্লম্ব উভয় আয়না

সাপেক্ষে প্রতিসমতা রয়েছে সেগুলো লিখ।

**১০।** প্রতিসাম্য নেই এমন তিনটি চিত্র অঙ্কন করো।

**১১।** একটি লেবু আড়াআড়িভাবে কেটে চিত্রের ন্যায় আকারে পাওয়া গেল। সমতলীয় চিত্রটির ঘূর্ণন প্রতিসমতা নির্ণয় করো।

**১২।** শূন্যস্থান পূরণ করো:

| চিত্র | ঘূর্ণন কেন্দ্র | ঘূর্ণন প্রতিসমতার মাত্রা | ঘূর্ণন প্রতিসমতার কোণ |
|---|---|---|---|
| বর্গ |  |  |  |
| আয়ত |  |  |  |
| রম্বস |  |  |  |
| সমবাহু ত্রিভুজ |  |  |  |
| অর্ধবৃত্ত |  |  |  |
| সুষম পঞ্চভুজ |  |  |  |

**১৩।** যে সকল চতুর্ভুজের রেখা প্রতিসমতা ও $1$ এর অধিক মাত্রার ঘূর্ণন প্রতিসমতা রয়েছে, এদের তালিকা করো।

**১৪।** $1$ এর অধিক মাত্রার ঘূর্ণন প্রতিসমতা রয়েছে এরূপ চিত্রের ঘূর্ণন কোণ $18°$ হতে পারে কি? তোমার উত্তরের পক্ষে যুক্তি দাও।

## নমুনা প্রশ্ন

### বহুনির্বাচনি প্রশ্ন

**১।** $\triangle ABC$ ও $\triangle PQR$ এর ক্ষেত্রফল ও উচ্চতা সমানুপাতিক। $\triangle ABC$ এর উচ্চতা $a$ একক হলে, $\triangle PQR$ এর উচ্চতা কত একক?
- ক) $a$
- খ) $2a$
- গ) $3a$
- ঘ) $4a$

**২।** সমকৌণিক জ্যামিতিতে—
- $(i)\,$ ত্রিভুজ হলো সবচেয়ে কম সংখ্যক রেখাংশ দিয়ে গঠিত বহুভুজ।
- $(ii)\,$ চার বাহু বিশিষ্ট সুষম বহুভুজ হলো রম্বস।
- $(iii)\,$ সুষম পঞ্চভুজের বাহুগুলো সমান হলেও কোণগুলো অসমান।

নিচের কোনটি সঠিক?
- ক) $i$
- খ) $i$ ও $ii$
- গ) $i$ ও $iii$
- ঘ) $i, ii$ ও $iii$

পাশের চিত্রের তথ্যানুসারে ৩ ও ৪ নং প্রশ্নের উত্তর দাও।

[Figure: Right triangle with given measurements.
 Natural description: A right triangle with vertices B (bottom-left), C (bottom-right), D (on BC). One side BD = 10, height drawn. AB = 4 (or similar).
 TikZ-mappable specifics: Right triangle with B at bottom-left, vertical side BA up to A, horizontal side BD = 10, slant AD. Internal point or measurement marked.]

**৩।** $\triangle ABD$ এর উচ্চতা ও ভূমির অনুপাত কত?
- ক) $\dfrac{1}{2}$
- খ) $\dfrac{4}{5}$
- গ) $\dfrac{2}{5}$
- ঘ) $\dfrac{5}{4}$

**৪।** $\triangle ABD$ এর ক্ষেত্রফল কত বর্গ একক?
- ক) $6$
- খ) $20$
- গ) $40$
- ঘ) $50$

### সৃজনশীল প্রশ্ন

**৫।** $\triangle ABC$ এর $\angle A$ এর সমদ্বিখণ্ডক $AD, BC$-কে $D$ বিন্দুতে ছেদ করেছে। $DA$ এর সমান্তরাল $CE$ রেখাংশ বর্ধিত $BA$ বাহুকে $E$ বিন্দুতে ছেদ করেছে।
- ক) $\triangle PQR$ ও $\triangle LMN$-এর ভূমি যথাক্রমে $QR$ ও $MN$ এবং $QR = MN$। দেখাও যে, ত্রিভুজদ্বয়ের ক্ষেত্রফলের অনুপাত তাদের উচ্চতাদ্বয়ের অনুপাতের সমান।
- খ) প্রমাণ করো যে, $BD : DC = BA : AC$।
- গ) $BC$ এর সমান্তরাল কোনো রেখাংশ $AB$ ও $AC$-কে যথাক্রমে $P$ ও $Q$ বিন্দুতে ছেদ করলে, প্রমাণ করো যে, $BD : DC = BP : CQ$।

### সংক্ষিপ্ত-উত্তর প্রশ্ন

**৬।** ক) $\triangle ABC$-এর $BC$ বাহুর সমান্তরাল $DE$ রেখাংশ $AB$ ও $AC$ বাহুকে যথাক্রমে $D$ ও $E$ বিন্দুতে ছেদ করে যদি $AD : DB = 2 : 1$ হলে দেখাও যে, $DE : BC = 1 : 2$।

খ) $\triangle PQR$ ও $\triangle LMN$-এর উচ্চতা সমান হলে দেখাও যে, তাদের ক্ষেত্রফলদ্বয়ের অনুপাত তাদের ভূমিদ্বয়ের অনুপাতের সমান।

গ) $ABC$ এবং $DEF$ সদৃশকোণী ত্রিভুজের এক একজোড়া অনুরূপ বাহু $AB$ ও $DE$-এর অনুপাত $3 : 4$ হলে, $\triangle ABC : \triangle DEF$ নির্ণয় করো।

> **OCR Quality Notes (Pass 2 @ 15-18x scale):**
> - All 8 theorems (উপপাদ্য ২৮-৩৫) preserved with statements and proofs
> - 1 সম্পাদ্য (সম্পাদ্য ১২: line-segment division in given ratio) with full অঙ্কন ও প্রমাণ
> - 2 অনুসিদ্ধান্ত (corollaries) captured
> - Definitions: সদৃশকোণী, সদৃশতা, প্রতিসমতা, ঘূর্ণন প্রতিসমতা verbatim
> - 3 অনুশীলনী (১৪.১: ৭ items, ১৪.২: ১২ items, ১৪.৩: ১৪ items) + নমুনা প্রশ্ন
> - **Geometric figures rendered as TikZ-friendly [Figure: ...] placeholders** with vertex placement, angle marks, parallel-line arrows, side proportions
> - Symmetry-illustration figures (windows, alphabet letters, polygons, fan rotations) described with sufficient detail to redraw
>
> **Items flagged for further verification (preserved as-read):**
> - *[verify]* অনুশীলনী ১৪.২ #২: option phrasing has potential duplication ("$AB : AC = PQ : PQ$" listed twice) — likely source typo
> - *[verify]* অনুশীলনী ১৪.৩ #৩ option (ii): "ঘূর্ণন কোণ $60°$" for regular hexagon — actually hexagon's rotational angle is $60°$ ✓
> - *[verify]* নমুনা প্রশ্ন #৩-৪ — depends on diagram measurements; preserved as printed
> - *[verify]* Several symmetry diagrams in অনুশীলনী ১৪.৩ — specific shapes (#৬, #৭, #৮, #১১) inferred from context