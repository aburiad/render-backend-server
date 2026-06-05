/**
 * POST /api/geometry/translate
 *
 * Converts a Bengali / English geometry description into valid GeoGebra
 * Classic commands using the existing AI text-fallback chain.
 *
 * Cost   : 1 credit per successful call (refunded on total provider failure).
 * Auth   : requireAuth (already mounted in app.js before this router).
 * Limiter: aiLimiter (shared with /api/ai/* and /api/book/*).
 */

/**
 * GET /api/geometry/templates
 *
 * Returns pre-defined shape templates with their GeoGebra commands.
 * No auth required — these are static definitions.
 * In the future, this can return pre-rendered base64 images.
 */

const express = require('express')
const { AppError } = require('../middleware/errorHandler')
const { checkAiCredit } = require('../middleware/credits')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// ─── Shape Templates (complete curriculum - Classes 1-10) ───────────────────────
// Organized by category with GeoGebra commands for each shape
const SHAPE_TEMPLATES = [
  // ═════════════════════════════════════════════════════════════════════════════════
  // PRIMARY LEVEL (Classes 1-5)
  // ═════════════════════════════════════════════════════════════════════════════════

  // Basic Shapes (Class 1-2)
  { id: 'round', category: 'basic-shapes', level: 'primary', label: 'গোল (Round)', icon: '⭕', commands: 'O=(0,0);c=Circle[O,3]', description: 'গোল আকার', dataUrl: null },
  { id: 'triangular', category: 'basic-shapes', level: 'primary', label: 'তিনকোনা', icon: '🔺', commands: 'A=(0,0);B=(3,0);C=(1,2);t=Polygon[A,B,C]', description: 'ত্রিভুজাকার বস্তু', dataUrl: null },
  { id: 'square-rect', category: 'basic-shapes', level: 'primary', label: 'চারকোনা', icon: '⬜', commands: 'A=(0,0);B=(4,0);C=(4,3);D=(0,3);r=Polygon[A,B,C,D]', description: 'চতুর্ভুজাকার বস্তু', dataUrl: null },

  // Lines (Class 1-2)
  { id: 'straight-line', category: 'lines', level: 'primary', label: 'সরল রেখা', icon: '━', commands: 'A=(-5,0);B=(5,0);L1=Segment[A,B]', description: 'সরল রেখা', dataUrl: null },
  { id: 'curved-line', category: 'lines', level: 'primary', label: 'বক্র রেখা', icon: '︶', commands: 'A=(0,0);B=(2,1);c=Circle[A,3];d=CircleArc[A,B]', description: 'বক্র রেখা', dataUrl: null },
  { id: 'parallel', category: 'lines', level: 'primary', label: 'সমান্তরাল রেখা', icon: '║', commands: 'A=(-4,1);B=(4,1);C=(-4,-1);D=(4,-1);Segment[A,B];Segment[C,D]', description: 'দুটি সমান্তরাল রেখা', dataUrl: null },
  { id: 'perpendicular', category: 'lines', level: 'primary', label: 'লম্ব রেখা', icon: '⊥', commands: 'A=(-4,0);B=(4,0);C=(0,-4);D=(0,4);Segment[A,B];Segment[C,D];RightAngle(B,(0,0),D)', description: 'দুটি লম্ব রেখা', dataUrl: null },

  // Basic Elements (Class 3)
  { id: 'point', category: 'basic-elements', level: 'primary', label: 'বিন্দু (Point)', icon: '•', commands: 'A=(0,0);B=(2,3);C=(-1,2);ShowAxes=false', description: 'বিন্দু ও নামকরণ', dataUrl: null },
  { id: 'line-segment', category: 'basic-elements', level: 'primary', label: 'রেখাংশ', icon: '──', commands: 'A=(-3,0);B=(3,0);s=Segment[A,B]', description: 'রেখাংশ', dataUrl: null },
  { id: 'ray', category: 'basic-elements', level: 'primary', label: 'রশ্মি', icon: '→', commands: 'A=(0,0);B=(3,0);r=Ray[A,1]', description: 'রশ্মি (একদিকে অসীম)', dataUrl: null },

  // Angles (Class 3-4)
  { id: 'right-angle', category: 'angles', level: 'primary', label: 'সমকোণ (90°)', icon: '┓', commands: 'A=(0,0);B=(3,0);C=(0,2);Segment[A,B];Segment[A,C];RightAngle(B,A,C)', description: 'সমকোণ', dataUrl: null },
  { id: 'acute-angle', category: 'angles', level: 'primary', label: 'সূক্ষ্মকোণ', icon: '∠', commands: 'A=(0,0);B=(3,0);C=(2,1);Segment[A,B];Segment[A,C];Angle[B,A,C]', description: 'সূক্ষ্মকোণ (<90°)', dataUrl: null },
  { id: 'obtuse-angle', category: 'angles', level: 'primary', label: 'স্থূলকোণ', icon: '⦢', commands: 'A=(0,0);B=(3,0);C=(-1,1);Segment[A,B];Segment[A,C];Angle[B,A,C]', description: 'স্থূলকোণ (>90°)', dataUrl: null },
  { id: 'straight-angle', category: 'angles', level: 'primary', label: 'সরলকোণ (180°)', icon: '━', commands: 'A=(-3,0);B=(3,0);Segment[A,B];Angle[(-1,0),B,(1,0)]', description: 'সরলকোণ (180°)', dataUrl: null },

  // Triangles (Class 3-5)
  { id: 'basic-triangle', category: 'primary-triangles', level: 'primary', label: 'সাধারণ ত্রিভুজ', icon: '△', commands: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C]', description: 'সাধারণ ত্রিভুজ', dataUrl: null },
  { id: 'right-triangle', category: 'primary-triangles', level: 'primary', label: 'সমকোণী ত্রিভুজ', icon: '📐', commands: 'A=(0,0);B=(3,0);C=(0,4);t=Polygon[A,B,C];RightAngle(B,A,C)', description: 'সমকোণী ত্রিভুজ', dataUrl: null },

  // Quadrilaterals (Class 4-5)
  { id: 'rectangle', category: 'primary-quads', level: 'primary', label: 'আয়তক্ষেত্র', icon: '▭', commands: 'A=(0,0);B=(6,0);C=(6,4);D=(0,4);r=Polygon[A,B,C,D];RightAngle(D,A,B)', description: 'আয়তক্ষেত্র', dataUrl: null },
  { id: 'square', category: 'primary-quads', level: 'primary', label: 'বর্গক্ষেত্র', icon: '⬜', commands: 'A=(0,0);B=(4,0);C=(4,4);D=(0,4);s=Polygon[A,B,C,D];RightAngle(D,A,B)', description: 'বর্গক্ষেত্র', dataUrl: null },
  { id: 'parallelogram-basic', category: 'primary-quads', level: 'primary', label: 'সমান্তরিক', icon: '▱', commands: 'A=(0,0);B=(5,0);C=(7,3);D=(2,3);p=Polygon[A,B,C,D]', description: 'সমান্তরিক', dataUrl: null },
  { id: 'rhombus-basic', category: 'primary-quads', level: 'primary', label: 'রম্বস', icon: '◇', commands: 'A=(2,0);B=(5,3);C=(2,6);D=(-1,3);r=Polygon[A,B,C,D]', description: 'রম্বস', dataUrl: null },
  { id: 'trapezium', category: 'primary-quads', level: 'primary', label: 'ট্রাপিজিয়াম', icon: '⏢', commands: 'A=(0,0);B=(6,0);C=(4,3);D=(1,3);t=Polygon[A,B,C,D]', description: 'ট্রাপিজিয়াম', dataUrl: null },

  // Circles (Class 5)
  { id: 'circle', category: 'circles', level: 'primary', label: 'বৃত্ত', icon: '⭕', commands: 'O=(0,0);c=Circle[O,3]', description: 'বৃত্ত', dataUrl: null },
  { id: 'circle-parts', category: 'circles', level: 'primary', label: 'ব্যাস, জ্যা, ব্যাসার্ধ', icon: '◎', commands: 'O=(0,0);A=(-3,0);B=(3,0);c=Circle[O,3];d=Segment[A,B];r=Ray[O,1];ch=Segment[(-2,2.24),(2,2.24)]', description: 'বৃত্তের অংশসমূহ', dataUrl: null },
  { id: 'semicircle', category: 'circles', level: 'primary', label: 'অর্ধবৃত্ত', icon: '◑', commands: 'A=(-3,0);B=(3,0);c=Circle[(0,0),3];d=CircleArc[A,B,(0,0)]', description: 'অর্ধবৃত্ত', dataUrl: null },

  // ═════════════════════════════════════════════════════════════════════════════════
  // LOWER SECONDARY (Classes 6-8)
  // ═════════════════════════════════════════════════════════════════════════════════

  // Angle Relations (Class 6)
  { id: 'adjacent-angles', category: 'angle-relations', level: 'lower-secondary', label: 'সন্নিহিত কোণ', icon: '∠∠', commands: 'A=(0,0);B=(3,0);C=(0,2);D=(0,-2);Segment[A,B];Segment[A,C];Segment[A,D];Angle[D,A,C]', description: 'সন্নিহিত কোণ', dataUrl: null },
  { id: 'vertical-angles', category: 'angle-relations', level: 'lower-secondary', label: 'বিপ্রতীপ কোণ', icon: '×', commands: 'A=(-3,2);B=(0,0);C=(3,2);D=(-3,-2);Segment[A,B];Segment[B,C];Segment[B,D];Segment[A,C]', description: 'বিপ্রতীপ কোণ', dataUrl: null },
  { id: 'supplementary', category: 'angle-relations', level: 'lower-secondary', label: 'সম্পূরক কোণ', icon: '⌞', commands: 'A=(0,0);B=(3,0);C=(1,1);D=(1,-1);Segment[A,B];Segment[A,C];Segment[A,D];Angle[D,A,C]', description: 'যোগফল 180°', dataUrl: null },
  { id: 'complementary', category: 'angle-relations', level: 'lower-secondary', label: 'পূরক কোণ', icon: '⌟', commands: 'A=(0,0);B=(3,0);C=(1,1);Angle[C,A,B];Angle[(1,-1),A,B]', description: 'যোগফল 90°', dataUrl: null },

  // Triangle Classification (Class 6-7)
  { id: 'equilateral', category: 'triangles-classified', level: 'lower-secondary', label: 'সমবাহু ত্রিভুজ', icon: '🔺', commands: 'A=(0,0);B=(4,0);C=(2,3.464);t=Polygon[A,B,C]', description: 'সমবাহু ত্রিভুজ', dataUrl: null },
  { id: 'isosceles', category: 'triangles-classified', level: 'lower-secondary', label: 'সমদ্বিবাহু ত্রিভুজ', icon: '🔷', commands: 'A=(0,0);B=(4,0);C=(2,3);t=Polygon[A,B,C]', description: 'সমদ্বিবাহু ত্রিভুজ', dataUrl: null },
  { id: 'scalene', category: 'triangles-classified', level: 'lower-secondary', label: 'বিষমবাহু ত্রিভুজ', icon: '△', commands: 'A=(0,0);B=(5,0);C=(1,3);t=Polygon[A,B,C]', description: 'বিষমবাহু ত্রিভুজ', dataUrl: null },
  { id: 'acute-triangle', category: 'triangles-classified', level: 'lower-secondary', label: 'সূক্ষ্মকোণী ত্রিভুজ', icon: '△', commands: 'A=(0,0);B=(4,0);C=(3,3);t=Polygon[A,B,C]', description: 'সূক্ষ্মকোণী ত্রিভুজ', dataUrl: null },
  { id: 'obtuse-triangle', category: 'triangles-classified', level: 'lower-secondary', label: 'স্থূলকোণী ত্রিভুজ', icon: '△', commands: 'A=(0,0);B=(4,0);C=(1,1);t=Polygon[A,B,C]', description: 'স্থূলকোণী ত্রিভুজ', dataUrl: null },

  // Transversal Angles (Class 7)
  { id: 'transversal-angles', category: 'transversal', level: 'lower-secondary', label: 'অন্তঃকোণ ও বহিঃকোণ', icon: '🔄', commands: 'A=(-5,2);B=(5,2);C=(-5,-2);D=(5,-2);E=(-2,-2);F=(2,2);Segment[A,B];Segment[C,D];Segment[E,F];Angle[BEF,Angle[CEF]', description: 'ছেদক রেখা কোণ', dataUrl: null },
  { id: 'alternate-angles', category: 'transversal', level: 'lower-secondary', label: 'একান্তর কোণ', icon: '≡', commands: 'A=(-5,2);B=(5,2);C=(-5,-2);D=(5,-2);E=(-2,-2);F=(2,2);Segment[A,B];Segment[C,D];Segment[E,F];Angle[BEF,Angle[DFB]', description: 'একান্তর কোণ সমান', dataUrl: null },
  { id: 'corresponding-angles', category: 'transversal', level: 'lower-secondary', label: 'অনুরূপ কোণ', icon: '🔃', commands: 'A=(-5,2);B=(5,2);C=(-5,-2);D=(5,-2);E=(-2,-2);F=(2,2);Segment[A,B];Segment[C,D];Segment[E,F]', description: 'অনুরূপ কোণ', dataUrl: null },
  { id: 'co-interior-angles', category: 'transversal', level: 'lower-secondary', label: 'অন্তঃমুখী কোণ', icon: '⟨', commands: 'A=(-5,2);B=(5,2);C=(-5,-2);D=(5,-2);E=(-2,-2);F=(2,2);Segment[A,B];Segment[C,D];Segment[E,F];Angle[BEF,Angle[DFB]', description: 'অন্তঃমুখী কোণ', dataUrl: null },

  // Quadrilateral Theorems (Class 8)
  { id: 'quad-sum-360', category: 'quad-theorems', level: 'lower-secondary', label: 'চতুর্ভুজ কোণ যোগফল = 360°', icon: '▭', commands: 'A=(0,0);B=(4,0);C=(5,3);D=(1,4);q=Polygon[A,B,C,D];Angle[A,B,C];Angle[B,C,D];Angle[C,D,A];Angle[D,A,B]', description: 'চতুর্ভুজ কোণ যোগফল 360°', dataUrl: null },
  { id: 'parallelogram-diagonals', category: 'quad-theorems', level: 'lower-secondary', label: 'সমান্তরিক কর্ণ', icon: '✜', commands: 'A=(0,0);B=(6,0);C=(8,4);D=(2,4);p=Polygon[A,B,C,D];Segment[A,C];Segment[B,D];M=Midpoint[A,C];N=Midpoint[B,D];ShowAxes=false', description: 'সমান্তরিক কর্ণ পরস্পরকে অর্ধেক করে', dataUrl: null },
  { id: 'rhombus-diagonals', category: 'quad-theorems', level: 'lower-secondary', label: 'রম্বস লম্ব কর্ণ', icon: '⊗', commands: 'A=(2,0);B=(5,3);C=(2,6);D=(-1,3);r=Polygon[A,B,C,D];Segment[A,C];Segment[B,D];RightAngle[(2,3),(0,3),(4,3)]', description: 'রম্বস কর্ণ লম্বে পরস্পরকে অর্ধেক করে', dataUrl: null },

  // Pythagoras (Class 8)
  { id: 'pythagorean-triangle', category: 'pythagoras', level: 'lower-secondary', label: 'পিথাগোরাস ত্রিভুজ', icon: '📐', commands: 'A=(0,0);B=(3,0);C=(0,4);t=Polygon[A,B,C];RightAngle(B,A,C);a=Distance[B,C];b=Distance[A,C];c=Distance[A,B];ShowAxes=false', description: 'a² + b² = c²', dataUrl: null },
  { id: 'pythagorean-proof', category: 'pythagoras', level: 'lower-secondary', label: 'পিথাগোরাস প্রমাণ', icon: '📜', commands: 'A=(0,0);B=(3,0);C=(0,4);t=Polygon[A,B,C];RightAngle(B,A,C);s1=Polygon[(0,0),(1,0),(1,1)];s2=Polygon[(1,0),(3,0),(3,1),(1,1)];s3=Polygon[(0,0),(1,0),(0.5,-1)]', description: 'পিথাগোরাস উপপাদ্য', dataUrl: null },

  // Circle Theorems Basic (Class 8)
  { id: 'chord-perpendicular', category: 'circle-theorems-basic', level: 'lower-secondary', label: 'জ্যা ⊥ ব্যাসার্ধ', icon: '⊥', commands: 'O=(0,0);A=(-2,2);B=(2,2);c=Circle[O,3];Segment[A,B];d=Segment[O,(0,2)];RightAngle[A,(0,2),O]', description: 'কেন্দ্র থেকে জ্যার লম্ব অর্ধেক', dataUrl: null },
  { id: 'equal-chords', category: 'circle-theorems-basic', level: 'lower-secondary', label: 'সমান জ্যা সমান দূরত্ব', icon: '≈', commands: 'O=(0,0);A=(-2,1);B=(2,1);C=(-2,-1);D=(2,-1);c=Circle[O,3];ch1=Segment[A,B];ch2=Segment[C,D];d1=Distance[O,ch1];d2=Distance[O,ch2]', description: 'সমান জ্যা কেন্দ্র থেকে সমান দূরত্বে', dataUrl: null },
  { id: 'circle-angles', category: 'circle-theorems-basic', level: 'lower-secondary', label: 'কেন্দ্র ও পরিধি কোণ', icon: '🎯', commands: 'O=(0,0);c=Circle[O,4];A=(3,0);B=(0,3);Segment[O,A];Segment[O,B];C=(2,0);D=(0,2);Segment[O,C];Segment[O,D];Angle[COA,Angle[DOA];Angle[AOB,Angle[COB]', description: 'কেন্দ্র স্থিত কোণ = 2× পরিধি কোণ', dataUrl: null },

  // ═════════════════════════════════════════════════════════════════════════════════
  // SECONDARY (Classes 9-10 General)
  // ═════════════════════════════════════════════════════════════════════════════════

  // Advanced Triangles
  { id: 'exterior-angle', category: 'advanced-triangles', level: 'secondary', label: 'বহিঃকোণ উপপাদ্য', icon: '∠', commands: 'A=(0,0);B=(4,0);C=(1,2);t=Polygon[A,B,C];D=(5,0);E=(1,2);Segment[B,C];Segment[B,D];Angle[DBE,Angle[CBA];ShowAxes=false', description: 'বহিঃকোণ = দূরবিপরীত অন্তঃকোণ', dataUrl: null },
  { id: 'triangle-inequality', category: 'advanced-triangles', level: 'secondary', label: 'ত্রিভুজ অসমতা', icon: '≶', commands: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];a=Distance[B,C];b=Distance[A,C];c=Distance[A,B];d1=Distance[A,B]+Distance[A,C];d2=Distance[B,C];ShowAxes=false', description: 'যেকোনো দুই বাহুর যোগ > তৃতীয় বাহু', dataUrl: null },
  { id: 'midpoint-theorem', category: 'advanced-triangles', level: 'secondary', label: 'মধ্যবিন্দু উপপাদ্য', icon: '─┼─', commands: 'A=(0,0);B=(6,0);C=(2,3);t=Polygon[A,B,C];M=Midpoint[A,B];N=Midpoint[AC];Segment[M,N];Segment[B,C];d=Distance[M,N];h=Distance[B,C];d2=Distance[M,N]*2;ShowAxes=false', description: 'মধ্যবিন্দু যোগিত রেখা || তৃতী বাহু', dataUrl: null },

  // Inscribed Circles
  { id: 'same-segment-angles', category: 'inscribed-circles', level: 'secondary', label: 'একই চাপ কোণ', icon: '≡', commands: 'O=(0,0);c=Circle[O,4];A=(3,2);B=(3,-2);C=(-4,0);Segment[O,A];Segment[O,B];Segment[O,C];a1=Angle[COA];a2=Angle[COB];ShowAxes=false', description: 'একই চাপের কোণ সমান', dataUrl: null },
  { id: 'semicircle-right', category: 'inscribed-circles', level: 'secondary', label: 'অর্ধবৃত্ত সমকোণ', icon: '⦵', commands: 'A=(-3,0);B=(3,0);c=Circle[(0,0),3];C=(0,3);d=CircleArc[A,B,(0,0)];Segment[A,C];Segment[B,C];Angle[ACB];ShowAxes=false', description: 'অর্ধবৃত্তের কোণ = 90°', dataUrl: null },
  { id: 'cyclic-quad', category: 'inscribed-circles', level: 'secondary', label: 'বৃত্তীয় চতুর্ভুজ', icon: '◤', commands: 'O=(0,0);c=Circle[O,4];A=(3,3);B=(3,-3);C=(-2,-3);D=(-2,3);q=Polygon[A,B,C,D];Angle[DAB,Angle[DCB];Angle[ABC,Angle[ADC];ShowAxes=false', description: 'বিপরীত কোণ যোগফল = 180°', dataUrl: null },
  { id: 'tangent-radius', category: 'inscribed-circles', level: 'secondary', label: 'স্পর্শক ⊥ ব্যাসার্ধ', icon: '⊙', commands: 'O=(0,0);c=Circle[O,3];A=(3,0);T=(3,0);Segment[O,T];t=Tangent[(3,0)];Angle[TOB,Angle[(1,0),T,(3,0)];ShowAxes=false', description: 'স্পর্শক ও ব্যাসার্ধ লম্ব', dataUrl: null },

  // Special Circles
  { id: 'circumcircle', category: 'special-circles', level: 'secondary', label: 'পরিবৃত্ত', icon: '○', commands: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];O=Circumcenter[t];cc=Circle[O,A];Segment[O,A];Segment[O,B];Segment[O,C];ShowAxes=false', description: 'পরিবৃত্ত', dataUrl: null },
  { id: 'incircle', category: 'special-circles', level: 'secondary', label: 'অন্তর্বৃত্ত', icon: '⊙', commands: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];I=Incenter[t];ic=Circle[I,Distance[I,Segment[B,C]]];Segment[I,A];Segment[I,B];Segment[I,C];ShowAxes=false', description: 'অন্তর্বৃত্ত', dataUrl: null },
  { id: 'excircle', category: 'special-circles', level: 'secondary', label: 'বহির্বৃত্ত', icon: '⊙', commands: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];E=Excenter[A,B,C];ec=Circle[E,Distance[E,Segment[B,C]]];Segment[E,A];Segment[E,B];Segment[E,C];ShowAxes=false', description: 'বহির্বৃত্ত', dataUrl: null },

  // Similarity
  { id: 'thales-theorem', category: 'similarity', level: 'secondary', label: 'থেলস উপপাদ্য', icon: '∥', commands: 'A=(0,0);B=(6,0);C=(2,3);t=Polygon[A,B,C];D=(3,0);E=(3,1.5);Segment[A,C];Segment[B,E];Segment[D,E];Segment[D,C];ShowAxes=false', description: 'DE || AC, AD/AB = AE/AC', dataUrl: null },
  { id: 'angle-bisector', category: 'similarity', level: 'secondary', label: 'কোণ সমদ্বিখণ্ড', icon: '∠', commands: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];bd=Bisector[A,B,C];E=Intersection[bd,Segment[B,C]];d1=Distance[B,E];d2=Distance[E,C];Segment[A,E];ShowAxes=false', description: 'কোণ সমদ্বিখণ্ড বিপরীত বাহু অনুপাতে ভাগ করে', dataUrl: null },
  { id: 'similar-triangles', category: 'similarity', level: 'secondary', label: 'সদৃশ ত্রিভুজ', icon: '∽', commands: 'A1=(0,0);B1=(4,0);C1=(2,3);t1=Polygon[A1,B1,C1];A2=(1,1);B2=(3,1);C2=(2,2.5);t2=Polygon[A2,B2,C2];Segment[A1,B1];Segment[A2,B2];Segment[B1,C1];Segment[B2,C2];ShowAxes=false', description: 'সদৃশ ত্রিভুজ', dataUrl: null },

  // Area Theorems
  { id: 'parallelogram-area', category: 'area-theorems', level: 'secondary', label: 'সমান্তরিক ক্ষেত্রফল', icon: '▱', commands: 'A=(0,0);B=(6,0);C=(8,4);D=(2,4);p=Polygon[A,B,C,D];h=Segment[(1,0),(1,4)];base=Distance[A,B];area=base*Distance[(0,0),(1,4)];ShowAxes=false', description: 'একই ভূমি ও উচ্চতায় ক্ষেত্রফল সমান', dataUrl: null },
  { id: 'triangle-area', category: 'area-theorems', level: 'secondary', label: 'ত্রিভুজ ক্ষেত্রফল', icon: '△', commands: 'A=(0,0);B=(5,0);C=(2,4);t=Polygon[A,B,C];h=Segment[(2,0),(2,4)];base=Distance[A,B];area=0.5*base*h;ShowAxes=false', description: 'ত্রিভুজ ক্ষেত্রফল = ½ × ভূমি × উচ্চতা', dataUrl: null },

  // ═════════════════════════════════════════════════════════════════════════════════
  // HIGHER MATH (Classes 9-10)
  // ═════════════════════════════════════════════════════════════════════════════════

  // Advanced Theorems
  { id: 'apollonius', category: 'advanced-theorems', level: 'higher-math', label: 'অ্যাপোলোনিয়াস', icon: '📐', commands: 'A=(0,0);B=(6,0);C=(2,4);t=Polygon[A,B,C];M=Midpoint[B,C];a=Distance[B,C];b=Distance[A,C];c=Distance[A,B];AB=Distance[A,B];AM=Distance[A,M];cm=a*a+b*b;cm2=c*c+2*AM*AM;ShowAxes=false', description: 'অ্যাপোলোনিয়াস উপপাদ্য', dataUrl: null },
  { id: 'ptolemy', category: 'advanced-theorems', level: 'higher-math', label: 'টলেমি', icon: '⬡', commands: 'A=(0,0);B=(4,0);C=(5,3);D=(1,3);q=Polygon[A,B,C,D];ac=Distance[A,C];bd=Distance[B,D];ad=Distance[A,D];bc=Distance[B,C];ab=Distance[A,B];ShowAxes=false', description: 'Ptolemy: ac × bd = ab × cd + ad × bc', dataUrl: null },
  { id: 'euler-line', category: 'advanced-theorems', level: 'higher-math', label: 'অয়লার রেখা', icon: '─○─', commands: 'A=(0,0);B=(5,0);C=(1,4);t=Polygon[A,B,C];H=Orthocenter[t];O=Circumcenter[t];G=Centroid[t];Segment[H,G];Segment[G,O];Segment[H,O];ShowAxes=false', description: 'লম্ববিন্দু, ভরকেন্দ্র, পরিকেন্দ্র সংরেখ', dataUrl: null },

  // Triangle Centers
  { id: 'orthocenter', category: 'triangle-centers', level: 'higher-math', label: 'লম্ববিন্দু', icon: '⊥', commands: 'A=(0,0);B=(5,0);C=(1,4);t=Polygon[A,B,C];H=Orthocenter[t];Segment[A,H];Segment[B,H];Segment[C,H];Segment[A,B];Segment[A,H];PerpendicularLine[H,Segment[A,B]];ShowAxes=false', description: 'লম্ববিন্দু', dataUrl: null },
  { id: 'circumcenter', category: 'triangle-centers', level: 'higher-math', label: 'পরিকেন্দ্র', icon: '○', commands: 'A=(0,0);B=(5,0);C=(1,4);t=Polygon[A,B,C];O=Circumcenter[t];Segment[O,A];Segment[O,B];Segment[O,C];cc=Circle[O,A];ShowAxes=false', description: 'পরিকেন্দ্র', dataUrl: null },
  { id: 'centroid', category: 'triangle-centers', level: 'higher-math', label: 'ভরকেন্দ্র', icon: '✜', commands: 'A=(0,0);B=(5,0);C=(1,4);t=Polygon[A,B,C];G=Centroid[t];Segment[A,G];Segment[B,G];Segment[C,G];M=Midpoint[B,C];Segment[A,M];ShowAxes=false', description: 'ভরকেন্দ্র (মধ্যবিন্দুগুল মিলন)', dataUrl: null },
  { id: 'incenter', category: 'triangle-centers', level: 'higher-math', label: 'অন্তঃকেন্দ্র', icon: '⊙', commands: 'A=(0,0);B=(5,0);C=(1,4);t=Polygon[A,B,C];I=Incenter[t];ic=Circle[I,Distance[I,Segment[B,C]]];Segment[I,A];Segment[I,B];Segment[I,C];ShowAxes=false', description: 'অন্তঃকেন্দ্র', dataUrl: null },

  // Coordinate Geometry
  { id: 'distance-formula', category: 'coordinate-geometry', level: 'higher-math', label: 'দূরত্ব সূত্র', icon: '┈', commands: 'A=(2,3);B=(5,7);d=Distance[A,B];Segment[A,B];ShowAxes=true;ShowGrid=true', description: 'd = √[(x₂-x₁)² + (y₂-y₁)²]', dataUrl: null },
  { id: 'slope-line', category: 'coordinate-geometry', level: 'higher-math', label: 'রেখার ঢাল', icon: '╱', commands: 'A=(1,2);B=(4,6);s=Segment[A,B];dx=x(B)-x(A);dy=y(B)-y(A);m=dy/dx;ShowAxes=true;ShowGrid=true', description: 'ঢাল m = (y₂-y₁)/(x₂-x₁)', dataUrl: null },
  { id: 'line-equation', category: 'coordinate-geometry', level: 'higher-math', label: 'রেখার সমীকরণ', icon: '━', commands: 'A=(1,2);B=(4,6);s=Segment[A,B];y_eq=(y(B)-y(A))/(x(B)-x(A))*(x-x(A))+y(A);ShowAxes=true;ShowGrid=true', description: 'রেখার সমীকরণ', dataUrl: null },

  // Vectors
  { id: 'position-vector', category: 'vectors', level: 'higher-math', label: 'অবস্থান ভেক্টর', icon: '→', commands: 'O=(0,0);P=(3,4);Segment[O,P];a=Vector[O,P];ShowAxes=true', description: 'অবস্থান ভেক্টর', dataUrl: null },
  { id: 'vector-addition', category: 'vectors', level: 'higher-math', label: 'ভেক্টর যোগ', icon: '➜', commands: 'O=(0,0);A=(2,1);B=(1,3);C=(3,4);v1=Vector[O,A];v2=Vector[O,B];v3=Vector[O,C];Segment[O,A];Segment[O,B];Segment[O,C];Polygon[(0,0),(2,0),(3,4)];ShowAxes=true', description: 'ভেক্টর যোগ', dataUrl: null },
  { id: 'triangle-vector', category: 'vectors', level: 'higher-math', label: 'ত্রিভুজ ভেক্টর', icon: '△→', commands: 'A=(1,2);B=(4,1);C=(2,4);a=Vector[(0,0),A];b=Vector[(0,0),B];c=Vector[(0,0),C];t=Polygon[A,B,C];ShowAxes=true', description: 'ত্রিভুজ ভেক্টর', dataUrl: null },

  // Solids
  { id: 'cube', category: 'solids', level: 'higher-math', label: 'ঘনক', icon: '🧊', commands: 'ShowAxes=false;A=(0,0,0);B=(4,0,0);C=(4,4,0);D=(0,4,0);E=(0,0,4);F=(4,0,4);G=(4,4,4);H=(0,4,4);Pyramid[(0,0,0),A,B,C,D,E]', description: 'ঘনক', dataUrl: null },
  { id: 'cylinder', category: 'solids', level: 'higher-math', label: 'বেলন', icon: '🥫', commands: 'ShowAxes=false;Cylinder[(0,0),(0,5),3]', description: 'বেলন', dataUrl: null },
  { id: 'cone', category: 'solids', level: 'higher-math', label: 'কোনাঙ্ক', icon: '📐', commands: 'ShowAxes=false;Cone[(0,0,0),5,3]', description: 'কোনাঙ্ক', dataUrl: null },
  { id: 'sphere', category: 'solids', level: 'higher-math', label: 'গোলক', icon: '🔮', commands: 'ShowAxes=false;Sphere[(0,0,0),3]', description: 'গোলক', dataUrl: null },
]

// ─── GET /templates ───────────────────────────────────────────────────────────
router.get('/templates', (req, res) => {
  res.json({
    success: true,
    templates: SHAPE_TEMPLATES,
    count: SHAPE_TEMPLATES.length,
    levels: ['primary', 'lower-secondary', 'secondary', 'higher-math'],
  })
})

// Apply auth to remaining routes
router.use(requireAuth)

// ─── GeoGebra translation system prompt ─────────────────────────────────────
const GEOMETRY_SYSTEM_PROMPT = `You are a GeoGebra scripting expert. Convert Bengali/English geometry descriptions into valid GeoGebra Classic commands.

OUTPUT FORMAT — respond with ONLY this JSON object (no markdown, no prose):
{ "commands": "<semicolon-separated GeoGebra commands on one line>", "description": "<short Bengali description, max 12 words>" }

RULES:
- Keep all coordinates in the range -10 to 10 when possible.
- Label key points A, B, C … for exam clarity.
- Use Polygon[A,B,C] for triangles/polygons (auto-closes).
- Use RightAngle(C,A,B) to mark a right-angle square at vertex A.
- Angles: Angle[A,B,C] gives the angle at vertex B.
- Distances: d = Distance[A,B] (adds a numeric label).
- Always output valid, parseable JSON with double quotes only.

COMMON COMMANDS:
  Point       : A = (x, y)
  Segment     : Segment[A, B]
  Line        : Line[A, B]
  Circle      : Circle[O, r]
  Polygon     : Polygon[A, B, C]
  Midpoint    : M = Midpoint[A, B]
  Perpendicular: PerpendicularLine[A, Segment[B,C]]
  Parallel    : ParallelLine[A, Line[B,C]]
  Right-angle mark: RightAngle(C, A, B)

EXAMPLES:
  "সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪"
  → {"commands":"A=(0,0);B=(3,0);C=(0,4);Polygon[A,B,C];RightAngle(B,A,C)","description":"সমকোণী ত্রিভুজ ABC, ভূমি ৩ ও উচ্চতা ৪"}

  "ব্যাসার্ধ ৫ বিশিষ্ট বৃত্ত"
  → {"commands":"O=(0,0);c=Circle[O,5]","description":"কেন্দ্র O ও ব্যাসার্ধ ৫ বিশিষ্ট বৃত্ত"}

  "সমবাহু ত্রিভুজ বাহু ৪"
  → {"commands":"A=(0,0);B=(4,0);C=(2,3.46);Polygon[A,B,C]","description":"সমবাহু ত্রিভুজ ABC, প্রতিটি বাহু ৪ একক"}

  "আয়তক্ষেত্র দৈর্ঘ্য ৬ প্রস্থ ৪"
  → {"commands":"A=(0,0);B=(6,0);C=(6,4);D=(0,4);Polygon[A,B,C,D];RightAngle(D,A,B)","description":"আয়তক্ষেত্র ABCD, দৈর্ঘ্য ৬ ও প্রস্থ ৪"}`

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PROVIDER_TIMEOUT_MS = process.env.VERCEL === '1' ? 8000 : 55000

const ENV_KEY_MAP = {
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  novita: 'NOVITA_API_KEY',
  huggingface: 'HUGGINGFACE_API_KEY',
  sambanova: 'SAMBANOVA_API_KEY',
  cohere: 'COHERE_API_KEY',
  zai: 'Z_API_KEY',
  gemini: null, // managed internally by gemini.js
}

/** Race a provider chat call against a per-provider timeout. */
function racedChat(provider, params) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${provider.name} timed out`)),
      PROVIDER_TIMEOUT_MS,
    )
    provider.chat(params).then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
    )
  })
}

/**
 * Extract { commands, description } from any LLM output shape:
 *   • Clean JSON object          : {"commands":"...","description":"..."}
 *   • Markdown-fenced JSON       : ```json\n{...}\n```
 *   • Object wrapped in array    : [{"commands":"..."}]
 *   • Prose with embedded object : "Sure! Here is the output: {...}"
 *   • commands field is an array : {"commands":["A=(0,0)","B=(3,0)"]}
 *   • Gemma bullet echo format   : "* Input: ...\n* Key elements:\n  * Points: A=..."
 */
function parseGeometryResponse(raw) {
  if (!raw || typeof raw !== 'string') return null

  // ── Strip markdown fences ─────────────────────────────────────────────────
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // ── Helper: validate a candidate parsed value ─────────────────────────────
  function extract(obj) {
    if (!obj || typeof obj !== 'object') return null
    if (Array.isArray(obj)) obj = obj[0]
    if (!obj || typeof obj !== 'object') return null
    let cmds = obj.commands || obj.command || obj.ggb || obj.script || ''
    if (Array.isArray(cmds)) cmds = cmds.join(';')
    cmds = String(cmds).trim()
    if (!cmds) return null
    const desc = String(obj.description || obj.desc || obj.label || '').trim()
    return { commands: cmds, description: desc }
  }

  // ── 1. Full JSON parse ────────────────────────────────────────────────────
  try {
    const r = extract(JSON.parse(cleaned))
    if (r) return r
  } catch { /* fall through */ }

  // ── 2. Find outermost { ... } using brace-depth counting ─────────────────
  // Greedy: find ALL { } pairs, try each from last to first
  const opens = []
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') opens.push(i)
  }
  for (let oi = opens.length - 1; oi >= 0; oi--) {
    const start = opens[oi]
    let depth = 0
    let end = -1
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++
      else if (cleaned[i] === '}') {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
    if (end !== -1) {
      try {
        const r = extract(JSON.parse(cleaned.slice(start, end + 1)))
        if (r) return r
      } catch { /* try next */ }
    }
  }

  // ── 3. Array wrapper [ {...} ] ────────────────────────────────────────────
  const arrStart = cleaned.indexOf('[')
  const arrEnd   = cleaned.lastIndexOf(']')
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      const r = extract(JSON.parse(cleaned.slice(arrStart, arrEnd + 1)))
      if (r) return r
    } catch { /* fall through */ }
  }

  // ── 4. Regex: commands key with quoted value ──────────────────────────────
  const cmdMatch = cleaned.match(/["']?commands["']?\s*:\s*["']([^"'\n]{5,})["']/)
  if (cmdMatch) {
    const desc = (cleaned.match(/["']?description["']?\s*:\s*["']([^"'\n]{1,80})["']/) || [])[1] || ''
    return { commands: cmdMatch[1].trim(), description: desc.trim() }
  }

  // ── 5. Gemma bullet-point fallback ───────────────────────────────────────
  // Gemma models sometimes echo the input and list key elements as bullets
  // instead of outputting JSON. We try to reconstruct GeoGebra commands
  // from the bullet content: extract A=(x,y) style coordinates and known
  // shape keywords.
  const pointMatches = [...cleaned.matchAll(/([A-Z])\s*=\s*\((-?[\d.]+)\s*,\s*(-?[\d.]+)\)/g)]
  if (pointMatches.length >= 2) {
    const points = pointMatches.map(m => `${m[1]}=(${m[2]},${m[3]})`)
    const ptNames = pointMatches.map(m => m[1])
    const cmds = [...points]

    // Detect shape keywords and add appropriate GeoGebra command
    const lc = cleaned.toLowerCase()
    if (lc.includes('polygon') || lc.includes('triangle') || lc.includes('ত্রিভুজ') || ptNames.length === 3) {
      cmds.push(`t=Polygon[${ptNames.join(',')}]`)
    } else if (ptNames.length >= 4) {
      cmds.push(`p=Polygon[${ptNames.join(',')}]`)
    }
    if (lc.includes('circumcenter') || lc.includes('পরিকেন্দ্র')) {
      const polyVar = cmds.find(c => c.startsWith('t=') || c.startsWith('p='))
      const pv = polyVar ? polyVar.split('=')[0] : ptNames[0]
      cmds.push(`O=Circumcenter[${pv}]`, `cc=Circle[O,${ptNames[0]}]`)
    }
    if (lc.includes('incenter') || lc.includes('অন্তকেন্দ্র')) {
      const polyVar = cmds.find(c => c.startsWith('t=') || c.startsWith('p='))
      const pv = polyVar ? polyVar.split('=')[0] : ptNames[0]
      cmds.push(`I=Incenter[${pv}]`, `ic=Circle[I,Distance[I,Segment[${ptNames[0]},${ptNames[1]}]]]`)
    }
    if (lc.includes('circle') || lc.includes('বৃত্ত')) {
      if (!cmds.some(c => c.includes('Circle'))) {
        cmds.push(`O=(0,0);c=Circle[O,${ptNames[0]}]`)
      }
    }

    console.log('[geometry] fallback extraction produced:', cmds.join(';'))
    return { commands: cmds.join(';'), description: 'জ্যামিতিক চিত্র' }
  }

  console.warn('[geometry] parseGeometryResponse: all strategies failed')
  return null
}

// ─── Route ───────────────────────────────────────────────────────────────────
router.post('/translate', checkAiCredit(1), async (req, res, next) => {
  try {
    const { prompt } = req.body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      throw new AppError('একটি বর্ণনা দিন (কমপক্ষে ৩ অক্ষর)', 400)
    }
    if (prompt.length > 500) {
      throw new AppError('বর্ণনাটি অনেক বড় — ৫০০ অক্ষরের মধ্যে রাখুন', 400)
    }

    // Load dependencies lazily (avoids circular-require during startup)
    const { TEXT_CHAIN, ALL_MAP } = require('../services/aiProviders')
    const userApiKeyService = require('../services/userApiKeyService')
    const configService = require('../services/configService')
    const creditService = require('../services/creditService')

    // ── 1. Atomic pre-charge ────────────────────────────────────────────────
    await creditService.decrementCredits(req.user.uid, 1)

    const messages = [
      { role: 'system', content: GEOMETRY_SYSTEM_PROMPT },
      {
        role: 'user',
        // Self-contained user message — works even if the model ignores system prompt.
        // Gemma models (used in gemini provider for text) sometimes echo the input
        // rather than following a separate system instruction, so we embed the
        // output contract directly in the user turn as well.
        content: `TASK: Convert the following geometry description to GeoGebra Classic commands.

DESCRIPTION: "${prompt.trim()}"

RESPOND WITH ONLY THIS JSON (no markdown, no explanation, no bullet points):
{"commands":"<semicolon-separated GeoGebra commands>","description":"<short Bengali label, max 10 words>"}

EXAMPLES:
Input: "সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪"
Output: {"commands":"A=(0,0);B=(3,0);C=(0,4);Polygon[A,B,C];RightAngle(B,A,C)","description":"সমকোণী ত্রিভুজ ABC"}

Input: "বৃত্ত ব্যাসার্ধ ৫"
Output: {"commands":"O=(0,0);c=Circle[O,5]","description":"কেন্দ্র O ব্যাসার্ধ ৫ বিশিষ্ট বৃত্ত"}

Input: "ত্রিভুজ ABC যেখানে A=(0,5), B=(-3,0), C=(4,0) এবং পরিবৃত্ত"
Output: {"commands":"A=(0,5);B=(-3,0);C=(4,0);t=Polygon[A,B,C];O=Circumcenter[t];cc=Circle[O,A]","description":"ত্রিভুজ ABC ও পরিবৃত্ত O"}

Now output the JSON for the given description. JSON only:`,
      },
    ]

    // ── 2. Walk provider chain until one succeeds ───────────────────────────
    const config = await configService.getConfig()
    const providerNames =
      config?.aiProviderConfig?.text_chain || TEXT_CHAIN.map((p) => p.name)
    const chain = providerNames.map((n) => ALL_MAP[n]).filter(Boolean)
    const userKeys = await userApiKeyService.loadAllForUser(req.user.uid)

    // For geometry we MUST get JSON back. Gemma models (gemma-4-31b-it,
    // gemma-4-26b-a4b-it) ignore the JSON instruction and return bullet-point
    // markdown instead. We call the gemini provider with a forced Gemini Flash
    // model by passing a special hint, OR we just skip gemma and let the
    // regular gemini flash models handle it via a direct call.
    //
    // Strategy: try each provider but for 'gemini', pass an env var override
    // so it uses flash models instead of gemma. If parse still fails, try
    // the next provider.

    let rawText = ''
    let usedProvider = 'unknown'
    let anyProviderAvailable = false

    // Build ordered chain: put gemini first but force flash models,
    // then try groq/mistral/openrouter as fallbacks
    const GEMMA_NAMES = new Set(['gemma-4-31b-it', 'gemma-4-26b-a4b-it'])

    for (const p of chain) {
      const userKey = userKeys[p.name]
      const envVarName = ENV_KEY_MAP[p.name]
      const envKey = envVarName ? process.env[envVarName] : undefined
      const apiKey = userKey || envKey

      if (envVarName !== null && !apiKey) continue
      anyProviderAvailable = true

      let attempt = ''
      try {
        // For gemini provider: temporarily override to force flash models
        // by setting jsonMode=false and temperature very low
        attempt = await racedChat(p, {
          messages,
          vision: false,
          jsonMode: false,
          temperature: 0.1,  // very deterministic
          apiKey,
          // Pass a hint that gemini.js can use to prefer flash over gemma
          // (gemini.js respects the 'preferredModels' hint if we add it)
          _forceFlash: true,
        })

        // ── Validate immediately — if Gemma gave bullets, try next provider
        const quickParse = parseGeometryResponse(attempt)
        if (!quickParse || !quickParse.commands) {
          console.warn(`[geometry] ${p.name} gave non-JSON response (${attempt.slice(0,80)}…) — trying next provider`)
          rawText = ''
          attempt = ''
          continue  // skip to next provider
        }

        rawText = attempt
        usedProvider = p.name
        console.log(`[geometry] ✓ ${p.name} gave valid JSON`)
        break
      } catch (e) {
        console.warn(`[geometry] ✗ ${p.name}: ${e.message}`)
        rawText = ''
      }
    }

    // ── 3. Handle total failure ─────────────────────────────────────────────
    if (!rawText) {
      await creditService.incrementCredits(req.user.uid, 1).catch(() => {})
      if (!anyProviderAvailable) {
        throw new AppError(
          'কোনো AI provider configure করা নেই। Settings → AI Providers থেকে key যোগ করুন।',
          503,
        )
      }
      throw new AppError(
        'সব AI provider ব্যর্থ হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন।',
        502,
      )
    }

    // ── 4. Parse the model's JSON response ─────────────────────────────────
    console.log(`[geometry] raw response (${usedProvider}):`, rawText.slice(0, 400))
    const parsed = parseGeometryResponse(rawText)
    if (!parsed || !parsed.commands) {
      await creditService.incrementCredits(req.user.uid, 1).catch(() => {})
      throw new AppError(
        'AI থেকে সঠিক GeoGebra commands পাওয়া যায়নি — আরও বিস্তারিত বর্ণনা দিন।',
        422,
      )
    }

    // ── 5. Respond ──────────────────────────────────────────────────────────
    // Normalise commands: collapse any newlines/extra semicolons into single semicolons
    const normalisedCommands = parsed.commands
      .replace(/\r\n|\r|\n/g, ';')
      .replace(/;+/g, ';')
      .replace(/^;|;$/g, '')
      .trim()

    res.json({
      success: true,
      commands: normalisedCommands,
      description: parsed.description,
      provider: usedProvider,
      creditsCharged: 1,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
