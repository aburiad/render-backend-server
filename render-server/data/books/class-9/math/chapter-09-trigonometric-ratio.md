---
class: 9
subject: math
chapter_no: 9
chapter_title_bn: ত্রিকোণমিতিক অনুপাত
chapter_title_en: Trigonometric Ratio
book_pages: "174-196"
pdf_pages: "179-201"
source: "Secondary (BV) 2026 — Class 9-10 Math (NCTB)"
ocr_method: "Claude vision @ 15x scale + self-verified at 18x"
ocr_pass: 2
fidelity: "same-to-same — all definitions, identities, and proofs preserved verbatim; figures as detailed TikZ-friendly placeholders"
subchapters:
  - id: "9.1"
    title: "সমকোণী ত্রিভুজের বাহুর নামকরণ ও সদৃশতার ধ্রুবতা"
    heading: "## ৯.১ সমকোণী ত্রিভুজের বাহুগুলোর নামকরণ"
    type: "concept"
  - id: "9.2"
    title: "সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত"
    heading: "## ৯.২ সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত"
    type: "concept"
  - id: "9.3"
    title: "ত্রিকোণমিতিক অভেদাবলি"
    heading: "## ৯.৩ ত্রিকোণমিতিক অভেদাবলি"
    type: "concept"
  - id: "9.ex1"
    title: "অনুশীলনী ৯.১"
    heading: "## অনুশীলনী ৯.১"
    type: "exercise"
  - id: "9.4"
    title: "বিশেষ কিছু কোণের ত্রিকোণমিতিক অনুপাত"
    heading: "## ৯.৪ বিশেষ কিছু কোণের ত্রিকোণমিতিক অনুপাত"
    type: "concept"
  - id: "9.5"
    title: "পূরক কোণের ও $0°, 90°$ কোণের ত্রিকোণমিতিক অনুপাত"
    heading: "## ৯.৫ পূরক কোণের ও $0°, 90°$ কোণের ত্রিকোণমিতিক অনুপাত"
    type: "concept"
  - id: "9.ex2"
    title: "অনুশীলনী ৯.২"
    heading: "## অনুশীলনী ৯.২"
    type: "exercise"
  - id: "9.sample"
    title: "নমুনা প্রশ্ন"
    heading: "## নমুনা প্রশ্ন"
    type: "sample"
---

# নবম অধ্যায় — ত্রিকোণমিতিক অনুপাত (Trigonometric Ratio)

## ভূমিকা

আমরা প্রতিনিয়ত ত্রিভুজ, বিশেষ করে সমকোণী ত্রিভুজের ব্যবহার করে থাকি। আমাদের চারিদিকের পরিবেশে নানা উদাহরণ দেখা যায় যেখানে কম্পাসে সমকোণী ত্রিভুজ গঠন করা যায়। সেই প্রাচীন যুগে মানুষ জ্যামিতির সাহায্যে নদীর তীরে দাঁড়িয়ে নদীর প্রস্থ নির্ণয় করার কৌশল শিখেছিল। গাছে বা উঠতে গাছের ছায়ার সাথে লাঠির তুলনা করে নিযুক্তভাবে গাছের উচ্চতা মাপতে শিখেছিল। এই গাণিতিক কৌশল শেখানোর জন্য সৃষ্টি হয়েছে ত্রিকোণমিতি নামে গণিতের এক বিশেষ শাখা। Trigonometry শব্দটি দুইটি গ্রীক শব্দ trigonon (অর্থ ত্রিভুজ) ও metron (অর্থ পরিমাপ) দ্বারা গঠিত। ত্রিকোণমিতিকে ভূমি-ব্যবহার ব্যবহারের নিদর্শন রয়েছে। মিশরীয়রা ভূমি জরিপ ও প্রকৌশল কাজের বহুল ব্যবহার করে বলে ধারণা করা হয়। এর সাহায্যে জ্যোতির্বিদরা পৃথিবী থেকে দূরবর্তী গ্রহ-নক্ষত্রের দূরত্ব নির্ণয় করতেন। বর্তমানে ত্রিকোণমিতির ব্যবহার গণিতের সকল শাখায়। ত্রিভুজ সংক্রান্ত সমস্যা সমাধান, নেভিগেশন ইত্যাদি ক্ষেত্রে ত্রিকোণমিতির ব্যাপক ব্যবহার হয়ে থাকে। জ্যোতির্বিদ্যা, ক্যালকুলাসসহ গণিতের অন্যান্য গুরুত্বপূর্ণ শাখায় ত্রিকোণমিতির ব্যবহার রয়েছে।

এ অধ্যায় শেষে শিক্ষার্থীরা—

- সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত বর্ণনা করতে পারবে;
- সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাতগুলোর মধ্যে পারস্পরিক সম্পর্ক নির্ণয় করতে পারবে;
- সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাতগুলোর ধ্রুবতা যাচাই করে প্রমাণ ও গাণিতিক সমস্যা সমাধান করতে পারবে;
- জ্যামিতিক পদ্ধতিতে $30°, 45°, 60°$ কোণের ত্রিকোণমিতিক অনুপাতের মান নির্ণয় ও প্রয়োগ করতে পারবে;
- $0°$ ও $90°$ কোণের অর্থপূর্ণ ত্রিকোণমিতিক অনুপাতগুলোর মান নির্ণয় ও প্রয়োগ করতে পারবে;
- ত্রিকোণমিতিক অভেদাবলি প্রমাণ করতে পারবে;
- ত্রিকোণমিতিক অভেদাবলি প্রয়োগ করতে পারবে।

## ৯.১ সমকোণী ত্রিভুজের বাহুগুলোর নামকরণ

আমরা জানি, সমকোণী ত্রিভুজের বাহুগুলো অতিভুজ, ভূমি ও উন্নতি নামে অভিহিত হয়। ত্রিভুজের আনুভূমিক অবস্থানের জন্য ও নামসমূহ সার্থক। আবার সমকোণী ত্রিভুজের সূক্ষ্মকোণদ্বয়ের একটির সাপেক্ষে অবস্থানের প্রেক্ষিতেও বাহুগুলোর নামকরণ করা হয়। যথা:

১. 'অতিভুজ (hypotenuse)', সমকোণী ত্রিভুজের বৃহত্তম বাহু যা সমকোণের বিপরীত বাহু।
২. 'বিপরীত বাহু (opposite side)', যা প্রদত্ত কোণের সরাসরি বিপরীত দিকের বাহু।
৩. 'সন্নিহিত বাহু (adjacent side)', যা প্রদত্ত কোণ সৃষ্টিকারী একটি রেখাংশ।

[Figure: Two right triangles side by side, both at vertex O.
 Natural description: Two congruent-looking right triangles. Left triangle has acute angle marked at O on the left; right triangle has acute angle marked at O on the right. Hypotenuse OP slants from O upward to vertex P.
 TikZ-mappable specifics: Left triangle vertices O (bottom-left, acute angle marked), N (bottom-right, right-angle square), P (top-right). Right-angle square at N. Hypotenuse OP, opposite side PN (vertical leg), adjacent side ON (horizontal leg). Right triangle is the mirror image. Acute angles marked at O. Label the angles ∠PON in left figure and ∠OPN in right figure.]

| $\angle PON$ কোণের জন্য অতিভুজ $OP$, সন্নিহিত বাহু $ON$, বিপরীত বাহু $PN$ | $\angle OPN$ কোণের জন্য অতিভুজ $OP$, সন্নিহিত বাহু $PN$, বিপরীত বাহু $ON$ |
|---|---|

জ্যামিতিক চিত্রের শীর্ষবিন্দু চিহ্নিত করার জন্য হাতের বর্ণ ও ছোট হাতের বর্ণ ব্যবহার করা হয়। কোণ নির্দেশের জন্য প্রায়শই গ্রিক বর্ণমালার ছয়টি বহুল ব্যবহৃত হয়। গ্রিক বর্ণ ও সেগুলোর বাংলা নাম নিচে দেওয়া হলো:

| alpha $\alpha$ | beta $\beta$ | gamma $\gamma$ | theta $\theta$ | phi $\phi$ | omega $\omega$ |
|---|---|---|---|---|---|
| আলফা | বিটা | গামা | থিটা | ফাই | ওমেগা |

প্রাচীন গ্রিসের বিখ্যাত গণিতবিদদের হাত ধরেই জ্যামিতি ও ত্রিকোণমিতিতে গ্রিক বর্ণগুলোর ব্যবহার শুরু হয়েছিল।

### উদাহরণ ১.

$\theta$ কোণের জন্য অতিভুজ, সন্নিহিত বাহু ও বিপরীত বাহু চিহ্নিত করো।

[Figure: Three right triangles labeled (ক), (খ), (গ).
 Natural description: Three different right triangles with sides numerically/symbolically labeled.
 TikZ-mappable specifics:
 (ক): Right triangle with hypotenuse = 17 (slant), one leg = 8 (vertical), other leg = 15 (horizontal). Angle θ marked at the bottom-left vertex between hypotenuse and horizontal leg.
 (খ): Right triangle with hypotenuse = $r$ (slant), vertical leg = $p$, horizontal leg = $q$. Angle θ at the right-angle vertex's neighbor (between $r$ and $q$).
 (গ): Right triangle GEF with vertices G (top), E (bottom-left), F (bottom-right). Sides labeled: GE, EF, GF. Angle θ marked at one of the acute vertices.]

**সমাধান:**

ক) $\theta$ কোণের জন্য
- অতিভুজ $17$ একক
- বিপরীত বাহু $8$ একক
- সন্নিহিত বাহু $15$ একক

খ) $\theta$ কোণের জন্য
- অতিভুজ $r$
- বিপরীত বাহু $p$
- সন্নিহিত বাহু $q$

গ) $\theta$ কোণের জন্য
- অতিভুজ $EF$
- বিপরীত বাহু $EG$
- সন্নিহিত বাহু $FG$

### উদাহরণ ২.

$\alpha$ ও $\beta$ কোণের জন্য অতিভুজ, সন্নিহিত বাহু ও বিপরীত বাহুর দৈর্ঘ্য নির্ণয় করো।

[Figure: Right triangle with sides labeled.
 Natural description: A right triangle with one leg = 24 (long horizontal), other leg = 7 (short vertical), hypotenuse = 25 (slant).
 TikZ-mappable specifics: Right triangle with horizontal leg = 24, vertical leg = 7, hypotenuse = 25. Angle α marked at one acute vertex, angle β marked at the other acute vertex. The 24-7-25 forms a Pythagorean triple.]

**সমাধান:**

ক) $\alpha$ কোণের জন্য
- অতিভুজ $25$ একক
- বিপরীত বাহু $24$ একক
- সন্নিহিত বাহু $7$ একক

খ) $\beta$ কোণের জন্য
- অতিভুজ $25$ একক
- বিপরীত বাহু $7$ একক
- সন্নিহিত বাহু $24$ একক

> **কাজ:** $\theta$ ও $\phi$ কোণের জন্য অতিভুজ, সন্নিহিত বাহু ও বিপরীত বাহু নির্দেশ কর।
>
> [Figure: Six small right triangles labeled (a) through (f) showing various orientations.
>  Natural description: Six different right triangles in a 2×3 grid. Each labeled with three vertex letters and one acute angle marked (θ or φ). Numerical side-lengths are given on some.
>  TikZ-mappable specifics:
>  (a) Triangle DEF with vertex labels D (top), E (bottom-left), F (bottom-right). Angle θ at one of the acute vertices.
>  (b) Triangle with sides 12, 5, 13 (Pythagorean triple) at one acute angle marked θ.
>  (c) Right triangle with leg 'd', leg 'g', hypotenuse 'a'. Angle φ marked.
>  (d) Right triangle HIJ — vertices H, I, J with sides marked t, J.
>  (e) Triangle with sides 36, 27, 45 (3-4-5 scaled) and θ marked at acute vertex.
>  (f) Right triangle with sides a, b, c. Angle marked.]

## সদৃশ সমকোণী ত্রিভুজের বাহুগুলোর অনুপাতসমূহের ধ্রুবতা

> **কাজ:** নিচের চারটি সদৃশ সমকোণী ত্রিভুজের বাহুগুলোর দৈর্ঘ্য মেপে সারণিটি পূরণ করো এবং ত্রিভুজের অনুপাতগুলো সম্পর্কে কী লক্ষ করো?
>
> [Figure: Four similar right triangles of increasing size, all with the same shape.
>  Natural description: Four right triangles of progressively larger sizes, all similar to each other (same angles, different scales). Each labeled with vertices A, B, C; (i), (ii), (iii), (iv).
>  TikZ-mappable specifics: All four triangles have vertices labeled A (top or bottom-right depending on orientation), B (right-angle corner), C. Same acute angle at A. Sides BC, AB, AC. Triangle sizes scale by some factor. Arrangement: triangle (i) smallest at left, (ii) slightly larger, (iii) largest in the middle, (iv) smaller at right.]
>
> | বাহুর দৈর্ঘ্য | অনুপাত (কোণের সাপেক্ষে) |
> |---|---|
> | $BC \quad AB \quad AC$ | $BC/AC \quad AB/AC \quad BC/AB$ |
> | | |

মনে করি, $\angle XOA$ একটি সূক্ষ্মকোণ। $OA$ বাহুতে যেকোনো একটি বিন্দু $P$ নিই। $P$ থেকে $OX$ বাহু পর্যন্ত $PM$ লম্ব টানি। ফলে একটি সমকোণী ত্রিভুজ $POM$ গঠিত হলো। এই $\triangle POM$ এর $PM, OM$ ও $OP$ বাহুগুলোর যে তিনটি অনুপাত পাওয়া যায় এদের $OA$ বাহুতে নির্বাচিত $P$ বিন্দুর অবস্থানের ওপর নির্ভর করে না।

$\angle XOA$ কোণের অন্তর্গত $OA$ বাহুতে যেকোনো বিন্দু $P$ ও $P_1$ থেকে $OX$ বাহু পর্যন্ত যথাক্রমে $PM$ ও $P_1 M_1$ লম্ব অঙ্কন করলাম। $\triangle POM$ ও $\triangle P_1 OM_1$ দুইটি সদৃশ সমকোণী ত্রিভুজ গঠিত হয়।

[Figure: Ray OX horizontal from O, ray OA making acute angle θ above OX.
 Natural description: From origin O, two rays — one horizontal (OX) and one going up-right at angle θ (OA). Two points P and P₁ are taken on ray OA at different distances from O. Perpendiculars PM and P₁M₁ are dropped from P and P₁ to the horizontal ray OX, meeting it at M and M₁ respectively. This forms two nested similar right triangles.
 TikZ-mappable specifics: O at origin. X-axis going right (ray OX). Ray OA at angle θ above x-axis. Point P on OA closer to O; perpendicular PM down to OX with right-angle at M. Point P₁ on OA farther from O; perpendicular P₁M₁ down to OX with right-angle at M₁. M lies between O and M₁ on OX. Two similar right triangles ΔPOM and ΔP₁OM₁ with common vertex O and angle θ at O.]

এখন, $\triangle POM \sim \triangle P_1 OM_1$ সদৃশ হওয়ায়,

$\dfrac{PM}{P_1 M_1} = \dfrac{OP}{OP_1}$ বা, $\dfrac{PM}{OP} = \dfrac{P_1 M_1}{OP_1}$

$\dfrac{OM}{OM_1} = \dfrac{OP}{OP_1}$ বা, $\dfrac{OM}{OP} = \dfrac{OM_1}{OP_1}$

$\dfrac{PM}{P_1 M_1} = \dfrac{OM}{OM_1}$ বা, $\dfrac{PM}{OM} = \dfrac{P_1 M_1}{OM_1}$

অর্থাৎ, অনুপাতসমূহের প্রত্যেকটি ধ্রুবক। এই অনুপাতসমূহকে ত্রিকোণমিতিক অনুপাত বলে।

## ৯.২ সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত

মনে করি, $\angle XOA$ একটি সূক্ষ্মকোণ। $OA$ বাহুতে যেকোনো একটি বিন্দু $P$ নিই। $P$ থেকে $OX$ বাহু পর্যন্ত $PM$ লম্ব টানি। ফলে একটি সমকোণী ত্রিভুজ $POM$ গঠিত হলো। এই $\triangle POM$ এর $PM, OM$ ও $OP$ বাহুগুলোর যে ছয়টি অনুপাত পাওয়া যায় এদের $\angle XOA$ এর ত্রিকোণমিতিক অনুপাত বলা হয় এবং এদের প্রত্যেকটিকে এক একটি সুনির্দিষ্ট নামে নামকরণ করা হয়।

$\angle XOA$ সাপেক্ষে সমকোণী ত্রিভুজ $POM$ এ $PM$ বিপরীত বাহু, $OM$ সন্নিহিত বাহু, $OP$ অতিভুজ। যদি $\angle XOA = \theta$ ধরি, $\theta$ কোণের যে ছয়টি ত্রিকোণমিতিক অনুপাত পাওয়া যায় তা নিয়ে বর্ণনা করা হলো।

চিত্র থেকে,

[Figure: Right triangle with acute angle θ at origin.
 Natural description: A right triangle drawn at origin O with the right-angle at M on the horizontal axis. Angle θ at O.
 TikZ-mappable specifics: O at origin, horizontal x-axis to the right. Point M on x-axis to the right of O. Point P above M (vertical). Right-angle small-square mark at M. Triangle OMP with: angle θ marked at O, right angle at M, third angle at P. PM = "বিপরীত বাহু" (opposite side to θ), OM = "সন্নিহিত বাহু" (adjacent), OP = "অতিভুজ" (hypotenuse). Label A above and to the right beyond P on the slanted ray OA.]

$\sin \theta = \dfrac{PM}{OP} = \dfrac{\text{বিপরীত বাহু}}{\text{অতিভুজ}}$ [$\theta$ কোণের সাইন (sine)]

$\cos \theta = \dfrac{OM}{OP} = \dfrac{\text{সন্নিহিত বাহু}}{\text{অতিভুজ}}$ [$\theta$ কোণের কোসাইন (cosine)]

$\tan \theta = \dfrac{PM}{OM} = \dfrac{\text{বিপরীত বাহু}}{\text{সন্নিহিত বাহু}}$ [$\theta$ কোণের ট্যানজেন্ট (tangent)]

এবং এদের বিপরীত অনুপাত

$\cosec \theta = \dfrac{1}{\sin \theta}$ [$\theta$ কোণের কোসেক্যান্ট (cosecant)]

$\sec \theta = \dfrac{1}{\cos \theta}$ [$\theta$ কোণের সেক্যান্ট (secant)]

$\cot \theta = \dfrac{1}{\tan \theta}$ [$\theta$ কোণের কোট্যানজেন্ট (cotangent)]

লক্ষ করি, $\sin \theta$ প্রতীকটি $\theta$ কোণের সাইন-এর অনুপাতকে বোঝায়; $\sin$ এর গুণফলকে নয়। $\theta$ বাদে $\sin$ কোনো কোনো অর্থ বহন করে না। ত্রিকোণমিতিক অন্যান্য অনুপাতের ক্ষেত্রে বিষয়টি একই।

### ত্রিকোণমিতিক অনুপাতগুলোর সম্পর্ক

মনে করি, $\angle XOA = \theta$ একটি সূক্ষ্মকোণ।

পাশের চিত্র সংজ্ঞানুসারে,

$\sin \theta = \dfrac{PM}{OP}, \ \cosec \theta = \dfrac{1}{\sin \theta} = \dfrac{OP}{PM}$

$\cos \theta = \dfrac{OM}{OP}, \ \sec \theta = \dfrac{1}{\cos \theta} = \dfrac{OP}{OM}$

$\tan \theta = \dfrac{PM}{OM}, \ \cot \theta = \dfrac{1}{\tan \theta} = \dfrac{OM}{PM}$

আবার, $\tan \theta = \dfrac{PM}{OM} = \dfrac{PM/OP}{OM/OP}$ [লব ও হরকে $OP$ দ্বারা ভাগ করে]

বা, $\tan \theta = \dfrac{\sin \theta}{\cos \theta}$

$\therefore \boxed{\tan \theta = \dfrac{\sin \theta}{\cos \theta}}$

এবং একইভাবে, $\boxed{\cot \theta = \dfrac{\cos \theta}{\sin \theta}}$

## ৯.৩ ত্রিকোণমিতিক অভেদাবলি

$(i)\, (\sin \theta)^2 + (\cos \theta)^2 = \left(\dfrac{PM}{OP}\right)^2 + \left(\dfrac{OM}{OP}\right)^2$

$= \dfrac{PM^2}{OP^2} + \dfrac{OM^2}{OP^2} = \dfrac{PM^2 + OM^2}{OP^2} = \dfrac{OP^2}{OP^2}$ [পিথাগোরাসের সূত্র]

$= 1$

বা, $(\sin \theta)^2 + (\cos \theta)^2 = 1$

$\therefore \boxed{(\sin \theta)^2 + (\cos \theta)^2 = 1}$

**মন্তব্য:** পূর্ণসংখ্যা সূচক $n$ এর জন্য $(\sin \theta)^n$ কে $\sin^n \theta$ ও $(\cos \theta)^n$ কে $\cos^n \theta$ ইত্যাদি লেখা হয়।

$(ii)\, \sec^2 \theta = (\sec \theta)^2 = \left(\dfrac{OP}{OM}\right)^2$

$= \dfrac{OP^2}{OM^2} = \dfrac{OM^2 + PM^2}{OM^2}$ [$OP$ সমকোণী $\triangle POM$ এর অতিভুজ বলে]

$= \dfrac{OM^2}{OM^2} + \dfrac{PM^2}{OM^2}$

$= 1 + \left(\dfrac{PM}{OM}\right)^2 = 1 + (\tan \theta)^2 = 1 + \tan^2 \theta$

$\therefore \boxed{\sec^2 \theta - \tan^2 \theta = 1}$ এবং $\boxed{\tan^2 \theta = \sec^2 \theta - 1}$

$(iii)\, \cosec^2 \theta = (\cosec \theta)^2 = \left(\dfrac{OP}{PM}\right)^2$

$= \dfrac{OP^2}{PM^2} = \dfrac{PM^2 + OM^2}{PM^2}$ [$OP$ সমকোণী $\triangle POM$ এর অতিভুজ বলে]

$= \dfrac{PM^2}{PM^2} + \dfrac{OM^2}{PM^2} = 1 + \left(\dfrac{OM}{PM}\right)^2$

$= 1 + (\cot \theta)^2 = 1 + \cot^2 \theta$

$\therefore \boxed{\cosec^2 \theta - \cot^2 \theta = 1}$ এবং $\boxed{\cot^2 \theta = \cosec^2 \theta - 1}$

### উদাহরণ ৩.

$\tan A = \dfrac{4}{3}$ হলে, $A$ কোণের অন্যান্য ত্রিকোণমিতিক অনুপাতসমূহ নির্ণয় করো।

**সমাধান:** দেওয়া আছে, $\tan A = \dfrac{4}{3}$।

অতএব, $A$ কোণের বিপরীত বাহু $= 4$, সন্নিহিত বাহু $= 3$

অতিভুজ $= \sqrt{4^2 + 3^2} = \sqrt{25} = 5$

[Figure: Right triangle ABC with right angle at B.
 Natural description: Right triangle with right angle at vertex B (bottom-right). Vertical leg BC = 4 (opposite to A), horizontal leg AB = 3 (adjacent to A), hypotenuse AC = 5.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right (right-angle square at B), C at top-right. AB = 3 (horizontal base), BC = 4 (vertical right side), AC = 5 (hypotenuse, slant). Angle A at bottom-left vertex.]

সুতরাং, $\sin A = \dfrac{4}{5}, \cos A = \dfrac{3}{5}, \cot A = \dfrac{3}{4}$

$\cosec A = \dfrac{5}{4}, \sec A = \dfrac{5}{3}$

> **কাজ:** নিচের ত্রিকোণমিতিক সূত্রগুলো সহজে মনে রাখার জন্য তালিকাটি করো।
>
> | $\cosec \theta = \dfrac{1}{\sin \theta}$ | $\tan \theta = \dfrac{\sin \theta}{\cos \theta}$ | $\sin^2 \theta + \cos^2 \theta = 1$ |
> | $\sec \theta = \dfrac{1}{\cos \theta}$ | $\cot \theta = \dfrac{\cos \theta}{\sin \theta}$ | $\sec^2 \theta = 1 + \tan^2 \theta$ |
> | $\cot \theta = \dfrac{1}{\tan \theta}$ | | $\cosec^2 \theta = 1 + \cot^2 \theta$ |

### উদাহরণ ৪.

$ABC$ সমকোণী ত্রিভুজের $\angle B$ কোণটি সমকোণ। $\tan A = 1$ হলে $2 \sin A \cdot \cos A = 1$ এর সত্যতা যাচাই করো।

**সমাধান:** দেওয়া আছে, $\tan A = 1$

অতএব, বিপরীত বাহু = সন্নিহিত বাহু = $a$

অতিভুজ $= \sqrt{a^2 + a^2} = \sqrt{2a^2} = \sqrt{2}a$

[Figure: Right triangle ABC with right angle at B.
 Natural description: Isosceles right triangle — two legs equal length 'a', hypotenuse √2·a.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right (right-angle square), C at top-right. AB = a (horizontal), BC = a (vertical), AC = √2·a (hypotenuse). Angle A = 45°.]

সুতরাং, $\sin A = \dfrac{a}{\sqrt{2}a} = \dfrac{1}{\sqrt{2}}, \cos A = \dfrac{a}{\sqrt{2}a} = \dfrac{1}{\sqrt{2}}$

এখন বামপক্ষ $= 2 \sin A \cdot \cos A = 2 \cdot \dfrac{1}{\sqrt{2}} \cdot \dfrac{1}{\sqrt{2}} = 1$

$\therefore 2 \sin A \cdot \cos A = 1$ উক্তিটি সত্য।

> **কাজ:** $ABC$ সমকোণী ত্রিভুজের $\angle C$ সমকোণ, $AB = 29$ সে.মি., $BC = 21$ সে.মি. এবং $\angle ABC = \theta$ হলে, $\cos^2 \theta - \sin^2 \theta$ এর মান বের করো।

### উদাহরণ ৫.

প্রমাণ করো যে, $\tan \theta + \cot \theta = \sec \theta \cdot \cosec \theta$

**সমাধান:** বামপক্ষ $= \tan \theta + \cot \theta$

$= \dfrac{\sin \theta}{\cos \theta} + \dfrac{\cos \theta}{\sin \theta}$

$= \dfrac{\sin^2 \theta + \cos^2 \theta}{\sin \theta \cdot \cos \theta}$

$= \dfrac{1}{\sin \theta \cdot \cos \theta}$ [$\because \sin^2 \theta + \cos^2 \theta = 1$]

$= \dfrac{1}{\sin \theta} \cdot \dfrac{1}{\cos \theta}$

$= \cosec \theta \cdot \sec \theta$

$= \sec \theta \cdot \cosec \theta = $ ডানপক্ষ (প্রমাণিত)

### উদাহরণ ৬.

প্রমাণ করো যে, $\sec^2 \theta + \cosec^2 \theta = \sec^2 \theta \cdot \cosec^2 \theta$

**সমাধান:**

বামপক্ষ $= \sec^2 \theta + \cosec^2 \theta$

$= \dfrac{1}{\cos^2 \theta} + \dfrac{1}{\sin^2 \theta}$

$= \dfrac{\sin^2 \theta + \cos^2 \theta}{\cos^2 \theta \cdot \sin^2 \theta}$

$= \dfrac{1}{\cos^2 \theta \cdot \sin^2 \theta}$

$= \dfrac{1}{\cos^2 \theta} \cdot \dfrac{1}{\sin^2 \theta}$

$= \sec^2 \theta \cdot \cosec^2 \theta$

$= $ ডানপক্ষ (প্রমাণিত)

### উদাহরণ ৭.

প্রমাণ করো যে, $\dfrac{1}{1 + \sin^2 \theta} + \dfrac{1}{1 + \cosec^2 \theta} = 1$

**সমাধান:**

বামপক্ষ $= \dfrac{1}{1 + \sin^2 \theta} + \dfrac{1}{1 + \cosec^2 \theta}$

$= \dfrac{1}{1 + \sin^2 \theta} + \dfrac{1}{1 + \dfrac{1}{\sin^2 \theta}}$

$= \dfrac{1}{1 + \sin^2 \theta} + \dfrac{\sin^2 \theta}{1 + \sin^2 \theta}$

$= \dfrac{1 + \sin^2 \theta}{1 + \sin^2 \theta}$

$= 1 = $ ডানপক্ষ (প্রমাণিত)

### উদাহরণ ৮.

প্রমাণ করো: $\dfrac{1}{2 - \sin^2 \theta} + \dfrac{1}{2 + \tan^2 \theta} = 1$

**সমাধান:**

বামপক্ষ $= \dfrac{1}{2 - \sin^2 \theta} + \dfrac{1}{2 + \tan^2 \theta}$

$= \dfrac{1}{2 - \sin^2 \theta} + \dfrac{1}{2 + \dfrac{\sin^2 \theta}{\cos^2 \theta}}$

$= \dfrac{1}{2 - \sin^2 \theta} + \dfrac{\cos^2 \theta}{2 \cos^2 \theta + \sin^2 \theta}$

$= \dfrac{1}{2 - \sin^2 \theta} + \dfrac{\cos^2 \theta}{2(1 - \sin^2 \theta) + \sin^2 \theta}$

$= \dfrac{1}{2 - \sin^2 \theta} + \dfrac{\cos^2 \theta}{2 - 2 \sin^2 \theta + \sin^2 \theta}$

$= \dfrac{1}{2 - \sin^2 \theta} + \dfrac{1 - \sin^2 \theta}{2 - \sin^2 \theta}$

$= \dfrac{2 - \sin^2 \theta}{2 - \sin^2 \theta}$

$= 1 = $ ডানপক্ষ (প্রমাণিত)

### উদাহরণ ৯.

প্রমাণ করো: $\dfrac{\tan A}{\sec A + 1} - \dfrac{\sec A - 1}{\tan A} = 0$

**সমাধান:**

বামপক্ষ $= \dfrac{\tan A}{\sec A + 1} - \dfrac{\sec A - 1}{\tan A}$

$= \dfrac{\tan^2 A - (\sec^2 A - 1)}{(\sec A + 1)\tan A}$

$= \dfrac{\tan^2 A - \tan^2 A}{(\sec A + 1)\tan A} \quad [\because \sec^2 A - 1 = \tan^2 A]$

$= \dfrac{0}{(\sec A + 1)\tan A} = 0 = $ ডানপক্ষ (প্রমাণিত)

### উদাহরণ ১০.

প্রমাণ করো: $\sqrt{\dfrac{1 - \sin A}{1 + \sin A}} = \sec A - \tan A$

**সমাধান:**

বামপক্ষ $= \sqrt{\dfrac{1 - \sin A}{1 + \sin A}}$

$= \sqrt{\dfrac{(1 - \sin A)(1 - \sin A)}{(1 + \sin A)(1 - \sin A)}}$ [লব ও হরকে $\sqrt{1 - \sin A}$ দ্বারা গুণ করে]

$= \sqrt{\dfrac{(1 - \sin A)^2}{1 - \sin^2 A}}$

$= \sqrt{\dfrac{(1 - \sin A)^2}{\cos^2 A}}$

$= \dfrac{1 - \sin A}{\cos A}$

$= \dfrac{1}{\cos A} - \dfrac{\sin A}{\cos A}$

$= \sec A - \tan A = $ ডানপক্ষ (প্রমাণিত)

### উদাহরণ ১১.

$\tan A + \sin A = a$ এবং $\tan A - \sin A = b$ হলে, প্রমাণ করো যে, $a^2 - b^2 = 4\sqrt{ab}$

**সমাধান:** এখানে প্রদত্ত, $\tan A + \sin A = a$ এবং $\tan A - \sin A = b$

বামপক্ষ $= a^2 - b^2$

$= (\tan A + \sin A)^2 - (\tan A - \sin A)^2$

$= 4 \tan A \cdot \sin A \quad [\because (a + b)^2 - (a - b)^2 = 4ab]$

$= 4 \sqrt{\tan^2 A \cdot \sin^2 A}$

$= 4 \sqrt{\tan^2 A (1 - \cos^2 A)}$

$= 4 \sqrt{\tan^2 A - \tan^2 A \cdot \cos^2 A}$

$= 4 \sqrt{\tan^2 A - \sin^2 A} \quad [\because \tan A = \dfrac{\sin A}{\cos A}]$

$= 4 \sqrt{(\tan A + \sin A)(\tan A - \sin A)}$

$= 4 \sqrt{ab}$

$= $ ডানপক্ষ (প্রমাণিত)

> **কাজ:**
> ক) $\cot^4 A - \cot^2 A = 1$ হলে, প্রমাণ করো যে, $\cos^4 A + \cos^2 A = 1$
> খ) $\sin^4 A + \sin^2 A = 1$ হলে, প্রমাণ করো যে, $\tan^4 A - \tan^2 A = 1$

### উদাহরণ ১২.

$\sec A + \tan A = \dfrac{5}{2}$ হলে, $\sec A - \tan A$ এর মান নির্ণয় করো।

**সমাধান:** এখানে প্রদত্ত, $\sec A + \tan A = \dfrac{5}{2} \ldots (1)$

আমরা জানি, $\sec^2 A = 1 + \tan^2 A$

বা, $\sec^2 A - \tan^2 A = 1$

বা, $(\sec A + \tan A)(\sec A - \tan A) = 1$

বা, $\dfrac{5}{2}(\sec A - \tan A) = 1 \ [(1)$ হতে$]$

$\therefore \sec A - \tan A = \dfrac{2}{5}$

## অনুশীলনী ৯.১

**১।** নিচের গাণিতিক উক্তিগুলোর সত্য-মিথ্যা যাচাই করো। তোমার উত্তরের পক্ষে যুক্তি দাও।
- ক) $\tan A$ এর মান সর্বদা $1$ এর চেয়ে কম।
- খ) $\cot A$ হলো $\cot$ ও $A$ এর গুণফল।
- গ) $A$ এর কোন একটি মানের জন্য $\sec A = \dfrac{12}{5}$।
- ঘ) $\cos$ হলো cotangent এর সংক্ষিপ্ত রূপ।

**২।** $\sin A = \dfrac{3}{4}$ হলে, $A$ কোণের অন্যান্য ত্রিকোণমিতিক অনুপাত নির্ণয় করো।

**৩।** দেওয়া আছে, $15 \cot A = 8$, $\sin A$ ও $\sec A$ এর মান বের করো।

**৪।** $ABC$ সমকোণী ত্রিভুজের $\angle C$ সমকোণ, $AB = 13$ সে.মি., $BC = 12$ সে.মি. এবং $\angle ABC = \theta$ হলে, $\sin \theta, \cos \theta$ ও $\tan \theta$ এর মান বের করো।

**৫।** $ABC$ সমকোণী ত্রিভুজের $\angle B$ কোণটি সমকোণ। $\tan A = \sqrt{3}$ হলে, $\sqrt{3}\sin A \cdot \cos A = \dfrac{3}{4}$ এর সত্যতা যাচাই করো।

প্রমাণ করো (৬-২০):

**৬।** ক) $\dfrac{1}{\sec^2 A} + \dfrac{1}{\cosec^2 A} = 1$
- খ) $\dfrac{1}{\cos^2 A} - \dfrac{1}{\cot^2 A} = 1$
- গ) $\dfrac{1}{\sin^2 A} - \dfrac{1}{\tan^2 A} = 1$

**৭।** ক) $\dfrac{\sin A}{\cosec A} + \dfrac{\cos A}{\sec A} = 1$
- খ) $\dfrac{\sec A}{\cos A} - \dfrac{\tan A}{\cot A} = 1$
- গ) $\dfrac{1}{1 + \sin^2 A} + \dfrac{1}{1 + \cosec^2 A} = 1$

**৮।** ক) $\dfrac{\tan A}{1 - \cot A} + \dfrac{\cot A}{1 - \tan A} = \sec A \cdot \cosec A + 1$
- খ) $\dfrac{1}{1 + \tan^2 A} + \dfrac{1}{1 + \cot^2 A} = 1$

**৯।** $\dfrac{\cos A}{1 - \tan A} + \dfrac{\sin A}{1 - \cot A} = \sin A + \cos A$

**১০।** $\tan A \sqrt{1 - \sin^2 A} = \sin A$

**১১।** $\dfrac{\sec A + \tan A}{\cosec A + \cot A} = \dfrac{\cosec A - \cot A}{\sec A - \tan A}$

**১২।** $\dfrac{\cosec A}{\cosec A - 1} + \dfrac{\cosec A}{\cosec A + 1} = 2 \sec^2 A$

**১৩।** $\dfrac{1}{1 + \sin A} + \dfrac{1}{1 - \sin A} = 2 \sec^2 A$

**১৪।** $\dfrac{1}{\cosec A - 1} - \dfrac{1}{\cosec A + 1} = 2 \tan^2 A$

**১৫।** $\dfrac{\sin A}{1 - \cos A} + \dfrac{1 - \cos A}{\sin A} = 2 \cosec A$

**১৬।** $\dfrac{\tan A}{\sec A + 1} - \dfrac{\sec A - 1}{\tan A} = 0$

**১৭।** $(\tan \theta + \sec \theta)^2 = \dfrac{1 + \sin \theta}{1 - \sin \theta}$

**১৮।** $\dfrac{\cot A + \tan B}{\cot B + \tan A} = \cot A \cdot \tan B$

**১৯।** $\sqrt{\dfrac{1 - \sin A}{1 + \sin A}} = \sec A - \tan A$

**২০।** $\sqrt{\dfrac{\sec A + 1}{\sec A - 1}} = \cot A + \cosec A$

**২১।** $\cos A + \sin A = \sqrt{2}\cos A$ হলে, তবে প্রমাণ করো যে, $\cos A - \sin A = \sqrt{2}\sin A$

**২২।** যদি $\tan A = \dfrac{1}{\sqrt{3}}$ হয়, তবে $\dfrac{\cosec^2 A - \sec^2 A}{\cos^2 A + \sec^2 A}$ এর মান নির্ণয় করো।

**২৩।** $\cosec A - \cot A = \dfrac{4}{3}$ হলে, $\cosec A + \cot A$ এর মান কত?

**২৪।** $\cot A = \dfrac{b}{a}$ হলে, $\dfrac{a\sin A - b\cos A}{a\sin A + b\cos A}$ এর মান নির্ণয় করো।

**২৫।** $\cosec A - \cot A = x$ এবং $\cosec A + \cot A = y$
- ক) $\sin \theta = \dfrac{5}{13}$ হলে, $\sec \theta$ এর মান নির্ণয় করো।
- খ) দেখাও যে, $\sec A = \dfrac{1 + x^2}{1 - x^2}$
- গ) $\dfrac{x}{y} = 7 - 4\sqrt{3}$ হলে, $A$ এর মান নির্ণয় করো।

## ৯.৪ বিশেষ কিছু কোণের ত্রিকোণমিতিক অনুপাত

### $30°, 45°$ ও $60°$ কোণের ত্রিকোণমিতিক অনুপাত

জ্যামিতিক উপায়ে $30°, 45°$ ও $60°$ পরিমাপের কোণ আঁকতে শিখেছি। এ সকল কোণের ত্রিকোণমিতিক অনুপাতের প্রকৃত মান জ্যামিতিক পদ্ধতিতে নির্ণয় করা যায়।

### $30°$ ও $60°$ কোণের ত্রিকোণমিতিক অনুপাত:

মনে করি, $\angle XOZ = 30°$ এবং $OZ$ বাহুতে $P$ একটি বিন্দু। $PM \perp OX$ আঁকি এবং $PM$ কে $Q$ পর্যন্ত বর্ধিত করি যেন $MQ = PM$ হয়। $O, Q$ যোগ করে $Z'$ পর্যন্ত বর্ধিত করি।

এখন $\triangle POM$ ও $\triangle QOM$ এর মধ্যে $PM = QM$

$OM$ সাধারণ বাহু এবং

অন্তর্ভুক্ত $\angle PMO = $ অন্তর্ভুক্ত $\angle QMO = 90°$

$\therefore \triangle POM \cong \triangle QOM$

অতএব, $\angle QOM = \angle POM = 30°$

এবং $\angle OQM = \angle OPM = 60°$

আবার, $\angle POQ = \angle POM + \angle QOM = 30° + 30° = 60°$

$\therefore \triangle OPQ$ একটি সমবাহু ত্রিভুজ।

যদি $OP = 2a$ হয়, তবে $PM = \dfrac{1}{2}PQ = \dfrac{1}{2}OP = a$ [যেহেতু $\triangle OPQ$ একটি সমবাহু ত্রিভুজ]

সমকোণী $\triangle OPM$ হতে পাই,

$OM = \sqrt{OP^2 - PM^2} = \sqrt{4a^2 - a^2} = \sqrt{3}a$

[Figure: 30°-60°-90° construction.
 Natural description: A horizontal ray OX from O to the right. Ray OZ goes up-right at 30° above OX. Point P on OZ. Perpendicular PM dropped from P down to OX, then extended below to Q such that MQ = PM, giving the equilateral triangle OPQ.
 TikZ-mappable specifics: O at origin. Horizontal axis going right (OX); X′ direction reflected. Ray OZ at +30° above OX; ray OZ′ at −30° below OX (reflected). Point P on OZ; perpendicular drops to M on OX, then continues to Q on OZ′ such that MQ = PM. Triangle OPQ equilateral. OP = OQ = PQ = 2a; OM = √3·a; PM = MQ = a. 30° marked at O (above and below), 60° marked at P. Right-angle square at M. Labels P (top), M (on OX), Q (bottom), Z (upper-right past P), Z' (lower-right past Q), X (far right of OX).]

ত্রিকোণমিতিক অনুপাতসমূহ বের করি:

$\sin 30° = \dfrac{PM}{OP} = \dfrac{a}{2a} = \dfrac{1}{2}, \quad \cos 30° = \dfrac{OM}{OP} = \dfrac{\sqrt{3}a}{2a} = \dfrac{\sqrt{3}}{2}$

$\tan 30° = \dfrac{PM}{OM} = \dfrac{a}{\sqrt{3}a} = \dfrac{1}{\sqrt{3}}$

$\cosec 30° = \dfrac{OP}{PM} = \dfrac{2a}{a} = 2, \quad \sec 30° = \dfrac{OP}{OM} = \dfrac{2a}{\sqrt{3}a} = \dfrac{2}{\sqrt{3}}$

$\cot 30° = \dfrac{OM}{PM} = \dfrac{\sqrt{3}a}{a} = \sqrt{3}$

একইভাবে,

$\sin 60° = \dfrac{OM}{OP} = \dfrac{\sqrt{3}a}{2a} = \dfrac{\sqrt{3}}{2}, \quad \cos 60° = \dfrac{PM}{OP} = \dfrac{a}{2a} = \dfrac{1}{2},$

$\tan 60° = \dfrac{OM}{PM} = \dfrac{\sqrt{3}a}{a} = \sqrt{3}$

$\cosec 60° = \dfrac{OP}{OM} = \dfrac{2a}{\sqrt{3}a} = \dfrac{2}{\sqrt{3}}, \quad \sec 60° = \dfrac{OP}{PM} = \dfrac{2a}{a} = 2,$

$\cot 60° = \dfrac{PM}{OM} = \dfrac{a}{\sqrt{3}a} = \dfrac{1}{\sqrt{3}}$

### $45°$ কোণের ত্রিকোণমিতিক অনুপাত:

মনে করি, $\angle XOZ = 45°$ এবং $P, OZ$ এর উপরস্থ একটি বিন্দু। $PM \perp OX$ আঁকি।

$\triangle OPM$ সমকোণী ত্রিভুজে $\angle POM = 45°$

সুতরাং, $\angle OPM = 45°$

অতএব, $OM = PM = a$ (মনে করি)

এখন, $OP^2 = OM^2 + PM^2 = a^2 + a^2 = 2a^2$

বা, $OP = \sqrt{2}a$

[Figure: 45°-45°-90° right isosceles triangle.
 Natural description: Horizontal ray OX from O; ray OZ at 45° above. Point P on OZ; perpendicular PM dropped to M on OX.
 TikZ-mappable specifics: O at origin. OX horizontal to the right. OZ ray at +45°. P on OZ. M on OX directly below P. Right-angle square at M. OM = PM = a (both legs equal); OP = √2·a (hypotenuse). 45° marked at O. Labels: O, M (on OX), P (on OZ), Z (above P), X (far right). Z' below not shown here.]

ত্রিকোণমিতিক অনুপাতের সংজ্ঞা থেকে আমরা পাই,

$\sin 45° = \dfrac{PM}{OP} = \dfrac{a}{\sqrt{2}a} = \dfrac{1}{\sqrt{2}}, \quad \cos 45° = \dfrac{OM}{OP} = \dfrac{a}{\sqrt{2}a} = \dfrac{1}{\sqrt{2}}$

$\tan 45° = \dfrac{PM}{OM} = \dfrac{a}{a} = 1$

$\cosec 45° = \dfrac{1}{\sin 45°} = \sqrt{2}, \quad \sec 45° = \dfrac{1}{\cos 45°} = \sqrt{2}$

$\cot 45° = \dfrac{1}{\tan 45°} = 1$

## ৯.৫ পূরক কোণের ও $0°, 90°$ কোণের ত্রিকোণমিতিক অনুপাত

### পূরক কোণের ত্রিকোণমিতিক অনুপাত

আমরা জানি যে, দুইটি সূক্ষ্মকোণের পরিমাপের সমষ্টি $90°$ হলে, এদের একটিকে অপরটির পূরক কোণ বলা হয়। যেমন, $30°$ ও $60°$ এবং $15°$ ও $75°$ পরস্পর পূরক কোণ।

সাধারণভাবে, $\theta$ কোণ ও $(90° - \theta)$ কোণ পরস্পরের পূরক কোণ।

মনে করি, $\angle XOY = \theta$ এবং $P$ এই কোণের $OY$ বাহুর উপর একটি বিন্দু। $PM \perp OX$ আঁকি। যেহেতু ত্রিভুজের তিন কোণের সমষ্টি দুই সমকোণ,

অতএব, $POM$ সমকোণী ত্রিভুজে $\angle PMO = 90°$ এবং $\angle OPM + \angle POM = $ এক সমকোণ $= 90°$

$\angle OPM = 90° - \angle POM = 90° - \theta$ [যেহেতু $\angle POM = \angle XOY = \theta$]

[Figure: Right triangle illustrating complementary angles.
 Natural description: Right triangle OMP with the right angle at M. Acute angle θ at O, complementary angle (90° − θ) at P.
 TikZ-mappable specifics: O at origin (bottom-left). M on horizontal x-axis to the right of O. P directly above M. Right-angle square at M. Angle θ marked at O between OM and OP. Angle (90° − θ) marked at P between PM and PO. Labels: O (bottom-left), M (bottom-right, right angle), P (top-right), Y (above P, extension of OP), X (right, extension of OM).]

$\therefore \sin (90° - \theta) = \dfrac{OM}{OP} = \cos \angle POM = \cos \theta$

$\cos (90° - \theta) = \dfrac{PM}{OP} = \sin \angle POM = \sin \theta$

$\tan (90° - \theta) = \dfrac{OM}{PM} = \cot \angle POM = \cot \theta$

$\cot (90° - \theta) = \dfrac{PM}{OM} = \tan \angle POM = \tan \theta$

$\sec (90° - \theta) = \dfrac{OP}{PM} = \cosec \angle POM = \cosec \theta$

$\cosec (90° - \theta) = \dfrac{OP}{OM} = \sec \angle POM = \sec \theta$

উপরের সূত্রগুলো নিম্নলিখিতভাবে কথায় প্রকাশ করা যায়:

পূরক কোণের sine = কোণের cosine

পূরক কোণের cosine = কোণের sine

পূরক কোণের tangent = কোণের cotangent ইত্যাদি।

> **কাজ:** $\sec (90° - \theta) = \dfrac{5}{3}$ হলে, $\cosec \theta - \cot \theta$ এর মান নির্ণয় করো।

### $0°$ ও $90°$ কোণের ত্রিকোণমিতিক অনুপাত

আমরা সমকোণী ত্রিভুজের সূক্ষ্মকোণ $\theta$ এর জন্য ত্রিকোণমিতিক অনুপাতগুলো নির্ণয় করতে শিখেছি। এবার দেখি, কোণটি ক্রমশ ছোট করা হলে ত্রিকোণমিতিক অনুপাতগুলোর কী ঘটবে। $\theta$ কোণটি যতই ছোট হতে থাকে, বিপরীত বাহু $PN$ এর দৈর্ঘ্য ততই ছোট হয়। $P$ বিন্দুটি $N$ বিন্দুর নিকটতর হয় এবং অবশেষে $\theta$ কোণটি যখন $0°$ এর খুব কাছে অবস্থিত হয়, $OP$ প্রায় $ON$ এর সাথে মিলে যায়।

[Figure: Sequence of four right triangles showing decreasing angle θ from a finite angle down to near 0°.
 Natural description: Four right triangles arranged left-to-right with the same horizontal base ON but with vertex P moving downward toward N (the right-angle corner), making the angle θ at O smaller and smaller in each successive triangle.
 TikZ-mappable specifics: Each triangle has O at left, N on horizontal axis to the right (right-angle corner), and P above N with right-angle square at N. From left to right, P moves down toward N, making the height PN shrink and the angle θ at O become smaller. Hypotenuse OP rotates toward OX (horizontal). Labels in each: O, N, P. By the rightmost triangle, P is nearly at N.]

যখন $\theta$ কোণটি $0°$ এর খুব নিকটে আসে $PN$ রেখাংশের দৈর্ঘ্য কোঠায় নেমে আসে এবং একক্ষেত্রে $\sin \theta = \dfrac{PN}{OP}$ এর মান প্রায় শূন্য। একই সময়, $\theta$ কোণটি $0°$ এর খুব কাছে অবস্থিত $OP$ এর দৈর্ঘ্য $ON$ এর দৈর্ঘ্যের সমান হয়ে যায় ফলে $\cos \theta = \dfrac{ON}{OP}$ এর মান প্রায় $1$।

ত্রিকোণমিতিক আলোচনায় সুবিধার্থে এ সম্পর্কগুলো ধ্রুব মানে অর্থাৎ স্থির অবস্থানে $0°$ কোণের প্রান্তীয় বাহু ও আদি বাহু একই রশ্মি ধরা হয়। সুতরাং পূর্বের আলোচনার সঙ্গে সামঞ্জস্যতা রেখে বলা হয় যে, $\sin 0° = 0, \cos 0° = 1$।

$\theta$ সূক্ষ্মকোণ হলে আমরা দেখেছি,

$\tan \theta = \dfrac{\sin \theta}{\cos \theta}, \cot \theta = \dfrac{\cos \theta}{\sin \theta}$

$\sec \theta = \dfrac{1}{\cos \theta}, \cosec \theta = \dfrac{1}{\sin \theta}$

$0°$ কোণের জন্য সম্ভাব্য ক্ষেত্রে এ সম্পর্কগুলো যাতে বহাল অবস্থানে $0°$ কোণের প্রাপ্তিগত প্রান্ত বাহুর সংজ্ঞায়িত করা হয়:

$\tan 0° = \dfrac{\sin 0°}{\cos 0°} = \dfrac{0}{1} = 0$

$\sec 0° = \dfrac{1}{\cos 0°} = \dfrac{1}{1} = 1$

$0$ দ্বারা ভাগ করা যায় না বিধায় $\cosec 0°$ ও $\cot 0°$ সংজ্ঞায়িত করা যায় না।

আবার, যখন $\theta$ কোণটি $90°$ এর খুব কাছে, অতিভুজ $OP$ প্রায় $PN$ এর সমান। সুতরাং, $\sin \theta$ এর মান প্রায় $1$। অন্যদিকে, $\theta$ কোণটি প্রায় $90°$ এর সমান হলে $ON$ শূন্যের কাছাকাছি; $\cos \theta$ এর মান প্রায় $0$।

সুতরাং, পূর্বে বর্ণিত সূত্রের সঙ্গে সামঞ্জস্যতা রেখে বলা হয়, $\cos 90° = 0, \sin 90° = 1$

$\cot 90° = \dfrac{\cos 90°}{\sin 90°} = \dfrac{0}{1} = 0$

$\cosec 90° = \dfrac{1}{\sin 90°} = \dfrac{1}{1} = 1$

পূর্বের ন্যায় $0$ দ্বারা ভাগ করা যায় না বিধায় $\tan 90°$ ও $\sec 90°$ সংজ্ঞায়িত করা যায় না।

**দ্রষ্টব্য:** ব্যবহারের সুবিধার্থে $0°, 30°, 45°, 60°$ ও $90°$ কোণগুলোর ত্রিকোণমিতিক অনুপাতগুলোর মান নিচের ছকে দেখানো হলো:

| অনুপাত / কোণ | $0°$ | $30°$ | $45°$ | $60°$ | $90°$ |
|---|---|---|---|---|---|
| sine | $0$ | $\dfrac{1}{2}$ | $\dfrac{1}{\sqrt{2}}$ | $\dfrac{\sqrt{3}}{2}$ | $1$ |
| cosine | $1$ | $\dfrac{\sqrt{3}}{2}$ | $\dfrac{1}{\sqrt{2}}$ | $\dfrac{1}{2}$ | $0$ |
| tangent | $0$ | $\dfrac{1}{\sqrt{3}}$ | $1$ | $\sqrt{3}$ | অসংজ্ঞায়িত |
| cotangent | অসংজ্ঞায়িত | $\sqrt{3}$ | $1$ | $\dfrac{1}{\sqrt{3}}$ | $0$ |
| secant | $1$ | $\dfrac{2}{\sqrt{3}}$ | $\sqrt{2}$ | $2$ | অসংজ্ঞায়িত |
| cosecant | অসংজ্ঞায়িত | $2$ | $\sqrt{2}$ | $\dfrac{2}{\sqrt{3}}$ | $1$ |

**লক্ষ করি:** নির্বারিত কয়েকটি কোণের জন্য ত্রিকোণমিতিক মানসমূহ মনে রাখার সহজ উপায়:

$(i)\, 0, 1, 2, 3$ এবং $4$ সংখ্যাগুলোর প্রত্যেকটিকে $4$ দ্বারা ভাগ করে ভাগফলগুলোর বর্গমূল নিলে যথাক্রমে $\sin 0°, \sin 30°, \sin 45°, \sin 60°$ এবং $\sin 90°$ এর মান পাওয়া যায়।

$(ii)\, 4, 3, 2, 1$ এবং $0$ সংখ্যাগুলোর প্রত্যেকটিকে $4$ দ্বারা ভাগ করে ভাগফলগুলোর বর্গমূল নিলে যথাক্রমে $\cos 0°, \cos 30°, \cos 45°, \cos 60°$ এবং $\cos 90°$ এর মান পাওয়া যায়।

$(iii)\, 0, 1, 3$ এবং $9$ সংখ্যাগুলোর প্রত্যেকটিকে $3$ দ্বারা ভাগ করে ভাগফলগুলোর বর্গমূল নিলে যথাক্রমে $\tan 0°, \tan 30°, \tan 45°$ এবং $\tan 60°$ এর মান পাওয়া যায়। (উল্লেখ্য, $\tan 90°$ সংজ্ঞায়িত নয়।)

$(iv)\, 9, 3, 1$ এবং $0$ সংখ্যাগুলোর প্রত্যেকটিকে $3$ দ্বারা ভাগ করে ভাগফলগুলোর বর্গমূল নিলে যথাক্রমে $\cot 30°, \cot 45°, \cot 60°$ এবং $\cot 90°$ এর মান পাওয়া যায়। (উল্লেখ্য, $\cot 0°$ সংজ্ঞায়িত নয়।)

### উদাহরণ ১৩.

মান নির্ণয় করো:
- ক) $\dfrac{1 - \sin^2 45°}{1 + \sin^2 45°} + \tan^2 45°$
- খ) $\cot 90° \cdot \tan 0° \cdot \sec^2 30° \cdot \cosec 60°$
- গ) $\sin 60° \cdot \cos 30° + \cos 60° \cdot \sin 30°$
- ঘ) $\dfrac{1 - \tan^2 60°}{1 + \tan^2 60°} + \sin^2 60°$

**সমাধান:**

ক) প্রদত্ত রাশি $= \dfrac{1 - \sin^2 45°}{1 + \sin^2 45°} + \tan^2 45°$

$= \dfrac{1 - \left(\dfrac{1}{\sqrt{2}}\right)^2}{1 + \left(\dfrac{1}{\sqrt{2}}\right)^2} + (1)^2 \quad [\because \sin 45° = \dfrac{1}{\sqrt{2}}$ ও $\tan 45° = 1]$

$= \dfrac{1 - \dfrac{1}{2}}{1 + \dfrac{1}{2}} + 1 = \dfrac{\dfrac{1}{2}}{\dfrac{3}{2}} + 1 = \dfrac{1}{3} + 1 = \dfrac{4}{3}$

খ) প্রদত্ত রাশি $= \cot 90° \cdot \tan 0° \cdot \sec^2 30° \cdot \cosec 60°$

$= 0 \cdot 0 \cdot \dfrac{2}{\sqrt{3}} \cdot \dfrac{2}{\sqrt{3}} = 0$

[$\because \cot 90° = 0, \tan 0° = 0, \sec 30° = \dfrac{2}{\sqrt{3}}, \cosec 60° = \dfrac{2}{\sqrt{3}}$]

গ) প্রদত্ত রাশি $= \sin 60° \cdot \cos 30° + \cos 60° \cdot \sin 30°$

$= \dfrac{\sqrt{3}}{2} \cdot \dfrac{\sqrt{3}}{2} + \dfrac{1}{2} \cdot \dfrac{1}{2}$

$[\because \sin 60° = \cos 30° = \dfrac{\sqrt{3}}{2}, \cos 60° = \sin 30° = \dfrac{1}{2}]$

$= \dfrac{3}{4} + \dfrac{1}{4} = \dfrac{4}{4} = 1$

ঘ) প্রদত্ত রাশি $= \dfrac{1 - \tan^2 60°}{1 + \tan^2 60°} + \sin^2 60°$

$= \dfrac{1 - (\sqrt{3})^2}{1 + (\sqrt{3})^2} + \left(\dfrac{\sqrt{3}}{2}\right)^2 \quad [\because \tan 60° = \sqrt{3}, \sin 60° = \dfrac{\sqrt{3}}{2}]$

$= \dfrac{1 - 3}{1 + 3} + \dfrac{3}{4} = \dfrac{-2}{4} + \dfrac{3}{4}$

$= \dfrac{-2 + 3}{4} = \dfrac{1}{4}$

### উদাহরণ ১৪.

ক) $\sqrt{2}\cos (A - B) = 1, 2\sin (A + B) = \sqrt{3}$ এবং $A, B$ সূক্ষ্মকোণ হলে, $A$ ও $B$ এর মান নির্ণয় করো।

খ) $\dfrac{\cos A - \sin A}{\cos A + \sin A} = \dfrac{1 - \sqrt{3}}{1 + \sqrt{3}}$ হলে, $A$ এর মান নির্ণয় করো।

গ) $A = 45°$ প্রমাণ করো যে, $\cos 2A = \dfrac{1 - \tan^2 A}{1 + \tan^2 A}$

ঘ) সমাধান করো $2\cos^2 \theta + 3\sin \theta - 3 = 0$, যেখানে $\theta$ সূক্ষ্মকোণ।

**সমাধান:**

ক) $\sqrt{2}\cos (A - B) = 1$

বা, $\cos (A - B) = \dfrac{1}{\sqrt{2}}$

বা, $\cos (A - B) = \cos 45° \ [\because \cos 45° = \dfrac{1}{\sqrt{2}}]$

$\therefore A - B = 45° \ldots (1)$

এবং $2\sin (A + B) = \sqrt{3}$

বা, $\sin (A + B) = \dfrac{\sqrt{3}}{2}$

বা, $\sin (A + B) = \sin 60° \ [\because \sin 60° = \dfrac{\sqrt{3}}{2}]$

$\therefore A + B = 60° \ldots (2)$

$(1)$ ও $(2)$ নং যোগ করে পাই,

$2A = 105°$

$\therefore A = \dfrac{105°}{2} = 52\dfrac{1}{2}°$

আবার, $(2)$ হতে $(1)$ বিয়োগ করে পাই,

$2B = 15°$

$\therefore B = \dfrac{15°}{2} = 7\dfrac{1}{2}°$

নির্ণেয় $A = 52\dfrac{1}{2}°$ ও $B = 7\dfrac{1}{2}°$

খ) $\dfrac{\cos A - \sin A}{\cos A + \sin A} = \dfrac{1 - \sqrt{3}}{1 + \sqrt{3}}$

বা, $\dfrac{\cos A - \sin A + \cos A + \sin A}{\cos A - \sin A - \cos A - \sin A} = \dfrac{1 - \sqrt{3} + 1 + \sqrt{3}}{1 - \sqrt{3} - 1 - \sqrt{3}}$ [যোজন-বিয়োজন করে]

বা, $\dfrac{2\cos A}{-2\sin A} = \dfrac{2}{-2\sqrt{3}}$

বা, $\dfrac{\cos A}{\sin A} = \dfrac{1}{\sqrt{3}}$

বা, $\cot A = \cot 60°$

$\therefore A = 60°$

গ) দেওয়া আছে, $A = 45°$

প্রমাণ করতে হবে, $\cos 2A = \dfrac{1 - \tan^2 A}{1 + \tan^2 A}$

বামপক্ষ $= \cos 2A$

$= \cos (2 \times 45°) = \cos 90° = 0$

ডানপক্ষ $= \dfrac{1 - \tan^2 A}{1 + \tan^2 A}$

$= \dfrac{1 - \tan^2 45°}{1 + \tan^2 45°} = \dfrac{1 - (1)^2}{1 + (1)^2}$

$= \dfrac{0}{2} = 0$

$\therefore$ বামপক্ষ = ডানপক্ষ (প্রমাণিত)

ঘ) প্রদত্ত সমীকরণ, $2\cos^2 \theta + 3\sin \theta - 3 = 0$

বা, $2(1 - \sin^2 \theta) + 3\sin \theta - 3 = 0$

বা, $(1 - \sin \theta)\{2(1 + \sin \theta) - 3\} = 0$

বা, $(1 - \sin \theta)\{2\sin \theta - 1\} = 0$

$\therefore 1 - \sin \theta = 0$ অথবা, $2\sin \theta - 1 = 0$

বা, $\sin \theta = 1$ বা, $2\sin \theta = 1$

বা, $\sin \theta = \sin 90°$ বা, $\sin \theta = \dfrac{1}{2}$

বা, $\theta = 90°$ বা, $\sin \theta = \sin 30°$

 বা, $\theta = 30°$

যেহেতু $\theta$ সূক্ষ্মকোণ, সেহেতু $\theta = 30°$।

## অনুশীলনী ৯.২

**১।** $\cos \theta = \dfrac{1}{2}$ হলে, $\cot \theta$ এর মান কোনটি?
- ক) $\dfrac{1}{\sqrt{3}}$
- খ) $1$
- গ) $\sqrt{3}$
- ঘ) $2$

**২।** $\cos^2 \theta - \sin^2 \theta = \dfrac{1}{3}$ হলে, $\cos^4 \theta - \sin^4 \theta$ এর মান কত?
- ক) $3$
- খ) $\dfrac{1}{2}$
- গ) $1$
- ঘ) $\dfrac{1}{3}$

**৩।** $\cot (\theta - 30°) = \dfrac{1}{\sqrt{3}}$ হলে, $\sin \theta = $ কত?
- ক) $\dfrac{1}{2}$
- খ) $0$
- গ) $1$
- ঘ) $\dfrac{\sqrt{3}}{2}$

**৪।** $\tan (3A) = \sqrt{3}$ হলে, $A = $ কত?
- ক) $45°$
- খ) $30°$
- গ) $20°$
- ঘ) $15°$

মান নির্ণয় করো (৫ - ৮):

**৫।** $\dfrac{1 - \cot^2 60°}{1 + \cot^2 60°}$

**৬।** $\tan 45° \cdot \sin^2 60° \cdot \tan 30° \cdot \tan 60°$

**৭।** $\dfrac{1 - \cos^2 60°}{1 + \cos^2 60°} + \sec^2 60°$

**৮।** $\cos 45° \cdot \cot^2 60° \cdot \cosec^2 30°$

দেখাও যে (৯ - ১৪):

**৯।** $\cos^2 30° - \sin^2 30° = \cos 60°$

**১০।** $\sin 60° \cdot \cos 60° + \cos 60° \cdot \sin 30° = \sin 90°$

**১১।** $\cos 60° \cdot \sin 30° + \sin 60° \cdot \sin 30° = \cos 30°$

**১২।** $\sin 3A = \cos 3A$ যদি $A = 15°$ হয়।

**১৩।** $\sin 2A = \dfrac{2\tan A}{1 + \tan^2 A}$ যদি $A = 45°$ হয়।

**১৪।** $\tan 2A = \dfrac{2\tan A}{1 - \tan^2 A}$ যদি $A = 30°$ হয়।

**১৫।** $2\cos (A + B) = 1 = 2\sin (A - B)$ এবং $A, B$ সূক্ষ্মকোণ হলে দেখাও যে, $A = 45°, B = 15°$।

**১৬।** $\cos (A - B) = 1, 2\sin (A + B) = \sqrt{3}$ এবং $A, B$ সূক্ষ্মকোণ হলে, $A$ এবং $B$ এর মান নির্ণয় করো।

**১৭।** সমাধান করো: $\dfrac{\cos A - \sin A}{\cos A + \sin A} = \dfrac{\sqrt{3} - 1}{\sqrt{3} + 1}$

**১৮।** $A$ ও $B$ সূক্ষ্মকোণ এবং $\cot (A + B) = 1, \cot (A - B) = \sqrt{3}$ হলে, $A$ ও $B$ এর মান নির্ণয় করো।

**১৯।** দেখাও যে, $\cos 3A = 4\cos^3 A - 3\cos A$ যদি $A = 30°$ হয়।

**২০।** সমাধান করো: $\sin \theta + \cos \theta = 1$, যখন $0° \leq \theta \leq 90°$।

**২১।** সমাধান করো: $\cos^2 \theta - \sin^2 \theta = 2 - 5\cos \theta$ যখন $\theta$ সূক্ষ্মকোণ।

**২২।** সমাধান করো: $2\sin^2 \theta + 3\cos \theta - 3 = 0, \theta$ সূক্ষ্মকোণ।

**২৩।** সমাধান করো: $\tan^2 \theta - (1 + \sqrt{3})\tan \theta + \sqrt{3} = 0$

**২৪।** মান নির্ণয় করো: $3\cot^2 60° + \dfrac{1}{4}\cosec^2 30° + 5\sin^2 45° - 4\cos^2 60°$

**২৫।** $\triangle ABC$ এর $\angle B = 90°, AB = 5$ সে.মি., $BC = 12$ সে.মি.।
- ক) $AC$ এর দৈর্ঘ্য নির্ণয় করো।
- খ) $\angle C = \theta$ হলে, $\sin \theta + \cos \theta$ এর মান নির্ণয় করো।
- গ) উদ্দীপকের আলোকে দেখাও যে, $\sec^2 A + \cosec^2 A = \sec^2 A \cdot \cosec^2 A$

**২৬।** $ABC$ সমকোণী ত্রিভুজের $\angle B = $ এক সমকোণ এবং $BC = BD$ হলে প্রমাণ করো যে, $\dfrac{BC \cos A - AC \cos B}{BC \cos A - BA \cos A} + \cos C = 0$

**২৭।** $ABC$ সমকোণী ত্রিভুজের $\angle B = $ এক সমকোণ এবং $\cot A + \cot B = 2\cot C$ হলে প্রমাণ করো যে, $AC^2 + BC^2 = 2AB^2$।

## নমুনা প্রশ্ন

### বহুনির্বাচনি প্রশ্ন

**১।** $0° \leq \theta \leq 90°$ এর জন্য, $\sin \theta$ এর সর্বোচ্চ মান কত?
- ক) $-1$
- খ) $0$
- গ) $\dfrac{1}{2}$
- ঘ) $1$

**২।** $ABC$ সমকোণী ত্রিভুজের অতিভুজ $AC = 2, AB = 1$ হলে—
- $(i)\, \angle ACB = 30°$
- $(ii)\, \tan A = \sqrt{3}$
- $(iii)\, \sin (A + C) = 0$

নিচের কোনটি সঠিক?
- ক) $i$
- খ) $ii$
- গ) $i$ ও $ii$
- ঘ) $ii$ ও $iii$

পাশের চিত্রে $ABC$ সমকোণী ত্রিভুজের অতিভুজ $AC = 2$ একক, $AB = 1$ একক। এই তথ্যের আলোকে ৩ ও ৪ নং প্রশ্নের উত্তর দাও।

[Figure: Right triangle ABC with right angle at B.
 Natural description: Right triangle with hypotenuse AC = 2 and leg AB = 1, so the other leg BC = √3.
 TikZ-mappable specifics: A at bottom-left, B at bottom-right with right-angle square mark, C at top-right. AB = 1 (horizontal base), BC = √3 (vertical right side, computed via Pythagoras), AC = 2 (hypotenuse). Angle A at bottom-left = 60°; angle C at top = 30°.]

**৩।** $\tan C = $ কত?
- ক) $2$
- খ) $\sqrt{3}$
- গ) $1$
- ঘ) $\dfrac{1}{\sqrt{3}}$

**৪।** $\sin^2 A - \cos^2 A = $ কত?
- ক) $\dfrac{1}{2}$
- খ) $\dfrac{\sqrt{3}}{2}$
- গ) $1$
- ঘ) $0$

### সৃজনশীল প্রশ্ন

**৫।** $\sin \theta = p, \cos \theta = q, \tan \theta = r$, যেখানে $\theta$ সূক্ষ্মকোণ।
- ক) $r = \sqrt{(3)^{-1}}$ হলে, $\theta$ এর মান নির্ণয় করো।
- খ) $p + q = \sqrt{2}$ হলে, প্রমাণ করো যে, $\theta = 45°$
- গ) $7p^2 + 3q^2 = 4$ হলে, দেখাও যে, $\tan \theta = \dfrac{1}{\sqrt{3}}$

### সংক্ষিপ্ত-উত্তর প্রশ্ন

**৬।** ক) দেখাও যে, $\tan^2 A - \sin^2 A = \tan^2 A \cdot \sin^2 A$।
- খ) $\triangle ABC$-এর $\angle B = 90°, BC = 6$ সে.মি. এবং $AB = 8$ সে.মি, হলে, $\sin A$ এর মান নির্ণয় করো।
- গ) $\sin^2 A = 1 + \cos^2 A$ হলে, $A$ এর মান নির্ণয় করো; যখন $A$ সূক্ষ্মকোণ।
- ঘ) $A = 15°$ হলে দেখাও যে, $\cos^3 A = \sin^3 A$।

> **OCR Quality Notes (Pass 2 @ 15-18x scale):**
> - All 14 worked examples (উদাহরণ ১-১৪) preserved with full intermediate steps
> - All trigonometric identities (sin²+cos²=1, 1+tan²=sec², 1+cot²=cosec²) verbatim with proofs
> - Special-angle table (0°, 30°, 45°, 60°, 90°) for sin/cos/tan/cot/sec/cosec preserved
> - Complementary angle identities (sin(90°−θ)=cos θ etc.) preserved
> - 2 অনুশীলনী sections (৯.১: ২৫ items, ৯.২: ২৭ items) + নমুনা প্রশ্ন captured
> - **All right-triangle figures rendered as TikZ-friendly [Figure: ...] placeholders** — two-layer: natural-language description + TikZ-mappable specifics (vertex coordinates, side lengths, angle measures, right-angle markers, tick marks) sufficient for redrawing
>
> **Items flagged for further verification (preserved as-read):**
> - *[verify]* অনুশীলনী ৯.১ #২৫ক: appears under #২৫ but uses θ (not A) and asks for sec θ — preserved as printed (potentially merged from a separate problem in source)
> - *[verify]* নমুনা প্রশ্ন #২ option (iii): "$\sin(A + C) = 0$" — for right triangle ABC with right angle B, A + C = 90°, so sin(A+C) = sin 90° = 1, not 0; option (iii) appears to be deliberately false (typical for "which is correct" MCQ) — preserved as printed
> - *[verify]* নমুনা প্রশ্ন #৬ঘ: "$\cos^3 A = \sin^3 A$" for A = 15° — only true if A = 45°; likely source typo (probably "$\cos 3A = \sin 3A$") — preserved literally
