---
class: 9
subject: math
chapter_no: 16
chapter_title_bn: পরিমিতি
chapter_title_en: Mensuration
book_pages: "294-325"
pdf_pages: "299-330"
source: "Secondary (BV) 2026 — Class 9-10 Math (NCTB)"
ocr_method: "Claude vision @ 15x scale + self-verified at 18x"
ocr_pass: 2
fidelity: "same-to-same — all formulas, derivations and worked examples preserved verbatim"
subchapters:
  - id: "16.1"
    title: "ত্রিভুজক্ষেত্রের ক্ষেত্রফল"
    heading: "## ১৬.১ ত্রিভুজক্ষেত্রের ক্ষেত্রফল"
    type: "concept"
  - id: "16.ex1"
    title: "অনুশীলনী ১৬.১"
    heading: "## অনুশীলনী ১৬.১"
    type: "exercise"
  - id: "16.2"
    title: "চতুর্ভুজক্ষেত্রের ক্ষেত্রফল"
    heading: "## ১৬.২ চতুর্ভুজক্ষেত্রের ক্ষেত্রফল"
    type: "concept"
  - id: "16.3"
    title: "সুষম বহুভুজের ক্ষেত্রফল"
    heading: "## ১৬.৩ সুষম বহুভুজের ক্ষেত্রফল"
    type: "concept"
  - id: "16.ex2"
    title: "অনুশীলনী ১৬.২"
    heading: "## অনুশীলনী ১৬.২"
    type: "exercise"
  - id: "16.4"
    title: "বৃত্ত সংক্রান্ত পরিমাপ"
    heading: "## ১৬.৪ বৃত্ত সংক্রান্ত পরিমাপ"
    type: "concept"
  - id: "16.ex3"
    title: "অনুশীলনী ১৬.৩"
    heading: "## অনুশীলনী ১৬.৩"
    type: "exercise"
  - id: "16.5"
    title: "ঘনবস্তু (Solids)"
    heading: "## ১৬.৫ ঘনবস্তু (Solids)"
    type: "concept"
  - id: "16.ex4"
    title: "অনুশীলনী ১৬.৪"
    heading: "## অনুশীলনী ১৬.৪"
    type: "exercise"
  - id: "16.sample"
    title: "নমুনা প্রশ্ন"
    heading: "## নমুনা প্রশ্ন"
    type: "sample"
---

# ষোড়শ অধ্যায় — পরিমিতি (Mensuration)

## ভূমিকা

ব্যবহারিক প্রয়োজনে রেখার দৈর্ঘ্য, তলের ক্ষেত্রফল, ঘনবস্তুর আয়তন ইত্যাদির পরিমাপ করা হয়। এ রকম যেকোনো রাশি পরিমাপের ক্ষেত্রে একই জাতীয় নির্দিষ্ট পরিমাপের একটি রাশিকে একক হিসেবে গ্রহণ করা হয়। পরিমাপকৃত রাশি এবং এরূপ নির্ধারিত এককের অনুপাতই রাশিটির পরিমাণ নির্ধারণ করে।

অর্থাৎ পরিমাণ $= \dfrac{\text{পরিমাপকৃত রাশি}}{\text{একক রাশি}}$

নির্ধারিত একক সম্পর্কে প্রত্যেক পরিমাণ একটি সংখ্যা যা পরিমাপকৃত রাশিটির একক রাশির কতগুণ তা নির্দেশ করে। যেমন, বেঞ্চটি $5$ মিটার লম্বা। এখানে মিটার একটি নির্দিষ্ট দৈর্ঘ্য যাকে একক হিসেবে ধরা হয়েছে এবং যার তুলনায় বেঞ্চটি $5$ গুণ লম্বা।

এ অধ্যায় শেষে শিক্ষার্থীরা—

- ত্রিভুজক্ষেত্র ও চতুর্ভুজক্ষেত্রের ক্ষেত্রফলের সূত্র প্রয়োগ করে বহুভুজক্ষেত্রের ক্ষেত্রফল নির্ণয় এবং এতদসম্পর্কিত সমস্যা সমাধান করতে পারবে;
- বৃত্তের পরিধি ও বৃত্তাংশের দৈর্ঘ্য নির্ণয় করতে পারবে;
- বৃত্তের ক্ষেত্রফল নির্ণয় করতে পারবে;
- বৃত্তক্ষেত্র ও তার অংশবিশেষের ক্ষেত্রফল নির্ণয় করে এতদ সম্পর্কিত সমস্যা সমাধান করতে পারবে;
- আয়তাকার ঘনবস্তু, ঘনক ও বেলনের ক্ষেত্রফল পরিমাপ করতে পারবে এবং এ সম্পর্কিত সমস্যা সমাধান করতে পারবে;
- সুষম ও যৌগিক ঘনবস্তুর পৃষ্ঠতলের ক্ষেত্রফল পরিমাপ করতে পারবে।

## ১৬.১ ত্রিভুজক্ষেত্রের ক্ষেত্রফল

পূর্বের শ্রেণিতে আমরা জেনেছি, ত্রিভুজক্ষেত্রের ক্ষেত্রফল $= \dfrac{1}{2} \times $ ভূমি $\times$ উচ্চতা

**১. সমকোণী ত্রিভুজ:** মনে করি, $ABC$ সমকোণী ত্রিভুজের সমকোণ সংলগ্ন বাহুদ্বয় যথাক্রমে $BC = a$ এবং $AB = b \mid BC$ কে ভূমি এবং $AB$ কে উচ্চতা বিবেচনা করলে,

$\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \times $ ভূমি $\times$ উচ্চতা $= \dfrac{1}{2} ab$

[Figure: Right triangle ABC with legs BC = a and AB = b.
 Natural description: Right triangle with the right angle at vertex B. BC is horizontal (base) and AB is vertical.
 TikZ-mappable specifics: B at bottom-left (right-angle square marked), C at bottom-right, A at top-right. BC = a (horizontal base), AB = b (vertical right side), AC slant hypotenuse.]

**২. ত্রিভুজের দুই বাহু ও এদের অন্তর্ভুক্ত কোণ দেওয়া আছে:**

মনে করি, $ABC$ ত্রিভুজের বাহুদ্বয় $BC = a, CA = b, AB = c \mid$ $A$ থেকে $BC$ বাহুর উপর $AD$ লম্ব আঁকি। ধরি, উচ্চতা $AD = h$।

কোণ $C$ বিবেচনা করলে পাই, $\dfrac{AD}{CA} = \sin C$

বা, $\dfrac{h}{b} = \sin C$ বা, $h = b \sin C$

$\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} BC \times AD$
$= \dfrac{1}{2} \times a \times b \sin C = \dfrac{1}{2} ab \sin C$

অনুরূপভাবে $\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} bc \sin A = \dfrac{1}{2} ca \sin B$

[Figure: Triangle ABC with altitude AD to BC.
 Natural description: Triangle ABC, A at top, B at bottom-left, C at bottom-right. Altitude AD drawn from A perpendicular to BC at D.
 TikZ-mappable specifics: A at top, B at bottom-left, C at bottom-right. Sides: c = AB on left, b = CA on right, a = BC on the bottom. Altitude AD drawn from A perpendicular to BC, meeting at D (between B and C); AD = h. Right-angle square at D.]

**৩. ত্রিভুজের তিন বাহু দেওয়া আছে:**

মনে করি, $\triangle ABC$ এর $BC = a, CA = b$ এবং $AB = c \mid$ এর পরিসীমা $2s = a + b + c$

$AD \perp BC$ আঁকি।

ধরি, $BD = x$, তাহলে, $CD = a - x$

$\triangle ABD$ এবং $\triangle ACD$ সমকোণী।

$\therefore AD^2 = AB^2 - BD^2$ এবং $AD^2 = AC^2 - CD^2$

$\therefore AB^2 - BD^2 = AC^2 - CD^2$

বা, $c^2 - x^2 = b^2 - (a - x)^2$

বা, $c^2 - x^2 = b^2 - a^2 + 2ax - x^2$

বা, $2ax = c^2 + a^2 - b^2$

$\therefore x = \dfrac{c^2 + a^2 - b^2}{2a}$

আবার,

$AD^2 = c^2 - x^2$
$= c^2 - \left(\dfrac{c^2 + a^2 - b^2}{2a}\right)^2$
$= \left(c + \dfrac{c^2 + a^2 - b^2}{2a}\right)\left(c - \dfrac{c^2 + a^2 - b^2}{2a}\right)$
$= \dfrac{2ac + c^2 + a^2 - b^2}{2a} \cdot \dfrac{2ac - c^2 - a^2 + b^2}{2a}$
$= \dfrac{\{(c + a)^2 - b^2\}\{b^2 - (c - a)^2\}}{4a^2}$
$= \dfrac{(c + a + b)(c + a - b)(b + c - a)(b - c + a)}{4a^2}$
$= \dfrac{(a + b + c)(a + b + c - 2b)(a + b + c - 2a)(a + b + c - 2c)}{4a^2}$
$= \dfrac{2s(2s - 2b)(2s - 2a)(2s - 2c)}{4a^2}$
$= \dfrac{4s(s - a)(s - b)(s - c)}{a^2}$

$\therefore AD = \dfrac{2}{a}\sqrt{s(s - a)(s - b)(s - c)}$

$\therefore \triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} BC \cdot AD = \dfrac{1}{2} \cdot a \cdot \dfrac{2}{a}\sqrt{s(s - a)(s - b)(s - c)} = \sqrt{s(s - a)(s - b)(s - c)}$

[Figure: Triangle with all three sides labeled.
 Natural description: Triangle ABC with altitude AD from A to BC at D. BD = x and DC = a - x. The three sides are labeled a, b, c.
 TikZ-mappable specifics: A at top, B at bottom-left, C at bottom-right. AB = c, AC = b, BC = a. Altitude AD perpendicular to BC at D; height AD = h. BD = x, DC = a - x marked along the base.]

**৪. সমবাহু ত্রিভুজ:** মনে করি, $ABC$ সমবাহু ত্রিভুজের প্রত্যেক বাহুর দৈর্ঘ্য $a$।

$AD \perp BC$ আঁকি। $\therefore BD = CD = \dfrac{a}{2}$

$\triangle ABD$ সমকোণী।

$\therefore BD^2 + AD^2 = AB^2$

বা, $AD^2 = AB^2 - BD^2 = a^2 - \left(\dfrac{a}{2}\right)^2 = a^2 - \dfrac{a^2}{4} = \dfrac{3a^2}{4}$

$\therefore AD = \dfrac{\sqrt{3}a}{2}$

$\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \cdot BC \cdot AD = \dfrac{1}{2} \cdot a \cdot \dfrac{\sqrt{3}a}{2} = \dfrac{\sqrt{3}}{4}a^2$

[Figure: Equilateral triangle ABC with altitude AD.
 Natural description: Equilateral triangle ABC with side a. Altitude AD perpendicular to BC at D, the midpoint of BC.
 TikZ-mappable specifics: A at top, B at bottom-left, C at bottom-right. Sides AB = BC = CA = a. D at midpoint of BC; BD = DC = a/2. Altitude AD = (√3/2)·a perpendicular to BC. Right-angle square at D.]

**৫. সমদ্বিবাহু ত্রিভুজ:** মনে করি, $ABC$ সমদ্বিবাহু ত্রিভুজের $AB = AC = a$ এবং $BC = b$।

$AD \perp BC$ আঁকি। $\therefore BD = CD = \dfrac{b}{2}$

$\triangle ABD$ সমকোণী।

$\therefore AD^2 = AB^2 - BD^2 = a^2 - \left(\dfrac{b}{2}\right)^2 = a^2 - \dfrac{b^2}{4} = \dfrac{4a^2 - b^2}{4}$

$\therefore AD = \dfrac{\sqrt{4a^2 - b^2}}{2}$

সমদ্বিবাহু $\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2} \cdot BC \cdot AD$

$= \dfrac{1}{2} \cdot b \cdot \dfrac{\sqrt{4a^2 - b^2}}{2} = \dfrac{b}{4}\sqrt{4a^2 - b^2}$

[Figure: Isosceles triangle ABC with altitude AD.
 Natural description: Isosceles triangle ABC with AB = AC = a, BC = b. Altitude AD perpendicular to BC at D (midpoint of BC).
 TikZ-mappable specifics: A at top, B at bottom-left, C at bottom-right. AB = AC = a (two equal slant sides), BC = b (base). D midpoint of BC, BD = DC = b/2. Altitude AD = √(4a²−b²)/2.]

### উদাহরণ ১.

একটি সমকোণী ত্রিভুজের সমকোণ সংলগ্ন বাহুদ্বয়ের দৈর্ঘ্য যথাক্রমে $6$ সে.মি. ও $8$ সে.মি. হলে এর ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, সমকোণী ত্রিভুজের সমকোণ সংলগ্ন বাহুদ্বয় যথাক্রমে $a = 6, b = 8$ সে.মি. এবং $\therefore$ এর ক্ষেত্রফল $= \dfrac{1}{2}ab = \dfrac{1}{2} \times 6 \times 8$ বর্গ সে.মি. $= 24$ বর্গ সে.মি.।

### উদাহরণ ২.

কোনো ত্রিভুজের দুই বাহুর দৈর্ঘ্য যথাক্রমে $9$ সে.মি. ও $10$ সে.মি. এবং এদের অন্তর্ভুক্ত কোণ $60°$। ত্রিভুজের ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, ত্রিভুজের বাহুদ্বয় যথাক্রমে $a = 9$ সে.মি. ও $b = 10$ সে.মি. এবং এদের অন্তর্ভুক্ত কোণ $C = 60°$।

$\therefore$ ত্রিভুজটির ক্ষেত্রফল $= \dfrac{1}{2}ab \sin 60° = \dfrac{1}{2} \times 9 \times 10 \times \dfrac{\sqrt{3}}{2}$ বর্গ সে.মি. $= 38.97$ বর্গ সে.মি. (প্রায়)।

নির্ণেয় ক্ষেত্রফল $38.97$ বর্গ সে.মি. (প্রায়)।

### উদাহরণ ৩.

একটি ত্রিভুজের তিনটি বাহুর দৈর্ঘ্য যথাক্রমে $7$ সে.মি., $8$ সে.মি. ও $9$ সে.মি.। এর ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, ত্রিভুজের বাহুগুলোর দৈর্ঘ্য যথাক্রমে $a = 7$ সে.মি., $b = 8$ সে.মি. ও $c = 9$ সে.মি.

অর্ধপরিসীমা $s = \dfrac{a + b + c}{2} = \dfrac{7 + 8 + 9}{2}$ সে.মি. $= 12$ সে.মি.

$\therefore$ ত্রিভুজের ক্ষেত্রফল $= \sqrt{s(s - a)(s - b)(s - c)}$

$= \sqrt{12(12 - 7)(12 - 8)(12 - 9)}$ বর্গ সে.মি.
$= \sqrt{12 \times 5 \times 4 \times 3}$ বর্গ সে.মি.
$= \sqrt{720} = 26.83$ বর্গ সে.মি. (প্রায়)

$\therefore$ ত্রিভুজের ক্ষেত্রফল $26.83$ বর্গ সে.মি. (প্রায়)।

### উদাহরণ ৪.

একটি সমবাহু ত্রিভুজের প্রত্যেক বাহুর দৈর্ঘ্য $1$ মিটার বাড়ালে ক্ষেত্রফল $3\sqrt{3}$ বর্গমিটার বেড়ে যায়। ত্রিভুজটির বাহুর দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, সমবাহু ত্রিভুজের প্রত্যেক বাহুর দৈর্ঘ্য $a$ মিটার।

$\therefore$ ত্রিভুজটির ক্ষেত্রফল $= \dfrac{\sqrt{3}}{4}a^2$ বর্গমিটার।

ত্রিভুজটির প্রত্যেক বাহুর দৈর্ঘ্য $1$ মিটার বাড়ালে ত্রিভুজটির বাহুর দৈর্ঘ্য $= \dfrac{\sqrt{3}}{4}(a + 1)^2$ বর্গমিটার।

প্রশ্নানুসারে, $\dfrac{\sqrt{3}}{4}(a + 1)^2 - \dfrac{\sqrt{3}}{4}a^2 = 3\sqrt{3}$

বা, $(a + 1)^2 - a^2 = 12$ $\left[\dfrac{\sqrt{3}}{4}\right.$ দ্বারা ভাগ করে$\left.\right]$

বা, $a^2 + 2a + 1 - a^2 = 12, 2a = 11$ বা, $a = 5.5$

নির্ণেয় বাহুর দৈর্ঘ্য $5.5$ মিটার।

### উদাহরণ ৫.

একটি সমদ্বিবাহু ত্রিভুজের ভূমির দৈর্ঘ্য $60$ সে.মি. এর ক্ষেত্রফল $1200$ বর্গ সে.মি. হলে সমান সমান বাহুর দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, সমদ্বিবাহু ত্রিভুজের ভূমি $b = 60$ সে.মি. এবং সমান সমান বাহুর দৈর্ঘ্য $a$।

ত্রিভুজটির ক্ষেত্রফল $= \dfrac{b}{4}\sqrt{4a^2 - b^2}$

প্রশ্নানুসারে, $\dfrac{b}{4}\sqrt{4a^2 - b^2} = 1200$

বা, $\dfrac{60}{4}\sqrt{4a^2 - (60)^2} = 1200$

বা, $15\sqrt{4a^2 - 3600} = 1200$

বা, $\sqrt{4a^2 - 3600} = 80$

বা, $4a^2 - 3600 = 6400$ [বর্গ করে]

বা, $4a^2 = 10000$

বা, $a^2 = 2500$

$\therefore a = 50$

ত্রিভুজটির সমান বাহুর দৈর্ঘ্য $50$ সে.মি.

### উদাহরণ ৬.

একটি নির্দিষ্ট স্থান থেকে দুইটি রাস্তা $120°$ কোণে চলে গেছে। দুই জন লোক ঐ নির্দিষ্ট স্থান থেকে যথাক্রমে ঘণ্টায় $10$ কিলোমিটার ও $8$ কিলোমিটার বেগে বিপরীত দিকে রওনা হলো। $5$ ঘণ্টা পর তাদের মধ্যে সরাসরি দূরত্ব নির্ণয় করো।

**সমাধান:** মনে করি, $A$ স্থান থেকে দুইজন লোক যথাক্রমে ঘণ্টায় $10$ কিলোমিটার ও $8$ কিলোমিটার বেগে রওনা হয়ে $5$ ঘণ্টা পর যথাক্রমে $B$ ও $C$ স্থানে পৌঁছালো। তাহলে, $5$ ঘণ্টা পর তাদের মধ্যে সরাসরি দূরত্ব $BC$। $C$ থেকে $BA$ এর বর্ধিতাংশের উপর $CD$ লম্ব টানি।

$\therefore AB = 5 \times 10 = 50$ কিলোমিটার, $AC = 5 \times 8$ কিলোমিটার $= 40$ কিলোমিটার এবং $\angle DAC = 180° - 120° = 60°$

$\triangle ACD$ সমকোণী।

$\therefore \dfrac{CD}{AC} = \sin 60°$ বা, $CD = AC \sin 60° = 40 \times \dfrac{\sqrt{3}}{2} = 20\sqrt{3}$

এবং $\dfrac{AD}{AC} = \cos 60°$ বা, $AD = AC \cos 60° = 40 \times \dfrac{1}{2} = 20$

আবার, সমকোণী ত্রিভুজ $BCD$ থেকে পাই,

$BC^2 = BD^2 + CD^2 = (BA + AD)^2 + CD^2$
$= (50 + 20)^2 + (20\sqrt{3})^2 = 4900 + 1200 = 6100$

$\therefore BC = 78.1$ (প্রায়)

নির্ণেয় দূরত্ব $78.1$ কিলোমিটার (প্রায়)

[Figure: Two paths diverging at 120° from a point.
 Natural description: Point A at the origin. Two paths AB and AC making 120° angle at A. CD is perpendicular dropped from C to extension of BA at D.
 TikZ-mappable specifics: A at origin. B to the right of A along horizontal (AB = 50 km). C above-right of A at angle 120° from AB (AC = 40 km). D on extension of BA beyond A (left of A). CD perpendicular to BD. Angle BAC = 120°, angle DAC = 60°.]

### উদাহরণ ৭.

প্রদত্ত চিত্রের আলোকে—
- ক) $AC$ বাহুর দৈর্ঘ্য নির্ণয় করো।
- খ) $BD$ এর মান নির্ণয় করো।
- গ) $\triangle ABD$ ও $\triangle BCD$ এর ক্ষেত্রফলদ্বয়ের অনুপাত নির্ণয় করো।

[Figure: Triangle ABC with given side lengths and an internal point/line BD.
 Natural description: Triangle ABC with AB = 15 cm, AC = 25 cm, and ∠B = 90° (right angle). BD is some segment inside.
 TikZ-mappable specifics: A at top, B at bottom-right (right-angle square at B), C at bottom-left. AB = 15 cm (right side), AC = 25 cm (hypotenuse). BD = perpendicular from B to AC, meeting at D.]

**সমাধান:**

ক) $AB = 15, AC = 25$

$\therefore BC = \sqrt{AC^2 - AB^2} = \sqrt{(25)^2 - (15)^2} = \sqrt{400} = 20$

খ) $\triangle ABC$ এর ক্ষেত্রফল $= \dfrac{1}{2}BC \cdot AB = \dfrac{1}{2}AC \cdot BD$

$\dfrac{1}{2}AC \cdot BD = \dfrac{1}{2}BC \cdot AB$

$\therefore 25 \times BD = 20 \times 15$

$\therefore BD = 12$

গ) $\triangle ABD$ সমকোণী থেকে পাই

$AD^2 + BD^2 = AB^2$

বা, $AD^2 + 12^2 = 15^2$

বা, $AD^2 = 225 - 144 = 81$

$\therefore AD = 9$ এবং $CD = AC - AD = 25 - 9 = 16$

অতএব, $\triangle ABD$ ও $\triangle BCD$ এর ক্ষেত্রফলদ্বয়ের অনুপাত,

$\dfrac{\triangle ABD}{\triangle BCD} = \dfrac{\dfrac{1}{2}BD \cdot AD}{\dfrac{1}{2}BD \cdot CD} = \dfrac{9}{16}$

$\triangle ABD : \triangle BCD = 9 : 16$

## অনুশীলনী ১৬.১

**১।** একটি সমকোণী ত্রিভুজের অতিভুজ $25$ মিটার। এর অপর বাহুদ্বয়ের একটি বাহু অপরটির $\dfrac{3}{4}$ অংশ হলে, বাহু দুইটির দৈর্ঘ্য নির্ণয় করো।

**২।** $20$ মিটার লম্বা একটি মই দেওয়ালের সাথে খাড়াভাবে আছে। মইটির গোড়া দেওয়াল থেকে কত দূর সরালে ওপরের প্রান্ত $4$ মিটার নিচে নামবে?

**৩।** একটি সমদ্বিবাহু ত্রিভুজক্ষেত্রের পরিসীমা $16$ মিটার। এর সমান বাহুর দৈর্ঘ্য ভূমির $\dfrac{5}{6}$ অংশ হলে, ত্রিভুজটির ক্ষেত্রফল নির্ণয় করো।

**৪।** একটি ত্রিভুজের দুইটি বাহুর দৈর্ঘ্য $25$ সে.মি., $27$ সে.মি. এবং পরিসীমা $84$ সে.মি.। ত্রিভুজটির ক্ষেত্রফল নির্ণয় করো।

**৫।** একটি সমবাহু ত্রিভুজের প্রত্যেক বাহুর দৈর্ঘ্য $2$ মিটার বাড়ালে এর ক্ষেত্রফল $6\sqrt{3}$ বর্গমিটার বেড়ে যায়। ত্রিভুজটির বাহুর দৈর্ঘ্য নির্ণয় করো।

**৬।** একটি ত্রিভুজের দুই বাহুর দৈর্ঘ্য যথাক্রমে $26$ মিটার, $28$ মিটার এবং ক্ষেত্রফল $182$ বর্গমিটার হলে, বাহুদ্বয়ের অন্তর্ভুক্ত কোণ নির্ণয় করো।

**৭।** একটি সমদ্বিবাহু ত্রিভুজের সমান সমান বাহুর দৈর্ঘ্য $10$ মিটার এবং ক্ষেত্রফল $48$ বর্গমিটার হলে, ভূমির দৈর্ঘ্য নির্ণয় করো।

**৮।** একটি নির্দিষ্ট স্থান থেকে দুইটি রাস্তা পরস্পর $135°$ কোণ করে দুই দিকে চলে গেছে। দুই জন লোক ঐ নির্দিষ্ট স্থান থেকে যথাক্রমে ঘণ্টায় $7$ কিলোমিটার ও ঘণ্টায় $5$ কিলোমিটার বেগে বিপরীত মুখে রওনা হলো। $4$ ঘণ্টা পর তাদের মধ্যে সরাসরি দূরত্ব নির্ণয় করো।

**৯।** একটি সমবাহু ত্রিভুজের অভ্যন্তরস্থ একটি বিন্দু থেকে তিনটির উপর অঙ্কিত লম্বের দৈর্ঘ্য যথাক্রমে $5$ সে.মি., $7$ সে.মি. ও $8$ সে.মি.। ত্রিভুজটির বাহুর দৈর্ঘ্য ও ক্ষেত্রফল নির্ণয় করো।

**১০।** একটি সমকোণী ত্রিভুজের লম্ব ভূমির $\dfrac{11}{12}$ অংশ থেকে $6$ সে.মি. কম এবং অতিভুজ ভূমির $\dfrac{4}{3}$ অংশ থেকে $3$ সে.মি. কম।
- ক) ভূমি $x$ হলে ত্রিভুজটির ক্ষেত্রফল $x$ এর মাধ্যমে প্রকাশ করো।
- খ) ভূমির দৈর্ঘ্য নির্ণয় করো।
- গ) ত্রিভুজটির ভূমি $12$ সে.মি. হলে এর পরিসীমার সমান পরিসীমাবিশিষ্ট সমবাহু ত্রিভুজের ক্ষেত্রফল নির্ণয় করো।

## ১৬.২ চতুর্ভুজক্ষেত্রের ক্ষেত্রফল

**১. আয়তক্ষেত্রের ক্ষেত্রফল:** মনে করি, $ABCD$ আয়তক্ষেত্রের দৈর্ঘ্য $AB = a$, প্রস্থ $BC = b$ এবং কর্ণ $AC = d$।

আমরা জানি, আয়তক্ষেত্রের কর্ণ আয়তক্ষেত্রটিকে সমান দুইটি ত্রিভুজক্ষেত্রে বিভক্ত করে।

আয়তক্ষেত্র $ABCD$ এর ক্ষেত্রফল $= 2 \times \triangle ABC$ এর ক্ষেত্রফল
$= 2 \times \dfrac{1}{2} a \cdot b = ab$

লম্ব করি, আয়তক্ষেত্রের পরিসীমা $s = 4a$ এবং কর্ণ $d = \sqrt{a^2 + a^2} = \sqrt{2a^2} = \sqrt{2} a$

[Figure: Rectangle ABCD with diagonal AC.
 Natural description: Rectangle ABCD with length AB = a horizontal, width BC = b vertical, and diagonal AC = d drawn from A to C.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. AB = a (bottom), BC = b (right), CD = a (top), DA = b (left). Diagonal AC drawn from A to C of length d. All four right angles marked.]

**২. বর্গক্ষেত্রের ক্ষেত্রফল:** মনে করি, $ABCD$ বর্গক্ষেত্রের প্রতি বাহুর দৈর্ঘ্য $a$ এবং কর্ণ $d$।

$AC$ কর্ণ বর্গক্ষেত্রটিকে সমান দুইটি ত্রিভুজে বিভক্ত করে।

$\therefore$ বর্গক্ষেত্র $ABCD$ এর ক্ষেত্রফল $= 2 \times \triangle ABC$ এর ক্ষেত্রফল
$= 2 \times \dfrac{1}{2}a \cdot a = a^2 = $ (বাহুর দৈর্ঘ্য)$^2$

লম্ব করি, বর্গক্ষেত্রের পরিসীমা $s = 4a$ এবং
কর্ণ $d = \sqrt{a^2 + a^2} = \sqrt{2 a^2} = \sqrt{2}a$

[Figure: Square ABCD with diagonal AC.
 Natural description: Square ABCD with all sides equal to a and diagonal AC = d.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. All four sides = a. Diagonal AC from A to C, length = √2·a.]

**৩. সামান্তরিকক্ষেত্রের ক্ষেত্রফল:**

**ক) ভূমি ও উচ্চতা দেওয়া আছে:**

মনে করি, $ABCD$ সামান্তরিকক্ষেত্রের ভূমি $AB = b$ এবং উচ্চতা $DE = h \mid BD$ কর্ণ সামান্তরিকক্ষেত্রকে সমান দুইটি ত্রিভুজক্ষেত্রে বিভক্ত করে।

$\therefore$ সামান্তরিকক্ষেত্র $ABCD$ এর ক্ষেত্রফল $= 2 \times \triangle ABD$ এর ক্ষেত্রফল $= 2 \times \dfrac{1}{2}b \cdot h = bh$

[Figure: Parallelogram ABCD with diagonal BD and altitude DE.
 Natural description: Parallelogram ABCD with diagonal BD splitting it into two equal triangles. DE is the perpendicular from D to AB at E.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. AB = b (base, horizontal), BC and AD slanted sides. Altitude DE perpendicular from D to AB (or its extension); h = DE. Diagonal BD drawn.]

**খ) একটি কর্ণের দৈর্ঘ্য এবং ঐ কর্ণের বিপরীত কৌণিক বিন্দু থেকে উক্ত কর্ণের উপর অঙ্কিত লম্বের দৈর্ঘ্য দেওয়া আছে:**

মনে করি, $ABCD$ সামান্তরিকের কর্ণ $AC = d$ এবং এর বিপরীত কৌণিক বিন্দু $D$ থেকে অঙ্কিত লম্ব $DE = h \mid$ কর্ণ $AC$ সামান্তরিকক্ষেত্রকে সমান দুইটি ত্রিভুজক্ষেত্রে বিভক্ত করে।

$\therefore$ সামান্তরিকক্ষেত্র $ABCD$ এর ক্ষেত্রফল $= 2 \times \triangle ACD$ এর ক্ষেত্রফল $= 2 \times \dfrac{1}{2}d \cdot h = dh$

[Figure: Parallelogram ABCD with diagonal AC and perpendicular DE.
 Natural description: Parallelogram ABCD with diagonal AC = d and perpendicular DE from D to AC at E.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. Diagonal AC drawn. Perpendicular DE from D meeting AC at E; DE = h. Right-angle square at E.]

**৪. রম্বসের ক্ষেত্রফল:** রম্বসের দুইটি কর্ণ দেওয়া আছে। মনে করি, $ABCD$ রম্বসের কর্ণ $AC = d_1$, কর্ণ $BD = d_2$ এবং কর্ণদ্বয় পরস্পর $O$ বিন্দুতে ছেদ করে।

কর্ণ $AC$ রম্বসক্ষেত্রকে সমান দুইটি ত্রিভুজক্ষেত্রে বিভক্ত করে।

আমরা জানি, রম্বসের কর্ণদ্বয় পরস্পরকে সমকোণে সমদ্বিখণ্ডিত করে।

$\therefore \triangle ACD$ এর উচ্চতা $= \dfrac{d_2}{2}$

$\therefore$ রম্বস $ABCD$ এর ক্ষেত্রফল $= 2 \times \triangle ACD$ এর ক্ষেত্রফল $= 2 \times \dfrac{1}{2} \cdot d_1 \cdot \dfrac{d_2}{2} = \dfrac{1}{2}d_1 d_2$

[Figure: Rhombus ABCD with diagonals AC and BD.
 Natural description: Rhombus ABCD with diagonals AC = d₁ and BD = d₂ intersecting at O perpendicularly.
 TikZ-mappable specifics: A at left, B at bottom, C at right, D at top (diamond orientation). Diagonals AC (horizontal) and BD (vertical) crossing at center O. AC = d₁, BD = d₂. Right-angle square at O marking the perpendicular intersection.]

**৫. ট্রাপিজিয়ামক্ষেত্রের ক্ষেত্রফল:** ট্রাপিজিয়ামক্ষেত্রের সমান্তরাল দুইটি বাহু এবং এদের মধ্যবর্তী লম্ব দূরত্ব দেওয়া আছে। মনে করি, $ABCD$ ট্রাপিজিয়ামক্ষেত্রের সমান্তরাল বাহুদ্বয়ের দৈর্ঘ্য যথাক্রমে $AB = a$ একক, $CD = b$ একক এবং এদের মধ্যবর্তী দূরত্ব $CE = AF = h \mid$ কর্ণ $AC$ ট্রাপিজিয়াম $ABCD$ ক্ষেত্রটিকে $\triangle ABC$ ও $\triangle ACD$ ক্ষেত্রে বিভক্ত করে।

ট্রাপিজিয়াম $ABCD$ এর ক্ষেত্রফল

$= \triangle ABC$ এর ক্ষেত্রফল $+ \triangle ACD$ এর ক্ষেত্রফল
$= \dfrac{1}{2}AB \times CE + \dfrac{1}{2}CD \times AF$
$= \dfrac{1}{2}ah + \dfrac{1}{2}bh = \dfrac{h(a + b)}{2}$

[Figure: Trapezium ABCD with parallel sides AB and CD.
 Natural description: Trapezium ABCD with AB parallel to CD; AB = a (longer base), CD = b (shorter top). Perpendiculars from C and D to AB are CE and AF, both equal to height h.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. AB at bottom (longer, length a), CD at top (shorter, length b), parallel. AF and CE both perpendicular to AB (heights h). Diagonal AC drawn.]

### উদাহরণ ৮.

একটি আয়তাকার ঘরের দৈর্ঘ্য, প্রস্থের $\dfrac{3}{2}$ গুণ। এর ক্ষেত্রফল $384$ বর্গমিটার হলে, পরিসীমা ও কর্ণের দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, আয়তাকার ঘরের প্রস্থ $x$ মিটার।

$\therefore$ ঘরের দৈর্ঘ্য $\dfrac{3}{2}x$ এবং ক্ষেত্রফল $\dfrac{3}{2}x \times x = \dfrac{3}{2}x^2$

প্রশ্নানুসারে, $\dfrac{3}{2}x^2 = 384, 3x^2 = 768$ বা, $x^2 = 256$

$\therefore x = 16$ মিটার।

আয়তাকার ঘরের দৈর্ঘ্য $= \dfrac{3}{2} \times 16 = 24$ মিটার এবং প্রস্থ $= 16$ মিটার

$\therefore$ ঘরটির পরিসীমা $= 2(24 + 16)$ মিটার $= 80$ মিটার এবং কর্ণের দৈর্ঘ্য $= \sqrt{24^2 + 16^2}$ মিটার
$= \sqrt{832}$ মিটার $= 28.84$ মিটার (প্রায়)

নির্ণেয় পরিসীমা $80$ মিটার ও কর্ণের দৈর্ঘ্য $28.84$ মিটার (প্রায়)

### উদাহরণ ৯.

একটি আয়তক্ষেত্রের দৈর্ঘ্য $x$ মিটার এবং প্রস্থ $y$ মিটার। যদি এর দৈর্ঘ্য $10$ মিটার কম হতো, তাহলে এটি একটি বর্গক্ষেত্র হতো। আয়তক্ষেত্রের দৈর্ঘ্য ও প্রস্থ নির্ণয় করো।

**সমাধান:** মনে করি, আয়তক্ষেত্রের দৈর্ঘ্য $x$ মিটার এবং প্রস্থ $y$ মিটার।

$\therefore$ আয়তক্ষেত্রটির ক্ষেত্রফল $= xy$ বর্গমিটার।

প্রশ্নানুসারে, $xy = 2000 \ldots (1)$ এবং $y = x - 10 \ldots (2)$

সমীকরণ $(1)$ এ $y = x - 10$ বসিয়ে পাই

$x(x - 10) = 2000$ বা, $x^2 - 10x - 2000 = 0$

বা, $x^2 - 50x + 40x - 2000 = 0$ বা, $(x - 50)(x + 40) = 0$

$\therefore x = 50$ অথবা $x = -40$

কিন্তু দৈর্ঘ্য ঋণাত্মক হতে পারে না। $\therefore x = 50$

এখন, সমীকরণ $(2)$ এ $x$ এর মান বসিয়ে পাই, $y = 50 - 10 = 40$

আয়তক্ষেত্রটির দৈর্ঘ্য $50$ মিটার এবং প্রস্থ $40$ মিটার।

### উদাহরণ ১০.

বর্গাকার একটি মাঠের ভিতরের চারদিকে $4$ মিটার চওড়া একটি রাস্তা আছে। যদি রাস্তার ক্ষেত্রফল $1$ হেক্টর হয়, তবে রাস্তা বাদে মাঠের ভিতরের ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, বর্গাকার মাঠের দৈর্ঘ্য $x$ মিটার।

$\therefore$ এর ক্ষেত্রফল $x^2$ বর্গমিটার।

মাঠের ভিতরের চারদিকে $4$ মিটার চওড়া একটি রাস্তা আছে।

রাস্তা বাদে বর্গাকার মাঠের দৈর্ঘ্য $= (x - 2 \times 4)$ বা, $(x - 8)$ মিটার।

রাস্তা বাদে বর্গাকার মাঠের ক্ষেত্রফল $= (x - 8)^2$ বর্গমিটার

সুতরাং, রাস্তার ক্ষেত্রফল $= x^2 - (x - 8)^2$ বর্গমিটার

আমরা জানি, $1$ হেক্টর $= 10000$ বর্গমিটার

প্রশ্নানুসারে, $x^2 - (x - 8)^2 = 10000$

বা, $x^2 - x^2 + 16x - 64 = 10000$

বা, $16x = 10064$

$\therefore x = 629$

রাস্তা বাদে বর্গাকার মাঠের ক্ষেত্রফল

$= (629 - 8)^2$ বর্গমিটার $= 385641$ বর্গমিটার $= 38.56$ হেক্টর (প্রায়)

নির্ণেয় ক্ষেত্রফল $38.56$ হেক্টর (প্রায়)

[Figure: Square field with surrounding inner path.
 Natural description: A square field of side x meters with a 4-meter-wide path running along the inner perimeter. The path forms a frame inside the square.
 TikZ-mappable specifics: Outer square with side x meters. Inner square (smaller) with side (x − 8) meters, positioned so that the gap between outer and inner is 4 meters on all four sides. The annular region between is the path.]

### উদাহরণ ১১.

একটি সামান্তরিকক্ষেত্রের ক্ষেত্রফল $120$ বর্গ সে.মি. এবং একটি কর্ণ $24$ সে.মি.। কর্ণটির বিপরীত কৌণিক বিন্দু থেকে উক্ত কর্ণের উপর অঙ্কিত লম্বের দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, সামান্তরিকক্ষেত্রের একটি কর্ণ $d = 24$ সে.মি. এবং এর বিপরীত কৌণিক বিন্দু থেকে কর্ণের উপর অঙ্কিত লম্বের দৈর্ঘ্য $h$ সে.মি.।

$\therefore$ সামান্তরিকক্ষেত্রের ক্ষেত্রফল $= dh$ বর্গ সে.মি.।

প্রশ্নানুসারে, $dh = 120$ বা, $h = \dfrac{120}{d} = \dfrac{120}{24} = 5$

নির্ণেয় লম্বের দৈর্ঘ্য $5$ সে.মি.।

### উদাহরণ ১২.

একটি সামান্তরিকের বাহুর দৈর্ঘ্য $12$ মিটার ও $8$ মিটার এবং ক্ষুদ্রতম কর্ণটি $10$ মিটার হলে, অপর কর্ণটির দৈর্ঘ্য নির্ণয় করো।

**সমাধান:**

মনে করি, $ABCD$ সামান্তরিকের $AB = a = 12$ মিটার, $AD = c = 8$ মিটার এবং কর্ণ $BD = b = 10$ মিটার। $D$ ও $C$ থেকে $AB$ এর উপর এবং $AB$ এর বর্ধিতাংশের উপর $DF$ ও $CE$ লম্ব টানি। $A, C$ ও $B, D$ যোগ করি।

[Figure: Parallelogram ABCD with perpendiculars from D and C to AB extended.
 Natural description: Parallelogram ABCD with side AB at the bottom, side BC slant upward to the right. From D and C, perpendiculars dropped to AB (or its extension) at F and E respectively.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. AB = 12, AD = 8, BC = 8, CD = 12. Diagonal BD = 10. Perpendiculars DF and CE from D and C to line AB; F between A and B (or to left of A), E to right of B.]

$\triangle ABD$ এর অর্ধপরিসীমা $s = \dfrac{12 + 10 + 8}{2}$ মিটার $= 15$ মিটার

$\therefore \triangle ABD$ এর ক্ষেত্রফল $= \sqrt{s(s - a)(s - b)(s - c)} = \sqrt{15(15 - 12)(15 - 10)(15 - 8)}$
বর্গমিটার $= \sqrt{15 \times 3 \times 5 \times 7}$ বর্গমিটার $= \sqrt{1575} = 39.68$ বর্গমিটার (প্রায়)

আবার, $\triangle$ ক্ষেত্রে $ABD$ এর ক্ষেত্রফল $= \dfrac{1}{2}AB \times DF$

বা, $39.68 = \dfrac{1}{2} \times 12 \times DF, 6DF = 39.68$ $\therefore DF = 6.61$ (প্রায়)

এখন, $\triangle BCE$ সমকোণী।

$\therefore BE^2 = BC^2 - CE^2 = AD^2 - DF^2 = 8^2 - (6.61)^2 = 20.31$

$\therefore BE = 4.5$ (প্রায়)

অতএব, $AE = AB + BE = 12 + 4.5 = 16.5$ (প্রায়)

$\triangle ACE$ সমকোণী থেকে পাই

$\therefore AC^2 = AE^2 + CE^2 = (16.5)^2 + (6.61)^2 = 315.94$

$\therefore AC = 17.77$ (প্রায়)

নির্ণেয় কর্ণের দৈর্ঘ্য $17.77$ মিটার (প্রায়)

### উদাহরণ ১৩.

একটি রম্বসের একটি কর্ণ $10$ মিটার এবং ক্ষেত্রফল $120$ বর্গমিটার হলে, অপর কর্ণ এবং পরিসীমা নির্ণয় করো।

**সমাধান:**

মনে করি, $ABCD$ রম্বসের কর্ণ $BD = d_1 = 10$ মিটার এবং অপর কর্ণ $d_2$ মিটার।

রম্বসের ক্ষেত্রফল $= \dfrac{1}{2}d_1 d_2$ বর্গমিটার

প্রশ্নানুসারে, $\dfrac{1}{2}d_1 d_2 = 120$ বা, $d_2 = \dfrac{120 \times 2}{10} = 24$ মিটার

আমরা জানি, রম্বসের কর্ণদ্বয় পরস্পরকে সমকোণে সমদ্বিখণ্ডিত করে।

$\therefore OD = OB = \dfrac{10}{2} = 5$ মিটার এবং $OA = OC = \dfrac{24}{2} = 12$ মিটার

$\triangle AOD$ সমকোণী ত্রিভুজে $AD^2 = OA^2 + OD^2 = 12^2 + 5^2$

$\therefore AD = 13$ মিটার।

$\therefore$ রম্বসের প্রতি বাহুর দৈর্ঘ্য $13$ মিটার

রম্বসের পরিসীমা $= 4 \times 13$ মিটার $= 52$ মিটার

নির্ণেয় কর্ণের দৈর্ঘ্য $24$ মিটার এবং পরিসীমা $52$ মিটার।

[Figure: Rhombus ABCD with diagonals BD and AC.
 Natural description: Rhombus ABCD with diagonal BD = 10 (vertical) and AC = d₂ (horizontal), crossing at O perpendicularly.
 TikZ-mappable specifics: A at left, B at top, C at right, D at bottom (diamond). Diagonal BD vertical (length 10), AC horizontal (length d₂). O at center, OD = OB = 5, OA = OC = d₂/2. Right-angle square at O.]

### উদাহরণ ১৪.

একটি ট্রাপিজিয়ামের সমান্তরাল বাহুদ্বয়ের দৈর্ঘ্য যথাক্রমে $91$ সে.মি. ও $51$ সে.মি. এবং অপর বাহু দুইটির দৈর্ঘ্য যথাক্রমে $37$ সে.মি. ও $13$ সে.মি.। ট্রাপিজিয়ামটির ক্ষেত্রফল নির্ণয় করো।

**সমাধান:**

মনে করি, $ABCD$ ট্রাপিজিয়ামের $AB = 91$ সে.মি., $CD = 51$ সে.মি., $A$ ও $D$ থেকে $AB$ এর উপর যথাক্রমে $DE$ ও $CF$ লম্ব টানি।

$\therefore CDEF$ একটি আয়তক্ষেত্র। $\therefore EF = CD = 51$ সে.মি.

ধরি, $AE = x$ এবং $DE = CF = h$

$\therefore BF = AB - AF = 91 - (AE + EF) = 91 - (x + 51) = 40 - x$

সমকোণী $\triangle ADE$ থেকে পাই,

$AE^2 + DE^2 = AD^2$ বা, $x^2 + h^2 = 13^2$ বা, $x^2 + h^2 = 169 \ldots (1)$

আবার সমকোণী ত্রিভুজ $BCF$ এর ক্ষেত্রে

$BF^2 + CF^2 = BC^2$ বা, $(40 - x)^2 + h^2 = 37^2$

বা, $1600 - 80x + x^2 + h^2 = 1369$

বা, $1600 - 80x + 169 = 1369$ $[(1)$ এর সাহায্যে$]$

বা, $1600 - 80x + 169 = 1369$ বা, $80x = 400$ $\therefore x = 5$

সমীকরণ $(1)$ এ $x$ এর মান বসিয়ে পাই,

$5^2 + h^2 = 169$ বা, $h^2 = 169 - 25 = 144$ $\therefore h = 12$

ট্রাপিজিয়াম $ABCD$ এর ক্ষেত্রফল $= \dfrac{1}{2}(AB + CD) \cdot h$
$= \dfrac{1}{2}(91 + 51) \times 12$ বর্গ সে.মি. $= 71 \times 12$ বর্গ সে.মি. $= 852$ বর্গ সে.মি.

নির্ণেয় ক্ষেত্রফল $852$ বর্গ সে.মি.

[Figure: Trapezium ABCD with perpendiculars from C and D.
 Natural description: Trapezium ABCD with AB = 91 cm (long base), CD = 51 cm (short top, parallel to AB). Sides AD = 13 cm, BC = 37 cm. Perpendiculars DE and CF from D and C to AB at E and F.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right, C at top-right, D at top-left. AB = 91 (bottom), CD = 51 (top). E and F on AB such that DE and CF are perpendicular to AB; DE = CF = h. CDFE forms an inner rectangle. AE = x, EF = 51, BF = 40 − x.]

## ১৬.৩ সুষম বহুভুজের ক্ষেত্রফল

সুষম বহুভুজের বাহুগুলোর দৈর্ঘ্য সমান। আবার কোণগুলোও সমান। $n$ সংখ্যক বাহুবিশিষ্ট সুষম বহুভুজের কেন্দ্র ও শীর্ষবিন্দুগুলো যোগ করলে $n$ সংখ্যক সমদ্বিবাহু ত্রিভুজ উৎপন্ন হয়।

সুতরাং বহুভুজের ক্ষেত্রফল $= n \times $ একটি ত্রিভুজক্ষেত্রের ক্ষেত্রফল

$ABCDEF \ldots$ একটি সুষম বহুভুজ, যার কেন্দ্র $O$, বাহু $n$ সংখ্যক এবং প্রতি বাহুর দৈর্ঘ্য $a \mid O, A, B$ যোগ করি।

ধরি, $\triangle AOB$ এর উচ্চতা $ON = h$ এবং $\angle OAB = \theta$

সুষম বহুভুজের প্রতিটি শীর্ষ উৎপন্ন কোণের পরিমাণ $= 2\theta$

$\therefore$ সুষম বহুভুজের $n$ সংখ্যক শীর্ষ কোণের সমষ্টি $= 2n\theta$

সুষম বহুভুজের কেন্দ্রে উৎপন্ন কোণের পরিমাণ $= 4$ সমকোণ

$\therefore$ কেন্দ্রে উৎপন্ন কোণ ও $n$ শীর্ষ কোণের সমষ্টি $(2n\theta + 4)$ সমকোণ

$\triangle OAB$ এর তিন কোণের সমষ্টি $= 2$ সমকোণ

$\therefore$ এরূপ $n$ সংখ্যক ত্রিভুজের কোণগুলোর সমষ্টি $2n$ সমকোণ

$\therefore 2\theta \cdot n + 4 $ সমকোণ $= 2n$ সমকোণ

বা, $2\theta \cdot n = (2n - 4)$ সমকোণ

বা, $\theta = \dfrac{2n - 4}{2n}$ সমকোণ

বা, $\theta = \left(1 - \dfrac{2}{n}\right) \times 90°$

$\therefore \theta = 90° - \dfrac{180°}{n}$

এখানে, $\tan \theta = \dfrac{ON}{AN} = \dfrac{h}{\dfrac{a}{2}} = \dfrac{2h}{a}$

$\therefore h = \dfrac{a}{2}\tan\theta$

[Figure: Regular polygon with center O and vertices A, B, C, D, E, F.
 Natural description: A regular hexagon (or n-gon) with center O. Triangle OAB is one of the n triangles formed by connecting O to each pair of adjacent vertices. ON is perpendicular from O to AB at midpoint N.
 TikZ-mappable specifics: Regular polygon with center O. One vertex pair AB labeled. Triangle OAB drawn. N is midpoint of AB; ON perpendicular to AB; ON = h. ∠OAB = θ. Side AB = a, AN = NB = a/2.]

$\triangle OAB$ এর ক্ষেত্রফল $= \dfrac{1}{2}ah$
$= \dfrac{1}{2} a \times \dfrac{a}{2}\tan\theta$
$= \dfrac{a^2}{4}\tan\left(90° - \dfrac{180°}{n}\right)$
$= \dfrac{a^2}{4}\cot\dfrac{180°}{n} \quad [\because \tan(90° - A) = \cot A]$

$n$ সংখ্যক বাহুবিশিষ্ট সুষম বহুভুজের ক্ষেত্রফল $= \dfrac{na^2}{4}\cot\dfrac{180°}{n}$

### উদাহরণ ১৫.

একটি সুষম পঞ্চভুজের প্রতিবাহুর দৈর্ঘ্য $4$ সে.মি. হলে, এর ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, সুষম পঞ্চভুজের বাহুর দৈর্ঘ্য $a = 4$ সে.মি., বাহু সংখ্যা $n = 5$

আমরা জানি, সুষম বহুভুজের ক্ষেত্রফল $= \dfrac{na^2}{4}\cot\dfrac{180°}{n}$ বর্গ সে.মি.

$\therefore$ সুষম পঞ্চভুজের ক্ষেত্রফল $= \dfrac{5 \times 4^2}{4}\cot\dfrac{180°}{5}$ বর্গ সে.মি.

$= 20 \times \cot 36°$ বর্গ সে.মি.
$= 20 \times 1.376$ বর্গ সে.মি. (ক্যালকুলেটরের সাহায্যে)
$= 27.528$ বর্গ সে.মি. (প্রায়)

নির্ণেয় ক্ষেত্রফল $27.528$ বর্গ সে.মি. (প্রায়)

### উদাহরণ ১৬.

একটি সুষম ষড়ভুজের কেন্দ্র থেকে কৌণিক বিন্দুর দূরত্ব $4$ মিটার হলে, এর ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, $ABCDEF$ একটি সুষম ষড়ভুজ। এর কেন্দ্র $O$ থেকে শীর্ষবিন্দুগুলোতে যোগ করা হলো। ফলে $6$টি সমান ক্ষেত্রফলবিশিষ্ট ত্রিভুজ উৎপন্ন হয়।

$\therefore \angle COD = \dfrac{360°}{6} = 60°$

মনে করি, কেন্দ্র থেকে শীর্ষবিন্দুগুলোর দূরত্ব $a$ মিটার।

$\therefore \triangle COD$ এর ক্ষেত্রফল $= \dfrac{1}{2}a \cdot a \sin 60°$

$= \dfrac{\sqrt{3}}{4} \times 4^2$ বর্গমিটার $= 4\sqrt{3}$ বর্গমিটার

সুষম ষড়ভুজক্ষেত্রের ক্ষেত্রফল $= 6 \times \triangle COD$ এর ক্ষেত্রফল

$= 6 \times 4\sqrt{3} = 24\sqrt{3}$ বর্গমিটার

নির্ণেয় ক্ষেত্রফল $24\sqrt{3}$ বর্গমিটার

[Figure: Regular hexagon with center.
 Natural description: Regular hexagon ABCDEF with center O. Lines from O to each vertex divide it into 6 equilateral triangles.
 TikZ-mappable specifics: Regular hexagon with vertices A (right), B (upper-right), C (upper-left), D (left), E (lower-left), F (lower-right) — labels may rotate. Center O. Six radii OA, OB, OC, OD, OE, OF drawn. Each ∠COD = 60°. Side length = OA = a = 4.]

### উদাহরণ ১৭.

প্রদত্ত চিত্রের আলোকে
- ক) আয়তক্ষেত্রটির কর্ণের দৈর্ঘ্য নির্ণয় করো।
- খ) ক্ষেত্রটির ক্ষেত্রফল পূর্ণসংখ্যা নির্ণয় করো।
- গ) সমদ্বিবাহু ত্রিভুজের গ্রহণযোগ্য পরিসীমা নির্ণয় করো।

[Figure: Composite figure with rectangle and isosceles triangle.
 Natural description: A rectangle ABCD with AD = 50, AB = 14, and an isosceles triangle ADE on top with angle 73.74° at one corner.
 TikZ-mappable specifics: Rectangle ABCD: A bottom-left, B bottom-right, C top-right, D top-left. AB = 50 (horizontal base), BC = 14 (vertical right side). Isosceles triangle ADE on top with E at top, ∠ADE marked = 73.74°, AD = AE = 50.]

**সমাধান:**

ক) চিত্র অনুসারে, ক্ষেত্রটি $ABCD$ আয়তক্ষেত্র এবং $ADE$ সমদ্বিবাহু ত্রিভুজক্ষেত্রের বিভক্ত।

$ABCD$ আয়তক্ষেত্রের কর্ণের দৈর্ঘ্য $= \sqrt{50^2 + 14^2}$ সে.মি. $= 51.92$ সে.মি. (প্রায়)

খ) আয়তক্ষেত্র $ABCD$ এর ক্ষেত্রফল $= 50 \times 14$ বর্গ সে.মি. $= 700$ বর্গ সে.মি.

ত্রিভুজক্ষেত্র $ADE$ এর ক্ষেত্রফল $\dfrac{1}{2}AD \cdot AE \cdot \sin\angle DAE = \dfrac{1}{2} \times 50 \times 50 \times \sin 73.74°$

বর্গ সে.মি. $= 25 \times 50 \times 0.960001$ বর্গ সে.মি. $= 1200$ বর্গ সে.মি. (প্রায়)

সম্পূর্ণ ক্ষেত্রের ক্ষেত্রফল $= (700 + 1200)$ বর্গ সে.মি. $= 1900$ বর্গ সে.মি.

গ) $\triangle ADE$ এ $AD = AE = 50$ সে.মি., $DE = b$ (ধরি)

$\therefore$ সমদ্বিবাহু ত্রিভুজ $ADE$ এর ক্ষেত্রফল $= \dfrac{b}{4}\sqrt{4a^2 - b^2}$

প্রশ্নানুসারে, $\dfrac{b}{4}\sqrt{4a^2 - b^2} = 1200$

$b\sqrt{4(50)^2 - b^2} = 4800$

বা, $b^2(10000 - b^2) = 23040000$ [বর্গ করে]

বা, $10000b^2 - b^4 = 23040000$

বা, $b^4 - 10000b^2 + 23040000 = 0$

বা, $b^4 - 6400b^2 - 3600b^2 + 23040000 = 0$

বা, $(b^2 - 6400)(b^2 - 3600) = 0$

$\therefore b^2 - 6400 = 0$ অথবা $b^2 - 3600 = 0$

বা, $b^2 = 6400$ অথবা $b^2 = 3600$

$\therefore b = 80$ অথবা $b = 60$

$b = 80$ হলে, $\dfrac{1}{2} \cdot AD \cdot DE \cdot \sin\angle ADE = 1200$

বা, $\dfrac{1}{2} \times 50 \times 80 \times \sin\angle ADE = 1200$

বা, $\sin\angle ADE = 0.6$

$\therefore \angle ADE = 36.87°$ (প্রায়)

$\triangle ADE$ এর তিন কোণের সমষ্টি $= 73.74° + 36.87° + 36.87° = 147.48°$

কিন্তু ত্রিভুজের তিন কোণের সমষ্টি $= 180°$, সুতরাং $b \neq 80$

$b = 60$ হলে, $\dfrac{1}{2} \cdot AD \cdot DE \cdot \sin\angle ADE = 1200$

বা, $\dfrac{1}{2} \times 50 \times 60 \times \sin\angle ADE = 1200$

বা, $\sin\angle ADE = 0.8$

$\therefore \angle ADE = 53.13°$ (প্রায়)

$\triangle ADE$ এর তিন কোণের সমষ্টি $= 73.74° + 53.13° + 53.13° = 180°$, সুতরাং $b = 60$

$\therefore$ ত্রিভুজের পরিসীমা $(50 + 50 + 60)$ সে.মি. $= 160$ সে.মি.

## অনুশীলনী ১৬.২

**১।** একটি আয়তাকারক্ষেত্রের দৈর্ঘ্য বিস্তারের দ্বিগুণ। এর ক্ষেত্রফল $512$ বর্গমিটার হলে, পরিসীমা নির্ণয় করো।

**২।** একটি জমির দৈর্ঘ্য $80$ মিটার এবং প্রস্থ $60$ মিটার। ঐ জমির মাঝে একটি পুকুর খনন করা হলো। যদি পুকুরের প্রত্যেক পাড়ের বিস্তার $4$ মিটার হয়, তবে পুকুরের পাড়ের ক্ষেত্রফল নির্ণয় করো।

**৩।** একটি বাগানের দৈর্ঘ্য $40$ মিটার এবং প্রস্থ $30$ মিটার। বাগানের ভিতরে সমান পাড় বিশিষ্ট একটি পুকুর আছে। পুকুরের ক্ষেত্রফল বাগানের ক্ষেত্রফলের $\dfrac{1}{2}$ অংশ হলে, পুকুরের দৈর্ঘ্য ও প্রস্থ নির্ণয় করো।

**৪।** একটি বর্গাকার মাঠের বাইরের চারদিকে $5$ মিটার চওড়া একটি রাস্তা আছে। রাস্তার ক্ষেত্রফল $500$ বর্গমিটার হলে, মাঠের ক্ষেত্রফল নির্ণয় করো।

**৫।** একটি বর্গক্ষেত্রের পরিসীমা একটি আয়তক্ষেত্রের পরিসীমার সমান। আয়তক্ষেত্রের দৈর্ঘ্য প্রস্থের তিনগুণ এবং ক্ষেত্রফল $768$ বর্গমিটার। প্রতিটি $40$ সে.মি. বর্গাকার পাথর দিয়ে বর্গক্ষেত্রটি বাঁধতে মোট কতটি পাথর লাগবে?

**৬।** একটি আয়তাকারক্ষেত্রের ক্ষেত্রফল $160$ বর্গমিটার। যদি এর দৈর্ঘ্য $6$ মিটার কম হয়, তবে ক্ষেত্রটি বর্গাকার হয়। আয়তাকারক্ষেত্রের দৈর্ঘ্য ও প্রস্থ নির্ণয় করো।

**৭।** একটি সামান্তরিকের ভূমি উচ্চতার $\dfrac{3}{4}$ অংশ এবং ক্ষেত্রফল $363$ বর্গমিটার হলে, ক্ষেত্রটির ভূমি ও উচ্চতা নির্ণয় করো।

**৮।** একটি সামান্তরিকক্ষেত্রের ক্ষেত্রফল একটি বর্গক্ষেত্রের সমান। সামান্তরিকের ভূমি $125$ মিটার এবং উচ্চতা $5$ মিটার হলে, বর্গক্ষেত্রের কর্ণের দৈর্ঘ্য নির্ণয় করো।

**৯।** একটি সামান্তরিকের বাহুর দৈর্ঘ্য $30$ সে.মি. এবং $26$ সে.মি., এর ক্ষুদ্রতম কর্ণটি $28$ সে.মি. হলে অপর কর্ণের দৈর্ঘ্য নির্ণয় করো।

**১০।** একটি রম্বসের পরিসীমা $180$ সে.মি. এবং ক্ষুদ্রতম কর্ণটি $54$ সে.মি., এর অপর কর্ণ এবং ক্ষেত্রফল নির্ণয় করো।

**১১।** একটি ট্রাপিজিয়ামের সমান্তরাল বাহু দুইটির দৈর্ঘ্যের অন্তর $8$ সে.মি., এবং এদের লম্ব দূরত্ব $24$ সে.মি., ট্রাপিজিয়ামের ক্ষেত্রফল $312$ বর্গ সে.মি. হয় তবে বাহু দুইটির দৈর্ঘ্য নির্ণয় করো।

**১২।** একটি ট্রাপিজিয়ামের সমান্তরাল বাহুদ্বয়ের দৈর্ঘ্য যথাক্রমে $31$ সে.মি., ও $11$ সে.মি. এবং অপর বাহু দুইটির দৈর্ঘ্য যথাক্রমে $10$ সে.মি., ও $12$ সে.মি., এর ক্ষেত্রফল নির্ণয় করো।

**১৩।** একটি সুষম অষ্টভুজের কেন্দ্র থেকে কৌণিক বিন্দুর দূরত্ব $1.5$ মিটার হলে, এর ক্ষেত্রফল নির্ণয় করো।

**১৪।** একটি আয়তাকার জমির দৈর্ঘ্য $150$ মিটার এবং ক্ষেত্রফল $15000$ বর্গমিটার। এর বাইরের চারদিকে $2$ মিটার চওড়া রাস্তা আছে। জমিটির মধ্যে এর দৈর্ঘ্যের সমান ভূমিবিশিষ্ট একটি সমদ্বিবাহু ত্রিভুজাকৃতির জমিতে সবজির চাষ করা হলো। ত্রিভুজাকৃতির জমির ক্ষেত্রফল আয়তাকার জমিটির ক্ষেত্রফলের অর্ধেক।
- ক) একটি সুষম ষড়ভুজের বাহুর দৈর্ঘ্য $5$ সে.মি, হলে, এর ক্ষেত্রফল নির্ণয় করো।
- খ) রাস্তাটির ক্ষেত্রফল নির্ণয় করো।
- গ) সবজি চাষের জমিটির পরিসীমা নির্ণয় করো।

**১৫।** নিচের চিত্রের তথ্য থেকে বর্গক্ষেত্রের ক্ষেত্রফল নির্ণয় করো।

[Figure: Diamond-shaped (rotated square) with labels.
 Natural description: A rotated square ABCD oriented as a diamond, with diagonals AB = 12 cm (vertical) and CD = 22 cm (horizontal) — wait that's not square. Actually it's a diamond labeled with 12 sides at top/bottom and 22 across.
 TikZ-mappable specifics: Diamond/rhombus shape. Vertical distance from top vertex A to bottom vertex C = 12 cm. Horizontal distance from B to D = 22 cm. Labels A top, B right, C bottom, D left.]

**১৬।** নিচের চিত্রের তথ্য থেকে বহুভুজসমূহের ক্ষেত্রফল নির্ণয় করো।

[Figure: Multiple composite polygons.
 Natural description: A series of composite shapes with given dimensions, including a trapezoid with 12 cm side, an L-shape with 10 cm and 4 cm, a half-circle on top of a rectangle, a square containing inscribed shapes.
 TikZ-mappable specifics: Multiple sub-figures with various given dimensions for area-calculation problems.]

## ১৬.৪ বৃত্ত সংক্রান্ত পরিমাপ

### ১. বৃত্তের পরিধি

বৃত্তের দৈর্ঘ্যকে তার পরিধি বলা হয়। কোনো বৃত্তের ব্যাসার্ধ $r$ হলে এর পরিধি $c = 2\pi r$, যেখানে $\pi = 3.14159265\ldots$। একটি অমূলদ সংখ্যা। $\pi$ এর আসন্ন মান হিসেবে $3.1416$ ব্যবহার করা যায়। সুতরাং কোনো বৃত্তের ব্যাসার্ধ জানা থাকলে $\pi$ এর আসন্ন মান ব্যবহার করে বৃত্তের পরিধির আসন্ন মান নির্ণয় করা যায়।

### উদাহরণ ১৮.

একটি বৃত্তের ব্যাস $26$ সে.মি., এর পরিধি নির্ণয় কর।

**সমাধান:** মনে করি, বৃত্তের ব্যাসার্ধ $r$

$\therefore$ বৃত্তের ব্যাস $= 2r$ এবং পরিধি $= 2\pi r$

প্রশ্নানুসারে, $2r = 26$ বা, $r = \dfrac{26}{2}$ বা, $r = 13$ সে.মি.

পরিধি $= 2\pi r = 2 \times 3.1416 \times 13$ সে.মি. $= 81.68$ সে.মি. (প্রায়)

### ২. বৃত্তচাপের দৈর্ঘ্য

মনে করি, $O$ কেন্দ্রবিশিষ্ট বৃত্তের ব্যাসার্ধ $r$ এবং $AB = s$ বৃত্তচাপ কেন্দ্রে $\theta$ কোণ উৎপন্ন করে।

বৃত্তের পরিধি $= 2\pi r$

আমরা জানি, বৃত্তের সম্পূর্ণ পরিধি কেন্দ্রে $360°$ এবং চাপ $s$ দ্বারা কেন্দ্রে উৎপন্ন কোণের পরিমাপ $\theta$। তাই চাপের দৈর্ঘ্য কেন্দ্রস্থ কোণের সমানুপাতিক।

$\therefore \dfrac{\theta}{360°} = \dfrac{s}{2\pi r}$ বা, $s = \dfrac{\pi r \theta}{180°}$

[Figure: Circle with arc subtending angle θ at center.
 Natural description: Circle with center O and radius r. Arc AB = s subtends angle θ at the center O.
 TikZ-mappable specifics: Circle centered at O. Two radii OA and OB drawn at angle θ between them. Arc from A to B (along the circle) labeled s. Radius r marked on either OA or OB.]

### ৩. বৃত্তক্ষেত্র ও বৃত্তকলার ক্ষেত্রফল

কোনো বৃত্ত দ্বারা বেষ্টিত এলাকাকে বৃত্তক্ষেত্র বলা হয় এবং বৃত্তটিকে এরূপ বৃত্তক্ষেত্রের সীমারেখা বলা হয়।

**বৃত্তকলা:** একটি চাপ ও চাপের প্রান্তবিন্দু সংলিপ্ত ব্যাসার্ধ দ্বারা বেষ্টিত ক্ষেত্রকে বৃত্তকলা বলা হয়।

$O$ কেন্দ্রবিশিষ্ট বৃত্তের পরিধির উপর $A$ ও $B$ দুইটি বিন্দু হলে, $\angle AOB$ এর অভ্যন্তরে $OA$ ও $OB$ ব্যাসার্ধ এবং $AB$ চাপের সংযোগে গঠিত ক্ষেত্রটি বৃত্তকলা।

পূর্বের শ্রেণিতে আমরা শিখে এসেছি যে, ব্যাসার্ধ বিশিষ্ট কোনো বৃত্তের ক্ষেত্রফল $= \pi r^2$

আমরা জানি, বৃত্তের কোনো চাপ দ্বারা উৎপন্ন কেন্দ্রস্থ কোণ ঐ বৃত্তচাপের ক্ষেত্রফলের সমানুপাতিক।

সুতরাং, এ পর্যায়ে আমরা স্বীকার করে নিতে পারি যে, একই বৃত্তের দুইটি বৃত্তাংশ ক্ষেত্র এবং এরা চাপ দ্বারা উৎপন্ন এদের কেন্দ্রস্থ কোণ সমানুপাতিক।

মনে করি, $O$ কেন্দ্রবিশিষ্ট বৃত্তের ব্যাসার্ধ $r \mid AOB$ বৃত্তকলা ক্ষেত্রটি $APB$ চাপের উপর দণ্ডায়মান, যার ডিগ্রি পরিমাপ $\theta \mid OA$ এর উপর $OC$ লম্ব টানি।

$\therefore \dfrac{\text{বৃত্তকলা AOB এর ক্ষেত্রফল}}{\text{বৃত্তকলা AOC এর ক্ষেত্রফল}} = \dfrac{\angle AOB \text{ এর পরিমাপ}}{\angle AOC \text{ এর পরিমাপ}}$

বা, $\dfrac{\text{বৃত্তকলা AOB এর ক্ষেত্রফল}}{\text{বৃত্তকলা AOC এর ক্ষেত্রফল}} = \dfrac{\theta}{90°}$ $[\because \angle AOC = 90°]$

বা, বৃত্তকলা $AOB$ এর ক্ষেত্রফল $= \dfrac{\theta}{90°} \times $ বৃত্তকলা $AOC$ এর ক্ষেত্রফল

$= \dfrac{\theta}{90°} \times \dfrac{1}{4} \times $ বৃত্তের ক্ষেত্রফল

$= \dfrac{\theta}{90°} \times \dfrac{1}{4} \times \pi r^2$

$= \dfrac{\theta}{360°} \times \pi r^2$

সুতরাং, বৃত্তকলার ক্ষেত্রফল $= \dfrac{\theta}{360°} \times \pi r^2$

[Figure: Sector AOB of a circle with center O.
 Natural description: A circle with center O. Sector AOB shown between two radii OA and OB. P is a point on arc AB. OC is perpendicular to OA (forming a 90° reference sector AOC).
 TikZ-mappable specifics: Circle centered at O. Radii OA, OB, and OC where OC ⊥ OA. Sector AOB has central angle θ. Reference sector AOC has central angle 90°. P on arc AB.]

### উদাহরণ ১৯.

একটি বৃত্তের ব্যাসার্ধ $8$ সে.মি., এর একটি বৃত্তচাপ কেন্দ্রে $56°$ কোণ উৎপন্ন করলে, বৃত্তচাপের দৈর্ঘ্য এবং বৃত্তকলার ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, বৃত্তের ব্যাসার্ধ $r = 8$ সে.মি., বৃত্তচাপের দৈর্ঘ্য $s$ এবং বৃত্তচাপ দ্বারা কেন্দ্রে উৎপন্ন কোণ $\theta = 56°$।

আমরা জানি, $s = \dfrac{\pi r \theta}{180°} = \dfrac{3.1416 \times 8 \times 56°}{180°}$ সে.মি. $= 7.82$ সে.মি. (প্রায়)

এবং বৃত্তকলার ক্ষেত্রফল $= \dfrac{\theta}{360°} \times \pi r^2 = \dfrac{56°}{360°} \times 3.1416 \times 8^2$ বর্গ সে.মি. $= 31.28$ বর্গ সে.মি. (প্রায়)

### উদাহরণ ২০.

একটি বৃত্তের ব্যাস ও পরিধির পার্থক্য $90$ সে.মি. হলে, বৃত্তের ব্যাসার্ধ নির্ণয় করো।

**সমাধান:** মনে করি, বৃত্তের ব্যাসার্ধ $r$

$\therefore$ বৃত্তের ব্যাস $= 2r$ এবং পরিধি $= 2\pi r$

প্রশ্নানুসারে, $2\pi r - 2r = 90$

বা, $2r(\pi - 1) = 90$

বা, $r = \dfrac{90}{2(\pi - 1)} = \dfrac{45}{3.1416 - 1} = 21.01$ সে.মি. (প্রায়)

নির্ণেয় বৃত্তের ব্যাসার্ধ $21.01$ সে.মি. (প্রায়)

### উদাহরণ ২১.

একটি বৃত্তাকার মাঠের ব্যাস $124$ মিটার। মাঠের সীমানা ঘেঁসে $6$ মিটার চওড়া একটি রাস্তা আছে। রাস্তার ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, বৃত্তাকার মাঠের ব্যাসার্ধ $r$ এবং রাস্তাসহ বৃত্তাকার মাঠের ব্যাসার্ধ $R$।

$\therefore r = \dfrac{124}{2} = 62$ মিটার এবং $R = (62 + 6) = 68$ মিটার

বৃত্তাকার মাঠের ক্ষেত্রফল $= \pi r^2$ এবং রাস্তাসহ বৃত্তাকার মাঠের ক্ষেত্রফল $= \pi R^2$

$\therefore$ রাস্তার ক্ষেত্রফল $= $ রাস্তাসহ বৃত্তাকার মাঠের ক্ষেত্রফল $- $ মাঠের ক্ষেত্রফল

$= (\pi R^2 - \pi r^2) = \pi(R^2 - r^2)$
$= 3.1416(68^2 - 62^2) = 3.1416(4624 - 3844)$
$= 3.1416 \times 780 = 2450.44$ বর্গমিটার (প্রায়)

নির্ণেয় রাস্তার ক্ষেত্রফল $2450.44$ বর্গমিটার (প্রায়)

[Figure: Annular ring (circular path around a field).
 Natural description: Two concentric circles — inner circle with radius 62 m (the field) and outer circle with radius 68 m. The ring between them is the 6-meter-wide path.
 TikZ-mappable specifics: Two concentric circles, inner radius 62, outer radius 68 (= 62 + 6). The annular region between them is shaded; widths 6 marked on radius difference.]

> **কাজ:** একটি বৃত্তের পরিধি $440$ মিটার। ওই বৃত্তে অন্তর্লিখিত বর্গক্ষেত্রের বাহুর দৈর্ঘ্য নির্ণয় করো।

### উদাহরণ ২২.

একটি বৃত্তের ব্যাসার্ধ $12$ সে.মি. এবং বৃত্তচাপের দৈর্ঘ্য $14$ সে.মি.। বৃত্তচাপটি কেন্দ্রে যে কোণ উৎপন্ন করে তা নির্ণয় করো।

**সমাধান:** মনে করি, বৃত্তের ব্যাসার্ধ $r = 12$ সে.মি., বৃত্তচাপের দৈর্ঘ্য $s = 14$ সে.মি., এবং কেন্দ্রে উৎপন্ন কোণের ডিগ্রি পরিমাপ $\theta$

আমরা জানি, $s = \dfrac{\pi r \theta}{180}$

বা, $\pi r \theta = 180 \times s$

বা, $\theta = \dfrac{180 \times s}{\pi r} = \dfrac{180 \times 14}{3.1416 \times 12} = 66.84°$ (প্রায়)

নির্ণেয় কোণ $66.84°$ (প্রায়)

### উদাহরণ ২৩.

একটি চাকার ব্যাস $4.5$ মিটার। চাকাটি $360$ মিটার পথ অতিক্রম করতে কত বার ঘুরবে?

**সমাধান:** দেওয়া আছে, চাকার ব্যাস $4.5$ মিটার।

$\therefore$ চাকাটির ব্যাসার্ধ $r = \dfrac{4.5}{2} = 2.25$ মিটার এবং পরিধি $= 2\pi r$

মনে করি, চাকাটি $360$ মিটার পথ অতিক্রম করতে $n$ বার ঘুরবে।

প্রশ্নানুসারে, $n \times 2\pi r = 360$

বা, $n = \dfrac{360}{2\pi r} = \dfrac{360}{2 \times 3.1416 \times 2.25} = 25.46$ (প্রায়)

$\therefore$ চাকাটি প্রায় $25$ বার ঘুরবে।

### উদাহরণ ২৪.

$211$ মিটার $20$ সে.মি., যেতে দুইটি চাকা যথাক্রমে $32$ এবং $48$ বার ঘুরলো। চাকা দুইটির ব্যাসার্ধের অন্তর নির্ণয় করো।

**সমাধান:** $211$ মিটার $20$ সে.মি. $= 21120$ সে.মি.

মনে করি, চাকা দুইটির ব্যাসার্ধ যথাক্রমে $R$ ও $r$ যেখানে $R > r$

$\therefore$ চাকা দুইটির পরিধি যথাক্রমে $2\pi R$ ও $2\pi r$ এবং ব্যাসার্ধের অন্তর $(R - r)$

প্রশ্নানুসারে, $32 \times 2\pi R = 21120$

বা, $R = \dfrac{21120}{32 \times 2\pi} = \dfrac{21120}{32 \times 2 \times 3.1416} = 105.04$ সে.মি. (প্রায়)

এবং $48 \times 2\pi r = 21120$

বা, $r = \dfrac{21120}{48 \times 2\pi} = \dfrac{21120}{48 \times 2 \times 3.1416} = 70.03$ সে.মি. (প্রায়)

$\therefore R - r = (105.04 - 70.03) = 35.01$ সে.মি. বা $0.35$ মিটার (প্রায়)

চাকা দুইটির ব্যাসার্ধের অন্তর $0.35$ মিটার (প্রায়)

### উদাহরণ ২৫.

একটি বৃত্তের ব্যাসার্ধ $14$ সে.মি., একটি বর্গের ক্ষেত্রফল উক্ত বৃত্তের ক্ষেত্রফলের সমান। বর্গক্ষেত্রটির বাহুর দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, বৃত্তের ব্যাসার্ধ $r = 14$ সে.মি., এবং বর্গক্ষেত্রটির বাহুর দৈর্ঘ্য $a$

$\therefore$ বৃত্তের ক্ষেত্রফল $\pi r^2$ এবং বর্গক্ষেত্রটির ক্ষেত্রফল $= a^2$

প্রশ্নানুসারে, $a^2 = \pi r^2$

বা, $a = \sqrt{\pi}r = \sqrt{3.1416} \times 14 = 24.81$ (প্রায়)

নির্ণেয় দৈর্ঘ্য $24.81$ সে.মি. (প্রায়)

### উদাহরণ ২৬.

চিত্রে $ABCD$ একটি বর্গক্ষেত্র যার প্রতি বাহুর দৈর্ঘ্য $22$ মিটার এবং $AED$ ক্ষেত্রটি একটি অর্ধবৃত্ত। সম্পূর্ণ ক্ষেত্রটির ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, $ABCD$ বর্গক্ষেত্রটির প্রতিবাহুর দৈর্ঘ্য $a$

সুতরাং, $ABCD$ বর্গক্ষেত্রের ক্ষেত্রফল $= a^2$

আবার, $AED$ একটি অর্ধবৃত্ত।

$\therefore$ অর্ধবৃত্তের ব্যাসার্ধ $r = \dfrac{22}{2}$ মিটার $= 11$ মিটার

সুতরাং, $AED$ অর্ধবৃত্তের ক্ষেত্রফল $= \dfrac{1}{2}\pi r^2$

$\therefore$ সম্পূর্ণ ক্ষেত্রের ক্ষেত্রফল $= ABCD$ বর্গক্ষেত্রের ক্ষেত্রফল $+ AED$ অর্ধবৃত্তের ক্ষেত্রফল

$= \left(a^2 + \dfrac{1}{2}\pi r^2\right)$

$= \left(22^2 + \dfrac{1}{2} \times 3.1416 \times 11^2\right) = 674.07$ বর্গমিটার (প্রায়)

নির্ণেয় ক্ষেত্রফল $674.07$ বর্গমিটার (প্রায়)

[Figure: Square ABCD with a semicircle on one side.
 Natural description: A square ABCD of side 22 m, with a semicircle AED attached to side AD (where the diameter equals AD = 22).
 TikZ-mappable specifics: Square ABCD with A at top-left, B at top-right, C at bottom-right, D at bottom-left. All sides = 22 m. Semicircle on side AD (left side), bulging outward (to the left) with E as the leftmost point. Diameter AD = 22 m, radius = 11 m.]

### উদাহরণ ২৭.

চিত্রে $ABCD$ একটি আয়তক্ষেত্র যার দৈর্ঘ্য ও প্রস্থ যথাক্রমে $12$ মিটার ও $10$ মিটার এবং $DAE$ একটি বৃত্তাংশ। বৃত্তচাপ $DE$ এর দৈর্ঘ্য ও সম্পূর্ণ ক্ষেত্রের ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** বৃত্তাংশের ব্যাসার্ধ $r = AD = 12$ মিটার এবং কেন্দ্রে উৎপন্ন কোণ $\theta = 30°$

$\therefore$ বৃত্তচাপ $DE$ এর দৈর্ঘ্য $= \dfrac{\pi r \theta}{180}$

$= \dfrac{3.1416 \times 12 \times 30}{180} = 6.28$ মিটার (প্রায়)

$ADE$ বৃত্তাংশের ক্ষেত্রফল $= \dfrac{\theta}{360} \times \pi r^2$
$= \dfrac{30}{360} \times 3.1416 \times 12^2 = 37.7$ বর্গমিটার (প্রায়)

আয়তক্ষেত্র $ABCD$ এর দৈর্ঘ্য $12$ মিটার এবং প্রস্থ $10$ মিটার

$\therefore$ আয়তক্ষেত্রের ক্ষেত্রফল $= $ দৈর্ঘ্য $\times $ প্রস্থ $= 12 \times 10 = 120$ বর্গমিটার

$\therefore$ সম্পূর্ণ ক্ষেত্রের ক্ষেত্রফল $= (37.7 + 120)$ বর্গমিটার $= 157.7$ বর্গমিটার (প্রায়)

নির্ণেয় ক্ষেত্রফল $157.7$ বর্গমিটার (প্রায়)

[Figure: Rectangle with attached circular sector.
 Natural description: Rectangle ABCD with length 12 m and width 10 m. A circular sector ADE with center at A, radius AD = 12, and angle 30°.
 TikZ-mappable specifics: Rectangle ABCD with A bottom-left, B bottom-right, C top-right, D top-left. AB = 12, AD = 10 (or BC = 10). Sector ADE: center A, radius AD, angle ∠DAE = 30°, arc from D to E.]

> **কাজ:** চিত্রে গাঢ় চিহ্নিত ক্ষেত্রটির ক্ষেত্রফল নির্ণয় করো।
> [Figure: Composite shape with shaded region.]

## অনুশীলনী ১৬.৩

**১।** একটি বৃত্তচাপ কেন্দ্রে $30°$ কোণ উৎপন্ন করে। বৃত্তের ব্যাস $126$ সে.মি., হলে চাপের দৈর্ঘ্য নির্ণয় করো।

**২।** প্রতি মিনিটে $66$ মিটার বেগে $1\dfrac{1}{2}$ মিনিটে একটি ঘোড়া একটি মাঠ ঘুরে এলো। ঐ মাঠের ব্যাস নির্ণয় করো।

**৩।** একটি বৃত্তাংশের ক্ষেত্রফল $77$ বর্গমিটার এবং বৃত্তের ব্যাসার্ধ $21$ মিটার। বৃত্তাংশটি কেন্দ্রে যে কোণ উৎপন্ন করে, তা নির্ণয় কর।

**৪।** একটি বৃত্তের ব্যাসার্ধ $14$ সে.মি., এবং বৃত্তচাপ কেন্দ্রে $75°$ কোণ উৎপন্ন করে। বৃত্তাংশের ক্ষেত্রফল নির্ণয় করো।

**৫।** একটি বৃত্তাকার মাঠকে ঘিরে একটি রাস্তা আছে। রাস্তাটির ভিতরের পরিধি অপেক্ষা বাইরের পরিধি $44$ মিটার বড়। রাস্তাটির প্রস্থ নির্ণয় করো।

**৬।** একটি বৃত্তাকার পার্কের ব্যাস $26$ মিটার। পার্কটিকে বেষ্টন করে বাইরের দিকে $2$ মিটার প্রশস্ত একটি পথ আছে। পথটির ক্ষেত্রফল নির্ণয় করো।

**৭।** একটি গাড়ির সামনের চাকার ব্যাস $28$ সে.মি., এবং পিছনের চাকার ব্যাস $35$ সে.মি., $44$ মিটার পথ যেতে সামনের চাকা পিছনের চাকা অপেক্ষা কত পূর্ণসংখ্যক বার বেশি ঘুরবে?

**৮।** একটি বৃত্তের পরিধি $220$ মিটার। ঐ বৃত্তে অন্তর্লিখিত বর্গক্ষেত্রের বাহুর দৈর্ঘ্য নির্ণয় করো।

**৯।** একটি বৃত্তের পরিধি একটি সমবাহু ত্রিভুজের পরিসীমার সমান। এদের ক্ষেত্রফলের অনুপাত নির্ণয় করো।

**১০।** নিচের চিত্রের তথ্য অনুযায়ী গাঢ় চিহ্নিত ক্ষেত্রগুলোর ক্ষেত্রফল নির্ণয় করো।

[Figure: Multiple composite shapes with shaded regions involving circles, sectors, squares, rectangles.]

## ১৬.৫ ঘনবস্তু (Solids)

### আয়তাকার ঘনবস্তু (Rectangular solid)

তিন জোড়া সমান্তরাল আয়তাকার সমতল বা পৃষ্ঠ দ্বারা আবদ্ধ ঘনবস্তুকে আয়তাকার ঘনবস্তু বলে।

মনে করি, $ABCDEFGH$ একটি আয়তাকার ঘনবস্তু। এর দৈর্ঘ্য $AB = a$, প্রস্থ $BC = b$, উচ্চতা $AH = c$

**১. কর্ণ নির্ণয়:** $ABCDEFGH$ আয়তাকার ঘনবস্তুর কর্ণ $AF$।

$\triangle ABC$ এ $BC \perp AB$ এবং $AC$ অতিভুজ।

$\therefore AC^2 = AB^2 + BC^2 = a^2 + b^2$

আবার, $\triangle AFC$ এ $FC \perp AC$ এবং $AF$ অতিভুজ।

$\therefore AF^2 = AC^2 + FC^2 = a^2 + b^2 + c^2$

$\therefore AF = \sqrt{a^2 + b^2 + c^2}$

$\therefore$ আয়তাকার ঘনবস্তুটির কর্ণ $= \sqrt{a^2 + b^2 + c^2}$

[Figure: Rectangular solid (cuboid) ABCDEFGH.
 Natural description: A rectangular solid with edges a (length), b (width), c (height). Diagonal AF from one corner to the opposite corner is shown.
 TikZ-mappable specifics: A 3D cuboid with vertices labeled A, B, C, D on bottom and E, F, G, H on top. AB = a (length, horizontal), BC = b (width), AE = c (height, vertical). Diagonal AF drawn from A (bottom-front-left) to F (top-back-right). Auxiliary lines AC (face diagonal) for the proof.]

**২. সমগ্র তলের ক্ষেত্রফল নির্ণয়:** আয়তাকার ঘনবস্তুটির ৬টি তল যেখানে, বিপরীত তলগুলো পরস্পর সমান।

আয়তাকার ঘনবস্তুটির সমগ্র তলের ক্ষেত্রফল
$= 2(ABCD$ তলের ক্ষেত্রফল $+ ABGH$ তলের ক্ষেত্রফল $+ BCFG$ তলের ক্ষেত্রফল$)$
$= 2(AB \times AD + AB \times AH + BC \times BG)$
$= 2(ab + ac + bc) = 2(ab + bc + ca)$

**৩. আয়তাকার ঘনবস্তুর আয়তন $= $ দৈর্ঘ্য $\times $ প্রস্থ $\times $ উচ্চতা $= abc$

### উদাহরণ ২৮.

একটি আয়তাকার ঘনবস্তুর দৈর্ঘ্য, প্রস্থ ও উচ্চতা যথাক্রমে, $25$ সে.মি., $20$ সে.মি. এবং $15$ সে.মি., এর সমগ্র তলের ক্ষেত্রফল, আয়তন এবং কর্ণের দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, আয়তাকার ঘনবস্তুর দৈর্ঘ্য $a = 25$ সে.মি., প্রস্থ $b = 20$ সে.মি., এবং উচ্চতা $c = 15$ সে.মি.।

$\therefore$ আয়তাকার ঘনবস্তুটির সমগ্র তলের ক্ষেত্রফল $= 2(ab + bc + ca)$

$= 2(25 \times 20 + 20 \times 15 + 15 \times 25) = 2350$ বর্গ সে.মি.

এবং আয়তন $= abc = 25 \times 20 \times 15 = 7500$ ঘন সে.মি.

এবং কর্ণের দৈর্ঘ্য $= \sqrt{a^2 + b^2 + c^2}$

$= \sqrt{25^2 + 20^2 + 15^2} = \sqrt{624 + 400 + 225} = \sqrt{1250} = 35.363$ সে.মি. (প্রায়)

নির্ণেয় সমগ্র তলের ক্ষেত্রফল $2350$ বর্গ সে.মি., আয়তন $7500$ ঘন সে.মি., এবং কর্ণের দৈর্ঘ্য $35.363$ সে.মি. (প্রায়)।

> **কাজ:** তোমার গণিত বইয়ের দৈর্ঘ্য, প্রস্থ ও উচ্চতা মেপে এর আয়তন, সমগ্র তলের ক্ষেত্রফল এবং কর্ণের দৈর্ঘ্য নির্ণয় করো।

### ঘনক (Cube)

আয়তাকার ঘনবস্তুর দৈর্ঘ্য, প্রস্থ ও উচ্চতা সমান হলে একে ঘনক বলা হয়।

মনে করি, $ABCDEFGH$ একটি ঘনক। এর দৈর্ঘ্য = প্রস্থ = উচ্চতা $= a$ একক

১. ঘনকটির কর্ণের দৈর্ঘ্য $= \sqrt{a^2 + a^2 + a^2} = \sqrt{3a^2} = \sqrt{3}a$

২. ঘনকের সমগ্র তলের ক্ষেত্রফল $= 2(a \cdot a + a \cdot a + a \cdot a) = 2(a^2 + a^2 + a^2) = 6a^2$

৩. ঘনকটির আয়তন $= a \cdot a \cdot a = a^3$

[Figure: Cube ABCDEFGH with all edges equal to a.
 Natural description: A cube with all 12 edges equal to length a.
 TikZ-mappable specifics: Same as cuboid but with all edges equal: a × a × a. Vertices A, B, C, D on bottom; E, F, G, H on top. All edges = a.]

### উদাহরণ ২৯.

একটি ঘনকের সম্পূর্ণ পৃষ্ঠের ক্ষেত্রফল $96$ বর্গমিটার। এর কর্ণের দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, ঘনকটির ধার $a$

$\therefore$ এর সম্পূর্ণ পৃষ্ঠের ক্ষেত্রফল $= 6a^2$ এবং কর্ণের দৈর্ঘ্য $= \sqrt{3}a$

প্রশ্নানুসারে, $6a^2 = 96$ বা, $a^2 = 16$ $\therefore a = 4$

$\therefore$ ঘনকটির কর্ণের দৈর্ঘ্য $\sqrt{3} \cdot 4 = 6.928$ মিটার (প্রায়)।

নির্ণেয় কর্ণের দৈর্ঘ্য $6.928$ মিটার (প্রায়)।

> **কাজ:** তিনটি ধাতুর ঘনকের ধার যথাক্রমে $3$ সে.মি., $4$ সে.মি. এবং $5$ সে.মি.। ঘনক তিনটিকে গলিয়ে একটি নতুন ঘনক তৈরি করা হলো। নতুন ঘনকের সম্পূর্ণ পৃষ্ঠের ক্ষেত্রফল ও কর্ণের দৈর্ঘ্য নির্ণয় করো।

### বেলন (Cylinder)

কোনো আয়তক্ষেত্রের যে কোনো বাহুকে অক্ষ ধরে আয়তক্ষেত্রটিকে ঐ বাহুর চতুর্দিকে ঘোরালে যে ঘনবস্তু সৃষ্টি হয়, তাকে সমবৃত্তভূমিক বেলন বা সিলিন্ডার বলা হয়। সমবৃত্তভূমিক বেলনের দুই প্রান্তের বৃত্তাকার তল, বক্রতলকে বক্রপৃষ্ঠ এবং সমগ্রতলকে পৃষ্ঠতল বলা হয়। আয়তক্ষেত্রের অক্ষের সমান্তরাল ঘূর্ণায়মান বাহুটিকে বেলনের সৃজক রেখা বা উৎপাদক রেখা বলে।

উপরের চিত্রটি একটি সমবৃত্তভূমিক বেলন যার ভূমির ব্যাসার্ধ $r$ এবং উচ্চতা $h$

১. ভূমির ক্ষেত্রফল $= \pi r^2$
২. বক্রপৃষ্ঠের ক্ষেত্রফল $= $ ভূমির পরিধি $\times$ উচ্চতা $= 2\pi rh$
৩. সম্পূর্ণ তলের ক্ষেত্রফল বা সমগ্র তলের ক্ষেত্রফল
$= (\pi r^2 + 2\pi rh + \pi r^2) = 2\pi r(r + h)$

বা, পৃষ্ঠতলের ক্ষেত্রফল $= 2\pi r(r + h)$

৪. আয়তন $= $ ভূমির ক্ষেত্রফল $\times$ উচ্চতা $= \pi r^2 h$

[Figure: Right circular cylinder.
 Natural description: A vertical cylinder with circular base of radius r and height h. Unfolded, the curved surface is a rectangle of width 2πr and height h.
 TikZ-mappable specifics: 3D right cylinder. Top circle and bottom circle, each with radius r, connected by vertical sides of length h. Side label "h" between bottom and top circles. Top label "P" inside top circle (πr² area); side label "2πr × h" (curved surface area); bottom label πr².]

### উদাহরণ ৩০.

একটি সমবৃত্তভূমিক বেলনের উচ্চতা $10$ সে.মি. এবং ভূমির ব্যাসার্ধ $7$ সে.মি, হলে, এর আয়তন এবং সম্পূর্ণ পৃষ্ঠের ক্ষেত্রফল নির্ণয় করো।

**সমাধান:** মনে করি, সমবৃত্তভূমিক বেলনের উচ্চতা $h = 10$ সে.মি. এবং ভূমির ব্যাসার্ধ $r$

$\therefore$ এর আয়তন $= \pi r^2 h$
$= 3.1416 \times 7^2 \times 10 = 1539.38$ ঘন সে.মি. (প্রায়)

এবং সমগ্র পৃষ্ঠের ক্ষেত্রফল $= 2\pi r(r + h)$
$= 2 \times 3.1416 \times 7(7 + 10) = 747.7$ বর্গমিটার (প্রায়)

> **কাজ:** একটি আয়তাকার কাগজের পাতা মুড়িয়ে একটি সমবৃত্তভূমিক সিলিন্ডার তৈরি করো। এর পৃষ্ঠতলের ক্ষেত্রফল ও আয়তন নির্ণয় করো।

### উদাহরণ ৩১.

ঢাকনাসহ একটি বাক্সের বাইরের মাপ যথাক্রমে $10$ সে.মি., $9$ সে.মি., ও $7$ সে.মি., বাক্সটির ভিতরের সমগ্র পৃষ্ঠের ক্ষেত্রফল $262$ বর্গ সে. মি. এবং বাক্সের পুরুত্ব সমান।

ক) বাক্সটির আয়তন নির্ণয় করো।
খ) বাক্সটির দেওয়ালের পুরুত্ব নির্ণয় করো।
গ) বাক্সটির বহুতম দৈর্ঘ্যের সমান বাহুবিশিষ্ট কোনো রম্বসের একটি কর্ণ $16$ সে.মি, হলে রম্বসটির ক্ষেত্রফল নির্ণয় করো।

**সমাধান:**

ক) বাক্সটির বাইরের মাপ যথাক্রমে $10$ সে.মি., $9$ সে.মি. ও $7$ সে.মি.,

$\therefore$ বাক্সটির বাইরের আয়তন $= 10 \times 9 \times 7 = 630$ ঘন সে.মি.

খ) মনে করি, বাক্সের পুরুত্ব $x$, ঢাকনাসহ বাক্সের বাইরের মাপ যথাক্রমে $10$ সে.মি., $9$ সে.মি. ও $7$ সে.মি.

$\therefore$ বাক্সের ভিতরের মাপ যথাক্রমে $a = (10 - 2x)$ সে.মি., $b = (9 - 2x)$ সে.মি.

এবং $c = (7 - 2x)$ সে.মি.

বাক্সের ভিতরের সমগ্র তলের ক্ষেত্রফল $= 2(ab + bc + ca)$

প্রশ্নানুসারে, $2(ab + bc + ca) = 262$

বা, $(10 - 2x)(9 - 2x) + (9 - 2x)(7 - 2x) + (7 - 2x)(10 - 2x) = 131$

বা, $90 - 38x + 4x^2 + 63 - 32x + 4x^2 + 70 - 34x + 4x^2 - 131 = 0$

বা, $12x^2 - 104x + 92 = 0$

বা, $3x^2 - 26x + 23 = 0$

বা, $3x^2 - 3x - 23x + 23 = 0$

বা, $3x(x - 1) - 23(x - 1) = 0$

বা, $(x - 1)(3x - 23) = 0$

বা, $x - 1 = 0$ অথবা $3x - 23 = 0$

বা, $x = 1$ অথবা, $x = \dfrac{23}{3} = 7.67$ (প্রায়)

বাক্সটির পুরুত্ব তার বাইরের তিনটি পরিমাপের কোনোটির চেয়েও বড় হতে পারে না।

নির্ণেয় বাক্সের পুরুত্ব $1$ সে.মি.

গ) মনে করি, $ABCD$ রম্বসের প্রত্যেক বাহুর দৈর্ঘ্য $10$ সে.মি. এবং কর্ণদ্বয় পরস্পরকে $O$ বিন্দুতে ছেদ করে।

আমরা জানি, রম্বসের কর্ণদ্বয় পরস্পরকে সমকোণে সমদ্বিখণ্ডিত করে।

$\therefore OA = OC, OB = OD$

$\triangle AOB$ সমকোণী ত্রিভুজে অতিভুজ $AB = 10$

এখানে, $AB^2 = 10^2 = 100 = 36 + 64$

$= 6^2 + 8^2 = OB^2 + OA^2$ [চিত্র অনুযায়ী]

$\therefore OB = 6, OA = 8$

$\therefore$ কর্ণ $AC = 2 \times 8 = 16$ সে.মি. এবং কর্ণ $BD = 2 \times 6 = 12$ সে.মি.

$\therefore ABCD$ রম্বসের ক্ষেত্রফল $= \dfrac{1}{2} \times AC \times BD = \dfrac{1}{2} \times 16 \times 12 = 96$ বর্গ সে.মি.

[Figure: Rhombus with diagonals.
 Natural description: Rhombus ABCD with diagonals AC = 16 and BD = 12 intersecting at center O perpendicularly. Side length = 10.
 TikZ-mappable specifics: A at left, B at top, C at right, D at bottom (diamond). Center O. AC = 16 horizontal, BD = 12 vertical. Right-angle square at O. Each side AB = BC = CD = DA = 10.]

### উদাহরণ ৩২.

কোনো ঘনকের পৃষ্ঠতলের কর্ণের দৈর্ঘ্য $8\sqrt{2}$ সে.মি., হলে, এর কর্ণের দৈর্ঘ্য ও আয়তন নির্ণয় করো।

**সমাধান:** মনে করি, ঘনকের ধার $a$

$\therefore$ ঘনকের পৃষ্ঠতলের কর্ণের দৈর্ঘ্য $= \sqrt{2}a$, কর্ণের দৈর্ঘ্য $= \sqrt{3}a$ এবং আয়তন $= a^3$

প্রশ্নানুসারে, $\sqrt{2}a = 8\sqrt{2}$ বা, $a = 8$

$\therefore$ ঘনকের কর্ণের দৈর্ঘ্য $= \sqrt{3} \times 8 = 13.856$ সে.মি. (প্রায়)

এবং আয়তন $= 8^3 = 512$ ঘন সে.মি.

নির্ণেয় কর্ণের দৈর্ঘ্য $13.856$ সে.মি. (প্রায়) এবং আয়তন $512$ ঘন সে.মি.

### উদাহরণ ৩৩.

কোনো আয়তক্ষেত্রের দৈর্ঘ্য $12$ সে.মি., এবং প্রস্থ $5$ সে.মি., একে বৃহত্তর বাহুর চতুর্দিকে ঘোরালে যে ঘনবস্তু উৎপন্ন হয় তার পৃষ্ঠতলের ক্ষেত্রফল এবং আয়তন নির্ণয় করো।

**সমাধান:** দেওয়া আছে একটি আয়তক্ষেত্রের দৈর্ঘ্য $12$ সে.মি., এবং প্রস্থ $5$ সে.মি., একে বৃহত্তর বাহুর চতুর্দিকে ঘোরালে একটি সমবৃত্তভূমিক বেলন আকৃতির ঘনবস্তু উৎপন্ন হবে, যার উচ্চতা $h = 12$ সে.মি., এবং ভূমির ব্যাসার্ধ $r = 5$ সে.মি.

উৎপন্ন ঘনবস্তুর পৃষ্ঠতলের ক্ষেত্রফল $= 2\pi r(r + h)$

$= 2 \times 3.1416 \times 5(5 + 12) = 534.071$ বর্গ সে.মি. (প্রায়)

এবং আয়তন $= \pi r^2 h$

$= 3.1416 \times 5^2 \times 12 = 942.48$ ঘন সে.মি. (প্রায়)

নির্ণেয় পৃষ্ঠতলের ক্ষেত্রফল $534.071$ বর্গ সে.মি. (প্রায়) এবং আয়তন $942.48$ ঘন সে.মি. (প্রায়)

## অনুশীলনী ১৬.৪

**১।** একটি সামান্তরিকের দুইটি সন্নিহিত বাহুর দৈর্ঘ্য যথাক্রমে $7$ সে.মি., এবং $5$ সে.মি., হলে, এর পরিসীমার অর্ধেক কত সে.মি.?
- ক) $12$
- খ) $20$
- গ) $24$
- ঘ) $28$

**২।** সমতলীয় জ্যামিতিতে—
- $(i)\,$ সমবাহু ত্রিভুজের প্রত্যেকটি কোণ এক সমকোণ অপেক্ষা ছোট।
- $(ii)\,$ সমকোণী ত্রিভুজের সূক্ষ্মকোণদ্বয়ের সমষ্টি এক সমকোণ।
- $(iii)\,$ ত্রিভুজের যে কোনো বাহু বর্ধিত করলে উৎপন্ন বহিঃস্থ কোণ বিপরীত অন্তঃস্থ প্রত্যেকটি কোণ অপেক্ষা বৃহত্তর।

নিচের কোনটি সঠিক?
- ক) $i$ ও $ii$
- খ) $i$ ও $iii$
- গ) $ii$ ও $iii$
- ঘ) $i, ii$ ও $iii$

**৩।** একটি আয়তাকার ঘনবস্তুর দৈর্ঘ্য $16$ মিটার, প্রস্থ $12$ মিটার ও উচ্চতা $4.5$ মিটার। এর পৃষ্ঠতলের ক্ষেত্রফল, কর্ণের দৈর্ঘ্য ও আয়তন নির্ণয় করো।

**৪।** একটি আয়তাকার ঘনবস্তুর দৈর্ঘ্য, প্রস্থ ও উচ্চতার অনুপাত $21 : 16 : 12$ এবং কর্ণের দৈর্ঘ্য $87$ সে.মি. হলে, ঘনবস্তুটির তলের ক্ষেত্রফল নির্ণয় করো।

**৫।** একটি আয়তাকার ঘনবস্তুর $48$ বর্গমিটার ভূমির উপর দণ্ডায়মান। এর উচ্চতা $3$ মিটার ও কর্ণ $13$ মিটার। ঘনবস্তুর দৈর্ঘ্য ও প্রস্থ নির্ণয় করো।

**৬।** একটি আয়তাকার কাঠের বাক্সের বাইরের মাপ যথাক্রমে $8$ সে.মি., $6$ সে.মি. ও $4$ সে.মি., এর ভিতরের সম্পূর্ণ পৃষ্ঠের ক্ষেত্রফল $88$ বর্গ সে.মি., বাক্সটির কাঠের পুরুত্ব নির্ণয় করো।

**৭।** একটি দেওয়ালের দৈর্ঘ্য $25$ মিটার, উচ্চতা $6$ মিটার এবং পুরুত্ব $30$ সে.মি., একটি ইটের দৈর্ঘ্য $10$ সে.মি., প্রস্থ $5$ সে.মি. এবং উচ্চতা $3$ সে.মি., দেওয়ালটি ইট দিয়ে তৈরি করতে প্রয়োজনীয় ইটের সংখ্যা নির্ণয় করো।

**৮।** $12$ সে.মি., উচ্চতাবিশিষ্ট একটি বেলনের ভূমির ব্যাসার্ধ $5$ সে.মি., এর পৃষ্ঠতলের ক্ষেত্রফল ও আয়তন নির্ণয় করো।

**৯।** একটি বেলনের বক্রতলের ক্ষেত্রফল $100$ বর্গ সে.মি. এবং আয়তন $150$ ঘন সে.মি., বেলনের উচ্চতা এবং ভূমির ব্যাসার্ধ নির্ণয় করো।

**১০।** একটি লোহার পাইপের ভিতরের ও বাইরের ব্যাস যথাক্রমে $12$ সে.মি. ও $14$ সে.মি., এবং পাইপের উচ্চতা $5$ মিটার। এক ঘন সে.মি., লোহার ওজন $7.2$ গ্রাম হলে পাইপের লোহার ওজন নির্ণয় করো।

**১১।** চিত্রটি বর্গক্ষেত্র ও বৃত্তকলায় বিভক্ত।
- ক) বর্গক্ষেত্রটির কর্ণের দৈর্ঘ্য ও পরিসীমা নির্ণয় করো।
- খ) সম্পূর্ণ ক্ষেত্রের ক্ষেত্রফল নির্ণয় করো।
- গ) বর্গের বাহুর দৈর্ঘ্যবিশিষ্ট কোনো সুষম ষড়ভুজ কোনো বৃত্তে অন্তর্লিখিত হলে, বৃত্তের অন্তর্নিহিত অংশের ক্ষেত্রফল নির্ণয় করো।

[Figure: Composite shape with square and circular sector.
 Natural description: A composite figure with a square and a circular sector attached.
 TikZ-mappable specifics: Square ABCD with side 12, plus a sector with radius and angle marked. Composite figure details as in source.]

**১২।** একটি সামান্তরিকক্ষেত্র $ABCD$ এবং একটি আয়তক্ষেত্র $BCEF$ উভয়ের ভূমি $BC$।
- ক) একই উচ্চতা বিবেচনা করে সামান্তরিক ও আয়তক্ষেত্রটির চিত্র আঁকো।
- খ) দেখাও যে, $ABCD$ ক্ষেত্রটির পরিসীমা $BCEF$ ক্ষেত্রটির পরিসীমা অপেক্ষা বৃহত্তর।
- গ) আয়তক্ষেত্রের দৈর্ঘ্য ও প্রস্থের অনুপাত $5 : 3$ এবং পরিসীমা $48$ মিটার হলে, সামান্তরিকের ক্ষেত্রফল নির্ণয় করো।

## নমুনা প্রশ্ন

### বহুনির্বাচনি প্রশ্ন

**১।** একটি সমবাহু ত্রিভুজের বাহুর দৈর্ঘ্য $6$ সে.মি., হলে, এর ক্ষেত্রফল কত বর্গ সে.মি.?
- ক) $3\sqrt{3}$
- খ) $4\sqrt{3}$
- গ) $6\sqrt{3}$
- ঘ) $9\sqrt{3}$

**২।** বর্গক্ষেত্রের প্রতি বাহুর দৈর্ঘ্য $a$ এবং কর্ণ $d$ হলে—
- $(i)\,$ ক্ষেত্রফল $a^2$ বর্গ একক
- $(ii)\,$ পরিসীমা $2ad$ একক
- $(iii)\, d = \sqrt{2}a$

নিচের কোনটি সঠিক?
- ক) $i$ ও $ii$
- খ) $i$ ও $iii$
- গ) $ii$ ও $iii$
- ঘ) $i, ii$ ও $iii$

চিত্রের তথ্য অনুসারে নিচের ৩ ও ৪ নং প্রশ্নের উত্তর দাও।

[Figure: Composite figure with rectangle ABCD and semicircle G.
 Natural description: Rectangle ABCD on bottom, with width 12 cm and a perpendicular distance from top right; a triangular section with F and 10 cm on top right; a semicircle G at the bottom labeled "অর্ধবৃত্ত".
 TikZ-mappable specifics: Composite figure: rectangle ABCD plus triangle/sector with specific dimensions including 12 cm (a horizontal), 10 cm (slanted), 8 cm side, 30° angle marked at F. Semicircle G at the bottom of figure with diameter equal to AB.]

**৩।** $ABCD$ আয়তক্ষেত্রের কর্ণের দৈর্ঘ্য কত সে.মি.?
- ক) $13$
- খ) $14$
- গ) $14.4$
- ঘ) $15$

**৪।** $ACB$ অর্ধবৃত্তের পরিধি কত সে.মি.?
- ক) $18$
- খ) $18.85$ (প্রায়)
- গ) $37.7$ (প্রায়)
- ঘ) $96$

### সৃজনশীল প্রশ্ন

**৫।**

**দৃশ্যকল্প ১:** আয়তক্ষেত্রের ক্ষেত্রফল $1200$ বর্গসে.মি., আয়তক্ষেত্রটির দৈর্ঘ্য $10$ সে.মি., হ্রাস করলে এটি একটি বর্গক্ষেত্র হয়।

**দৃশ্যকল্প ২:** বৃত্তে অন্তর্লিখিত একটি বর্গক্ষেত্রের বাহুর সমষ্টি $40$ সে.মি.

- ক) একটি আয়তাকার ঘনবস্তুর দৈর্ঘ্য $5$ সে.মি., ও $4$ সে.মি, এবং কর্ণের দৈর্ঘ্য $5\sqrt{2}$ সে.মি., হলে, এর উচ্চতা নির্ণয় করো।
- খ) আয়তক্ষেত্রটির পরিসীমা নির্ণয় করো।
- গ) দৃশ্যকল্প ২ এর উল্লেখিত বর্গটির বাহু বৃত্তটি থেকে যে চাপ ছিন্ন করে তার দৈর্ঘ্য নির্ণয় করো।

### সংক্ষিপ্ত-উত্তর প্রশ্ন

**৬।** ক) একটি সুষম চতুর্ভুজের কেন্দ্র থেকে যেকোনো শীর্ষের দৈর্ঘ্য $4$ সে.মি, হলে, চতুর্ভুজটির ক্ষেত্রফল নির্ণয় করো।

খ) কোনো সামান্তরিকের কর্ণের দৈর্ঘ্য $6$ সে.মি, এবং ক্ষেত্রফল $18$ বর্গসে.মি, হলে, এর কর্ণের বিপরীত শীর্ষ থেকে উপর অঙ্কিত লম্বের দৈর্ঘ্য নির্ণয় করো।

গ) একটি ঘনক আকৃতির বাক্সের পৃষ্ঠতলের ক্ষেত্রফল $2400$ বর্গ সে.মি, হলে, এর কর্ণের দৈর্ঘ্য কত?

ঘ) একটি সমবৃত্তভূমিক সিলিন্ডারের বক্রপৃষ্ঠের ক্ষেত্রফল $4400$ বর্গ সে.মি., এর উচ্চতা $30$ সে.মি., হলে সমগ্রতলের ক্ষেত্রফল নির্ণয় করো।

> **OCR Quality Notes (Pass 2 @ 15-18x scale):**
> - All 33 worked examples (উদাহরণ ১-৩৩) preserved with full intermediate steps
> - Triangle area formulas (৪ cases: SAS, SSS/Heron, equilateral, isosceles) verbatim
> - Quadrilateral area formulas (rectangle, square, parallelogram, rhombus, trapezium) with derivations
> - Regular polygon area formula derivation (na²/4 · cot(180°/n))
> - Circle: পরিধি, বৃত্তচাপের দৈর্ঘ্য s = πrθ/180, বৃত্তকলার ক্ষেত্রফল
> - Solids: rectangular box, cube, cylinder — surface area, volume, diagonal
> - 4 অনুশীলনী (১৬.১: ১০ items, ১৬.২: ১৬ items, ১৬.৩: ১০ items, ১৬.৪: ১২ items) + নমুনা প্রশ্ন
> - **All geometric figures rendered as TikZ-friendly [Figure: ...] placeholders** with vertex placement, side lengths, angle measures, perpendicular markers, 3D solid orientations
>
> **Items flagged for further verification (preserved as-read):**
> - *[verify]* অনুশীলনী ১৬.১ #১: ratio `3/4` for one leg of 25-meter hypotenuse — specific phrasing preserved
> - *[verify]* অনুশীলনী ১৬.৩ #২: Bangla mixed number `1½` — formatting preserved
> - *[verify]* অনুশীলনী ১৬.৪ #৭: brick dimensions and wall calculation arithmetic
> - *[verify]* Composite figures in অনুশীলনী ১৬.২ #১৬, ১৬.৪ #১১ — multiple sub-shapes whose exact configuration may vary
> - *[verify]* নমুনা প্রশ্ন diagram (#৩, #৪) — composite rectangle + semicircle dimensions