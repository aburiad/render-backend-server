---
class: 9
subject: math
chapter_no: 15
chapter_title_bn: ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য
chapter_title_en: Area Related Theorems and Constructions
book_pages: "285-293"
pdf_pages: "290-298"
source: "Secondary (BV) 2026 — Class 9-10 Math (NCTB)"
ocr_method: "Claude vision @ 15x scale + self-verified at 18x"
ocr_pass: 2
fidelity: "same-to-same — all theorems, constructions and proofs preserved verbatim"
subchapters:
  - id: "15.1"
    title: "সমতলক্ষেত্রের ক্ষেত্রফল"
    heading: "## ১৫.১ সমতলক্ষেত্রের ক্ষেত্রফল"
    type: "concept"
  - id: "15.2"
    title: "ক্ষেত্রফল সম্পর্কিত উপপাদ্য"
    heading: "## ১৫.২ ক্ষেত্রফল সম্পর্কিত উপপাদ্য"
    type: "concept"
  - id: "15.3"
    title: "সম্পাদ্য ১৩–১৫ (ক্ষেত্রফল সমান অঙ্কন)"
    heading: "## ১৫.৩ সম্পাদ্য (ক্ষেত্রফল সমান অঙ্কন)"
    type: "concept"
  - id: "15.ex1"
    title: "অনুশীলনী ১৫"
    heading: "## অনুশীলনী ১৫"
    type: "exercise"
  - id: "15.sample"
    title: "নমুনা প্রশ্ন"
    heading: "## নমুনা প্রশ্ন"
    type: "sample"
---

# পঞ্চদশ অধ্যায় — ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য (Area Related Theorems and Constructions)

## ভূমিকা

আমরা জানি সীমাবদ্ধ সমতলক্ষেত্রের আকৃতি বিভিন্ন রকম হতে পারে। সমতলক্ষেত্র যদি চারটি বাহু দ্বারা সীমাবদ্ধ হয়, তবে একে আমরা চতুর্ভুজ বলে থাকি। এই চতুর্ভুজের আবার শ্রেণিবিভাগ আছে এবং আকৃতি ও বৈশিষ্ট্যের উপর ভিত্তি করে এদের নামকরণও করা হয়েছে। এই সকল সমতলক্ষেত্রের বাইরের অনেক ক্ষেত্র আছে যাদের বাহু চারের অধিক। আলোচিত এ সকল ক্ষেত্রই বহুভুজক্ষেত্র। প্রত্যেক সীমাবদ্ধ সমতলক্ষেত্রের নির্দিষ্ট পরিমাণ আছে যাকে ক্ষেত্রফল বলে অভিহিত করা হয়। এই সকল ক্ষেত্রফল পরিমাপের জন্য সাধারণত এক একক বাহু বিশিষ্ট বর্গক্ষেত্রের ক্ষেত্রফল ব্যবহার করা হয় এবং এদের ক্ষেত্রফলকে বর্গ একক হিসেবে লেখা হয়। যেমন, বাংলাদেশের ক্ষেত্রফল $1.47$ হাজার বর্গ কিলোমিটার (প্রায়)। আমাদের দৈনন্দিন জীবনের প্রয়োজন মেটাতে বহুভুজক্ষেত্রের ক্ষেত্রফল জানতে ও পরিমাপ করতে হয়। তাই এই শ্রেণির শিক্ষার্থীদের বহুভুজক্ষেত্রের ক্ষেত্রফল সম্পর্কে সম্যক জ্ঞান প্রদান করা অতীব গুরুত্বপূর্ণ। এখানে বহুভুজক্ষেত্রের ক্ষেত্রফলের ধারণা এবং এতদসংক্রান্ত কতিপয় উপপাদ্য ও সম্পাদ্যা বিষয়ক বিষয়বস্তু উপস্থাপন করা হয়েছে।

এ অধ্যায় শেষে শিক্ষার্থীরা—

- বহুভুজক্ষেত্রের ক্ষেত্রফলের ধারণা ব্যাখ্যা করতে পারবে;
- ক্ষেত্রফল সংক্রান্ত উপপাদ্যসমূহ যাচাই ও প্রমাণ করতে পারবে;
- প্রদত্ত উপাত্ত ব্যবহার করে বহুভুজক্ষেত্র অঙ্কন ও অঙ্কনের যথার্থতা যাচাই করতে পারবে;
- ত্রিভুজক্ষেত্রের ক্ষেত্রফলের সমান চতুর্ভুজক্ষেত্র অঙ্কন করতে পারবে;
- চতুর্ভুজক্ষেত্রের ক্ষেত্রফলের সমান ত্রিভুজক্ষেত্র অঙ্কন করতে পারবে।

## ১৫.১ সমতলক্ষেত্রের ক্ষেত্রফল

প্রত্যেক সীমাবদ্ধ সমতলক্ষেত্রের নির্দিষ্ট ক্ষেত্রফল রয়েছে। এই ক্ষেত্রফল পরিমাপের জন্য সাধারণত এক একক বাহু বিশিষ্ট বর্গক্ষেত্রের ক্ষেত্রফলকে বর্গ একক হিসেবে গ্রহণ করা হয়। যেমন, যে বর্গক্ষেত্রের এক বাহুর দৈর্ঘ্য এক সেন্টিমিটার তার ক্ষেত্রফল হবে এক বর্গসেন্টিমিটার।

আমরা জানি,

ক) $ABCD$ আয়তক্ষেত্রের দৈর্ঘ্য $AB = a$ একক (যেমন: মিটার), প্রস্থ $BC = b$ একক (যেমন: মিটার) হলে, $ABCD$ আয়তক্ষেত্রের ক্ষেত্রফল $= ab$ বর্গ একক (যেমন: বর্গমিটার)।

[Figure: Rectangle ABCD with length a and width b.
 Natural description: A rectangle ABCD with side lengths AB = a (horizontal) and BC = b (vertical).
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. AB = a (horizontal base), BC = b (vertical right side), CD = a (top), DA = b (left). All four right angles marked with small squares.]

খ) $ABCD$ বর্গক্ষেত্রের বাহুর দৈর্ঘ্য $= a$ একক (যেমন: মিটার) হলে, $ABCD$ বর্গক্ষেত্রের ক্ষেত্রফল $= a^2$ বর্গ একক (যেমন: বর্গমিটার)।

[Figure: Square ABCD with side a.
 Natural description: A square ABCD with all four sides equal to length a.
 TikZ-mappable specifics: Square with A at bottom-left, B at bottom-right, C at top-right, D at top-left. All four sides = a, all four angles = 90° (right-angle squares).]

দুইটি ক্ষেত্রের ক্ষেত্রফল সমান হলে এদের মধ্যে $=$ চিহ্ন ব্যবহার করা হয়। যেমন, $ABCD$ আয়তক্ষেত্রের ক্ষেত্রফল = $AED$ ত্রিভুজক্ষেত্রের ক্ষেত্রফল, যেখানে $AB = BE$।

[Figure: Rectangle ABCD and triangle AED with equal areas.
 Natural description: A rectangle ABCD on the left with a triangle AED overlapping on the right, where BE equals AB. The triangle is half of the doubled rectangle.
 TikZ-mappable specifics: Rectangle ABCD with A bottom-left, B bottom-right, C top-right, D top-left. Triangle AED with E placed such that BE = AB (E on extension of AB or similar configuration). Shaded regions indicate equal areas.]

উল্লেখ্য যে, $\triangle ABC$ ও $\triangle DEF$ সর্বসম হলে, $\triangle ABC = \triangle DEF$ লেখা হয়। এ ক্ষেত্রে অবশ্যই $\triangle ABC$ এর ক্ষেত্রফল $= \triangle DEF$ এর ক্ষেত্রফল।

[Figure: Two congruent triangles ABC and DEF.
 Natural description: Two triangles of identical shape and size — congruent — with corresponding sides and angles equal.
 TikZ-mappable specifics: Two triangles drawn next to each other, identical in size. Both labeled with vertices A, B, C and D, E, F respectively. Hash marks indicate corresponding equal sides.]

কিন্তু দুইটি ত্রিভুজক্ষেত্রের ক্ষেত্রফল সমান হলেই ত্রিভুজ দুইটি সর্বসম হয় না। যেমন, চিত্রে, $\triangle ABC$ এর ক্ষেত্রফল $= \triangle DBC$ এর ক্ষেত্রফল। কিন্তু $\triangle ABC$ ও $\triangle DBC$ সর্বসম নয়।

[Figure: Two triangles ABC and DBC with same base BC and equal areas but not congruent.
 Natural description: Two triangles sharing the same base BC, with apex points A and D both at the same height above BC but in different horizontal positions.
 TikZ-mappable specifics: Common base BC at the bottom. Two apex points A and D both at the same vertical height h above BC (so triangle ABC and triangle DBC have same area = (1/2)·BC·h), but A and D at different horizontal positions, making the triangles non-congruent.]

## ১৫.২ ক্ষেত্রফল সম্পর্কিত উপপাদ্য

### উপপাদ্য ৩৬.

একই ভূমির উপর এবং একই সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত সকল ত্রিভুজক্ষেত্রের ক্ষেত্রফল সমান।

মনে করি, $ABC$ ও $DBC$ ত্রিভুজদ্বয় একই ভূমি $BC$ এর উপর এবং একই সমান্তরাল রেখাযুগল $BC$ ও $AD$ এর মধ্যে অবস্থিত। প্রমাণ করতে হবে যে, $\triangle ABC$ এর ক্ষেত্রফল $= \triangle DBC$ এর ক্ষেত্রফল।

**অঙ্কন:** $BC$ রেখাংশের $B$ ও $C$ বিন্দুতে যথাক্রমে $BE$ ও $CF$ লম্ব আঁকি, যা $DA$ এর বর্ধিতাংশকে $E$ বিন্দুতে এবং $EBCF$ একটি আয়তক্ষেত্রের তৈরি হয়।

[Figure: Two triangles ABC and DBC on common base BC between parallel lines.
 Natural description: Common base BC at the bottom. Apex points A and D both lying on a line parallel to BC above. Auxiliary rectangle EBCF where E is directly above B (or extension) and F is directly above C.
 TikZ-mappable specifics: Base BC horizontal. Top parallel line containing A (left of D) and D (right of A) plus E (left of A) and F (right of D). Perpendiculars BE up from B and CF up from C meet the upper parallel line at E and F respectively, forming rectangle EBCF. Triangle ABC: vertices A (on upper line), B (bottom-left), C (bottom-right). Triangle DBC: vertices D (on upper line, different x-position than A), B (bottom-left, common), C (bottom-right, common).]

**প্রমাণ:** $\triangle ABC$ এর ভূমি $BC$ এবং উচ্চতা $BE$

$\therefore \triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times BC \times BE \ldots \ldots (i)$

আবার, $\triangle DBC$ এর ভূমি $BC$ এবং উচ্চতা $CF$

$\therefore \triangle DBC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times BC \times CF = \dfrac{1}{2} \times BC \times BE \ldots \ldots (ii)$ [$EBCF$ আয়তক্ষেত্র]

$(i)$ ও $(ii)$ নং তুলনা করে পাই, $\triangle ABC$ এর ক্ষেত্রফল $= \triangle DBC$ এর ক্ষেত্রফল। (প্রমাণিত)

**অনুসিদ্ধান্ত ১.** একই ভূমি এবং একই পাশে অবস্থিত সকল ত্রিভুজক্ষেত্রের ক্ষেত্রফল সমান হলে, এরা একই সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত হবে।

**অনুসিদ্ধান্ত ২.** কোনো ত্রিভুজ ও সামান্তরিক একই ভূমি ও একই সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত হলে, ত্রিভুজের ক্ষেত্রফল সামান্তরিকের ক্ষেত্রফলের অর্ধেক।

ইঙ্গিত: চিত্রে, $ABCD$ সামান্তরিক। $AC$ কর্ণ।

$\therefore \triangle ABC \cong \triangle ADC$

$\therefore \triangle ABC = \dfrac{1}{2}$ সামান্তরিক $ABCD$

[Figure: Parallelogram ABCD with diagonal AC.
 Natural description: Parallelogram ABCD with diagonal AC drawn, dividing it into two congruent triangles.
 TikZ-mappable specifics: Parallelogram with A top-left, B bottom-left, C bottom-right, D top-right. Diagonal AC drawn from A to C, splitting it into △ABC (lower) and △ACD (upper).]

### উপপাদ্য ৩৭.

একই ভূমির উপর এবং একই সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত সামান্তরিকক্ষেত্রসমূহের ক্ষেত্রফল সমান।

চিত্রে, $ABCD$ ও $ABEF$ সামান্তরিকক্ষেত্র দুইটি একই ভূমি $AB$ এর উপর এবং একই সমান্তরাল রেখাযুগল $AB$ ও $FC$ এর মধ্যে অবস্থিত। প্রমাণ করতে হবে যে, $ABCD$ সামান্তরিকের ক্ষেত্রফল $= ABEF$ সামান্তরিকের ক্ষেত্রফল।

[Figure: Two parallelograms ABCD and ABEF on common base AB between parallel lines.
 Natural description: Common base AB at the bottom. Two parallelograms sharing this base, with their top sides DC and FE both on a line parallel to AB.
 TikZ-mappable specifics: Base AB horizontal at the bottom. Line FC parallel to AB above (top edge). Parallelogram ABCD: A bottom-left, B bottom-right, C top-right, D top-left. Parallelogram ABEF: A bottom-left, B bottom-right, E top-right (further right), F top-left (further right than D). Auxiliary points K, L on AB extensions if needed.]

**অঙ্কন:** $A, C$ ও $A, E$ যোগ করি। $C$ ও $E$ বিন্দু থেকে ভূমি $AB$ ও এর বর্ধিত রেখাংশের উপর $EK$ ও $CL$ লম্ব দুই টানি।

**প্রমাণ:** $\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times AB \times CL$ এবং $\triangle ABE$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times AB \times EK$

যেহেতু $CL = EK$, [অঙ্কনানুসারে $AL \parallel FC$]

অতএব, $\triangle ABC$ এর ক্ষেত্রফল $= \triangle ABE$ এর ক্ষেত্রফল

$\implies \dfrac{1}{2}$ সামান্তরিকের $ABCD$ এর ক্ষেত্রফল $= \dfrac{1}{2}$ সামান্তরিকের $ABEF$ এর ক্ষেত্রফল

$\therefore ABCD$ সামান্তরিকের ক্ষেত্রফল $= ABEF$ সামান্তরিকের ক্ষেত্রফল। (প্রমাণিত)

### উপপাদ্য ৩৮ (পিথাগোরাসের উপপাদ্য / Pythagorean Theorem)

সমকোণী ত্রিভুজের অতিভুজের উপর অঙ্কিত বর্গক্ষেত্রের ক্ষেত্রফল অপর দুই বাহুর উপর অঙ্কিত বর্গক্ষেত্রদ্বয়ের ক্ষেত্রফলের সমষ্টির সমান।

**বিশেষ নির্বচন:** মনে করি, $ABC$ সমকোণী ত্রিভুজের $\angle ACB$ সমকোণ এবং $AB$ অতিভুজ। প্রমাণ করতে হবে যে, $AB^2 = AC^2 + BC^2$।

**অঙ্কন:** $AB, AC$ এবং $BC$ বাহুর উপর যথাক্রমে $ABED, ACGF$ এবং $BCHK$ বর্গক্ষেত্র অঙ্কন করি। $C$ বিন্দু দিয়ে $AD$ ও $BE$ রেখার সমান্তরাল $CL$ রেখা আঁকি। মনে করি, $AB$ কে $M$ বিন্দুতে এবং $DE$ কে $L$ বিন্দুতে ছেদ করে। $C, D$ এবং $B, G$ যোগ করি।

[Figure: Right triangle ABC with three squares on its sides (Pythagorean theorem proof setup).
 Natural description: Right triangle ABC with right angle at C. Three squares constructed outward on each side: ABED on the hypotenuse AB, ACGF on leg AC, and BCHK on leg BC. A perpendicular CL from C meets DE at L. Diagonals BG and CD drawn.
 TikZ-mappable specifics: A at top, B at bottom-right, C at bottom-left (right-angle square at C). Square ABED on hypotenuse AB (outside triangle, on far side from C). Square ACGF on leg AC (outside triangle, on far side from B). Square BCHK on leg BC (outside triangle, on far side from A). Line CL from C through M on AB to L on DE, perpendicular to AB. Auxiliary segments BG and CD drawn.]

**প্রমাণ:**

ধাপ ১. $\triangle CAD$ ও $\triangle BAF$ এ $CA = AF, AD = AB$ এবং

অন্তর্ভুক্ত $\angle CAD = \angle CAB + \angle BAD = \angle CAB + \angle CAF = $ অন্তর্ভুক্ত $\angle BAF$

$[\angle BAD = \angle CAF = 1$ সমকোণ$]$

অতএব, $\triangle CAD \cong \triangle BAF$

ধাপ ২. $AB$ ও আয়তক্ষেত্র $ADLM$ একই ভূমি $AD$ এর উপর এবং $AD$ ও $CL$ সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত।

সুতরাং আয়তক্ষেত্র $ADLM = 2 \triangle CAD$ [অনুসিদ্ধান্ত ২]

ধাপ ৩. $\triangle BAF$ ও বর্গক্ষেত্র $ACGF$ একই ভূমি $AF$ এর উপর এবং $AF$ ও $BG$ সমান্তরাল রেখাযুগলের মধ্যে অবস্থিত।

সুতরাং বর্গক্ষেত্র $ACGF = 2 \triangle FAB = 2 \triangle CAD$ [অনুসিদ্ধান্ত ২]

ধাপ ৪. আয়তক্ষেত্র $ADLM = $ বর্গক্ষেত্র $ACGF$

ধাপ ৫. অনুরূপভাবে $C, E$ ও $A, K$ যোগ করে প্রমাণ করা যায় যে,

আয়তক্ষেত্র $BELM = $ বর্গক্ষেত্র $BCHK$

ধাপ ৬. আয়তক্ষেত্র $(ADLM + BELM) = $ বর্গক্ষেত্র $ACGF + $ বর্গক্ষেত্র $BCHK$

বা, বর্গক্ষেত্র $ABED = $ বর্গক্ষেত্র $ACGF + $ বর্গক্ষেত্র $BCHK$

অর্থাৎ, $AB^2 = BC^2 + AC^2$ (প্রমাণিত)

## ১৫.৩ সম্পাদ্য (ক্ষেত্রফল সমান অঙ্কন)

### সম্পাদ্য ১৩.

এমন একটি সামান্তরিক আঁকতে হবে, যার একটি কোণ একটি নির্দিষ্ট কোণের সমান এবং যা দ্বারা সীমাবদ্ধ ক্ষেত্র একটি ত্রিভুজক্ষেত্রের ক্ষেত্রফলের সমান।

মনে করি, $ABC$ একটি নির্দিষ্ট ত্রিভুজক্ষেত্র এবং $\angle x$ একটি নির্দিষ্ট কোণ। এরূপ সামান্তরিক আঁকতে হবে, যার একটি কোণ $\angle x$ এর সমান এবং যা দ্বারা সীমাবদ্ধ ক্ষেত্রের ক্ষেত্রফল $\triangle ABC$ এর ক্ষেত্রফলের সমান।

[Figure: Triangle ABC and a constructed parallelogram ECGF with equal area.
 Natural description: A triangle ABC and a parallelogram ECGF constructed such that the parallelogram has the same area as the triangle and one angle equal to ∠x.
 TikZ-mappable specifics: Triangle ABC at left (A top, B bottom-left, C bottom-right). Auxiliary point E (midpoint of BC). Parallelogram ECGF: E bottom-left, C bottom-right, G top-right, F top-left. ∠FEC = ∠x marked at E.]

**অঙ্কন:** $BC$ বাহুকে $E$ বিন্দুতে সমদ্বিখণ্ডিত করি। $EC$ রেখাংশের $E$ বিন্দুতে $\angle x$ এর সমান $\angle CEF$ আঁকি। $A$ বিন্দু দিয়ে $BC$ বাহুর সমান্তরাল $AG$ রশ্মি টানি এবং মনে করি তা $EF$ রশ্মিকে $F$ বিন্দুতে ছেদ করে। $C$ বিন্দু দিয়ে $EF$ রেখাংশের সমান্তরাল $CG$ রশ্মি টানি এবং মনে করি তা $AG$ রশ্মিকে $G$ বিন্দুতে ছেদ করে। তাহলে, $ECGF$ ই উদ্দিষ্ট সামান্তরিক।

**প্রমাণ:** $A, E$ যোগ করি।

এখন, $\triangle ABE$ এর ক্ষেত্রফল $= \triangle AEC$ এর ক্ষেত্রফল [যেহেতু ভূমি $BE = $ ভূমি $EC$ এবং উভয়ের একই উচ্চতা]

$\therefore \triangle ABC$ এর ক্ষেত্রফল $= 2 \triangle AEC$ এর ক্ষেত্রফল

আবার, সামান্তরিক ক্ষেত্র $ECGF$ এর ক্ষেত্রফল $= 2 \triangle AEC$ এর ক্ষেত্রফল [যেহেতু উভয়ই একই ভূমি $EC$ এর উপর অবস্থিত এবং $EC \parallel AG$]

$\therefore$ সামান্তরিক ক্ষেত্র $ECGF$ এর ক্ষেত্রফল $= \triangle ABC$ এর ক্ষেত্রফল

আবার, $\angle CEF = \angle x$ [যেহেতু $EF \parallel CG$, অঙ্কন অনুসারে]

$\therefore$ সামান্তরিক $ECGF$ ই নির্ণেয় সামান্তরিক।

### সম্পাদ্য ১৪.

এমন একটি ত্রিভুজ আঁকতে হবে যা দ্বারা সীমাবদ্ধ ক্ষেত্রের ক্ষেত্রফল একটি নির্দিষ্ট চতুর্ভুজক্ষেত্রের ক্ষেত্রফলের সমান।

মনে করি, $ABCD$ চতুর্ভুজক্ষেত্র। এরূপ একটি ত্রিভুজ আঁকতে হবে যা দ্বারা সীমাবদ্ধ ক্ষেত্রের ক্ষেত্রফল $ABCD$ চতুর্ভুজক্ষেত্রের ক্ষেত্রফলের সমান।

[Figure: Quadrilateral ABCD and a constructed triangle ADE with equal area.
 Natural description: Quadrilateral ABCD with a triangle ADE constructed such that the triangle has the same area as the quadrilateral.
 TikZ-mappable specifics: Quadrilateral ABCD with A bottom-left, B bottom-right, C top-right, D top-left. Diagonal BD drawn. From C, line CE drawn parallel to DB meeting extension of AB at E. Triangle ADE with vertices A, D, E.]

**অঙ্কন:** $D, B$ যোগ করি। $C$ বিন্দু দিয়ে $CE \parallel DB$ টানি। মনে করি, তা $AB$ বাহুর বর্ধিতাংশকে $E$ বিন্দুতে ছেদ করে। $D, E$ যোগ করি। তাহলে, $\triangle DAE$ ই উদ্দিষ্ট ত্রিভুজ।

**প্রমাণ:** $BD$ ভূমির উপর $\triangle BDC$ ও $\triangle BDE$ অবস্থিত এবং $DB \parallel CE$ [অঙ্কন অনুসারে]

$\therefore \triangle BDC$ এর ক্ষেত্রফল $= \triangle BDE$ এর ক্ষেত্রফল

$\therefore \triangle BDC$ এর ক্ষেত্রফল $+ \triangle ABD$ এর ক্ষেত্রফল $= \triangle BDE$ এর ক্ষেত্রফল $+ \triangle ABD$ এর ক্ষেত্রফল

$\therefore$ চতুর্ভুজক্ষেত্র $ABCD$ এর ক্ষেত্রফল $= \triangle ADE$ এর ক্ষেত্রফল

অতএব, $\triangle ADE$ ই নির্ণেয় ত্রিভুজ।

**বিশেষ দ্রষ্টব্য:** উপরের পদ্ধতির সাহায্যে নির্দিষ্ট চতুর্ভুজক্ষেত্রের ক্ষেত্রফলের সমান ক্ষেত্রফল বিশিষ্ট অসংখ্য ত্রিভুজক্ষেত্র আঁকা যায়।

### সম্পাদ্য ১৫.

এমন একটি সামান্তরিক আঁকতে হবে যার একটি কোণ দেওয়া আছে এবং যা দ্বারা সীমাবদ্ধ ক্ষেত্র একটি নির্দিষ্ট চতুর্ভুজক্ষেত্রের ক্ষেত্রফলের সমান।

[Figure: Construction of a parallelogram with given angle and area equal to a given quadrilateral.
 Natural description: A given quadrilateral ABCD and a constructed parallelogram with one angle equal to ∠x and area equal to the quadrilateral.
 TikZ-mappable specifics: Quadrilateral ABCD with diagonal BD. From C, line CF parallel to DB meeting extension of AB at F (forming triangle equal in area). Then parallelogram constructed with one angle = ∠x. Auxiliary points G, H, K marked.]

মনে করি, $ABCD$ একটি নির্দিষ্ট চতুর্ভুজক্ষেত্র এবং $\angle x$ একটি নির্দিষ্ট কোণ। এরূপ একটি সামান্তরিক আঁকতে হবে যার একটি কোণ প্রদত্ত $\angle x$ এর সমান এবং সীমাবদ্ধ ক্ষেত্রের ক্ষেত্রফল $ABCD$ ক্ষেত্রের ক্ষেত্রফলের সমান।

**অঙ্কন:** $B, D$ যোগ করি। $C$ বিন্দু দিয়ে $CF \parallel DB$ টানি এবং মনে করি, $CF, AB$ বাহুর বর্ধিতাংশকে $F$ বিন্দুতে ছেদ করে। $AF$ রেখাংশের মধ্যবিন্দু $G$ নির্ণয় করি। $AG$ রেখাংশের $G$ বিন্দুতে $\angle x$ এর সমান $\angle AGK$ আঁকি এবং $G$ বিন্দু দিয়ে $GH \parallel AK$ টানি। $D$ বিন্দু দিয়ে $AF$ এর সমান্তরাল $KDH \parallel AG$ টানি এবং তা $AK$ ও $GH$ কে যথাক্রমে $K$ ও $H$ বিন্দুতে ছেদ করে। তাহলে, $AGHK$ ই উদ্দিষ্ট সামান্তরিক।

**প্রমাণ:** $D, F$ যোগ করি। $AGHK$ একটি সামান্তরিক [অঙ্কন অনুসারে]

যেখানে, $\angle GAK = \angle x$। আবার, $\triangle DAF$ এর ক্ষেত্রফল $= $ চতুর্ভুজক্ষেত্র $ABCD$ এর ক্ষেত্রফল এবং সামান্তরিক ক্ষেত্র $AGHK$ এর ক্ষেত্রফল $= \triangle DAF$ এর ক্ষেত্রফল।

অতএব, $AGHK$ ই নির্ণেয় সামান্তরিক।

## অনুশীলনী ১৫

**১।** ত্রিভুজের তিনটি বাহুর দৈর্ঘ্য দেওয়া আছে; নিচের কোন ক্ষেত্রে সমকোণী ত্রিভুজ অঙ্কন সম্ভব নয়?
- ক) $3$ সে.মি., $4$ সে.মি., $5$ সে.মি.
- খ) $6$ সে.মি., $8$ সে.মি., $10$ সে.মি.
- গ) $5$ সে.মি., $7$ সে.মি., $9$ সে.মি. ঘ) $5$ সে.মি., $12$ সে.মি., $13$ সে.মি.

**২।** প্রমাণ করো যে, ত্রিভুজের যে কোনো মধ্যমা ত্রিভুজক্ষেত্রটিকে সমান ক্ষেত্রফল বিশিষ্ট দুইটি ত্রিভুজক্ষেত্রে বিভক্ত করে।

**৩।** প্রমাণ করো যে, কোনো বর্গক্ষেত্র তার কর্ণের উপর অঙ্কিত বর্গক্ষেত্রের অর্ধেক।

**৪।** প্রমাণ করো যে, সামান্তরিকের কর্ণদ্বয় সামান্তরিকক্ষেত্রটিকে চারটি সমান ত্রিভুজক্ষেত্রে বিভক্ত করে।

**৫।** একটি সামান্তরিকক্ষেত্র এবং সমান ক্ষেত্রফল বিশিষ্ট একটি আয়তক্ষেত্র একই ভূমির উপর এবং এর একই পাশে অবস্থিত। দেখাও যে, সামান্তরিকক্ষেত্রটির পরিসীমা আয়তক্ষেত্রটির পরিসীমা অপেক্ষা বড়।

**৬।** প্রমাণ করো যে, $\triangle ABC$ এর $AB$ ও $AC$ বাহুদ্বয়ের মধ্যবিন্দু যথাক্রমে $X$ ও $Y$। প্রমাণ কর যে, $\triangle AXY$ এর ক্ষেত্রফল $= \dfrac{1}{4} \triangle ABC$ এর ক্ষেত্রফল।

**৭।** $ABCD$ একটি ট্রাপিজিয়াম। যার $AB$ ও $CD$ বাহু দুইটি সমান্তরাল। ট্রাপিজিয়ামক্ষেত্র $ABCD$ এর ক্ষেত্রফল নির্ণয় করো।

**৮।** সামান্তরিক $ABCD$ এর অভ্যন্তরে $P$ যেকোনো একটি বিন্দু। প্রমাণ করো যে, $\triangle PAB$ এর ক্ষেত্রফল $+ \triangle PCD$ এর ক্ষেত্রফল $= \dfrac{1}{2}$ (সামান্তরিকক্ষেত্র $ABCD$ এর ক্ষেত্রফল)।

**৯।** $\triangle ABC$ এ $BC$ ভূমির সমান্তরাল যেকোনো সরলরেখা $AB$ ও $AC$ বাহুকে যথাক্রমে $D$ ও $E$ বিন্দুতে ছেদ করে। প্রমাণ করো যে, $\triangle DBC = \triangle EBC$ এবং $\triangle DBE = \triangle CDE$।

**১০।** $ABC$ ত্রিভুজের $\angle A =$ এক সমকোণ। $D, AC$ এর উপরস্থ একটি বিন্দু। প্রমাণ করো যে, $BC^2 + AD^2 = BD^2 + AC^2$।

**১১।** $ABC$ একটি সমদ্বিবাহু সমকোণী ত্রিভুজ। $BC$ এর অতিভুজ এবং $P, BC$ এর উপর যেকোনো বিন্দু। প্রমাণ করো যে, $PB^2 + PC^2 = 2 PA^2$।

**১২।** $\triangle ABC$ এর $\angle C$ স্থূলকোণ, $AD, BC$ এর উপর লম্ব। দেখাও যে, $AB^2 = AC^2 + BC^2 + 2BC \cdot CD$।

**১৩।** $\triangle ABC$ এর $\angle C$ সূক্ষ্মকোণ, $AD, BC$ এর উপর লম্ব। দেখাও যে, $AB^2 = AC^2 + BC^2 - 2BC \cdot CD$।

**১৪।** $ABCD$ সামান্তরিকের $AB = 5$ সে.মি., $AD = 4$ সে.মি. এবং $\angle BAD = 75°$। অপর একটি সামান্তরিক $APML$ এর $\angle LAP = 60°$ এবং $\triangle AED$ এর ক্ষেত্রফল ও $APML$ সামান্তরিকের ক্ষেত্রফল $ABCD$ সামান্তরিকের ক্ষেত্রফলের সমান।
- ক) পেঁসিল, কম্পাস ও স্কেল ব্যবহার করে $\angle BAD$ আঁকো।
- খ) $\triangle AED$ অঙ্কন করো। [অঙ্কনের চিহ্ন ও বিবরণ আবশ্যক]।
- গ) $APML$ সামান্তরিকটি অঙ্কন করো। [অঙ্কনের চিহ্ন ও বিবরণ আবশ্যক]।

## নমুনা প্রশ্ন

### বহুনির্বাচনি প্রশ্ন

**১।** একটি সমকোণী ত্রিভুজের দুইটি বাহু $12$ ও $13$ সে.মি.। অপর বাহুর দৈর্ঘ্য কত সে. মি. হলে ত্রিভুজটি আঁকা সম্ভব?
- ক) $17$
- খ) $15$
- গ) $9$
- ঘ) $5$

**২।** সমতলীয় জ্যামিতিতে—
- $(i)\,$ প্রত্যেক সীমাবদ্ধ সমতলক্ষেত্রের নির্দিষ্ট ক্ষেত্রফল রয়েছে।
- $(ii)\,$ দুইটি ত্রিভুজক্ষেত্র সমান হলেই ত্রিভুজ দুইটি সর্বসম।
- $(iii)\,$ দুইটি ত্রিভুজ সর্বসম হলে এদের ক্ষেত্রফল সমান।

নিচের কোনটি সঠিক?
- ক) $i$ ও $ii$
- খ) $i$ ও $iii$
- গ) $ii$ ও $iii$
- ঘ) $i, ii$ ও $iii$

পাশের চিত্রে, $\triangle ABC$ সমবাহু, $AD \perp BC$ এবং $AB = 2$ উপর্যুক্ত তথ্যের ভিত্তিতে ৩ ও ৪ নং প্রশ্নের উত্তর দাও:

[Figure: Equilateral triangle ABC with altitude AD perpendicular to BC.
 Natural description: An equilateral triangle ABC with side AB = 2, and AD is the altitude from A perpendicular to BC at D.
 TikZ-mappable specifics: Equilateral triangle ABC with A at top, B at bottom-left, C at bottom-right. AB = AC = BC = 2. Altitude AD from A perpendicular to BC meets BC at D (midpoint of BC). Right-angle square at D. D is between B and C with BD = DC = 1.]

**৩।** $BD = $ কত?
- ক) $1$
- খ) $\sqrt{2}$
- গ) $2$
- ঘ) $4$

**৪।** ত্রিভুজটির উচ্চতা কত?
- ক) $\dfrac{4}{\sqrt{3}}$
- খ) $\sqrt{3}$
- গ) $\dfrac{2}{\sqrt{3}}$
- ঘ) $2\sqrt{3}$

### সৃজনশীল প্রশ্ন

**৫।** $\triangle PQR$ এ $QD$ একটি মধ্যমা।
- ক) $ABC$ সমবাহু ত্রিভুজের $AD \perp BC$ হলে, $\triangle ABD : \triangle ACD$ নির্ণয় করো।
- খ) প্রমাণ করো, $PQ^2 + QR^2 = 2(PD^2 + QD^2)$।
- গ) যদি $PQ = QR = PR$ হয়, তাহলে প্রমাণ করো, $4QD^2 = 3PQ^2$।

### সংক্ষিপ্ত-উত্তর প্রশ্ন

**৬।** ক) একজোড়া সমান্তরাল রেখার মধ্যে অবস্থিত একটি সামান্তরিক ও একটি ত্রিভুজের ক্ষেত্রফল সমান হলে, সামান্তরিকটির ভূমি ও ত্রিভুজটির ভূমির দৈর্ঘ্যের অনুপাত নির্ণয় করো।

খ) কোনো বর্গক্ষেত্রের ক্ষেত্রফল এবং এর কর্ণের উপর অঙ্কিত বর্গক্ষেত্রের ক্ষেত্রফলের অনুপাত নির্ণয় করো।

গ) $\triangle ABC$-এর $AB = AC$ এবং $AD \perp BC$ হলে, $\triangle ABD : \triangle ACD$ নির্ণয় করো।

ঘ) কোন সমকোণী ত্রিভুজের অতিভুজ $10$ সে.মি. এবং ভূমি $8$ সে.মি, হলে, এর ক্ষেত্রফল নির্ণয় করো।

> **OCR Quality Notes (Pass 2 @ 15-18x scale):**
> - All 3 theorems (উপপাদ্য ৩৬-৩৮) preserved with statements and full proofs (including Pythagoras geometric proof with three squares)
> - 3 সম্পাদ্য (সম্পাদ্য ১৩, ১৪, ১৫) with full অঙ্কন ও প্রমাণ steps
> - 2 অনুসিদ্ধান্ত (corollaries) captured
> - 1 অনুশীলনী (১৫: ১৪ items) + নমুনা প্রশ্ন
> - **All geometric figures rendered as TikZ-friendly [Figure: ...] placeholders** with vertex placement, parallel-line marks, right-angle squares, equal-area markings — sufficient for redrawing
>
> **Items flagged for further verification (preserved as-read):**
> - *[verify]* অনুশীলনী ১৫ #১: option (গ) "$5, 7, 9$" — to check whether this can form a right triangle (it cannot: $5^2 + 7^2 = 74 ≠ 81$), so this is the correct "not possible" answer
> - *[verify]* উপপাদ্য ৩৮ proof: square labels $ABED, ACGF, BCHK$ — orientation/winding direction depends on figure convention
> - *[verify]* নমুনা প্রশ্ন #১: "$12$ ও $13$" sides — if $13$ is hypotenuse and $12$ is leg, third leg = $\sqrt{169-144} = 5$ → answer ঘ; if both $12, 13$ are legs, hypotenuse = $\sqrt{313}$ (not integer)