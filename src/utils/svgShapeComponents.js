/**
 * SVG Shape Components Registry
 *
 * Maps shape IDs to their React SVG components
 * Used in BookGeometryModal for rendering SVG previews
 */

// Import all SVG components
import SingleAngle from '@/components/svg/shapes/SingleAngle'
import LineSegment from '@/components/svg/shapes/LineSegment'
import AdjacentAngle from '@/components/svg/shapes/AdjacentAngle'
import VerticallyOpposite from '@/components/svg/shapes/VerticallyOpposite'
import Triangle from '@/components/svg/shapes/Triangle'
import Quadrilateral from '@/components/svg/shapes/Quadrilateral'
import CircleGeometry from '@/components/svg/shapes/CircleGeometry'
import CubeWireframe from '@/components/svg/shapes/CubeWireframe'
import CylinderCone from '@/components/svg/shapes/CylinderCone'
import NetDiagram from '@/components/svg/shapes/NetDiagram'
import NumberLineGeometry from '@/components/svg/shapes/NumberLineGeometry'
import TransversalLines from '@/components/svg/shapes/TransversalLines'
import GeometryTheorem from '@/components/svg/shapes/GeometryTheorem'
import CircleTheorem from '@/components/svg/shapes/CircleTheorem'
import CoordinateAxes from '@/components/svg/shapes/CoordinateAxes'
import TrigonometryDiagram from '@/components/svg/shapes/TrigonometryDiagram'

/**
 * Maps shape/template IDs to their component and default props
 * This allows BookGeometryModal to render SVG components directly
 */
export const SVG_COMPONENT_MAP = {
  // ─── Angles ────────────────────────────────────────────────
  'right-angle': { Component: SingleAngle, props: { initialAngle: 90 }, name: 'সমকোণ (90°)' },
  'acute-angle': { Component: SingleAngle, props: { initialAngle: 45 }, name: 'সূক্ষ্মকোণ' },
  'obtuse-angle': { Component: SingleAngle, props: { initialAngle: 120 }, name: 'স্থূলকোণ' },
  'straight-angle': { Component: SingleAngle, props: { initialAngle: 180 }, name: 'সরলকোণ (180°)' },

  'adjacent-complementary': { Component: AdjacentAngle, props: { mode: 'complementary', initialAngle1: 30 }, name: 'পূরক কোণ' },
  'adjacent-supplementary': { Component: AdjacentAngle, props: { mode: 'supplementary', initialAngle1: 45 }, name: 'সম্পূরক কোণ' },
  'vertically-opposite': { Component: VerticallyOpposite, props: { initialAngle: 35 }, name: 'বিপ্রতীপ কোণ' },

  // ─── Lines ─────────────────────────────────────────────────
  'line-segment': { Component: LineSegment, props: { type: 'segment' }, name: 'রেখাংশ' },
  'ray': { Component: LineSegment, props: { type: 'ray' }, name: 'রশ্মি' },
  'straight-line': { Component: LineSegment, props: { type: 'line' }, name: 'সরল রেখা' },

  // ─── Triangles ─────────────────────────────────────────────
  'right-triangle': { Component: Triangle, props: { type: 'right', editable: true }, name: 'সমকোণী ত্রিভুজ' },
  'equilateral': { Component: Triangle, props: { type: 'equilateral', editable: true }, name: 'সমবাহু ত্রিভুজ' },
  'isosceles': { Component: Triangle, props: { type: 'isosceles', editable: true }, name: 'সমদ্বিবাহু ত্রিভুজ' },
  'scalene': { Component: Triangle, props: { type: 'scalene', editable: true }, name: 'বিষমবাহু ত্রিভুজ' },

  // ─── Quadrilaterals ─────────────────────────────────────────
  'rectangle': { Component: Quadrilateral, props: { type: 'rectangle', editable: true }, name: 'আয়তক্ষেত্র' },
  'square': { Component: Quadrilateral, props: { type: 'square', editable: true }, name: 'বর্গক্ষেত্র' },
  'parallelogram': { Component: Quadrilateral, props: { type: 'parallelogram', editable: true }, name: 'সমান্তরিক' },
  'rhombus': { Component: Quadrilateral, props: { type: 'rhombus', editable: true }, name: 'রম্বস' },
  'trapezium': { Component: Quadrilateral, props: { type: 'trapezium', editable: true }, name: 'ট্রাপিজিয়াম' },

  // ─── Circle ─────────────────────────────────────────────────
  'circle': { Component: CircleGeometry, props: { showParts: { center: true, radius: true }, editable: true }, name: 'বৃত্ত' },
  'circle-parts': { Component: CircleGeometry, props: { showParts: { center: true, radius: true, diameter: true, chord: true }, editable: true }, name: 'ব্যাস, জ্যা, ব্যাসার্ধ' },

  // ─── 3D Shapes ─────────────────────────────────────────────
  'cube': { Component: CubeWireframe, props: { editable: true }, name: 'ঘনক' },
  'cuboid': { Component: CubeWireframe, props: { editable: true }, name: 'আবদ্ধ ঘনবস্তু' },
  'cylinder': { Component: CylinderCone, props: { type: 'cylinder', editable: true }, name: 'বেলন' },
  'cone': { Component: CylinderCone, props: { type: 'cone', editable: true }, name: 'কোণক' },
  'net-cube': { Component: NetDiagram, props: { type: 'cube', editable: true }, name: 'ঘনকের নেট' },
  'net-cylinder': { Component: NetDiagram, props: { type: 'cylinder', editable: true }, name: 'বেলনের নেট' },
  'net-cone': { Component: NetDiagram, props: { type: 'cone', editable: true }, name: 'কোণকের নেট' },

  // ─── Number Line ───────────────────────────────────────────
  'number-line': { Component: NumberLineGeometry, props: { min: -5, max: 5, editable: true }, name: 'সংখ্যা রেখা' },

  // ─── Class 6: Extra angles & lines ────────────────────────
  'reflex-angle':           { Component: GeometryTheorem, props: { type: 'reflex-angle',       editable: true }, name: 'প্রবৃদ্ধ কোণ' },
  'complete-angle':         { Component: GeometryTheorem, props: { type: 'complete-angle',     editable: true }, name: 'পূর্ণকোণ (360°)' },
  'perpendicular-lines':    { Component: GeometryTheorem, props: { type: 'perpendicular-lines', editable: true }, name: 'লম্ব রেখা' },
  'parallel-lines-basic':   { Component: GeometryTheorem, props: { type: 'parallel-lines-basic', editable: true }, name: 'সমান্তরাল রেখা' },
  'angle-bisector-construct': { Component: AdjacentAngle,  props: { mode: 'bisector', editable: true },           name: 'কোণ দ্বিখণ্ডক অঙ্কন' },

  // ─── Class 7: Triangle theorems ───────────────────────────
  'angle-sum-triangle':  { Component: GeometryTheorem, props: { type: 'angle-sum-triangle',  editable: true }, name: 'ত্রিভুজের কোণ = 180°' },
  'isosceles-theorem':   { Component: GeometryTheorem, props: { type: 'isosceles-theorem',   editable: true }, name: 'সমদ্বিবাহু ত্রিভুজের ধর্ম' },

  // ─── Class 8: Square diagonals ────────────────────────────
  'square-diagonals':    { Component: Quadrilateral,    props: { type: 'square', showDiagonals: true, editable: true }, name: 'বর্গক্ষেত্রের কর্ণ' },

  // ─── Class 9: Advanced theorems ───────────────────────────
  'centroid':                    { Component: GeometryTheorem, props: { type: 'centroid',                  editable: true }, name: 'মধ্যমা ও ভরকেন্দ্র' },
  'equal-area-parallelogram':    { Component: GeometryTheorem, props: { type: 'equal-area-parallelogram',  editable: true }, name: 'সমক্ষেত্র সমান্তরিক' },
  'equal-area-triangle':         { Component: GeometryTheorem, props: { type: 'equal-area-triangle',      editable: true }, name: 'সমক্ষেত্র ত্রিভুজ' },
  'line-symmetry':               { Component: GeometryTheorem, props: { type: 'line-symmetry',            editable: true }, name: 'রেখা প্রতিসাম্য' },

  // ─── Class 7: Triangles (extra types) ──────────────────────
  'basic-triangle':  { Component: GeometryTheorem, props: { type: 'basic', editable: true },   name: 'সাধারণ ত্রিভুজ' },
  'acute-triangle':  { Component: GeometryTheorem, props: { type: 'acute', editable: true },   name: 'সূক্ষ্মকোণী ত্রিভুজ' },
  'obtuse-triangle': { Component: GeometryTheorem, props: { type: 'obtuse', editable: true },  name: 'স্থূলকোণী ত্রিভুজ' },

  // ─── Class 7: Congruence & Similarity ──────────────────────
  'congruent-triangles': { Component: GeometryTheorem, props: { type: 'congruent', editable: true }, name: 'সর্বসম ত্রিভুজ' },
  'similar-triangles':   { Component: GeometryTheorem, props: { type: 'similar',   editable: true }, name: 'সদৃশ ত্রিভুজ' },

  // ─── Class 7: Coordinate ───────────────────────────────────
  'coordinate-graph-basic': { Component: CoordinateAxes, props: { editable: true }, name: 'স্থানাঙ্ক জ্যামিতি' },

  // ─── Class 8: Quadrilateral theorems ───────────────────────
  'kite':                    { Component: Quadrilateral, props: { type: 'kite', editable: true },                    name: 'ঘুড়ি (Kite)' },
  'quad-sum-360':            { Component: Quadrilateral, props: { type: 'quad-angles', editable: true },              name: 'চতুর্ভুজ কোণ = 360°' },
  'parallelogram-diagonals': { Component: Quadrilateral, props: { type: 'parallelogram-diagonals', editable: true },  name: 'সমান্তরিক কর্ণ' },
  'rhombus-diagonals':       { Component: Quadrilateral, props: { type: 'rhombus-diagonals', editable: true },        name: 'রম্বস লম্ব কর্ণ' },

  // ─── Class 8: Pythagorean theorem ──────────────────────────
  'pythagorean-triangle': { Component: GeometryTheorem, props: { type: 'pythagorean',       editable: true }, name: 'পিথাগোরাস ত্রিভুজ' },
  'pythagorean-proof':    { Component: GeometryTheorem, props: { type: 'pythagorean-proof',  editable: true }, name: 'পিথাগোরাস প্রমাণ' },

  // ─── Class 8: Circle theorems ──────────────────────────────
  'chord-perpendicular': { Component: CircleTheorem, props: { type: 'chord-perp',       editable: true }, name: 'জ্যার উপর লম্ব' },
  'equal-chords':        { Component: CircleTheorem, props: { type: 'equal-chords',     editable: true }, name: 'সমান জ্যা' },
  'circle-angles':       { Component: CircleTheorem, props: { type: 'central-inscribed', editable: true }, name: 'কেন্দ্রীয় ও বৃত্তস্থ কোণ' },
  'semicircle-right':    { Component: CircleTheorem, props: { type: 'semicircle-right', editable: true }, name: 'অর্ধবৃত্তে সমকোণ' },

  // ─── Class 9: Angle pairs ──────────────────────────────────
  'adjacent-angles':     { Component: AdjacentAngle,    props: { mode: 'adjacent', initialAngle1: 60, editable: true }, name: 'সন্নিহিত কোণ' },
  'vertical-angles':     { Component: VerticallyOpposite, props: { initialAngle: 40, editable: true },                       name: 'বিপ্রতীপ কোণ' },
  'supplementary':       { Component: AdjacentAngle,    props: { mode: 'supplementary', initialAngle1: 55, editable: true }, name: 'সম্পূরক কোণ' },
  'complementary':       { Component: AdjacentAngle,    props: { mode: 'complementary', initialAngle1: 35, editable: true }, name: 'পূরক কোণ' },
  'transversal-angles':  { Component: TransversalLines,  props: { type: 'basic',         editable: true },                   name: 'ছেদক রেখা' },
  'alternate-angles':    { Component: TransversalLines,  props: { type: 'alternate',     editable: true },                   name: 'একান্তর কোণ' },
  'corresponding-angles':{ Component: TransversalLines,  props: { type: 'corresponding', editable: true },                   name: 'অনুরূপ কোণ' },
  'co-interior-angles':  { Component: TransversalLines,  props: { type: 'co-interior',   editable: true },                   name: 'অন্তঃমুখী কোণ' },

  // ─── Class 9: Triangle theorems ────────────────────────────
  'exterior-angle':      { Component: GeometryTheorem, props: { type: 'exterior-angle',     editable: true }, name: 'বহিঃকোণ উপপাদ্য' },
  'triangle-inequality': { Component: GeometryTheorem, props: { type: 'triangle-inequality', editable: true }, name: 'ত্রিভুজ অসমতা' },
  'midpoint-theorem':    { Component: GeometryTheorem, props: { type: 'midpoint',            editable: true }, name: 'মধ্যবিন্দু উপপাদ্য' },
  'thales-theorem':      { Component: GeometryTheorem, props: { type: 'thales',              editable: true }, name: 'থেলস উপপাদ্য (BPT)' },
  'angle-bisector':      { Component: GeometryTheorem, props: { type: 'angle-bisector',      editable: true }, name: 'কোণ দ্বিখণ্ডক উপপাদ্য' },
  'triangle-area':       { Component: GeometryTheorem, props: { type: 'triangle-area',       editable: true }, name: 'ত্রিভুজের ক্ষেত্রফল' },
  'parallelogram-area':  { Component: GeometryTheorem, props: { type: 'parallelogram-area',  editable: true }, name: 'সমান্তরিকের ক্ষেত্রফল' },

  // ─── Class 9: Construction (simplified diagrams) ───────────
  'triangle-construction': { Component: GeometryTheorem, props: { type: 'triangle-construction', editable: true }, name: 'ত্রিভুজ অঙ্কন' },
  'quad-construction':     { Component: Quadrilateral,   props: { type: 'construction', editable: true }, name: 'চতুর্ভুজ অঙ্কন' },
  'circle-construction':   { Component: CircleGeometry,  props: { showParts: { center: true, radius: true }, editable: true }, name: 'বৃত্ত অঙ্কন' },

  // ─── Class 9: Advanced circle theorems ─────────────────────
  'same-segment-angles': { Component: CircleTheorem, props: { type: 'same-segment',     editable: true }, name: 'একই চাপে কোণ' },
  'cyclic-quad':         { Component: CircleTheorem, props: { type: 'cyclic-quad',       editable: true }, name: 'বৃত্তীয় চতুর্ভুজ' },
  'tangent-radius':      { Component: CircleTheorem, props: { type: 'tangent-radius',    editable: true }, name: 'স্পর্শক ⊥ ব্যাসার্ধ' },
  'circumcircle':        { Component: CircleTheorem, props: { type: 'circumcircle',      editable: true }, name: 'পরিবৃত্ত' },
  'incircle':            { Component: CircleTheorem, props: { type: 'incircle',          editable: true }, name: 'অন্তর্বৃত্ত' },
  'excircle':            { Component: CircleTheorem, props: { type: 'excircle',          editable: true }, name: 'বহির্বৃত্ত' },

  // ─── Class 9-10: Circles (advanced) ───────────────────────
  'tangent-secant':      { Component: CircleTheorem,       props: { type: 'tangent-secant',     editable: true }, name: 'স্পর্শক ও ছেদক' },
  'two-tangents':        { Component: CircleTheorem,       props: { type: 'two-tangents',        editable: true }, name: 'বহিঃবিন্দু থেকে স্পর্শক' },
  'alternate-segment':   { Component: CircleTheorem,       props: { type: 'alternate-segment',  editable: true }, name: 'একান্তর খণ্ড উপপাদ্য' },

  // ─── Class 9-10: Trigonometry & Coordinate ─────────────────
  'right-triangle-trig': { Component: TrigonometryDiagram, props: { type: 'right-trig',     editable: true }, name: 'ত্রিকোণমিতিক অনুপাত' },
  'unit-circle':         { Component: TrigonometryDiagram, props: { type: 'unit-circle',    editable: true }, name: 'একক বৃত্ত' },
  'trig-graph':          { Component: TrigonometryDiagram, props: { type: 'trig-graph',     editable: true }, name: 'ত্রিকোণমিতিক ফাংশন গ্রাফ' },
  'distance-formula':    { Component: TrigonometryDiagram, props: { type: 'distance',       editable: true }, name: 'দূরত্ব সূত্র' },
  'slope-line':          { Component: TrigonometryDiagram, props: { type: 'slope',          editable: true }, name: 'রেখার ঢাল' },
  'line-equation':       { Component: TrigonometryDiagram, props: { type: 'line-equation',  editable: true }, name: 'রেখার সমীকরণ' },
}

/**
 * Check if a shape ID has an SVG component available
 */
export function hasSVGComponent(shapeId) {
  return shapeId in SVG_COMPONENT_MAP
}

/**
 * Get SVG component for a shape ID
 */
export function getSVGComponent(shapeId) {
  return SVG_COMPONENT_MAP[shapeId] || null
}

export default SVG_COMPONENT_MAP
