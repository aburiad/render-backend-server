/**
 * TransversalLines.jsx
 * Parallel lines cut by a transversal — shows all angle-pair theorems
 * type: 'basic' | 'alternate' | 'corresponding' | 'co-interior' | 'adjacent'
 */
import { useState } from 'react'

const LABELS = {
  basic:         { title: 'ছেদক রেখা',       sub: 'Transversal',           color1: '#3b82f6', color2: '#ef4444' },
  alternate:     { title: 'একান্তর কোণ',      sub: 'Alternate Angles',      color1: '#8b5cf6', color2: '#8b5cf6' },
  corresponding: { title: 'অনুরূপ কোণ',       sub: 'Corresponding Angles',  color1: '#10b981', color2: '#10b981' },
  'co-interior': { title: 'অন্তঃমুখী কোণ',   sub: 'Co-interior Angles',    color1: '#f59e0b', color2: '#ef4444' },
  adjacent:      { title: 'সন্নিহিত কোণ',     sub: 'Adjacent Angles',       color1: '#3b82f6', color2: '#ef4444' },
}

export default function TransversalLines({ type = 'basic', editable = false }) {
  const [angle, setAngle] = useState(55) // transversal angle in degrees

  const rad = (angle * Math.PI) / 180
  const L1y = 90, L2y = 180
  const tx = 150 // transversal x intersection on line1
  // Horizontal extent of the two parallel lines. Set wide enough to span
  // past the "m"/"n" labels at x=38 and the parallel "▶" markers at x=55.
  const lx1 = 30, lx2 = 270

  // Intersection points
  const p1 = { x: tx, y: L1y }
  const p2 = { x: tx - (L2y - L1y) / Math.tan(rad), y: L2y }

  // Angle arc helper
  const arc = (cx, cy, r, startDeg, endDeg, color, label, labelOffset = {}) => {
    const s = (startDeg * Math.PI) / 180
    const e = (endDeg * Math.PI) / 180
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
    const lx = cx + (r + 14) * Math.cos((s + e) / 2)
    const ly = cy + (r + 14) * Math.sin((s + e) / 2)
    return (
      <g>
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill={color + '30'} stroke={color} strokeWidth="1.5" />
        {label && <text x={lx + (labelOffset.x || 0)} y={ly + (labelOffset.y || 0)} fontSize="11" fill={color} fontWeight="bold" textAnchor="middle">{label}</text>}
      </g>
    )
  }

  const a = angle // angle at p1 above line, left side
  const b = 180 - angle // supplementary

  const c1 = LABELS[type]?.color1 || '#3b82f6'
  const c2 = LABELS[type]?.color2 || '#ef4444'

  const renderHighlights = () => {
    switch (type) {
      case 'alternate':
        // alternate interior: ∠3 at p1 (below-right) = ∠6 at p2 (above-left)
        return <>
          {arc(p1.x, p1.y, 22, 0, a, c1, '∠3', { x: 8 })}
          {arc(p2.x, p2.y, 22, 180, 180 + a, c1, '∠6', { x: -8 })}
          <text x={150} y={240} fontSize="11" fill={c1} textAnchor="middle" fontWeight="bold">∠3 = ∠6 (একান্তর কোণ সমান)</text>
        </>
      case 'corresponding':
        // corresponding: ∠1 at p1 (above-right) = ∠5 at p2 (above-right)
        return <>
          {arc(p1.x, p1.y, 22, -a, 0, c1, '∠1', { x: 10 })}
          {arc(p2.x, p2.y, 22, -a, 0, c1, '∠5', { x: 10 })}
          <text x={150} y={240} fontSize="11" fill={c1} textAnchor="middle" fontWeight="bold">∠1 = ∠5 (অনুরূপ কোণ সমান)</text>
        </>
      case 'co-interior':
        return <>
          {arc(p1.x, p1.y, 22, 0, a, c1, '∠3')}
          {arc(p2.x, p2.y, 22, -a, 0, c2, '∠5', { x: 10 })}
          <text x={150} y={240} fontSize="11" fill={c1} textAnchor="middle" fontWeight="bold">∠3 + ∠5 = 180° (অন্তঃমুখী কোণ সম্পূরক)</text>
        </>
      case 'adjacent':
        return <>
          {arc(p1.x, p1.y, 22, -a, 0, c1, '∠1', { x: 10 })}
          {arc(p1.x, p1.y, 22, 0, a, c2, '∠2', { x: -6 })}
          <text x={150} y={240} fontSize="11" fill="#475569" textAnchor="middle" fontWeight="bold">∠1 + ∠2 = 180° (সন্নিহিত কোণ সম্পূরক)</text>
        </>
      default:
        return <>
          {arc(p1.x, p1.y, 20, -a, 0, c1, '∠1', { x: 10 })}
          {arc(p1.x, p1.y, 20, 0, a, c2, '∠2')}
          {arc(p1.x, p1.y, 36, 180, 180 + a, c1, '∠3', { x: -10 })}
          {arc(p1.x, p1.y, 36, 180 - a, 180, c2, '∠4')}
        </>
    }
  }

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 260" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        <text x="150" y="22" fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">{LABELS[type]?.title}</text>
        <text x="150" y="36" fontSize="10" fill="#9ca3af" textAnchor="middle">{LABELS[type]?.sub}</text>

        {/* Parallel lines */}
        <line x1={lx1} y1={L1y} x2={lx2} y2={L1y} stroke="#374151" strokeWidth="2.5" />
        <line x1={lx1} y1={L2y} x2={lx2} y2={L2y} stroke="#374151" strokeWidth="2.5" />
        {/* Parallel markers */}
        <text x="55" y={L1y - 6} fontSize="12" fill="#10b981">▶</text>
        <text x="55" y={L2y - 6} fontSize="12" fill="#10b981">▶</text>
        <text x="38" y={L1y + 5} fontSize="10" fill="#6b7280">m</text>
        <text x="38" y={L2y + 5} fontSize="10" fill="#6b7280">n</text>

        {/* Transversal */}
        <line
          x1={p1.x + 80 * Math.cos(Math.PI / 2 + rad)}
          y1={p1.y + 80 * Math.sin(Math.PI / 2 + rad)}
          x2={p2.x - 55 * Math.cos(Math.PI / 2 + rad)}
          y2={p2.y - 55 * Math.sin(Math.PI / 2 + rad)}
          stroke="#6366f1" strokeWidth="2" />
        <text x={p1.x + 72 * Math.cos(Math.PI / 2 + rad)} y={p1.y + 72 * Math.sin(Math.PI / 2 + rad) + 4} fontSize="10" fill="#6366f1" fontWeight="bold">t</text>

        {/* Intersection dots */}
        <circle cx={p1.x} cy={p1.y} r="4" fill="#374151" />
        <circle cx={p2.x} cy={p2.y} r="4" fill="#374151" />

        {renderHighlights()}
      </svg>

      {editable && (
        <div className="mt-3 px-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-600">ছেদক কোণ: {angle}°</label>
          <input type="range" min="25" max="80" value={angle} onChange={e => setAngle(+e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
      )}
    </div>
  )
}
