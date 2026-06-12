/**
 * Chapter-wise Geometry Data
 *
 * Maps curriculum chapters to relevant geometric figures.
 * Organized by class → chapter → figures for textbook-aligned navigation.
 *
 * References existing templates from geometryTemplates.js SHAPE_COMMANDS
 */

// ═════════════════════════════════════════════════════════════════════════
// CLASS 6 (ষষ্ঠ শ্রেণি)
// ═════════════════════════════════════════════════════════════════════════

export const CHAPTER_GEOMETRY_MAP = {
  'class-6': {
    'ch-6': {
      title: 'জ্যামিতির মৌলিক ধারণা',
      figures: [
        { id: 'line-segment', name: 'রেখাংশ (Line Segment)', template: 'line-segment' },
        { id: 'ray', name: 'রশ্মি (Ray)', template: 'ray' },
        { id: 'straight-line', name: 'সরল রেখা', template: 'straight-line' },
        { id: 'right-angle', name: 'সমকোণ (90°)', template: 'right-angle' },
        { id: 'acute-angle', name: 'সূক্ষ্মকোণ', template: 'acute-angle' },
        { id: 'obtuse-angle', name: 'স্থূলকোণ', template: 'obtuse-angle' },
        { id: 'straight-angle', name: 'সরলকোণ (180°)', template: 'straight-angle' },
        { id: 'reflex-angle', name: 'প্রবৃদ্ধ কোণ (>180°)', template: 'reflex-angle' },
        { id: 'complete-angle', name: 'পূর্ণকোণ (360°)', template: 'complete-angle' },
        { id: 'adjacent-complementary', name: 'পূরক কোণ (90°)', template: 'adjacent-complementary' },
        { id: 'adjacent-supplementary', name: 'সম্পূরক কোণ (180°)', template: 'adjacent-supplementary' },
        { id: 'vertically-opposite', name: 'বিপ্রতীপ কোণ', template: 'vertically-opposite' },
        { id: 'perpendicular-lines', name: 'লম্ব রেখা', template: 'perpendicular-lines' },
        { id: 'parallel-lines-basic', name: 'সমান্তরাল রেখা', template: 'parallel-lines-basic' },
        { id: 'number-line', name: 'সংখ্যা রেখা', template: 'number-line' },
      ]
    },
    'ch-7': {
      title: 'ব্যবহারিক জ্যামিতি',
      figures: [
        { id: 'angle-bisector-construct', name: 'কোণ দ্বিখণ্ডক অঙ্কন', template: 'angle-bisector-construct' },
        { id: 'right-triangle', name: 'সমকোণী ত্রিভুজ', template: 'right-triangle' },
        { id: 'equilateral', name: 'সমবাহু ত্রিভুজ', template: 'equilateral' },
        { id: 'isosceles', name: 'সমদ্বিবাহু ত্রিভুজ', template: 'isosceles' },
        { id: 'scalene', name: 'বিষমবাহু ত্রিভুজ', template: 'scalene' },
        { id: 'rectangle', name: 'আয়তক্ষেত্র', template: 'rectangle' },
        { id: 'square', name: 'বর্গক্ষেত্র', template: 'square' },
        { id: 'parallelogram', name: 'সমান্তরিক', template: 'parallelogram' },
        { id: 'rhombus', name: 'রম্বস', template: 'rhombus' },
        { id: 'trapezium', name: 'ট্রাপিজিয়াম', template: 'trapezium' },
        { id: 'circle', name: 'বৃত্ত', template: 'circle' },
        { id: 'circle-parts', name: 'ব্যাস, জ্যা, ব্যাসার্ধ', template: 'circle-parts' },
        { id: 'cube', name: 'ঘনক', template: 'cube' },
        { id: 'net-cube', name: 'ঘনকের নেট', template: 'net-cube' },
        { id: 'cylinder', name: 'বেলন', template: 'cylinder' },
        { id: 'cone', name: 'কোণক', template: 'cone' },
        { id: 'net-cylinder', name: 'বেলনের নেট', template: 'net-cylinder' },
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CLASS 7 (সপ্তম শ্রেণি)
  // ═════════════════════════════════════════════════════════════════════════

  'class-7': {
    'ch-8': {
      title: 'সরল সমীকরণ',
      figures: [
        { id: 'number-line', name: 'সংখ্যা রেখা (Number Line)', template: 'number-line' },
        { id: 'coordinate-graph-basic', name: 'স্থানাঙ্ক জ্যামিতি (প্রাথমিক)', template: 'coordinate-graph-basic' },
      ]
    },
    'ch-9': {
      title: 'ত্রিভুজ',
      figures: [
        { id: 'basic-triangle', name: 'সাধারণ ত্রিভুজ', template: 'basic-triangle' },
        { id: 'right-triangle', name: 'সমকোণী ত্রিভুজ', template: 'right-triangle' },
        { id: 'equilateral', name: 'সমবাহু ত্রিভুজ', template: 'equilateral' },
        { id: 'isosceles', name: 'সমদ্বিবাহু ত্রিভুজ', template: 'isosceles' },
        { id: 'isosceles-theorem', name: 'সমদ্বিবাহু ত্রিভুজের ধর্ম', template: 'isosceles-theorem' },
        { id: 'scalene', name: 'বিষমবাহু ত্রিভুজ', template: 'scalene' },
        { id: 'acute-triangle', name: 'সূক্ষ্মকোণী ত্রিভুজ', template: 'acute-triangle' },
        { id: 'obtuse-triangle', name: 'স্থূলকোণী ত্রিভুজ', template: 'obtuse-triangle' },
        { id: 'angle-sum-triangle', name: 'কোণের সমষ্টি = 180°', template: 'angle-sum-triangle' },
      ]
    },
    'ch-10': {
      title: 'সর্বসমতা ও সদৃশতা',
      figures: [
        { id: 'congruent-triangles', name: 'সর্বসম ত্রিভুজ', template: 'congruent-triangles' },
        { id: 'similar-triangles', name: 'সদৃশ ত্রিভুজ', template: 'similar-triangles' },
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CLASS 8 (অষ্টম শ্রেণি)
  // ═════════════════════════════════════════════════════════════════════════

  'class-8': {
    'ch-8': {
      title: 'চতুর্ভুজ',
      figures: [
        { id: 'quad-sum-360', name: 'চতুর্ভুজ কোণ যোগফল = 360°', template: 'quad-sum-360' },
        { id: 'parallelogram-diagonals', name: 'সমান্তরিক কর্ণ', template: 'parallelogram-diagonals' },
        { id: 'rhombus-diagonals', name: 'রম্বস লম্ব কর্ণ', template: 'rhombus-diagonals' },
        { id: 'rectangle', name: 'আয়তক্ষেত্র', template: 'rectangle' },
        { id: 'square', name: 'বর্গক্ষেত্র', template: 'square' },
        { id: 'square-diagonals', name: 'বর্গক্ষেত্রের কর্ণ (সমান ও লম্ব)', template: 'square-diagonals' },
        { id: 'trapezium', name: 'ট্রাপিজিয়াম', template: 'trapezium' },
        { id: 'kite', name: 'ডায়মন্ড (ঘুড়ি)', template: 'kite' },
      ]
    },
    'ch-9': {
      title: 'পিথাগোরাসের উপপাদ্য',
      figures: [
        { id: 'pythagorean-triangle', name: 'পিথাগোরাস ত্রিভুজ (3-4-5)', template: 'pythagorean-triangle' },
        { id: 'pythagorean-proof', name: 'পিথাগোরাস প্রমাণ', template: 'pythagorean-proof' },
      ]
    },
    'ch-10': {
      title: 'বৃত্ত',
      figures: [
        { id: 'circle', name: 'বৃত্ত', template: 'circle' },
        { id: 'circle-parts', name: 'ব্যাস, জ্যা, ব্যাসার্ধ', template: 'circle-parts' },
        { id: 'chord-perpendicular', name: 'জ্যা ⊥ ব্যাসার্ধ', template: 'chord-perpendicular' },
        { id: 'equal-chords', name: 'সমান জ্যা সমান দূরত্ব', template: 'equal-chords' },
        { id: 'circle-angles', name: 'কেন্দ্র ও পরিধি কোণ', template: 'circle-angles' },
        { id: 'semicircle-right', name: 'অর্ধবৃত্ত সমকোণ', template: 'semicircle-right' },
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CLASS 9 (নবম শ্রেণি)
  // ═════════════════════════════════════════════════════════════════════════

  'class-9': {
    'ch-6': {
      title: 'রেখা, কোণ ও ত্রিভুজ',
      figures: [
        { id: 'adjacent-angles', name: 'সন্নিহিত কোণ', template: 'adjacent-angles' },
        { id: 'vertical-angles', name: 'বিপ্রতীপ কোণ', template: 'vertical-angles' },
        { id: 'supplementary', name: 'সম্পূরক কোণ', template: 'supplementary' },
        { id: 'complementary', name: 'পূরক কোণ', template: 'complementary' },
        { id: 'transversal-angles', name: 'ছেদক রেখা', template: 'transversal-angles' },
        { id: 'alternate-angles', name: 'একান্তর কোণ', template: 'alternate-angles' },
        { id: 'corresponding-angles', name: 'অনুরূপ কোণ', template: 'corresponding-angles' },
        { id: 'co-interior-angles', name: 'অন্তঃমুখী কোণ', template: 'co-interior-angles' },
        { id: 'exterior-angle', name: 'বহিঃকোণ উপপাদ্য', template: 'exterior-angle' },
        { id: 'triangle-inequality', name: 'ত্রিভুজ অসমতা', template: 'triangle-inequality' },
        { id: 'midpoint-theorem', name: 'মধ্যবিন্দু উপপাদ্য', template: 'midpoint-theorem' },
        { id: 'centroid', name: 'মধ্যমা ও ভরকেন্দ্র', template: 'centroid' },
      ]
    },
    'ch-7': {
      title: 'ব্যবহারিক জ্যামিতি',
      figures: [
        { id: 'triangle-construction', name: 'ত্রিভুজ অঙ্কন (SSS, SAS, ASA)', template: 'triangle-construction' },
        { id: 'quad-construction', name: 'চতুর্ভুজ অঙ্কন', template: 'quad-construction' },
        { id: 'circle-construction', name: 'বৃত্ত অঙ্কন', template: 'circle-construction' },
      ]
    },
    'ch-8': {
      title: 'বৃত্ত',
      figures: [
        { id: 'same-segment-angles', name: 'একই চাপ কোণ', template: 'same-segment-angles' },
        { id: 'semicircle-right', name: 'অর্ধবৃত্ত সমকোণ', template: 'semicircle-right' },
        { id: 'cyclic-quad', name: 'বৃত্তীয় চতুর্ভুজ', template: 'cyclic-quad' },
        { id: 'tangent-radius', name: 'স্পর্শক ⊥ ব্যাসার্ধ', template: 'tangent-radius' },
        { id: 'circumcircle', name: 'পরিবৃত্ত', template: 'circumcircle' },
        { id: 'incircle', name: 'অন্তর্বৃত্ত', template: 'incircle' },
        { id: 'excircle', name: 'বহির্বৃত্ত', template: 'excircle' },
      ]
    },
    'ch-11': {
      title: 'অনুপাত, সদৃশতা ও প্রতিসমতা',
      figures: [
        { id: 'thales-theorem', name: 'থেলস উপপাদ্য', template: 'thales-theorem' },
        { id: 'angle-bisector', name: 'কোণ সমদ্বিখণ্ড', template: 'angle-bisector' },
        { id: 'similar-triangles', name: 'সদৃশ ত্রিভুজ', template: 'similar-triangles' },
        { id: 'line-symmetry', name: 'রেখা প্রতিসাম্য', template: 'line-symmetry' },
      ]
    },
    'ch-16': {
      title: 'ক্ষেত্রফল সম্পর্কিত উপপাদ্য',
      figures: [
        { id: 'parallelogram-area', name: 'সমান্তরিক ক্ষেত্রফল', template: 'parallelogram-area' },
        { id: 'triangle-area', name: 'ত্রিভুজ ক্ষেত্রফল', template: 'triangle-area' },
        { id: 'equal-area-parallelogram', name: 'সমক্ষেত্র সমান্তরিক', template: 'equal-area-parallelogram' },
        { id: 'equal-area-triangle', name: 'সমক্ষেত্র ত্রিভুজ', template: 'equal-area-triangle' },
      ]
    },
    // Class 9-10 same book — advanced chapters merged here
    'ch-17': {
      title: 'বৃত্ত (উচ্চতর)',
      figures: [
        { id: 'tangent-secant',    name: 'স্পর্শক ও ছেদক',        template: 'tangent-secant' },
        { id: 'two-tangents',      name: 'বহিঃবিন্দু থেকে স্পর্শক', template: 'two-tangents' },
        { id: 'alternate-segment', name: 'একান্তর চাপ উপপাদ্য',   template: 'alternate-segment' },
      ]
    },
    'ch-18': {
      title: 'ত্রিকোণমিতি',
      figures: [
        { id: 'right-triangle-trig', name: 'সমকোণী ত্রিভুজ ও অনুপাত', template: 'right-triangle-trig' },
        { id: 'unit-circle',         name: 'একক বৃত্ত (Unit Circle)', template: 'unit-circle' },
        { id: 'trig-graph',          name: 'ত্রিকোণমিতিক ফাংশন গ্রাফ', template: 'trig-graph' },
      ]
    },
    'ch-19': {
      title: 'স্থানাঙ্ক জ্যামিতি',
      figures: [
        { id: 'coordinate-graph-basic', name: 'স্থানাঙ্ক অক্ষ',  template: 'coordinate-graph-basic' },
        { id: 'distance-formula',       name: 'দূরত্ব সূত্র',     template: 'distance-formula' },
        { id: 'slope-line',             name: 'রেখার ঢাল',         template: 'slope-line' },
        { id: 'line-equation',          name: 'রেখার সমীকরণ y=mx+c', template: 'line-equation' },
      ]
    }
  },

  // Class 10 points to class-9 (same book)
  'class-10': null
}

// ═════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

/**
 * Get geometry figures for a specific class and chapter
 * @param {string} classNum - 'class-6', 'class-7', etc.
 * @param {string} chapterId - 'ch-6', 'ch-7', etc.
 * @returns {Array} Array of figure objects
 */
export function getGeometryByChapter(classNum, chapterId) {
  return CHAPTER_GEOMETRY_MAP[classNum]?.[chapterId]?.figures || []
}

/**
 * Get all chapters with geometry figures for a class
 * @param {string} classNum - 'class-6', 'class-7', etc.
 * @returns {Object} Object with chapter IDs as keys
 */
export function getChaptersWithGeometry(classNum) {
  // class-10 is same book as class-9
  const key = classNum === 'class-10' ? 'class-9' : classNum
  return CHAPTER_GEOMETRY_MAP[key] || {}
}

/**
 * Get chapter title by class and chapter ID
 * @param {string} classNum - 'class-6', 'class-7', etc.
 * @param {string} chapterId - 'ch-6', 'ch-7', etc.
 * @returns {string} Chapter title
 */
export function getChapterTitle(classNum, chapterId) {
  return CHAPTER_GEOMETRY_MAP[classNum]?.[chapterId]?.title || ''
}

/**
 * Get all available classes
 * @returns {Array} Array of class IDs
 */
export function getAvailableClasses() {
  return Object.keys(CHAPTER_GEOMETRY_MAP)
}

export default CHAPTER_GEOMETRY_MAP
