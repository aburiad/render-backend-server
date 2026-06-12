/**
 * CircleTheorem.jsx
 * Circle theorems for classes 8-9
 * type: 'chord-perp' | 'equal-chords' | 'central-inscribed' | 'semicircle-right' |
 *       'same-segment' | 'cyclic-quad' | 'tangent-radius' | 'two-tangents' |
 *       'circumcircle' | 'incircle' | 'excircle' | 'alternate-segment'
 */
import { useState } from 'react'

export default function CircleTheorem({ type = 'chord-perp', editable = false }) {
  const [r, setR] = useState(70)
  const [angleP, setAngleP] = useState(280)
  const [angleSemiP, setAngleSemiP] = useState(-65)
  const [angleSameP, setAngleSameP] = useState(240)
  const [angleSameQ, setAngleSameQ] = useState(300)
  const cx = 150, cy = 145

  const toRad = d => d * Math.PI / 180
  const pt = (angle, radius = r) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle))
  })

  const diagrams = {
    'chord-perp': () => {
      const A = pt(-50), B = pt(50)
      const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">জ্যার উপর লম্ব</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="4" fill="#dc2626" />
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#f59e0b" strokeWidth="2.5" />
          <line x1={cx} y1={cy} x2={M.x} y2={M.y} stroke="#ef4444" strokeWidth="2" />
          <circle cx={A.x} cy={A.y} r="4" fill="#f59e0b" />
          <circle cx={B.x} cy={B.y} r="4" fill="#f59e0b" />
          <circle cx={M.x} cy={M.y} r="4" fill="#ef4444" />
          <text x={A.x - 14} y={A.y + 5} fontSize="11" fill="#f59e0b" fontWeight="bold">A</text>
          <text x={B.x + 5} y={B.y + 5} fontSize="11" fill="#f59e0b" fontWeight="bold">B</text>
          <text x={M.x + 6} y={M.y - 8} fontSize="11" fill="#ef4444" fontWeight="bold">M</text>
          <text x={cx + 6} y={cy - 8} fontSize="11" fill="#dc2626" fontWeight="bold">O</text>
          <text x={cx} y={235} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">OM ⊥ AB এবং AM = MB</text>
        </>
      )
    },

    'equal-chords': () => {
      const A = pt(-70), B = pt(-20)
      const C = pt(100), D = pt(160)
      const M1 = { x: (A.x+B.x)/2, y: (A.y+B.y)/2 }
      const M2 = { x: (C.x+D.x)/2, y: (C.y+D.y)/2 }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">সমান জ্যা সমান দূরত্ব</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="4" fill="#dc2626" />
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2.5" />
          <line x1={C.x} y1={C.y} x2={D.x} y2={D.y} stroke="#10b981" strokeWidth="2.5" />
          <line x1={cx} y1={cy} x2={M1.x} y2={M1.y} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={cx} y1={cy} x2={M2.x} y2={M2.y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={cx + 5} y={cy - 8} fontSize="11" fill="#dc2626" fontWeight="bold">O</text>
          <text x={cx} y={235} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">AB = CD ⟹ OM₁ = OM₂</text>
        </>
      )
    },

    'central-inscribed': () => {
      const A = pt(200), B = pt(340)
      const P = pt(angleP), O = { x: cx, y: cy }
      // Live angles: ∠AOB (central) and ∠APB (inscribed). Theorem: central = 2 × inscribed.
      const angAt = (V, P1, P2) => {
        const v1x = P1.x - V.x, v1y = P1.y - V.y
        const v2x = P2.x - V.x, v2y = P2.y - V.y
        const m1 = Math.sqrt(v1x * v1x + v1y * v1y)
        const m2 = Math.sqrt(v2x * v2x + v2y * v2y)
        if (m1 * m2 < 0.001) return 0
        return Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)))) * 180 / Math.PI
      }
      const angAOB = angAt(O, A, B).toFixed(1)
      const angAPB = angAt(P, A, B).toFixed(1)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">কেন্দ্রীয় ও বৃত্তস্থ কোণ</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke="#ef4444" strokeWidth="2" />
          <line x1={O.x} y1={O.y} x2={B.x} y2={B.y} stroke="#ef4444" strokeWidth="2" />
          <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke="#3b82f6" strokeWidth="2" />
          <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2" />
          {[['O',O,6,-8],['A',A,-14,5],['B',B,6,5],['P',P,-4,-10]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill={l==='O'?'#dc2626':l==='P'?'#3b82f6':'#374151'} fontWeight="bold">{l}</text>
          )}
          <circle cx={O.x} cy={O.y} r="4" fill="#dc2626" />
          <circle cx={P.x} cy={P.y} r="4" fill="#3b82f6" />
          <text x={cx} y={232} fontSize="11" textAnchor="middle" fontWeight="bold">
            <tspan fill="#ef4444">∠AOB = {angAOB}°</tspan>
            <tspan fill="#374151"> = 2 × </tspan>
            <tspan fill="#3b82f6">∠APB ({angAPB}°)</tspan>
          </text>
          <text x={cx} y={247} fontSize="10" fill="#6b7280" textAnchor="middle">কেন্দ্রীয় কোণ = 2 × বৃত্তস্থ কোণ (একই চাপের উপর)</text>
        </>
      )
    },

    'semicircle-right': () => {
      const A = { x: cx - r, y: cy }, B = { x: cx + r, y: cy }
      const P = pt(angleSemiP)

      // Calculate right angle marker dynamically at P
      const lenPA = Math.sqrt((A.x - P.x)**2 + (A.y - P.y)**2)
      const lenPB = Math.sqrt((B.x - P.x)**2 + (B.y - P.y)**2)
      const ux = (A.x - P.x) / (lenPA || 1)
      const uy = (A.y - P.y) / (lenPA || 1)
      const vx = (B.x - P.x) / (lenPB || 1)
      const vy = (B.y - P.y) / (lenPB || 1)
      const d = 10
      const p1 = { x: P.x + d * ux, y: P.y + d * uy }
      const p2 = { x: P.x + d * ux + d * vx, y: P.y + d * uy + d * vy }
      const p3 = { x: P.x + d * vx, y: P.y + d * vy }

      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">অর্ধবৃত্তে কোণ = 90°</text>
          <path d={`M ${A.x} ${A.y} A ${r} ${r} 0 0 0 ${B.x} ${B.y}`} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#374151" strokeWidth="2.5" />
          <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke="#3b82f6" strokeWidth="2" />
          <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2" />
          {[['A',A,-14,14],['B',B,6,14],['P',P,0,-10],['O',{x:cx,y:cy},4,14]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <circle cx={cx} cy={cy} r="4" fill="#dc2626" />
          <circle cx={P.x} cy={P.y} r="4" fill="#3b82f6" />
          {/* dynamic right angle at P */}
          <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`} fill="none" stroke="#374151" strokeWidth="1.5" />
          <text x={cx} y={235} fontSize="11" fill="#3b82f6" textAnchor="middle" fontWeight="bold">∠APB = 90° (অর্ধবৃত্তস্থ কোণ সমকোণ)</text>
        </>
      )
    },

    'same-segment': () => {
      const A = pt(200), B = pt(340), P = pt(angleSameP), Q = pt(angleSameQ)
      // Live angle calculator
      const angAt = (V, P1, P2) => {
        const v1x = P1.x - V.x, v1y = P1.y - V.y
        const v2x = P2.x - V.x, v2y = P2.y - V.y
        const m1 = Math.sqrt(v1x * v1x + v1y * v1y)
        const m2 = Math.sqrt(v2x * v2x + v2y * v2y)
        if (m1 * m2 < 0.001) return 0
        return Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)))) * 180 / Math.PI
      }
      const angP_val = angAt(P, A, B).toFixed(1)
      const angQ_val = angAt(Q, A, B).toFixed(1)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">একই চাপে কোণ সমান</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke="#3b82f6" strokeWidth="2" />
          <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2" />
          <line x1={Q.x} y1={Q.y} x2={A.x} y2={A.y} stroke="#10b981" strokeWidth="2" />
          <line x1={Q.x} y1={Q.y} x2={B.x} y2={B.y} stroke="#10b981" strokeWidth="2" />
          {[['A',A,-14,5],['B',B,6,5],['P',P,-4,-10],['Q',Q,6,-6]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill={l==='P'?'#3b82f6':l==='Q'?'#10b981':'#374151'} fontWeight="bold">{l}</text>
          )}
          <circle cx={P.x} cy={P.y} r="4" fill="#3b82f6" />
          <circle cx={Q.x} cy={Q.y} r="4" fill="#10b981" />
          <text x={cx} y={232} fontSize="11" textAnchor="middle" fontWeight="bold">
            <tspan fill="#3b82f6">∠APB = {angP_val}°</tspan>
            <tspan fill="#374151"> = </tspan>
            <tspan fill="#10b981">∠AQB = {angQ_val}°</tspan>
          </text>
          <text x={cx} y={247} fontSize="10" fill="#6b7280" textAnchor="middle">একই চাপ AB-এর উপর দণ্ডায়মান কোণ সমান</text>
        </>
      )
    },

    'cyclic-quad': () => {
      const A = pt(200), B = pt(310), C = pt(20), D = pt(110)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">বৃত্তীয় চতুর্ভুজ</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="2" />
          {[['A',A,-4,14],['B',B,6,5],['C',C,6,-8],['D',D,-14,-6]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          {[A,B,C,D].map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ef4444" />)}
          <text x={cx} y={235} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">∠A + ∠C = 180°, ∠B + ∠D = 180°</text>
        </>
      )
    },

    'tangent-radius': () => {
      const T = { x: cx + r, y: cy }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">স্পর্শক ⊥ ব্যাসার্ধ</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={T.x} y1={T.y - 65} x2={T.x} y2={T.y + 65} stroke="#ec4899" strokeWidth="3" />
          <line x1={cx} y1={cy} x2={T.x} y2={T.y} stroke="#3b82f6" strokeWidth="2.5" />
          <path d={`M ${T.x - 12} ${T.y} L ${T.x - 12} ${T.y - 12} L ${T.x} ${T.y - 12}`} fill="none" stroke="#374151" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="4" fill="#dc2626" />
          <circle cx={T.x} cy={T.y} r="4" fill="#ec4899" />
          <text x={cx+4} y={cy-8} fontSize="11" fill="#dc2626" fontWeight="bold">O</text>
          <text x={T.x+8} y={T.y+5} fontSize="11" fill="#ec4899" fontWeight="bold">T</text>
          <text x={T.x+12} y={T.y-70} fontSize="11" fill="#ec4899" fontWeight="bold">স্পর্শক</text>
          <text x={cx} y={235} fontSize="11" fill="#ec4899" textAnchor="middle" fontWeight="bold">OT ⊥ স্পর্শক (∠OTA = 90°)</text>
        </>
      )
    },

    'tangent-secant': () => {
      // Power-of-a-point theorem: PT² = PA · PB
      // External point P on the right; tangent touches at T (upper);
      // secant from P passes through circle at A (near) and B (far).
      const dist = r + 50
      const P = { x: cx + dist, y: cy }
      // Tangent point T derived from circle equation: cos(α)·dist = r
      const Tx = cx + (r * r) / dist
      const Ty = cy - (r * Math.sqrt(dist * dist - r * r)) / dist
      const T = { x: Tx, y: Ty }
      // Secant at β=15° below horizontal from P, going left into circle
      const beta = 15 * Math.PI / 180
      const cosB = Math.cos(beta), sinB = Math.sin(beta)
      const sqrtPart = Math.sqrt(Math.max(0, r * r - dist * dist * sinB * sinB))
      const tNear = dist * cosB - sqrtPart
      const tFar  = dist * cosB + sqrtPart
      const A = { x: P.x - tNear * cosB, y: P.y + tNear * sinB }
      const B = { x: P.x - tFar  * cosB, y: P.y + tFar  * sinB }
      const ptLen = Math.sqrt(dist * dist - r * r)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">স্পর্শক ও ছেদক</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          {/* Secant from P through A to B (extends past A all the way to B) */}
          <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2" />
          {/* Tangent from P to T */}
          <line x1={P.x} y1={P.y} x2={T.x} y2={T.y} stroke="#ec4899" strokeWidth="2.5" />
          {/* Center O */}
          <circle cx={cx} cy={cy} r="3" fill="#dc2626" />
          {/* Points */}
          <circle cx={P.x} cy={P.y} r="4" fill="#8b5cf6" />
          <circle cx={T.x} cy={T.y} r="4" fill="#ec4899" />
          <circle cx={A.x} cy={A.y} r="4" fill="#3b82f6" />
          <circle cx={B.x} cy={B.y} r="4" fill="#3b82f6" />
          {/* Labels */}
          <text x={P.x + 6} y={P.y + 5}   fontSize="11" fill="#8b5cf6" fontWeight="bold">P</text>
          <text x={T.x + 4} y={T.y - 8}   fontSize="11" fill="#ec4899" fontWeight="bold">T</text>
          <text x={A.x + 4} y={A.y + 14}  fontSize="11" fill="#3b82f6" fontWeight="bold">A</text>
          <text x={B.x - 14} y={B.y + 4}  fontSize="11" fill="#3b82f6" fontWeight="bold">B</text>
          <text x={cx - 14} y={cy - 6}    fontSize="10" fill="#dc2626" fontWeight="bold">O</text>
          {/* Length labels */}
          <text x={(P.x + T.x) / 2 + 4} y={(P.y + T.y) / 2 - 4} fontSize="10" fill="#ec4899" fontWeight="bold">PT={ptLen.toFixed(1)}</text>
          {/* Formula */}
          <text x={cx} y={232} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">PT² = PA × PB</text>
          <text x={cx} y={248} fontSize="10" fill="#6b7280" textAnchor="middle">{ptLen.toFixed(1)}² ≈ {(ptLen * ptLen).toFixed(0)} = {tNear.toFixed(1)} × {tFar.toFixed(1)} ≈ {(tNear * tFar).toFixed(0)}</text>
        </>
      )
    },

    'two-tangents': () => {
      // Two-tangents theorem: PA = PB where A, B are tangent points
      // from external point P.
      const dist = r + 60
      const ext = { x: cx + dist, y: cy }
      // Correct tangent angles: cos(α) = r/dist. Use degrees for pt().
      const alphaDeg = Math.acos(r / dist) * 180 / Math.PI
      const t1 = pt(-alphaDeg)  // upper tangent point
      const t2 = pt(alphaDeg)   // lower tangent point
      const tanLen = Math.sqrt(dist * dist - r * r)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">বহিঃবিন্দু থেকে স্পর্শক</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <line x1={ext.x} y1={ext.y} x2={t1.x} y2={t1.y} stroke="#ec4899" strokeWidth="2.5" />
          <line x1={ext.x} y1={ext.y} x2={t2.x} y2={t2.y} stroke="#ec4899" strokeWidth="2.5" />
          <circle cx={ext.x} cy={ext.y} r="4" fill="#8b5cf6" />
          <circle cx={t1.x} cy={t1.y} r="4" fill="#ec4899" />
          <circle cx={t2.x} cy={t2.y} r="4" fill="#ec4899" />
          <circle cx={cx} cy={cy} r="4" fill="#dc2626" />
          <text x={ext.x+8} y={ext.y+5} fontSize="11" fill="#8b5cf6" fontWeight="bold">P</text>
          <text x={t1.x-14} y={t1.y-6} fontSize="11" fill="#ec4899" fontWeight="bold">A</text>
          <text x={t2.x-14} y={t2.y+14} fontSize="11" fill="#ec4899" fontWeight="bold">B</text>
          <text x={cx-15} y={cy-8} fontSize="11" fill="#dc2626" fontWeight="bold">O</text>
          {/* OA and OB radius lines — show OA ⊥ PA, OB ⊥ PB */}
          <line x1={cx} y1={cy} x2={t1.x} y2={t1.y} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={cx} y1={cy} x2={t2.x} y2={t2.y} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" />
          <text x={cx} y={232} fontSize="11" fill="#ec4899" textAnchor="middle" fontWeight="bold">PA = PB = {tanLen.toFixed(1)}</text>
          <text x={cx} y={247} fontSize="10" fill="#6b7280" textAnchor="middle">বহিঃবিন্দু থেকে স্পর্শক দুটি সমান (OA ⊥ PA, OB ⊥ PB)</text>
        </>
      )
    },

    'circumcircle': () => {
      const A = pt(210), B = pt(330), C = pt(90)
      // All three perpendicular bisectors meet at the circumcenter O,
      // so draw each as a line from the side's midpoint to O.
      const mAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }
      const mBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }
      const mCA = { x: (C.x + A.x) / 2, y: (C.y + A.y) / 2 }
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">পরিবৃত্ত (Circumcircle)</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2.5" />
          {/* Three perpendicular bisectors, each from side midpoint to circumcenter O */}
          <line x1={mAB.x} y1={mAB.y} x2={cx} y2={cy} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1={mBC.x} y1={mBC.y} x2={cx} y2={cy} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1={mCA.x} y1={mCA.y} x2={cx} y2={cy} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" />
          {/* Midpoint dots */}
          <circle cx={mAB.x} cy={mAB.y} r="3" fill="#ef4444" />
          <circle cx={mBC.x} cy={mBC.y} r="3" fill="#ef4444" />
          <circle cx={mCA.x} cy={mCA.y} r="3" fill="#ef4444" />
          <circle cx={cx} cy={cy} r="5" fill="#dc2626" />
          {[['A',A,-14,5],['B',B,6,5],['C',C,-4,-12],['O',{x:cx,y:cy},6,-8]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill={l==='O'?'#dc2626':'#374151'} fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={232} fontSize="11" fill="#6366f1" textAnchor="middle" fontWeight="bold">তিনটি বাহুর লম্বসমদ্বিখণ্ডক একই বিন্দু O-তে মিলিত</text>
          <text x={cx} y={247} fontSize="10" fill="#6b7280" textAnchor="middle">পরিব্যাসার্ধ R = {r} (OA = OB = OC = R)</text>
        </>
      )
    },

    'incircle': () => {
      // Triangle scaled by r so the radius slider visibly affects this view.
      const k = r / 70
      const A = { x: cx - 90 * k, y: cy + 55 * k }
      const B = { x: cx + 90 * k, y: cy + 55 * k }
      const C = { x: cx, y: cy - 65 * k }
      // Real incircle: I = (a·A + b·B + c·C) / (a+b+c),  r_in = Area / s
      const a = Math.sqrt((B.x - C.x) ** 2 + (B.y - C.y) ** 2)  // |BC|
      const b = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2)  // |CA|
      const c = Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2)  // |AB|
      const sum = a + b + c
      const I = { x: (a * A.x + b * B.x + c * C.x) / sum, y: (a * A.y + b * B.y + c * C.y) / sum }
      const area = Math.abs(A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2
      const inR = area / (sum / 2)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">অন্তর্বৃত্ত (Incircle)</text>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="2.5" />
          <circle cx={I.x} cy={I.y} r={inR} fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="2.5" />
          <circle cx={I.x} cy={I.y} r="4" fill="#dc2626" />
          {/* Angle bisectors (vertex → incenter) */}
          <line x1={A.x} y1={A.y} x2={I.x} y2={I.y} stroke="#dc2626" strokeWidth="1" strokeDasharray="4,3" />
          <line x1={B.x} y1={B.y} x2={I.x} y2={I.y} stroke="#dc2626" strokeWidth="1" strokeDasharray="4,3" />
          <line x1={C.x} y1={C.y} x2={I.x} y2={I.y} stroke="#dc2626" strokeWidth="1" strokeDasharray="4,3" />
          {[['A',A,-14,14],['B',B,6,14],['C',C,-4,-10],['I',I,8,-8]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill={l==='I'?'#dc2626':'#374151'} fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={235} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">কোণ-দ্বিখণ্ডক কেন্দ্র I, অন্তর্ব্যাসার্ধ ≈ {inR.toFixed(1)}</text>
        </>
      )
    },

    'excircle': () => {
      // Triangle scaled by r so the slider visibly affects this view.
      const k = r / 70
      const A = { x: cx, y: cy - 60 * k }                 // top
      const B = { x: cx - 80 * k, y: cy + 35 * k }        // bottom-left
      const C = { x: cx + 80 * k, y: cy + 35 * k }        // bottom-right
      // Excircle opposite A (tangent to BC and extensions of AB, AC):
      //   Iₐ = (-a·A + b·B + c·C) / (-a+b+c),  rₐ = Area / (s−a)
      const a = Math.sqrt((B.x - C.x) ** 2 + (B.y - C.y) ** 2)  // |BC|
      const b = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2)  // |CA|
      const c = Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2)  // |AB|
      const s = (a + b + c) / 2
      const denom = -a + b + c
      const Ia = {
        x: (-a * A.x + b * B.x + c * C.x) / denom,
        y: (-a * A.y + b * B.y + c * C.y) / denom,
      }
      const area = Math.abs(A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2
      const exR = area / (s - a)
      // Extend AB and AC past B and C so the excircle's tangency on the
      // extensions is visible.
      const extend = (P, Q, factor = 1.6) => ({
        x: P.x + (Q.x - P.x) * factor,
        y: P.y + (Q.y - P.y) * factor,
      })
      const Bext = extend(A, B)
      const Cext = extend(A, C)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">বহির্বৃত্ত (Excircle)</text>
          {/* Side extensions (dashed) */}
          <line x1={B.x} y1={B.y} x2={Bext.x} y2={Bext.y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1={C.x} y1={C.y} x2={Cext.x} y2={Cext.y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3" />
          {/* Triangle */}
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="2.5" />
          {/* Excircle */}
          <circle cx={Ia.x} cy={Ia.y} r={exR} fill="rgba(139,92,246,0.12)" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx={Ia.x} cy={Ia.y} r="4" fill="#8b5cf6" />
          <text x={Ia.x + 8} y={Ia.y + 5} fontSize="12" fill="#8b5cf6" fontWeight="bold">Iₐ</text>
          {[['A',A,-4,-10],['B',B,-14,14],['C',C,6,14]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <text x={cx} y={234} fontSize="11" fill="#8b5cf6" textAnchor="middle" fontWeight="bold">বহির্ব্যাসার্ধ rₐ ≈ {exR.toFixed(1)}</text>
          <text x={cx} y={248} fontSize="10" fill="#6b7280" textAnchor="middle">BC-এর বিপরীতে বহির্বৃত্ত (BC এবং AB, AC-এর সম্প্রসারণের স্পর্শক)</text>
        </>
      )
    },

    'alternate-segment': () => {
      const T = { x: cx - r, y: cy }
      const A = pt(150), B = pt(30)
      // Direction vectors for angle arcs.
      const tbLen = Math.sqrt((B.x - T.x) ** 2 + (B.y - T.y) ** 2)
      const tbN = { x: (B.x - T.x) / tbLen, y: (B.y - T.y) / tbLen }
      const atLen = Math.sqrt((T.x - A.x) ** 2 + (T.y - A.y) ** 2)
      const atN = { x: (T.x - A.x) / atLen, y: (T.y - A.y) / atLen }
      const abLen = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)
      const abN = { x: (B.x - A.x) / abLen, y: (B.y - A.y) / abLen }
      const inscribedAngle = Math.acos(atN.x * abN.x + atN.y * abN.y) * 180 / Math.PI
      const rArc = 22
      // Arc endpoints
      const stT = { x: T.x, y: T.y - rArc }
      const enT = { x: T.x + rArc * tbN.x, y: T.y + rArc * tbN.y }
      const stA = { x: A.x + rArc * atN.x, y: A.y + rArc * atN.y }
      const enA = { x: A.x + rArc * abN.x, y: A.y + rArc * abN.y }
      // Label positions (outside the arc, along bisector)
      const labelAt = (vx, vy, base, extra) => {
        const len = Math.sqrt(vx * vx + vy * vy)
        return { x: base.x + (rArc + extra) * vx / len, y: base.y + (rArc + extra) * vy / len }
      }
      const labT = labelAt(0 + tbN.x, -1 + tbN.y, T, 12)
      const labA = labelAt(atN.x + abN.x, atN.y + abN.y, A, 12)
      return (
        <>
          <text x={cx} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">একান্তর খণ্ড উপপাদ্য</text>
          <circle cx={cx} cy={cy} r={r} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
          {/* Tangent at T */}
          <line x1={T.x} y1={T.y - 55} x2={T.x} y2={T.y + 55} stroke="#ec4899" strokeWidth="2.5" />
          <text x={T.x + 4} y={T.y - 48} fontSize="10" fill="#ec4899" fontWeight="bold">স্পর্শক</text>
          {/* Chords TA, TB, AB */}
          <line x1={T.x} y1={T.y} x2={A.x} y2={A.y} stroke="#3b82f6" strokeWidth="2" />
          <line x1={T.x} y1={T.y} x2={B.x} y2={B.y} stroke="#3b82f6" strokeWidth="2" />
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#10b981" strokeWidth="2" />
          {/* Tangent-chord angle ψ at T (sweep=1 → CW visually) */}
          <path d={`M ${stT.x} ${stT.y} A ${rArc} ${rArc} 0 0 1 ${enT.x} ${enT.y}`}
            fill="rgba(239,68,68,0.18)" stroke="#ef4444" strokeWidth="1.5" />
          <text x={labT.x} y={labT.y + 4} fontSize="11" fill="#ef4444" fontWeight="bold" textAnchor="middle">ψ</text>
          {/* Inscribed angle ∠TAB at A (sweep=0 → CCW visually = upper arc) */}
          <path d={`M ${stA.x} ${stA.y} A ${rArc} ${rArc} 0 0 0 ${enA.x} ${enA.y}`}
            fill="rgba(239,68,68,0.18)" stroke="#ef4444" strokeWidth="1.5" />
          <text x={labA.x} y={labA.y + 4} fontSize="11" fill="#ef4444" fontWeight="bold" textAnchor="middle">ψ</text>
          {/* Vertex labels */}
          {[['T',T,-14,5],['A',A,-14,12],['B',B,6,-8]].map(([l,p,dx,dy]) =>
            <text key={l} x={p.x+dx} y={p.y+dy} fontSize="12" fill="#374151" fontWeight="bold">{l}</text>
          )}
          <circle cx={T.x} cy={T.y} r="4" fill="#ec4899" />
          <circle cx={A.x} cy={A.y} r="4" fill="#3b82f6" />
          <circle cx={B.x} cy={B.y} r="4" fill="#3b82f6" />
          <text x={cx} y={234} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">ψ = {inscribedAngle.toFixed(1)}°</text>
          <text x={cx} y={249} fontSize="10" fill="#6b7280" textAnchor="middle">স্পর্শক-জ্যা কোণ = একান্তর খণ্ডের বৃত্তস্থ কোণ ∠TAB</text>
        </>
      )
    },
  }

  const render = diagrams[type] || diagrams['chord-perp']

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 255" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {render()}
      </svg>
      {editable && (
        <div className="mt-3 px-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-600">ব্যাসার্ধ (Radius): {r}</label>
          <input type="range" min="45" max="85" value={r} onChange={e => setR(+e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />

          {type === 'central-inscribed' && (
            <>
              <label className="block text-xs font-semibold text-gray-600 mt-2">বিন্দু P-এর অবস্থান (কোণ): {angleP}°</label>
              <input type="range" min="220" max="320" value={angleP} onChange={e => setAngleP(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </>
          )}

          {type === 'semicircle-right' && (
            <>
              <label className="block text-xs font-semibold text-gray-600 mt-2">বিন্দু P-এর অবস্থান (কোণ): {angleSemiP}°</label>
              <input type="range" min="-170" max="-10" value={angleSemiP} onChange={e => setAngleSemiP(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </>
          )}

          {type === 'same-segment' && (
            <>
              <label className="block text-xs font-semibold text-gray-600 mt-2">বিন্দু P-এর অবস্থান (কোণ): {angleSameP}°</label>
              <input type="range" min="210" max="260" value={angleSameP} onChange={e => setAngleSameP(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

              <label className="block text-xs font-semibold text-gray-600 mt-2">বিন্দু Q-এর অবস্থান (কোণ): {angleSameQ}°</label>
              <input type="range" min="280" max="330" value={angleSameQ} onChange={e => setAngleSameQ(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
