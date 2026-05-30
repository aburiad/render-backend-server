---
class: 9
subject: math
chapter_no: 10
chapter_title_bn: দূরত্ব ও উচ্চতা
chapter_title_en: Distance and Elevation
book_pages: "197-204"
pdf_pages: "202-209"
source: "Secondary (BV) 2026 — Class 9-10 Math (NCTB)"
ocr_method: "Claude vision @ 15x scale + self-verified at 18x"
ocr_pass: 2
fidelity: "same-to-same — all worked examples preserved with full steps; figures as TikZ-friendly placeholders"
subchapters:
  - id: "10.1"
    title: "ভূ-রেখা, উর্ধ্বরেখা ও উর্ধ্বতল"
    heading: "## ১০.১ ভূ-রেখা, উর্ধ্বরেখা এবং উর্ধ্বতল (Horizontal Line, Vertical Line and Vertical Plane)"
    type: "concept"
  - id: "10.2"
    title: "উন্নতি কোণ ও অবনতি কোণ"
    heading: "## ১০.২ উন্নতি কোণ ও অবনতি কোণ (Angle of Elevation and Angle of Depression)"
    type: "concept"
  - id: "10.ex1"
    title: "অনুশীলনী ১০"
    heading: "## অনুশীলনী ১০"
    type: "exercise"
  - id: "10.sample"
    title: "নমুনা প্রশ্ন"
    heading: "## নমুনা প্রশ্ন"
    type: "sample"
---

# দশম অধ্যায় — দূরত্ব ও উচ্চতা (Distance and Elevation)

## ভূমিকা

অতি প্রাচীন কাল থেকেই দূরবর্তী কোনো বস্তুর দূরত্ব ও উচ্চতা নির্ণয় করতে ত্রিকোণমিতিক অনুপাতের প্রয়োগ করা হয়। বর্তমান যুগে ত্রিকোণমিতিক অনুপাতের ব্যবহার বেড়ে যাওয়ায় এর গুরুত্ব অপরিসীম। যে সব পাহাড়, পর্বত, টাওয়ার, গাছের উচ্চতা এবং নদ-নদীর প্রস্থ সহজে মাপা যায় না সে সব ক্ষেত্রে উচ্চতা ও প্রস্থ ত্রিকোণমিতির সাহায্যে নির্ণয় করা যায়। এক্ষেত্রে সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাতের মান জেনে রাখা প্রয়োজন।

এ অধ্যায় শেষে শিক্ষার্থীরা—

- ভূ-রেখা, উর্ধ্বরেখা, উর্ধ্বতল, উন্নতি কোণ ও অবনতি কোণ ব্যাখ্যা করতে পারবে;
- ত্রিকোণমিতির সাহায্যে দূরত্ব ও উচ্চতা বিষয়ক গাণিতিক সমস্যা সমাধান করতে পারবে;
- ত্রিকোণমিতির সাহায্যে হাতে-কলমে দূরত্ব ও উচ্চতা বিষয়ক বিভিন্ন পরিমাপ করতে পারবে।

## ১০.১ ভূ-রেখা, উর্ধ্বরেখা এবং উর্ধ্বতল (Horizontal Line, Vertical Line and Vertical Plane)

ভূ-রেখা হচ্ছে ভূমি তলে অবস্থিত যে কোনো সরলরেখা। ভূ-রেখাতে শয়নরেখাও বলা হয়। উর্ধ্বরেখা হচ্ছে ভূমি তলের উপর লম্ব যে কোনো সরলরেখা। এ ক্ষেত্রে উর্ধ্ব রেখাও বলে।

ভূমি তলের উপর লম্বভাবে অবস্থিত পরস্পরছেদী ভূ-রেখা ও উর্ধ্বরেখা একটি তল নির্দিষ্ট করে। ঐ তলকে উর্ধ্ব তল বলে। চিত্রে ভূ-তলের কোনো $B$ বিন্দু থেকে $CB$ দূরে $AB$ উচ্চতা বিশিষ্ট একটি গাছ লম্ব অবস্থায় দণ্ডায়মান। এখানে $CB$ রেখা হচ্ছে ভূ-রেখা, $BA$ রেখা হচ্ছে উর্ধ্বরেখা এবং $ABC$ তলটি ভূমির উপর লম্ব যা উর্ধ্বতল।

[Figure: Right triangle ABC depicting a tree on horizontal ground.
 Natural description: A vertical tree AB rises from a point B on the ground. A point C is on the ground at a horizontal distance from B. The triangle formed by A (top of tree), B (foot of tree, ground level), and C (ground point) has a right angle at B.
 TikZ-mappable specifics: B at bottom-right (ground level, right-angle square marked), C at bottom-left (also on ground line), A at top (directly above B). BC is the horizontal ground segment (ভূ-রেখা). BA is the vertical tree (উর্ধ্বরেখা). AC is the slant line of sight from C up to A. The triangle ABC lies in a vertical plane (উর্ধ্বতল). Right-angle square at B.]

## ১০.২ উন্নতি কোণ ও অবনতি কোণ (Angle of Elevation and Angle of Depression)

চিত্রটি লক্ষ করি, ভূমি তলে $AB$ একটি সরলরেখা। $A, O, B, P, Q$ বিন্দুগুলো এক উর্ধ্বতলে অবস্থিত। $AB$ সরলরেখার উপরের $P$ বিন্দুটি $AB$ রেখার সাথে $\angle POB$ উৎপন্ন করে। এখানে, $O$ বিন্দুর সাপেক্ষে $P$ বিন্দুর উন্নতি কোণ $\angle POB$।

[Figure: Elevation/depression angle diagram with horizontal line AB and observer at O.
 Natural description: A horizontal line AB with observer O on it. Point P sits above the line (on the upper side); point Q sits below the line. Lines from O to P and O to Q make angles with the horizontal — the upward angle ∠POB is the angle of elevation; the downward angle ∠QOB is the angle of depression.
 TikZ-mappable specifics: Horizontal line AB. O is a point on AB between A and B. P is above the line, connected to O by a slant line going up-right; the angle ∠POB (between OP and OB) is the উন্নতি কোণ (angle of elevation). Q is below the line, connected to O by a slant line going down-right; the angle ∠QOB is the অবনতি কোণ (angle of depression). Label A at left, O in middle, B at right, P at upper-right, Q at lower-right. Mark both angles with arcs.]

সুতরাং ভূতলের উপরের কোনো বিন্দু ভূমি সমান্তরাল রেখার সাথে যে কোণ উৎপন্ন করে তাকে তার উন্নতি কোণ বলা হয়।

$Q$ বিন্দু ভূ-রেখার সমান্তরাল $AB$ রেখার নিচের দিকে অবস্থিত। এখানে, $O$ বিন্দুর সাপেক্ষে $Q$ বিন্দুর অবনতি কোণ হচ্ছে $\angle QOB$। সুতরাং ভূতলের সমান্তরাল রেখার নিচের কোনো বিন্দু ভূ-রেখার সাথে যে কোণ উৎপন্ন করে তাকে তার অবনতি কোণ বলা হয়।

> **কাজ:** চিত্রটি চিহ্নিত করো এবং ভূ-রেখা, উর্ধ্বরেখা, উর্ধ্বতল, উন্নতি কোণ ও অবনতি কোণ নির্দেশ করো।
>
> [Figure: A diagram showing a building/object with horizontal ground line and a person observing.
>  Natural description: A simple sketch with an airplane/object high above (labeled অবনতি কোণ), a building below it at ground level (labeled উন্নতি কোণ), and a ground line at the bottom labeled ভূমি (with arrows indicating direction).
>  TikZ-mappable specifics: At the top, an airplane symbol with a line going diagonally down to the right indicating a depression angle (অবনতি কোণ). At the middle-right, a small building rectangle with a vertical line going up to the airplane (উর্ধ্বতল). At the bottom, a horizontal line labeled "ভূমি" with double-arrow marks. Right-angle markers where vertical meets horizontal. Arrows on ground line.]

**বিশেষ দ্রষ্টব্য:** এ অধ্যায়ে সমস্যা সমাধানের ক্ষেত্রে আনুমানিক সঠিক চিত্র আবশ্যক। চিত্র অঙ্কনের সময় নিচের কৌশল অবলম্বন করা দরকার।

[Figure: Three small right triangles labeled by reference angle.
 Natural description: Three right triangles with horizontal base of unit length, each with a different acute angle at the bottom-left and showing the corresponding height. Used as reference for sketching diagrams with these standard angles.
 TikZ-mappable specifics:
 (1) Right triangle with angle 30° at bottom-left, horizontal base = 1 unit, vertical leg (height) ≈ tan 30° ≈ 0.577, hypotenuse going up-right. Right-angle square at bottom-right.
 (2) Right triangle with angle 45° at bottom-left, base = 1 unit, height = 1 unit (equal legs), hypotenuse going up-right. Right-angle square at bottom-right.
 (3) Right triangle with angle 60° at bottom-left, base = 1 unit, height ≈ tan 60° ≈ 1.732 (much taller). Right-angle square at bottom-right.]

১. $30°$ কোণ অঙ্কনের ক্ষেত্রে ভূমি $>$ লম্ব হবে।

২. $45°$ কোণ অঙ্কনের ক্ষেত্রে ভূমি $=$ লম্ব হবে।

৩. $60°$ কোণ অঙ্কনের ক্ষেত্রে ভূমি $<$ লম্ব হবে।

### উদাহরণ ১.

একটি টাওয়ারের পাদদেশ থেকে $75$ মিটার দূরে ভূতলস্থ কোনো বিন্দুতে টাওয়ারের শীর্ষের উন্নতি $30°$ হলে, টাওয়ারের উচ্চতা নির্ণয় করো।

**সমাধান:** মনে করি, টাওয়ারের উচ্চতা $AB = h$ মিটার, টাওয়ারের পাদদেশ থেকে $BC = 75$ মিটার দূরে ভূতলস্থ $C$ বিন্দুতে টাওয়ারের শীর্ষ $A$ বিন্দুর উন্নতি $\angle ACB = 30°$

সমকোণী $\triangle ACB$ থেকে পাই, $\tan \angle ACB = \dfrac{AB}{BC}$

বা, $\tan 30° = \dfrac{h}{75}$ বা, $\dfrac{1}{\sqrt{3}} = \dfrac{h}{75}$ বা, $\sqrt{3}h = 75$ বা, $h = \dfrac{75}{\sqrt{3}}$

[Figure: Right triangle for tower problem.
 Natural description: Right triangle with horizontal base BC = 75 মিটার, vertical side AB = h (tower height), and angle 30° at vertex C.
 TikZ-mappable specifics: A at top, B at bottom-right (right-angle square at B), C at bottom-left. AB vertical (height h), BC horizontal (length 75 মিটার). Angle ACB = 30° marked at C with arc. Hypotenuse AC slant.]

বা, $h = \dfrac{75\sqrt{3}}{3}$ [হর এবং লবকে $\sqrt{3}$ দ্বারা গুণ করে]

বা, $h = 25\sqrt{3}$

$\therefore h = 43.301$

$\therefore$ টাওয়ারের উচ্চতা $43.30$ মিটার (প্রায়)।

### উদাহরণ ২.

একটি গাছের উচ্চতা $105$ মিটার। গাছটির শীর্ষ থেকে ভূমির কোনো বিন্দুতে উন্নতি কোণ $60°$ তৈরি করলে, গাছটির গোড়া থেকে ভূতলস্থ বিন্দুটির দূরত্ব নির্ণয় করো।

**সমাধান:** মনে করি, গাছের গোড়া থেকে ভূতলস্থ বিন্দুটির দূরত্ব $BC = x$ মিটার, গাছের উচ্চতা $AB = 105$ মিটার এবং $C$ বিন্দুতে গাছটির শীর্ষ $A$ বিন্দুর উন্নতি $\angle ACB = 60°$

সমকোণী $\triangle ACB$ থেকে পাই, $\tan \angle ACB = \dfrac{AB}{BC}$

[Figure: Right triangle for tree problem.
 Natural description: Right triangle with vertical tree AB = 105 মিটার, horizontal distance BC = x মিটার, and angle 60° at vertex C.
 TikZ-mappable specifics: A at top, B at bottom-right (right-angle square), C at bottom-left. AB = 105 মিটার (vertical), BC = x মিটার (horizontal), angle 60° marked at C with arc.]

বা, $\tan 60° = \dfrac{105}{x}$

বা, $\sqrt{3} = \dfrac{105}{x}$ [$\because \tan 60° = \sqrt{3}$]

বা, $\sqrt{3}x = 105$ বা, $x = \dfrac{105}{\sqrt{3}}$ বা, $x = \dfrac{105\sqrt{3}}{3}$ বা, $x = 35\sqrt{3}$

$\therefore x = 60.622$ (প্রায়)

$\therefore$ গাছটির গোড়া থেকে ভূতলস্থ বিন্দুটির দূরত্ব $60.62$ মিটার (প্রায়)।

> **কাজ:** চিত্রে $AB$ একটি গাছ। চিত্রে প্রদত্ত তথ্য থেকে—
> ক) গাছটির উচ্চতা নির্ণয় করো।
> খ) গাছটির পাদদেশ থেকে ভূতলস্থ $C$ বিন্দুর দূরত্ব নির্ণয় করো।
>
> [Figure: Right triangle with tree.
>  Natural description: Right triangle with A at top, B at bottom-right (right-angle), C at bottom-left. Angle 60° at C, the horizontal BC = 25 মিটার. Find AB and AC.
>  TikZ-mappable specifics: A top, B bottom-right (right-angle square), C bottom-left. BC = 25 মিটার (horizontal base labeled). Angle 60° at C marked with arc. Vertical side AB labeled (unknown). Slant hypotenuse AC.]

### উদাহরণ ৩.

$18$ মিটার লম্বা একটি মই একটি দেওয়ালের ছাদ বরাবর ঠেস দিয়ে ভূমির সঙ্গে $45°$ কোণ উৎপন্ন করে। দেওয়ালটির উচ্চতা নির্ণয় করো।

**সমাধান:** মনে করি, দেওয়ালটির উচ্চতা $AB = h$ মিটার, মইটির দৈর্ঘ্য $AC = 18$ মিটার এবং ভূমির সঙ্গে $\angle ACB = 45°$ উৎপন্ন করে।

$\triangle ABC$ থেকে পাই, $\sin \angle ACB = \dfrac{AB}{AC}$

বা, $\sin 45° = \dfrac{h}{18}$

বা, $\dfrac{1}{\sqrt{2}} = \dfrac{h}{18}$ [$\because \sin 45° = \dfrac{1}{\sqrt{2}}$]

বা, $\sqrt{2}h = 18$ বা, $h = \dfrac{18}{\sqrt{2}}$

[Figure: Right triangle for ladder against wall.
 Natural description: Right triangle with ladder AC = 18 মিটার as the hypotenuse, wall AB = h vertical, ground BC horizontal. The ladder makes 45° angle with the ground at C.
 TikZ-mappable specifics: A at top, B at bottom-right (right-angle square at B, foot of wall), C at bottom-left (foot of ladder on ground). AB vertical (wall, height h), BC horizontal (ground), AC slant = 18 মিটার (ladder). Angle 45° marked at C with arc.]

বা, $h = \dfrac{18\sqrt{2}}{2}$ [হর এবং লবকে $\sqrt{2}$ দ্বারা গুণ করে]

বা, $h = 12.728$ (প্রায়)

সুতরাং দেওয়ালটির উচ্চতা $12.73$ মিটার (প্রায়)।

### উদাহরণ ৪.

ঝড়ে একটি গাছ এমনভাবে ভেঙে পড়লো। গাছের গোড়া থেকে $7$ মিটার উচ্চতায় একটি খুঁটি ঠেস দিয়ে গাছটিকে সোজা করা হয়। মাটিতে খুঁটিটির স্পর্শ বিন্দুর অবনতি কোণ $30°$ হলে, খুঁটিটির দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, খুঁটিটির ঐ গাছের গোড়া থেকে $AB = 7$ মিটার উচ্চতায় খুঁটিটি ঠেস দিয়ে আছে এবং অবনতি $\angle DBC = 30°$

$\therefore \angle ACB = \angle DBC = 30°$ [একান্তর কোণ বলে]

সমকোণী $\triangle ABC$ থেকে পাই,

$\sin \angle ACB = \dfrac{AB}{BC}$ বা, $\sin 30° = \dfrac{7}{x}$

বা, $\dfrac{1}{2} = \dfrac{7}{x}$ [$\because \sin 30° = \dfrac{1}{2}$]

$\therefore x = 14$

$\therefore$ খুঁটিটির দৈর্ঘ্য $14$ মিটার।

[Figure: Right triangle for fallen tree problem.
 Natural description: A right triangle showing a fallen tree leaning against a pole. The pole AB stands vertically with the tree leaning at angle 30°.
 TikZ-mappable specifics: D at top-right (upper end of pole), B at bottom-right (foot of pole on ground, right-angle square), C at left where the tree touches ground, A on segment DB at height 7 m. Angle ∠DBC at B with depression to C marked = 30°. Then angle ∠ACB at C = 30° (alternate angle). Length AB = 7 মিটার (vertical), BC = x মিটার (horizontal/slant), AC = pole length to find.]

> **কাজ:** চিত্রে অবনতি $\angle CAE = 60°$, উন্নতি $\angle ADB = 30°$, $AC = 36$ মিটার, $AB \perp DC$ এবং $D, B, C$ একই সরলরেখায় অবস্থিত হলে, $AB, AD$ এবং $CD$ বাহুর দৈর্ঘ্য নির্ণয় করো।
>
> [Figure: Two right triangles sharing vertical side AB.
>  Natural description: A vertical segment AB perpendicular to horizontal segment DC. Two right triangles: ADB on the left (with angle ∠ADB = 30°) and ABC on the right (with depression ∠CAE = 60° where AE is horizontal at A).
>  TikZ-mappable specifics: A at top, B at bottom (right-angle at B where AB meets DC). D to the left of B on the horizontal line, C to the right of B. AB vertical. AE horizontal extending right from A. AC = 36 মিটার slant down to C. Angle ∠ADB = 30° at D. Angle ∠CAE = 60° (depression at A from horizontal to AC).]

### উদাহরণ ৫.

ভূতলস্থ কোনো স্থানে একটি দালানের ছাদের একটি বিন্দুর উন্নতি কোণ $60°$। ঐ স্থান থেকে $42$ মিটার পিছিয়ে গেলে দালানের ঐ বিন্দুর উন্নতি কোণ $45°$ হয়। দালানের উচ্চতা নির্ণয় করো।

**সমাধান:** মনে করি, দালানের উচ্চতা $AB = h$ মিটার এবং শীর্ষের উন্নতি $\angle ACB = 60°$ এবং $C$ স্থান থেকে $CD = 42$ মিটার পিছিয়ে গেলে উন্নতি $\angle ADB = 45°$ হয়।

ধরি, $BC = x$ মিটার।

$\therefore BD = BC + CD = (x + 42)$ মিটার।

$\triangle ABC$ থেকে পাই,

$\tan \angle ACB = \dfrac{AB}{BC}$, বা, $\tan 60° = \dfrac{h}{x}$

বা, $\sqrt{3} = \dfrac{h}{x}$ [$\because \tan 60° = \sqrt{3}$]

$\therefore x = \dfrac{h}{\sqrt{3}} \ldots (1)$

আবার, $\triangle ABD$ থেকে পাই, $\tan \angle ADB = \tan 45° = \dfrac{AB}{BD}$

বা, $\tan 45° = \dfrac{h}{x + 42}$ বা, $1 = \dfrac{h}{x + 42}$ [$\because \tan 45° = 1$]

বা, $h = x + 42$ বা, $h = \dfrac{h}{\sqrt{3}} + 42$ [(1) এর সমীকরণের সাহায্যে]

বা, $\sqrt{3}h = h + 42\sqrt{3}$ বা, $\sqrt{3}h - h = 42\sqrt{3}$ বা, $(\sqrt{3} - 1)h = 42\sqrt{3}$ বা, $h = \dfrac{42\sqrt{3}}{\sqrt{3} - 1}$

$\therefore h = 99.373$ (প্রায়)

$\therefore$ দালানটির উচ্চতা $99.37$ মিটার (প্রায়)।

[Figure: Right triangle setup for building height problem.
 Natural description: A vertical building AB with two observation points C and D on the ground. C is closer to the building (angle of elevation 60°), D is farther (angle 45°), with CD = 42 m.
 TikZ-mappable specifics: A at top, B at bottom (right-angle square at B, foot of building). D at far-left on ground, C between B and D on ground. AB vertical (height h). BC = x, CD = 42 m, BD = x + 42. Slant lines AC and AD drawn. Angle ∠ACB = 60° marked at C; angle ∠ADB = 45° marked at D. Two right triangles ABC and ABD sharing leg AB.]

### উদাহরণ ৬.

একটি খুঁটি এমনভাবে ভেঙ্গে গেল যে, তার অর্ধাংশ ভাঙা অংশ দণ্ডায়মান অংশের সাথে $30°$ কোণ উৎপন্ন করে খুঁটির গোড়া থেকে $10$ মিটার দূরে মাটি স্পর্শ করে। খুঁটির সম্পূর্ণ দৈর্ঘ্য নির্ণয় করো।

**সমাধান:** মনে করি, খুঁটির সম্পূর্ণ দৈর্ঘ্য $AB = h$ মিটার, খুঁটির $BC = x$ মিটার উচ্চতায় ভেঙ্গে গিয়ে বিচ্ছিন্ন না হয়ে ভাঙা অংশ দণ্ডায়মান অংশের সাথে $\angle BCD = 30°$ উৎপন্ন করে খুঁটির গোড়া থেকে $BD = 10$ মিটার দূরে মাটি স্পর্শ করে।

এখানে, $CD = AC = AB - BC = (h - x)$ মিটার।

$\triangle CBD$ থেকে পাই,

$\tan \angle BCD = \dfrac{BD}{BC}$ বা, $\tan 30° = \dfrac{10}{x}$

বা, $\dfrac{1}{\sqrt{3}} = \dfrac{10}{x}, \therefore x = 10\sqrt{3}$

আবার, $\sin \angle BCD = \dfrac{BD}{CD}$ বা, $\sin 30° = \dfrac{BD}{CD}$ বা, $\dfrac{1}{2} = \dfrac{10}{h - x}$

বা, $h - x = 20$ বা, $h = 20 + x$ বা, $h = 20 + 10\sqrt{3}$ [$x$ এর মান বসিয়ে]

$\therefore h = 37.321$ (প্রায়)

$\therefore$ খুঁটির দৈর্ঘ্য $37.32$ মিটার (প্রায়)।

[Figure: Right triangle for broken pole problem.
 Natural description: A vertical pole AB broke at point C above ground. The upper part bent and tilted, with its tip D touching ground 10 m from the base B. The bent part makes angle 30° with the standing part.
 TikZ-mappable specifics: B at bottom-right (right-angle square, base of pole on ground). A at top (would-be original top of pole). C on AB partway up (break point, height x). D on ground to the left of B at distance BD = 10 m. CD is the bent/leaning upper part, equal in length to CA. Angle ∠BCD = 30° at C between CB (downward vertical) and CD (slant). Triangle BCD right-angled at B.]

> **কাজ:** দুইটি কিলোমিটার পোস্টের মধ্যবর্তী কোনো স্থানের উপরের একটি বেলুন উড়ছে। বেলুনের স্থান $A$ কিলোমিটার পোস্ট দুইটির অবনতি কোণ যথাক্রমে $30°$ ও $60°$ হলে, বেলুনটির উচ্চতা মিটারে নির্ণয় করো।

## অনুশীলনী ১০

**১।** একটি দণ্ডের দৈর্ঘ্যের বর্গ তার ছায়ার দৈর্ঘ্যের এক তৃতীয়াংশ হলে ছায়ার প্রান্ত বিন্দুতে সূর্যের উন্নতি কোণ কত?
- ক) $15°$
- খ) $30°$
- গ) $45°$
- ঘ) $60°$

**২।** পাশের চিত্রে $x$ এর মান নিচের কোনটি?
- ক) $\dfrac{\sqrt{3}}{60}$
- খ) $\dfrac{60}{\sqrt{3}}$
- গ) $60\sqrt{2}$
- ঘ) $60\sqrt{3}$

[Figure: Right triangle with given values.
 Natural description: Right triangle with angle 60° at one vertex, with one side x and another side related to 60.
 TikZ-mappable specifics: A right triangle with vertices A (top), B (with right-angle square), D (other acute vertex). The horizontal base = 60 ft (60 মি.), vertical side = x, angle 60° at one acute vertex. Use trig ratio to compute x.]

**৩।** পাশের চিত্রে $O$ বিন্দুতে $P$ বিন্দুর উন্নতি কোণ কোনটি?
- ক) $\angle QOB$
- খ) $\angle POA$
- গ) $\angle QOA$
- ঘ) $\angle POB$

[Figure: Horizontal line AB with observer O on it.
 Natural description: Horizontal line AB with point O between A and B. Point P is above (upper-right), point Q is below (lower-right). Four angles ∠POA, ∠POB, ∠QOA, ∠QOB are formed.
 TikZ-mappable specifics: Horizontal line A —— O —— B. P above at upper right (slant line from O to P going up-right). Q below at lower right (slant line from O to Q going down-right). Angles labeled.]

**৪।** অবনতি কোণের মান কত ডিগ্রি হলে, একটি খুঁটির দৈর্ঘ্য ও ছায়ার দৈর্ঘ্য সমান হবে?
- ক) $30°$
- খ) $45°$
- গ) $60°$
- ঘ) $90°$

**৫।** একটি মিনারের পাদদেশ থেকে কিছু দূরে একটি স্থানে মিনারটির শীর্ষের উন্নতি $30°$ এবং মিনারটির উচ্চতা $26$ মিটার হলে, মিনার থেকে ঐ স্থানটির দূরত্ব নির্ণয় করো।

**৬।** একটি গাছের পাদদেশ থেকে $20$ মিটার দূরে ভূতলের কোনো বিন্দুতে গাছের চূড়ার উন্নতি কোণ $60°$ হলে, গাছটির উচ্চতা নির্ণয় করো।

**৭।** $18$ মিটার দৈর্ঘ্য একটি মই ভূমির সাথে $45°$ কোণ উৎপন্ন করে দেওয়ালের ছাদ স্পর্শ করে। দেওয়ালটির উচ্চতা নির্ণয় করো।

**৮।** একটি ঘরের ছাদের কোনো বিন্দুতে ঐ বিন্দু থেকে $20$ মিটার দূরের ভূতলস্থ একটি বিন্দুর অবনতি কোণ $30°$ হলে, ঘরটির উচ্চতা নির্ণয় করো।

**৯।** ভূতলে কোনো বিন্দু থেকে একটি অট্টালিকার শীর্ষের উন্নতি কোণ $30°$ হয়। ঐ স্থান থেকে $25$ মিটার পিছিয়ে গেলে স্তম্ভটির উন্নতি কোণ $30°$ হয়। স্তম্ভটির উচ্চতা নির্ণয় করো।

**১০।** কোনো স্থান থেকে একটি মিনারের দিকে $60$ মিটার এগিয়ে আসলে মিনারের শীর্ষ বিন্দুর উন্নতি $45°$ থেকে $60°$ হয়। মিনারটির উচ্চতা নির্ণয় করো।

**১১।** একটি নদীর তীর কোনো এক স্থানে দাঁড়িয়ে একজন লোক দেখল যে, ঠিক সোজাসুজি অপর তীরে অবস্থিত একটি টাওয়ারের উন্নতি কোণ $60°$। ঐ স্থান থেকে $32$ মিটার পিছিয়ে গেলে উন্নতি কোণ $30°$ হয়। টাওয়ারের উচ্চতা এবং নদীর বিস্তার নির্ণয় করো।

**১২।** $64$ মিটার লম্বা একটি খুঁটি ভেঙে গিয়ে সম্পূর্ণ বিচ্ছিন্ন না হয়ে ভূমির সাথে $60°$ উৎপন্ন করে। খুঁটিটির ভাঙা অংশের দৈর্ঘ্য নির্ণয় করো।

**১৩।** একটি গাছ ঝড়ে এমনভাবে ভেঙে গেল যে, ভাঙা অংশ দণ্ডায়মান অংশের সাথে $30°$ কোণ করে গাছের গোড়া থেকে $12$ মিটার দূরে মাটি স্পর্শ করে। সম্পূর্ণ গাছটির দৈর্ঘ্য নির্ণয় করো।

**১৪।** চিত্রে, $CD = 96$ মিটার।
- ক) $\angle CAD$ এর ডিগ্রি পরিমাপ নির্ণয় করো।
- খ) $BC$ এর দৈর্ঘ্য নির্ণয় করো।
- গ) $\triangle ACD$ এর পরিসীমা নির্ণয় করো।

[Figure: Two right triangles sharing vertical side AB.
 Natural description: A point A on top, B directly below on the ground. From B extend ground horizontally to C (closer) and D (farther). Angle ABC = right angle, angle ACB = 60° (at C looking up to A), angle ADB = 30° (at D looking up to A). CD = 96 m.
 TikZ-mappable specifics: A at top, B at bottom (right-angle square). Ground line goes left from B to D, with C between B and D on the line. Slant lines AC and AD drawn. Angle ∠ACB = 60° marked at C, angle ∠ADB = 30° (or similar). CD = 96 মিটার.]

## নমুনা প্রশ্ন

### বহুনির্বাচনি প্রশ্ন

**১।** ভূ-রেখার অপর নাম কী?
- ক) লম্বরেখা
- খ) সমান্তরাল রেখা
- গ) শয়ন রেখা
- ঘ) উর্ধ্বরেখা

**২।** পাশের চিত্রে—
- $(i)\, \angle DAC$ অবনতি কোণ
- $(ii)\, \angle ACB$ উন্নতি কোণ
- $(iii)\, \angle DAC = \angle ACB$

নিচের কোনটি সঠিক?
- ক) $i$ ও $ii$
- খ) $ii$ ও $iii$
- গ) $i$ ও $iii$
- ঘ) $i, ii$ ও $iii$

[Figure: Rectangle with diagonal.
 Natural description: A rectangle (or right-angle quadrilateral) ABCD with diagonal AC drawn.
 TikZ-mappable specifics: Vertices D (top-left), A (top-right), B (bottom-right, right-angle square), C (bottom-left, right-angle square). Diagonal AC drawn. Horizontal sides DA (top) and CB (bottom), vertical sides DC (left) and AB (right). Angle ∠DAC at A (depression), angle ∠ACB at C (elevation). Both right angles marked at B and C.]

পাশের চিত্র অনুযায়ী ৩ ও ৪ নং প্রশ্নের উত্তর দাও।

[Figure: Right triangle ABC.
 Natural description: Right triangle with hypotenuse AC = 8 মিটার, angle 60° at C, right-angle at B.
 TikZ-mappable specifics: A at top, B at bottom-right (right-angle square at B), C at bottom-left. AC = 8 মিটার (hypotenuse, slant). Angle ∠ACB = 60° marked at C. AB vertical, BC horizontal.]

**৩।** $BC$ এর দৈর্ঘ্য হবে?
- ক) $\dfrac{4}{\sqrt{3}}$ মিটার
- খ) $4$ মিটার
- গ) $4\sqrt{2}$ মিটার ঘ) $4\sqrt{3}$ মিটার

**৪।** $AB$ এর দৈর্ঘ্য হবে?
- ক) $\dfrac{4}{\sqrt{3}}$ মিটার
- খ) $4$ মিটার
- গ) $4\sqrt{2}$ মিটার ঘ) $4\sqrt{3}$ মিটার

### সৃজনশীল প্রশ্ন

**৫।** **দৃশ্যকল্প ১:** $16$ মিটার দীর্ঘ একটি মইকে লম্বভাবে দণ্ডায়মান $15$ মিটার উচ্চ একটি দেওয়ালের শীর্ষবিন্দু থেকে কিছুটা নিচে ঠেস দিয়ে রাখা হলো। মইটি ভূমির সাথে $60°$ কোণ উৎপন্ন করে।

**দৃশ্যকল্প ২:** ঝড়ে একটি গাছ এমনভাবে ভেঙে গেল যেন ভাঙা অংশ দণ্ডায়মান অংশের সাথে $60°$ কোণ করে গাছের গোড়া থেকে $7$ মিটার দূরে ভূমি স্পর্শ করে।

- ক) ভূ-রেখা ও উর্ধ্বরেখা অঙ্কন করে উর্ধ্বতল দেখাও।
- খ) মইটিকে দেওয়ালটির শীর্ষ থেকে কত মিটার নিচে ঠেস দিয়ে রাখা হয়েছিল তা নির্ণয় করো।
- গ) সম্পূর্ণ গাছটির দৈর্ঘ্য নির্ণয় করো।

### সংক্ষিপ্ত-উত্তর প্রশ্ন

**৬।** ক) ভূতলে অবস্থিত $P$ বিন্দুতে ভূমির উপর থাকা $O$ বিন্দুর উন্নতি কোণ চিত্র অঙ্কন করে চিহ্নিত করো।
- খ) একটি খুঁটির উচ্চতা ও ছায়ার দৈর্ঘ্যের $\dfrac{1}{\sqrt{3}}$ গুণ হলে, সূর্যের উন্নতি কোণ নির্ণয় করো।
- গ) $3$ মিটার দীর্ঘ একটি মই একটি ভূমির সাথে $60°$ কোণ উৎপন্ন করে কোনো দেওয়ালের শীর্ষবিন্দুকে স্পর্শ করে রাখা আছে। দেওয়ালটির উচ্চতা নির্ণয় করো।

> **OCR Quality Notes (Pass 2 @ 15-18x scale):**
> - All 6 worked examples (উদাহরণ ১-৬) preserved with full intermediate steps
> - Definitions of ভূ-রেখা, উর্ধ্বরেখা, উর্ধ্বতল, উন্নতি কোণ, অবনতি কোণ verbatim
> - Reference triangles for 30°/45°/60° sketching guidance preserved
> - 1 অনুশীলনী (১৪ items) + নমুনা প্রশ্ন captured
> - **All right-triangle elevation/depression figures rendered as TikZ-friendly [Figure: ...] placeholders** — two-layer (natural-language description + TikZ-mappable specifics with vertex placement, side lengths, angle measures, right-angle markers)
>
> **Items flagged for further verification (preserved as-read):**
> - *[verify]* অনুশীলনী ১০ #৯: both elevation angles printed as $30°$ (first observation and after 25 m back-step) — but if both angles are equal there is no solution; likely source typo (should be different angles, e.g. $30°$ → $15°$ or similar). Preserved verbatim.
> - *[verify]* অনুশীলনী ১০ #১: "একটি দণ্ডের দৈর্ঘ্যের বর্গ তার ছায়ার দৈর্ঘ্যের এক তৃতীয়াংশ" — wording could mean "length = √(shadow/3)" or "length squared = shadow/3"; preserved literally
> - *[verify]* নমুনা প্রশ্ন #২: rectangle figure ABCD with diagonal — vertex placement (D top-left, A top-right, B bottom-right, C bottom-left) inferred from figure; check if source uses different convention
