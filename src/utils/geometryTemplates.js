/**
 * Geometry Templates Utility
 *
 * Pre-defined shape templates covering Bangladeshi curriculum (Classes 1-10).
 * Organized by class level and category for easy navigation.
 */

import api from '@/services/api'

// ─── Shape Categories by Class Level ───────────────────────────────────────

export const SHAPE_CATEGORIES = [
  // ═════════════════════════════════════════════════════════════════════════
  // PRIMARY LEVEL (Classes 1-5) - Visual identification & basic drawing
  // ═════════════════════════════════════════════════════════════════════════

  {
    id: 'basic-shapes',
    level: 'primary',
    label: 'মৌলিক আকার',
    icon: '🔷',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    shapes: [
      { id: 'round', label: 'গোল (Round)', icon: '⭕' },
      { id: 'triangular', label: 'তিনকোনা', icon: '🔺' },
      { id: 'square-rect', label: 'চারকোনা', icon: '⬜' },
    ],
  },

  {
    id: 'lines',
    level: 'primary',
    label: 'রেখা',
    icon: '│',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    shapes: [
      { id: 'straight-line', label: 'সরল রেখা', icon: '━' },
      { id: 'curved-line', label: 'বক্র রেখা', icon: '︶' },
      { id: 'parallel', label: 'সমান্তরাল রেখা', icon: '║' },
      { id: 'perpendicular', label: 'লম্ব রেখা', icon: '⊥' },
    ],
  },

  {
    id: 'basic-elements',
    level: 'primary',
    label: 'মৌলিক উপাদান',
    icon: '•',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    shapes: [
      { id: 'point', label: 'বিন্দু (Point)', icon: '•' },
      { id: 'line-segment', label: 'রেখাংশ', icon: '──' },
      { id: 'ray', label: 'রশ্মি', icon: '→' },
    ],
  },

  {
    id: 'angles',
    level: 'primary',
    label: 'কোণ',
    icon: '∠',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    shapes: [
      { id: 'right-angle', label: 'সমকোণ (90°)', icon: '┓' },
      { id: 'acute-angle', label: 'সূক্ষ্মকোণ', icon: '∠' },
      { id: 'obtuse-angle', label: 'স্থূলকোণ', icon: '⦢' },
      { id: 'straight-angle', label: 'সরলকোণ (180°)', icon: '━' },
    ],
  },

  {
    id: 'primary-triangles',
    level: 'primary',
    label: 'ত্রিভুজ',
    icon: '🔺',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    shapes: [
      { id: 'basic-triangle', label: 'সাধারণ ত্রিভুজ', icon: '△' },
      { id: 'right-triangle', label: 'সমকোণী ত্রিভুজ', icon: '📐' },
    ],
  },

  {
    id: 'primary-quads',
    level: 'primary',
    label: 'চতুর্ভুজ',
    icon: '▭',
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    shapes: [
      { id: 'rectangle', label: 'আয়তক্ষেত্র', icon: '▭' },
      { id: 'square', label: 'বর্গক্ষেত্র', icon: '⬜' },
      { id: 'parallelogram-basic', label: 'সমান্তরিক', icon: '▱' },
      { id: 'rhombus-basic', label: 'রম্বস', icon: '◇' },
      { id: 'trapezium', label: 'ট্রাপিজিয়াম', icon: '⏢' },
    ],
  },

  {
    id: 'circles',
    level: 'primary',
    label: 'বৃত্ত',
    icon: '⭕',
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    shapes: [
      { id: 'circle', label: 'বৃত্ত', icon: '⭕' },
      { id: 'circle-parts', label: 'ব্যাস, জ্যা, ব্যাসার্ধ', icon: '◎' },
      { id: 'semicircle', label: 'অর্ধবৃত্ত', icon: '◑' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LOWER SECONDARY (Classes 6-8) - Logic, classification, theorems
  // ═════════════════════════════════════════════════════════════════════════

  {
    id: 'angle-relations',
    level: 'lower-secondary',
    label: 'কোণ সম্পর্ক',
    icon: '∠',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    shapes: [
      { id: 'adjacent-angles', label: 'সন্নিহিত কোণ', icon: '∠∠' },
      { id: 'vertical-angles', label: 'বিপ্রতীপ কোণ', icon: '×' },
      { id: 'supplementary', label: 'সম্পূরক কোণ', icon: '⌞' },
      { id: 'complementary', label: 'পূরক কোণ', icon: '⌟' },
    ],
  },

  {
    id: 'triangles-classified',
    level: 'lower-secondary',
    label: 'ত্রিভুজ শ্রেণী',
    icon: '🔺',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    shapes: [
      { id: 'equilateral', label: 'সমবাহু ত্রিভুজ', icon: '🔺' },
      { id: 'isosceles', label: 'সমদ্বিবাহু ত্রিভুজ', icon: '🔷' },
      { id: 'scalene', label: 'বিষমবাহু ত্রিভুজ', icon: '△' },
      { id: 'acute-triangle', label: 'সূক্ষ্মকোণী ত্রিভুজ', icon: '△' },
      { id: 'obtuse-triangle', label: 'স্থূলকোণী ত্রিভুজ', icon: '△' },
    ],
  },

  {
    id: 'transversal',
    level: 'lower-secondary',
    label: 'ছেদক রেখা',
    icon: '✂',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    shapes: [
      { id: 'transversal-angles', label: 'অন্তঃকোণ ও বহিঃকোণ', icon: '🔄' },
      { id: 'alternate-angles', label: 'একান্তর কোণ', icon: '≡' },
      { id: 'corresponding-angles', label: 'অনুরূপ কোণ', icon: '🔃' },
      { id: 'co-interior-angles', label: 'অন্তঃমুখী কোণ', icon: '⟨' },
    ],
  },

  {
    id: 'quad-theorems',
    level: 'lower-secondary',
    label: 'চতুর্ভুজ উপপাদ্য',
    icon: '▭',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    shapes: [
      { id: 'quad-sum-360', label: 'চতুর্ভুজ কোণ যোগফল = 360°', icon: '▭' },
      { id: 'parallelogram-diagonals', label: 'সমান্তরিক কর্ণ', icon: '✜' },
      { id: 'rhombus-diagonals', label: 'রম্বস লম্ব কর্ণ', icon: '⊗' },
    ],
  },

  {
    id: 'pythagoras',
    level: 'lower-secondary',
    label: 'পিথাগোরাস',
    icon: '📐',
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    shapes: [
      { id: 'pythagorean-triangle', label: 'পিথাগোরাস ত্রিভুজ', icon: '📐' },
      { id: 'pythagorean-proof', label: 'পিথাগোরাস প্রমাণ', icon: '📜' },
    ],
  },

  {
    id: 'circle-theorems-basic',
    level: 'lower-secondary',
    label: 'বৃত্ত উপপাদ্য',
    icon: '⭕',
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    shapes: [
      { id: 'chord-perpendicular', label: 'জ্যা ⊥ ব্যাসার্ধ', icon: '⊥' },
      { id: 'equal-chords', label: 'সমান জ্যা সমান দূরত্ব', icon: '≈' },
      { id: 'circle-angles', label: 'কেন্দ্র ও পরিধি কোণ', icon: '🎯' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECONDARY (Classes 9-10 General) - Rigorous proofs, coordinate
  // ═════════════════════════════════════════════════════════════════════════

  {
    id: 'advanced-triangles',
    level: 'secondary',
    label: 'উন্নত ত্রিভুজ',
    icon: '🔺',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    shapes: [
      { id: 'exterior-angle', label: 'বহিঃকোণ উপপাদ্য', icon: '∠' },
      { id: 'triangle-inequality', label: 'ত্রিভুজ অসমতা', icon: '≶' },
      { id: 'midpoint-theorem', label: 'মধ্যবিন্দু উপপাদ্য', icon: '─┼─' },
    ],
  },

  {
    id: 'inscribed-circles',
    level: 'secondary',
    label: 'নিয়নবদ্ধ বৃত্ত',
    icon: '◎',
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    shapes: [
      { id: 'same-segment-angles', label: 'একই চাপ কোণ', icon: '≡' },
      { id: 'semicircle-right', label: 'অর্ধবৃত্ত সমকোণ', icon: '⦵' },
      { id: 'cyclic-quad', label: 'বৃত্তীয় চতুর্ভুজ', icon: '◤' },
      { id: 'tangent-radius', label: 'স্পর্শক ⊥ ব্যাসার্ধ', icon: '⊙' },
    ],
  },

  {
    id: 'special-circles',
    level: 'secondary',
    label: 'বিশেষ বৃত্ত',
    icon: '◉',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    shapes: [
      { id: 'circumcircle', label: 'পরিবৃত্ত', icon: '○' },
      { id: 'incircle', label: 'অন্তর্বৃত্ত', icon: '⊙' },
      { id: 'excircle', label: 'বহির্বৃত্ত', icon: '⊙' },
    ],
  },

  {
    id: 'similarity',
    level: 'secondary',
    label: 'সদৃশতা',
    icon: '∽',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    shapes: [
      { id: 'thales-theorem', label: 'থেলস উপপাদ্য', icon: '∥' },
      { id: 'angle-bisector', label: 'কোণ সমদ্বিখণ্ড', icon: '∠' },
      { id: 'similar-triangles', label: 'সদৃশ ত্রিভুজ', icon: '△△' },
    ],
  },

  {
    id: 'area-theorems',
    level: 'secondary',
    label: 'ক্ষেত্রফল উপপাদ্য',
    icon: '▢',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    shapes: [
      { id: 'parallelogram-area', label: 'সমান্তরিক ক্ষেত্রফল', icon: '▱' },
      { id: 'triangle-area', label: 'ত্রিভুজ ক্ষেত্রফল', icon: '△' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // HIGHER MATH (Classes 9-10) - Advanced theorems, vectors, 3D
  // ═════════════════════════════════════════════════════════════════════════

  {
    id: 'advanced-theorems',
    level: 'higher-math',
    label: 'উন্নত উপপাদ্য',
    icon: '📜',
    color: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    shapes: [
      { id: 'apollonius', label: 'অ্যাপোলোনিয়াস', icon: '📐' },
      { id: 'ptolemy', label: 'টলেমি', icon: '⬡' },
      { id: 'euler-line', label: 'অয়লার রেখা', icon: '─○─' },
    ],
  },

  {
    id: 'triangle-centers',
    level: 'higher-math',
    label: 'ত্রিভুজ কেন্দ্র',
    icon: '◇',
    color: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    shapes: [
      { id: 'orthocenter', label: 'লম্ববিন্দু', icon: '⊥' },
      { id: 'circumcenter', label: 'পরিকেন্দ্র', icon: '○' },
      { id: 'centroid', label: 'ভরকেন্দ্র', icon: '✜' },
      { id: 'incenter', label: 'অন্তঃকেন্দ্র', icon: '⊙' },
    ],
  },

  {
    id: 'coordinate-geometry',
    level: 'higher-math',
    label: 'স্থানাঙ্ক জ্যামিতি',
    icon: '📊',
    color: 'linear-gradient(135deg, #2563eb, #1e40af)',
    shapes: [
      { id: 'distance-formula', label: 'দূরত্ব সূত্র', icon: '┈' },
      { id: 'slope-line', label: 'রেখার ঢাল', icon: '╱' },
      { id: 'line-equation', label: 'রেখার সমীকরণ', icon: '━' },
    ],
  },

  {
    id: 'vectors',
    level: 'higher-math',
    label: 'ভেক্টর',
    icon: '→',
    color: 'linear-gradient(135deg, #0891b2, #0e7490)',
    shapes: [
      { id: 'position-vector', label: 'অবস্থান ভেক্টর', icon: '→' },
      { id: 'vector-addition', label: 'ভেক্টর যোগ', icon: '➜' },
      { id: 'triangle-vector', label: 'ত্রিভুজ ভেক্টর', icon: '△→' },
    ],
  },

  {
    id: 'solids',
    level: 'higher-math',
    label: 'ঘন জ্যামিতি',
    icon: '🧊',
    color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    shapes: [
      { id: 'cube', label: 'ঘনক', icon: '🧊' },
      { id: 'cylinder', label: 'বেলন', icon: '🥫' },
      { id: 'cone', label: 'কোনাঙ্ক', icon: '📐' },
      { id: 'sphere', label: 'গোলক', icon: '🔮' },
    ],
  },
]

// ─── Backend API ─────────────────────────────────────────────────────────────

export async function fetchShapeTemplates() {
  try {
    const { data } = await api.get('/geometry/templates')
    if (data.success && data.templates) {
      return data.templates
    }
    return []
  } catch (err) {
    console.warn('[geometryTemplates] Fetch failed:', err.message)
    return []
  }
}

let templateCache = null

export async function getTemplateById(shapeId) {
  if (!templateCache) {
    templateCache = await fetchShapeTemplates()
  }

  const template = templateCache.find(t => t.id === shapeId)

  if (template) {
    return template
  }

  return null
}

export function clearTemplateCache() {
  templateCache = null
}

// ─── GeoGebra Commands Fallback ─────────────────────────────────────────────

export const SHAPE_COMMANDS = {
  // ═════════════════════════════════════════════════════════════════════════
  // PRIMARY LEVEL (Classes 1-5) — NCTB Exam Standard
  // All shapes include: labeled points, angle arcs, right angle marks,
  // side lengths, and equality markers where applicable.
  // ═════════════════════════════════════════════════════════════════════════

  // গোল (Round) — circle with center O, radius labeled
  round: 'O=(0,0);c=Circle[O,3];Text["r",(1.5,-0.5)]',

  // তিনকোনা — basic triangle (GeoGebra auto-labels A, B, C)
  triangular: 'A=(0,0);B=(3,0);C=(1,2);t=Polygon[A,B,C]',

  // চারকোনা — rectangle shape
  'square-rect': 'A=(0,0);B=(4,0);C=(4,3);D=(0,3);r=Polygon[A,B,C,D];RightAngle(C,B,A);RightAngle(D,A,B);Text["4",(2,-0.5)];Text["3",(4.5,1.5)]',

  // সরল রেখা — straight line (GeoGebra auto-labels A, B)
  'straight-line': 'A=(-5,0);B=(5,0);Segment[A,B]',

  // বক্র রেখা — curved line (arc)
  'curved-line': 'O=(0,0);c=Circle[O,3]',

  // সমান্তরাল রেখা — parallel lines with arrow markers (>>)
  parallel: 'A=(-4,1);B=(4,1);C=(-4,-1);D=(4,-1);L1=Segment[A,B];L2=Segment[C,D];Text[">>",(4.3,1)];Text[">>",(4.3,-1)]',

  // লম্ব রেখা — perpendicular lines with right angle mark
  perpendicular: 'A=(-4,0);B=(4,0);C=(0,-4);D=(0,4);Segment[A,B];Segment[C,D];RightAngle(B,(0,0),D)',

  // বিন্দু (Point) — labeled points (GeoGebra auto-labels)
  point: 'A=(0,0);B=(2,3);C=(-1,2)',

  // রেখাংশ — line segment with length label
  'line-segment': 'A=(-3,0);B=(3,0);Segment[A,B];Text["6 cm",(0,-0.6)]',

  // রশ্মি — ray from A through B (GeoGebra auto-labels A, B)
  ray: 'A=(0,0);B=(5,0);Ray[A,B]',

  // সমকোণ (90°) — right angle with square mark + label
  'right-angle': 'A=(0,0);B=(3,0);C=(0,2);Segment[A,B];Segment[A,C];RightAngle(B,A,C);Text["৯০°",(0.4,0.3)]',

  // সূক্ষ্মকোণ — acute angle with arc + label
  'acute-angle': 'A=(0,0);B=(3,0);C=(2,1);Segment[A,B];Segment[A,C];Angle[B,A,C];Text["সূক্ষ্মকোণ",(1.5,0.8)]',

  // স্থূলকোণ — obtuse angle with arc + label
  'obtuse-angle': 'A=(0,0);B=(3,0);C=(-1,1);Segment[A,B];Segment[A,C];Angle[B,A,C];Text["স্থূলকোণ",(-0.5,0.8)]',

  // সরলকোণ (180°) — straight angle
  'straight-angle': 'A=(-3,0);O=(0,0);B=(3,0);Segment[A,B];Text["180°",(0,-0.6)]',

  // সাধারণ ত্রিভুজ — with all vertex labels + side labels
  'basic-triangle': 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];Angle[A,B,C];Angle[B,C,A];Angle[C,A,B];Text["c",(2.5,1.8)];Text["a",(2.5,-0.5)];Text["b",(0.2,1.8)]',

  // সমকোণী ত্রিভুজ — right triangle with right angle mark + side labels (3-4-5)
  'right-triangle': 'A=(0,0);B=(3,0);C=(0,4);t=Polygon[A,B,C];RightAngle(B,A,C);Text["3",(1.5,-0.5)];Text["4",(-0.6,2)];Text["5",(1.8,2.2)]',

  // আয়তক্ষেত্র — rectangle with right angles, length/width labels
  rectangle: 'A=(0,0);B=(6,0);C=(6,4);D=(0,4);r=Polygon[A,B,C,D];RightAngle(D,A,B);RightAngle(A,B,C);RightAngle(B,C,D);Text["6 cm",(3,-0.6)];Text["4 cm",(6.7,2)]',

  // বর্গক্ষেত্র — square with right angles + equal side labels
  square: 'A=(0,0);B=(4,0);C=(4,4);D=(0,4);s=Polygon[A,B,C,D];RightAngle(D,A,B);RightAngle(A,B,C);Text["a",(2,-0.6)];Text["a",(4.6,2)];Text["a",(2,4.5)];Text["a",(-0.7,2)]',

  // সমান্তরিক — parallelogram with parallel markers, height
  'parallelogram-basic': 'A=(0,0);B=(5,0);C=(7,3);D=(2,3);p=Polygon[A,B,C,D];H=(2,0);Segment[H,D];RightAngle(B,H,D);Text[">>",(2.5,-0.5)];Text[">>",(4.5,3.2)];Text["b",(2.5,-0.8)];Text["h",(1.5,1.5)]',

  // রম্বস — rhombus with equal side markers
  'rhombus-basic': 'A=(2,0);B=(5,3);C=(2,6);D=(-1,3);r=Polygon[A,B,C,D];Segment[A,C];Segment[B,D];Text["a",(3.7,1.2)];Text["a",(3.7,4.8)];Text["a",(0.3,4.8)];Text["a",(0.3,1.2)]',

  // ট্রাপিজিয়াম — trapezium with parallel top/bottom markers
  trapezium: 'A=(0,0);B=(6,0);C=(4,3);D=(1,3);t=Polygon[A,B,C,D];Text[">>",(3,-0.5)];Text[">>",(2.5,3.3)];Text["a",(3,-0.8)];Text["b",(2.5,3.6)]',

  // বৃত্ত — circle with center O + radius label
  circle: 'O=(0,0);A=(3,0);c=Circle[O,3];Segment[O,A];Text["r = 3",(1.5,-0.5)]',

  // ব্যাস, জ্যা, ব্যাসার্ধ — circle with diameter, chord, radius labeled
  'circle-parts': 'O=(0,0);A=(-3,0);B=(3,0);P=(0,3);c=Circle[O,3];d=Segment[A,B];r=Segment[O,P];E=(-2.12,2.12);F=(2.12,2.12);ch=Segment[E,F];Text["ব্যাস",(0,-0.6)];Text["ব্যাসার্ধ",(-1,2)];Text["জ্যা",(0,2.6)]',

  // অর্ধবৃত্ত — semicircle with diameter + arc
  semicircle: 'O=(0,0);A=(-3,0);B=(3,0);C=(0,3);c=Circle[O,3];Segment[A,B];Segment[A,C];Segment[B,C];RightAngle(A,C,B);Text["ব্যাস",(0,-0.6)]',

  // ═════════════════════════════════════════════════════════════════════════
  // LOWER SECONDARY (Classes 6-8)
  // ═════════════════════════════════════════════════════════════════════════
  // ─── NCTB Exam Standard: angle arcs, degree labels, equality markers ───

  // সন্নিহিত কোণ — adjacent angles sharing ray AB, with α and β labels
  'adjacent-angles': 'A=(0,0);B=(5,0);C=(-2,3);D=(2,3);Segment[A,B];Segment[A,C];Segment[A,D];Angle[B,A,C];Angle[C,A,D];Text["α",(-0.6,0.8)];Text["β",(0.6,0.8)];Text["α + β",(2,3.5)]',

  // বিপ্রতীপ কোণ — vertical/vertically opposite angles (α = α, β = β)
  'vertical-angles': 'A=(-3,2);B=(0,0);C=(3,-2);D=(3,2);E=(-3,-2);Segment[A,B];Segment[B,C];Segment[D,B];Segment[B,E];Angle[A,B,D];Angle[D,B,C];Angle[C,B,E];Angle[E,B,A];Text["α",(0.5,0.8)];Text["α",(-0.7,-0.8)];Text["β",(-0.7,0.8)];Text["β",(0.5,-0.8)]',

  // সম্পূরক কোণ — supplementary angles (α + β = 180°) on a straight line
  supplementary: 'A=(-3,0);O=(0,0);B=(3,0);C=(2,2);Segment[A,B];Segment[O,C];Angle[A,O,C];Angle[C,O,B];Text["α",(-1,0.6)];Text["β",(1.2,0.6)];Text["α + β = 180°",(0,2.5)]',

  // পূরক কোণ — complementary angles (α + β = 90°)
  complementary: 'A=(3,0);O=(0,0);B=(0,3);C=(2,2);Segment[O,A];Segment[O,B];Segment[O,C];Angle[A,O,C];Angle[C,O,B];RightAngle((3,0),(0,0),(0,3));Text["α",(1,0.4)];Text["β",(0.3,1)];Text["α + β = 90°",(2,2.8)]',

  // সমবাহু ত্রিভুজ — all sides equal, all angles 60°, equality marks
  equilateral: 'A=(0,0);B=(4,0);C=(2,3.46);t=Polygon[A,B,C];Angle[A,B,C];Angle[B,C,A];Angle[C,A,B];Text["a",(2,-0.5)];Text["a",(3.2,1.8)];Text["a",(0.5,1.8)];Text["60°",(1,0.5)];Text["60°",(3,0.5)];Text["60°",(1.8,2.8)]',

  // সমদ্বিবাহু ত্রিভুজ — two equal sides with equality marks
  isosceles: 'A=(0,0);B=(4,0);C=(2,3);t=Polygon[A,B,C];Angle[A,B,C];Angle[B,C,A];Angle[C,A,B];Text["a",(-0.5,1.8)];Text["a",(4.2,1.8)];Text["b",(2,-0.5)];Text["∠B = ∠C",(3.5,2)]',

  // বিষমবাহু ত্রিভুজ — all sides different, labeled a, b, c
  scalene: 'A=(0,0);B=(5,0);C=(1,3);t=Polygon[A,B,C];Angle[A,B,C];Angle[B,C,A];Angle[C,A,B];Text["a",(3,-0.5)];Text["b",(-0.3,1.8)];Text["c",(3.2,1.5)]',

  // সূক্ষ্মকোণী ত্রিভুজ — all angles acute, with angle arcs
  'acute-triangle': 'A=(0,0);B=(4,0);C=(3,3);t=Polygon[A,B,C];Angle[A,B,C];Angle[B,C,A];Angle[C,A,B];Text["সূক্ষ্ম",(0.5,0.5)];Text["সূক্ষ্ম",(3.5,0.5)];Text["সূক্ষ্ম",(1.5,2)]',

  // স্থূলকোণী ত্রিভুজ — one angle obtuse, with angle arc
  'obtuse-triangle': 'A=(0,0);B=(4,0);C=(-1,2);t=Polygon[A,B,C];Angle[A,B,C];Angle[B,C,A];Angle[C,A,B];Text["স্থূল",(-0.3,0.8)];Text["সূক্ষ্ম",(3.5,0.5)];Text["সূক্ষ্ম",(1.5,1.8)]',

  // ছেদক রেখা — 2 parallel lines (>>) + transversal with angle labels
  'transversal-angles': 'P=(-5,2);Q=(5,2);R=(-5,-2);S=(5,-2);E=(-2,-2);F=(2,2);L1=Segment[P,Q];L2=Segment[R,S];L3=Segment[E,F];Text[">>",(-5.3,2)];Text[">>",(-5.3,-2)];Text["l",(0,2.5)];Text["m",(0,-2.5)];Text["n",(2.5,0)];Angle[R,E,F];Angle[F,E,Q];Text["1",(-1,0)];Text["2",(-1.5,1)];Text["3",(0.5,1)];Text["4",(0.5,0)]',

  // একান্তর কোণ — alternate interior angles marked equal (α = α)
  'alternate-angles': 'P=(-5,2);Q=(5,2);R=(-5,-2);S=(5,-2);E=(-3,-2);F=(3,2);L1=Segment[P,Q];L2=Segment[R,S];L3=Segment[E,F];Text[">>",(-5.3,2)];Text[">>",(-5.3,-2)];Text["α",(-1.5,0)];Text["α",(2,1.5)];Text["একান্তর কোণ",(0,3.5)]',

  // অনুরূপ কোণ — corresponding angles marked equal (β = β)
  'corresponding-angles': 'P=(-5,2);Q=(5,2);R=(-5,-2);S=(5,-2);E=(-3,-2);F=(3,2);L1=Segment[P,Q];L2=Segment[R,S];L3=Segment[E,F];Text[">>",(-5.3,2)];Text[">>",(-5.3,-2)];Text["β",(-1.5,1)];Text["β",(-1.5,-1)];Text["অনুরূপ কোণ",(0,3.5)]',

  // অন্তঃমুখী কোণ — co-interior angles (γ + δ = 180°)
  'co-interior-angles': 'P=(-5,2);Q=(5,2);R=(-5,-2);S=(5,-2);E=(-3,-2);F=(3,2);L1=Segment[P,Q];L2=Segment[R,S];L3=Segment[E,F];Text[">>",(-5.3,2)];Text[">>",(-5.3,-2)];Text["γ",(-1.5,0)];Text["δ",(0.5,1)];Text["γ + δ = 180°",(0,3.5)]',

  // চতুর্ভুজ কোণ যোগফল = 360° — quadrilateral with all 4 angles marked
  'quad-sum-360': 'A=(0,0);B=(4,0);C=(5,3);D=(1,4);q=Polygon[A,B,C,D];Angle[D,A,B];Angle[A,B,C];Angle[B,C,D];Angle[C,D,A];Text["∠A",(0.3,0.8)];Text["∠B",(3.5,0.8)];Text["∠C",(4.8,2.5)];Text["∠D",(0.8,3)];Text["∠A+∠B+∠C+∠D = 360°",(2.5,5)]',

  // সমান্তরিক কর্ণ — parallelogram with diagonals intersecting at O
  'parallelogram-diagonals': 'A=(0,0);B=(6,0);C=(8,4);D=(2,4);p=Polygon[A,B,C,D];Segment[A,C];Segment[B,D];O=(4,2);Text["AO = OC",(5,3)];Text["BO = OD",(2,0.5)]',

  // রম্বস লম্ব কর্ণ — rhombus with perpendicular diagonals
  'rhombus-diagonals': 'A=(2,0);B=(5,3);C=(2,6);D=(-1,3);r=Polygon[A,B,C,D];Segment[A,C];Segment[B,D];RightAngle((2,0),(2,3),(5,3));Text["d₁",(3.7,1.5)];Text["d₂",(0.3,4.5)];Text["d₁ ⊥ d₂",(4,5)]',

  // পিথাগোরাস ত্রিভুজ (3-4-5) — with side labels + right angle mark
  'pythagorean-triangle': 'A=(0,0);B=(3,0);C=(0,4);t=Polygon[A,B,C];RightAngle(B,A,C);Text["3",(1.5,-0.5)];Text["4",(-0.6,2)];Text["5",(1.8,2.2)];Text["3² + 4² = 5²",(2,4.5)]',

  // পিথাগোরাস প্রমাণ — triangle + squares on all 3 sides with area labels
  'pythagorean-proof': 'A=(0,0);B=(3,0);C=(0,4);t=Polygon[A,B,C];RightAngle(B,A,C);D=(3,-3);E=(0,-3);s1=Polygon[A,B,D,E];F=(-4,0);G=(-4,4);s2=Polygon[A,F,G,C];H=(4,7);I=(7,3);s3=Polygon[B,C,H,I];Text["3²=9",(1.5,-1.5)];Text["4²=16",(-2,2)];Text["5²=25",(5.5,5)];Text["9 + 16 = 25",(3.5,-2)]',

  // জ্যা ⊥ ব্যাসার্ধ — chord ⊥ radius, with right angle mark
  'chord-perpendicular': 'O=(0,0);c=Circle[O,3];A=(-2.45,1.74);B=(2.45,1.74);M=(0,1.74);Segment[A,B];Segment[O,M];RightAngle(A,M,O);Text["জ্যা AB",(0,2.3)];Text["OM ⊥ AB",(1.5,0.8)]',

  // সমান জ্যা সমান দূরত্ব — two equal chords with equal markers + distances
  'equal-chords': 'O=(0,0);c=Circle[O,3];A=(-2.6,1.5);B=(2.6,1.5);C=(-2.6,-1.5);D=(2.6,-1.5);Segment[A,B];Segment[C,D];Segment[O,A];Segment[O,B];Segment[O,C];Segment[O,D];Text["AB = CD",(0,0)];Text["d₁",(-1.5,0)];Text["d₂",(1.5,0)];Text["d₁ = d₂",(3.5,0)]',

  // কেন্দ্র ও পরিধি কোণ — central angle = 2 × inscribed angle
  'circle-angles': 'O=(0,0);c=Circle[O,3];A=(3,0);B=(-3,0);C=(0,3);D=(2.12,2.12);Segment[O,A];Segment[O,C];Segment[A,C];Segment[O,D];Angle[A,O,C];Angle[A,D,C];Text["2α",(1,1)];Text["α",(2,2)];Text["কেন্দ্রীয় কোণ = 2 × পরিধি কোণ",(0,-1)]',

  // ═════════════════════════════════════════════════════════════════════════
  // SECONDARY (Classes 9-10 General)
  // ═════════════════════════════════════════════════════════════════════════
  // Triangle A(0,0) B(4,0) C(1,3) — pre-computed centers:
  // Centroid G=(1.67,1), Orthocenter H=(1,1), Circumcenter O=(2,1), R≈2.24
  // Incenter I≈(1.46,1.05), r≈1.05

  // ─── NCTB Exam Standard with angle arcs, labels, theorem annotations ───

  // বহিঃকোণ উপপাদ্য — exterior angle = sum of interior opposite angles
  'exterior-angle': 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];D=(5,1.5);Segment[B,C];Segment[B,D];Angle[A,B,C];Angle[C,B,D];Angle[B,C,A];Text["∠A",(0.3,0.8)];Text["∠ACB",(1.5,2)];Text["∠CBD = ∠A + ∠ACB",(3,2.5)]',

  // ত্রিভুজ অসমতা — triangle inequality
  'triangle-inequality': 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];Text["a",(2,-0.5)];Text["b",(-0.3,1.8)];Text["c",(2.8,1.5)];Text["a+b>c",(3,3.5)];Text["b+c>a",(3,4.2)];Text["a+c>b",(3,4.9)]',

  // মধ্যবিন্দু উপপাদ্য — MN ∥ BC and MN = ½BC (M, N auto-labeled)
  'midpoint-theorem': 'A=(0,0);B=(6,0);C=(2,3);t=Polygon[A,B,C];M=Midpoint[A,B];N=Midpoint[A,C];Segment[M,N];Segment[B,C];Text["MN ∥ BC",(3,2)];Text["MN = ½BC",(3,2.7)]',

  // একই চাপ কোণ — angles in same segment are equal
  'same-segment-angles': 'O=(0,0);c=Circle[O,4];A=(3,2);B=(3,-2);C=(-4,0);D=(-3,2);Segment[A,C];Segment[B,C];Segment[A,D];Segment[B,D];Angle[A,C,B];Angle[A,D,B];Text["α",(-1,0)];Text["α",(-1.5,2)];Text["একই চাপের কোণ সমান",(0,5)]',

  // অর্ধবৃত্ত সমকোণ — angle in semicircle = 90°
  'semicircle-right': 'A=(-3,0);B=(3,0);c=Circle[(0,0),3];C=(0,3);Segment[A,C];Segment[B,C];Segment[A,B];RightAngle(A,C,B);Text["90°",(0.3,2.5)];Text["অর্ধবৃত্তের কোণ = 90°",(0,-1)]',

  // বৃত্তীয় চতুর্ভুজ — opposite angles sum = 180°
  'cyclic-quad': 'O=(0,0);c=Circle[O,4];A=(3,3);B=(3,-3);C=(-2,-3);D=(-2,3);q=Polygon[A,B,C,D];Angle[D,A,B];Angle[B,C,D];Text["α",(2,2)];Text["β",(-0.5,-1)];Text["α + β = 180°",(0,5)]',

  // স্পর্শক ⊥ ব্যাসার্ধ — tangent perpendicular to radius
  'tangent-radius': 'O=(0,0);c=Circle[O,3];T=(3,0);P=(6,0);Segment[O,T];Segment[T,P];RightAngle(O,T,P);Text["স্পর্শক ⊥ ব্যাসার্ধ",(4,1)]',

  // পরিবৃত্ত — circumcircle through all vertices
  circumcircle: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];O=(2,1);cc=Circle[(2,1),2.24];Segment[O,A];Segment[O,B];Segment[O,C];Text["R",(3,0.5)]',

  // অন্তর্বৃত্ত — incircle tangent to all sides
  incircle: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];I=(1.46,1.05);ic=Circle[(1.46,1.05),1.05];Text["r",(2,0.5)]',

  // বহির্বৃত্ত — excircle
  excircle: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];E=(-1.5,-2.1);ec=Circle[(-1.5,-2.1),2.5]',

  // থেলস উপপাদ্য — line parallel to base divides sides proportionally
  'thales-theorem': 'A=(0,0);B=(6,0);C=(2,3);t=Polygon[A,B,C];D=(3,0);E=(3,1.5);Segment[D,E];Text["AD/DB = AE/EC",(4,2.5)];Text[">>",(3.2,1.5)];Text[">>",(3.2,0)]',

  // কোণ সমদ্বিখণ্ডক — angle bisector
  'angle-bisector': 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];D=(2.5,1.5);Segment[A,D];Angle[B,A,D];Angle[D,A,C];Text["∠BAD = ∠DAC",(1.5,1)];Text["AD কোণ সমদ্বিখণ্ডক",(3,3)]',

  // সদৃশ ত্রিভুজ — similar triangles with same angles marked
  'similar-triangles': 'A1=(0,0);B1=(4,0);C1=(2,3);t1=Polygon[A1,B1,C1];A2=(6,0);B2=(8,0);C2=(7,1.5);t2=Polygon[A2,B2,C2];Angle[A1,B1,C1];Angle[A2,B2,C2];Text["~",(5,0.8)];Text["ΔABC ~ ΔDEF",(4,3.5)]',

  // সমান্তরিক ক্ষেত্রফল — area = base × height
  'parallelogram-area': 'A=(0,0);B=(6,0);C=(8,4);D=(2,4);p=Polygon[A,B,C,D];H=(2,0);Segment[H,D];RightAngle(B,H,D);Text["b",(3,-0.5)];Text["h",(1.5,2)];Text["ক্ষেত্রফল = b × h",(4,5)]',

  // ত্রিভুজ ক্ষেত্রফল — area = ½ × base × height
  'triangle-area': 'A=(0,0);B=(5,0);C=(2,4);t=Polygon[A,B,C];H=(2,0);Segment[H,C];RightAngle(B,H,C);Text["b",(2.5,-0.5)];Text["h",(2.3,2)];Text["ক্ষেত্রফল = ½bh",(3.5,4.5)]',

  // ═════════════════════════════════════════════════════════════════════════
  // HIGHER MATH (Classes 9-10)
  // ═════════════════════════════════════════════════════════════════════════
  // Using triangle A(0,0) B(4,0) C(1,3) with pre-computed centers

  // অ্যাপোলোনিয়াস — median theorem: AB²+AC² = 2(AM²+BM²) (M auto-labeled)
  apollonius: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];M=Midpoint[B,C];Segment[A,M];Segment[B,C];Text["AB²+AC² = 2(AM²+BM²)",(-1,4)]',

  // টলেমি — cyclic quad: AC×BD = AB×CD + BC×AD
  ptolemy: 'A=(0,0);B=(4,0);C=(5,3);D=(1,3);q=Polygon[A,B,C,D];Segment[A,C];Segment[B,D];Text["AC·BD = AB·CD + BC·AD",(2.5,4.5)]',

  // অয়লার রেখা — H, G, O collinear (points auto-labeled by GeoGebra)
  'euler-line': 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];H=(1,1);Oc=(2,1);G=(1.67,1);Segment[H,Oc];Text["লম্ববিন্দু",(1.2,1.6)];Text["ভরকেন্দ্র",(2,0.3)];Text["পরিকেন্দ্র",(2.5,1.5)];Text["অয়লার রেখা",(-1,4)]',

  // লম্ববিন্দু (Orthocenter) — intersection of altitudes (H auto-labeled)
  orthocenter: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];H=(1,1);Segment[A,H];Segment[B,H];Segment[C,H];Text["লম্ববিন্দু",(-1,4)]',

  // পরিকেন্দ্র (Circumcenter) — center of circumcircle (Oc auto-labeled)
  circumcenter: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];Oc=(2,1);Segment[Oc,A];Segment[Oc,B];Segment[Oc,C];cc=Circle[(2,1),2.24];Text["R",(3,0.5)];Text["পরিকেন্দ্র",(-1,4)]',

  // ভরকেন্দ্র (Centroid) — intersection of medians (G auto-labeled)
  centroid: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];G=(1.67,1);Ma=(2.5,1.5);Mb=(0.5,1.5);Mc=(2,0);Segment[A,Ma];Segment[B,Mb];Segment[C,Mc];Text["ভরকেন্দ্র",(-1,4)]',

  // অন্তঃকেন্দ্র (Incenter) — center of incircle (I auto-labeled)
  incenter: 'A=(0,0);B=(4,0);C=(1,3);t=Polygon[A,B,C];I=(1.46,1.05);ic=Circle[(1.46,1.05),1.05];Segment[I,A];Segment[I,B];Segment[I,C];Text["r",(2,0.5)];Text["অন্তঃকেন্দ্র",(-1,4)]',

  // দূরত্ব সূত্র — distance formula with right triangle
  'distance-formula': 'A=(2,3);B=(5,7);Segment[A,B];C=(5,3);Segment[A,C];Segment[C,B];RightAngle(A,C,B);Text["d = √[(x₂-x₁)²+(y₂-y₁)²]",(3.5,5)];Text["(2,3)",(1.5,2.5)];Text["(5,7)",(5.2,7.2)]',

  // রেখার ঢাল — slope with right angle triangle
  'slope-line': 'A=(1,2);B=(4,6);Segment[A,B];C=(4,2);Segment[A,C];Segment[C,B];RightAngle(A,C,B);Text["m = (y₂-y₁)/(x₂-x₁)",(2,7)];Text["rise",(4.3,4)];Text["run",(2.5,1.5)]',

  // রেখার সমীকরণ — line equation
  'line-equation': 'A=(1,2);B=(4,6);Segment[A,B];C=(-1,-2);Segment[C,B];Text["y = mx + c",(5,4)];Text["(1,2)",(0.5,1.5)];Text["(4,6)",(4.2,6.2)]',

  // অবস্থান ভেক্টর — position vector from origin (O, P auto-labeled)
  'position-vector': 'O=(0,0);P=(3,4);Segment[O,P];Text["r⃗ = OP",(1.5,2.5)]',

  // ভেক্টর যোগ — vector addition (parallelogram law)
  'vector-addition': 'O=(0,0);A=(2,1);B=(1,3);C=(3,4);Segment[O,A];Segment[O,B];Segment[O,C];Segment[A,C];Segment[B,C];Text["a⃗",(1,0.2)];Text["b⃗",(0.3,1.5)];Text["a⃗+b⃗",(2,2.5)]',

  // ত্রিভুজ ভেক্টর — triangle law of vectors
  'triangle-vector': 'O=(0,0);A=(1,2);B=(4,1);C=(2,4);Segment[A,B];Segment[B,C];Segment[C,A];Segment[O,A];Segment[O,B];Segment[O,C];Text["a⃗+b⃗+c⃗ = 0⃗",(3,4)]',
  // 3D solids as 2D textbook-style wireframes (no Ellipse — uses Circle + Segments only)
  cube: 'A=(0,0);B=(4,0);C=(4,4);D=(0,4);E=(1.5,1.5);F=(5.5,1.5);G=(5.5,5.5);H=(1.5,5.5);Segment[A,B];Segment[B,C];Segment[C,D];Segment[D,A];Segment[E,F];Segment[F,G];Segment[G,H];Segment[H,E];Segment[A,E];Segment[B,F];Segment[C,G];Segment[D,H]',
  cylinder: 'O=(0,0);c1=Circle[O,3];E=(0,5);c2=Circle[E,3];A=(-3,0);B=(3,0);C=(-3,5);D=(3,5);Segment[A,C];Segment[B,D]',
  cone: 'O=(0,0);c1=Circle[O,3];T=(0,6);A=(-3,0);B=(3,0);Segment[A,T];Segment[B,T]',
  sphere: 'O=(0,0);c=Circle[O,3]',
}

export default {
  SHAPE_CATEGORIES,
  fetchShapeTemplates,
  getTemplateById,
  clearTemplateCache,
  SHAPE_COMMANDS,
}
