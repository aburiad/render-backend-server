/**
 * GeometryTheorem.jsx
 * Various triangle/area geometry theorems
 * type: 'exterior-angle' | 'midpoint' | 'triangle-inequality' | 'similar' |
 *       'congruent' | 'thales' | 'angle-bisector' | 'triangle-area' |
 *       'parallelogram-area' | 'pythagorean' | 'pythagorean-proof' |
 *       'basic' | 'acute' | 'obtuse' | 'reflex-angle' | 'complete-angle' |
 *       'perpendicular-lines' | 'parallel-lines-basic'
 */
import { useState } from 'react'
import { getPointByAngle } from '@/utils/mathEngine'

export default function GeometryTheorem({ type = 'exterior-angle', editable = false }) {
  const [size, setSize] = useState(100)
  // Interactive state for Class 6 types
  const [reflexAngle, setReflexAngle] = useState(230)
  const [lineLength, setLineLength] = useState(80)
  const [completeAngle, setCompleteAngle] = useState(360)
  const [completeRadius, setCompleteRadius] = useState(70)
  // Interactive state for Class 7 angle-sum-triangle
  const [angleA, setAngleA] = useState(50)
  const [angleB, setAngleB] = useState(60)
  // Interactive state for Class 9 line-symmetry
  const [symAxis, setSymAxis] = useState('vertical') // 'vertical' | 'horizontal'
  const [symShape, setSymShape] = useState('arrow')  // 'arrow' | 'triangle' | 'butterfly'
  // Interactive state for Class 9-10 geometry shapes
  const [extAngleA, setExtAngleA] = useState(50)
  const [extAngleC, setExtAngleC] = useState(60)
  const [baseWidth, setBaseWidth] = useState(140)
  const [heightValue, setHeightValue] = useState(80)
  const [ratioT, setRatioT] = useState(0.45)
  const [vertexCx, setVertexCx] = useState(-10)
  const [skewShift, setSkewShift] = useState(35)
  const [vertexDx, setVertexDx] = useState(40)

  const cx = 150, cy = 160

  const diagrams = {
    'exterior-angle': () => {
      const A = { x: cx - 80, y: cy + 40 }
      const B = { x: cx + 40, y: cy + 40 }
      const ext = { x: B.x + 50, y: B.y }
      const aA = extAngleA
      const aC = extAngleC
      const aB_int = 180 - aA - aC
      const radA = aA * Math.PI / 180
      const radC = aC * Math.PI / 180
      const radB_int = aB_int * Math.PI / 180
      const sideAB = 120
      const lengthAC = sideAB * Math.sin(radB_int) / Math.sin(radC)
      const Cx = A.x + lengthAC * Math.cos(radA)
      const Cy = A.y - lengthAC * Math.sin(radA)
      const C = { x: Cx, y: Cy }

      const dirAC_A = Math.atan2(C.y - A.y, C.x - A.x)
      const dirBC_B = Math.atan2(C.y - B.y, C.x - B.x)

      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">বহিঃকোণ উপপাদ্য</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={B.x} y1={B.y} x2={ext.x} y2={ext.y} stroke="#ef4444" strokeWidth="2.5" />
          {/* Angle arcs */}
          <path d={`M ${A.x + 15} ${A.y} A 15 15 0 0 0 ${A.x + 15 * Math.cos(dirAC_A)} ${A.y + 15 * Math.sin(dirAC_A)}`} fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
          <path d={`M ${B.x + 15} ${B.y} A 15 15 0 0 0 ${B.x + 15 * Math.cos(dirBC_B)} ${B.y + 15 * Math.sin(dirBC_B)}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x={A.x - 16} y={A.y + 5} fontSize="12" fill="#8b5cf6" fontWeight="bold">∠A</text>
          <text x={C.x - 22} y={C.y + 5} fontSize="12" fill="#10b981" fontWeight="bold">∠C</text>
          <text x={B.x + 18} y={B.y - 8} fontSize="12" fill="#ef4444" fontWeight="bold">∠ext</text>
          {['A','B','C'].map((l,i) => {
            const pts = [A,B,C]; const p = pts[i]
            return <text key={l} x={p.x + (i===0?-14:i===1?6:0)} y={p.y + (i===2?-8:16)} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          })}
          <text x={cx} y={232} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">∠ext = ∠A ({aA}°) + ∠C ({aC}°) = {aA + aC}°</text>
          <text x={cx} y={248} fontSize="10" fill="#9ca3af" textAnchor="middle">(বহিঃকোণ অন্তঃস্থ বিপরীত কোণদ্বয়ের সমষ্টির সমান)</text>
        </>
      )
    },

    'midpoint': () => {
      const A = { x: cx - baseWidth/2, y: cy + 50 }
      const B = { x: cx + baseWidth/2, y: cy + 50 }
      const C = { x: cx - 20, y: cy - 60 }
      const M = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 }
      const N = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }
      const lenAB = baseWidth
      const lenMN = baseWidth / 2
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">মধ্যবিন্দু উপপাদ্য</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={M.x} y1={M.y} x2={N.x} y2={N.y} stroke="#ef4444" strokeWidth="2.5" />
          <circle cx={M.x} cy={M.y} r="5" fill="#ef4444" />
          <circle cx={N.x} cy={N.y} r="5" fill="#ef4444" />
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10],['M',M,-18,0],['N',N,8,0]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill={l==='M'||l==='N'?'#ef4444':'#374151'} fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={232} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">MN ({lenMN.toFixed(0)}) ∥ AB ({lenAB})</text>
          <text x={cx} y={248} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">এবং MN = ½AB</text>
        </>
      )
    },

    'triangle-inequality': () => {
      const A = { x: cx - baseWidth/2, y: cy + 40 }
      const B = { x: cx + baseWidth/2, y: cy + 40 }
      const C = { x: cx, y: cy - 50 }
      const c = baseWidth
      const a = Math.round(Math.sqrt((B.x - C.x)**2 + (B.y - C.y)**2))
      const b = Math.round(Math.sqrt((A.x - C.x)**2 + (A.y - C.y)**2))
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিভুজ অসমতা</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2.5" />
          <text x={(B.x+C.x)/2+10} y={(B.y+C.y)/2} fontSize="12" fill="#ef4444" fontWeight="bold">a = {a}</text>
          <text x={(A.x+C.x)/2-36} y={(A.y+C.y)/2} fontSize="12" fill="#3b82f6" fontWeight="bold">b = {b}</text>
          <text x={(A.x+B.x)/2} y={A.y+16} fontSize="12" fill="#8b5cf6" fontWeight="bold">c = {c}</text>
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={232} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">a ({a}) + b ({b}) &gt; c ({c}) ⟹ {a + b} &gt; {c}</text>
          <text x={cx} y={248} fontSize="10" fill="#9ca3af" textAnchor="middle">(যেকোনো দুই বাহুর সমষ্টি তৃতীয় বাহু অপেক্ষা বৃহত্তর)</text>
        </>
      )
    },

    'similar': () => {
      // Both triangles share the same canonical shape but with different
      // scale factors. The size slider controls k2 so the user can see
      // how the larger triangle relates to the smaller one (ratio k = k2/k1).
      const baseY = cy + 50
      const shape = [[0, 0], [80, 0], [25, -55]]  // A, B, C relative to anchor at base-left
      const k1 = 0.7  // fixed scale for smaller triangle
      const o1 = { x: cx - 100, y: baseY }
      const t1 = shape.map(([dx, dy]) => ({ x: o1.x + dx * k1, y: o1.y + dy * k1 }))
      const k2 = size / 100  // 0.7 → 1.3 from the size slider
      const o2 = { x: cx + 10, y: baseY }
      const t2 = shape.map(([dx, dy]) => ({ x: o2.x + dx * k2, y: o2.y + dy * k2 }))
      const ratio = (k2 / k1).toFixed(2)
      // Tick-mark helper — matching counts mark corresponding sides
      const tick = (p1, p2, n, color) => {
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2
        const dx = p2.x - p1.x, dy = p2.y - p1.y
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len < 1) return null
        const nx = -dy / len * 5, ny = dx / len * 5
        return Array.from({ length: n }, (_, i) => {
          const off = (i - (n - 1) / 2) * 4
          return (
            <line
              key={i}
              x1={mx + nx + dx / len * off} y1={my + ny + dy / len * off}
              x2={mx - nx + dx / len * off} y2={my - ny + dy / len * off}
              stroke={color} strokeWidth="1.5"
            />
          )
        })
      }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সদৃশ ত্রিভুজ</text>
          <polygon points={t1.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth="2.5" />
          <polygon points={t2.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2.5" />
          {/* Tick marks identify corresponding sides (same count = corresponds) */}
          {tick(t1[0], t1[1], 1, '#ef4444')}{tick(t2[0], t2[1], 1, '#ef4444')}
          {tick(t1[1], t1[2], 2, '#3b82f6')}{tick(t2[1], t2[2], 2, '#3b82f6')}
          {tick(t1[2], t1[0], 3, '#f59e0b')}{tick(t2[2], t2[0], 3, '#f59e0b')}
          {[['A',t1[0],-14,14],['B',t1[1],6,14],['C',t1[2],-6,-8]].map(([l, p, dx, dy]) =>
            <text key={l} x={p.x + dx} y={p.y + dy} fontSize="11" fill="#6366f1" fontWeight="bold">{l}</text>
          )}
          {[["A'",t2[0],-20,14],["B'",t2[1],6,14],["C'",t2[2],-6,-8]].map(([l, p, dx, dy]) =>
            <text key={l} x={p.x + dx} y={p.y + dy} fontSize="11" fill="#10b981" fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={228} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">△ABC ~ △A'B'C'</text>
          <text x={cx} y={244} fontSize="10" fill="#6b7280" textAnchor="middle">অনুরূপ বাহুর অনুপাত k = {ratio} (সব কোণ সমান, বাহু সমানুপাতিক)</text>
        </>
      )
    },

    'congruent': () => {
      const s = size / 100
      const t1 = [{x:55*s,y:190},{x:55*s+80*s,y:190},{x:55*s+20*s,y:115}]
      const t2 = [{x:165,y:190},{x:165+80*s,y:190},{x:165+20*s,y:115}]
      const tick = (p1, p2, n) => {
        const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2
        const dx = p2.x-p1.x, dy = p2.y-p1.y, len = Math.sqrt(dx*dx+dy*dy)
        if (len < 1) return null
        const nx = -dy/len*6, ny = dx/len*6
        return Array.from({length:n},(_,i)=>{
          const off = (i-(n-1)/2)*5
          return <line key={i} x1={mx+nx+dx/len*off} y1={my+ny+dy/len*off} x2={mx-nx+dx/len*off} y2={my-ny+dy/len*off} stroke="#ef4444" strokeWidth="2" />
        })
      }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সর্বসম ত্রিভুজ</text>
          <polygon points={t1.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points={t2.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="2.5" />
          {tick(t1[0],t1[1],2)}{tick(t2[0],t2[1],2)}
          {tick(t1[1],t1[2],1)}{tick(t2[1],t2[2],1)}
          {tick(t1[0],t1[2],3)}{tick(t2[0],t2[2],3)}
          <text x={cx} y={240} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">△ABC ≅ △A'B'C'</text>
        </>
      )
    },

    'triangle-construction': () => {
      // SSS construction: given three sides, find C as the intersection of
      // two compass arcs (one from A with radius b, one from B with radius a).
      const s = size / 100
      const a = 110 * s   // BC
      const b = 95 * s    // CA
      const c = 130 * s   // AB
      const baseY = cy + 60
      const A = { x: cx - c / 2, y: baseY }
      const B = { x: cx + c / 2, y: baseY }
      // C: intersection of (circle from A, radius b) and (circle from B, radius a)
      const xC = (b * b - a * a) / (2 * c) + cx
      const hSq = b * b - (xC - A.x) ** 2
      const yC = baseY - Math.sqrt(Math.max(0, hSq))
      const C = { x: xC, y: yC }
      // Compass arc parameters
      const angleAC = Math.atan2(yC - A.y, xC - A.x)
      const angleBC = Math.atan2(yC - B.y, xC - B.x)
      const spread = 0.55  // radians on each side of C's direction
      const arc1Start = { x: A.x + b * Math.cos(angleAC - spread), y: A.y + b * Math.sin(angleAC - spread) }
      const arc1End   = { x: A.x + b * Math.cos(angleAC + spread), y: A.y + b * Math.sin(angleAC + spread) }
      const arc2Start = { x: B.x + a * Math.cos(angleBC + spread), y: B.y + a * Math.sin(angleBC + spread) }
      const arc2End   = { x: B.x + a * Math.cos(angleBC - spread), y: B.y + a * Math.sin(angleBC - spread) }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিভুজ অঙ্কন (SSS)</text>
          <text x={cx} y={36} fontSize="10" fill="#9ca3af" textAnchor="middle">তিন বাহু থেকে ত্রিভুজ অঙ্কন</text>
          {/* Base AB */}
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2.5" />
          {/* Compass arc from A (radius b) */}
          <path d={`M ${arc1Start.x} ${arc1Start.y} A ${b} ${b} 0 0 1 ${arc1End.x} ${arc1End.y}`}
            fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* Compass arc from B (radius a) */}
          <path d={`M ${arc2Start.x} ${arc2Start.y} A ${a} ${a} 0 0 0 ${arc2End.x} ${arc2End.y}`}
            fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* Final triangle sides AC and BC */}
          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#6366f1" strokeWidth="2.5" />
          <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#6366f1" strokeWidth="2.5" />
          {/* Vertices */}
          <circle cx={A.x} cy={A.y} r="4" fill="#3b82f6" />
          <circle cx={B.x} cy={B.y} r="4" fill="#3b82f6" />
          <circle cx={C.x} cy={C.y} r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          {/* Labels */}
          <text x={A.x - 14} y={A.y + 14} fontSize="12" fill="#374151" fontWeight="bold">A</text>
          <text x={B.x + 6}  y={B.y + 14} fontSize="12" fill="#374151" fontWeight="bold">B</text>
          <text x={C.x - 6}  y={C.y - 8}  fontSize="12" fill="#ef4444" fontWeight="bold">C</text>
          {/* Side length labels */}
          <text x={(A.x + B.x) / 2} y={A.y + 17} fontSize="11" fill="#3b82f6" fontWeight="bold" textAnchor="middle">c = {c.toFixed(0)}</text>
          <text x={(A.x + C.x) / 2 - 22} y={(A.y + C.y) / 2 + 4} fontSize="11" fill="#ef4444" fontWeight="bold">b = {b.toFixed(0)}</text>
          <text x={(B.x + C.x) / 2 + 6}  y={(B.y + C.y) / 2 + 4} fontSize="11" fill="#10b981" fontWeight="bold">a = {a.toFixed(0)}</text>
          <text x={cx} y={232} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">দুই বৃত্তচাপের ছেদবিন্দু = শীর্ষবিন্দু C</text>
          <text x={cx} y={247} fontSize="10" fill="#6b7280" textAnchor="middle">প্রথমে AB এঁকে, A ও B থেকে যথাক্রমে b ও a ব্যাসার্ধে বৃত্তচাপ আঁকুন</text>
        </>
      )
    },

    'thales': () => {
      const A = { x: cx - 90, y: cy + 50 }
      const B = { x: cx + 90, y: cy + 50 }
      const C = { x: cx - 10, y: cy - 60 }
      // BPT: D on CA, E on CB at same ratio ratioT from C -> DE ∥ AB
      const D = { x: C.x + ratioT * (A.x - C.x), y: C.y + ratioT * (A.y - C.y) }
      const E = { x: C.x + ratioT * (B.x - C.x), y: C.y + ratioT * (B.y - C.y) }

      const CA = Math.sqrt((A.x - C.x)**2 + (A.y - C.y)**2)
      const CB = Math.sqrt((B.x - C.x)**2 + (B.y - C.y)**2)
      const CD = ratioT * CA
      const DA = (1 - ratioT) * CA
      const CE = ratioT * CB
      const EB = (1 - ratioT) * CB

      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">থেলস উপপাদ্য (BPT)</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          {/* DE ∥ AB */}
          <line x1={D.x} y1={D.y} x2={E.x} y2={E.y} stroke="#ef4444" strokeWidth="2.5" />
          <circle cx={D.x} cy={D.y} r="4" fill="#ef4444" />
          <circle cx={E.x} cy={E.y} r="4" fill="#ef4444" />
          {/* Parallel markers */}
          <text x={(D.x+E.x)/2} y={(D.y+E.y)/2-8} fontSize="10" fill="#ef4444">▶</text>
          <text x={(A.x+B.x)/2} y={A.y-8} fontSize="10" fill="#6366f1">▶</text>
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10],['D',D,-16,0],['E',E,8,0]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="11" fill={l==='D'||l==='E'?'#ef4444':'#374151'} fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={232} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">DE ∥ AB ⟹ CD/DA = CE/EB</text>
          <text x={cx} y={248} fontSize="10" fill="#9ca3af" textAnchor="middle">{(CD/DA).toFixed(2)} = {(CE/EB).toFixed(2)} (অনুপাত সমান)</text>
        </>
      )
    },

    'angle-bisector': () => {
      const A = { x: cx - 90, y: cy + 50 }
      const B = { x: cx + 90, y: cy + 50 }
      const C = { x: cx + vertexCx, y: cy - 60 }
      // D on AB: mathematically correct position so AD/DB = CA/CB
      const CA = Math.sqrt((A.x-C.x)**2 + (A.y-C.y)**2)
      const CB = Math.sqrt((B.x-C.x)**2 + (B.y-C.y)**2)
      const t = CA / (CA + CB)
      const D = { x: A.x + t * (B.x - A.x), y: A.y }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">কোণ দ্বিখণ্ডক উপপাদ্য</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="2.5" />
          <line x1={C.x} y1={C.y} x2={D.x} y2={D.y} stroke="#ef4444" strokeWidth="2.5" />
          <circle cx={D.x} cy={D.y} r="4" fill="#ef4444" />
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10],['D',D,-4,14]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill={l==='D'?'#ef4444':'#374151'} fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={232} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">AD/DB = CA/CB = {(CA/CB).toFixed(2)}</text>
          <text x={cx} y={248} fontSize="10" fill="#9ca3af" textAnchor="middle">(কোণদ্বিখণ্ডক বিপরীত বাহুকে সংলগ্ন বাহুদ্বয়ের অনুপাতে বিভক্ত করে)</text>
        </>
      )
    },

    'triangle-area': () => {
      const A = { x: cx - baseWidth/2, y: cy + 40 }
      const B = { x: cx + baseWidth/2, y: cy + 40 }
      const C = { x: cx - 10, y: cy + 40 - heightValue }
      const foot = { x: C.x, y: A.y }
      const b_val = (baseWidth/10).toFixed(1)
      const h_val = (heightValue/10).toFixed(1)
      const area = (0.5 * (baseWidth/10) * (heightValue/10)).toFixed(2)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিভুজের ক্ষেত্রফল</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2.5" />
          <line x1={C.x} y1={C.y} x2={foot.x} y2={foot.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3" />
          <path d={`M ${foot.x} ${foot.y - 10} L ${foot.x + 10} ${foot.y - 10} L ${foot.x + 10} ${foot.y}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x={(A.x+B.x)/2} y={A.y+16} fontSize="12" fill="#8b5cf6" fontWeight="bold">ভূমি (b = {b_val} cm)</text>
          <text x={foot.x+8} y={(C.y+foot.y)/2} fontSize="12" fill="#ef4444" fontWeight="bold">h={h_val} cm</text>
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={240} fontSize="12" fill="#10b981" textAnchor="middle" fontWeight="bold">ক্ষেত্রফল = ½ × b × h = {area} ব.সেমি.</text>
        </>
      )
    },

    'parallelogram-area': () => {
      const skew = 35
      const A = { x: cx - baseWidth/2 + skew, y: cy + 40 }
      const B = { x: cx + baseWidth/2 + skew, y: cy + 40 }
      const C = { x: cx + baseWidth/2 - skew, y: cy + 40 - heightValue }
      const D = { x: cx - baseWidth/2 - skew, y: cy + 40 - heightValue }
      const foot = { x: A.x, y: D.y }
      const b_val = (baseWidth/10).toFixed(1)
      const h_val = (heightValue/10).toFixed(1)
      const area = ((baseWidth/10) * (heightValue/10)).toFixed(2)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সমান্তরিকের ক্ষেত্রফল</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`} fill="rgba(139,92,246,0.12)" stroke="#8b5cf6" strokeWidth="2.5" />
          <line x1={A.x} y1={A.y} x2={foot.x} y2={foot.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3" />
          <path d={`M ${foot.x} ${foot.y + 10} L ${foot.x + 10} ${foot.y + 10} L ${foot.x + 10} ${foot.y}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x={(A.x+B.x)/2} y={A.y+16} fontSize="12" fill="#8b5cf6" fontWeight="bold">ভূমি (b = {b_val} cm)</text>
          <text x={A.x - 24} y={(A.y+foot.y)/2} fontSize="12" fill="#ef4444" fontWeight="bold">h={h_val} cm</text>
          <text x={cx} y={240} fontSize="12" fill="#8b5cf6" textAnchor="middle" fontWeight="bold">ক্ষেত্রফল = b × h = {area} ব.সেমি.</text>
        </>
      )
    },

    'pythagorean': () => {
      const s = size / 100
      const A = { x: cx - 70*s, y: cy + 55*s }
      const B = { x: cx + 70*s, y: cy + 55*s }
      const C = { x: cx - 70*s, y: cy - 45*s }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">পিথাগোরাসের উপপাদ্য</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5" />
          <path d={`M ${A.x} ${A.y-12} L ${A.x+12} ${A.y-12} L ${A.x+12} ${A.y}`} fill="none" stroke="#374151" strokeWidth="1.5" />
          <text x={(B.x+C.x)/2+10} y={(B.y+C.y)/2+5} fontSize="13" fill="#ef4444" fontWeight="bold">c</text>
          <text x={A.x-18} y={(A.y+C.y)/2} fontSize="13" fill="#3b82f6" fontWeight="bold">a</text>
          <text x={(A.x+B.x)/2} y={A.y+16} fontSize="13" fill="#10b981" fontWeight="bold">b</text>
          {[['A',A,-14,14],['B',B,6,14],['C',C,-16,-6]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={235} fontSize="13" fill="#ef4444" textAnchor="middle" fontWeight="bold">a² + b² = c²</text>
          <text x={cx} y={250} fontSize="11" fill="#9ca3af" textAnchor="middle">(লম্ব² + ভূমি² = অতিভুজ²)</text>
        </>
      )
    },

    'pythagorean-proof': () => {
      const sc = size / 100
      const ox = 100, oy = 180, s = 70 * sc
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">পিথাগোরাস প্রমাণ (দৃশ্য)</text>
          {/* Triangle */}
          <polygon points={`${ox},${oy} ${ox+s},${oy} ${ox},${oy-50}`} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="2.5" />
          <path d={`M ${ox} ${oy-10} L ${ox+10} ${oy-10} L ${ox+10} ${oy}`} fill="none" stroke="#374151" strokeWidth="1.5" />
          {/* Square on hypotenuse */}
          <rect x={ox+s+5} y={oy-60} width={45} height={45} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="2" />
          {/* Square on base */}
          <rect x={ox} y={oy+5} width={s} height={s*0.6} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2" />
          {/* Square on height */}
          <rect x={ox-45} y={oy-50} width={45} height={50} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="2" />
          <text x={ox+s+27} y={oy-32} fontSize="12" fill="#ef4444" fontWeight="bold" textAnchor="middle">c²</text>
          <text x={ox+s*0.5} y={oy+s*0.35} fontSize="12" fill="#10b981" fontWeight="bold" textAnchor="middle">b²</text>
          <text x={ox-22} y={oy-20} fontSize="12" fill="#3b82f6" fontWeight="bold" textAnchor="middle">a²</text>
          <text x={190} y={240} fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="bold">a² + b² = c²</text>
        </>
      )
    },

    'basic': () => {
      const s = size / 100
      const A = { x: cx - 80*s, y: cy + 40*s }
      const B = { x: cx + 80*s, y: cy + 40*s }
      const C = { x: cx - 10*s, y: cy - 55*s }
      const sideAB = Math.round(Math.sqrt((B.x-A.x)**2 + (B.y-A.y)**2))
      const sideBC = Math.round(Math.sqrt((C.x-B.x)**2 + (C.y-B.y)**2))
      const sideCA = Math.round(Math.sqrt((A.x-C.x)**2 + (A.y-C.y)**2))
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিভুজ</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5" />
          {[[A,B,sideAB,'c'],[B,C,sideBC,'a'],[C,A,sideCA,'b']].map(([p1,p2,len,label],i) => {
            const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2
            const dx = p2.x-p1.x, dy = p2.y-p1.y, l = Math.sqrt(dx*dx+dy*dy)
            const nx = -dy/l*12, ny = dx/l*12
            return <text key={label} x={mx+nx} y={my+ny} fontSize="11" fill="#6366f1" fontWeight="bold" textAnchor="middle">{label}={len}</text>
          })}
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="13" fill="#374151" fontWeight="bold">{l}</text>
          )}
        </>
      )
    },

    'acute': () => {
      const s = size / 100
      const A = { x: cx - 80*s, y: cy + 40*s }, B = { x: cx + 80*s, y: cy + 40*s }, C = { x: cx + 15*s, y: cy - 60*s }
      const sideAB = Math.round(Math.sqrt((B.x-A.x)**2 + (B.y-A.y)**2))
      const sideBC = Math.round(Math.sqrt((C.x-B.x)**2 + (C.y-B.y)**2))
      const sideCA = Math.round(Math.sqrt((A.x-C.x)**2 + (A.y-C.y)**2))
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সূক্ষ্মকোণী ত্রিভুজ</text>
          <text x={cx} y={38} fontSize="10" fill="#9ca3af" textAnchor="middle">{'সব কোণ < 90°'}</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2.5" />
          <circle cx={A.x} cy={A.y} r="3" fill="#374151" />
          <circle cx={B.x} cy={B.y} r="3" fill="#374151" />
          <circle cx={C.x} cy={C.y} r="3" fill="#374151" />
          {[[A,B,sideAB,'c'],[B,C,sideBC,'a'],[C,A,sideCA,'b']].map(([p1,p2,len,label],i) => {
            const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2
            const dx = p2.x-p1.x, dy = p2.y-p1.y, l = Math.sqrt(dx*dx+dy*dy)
            const nx = -dy/l*12, ny = dx/l*12
            return <text key={label} x={mx+nx} y={my+ny} fontSize="11" fill="#10b981" fontWeight="bold" textAnchor="middle">{label}={len}</text>
          })}
          {[['A',A,-14,14],['B',B,6,14],['C',C,0,-10]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="13" fill="#374151" fontWeight="bold">{l}</text>
          )}
        </>
      )
    },

    'obtuse': () => {
      const s = size / 100
      const A = { x: cx - 90*s, y: cy + 40*s }, B = { x: cx + 80*s, y: cy + 40*s }, C = { x: cx - 60*s, y: cy - 50*s }
      const sideAB = Math.round(Math.sqrt((B.x-A.x)**2 + (B.y-A.y)**2))
      const sideBC = Math.round(Math.sqrt((C.x-B.x)**2 + (C.y-B.y)**2))
      const sideCA = Math.round(Math.sqrt((A.x-C.x)**2 + (A.y-C.y)**2))
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">স্থূলকোণী ত্রিভুজ</text>
          <text x={cx} y={38} fontSize="10" fill="#9ca3af" textAnchor="middle">{'একটি কোণ > 90°'}</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="2.5" />
          <circle cx={A.x} cy={A.y} r="3" fill="#374151" />
          <circle cx={B.x} cy={B.y} r="3" fill="#374151" />
          <circle cx={C.x} cy={C.y} r="3" fill="#374151" />
          {[[A,B,sideAB,'c'],[B,C,sideBC,'a'],[C,A,sideCA,'b']].map(([p1,p2,len,label],i) => {
            const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2
            const dx = p2.x-p1.x, dy = p2.y-p1.y, l = Math.sqrt(dx*dx+dy*dy)
            const nx = -dy/l*12, ny = dx/l*12
            return <text key={label} x={mx+nx} y={my+ny} fontSize="11" fill="#ef4444" fontWeight="bold" textAnchor="middle">{label}={len}</text>
          })}
          {[['A',A,-14,14],['B',B,6,14],['C',C,-16,-8]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="13" fill="#374151" fontWeight="bold">{l}</text>
          )}
        </>
      )
    },

    // ── Class 6 (Interactive) ────────────────────────────────
    'reflex-angle': () => {
      const ox = cx, oy = cy + 20, r = 75
      const deg = reflexAngle, rad = deg * Math.PI / 180
      const px = ox + r * Math.cos(-rad), py = oy + r * Math.sin(-rad)
      const lx = ox + (r + 20) * Math.cos(-(deg / 2) * Math.PI / 180)
      const ly = oy + (r + 20) * Math.sin(-(deg / 2) * Math.PI / 180)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">প্রবৃদ্ধ কোণ (Reflex Angle)</text>
          <text x={cx} y={37} fontSize="10" fill="#9ca3af" textAnchor="middle">{'180° < θ < 360°'}</text>
          <path d={`M ${ox+r} ${oy} A ${r} ${r} 0 1 0 ${px} ${py}`} fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="2" />
          <line x1={ox} y1={oy} x2={ox + r} y2={oy} stroke="#374151" strokeWidth="2.5" />
          <line x1={ox} y1={oy} x2={px} y2={py} stroke="#374151" strokeWidth="2.5" />
          <circle cx={ox} cy={oy} r="4" fill="#374151" />
          <text x={lx} y={ly} fontSize="13" fill="#ef4444" fontWeight="bold" textAnchor="middle">θ = {deg}°</text>
          <text x={cx} y={248} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">প্রবৃদ্ধ কোণ: 180° থেকে 360° এর মধ্যে</text>
        </>
      )
    },

    'complete-angle': () => {
      const ox = cx, oy = cy + 10, r = completeRadius
      const deg = completeAngle
      const rad = deg * Math.PI / 180
      const endX = ox + r * Math.cos(0 - rad + 0) // SVG: 0° = right, clockwise
      const endY = oy + r * Math.sin(0 - rad + 0)
      // Sweep arc: from 0° clockwise by deg degrees
      const startX = ox + r, startY = oy
      const largeArc = deg > 180 ? 1 : 0
      const arcEndX = ox + r * Math.cos(-rad), arcEndY = oy + r * Math.sin(-rad)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">পূর্ণকোণ (Complete Angle)</text>
          <text x={cx} y={37} fontSize="10" fill="#9ca3af" textAnchor="middle">θ = {deg}°</text>
          {/* Filled circle background */}
          <circle cx={ox} cy={oy} r={r} fill="rgba(99,102,241,0.06)" stroke="#e5e7eb" strokeWidth="1" />
          {/* Sweep arc (colored portion) */}
          {deg > 0 && (
            <path
              d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}${deg >= 360 ? ' Z' : ''}`}
              fill={deg >= 360 ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.12)'}
              stroke="#6366f1" strokeWidth="2.5"
            />
          )}
          {/* Reference line (0°) */}
          <line x1={ox} y1={oy} x2={ox + r} y2={oy} stroke="#374151" strokeWidth="2.5" />
          {/* Rotating arm */}
          {deg > 0 && deg < 360 && (
            <line x1={ox} y1={oy} x2={arcEndX} y2={arcEndY} stroke="#ef4444" strokeWidth="2.5" />
          )}
          {/* Degree markers */}
          {[0, 90, 180, 270].map(d => {
            if (d > deg) return null
            const rx = ox + (r + 14) * Math.cos(-d * Math.PI / 180)
            const ry = oy + (r + 14) * Math.sin(-d * Math.PI / 180)
            return <text key={d} x={rx} y={ry + 4} fontSize="10" fill="#6b7280" textAnchor="middle">{d}°</text>
          })}
          {/* Small tick marks every 45° */}
          {[45, 135, 225, 315].map(d => {
            if (d > deg) return null
            const inner = r - 5, outer = r + 5
            const ix = ox + inner * Math.cos(-d * Math.PI / 180)
            const iy = oy + inner * Math.sin(-d * Math.PI / 180)
            const oxx = ox + outer * Math.cos(-d * Math.PI / 180)
            const oyy = oy + outer * Math.sin(-d * Math.PI / 180)
            return <line key={d} x1={ix} y1={iy} x2={oxx} y2={oyy} stroke="#9ca3af" strokeWidth="1" />
          })}
          {/* Center point */}
          <circle cx={ox} cy={oy} r="4" fill="#374151" />
          {/* Angle label */}
          <text x={ox + r * 0.4 + 5} y={oy - r * 0.4 - 5} fontSize="11" fill="#6366f1" fontWeight="bold">{deg}°</text>
          {/* Status text */}
          <text x={cx} y={248} fontSize="11" fill="#6366f1" textAnchor="middle" fontWeight="bold">
            {deg >= 360 ? 'পূর্ণকোণ = এক পূর্ণ আবর্তন = 360°' : `বর্তমান কোণ: ${deg}° (পূর্ণকোণে আর ${360 - deg}° বাকি)`}
          </text>
        </>
      )
    },

    'perpendicular-lines': () => {
      const ox = cx, oy = cy + 10, len = lineLength
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">লম্ব রেখা (Perpendicular Lines)</text>
          <line x1={ox - len} y1={oy} x2={ox + len} y2={oy} stroke="#3b82f6" strokeWidth="2.5" />
          <line x1={ox} y1={oy - len} x2={ox} y2={oy + len} stroke="#ef4444" strokeWidth="2.5" />
          <path d={`M ${ox + 14} ${oy} L ${ox + 14} ${oy - 14} L ${ox} ${oy - 14}`} fill="none" stroke="#374151" strokeWidth="2" />
          <polygon points={`${ox+len},${oy} ${ox+len-8},${oy-5} ${ox+len-8},${oy+5}`} fill="#3b82f6" />
          <polygon points={`${ox-len},${oy} ${ox-len+8},${oy-5} ${ox-len+8},${oy+5}`} fill="#3b82f6" />
          <polygon points={`${ox},${oy-len} ${ox-5},${oy-len+8} ${ox+5},${oy-len+8}`} fill="#ef4444" />
          <polygon points={`${ox},${oy+len} ${ox-5},${oy+len-8} ${ox+5},${oy+len-8}`} fill="#ef4444" />
          <circle cx={ox} cy={oy} r="4" fill="#374151" />
          <text x={cx} y={248} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">দুটি সরলরেখা পরস্পর লম্ব → ছেদকোণ = 90°</text>
        </>
      )
    },

    'parallel-lines-basic': () => {
      const gap = lineLength
      const y1 = cy - gap / 2, y2 = cy + gap / 2
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সমান্তরাল রেখা (Parallel Lines)</text>
          <line x1={40} y1={y1} x2={260} y2={y1} stroke="#3b82f6" strokeWidth="2.5" />
          <line x1={40} y1={y2} x2={260} y2={y2} stroke="#10b981" strokeWidth="2.5" />
          <polygon points={`260,${y1} 252,${y1-5} 252,${y1+5}`} fill="#3b82f6" />
          <polygon points={`260,${y2} 252,${y2-5} 252,${y2+5}`} fill="#10b981" />
          <polygon points={`40,${y1} 48,${y1-5} 48,${y1+5}`} fill="#3b82f6" />
          <polygon points={`40,${y2} 48,${y2-5} 48,${y2+5}`} fill="#10b981" />
          <text x={28} y={y1 + 5} fontSize="11" fill="#3b82f6" fontWeight="bold">m</text>
          <text x={28} y={y2 + 5} fontSize="11" fill="#10b981" fontWeight="bold">n</text>
          <text x={110} y={y1 - 10} fontSize="10" fill="#9ca3af">▶▶</text>
          <text x={110} y={y2 - 10} fontSize="10" fill="#9ca3af">▶▶</text>
          {/* Distance marker */}
          <line x1={265} y1={y1} x2={265} y2={y2} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={275} y={(y1 + y2) / 2 + 4} fontSize="10" fill="#ef4444" fontWeight="bold">d</text>
          <text x={cx} y={230} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">m ∥ n</text>
          <text x={cx} y={245} fontSize="11" fill="#9ca3af" textAnchor="middle">দুটি সমান্তরাল রেখা কখনো ছেদ করে না</text>
        </>
      )
    },

    // ── Class 7 ─────────────────────────────────────────────
    'angle-sum-triangle': () => {
      // Calculate C from angleA and angleB: angleC = 180 - angleA - angleB
      const aA = Math.max(5, Math.min(angleA, 170))
      const aB = Math.max(5, Math.min(angleB, 175 - aA))
      const aC = 180 - aA - aB
      // Place triangle: A at bottom-left, B at bottom-right, C computed
      const ax = cx - 85, ay = cy + 50
      const bx = cx + 85, by = cy + 50
      const sideAB = bx - ax
      // Height from AB using law of sines: h/sin(aA) = sideAB/sin(aC) * sin(aB)
      const h = (sideAB / Math.sin(aC * Math.PI / 180)) * Math.sin(aB * Math.PI / 180)
      // Horizontal offset of C from A
      const offset = h / Math.tan(aA * Math.PI / 180)
      const Cx = ax + offset, Cy = ay - h
      const A = { x: ax, y: ay }, B = { x: bx, y: by }, C = { x: Cx, y: Cy }
      const arcR = 20
      // Angle arc at A
      const dirAC_A = Math.atan2(C.y - A.y, C.x - A.x)
      const arcA_endX = A.x + arcR * Math.cos(dirAC_A)
      const arcA_endY = A.y + arcR * Math.sin(dirAC_A)
      // Angle arc at B
      const dirBC_B = Math.atan2(C.y - B.y, C.x - B.x)
      const arcB_endX = B.x + arcR * Math.cos(dirBC_B)
      const arcB_endY = B.y + arcR * Math.sin(dirBC_B)
      // Angle arc at C
      const dirCA_C = Math.atan2(A.y - C.y, A.x - C.x)
      const dirCB_C = Math.atan2(B.y - C.y, B.x - C.x)
      const arcC_sX = C.x + arcR * Math.cos(dirCA_C)
      const arcC_sY = C.y + arcR * Math.sin(dirCA_C)
      const arcC_eX = C.x + arcR * Math.cos(dirCB_C)
      const arcC_eY = C.y + arcR * Math.sin(dirCB_C)
      const cLargeArc = aC > 180 ? 1 : 0
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিভুজের কোণের সমষ্টি = 180°</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          {/* Angle arc at A */}
          <path d={`M ${A.x + arcR} ${A.y} A ${arcR} ${arcR} 0 0 0 ${arcA_endX} ${arcA_endY}`}
            fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
          {/* Angle arc at B */}
          <path d={`M ${B.x - arcR} ${B.y} A ${arcR} ${arcR} 0 0 1 ${arcB_endX} ${arcB_endY}`}
            fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
          {/* Angle arc at C */}
          <path d={`M ${arcC_sX} ${arcC_sY} A ${arcR} ${arcR} 0 ${cLargeArc} 1 ${arcC_eX} ${arcC_eY}`}
            fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.5" />
          {/* Vertex dots */}
          <circle cx={A.x} cy={A.y} r="3" fill="#374151" />
          <circle cx={B.x} cy={B.y} r="3" fill="#374151" />
          <circle cx={C.x} cy={C.y} r="3" fill="#374151" />
          {/* Labels */}
          <text x={A.x - 14} y={A.y + 16} fontSize="13" fill="#374151" fontWeight="bold">A</text>
          <text x={B.x + 6} y={B.y + 16} fontSize="13" fill="#374151" fontWeight="bold">B</text>
          <text x={C.x - 4} y={C.y - 10} fontSize="13" fill="#374151" fontWeight="bold">C</text>
          {/* Angle values */}
          <text x={A.x + 28} y={A.y - 8} fontSize="11" fill="#ef4444" fontWeight="bold">∠A={aA}°</text>
          <text x={B.x - 56} y={B.y - 8} fontSize="11" fill="#3b82f6" fontWeight="bold">∠B={aB}°</text>
          <text x={C.x + 12} y={C.y + 20} fontSize="11" fill="#10b981" fontWeight="bold">∠C={aC}°</text>
          {/* Sum */}
          <text x={cx} y={240} fontSize="12" fill="#6366f1" textAnchor="middle" fontWeight="bold">
            {aA}° + {aB}° + {aC}° = 180°
          </text>
        </>
      )
    },

    'isosceles-theorem': () => {
      const s = size / 100
      const A = { x: cx - 75*s, y: cy + 45*s }, B = { x: cx + 75*s, y: cy + 45*s }, C = { x: cx, y: cy - 60*s }
      const tick = (p1, p2) => {
        const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2
        const dx = p2.x-p1.x, dy = p2.y-p1.y, len = Math.sqrt(dx*dx+dy*dy)
        const nx = -dy/len*7, ny = dx/len*7
        return <line x1={mx+nx} y1={my+ny} x2={mx-nx} y2={my-ny} stroke="#ef4444" strokeWidth="2.5" />
      }
      const sideAC = Math.round(Math.sqrt((C.x-A.x)**2 + (C.y-A.y)**2))
      const sideBC = Math.round(Math.sqrt((C.x-B.x)**2 + (C.y-B.y)**2))
      const arcR = 20 * s
      const dirAC_A = Math.atan2(C.y - A.y, C.x - A.x)
      const dirAB_A = 0
      const dirBC_B = Math.atan2(C.y - B.y, C.x - B.x)
      const dirAB_B = Math.PI
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সমদ্বিবাহু ত্রিভুজের ধর্ম</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2.5" />
          {tick(A, C)}{tick(B, C)}
          {/* Angle arc at A */}
          <path d={`M ${A.x + arcR} ${A.y} A ${arcR} ${arcR} 0 0 0 ${A.x + arcR * Math.cos(dirAC_A)} ${A.y + arcR * Math.sin(dirAC_A)}`}
            fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
          {/* Angle arc at B */}
          <path d={`M ${B.x - arcR} ${B.y} A ${arcR} ${arcR} 0 0 1 ${B.x + arcR * Math.cos(dirBC_B)} ${B.y + arcR * Math.sin(dirBC_B)}`}
            fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
          {[['A',A,-14,14],['B',B,6,14],['C',C,-4,-10]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="13" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={230} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">AC({sideAC}) = BC({sideBC}) ⟹ ∠A = ∠B</text>
          <text x={cx} y={245} fontSize="11" fill="#9ca3af" textAnchor="middle">সমান বাহুর বিপরীত কোণ সমান</text>
        </>
      )
    },

    // ── Class 9 ─────────────────────────────────────────────
    'centroid': () => {
      const A = { x: cx - 90, y: cy + 55 }, B = { x: cx + 90, y: cy + 55 }, C = { x: cx + vertexCx, y: cy - 65 }
      const mA = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }  // midpoint opposite A
      const mB = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 }  // midpoint opposite B
      const mC = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }  // midpoint opposite C
      const G  = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 } // centroid

      const lenAG = Math.sqrt((A.x - G.x)**2 + (A.y - G.y)**2)
      const lenGMa = Math.sqrt((G.x - mA.x)**2 + (G.y - mA.y)**2)

      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">মধ্যমা ও ভরকেন্দ্র</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          {[[A,mA,'#ef4444'],[B,mB,'#3b82f6'],[C,mC,'#10b981']].map(([v,m,col],i) =>
            <line key={i} x1={v.x} y1={v.y} x2={m.x} y2={m.y} stroke={col} strokeWidth="2" strokeDasharray="5,3" />
          )}
          <circle cx={G.x} cy={G.y} r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          {[['A',A,-14,14],['B',B,6,14],['C',C,-6,-10],['G',G,8,-4]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize={l==='G'?'13':'12'} fill={l==='G'?'#f59e0b':'#374151'} fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={232} fontSize="11" fill="#f59e0b" textAnchor="middle" fontWeight="bold">G = ভরকেন্দ্র (মধ্যমার ২:১ অনুপাতে)</text>
          <text x={cx} y={248} fontSize="11" fill="#9ca3af" textAnchor="middle">AG : GD = {(lenAG/lenGMa).toFixed(2)} : 1.00 (সর্বদা ২:১)</text>
        </>
      )
    },

    'equal-area-parallelogram': () => {
      const s = skewShift, y1 = cy - 25, y2 = cy + 55
      const base = 130
      const p1 = [{x:cx-base/2,y:y2},{x:cx+base/2,y:y2},{x:cx+base/2-s,y:y1},{x:cx-base/2-s,y:y1}]
      const p2 = [{x:cx-base/2,y:y2},{x:cx+base/2,y:y2},{x:cx+base/2+s,y:y1},{x:cx-base/2+s,y:y1}]
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">একই ভূমি, সমান্তরাল — সমক্ষেত্র</text>
          <line x1={30} y1={y1} x2={270} y2={y1} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1={30} y1={y2} x2={270} y2={y2} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,4" />
          <polygon points={p1.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points={p2.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="2.5" />
          <text x={cx - 32} y={(y1+y2)/2 + 4} fontSize="11" fill="#ef4444" fontWeight="bold">ABCD</text>
          <text x={cx + 22} y={(y1+y2)/2 + 4} fontSize="11" fill="#3b82f6" fontWeight="bold">EFCD</text>
          <text x={cx} y={248} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">ABCD = EFCD (একই ভূমি CD, সমান্তরাল রেখার মধ্যে)</text>
        </>
      )
    },

    'equal-area-triangle': () => {
      const y1 = cy - 35, y2 = cy + 50, base = 140
      const A = {x: cx - base/2, y: y2}, B = {x: cx + base/2, y: y2}
      const C1 = {x: cx - 30, y: y1}
      const C2 = {x: cx + vertexDx, y: y1}
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">একই ভূমি — ত্রিভুজের সমক্ষেত্র</text>
          <line x1={30} y1={y1} x2={270} y2={y1} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1={30} y1={y2} x2={270} y2={y2} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,4" />
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C1.x},${C1.y}`} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C2.x},${C2.y}`} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx={C1.x} cy={C1.y} r="4" fill="#ef4444" />
          <circle cx={C2.x} cy={C2.y} r="4" fill="#3b82f6" />
          <text x={C1.x - 14} y={C1.y - 8} fontSize="11" fill="#ef4444" fontWeight="bold">C</text>
          <text x={C2.x + 5} y={C2.y - 8} fontSize="11" fill="#3b82f6" fontWeight="bold">D</text>
          <text x={A.x - 14} y={A.y + 14} fontSize="11" fill="#374151" fontWeight="bold">A</text>
          <text x={B.x + 5} y={B.y + 14} fontSize="11" fill="#374151" fontWeight="bold">B</text>
          <text x={cx} y={248} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">△CAB = △DAB (একই ভূমি AB, সমান্তরাল রেখার মধ্যে)</text>
        </>
      )
    },

    'line-symmetry': () => {
      const s = size / 100
      // Half-shape definitions in (perpendicular-to-axis, parallel-to-axis)
      // coordinate space. The shape sits "to the right" of the axis (positive
      // perpendicular). Reflecting flips the perpendicular sign.
      const halfShapes = {
        arrow: [
          [20, -30], [70, 0], [20, 30],
          [20, 15], [50, 15], [50, -15], [20, -15],
        ],
        triangle: [
          [10, -45], [60, 45], [10, 45],
        ],
        butterfly: [
          [5, 0], [55, -35], [40, -10], [55, 10], [40, 35],
        ],
      }
      const half = halfShapes[symShape] || halfShapes.arrow

      // Build polygon points for one side of the symmetry axis.
      // sign = +1 for the "original" side, -1 for the mirror.
      const buildPoly = (sign) =>
        half.map(([perp, par]) => {
          if (symAxis === 'vertical') {
            // axis = vertical line at x=cx, perp goes along x, par along y
            return `${cx + sign * perp * s},${cy + par * s}`
          }
          // horizontal axis at y=cy, perp goes along y, par along x
          return `${cx + par * s},${cy + sign * perp * s}`
        }).join(' ')

      const axisLine = symAxis === 'vertical'
        ? { x1: cx, y1: 35, x2: cx, y2: 235, labelX: cx + 6, labelY: 50 }
        : { x1: 25, y1: cy, x2: 275, y2: cy, labelX: 32, labelY: cy - 6 }

      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">রেখা প্রতিসাম্য (Line Symmetry)</text>
          {/* Symmetry axis */}
          <line x1={axisLine.x1} y1={axisLine.y1} x2={axisLine.x2} y2={axisLine.y2}
            stroke="#ef4444" strokeWidth="2" strokeDasharray="7,4" />
          <text x={axisLine.labelX} y={axisLine.labelY} fontSize="10" fill="#ef4444" fontWeight="bold">প্রতিসাম্য রেখা</text>
          {/* Original shape */}
          <polygon points={buildPoly(1)}
            fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="2" />
          {/* Mirror shape — reflected across the axis */}
          <polygon points={buildPoly(-1)}
            fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" />
          <text x={cx} y={250} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">প্রতিসাম্য রেখার দুপাশ পরস্পরের প্রতিবিম্ব</text>
        </>
      )
    },
  }

  const render = diagrams[type] || diagrams['basic']

  // Determine which interactive controls to show based on type
  const getClass6Controls = () => {
    switch (type) {
      case 'reflex-angle':
        return (
          <div className="mt-3 px-4 space-y-2">
            <label className="block text-xs font-semibold text-gray-600">কোণের মান: {reflexAngle}°</label>
            <input type="range" min="185" max="355" value={reflexAngle} onChange={e => setReflexAngle(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>185°</span>
              <span className="font-bold text-red-600">{reflexAngle}°</span>
              <span>355°</span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
              <p className="text-sm text-red-800">
                <strong>প্রবৃদ্ধ কোণ:</strong> 180° থেকে 360° এর মধ্যে থাকে। অভ্যন্তরীণ কোণ = {360 - reflexAngle}°
              </p>
            </div>
          </div>
        )

      case 'perpendicular-lines':
        return (
          <div className="mt-3 px-4 space-y-2">
            <label className="block text-xs font-semibold text-gray-600">রেখার দৈর্ঘ্য: {lineLength}</label>
            <input type="range" min="40" max="110" value={lineLength} onChange={e => setLineLength(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>40</span>
              <span className="font-bold text-blue-600">{lineLength} একক</span>
              <span>110</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
              <p className="text-sm text-blue-800">
                <strong>লম্ব রেখা:</strong> দুটি রেখা পরস্পর 90° কোণে ছেদ করলে তাদের লম্ব বলা হয়। ছেদবিন্দুতে সব কোণ = 90°
              </p>
            </div>
          </div>
        )

      case 'parallel-lines-basic':
        return (
          <div className="mt-3 px-4 space-y-2">
            <label className="block text-xs font-semibold text-gray-600">রেখাদ্বয়ের দূরত্ব: {lineLength}</label>
            <input type="range" min="20" max="100" value={lineLength} onChange={e => setLineLength(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20</span>
              <span className="font-bold text-green-600">{lineLength} একক</span>
              <span>100</span>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
              <p className="text-sm text-green-800">
                <strong>সমান্তরাল রেখা:</strong> দুটি রেখা সমান্তরাল হলে তাদের মধ্যবর্তী দূরত্ব সর্বদা সমান থাকে।
              </p>
            </div>
          </div>
        )

      case 'complete-angle':
        return (
          <div className="mt-3 px-4 space-y-2">
            <label className="block text-xs font-semibold text-gray-600">কোণের মান: {completeAngle}°</label>
            <input type="range" min="0" max="360" value={completeAngle} onChange={e => setCompleteAngle(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span className="font-bold text-indigo-600">{completeAngle}°</span>
              <span>360°</span>
            </div>
            <label className="block text-xs font-semibold text-gray-600">ব্যাসার্ধ: {completeRadius}</label>
            <input type="range" min="30" max="90" value={completeRadius} onChange={e => setCompleteRadius(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>30</span>
              <span className="font-bold text-purple-600">{completeRadius}</span>
              <span>90</span>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg mt-2">
              <p className="text-sm text-indigo-800">
                <strong>পূর্ণকোণ:</strong> একটি রেখা তার আরম্ভবিন্দুতে ফিরে এলে একটি পূর্ণকোণ (360°) গঠিত হয়। এটি এক পূর্ণ আবর্তন।
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isClass6Type = ['reflex-angle', 'complete-angle', 'perpendicular-lines', 'parallel-lines-basic'].includes(type)

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 260" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {render()}
      </svg>
      {editable && isClass6Type && getClass6Controls()}
      {editable && !isClass6Type && type === 'angle-sum-triangle' && (
        <div className="mt-3 px-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-600">∠A: {Math.max(5, Math.min(angleA, 170))}°</label>
          <input type="range" min="10" max="160" value={angleA} onChange={e => setAngleA(+e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
          <label className="block text-xs font-semibold text-gray-600 mt-2">∠B: {Math.max(5, Math.min(angleB, 175 - Math.max(5, Math.min(angleA, 170))))}°</label>
          <input type="range" min="10" max={175 - angleA} value={Math.min(angleB, 175 - angleA)} onChange={e => setAngleB(+e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
            <p className="text-sm text-green-800">
              <strong>∠C = {180 - Math.max(5, Math.min(angleA, 170)) - Math.max(5, Math.min(Math.min(angleB, 175 - angleA), 175 - Math.max(5, Math.min(angleA, 170))))}°</strong> → কোণ তিনটির সমষ্টি = 180°
            </p>
          </div>
        </div>
      )}
      {editable && !isClass6Type && type !== 'angle-sum-triangle' && type !== 'line-symmetry' && (
        <div className="mt-3 px-4 space-y-2">
          {type === 'exterior-angle' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">∠A: {extAngleA}°</label>
              <input type="range" min="15" max="80" value={extAngleA} onChange={e => {
                const val = +e.target.value
                setExtAngleA(val)
                if (val + extAngleC > 160) setExtAngleC(160 - val)
              }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />

              <label className="block text-xs font-semibold text-gray-600 mt-2">∠C: {extAngleC}°</label>
              <input type="range" min="15" max="80" value={extAngleC} onChange={e => {
                const val = +e.target.value
                setExtAngleC(val)
                if (extAngleA + val > 160) setExtAngleA(160 - val)
              }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" />
            </>
          )}

          {type === 'midpoint' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">ত্রিভুজের ভূমির দৈর্ঘ্য (AB): {baseWidth}</label>
              <input type="range" min="80" max="180" value={baseWidth} onChange={e => setBaseWidth(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}

          {type === 'triangle-inequality' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">ভূমি (c): {baseWidth}</label>
              <input type="range" min="80" max="180" value={baseWidth} onChange={e => setBaseWidth(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}

          {type === 'thales' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">সমান্তরাল রেখার অবস্থান (অনুপাত): {ratioT}</label>
              <input type="range" min="0.2" max="0.8" step="0.05" value={ratioT} onChange={e => setRatioT(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </>
          )}

          {type === 'angle-bisector' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">শীর্ষবিন্দু C-এর অবস্থান: {vertexCx}</label>
              <input type="range" min="-60" max="60" value={vertexCx} onChange={e => setVertexCx(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}

          {(type === 'triangle-area' || type === 'parallelogram-area') && (
            <>
              <label className="block text-xs font-semibold text-gray-600">ভূমি (b): {baseWidth}</label>
              <input type="range" min="80" max="180" value={baseWidth} onChange={e => setBaseWidth(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

              <label className="block text-xs font-semibold text-gray-600 mt-2">উচ্চতা (h): {heightValue}</label>
              <input type="range" min="40" max="110" value={heightValue} onChange={e => setHeightValue(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
            </>
          )}

          {type === 'equal-area-parallelogram' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">সমান্তরিকের বাঁক (Skew Shift): {skewShift}</label>
              <input type="range" min="10" max="60" value={skewShift} onChange={e => setSkewShift(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}

          {type === 'equal-area-triangle' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">শীর্ষবিন্দু D-এর অবস্থান: {vertexDx}</label>
              <input type="range" min="-70" max="70" value={vertexDx} onChange={e => setVertexDx(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}

          {type === 'centroid' && (
            <>
              <label className="block text-xs font-semibold text-gray-600">শীর্ষবিন্দু C-এর অবস্থান: {vertexCx}</label>
              <input type="range" min="-60" max="60" value={vertexCx} onChange={e => setVertexCx(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}

          {!['exterior-angle', 'midpoint', 'triangle-inequality', 'thales', 'angle-bisector', 'triangle-area', 'parallelogram-area', 'equal-area-parallelogram', 'equal-area-triangle', 'centroid'].includes(type) && (
            <>
              <label className="block text-xs font-semibold text-gray-600">আকার: {size}%</label>
              <input type="range" min="70" max="130" value={size} onChange={e => setSize(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </>
          )}
        </div>
      )}
      {editable && type === 'line-symmetry' && (
        <div className="mt-3 px-4 space-y-3">
          {/* Axis orientation */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">প্রতিসাম্য রেখার দিক:</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSymAxis('vertical')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${symAxis === 'vertical' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                উল্লম্ব (Vertical)
              </button>
              <button type="button" onClick={() => setSymAxis('horizontal')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${symAxis === 'horizontal' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                আনুভূমিক (Horizontal)
              </button>
            </div>
          </div>

          {/* Shape variant */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">আকৃতি:</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setSymShape('arrow')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${symShape === 'arrow' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                তীর
              </button>
              <button type="button" onClick={() => setSymShape('triangle')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${symShape === 'triangle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                ত্রিভুজ
              </button>
              <button type="button" onClick={() => setSymShape('butterfly')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${symShape === 'butterfly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                প্রজাপতি
              </button>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-semibold text-gray-600">আকার: {size}%</label>
            <input type="range" min="70" max="130" value={size} onChange={e => setSize(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-xs text-indigo-800">
              <strong>রেখা প্রতিসাম্য:</strong> প্রতিসাম্য রেখার দুই পাশের অংশ একে অপরের আয়না প্রতিবিম্ব। দিক ও আকৃতি বদলে দেখুন।
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
