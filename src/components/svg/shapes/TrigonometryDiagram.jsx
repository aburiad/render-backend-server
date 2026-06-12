/**
 * TrigonometryDiagram.jsx
 * Trigonometry & coordinate geometry diagrams for Class 9-10
 * type: 'right-trig' | 'unit-circle' | 'trig-graph' |
 *       'distance' | 'slope' | 'line-equation'
 */
import { useState } from 'react'

export default function TrigonometryDiagram({ type = 'right-trig', editable = false }) {
  const [angle, setAngle]   = useState(35)
  const [slope, setSlope]   = useState(2)
  const [yInt, setYInt]     = useState(1)
  // Grid-unit coords for the distance-formula demo (A and B).
  const [ax, setAx] = useState(-2)
  const [ay, setAy] = useState(-1)
  const [bx, setBx] = useState(2)
  const [by, setBy] = useState(2)

  const toRad = d => d * Math.PI / 180

  const diagrams = {
    'right-trig': () => {
      // Fixed hypotenuse length keeps the triangle inside the viewbox for any
      // angle 5°–85°. Adjacent and opposite are derived from θ.
      const hyp = 130
      const rad = toRad(angle)
      const adj = hyp * Math.cos(rad)
      const opp = hyp * Math.sin(rad)
      const ax = 60, ay = 205           // right angle vertex
      const bx = ax + adj, by = ay      // bottom-right
      const cx_v = ax, cy_v = ay - opp  // top-left (above A)
      const sinV = Math.sin(rad).toFixed(3)
      const cosV = Math.cos(rad).toFixed(3)
      const tanV = Math.tan(rad).toFixed(3)
      // Arc at vertex B: from direction "toward A" (180°) to "toward C" (180°−θ in math).
      const arcEndX = bx - 28 * Math.cos(rad)
      const arcEndY = by - 28 * Math.sin(rad)
      const labelX = bx - 40 * Math.cos(rad / 2)
      const labelY = by - 40 * Math.sin(rad / 2)
      return (
        <>
          <text x={150} y={22} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিকোণমিতিক অনুপাত</text>
          <text x={150} y={36} fontSize="10" fill="#9ca3af" textAnchor="middle">Trigonometric Ratios</text>
          <polygon points={`${ax},${ay} ${bx},${by} ${cx_v},${cy_v}`} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5" />
          {/* Right angle at A */}
          <path d={`M ${ax+14} ${ay} L ${ax+14} ${ay-14} L ${ax} ${ay-14}`} fill="none" stroke="#374151" strokeWidth="1.5" />
          {/* Vertex labels */}
          <text x={ax-14} y={ay+14}     fontSize="13" fill="#374151" fontWeight="bold">A</text>
          <text x={bx+6}  y={by+14}     fontSize="13" fill="#374151" fontWeight="bold">B</text>
          <text x={cx_v-18} y={cy_v-4}  fontSize="13" fill="#374151" fontWeight="bold">C</text>
          {/* Side labels */}
          <text x={ax - 30}                  y={(ay + cy_v) / 2 + 4} fontSize="11" fill="#ef4444" fontWeight="bold">লম্ব={opp.toFixed(0)}</text>
          <text x={(ax + bx) / 2}            y={ay + 16}             fontSize="11" fill="#3b82f6" fontWeight="bold" textAnchor="middle">ভূমি={adj.toFixed(0)}</text>
          <text x={(bx + cx_v) / 2 + 8}      y={(by + cy_v) / 2 - 4} fontSize="11" fill="#10b981" fontWeight="bold">অতিভুজ={hyp}</text>
          {/* Angle arc at B */}
          <path d={`M ${bx - 28} ${by} A 28 28 0 0 1 ${arcEndX} ${arcEndY}`}
            fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x={labelX} y={labelY + 4} fontSize="11" fill="#8b5cf6" fontWeight="bold" textAnchor="middle">θ={angle}°</text>
          {/* Ratios with live values */}
          <text x={150} y={240} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">sin θ = লম্ব / অতিভুজ = {sinV}</text>
          <text x={150} y={255} fontSize="11" fill="#3b82f6" textAnchor="middle" fontWeight="bold">cos θ = ভূমি / অতিভুজ = {cosV}</text>
          <text x={150} y={270} fontSize="11" fill="#10b981" textAnchor="middle" fontWeight="bold">tan θ = লম্ব / ভূমি = {tanV}</text>
        </>
      )
    },

    'unit-circle': () => {
      const ox = 150, oy = 150, r = 90
      const rad = toRad(angle)
      const px = ox + r * Math.cos(-rad)
      const py = oy + r * Math.sin(-rad)
      return (
        <>
          <text x={150} y={18} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">একক বৃত্ত (Unit Circle)</text>
          {/* Axes */}
          <line x1={ox - r - 14} y1={oy} x2={ox + r + 14} y2={oy} stroke="#9ca3af" strokeWidth="1.5" />
          <line x1={ox} y1={oy + r + 14} x2={ox} y2={oy - r - 14} stroke="#9ca3af" strokeWidth="1.5" />
          <polygon points={`${ox+r+14},${oy} ${ox+r+6},${oy-4} ${ox+r+6},${oy+4}`} fill="#9ca3af" />
          <polygon points={`${ox},${oy-r-14} ${ox-4},${oy-r-6} ${ox+4},${oy-r-6}`} fill="#9ca3af" />
          <text x={ox+r+16} y={oy+4} fontSize="10" fill="#6b7280">X</text>
          <text x={ox+5} y={oy-r-16} fontSize="10" fill="#6b7280">Y</text>
          {/* Unit circle */}
          <circle cx={ox} cy={oy} r={r} fill="rgba(99,102,241,0.07)" stroke="#6366f1" strokeWidth="2" />
          {/* Radius to point */}
          <line x1={ox} y1={oy} x2={px} y2={py} stroke="#ef4444" strokeWidth="2.5" />
          {/* cos projection */}
          <line x1={px} y1={py} x2={px} y2={oy} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* sin projection */}
          <line x1={ox} y1={oy} x2={px} y2={oy} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* Point */}
          <circle cx={px} cy={py} r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          {/* Angle arc */}
          <path d={`M ${ox+28} ${oy} A 28 28 0 0 0 ${ox+28*Math.cos(-rad)} ${oy+28*Math.sin(-rad)}`}
            fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x={ox+32} y={oy-8} fontSize="11" fill="#8b5cf6" fontWeight="bold">θ</text>
          {/* Labels */}
          <text x={ox+4} y={oy-8} fontSize="10" fill="#374151" fontWeight="bold">O</text>
          <text x={px+6} y={py-6} fontSize="11" fill="#ef4444" fontWeight="bold">P(cos θ, sin θ)</text>
          <text x={(ox+px)/2} y={oy+14} fontSize="10" fill="#10b981" fontWeight="bold">cos θ</text>
          <text x={px+4} y={(oy+py)/2} fontSize="10" fill="#3b82f6" fontWeight="bold">sin θ</text>
          {/* Axis tick -1, 1 */}
          {[[-r,'−1'],[r,'1']].map(([dx,lbl]) =>
            <><line key={dx} x1={ox+dx} y1={oy-4} x2={ox+dx} y2={oy+4} stroke="#9ca3af" strokeWidth="1.5" />
            <text key={lbl} x={ox+dx} y={oy+14} fontSize="9" fill="#9ca3af" textAnchor="middle">{lbl}</text></>
          )}
        </>
      )
    },

    'trig-graph': () => {
      const ox = 40, oy = 145, yScale = 50
      const points = (fn, color) => {
        const pts = []
        for (let i = 0; i <= 360; i += 5) {
          const x = ox + (i / 360) * (260)
          const y = oy - fn(toRad(i)) * yScale
          pts.push(`${x},${y}`)
        }
        return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" />
      }
      // Current θ marker position (angle state may be 0-360 for this view)
      const theta = Math.max(0, Math.min(360, angle))
      const markerX = ox + (theta / 360) * 260
      const sinVal = Math.sin(toRad(theta))
      const cosVal = Math.cos(toRad(theta))
      const sinY = oy - sinVal * yScale
      const cosY = oy - cosVal * yScale
      return (
        <>
          <text x={150} y={18} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">ত্রিকোণমিতিক ফাংশন গ্রাফ</text>
          {/* Grid */}
          {[90,180,270,360].map(deg => {
            const x = ox + (deg/360)*260
            return <line key={deg} x1={x} y1={30} x2={x} y2={200} stroke="#f0f0f0" strokeWidth="1" />
          })}
          {[-1,1].map(v => {
            const y = oy - v * yScale
            return <line key={v} x1={ox} y1={y} x2={ox+260} y2={y} stroke="#f0f0f0" strokeWidth="1" />
          })}
          {/* Axes */}
          <line x1={ox} y1={oy} x2={ox+270} y2={oy} stroke="#374151" strokeWidth="2" />
          <line x1={ox} y1={30} x2={ox} y2={200} stroke="#374151" strokeWidth="2" />
          {/* Tick labels */}
          {[[0,'0°'],[90,'90°'],[180,'180°'],[270,'270°'],[360,'360°']].map(([deg,lbl]) =>
            <text key={deg} x={ox+(deg/360)*260} y={oy+14} fontSize="9" fill="#6b7280" textAnchor="middle">{lbl}</text>
          )}
          <text x={ox-10} y={oy-yScale+4} fontSize="9" fill="#6b7280" textAnchor="end">1</text>
          <text x={ox-10} y={oy+yScale+4} fontSize="9" fill="#6b7280" textAnchor="end">−1</text>
          {/* Curves */}
          {points(Math.sin, '#ef4444')}
          {points(Math.cos, '#3b82f6')}
          {/* θ marker — vertical guide line + value dots */}
          <line x1={markerX} y1={30} x2={markerX} y2={200} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" />
          <circle cx={markerX} cy={sinY} r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
          <circle cx={markerX} cy={cosY} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
          <text x={markerX} y={26} fontSize="10" fill="#8b5cf6" fontWeight="bold" textAnchor="middle">θ = {theta}°</text>
          {/* Legend + live values */}
          <line x1={ox+10} y1={220} x2={ox+30} y2={220} stroke="#ef4444" strokeWidth="2.5" />
          <text x={ox+34} y={224} fontSize="10" fill="#ef4444" fontWeight="bold">sin θ = {sinVal.toFixed(3)}</text>
          <line x1={ox+140} y1={220} x2={ox+160} y2={220} stroke="#3b82f6" strokeWidth="2.5" />
          <text x={ox+164} y={224} fontSize="10" fill="#3b82f6" fontWeight="bold">cos θ = {cosVal.toFixed(3)}</text>
        </>
      )
    },

    'distance': () => {
      const ox = 150, oy = 150, step = 28
      // pixel coords from grid coords (y is inverted: +y_grid = up in pixels)
      const A = { x: ox + ax * step, y: oy - ay * step }
      const B = { x: ox + bx * step, y: oy - by * step }
      const dist = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2)
      const distRounded = dist.toFixed(2)
      return (
        <>
          <text x={150} y={18} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">দূরত্ব সূত্র</text>
          {/* Grid */}
          {[-3,-2,-1,0,1,2,3].map(i => (
            <g key={`g${i}`}>
              <line x1={ox+i*step} y1={40} x2={ox+i*step} y2={220} stroke="#f0f0f0" strokeWidth="1" />
              <line x1={50} y1={oy+i*step} x2={250} y2={oy+i*step} stroke="#f0f0f0" strokeWidth="1" />
            </g>
          ))}
          {/* Axes */}
          <line x1={50} y1={oy} x2={255} y2={oy} stroke="#9ca3af" strokeWidth="1.5" />
          <line x1={ox} y1={225} x2={ox} y2={38} stroke="#9ca3af" strokeWidth="1.5" />
          {/* Distance line */}
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#ef4444" strokeWidth="2.5" />
          {/* Dashed right-angle helper (horizontal then vertical leg) */}
          <line x1={A.x} y1={A.y} x2={B.x} y2={A.y} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={B.x} y1={A.y} x2={B.x} y2={B.y} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* Leg labels — only when the legs are non-zero */}
          {bx !== ax && (
            <text x={(A.x + B.x) / 2} y={A.y + (by > ay ? -6 : 14)} fontSize="10" fill="#9ca3af" textAnchor="middle">
              |{bx}−({ax})| = {Math.abs(bx - ax)}
            </text>
          )}
          {by !== ay && (
            <text x={B.x + (bx > ax ? 6 : -6)} y={(A.y + B.y) / 2 + 4} fontSize="10" fill="#9ca3af" textAnchor={bx > ax ? 'start' : 'end'}>
              |{by}−({ay})| = {Math.abs(by - ay)}
            </text>
          )}
          {/* Points */}
          <circle cx={A.x} cy={A.y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
          <circle cx={B.x} cy={B.y} r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
          <text x={A.x - 14} y={A.y + 14} fontSize="11" fill="#3b82f6" fontWeight="bold">A({ax},{ay})</text>
          <text x={B.x + 6}  y={B.y - 6}  fontSize="11" fill="#10b981" fontWeight="bold">B({bx},{by})</text>
          <text x={(A.x + B.x) / 2 + 6} y={(A.y + B.y) / 2 - 6} fontSize="11" fill="#ef4444" fontWeight="bold">d = {distRounded}</text>
          <text x={150} y={245} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="bold">d = √((x₂−x₁)² + (y₂−y₁)²)</text>
          <text x={150} y={262} fontSize="10" fill="#6b7280" textAnchor="middle">= √({Math.pow(bx-ax,2)} + {Math.pow(by-ay,2)}) = √{Math.pow(bx-ax,2) + Math.pow(by-ay,2)} ≈ {distRounded}</text>
        </>
      )
    },

    'slope': () => {
      const ox = 150, oy = 150, step = 26
      const m = slope  // -1 to 1 (slider clamped)
      const clampY = y => Math.max(35, Math.min(245, y))
      const x1 = ox - 3*step, y1 = clampY(oy + 3*m*step)
      const x2 = ox + 3*step, y2 = clampY(oy - 3*m*step)
      const runX = ox + step, runY = oy
      const riseX = ox + step, riseY = clampY(oy - m*step)
      return (
        <>
          <text x={150} y={18} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">রেখার ঢাল (Slope)</text>
          {[-3,-2,-1,0,1,2,3].map(i => <>
            <line key={`v${i}`} x1={ox+i*step} y1={35} x2={ox+i*step} y2={215} stroke="#f0f0f0" strokeWidth="1" />
            <line key={`h${i}`} x1={50} y1={oy+i*step} x2={250} y2={oy+i*step} stroke="#f0f0f0" strokeWidth="1" />
          </>)}
          <line x1={50} y1={oy} x2={255} y2={oy} stroke="#9ca3af" strokeWidth="1.5" />
          <line x1={ox} y1={215} x2={ox} y2={33} stroke="#9ca3af" strokeWidth="1.5" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="2.5" />
          <line x1={ox} y1={oy} x2={runX} y2={runY} stroke="#10b981" strokeWidth="2.5" />
          <line x1={runX} y1={runY} x2={riseX} y2={riseY} stroke="#ef4444" strokeWidth="2.5" />
          <text x={(ox+runX)/2} y={oy+14} fontSize="11" fill="#10b981" fontWeight="bold">run=1</text>
          <text x={runX+5} y={(runY+riseY)/2+4} fontSize="11" fill="#ef4444" fontWeight="bold">rise={m}</text>
          <circle cx={ox} cy={oy} r="4" fill="#6366f1" />
          <text x={150} y={242} fontSize="12" fill="#6366f1" textAnchor="middle" fontWeight="bold">ঢাল (m) = rise/run = {m}</text>
        </>
      )
    },

    'line-equation': () => {
      const ox = 150, oy = 150, step = 26
      const m = slope, c = yInt
      // Correct formula: pixel_y = oy - (m * x_grid + c) * step
      const clampY = y => Math.max(35, Math.min(245, y))
      const yAtX = x_grid => clampY(oy - (m * x_grid + c) * step)
      const x1 = -3, x2 = 3
      const p1x = ox + x1*step, p1y = yAtX(x1)
      const p2x = ox + x2*step, p2y = yAtX(x2)
      return (
        <>
          <text x={150} y={18} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">রেখার সমীকরণ y = mx + c</text>
          {[-3,-2,-1,0,1,2,3].map(i => <>
            <line key={`v${i}`} x1={ox+i*step} y1={40} x2={ox+i*step} y2={215} stroke="#f0f0f0" strokeWidth="1" />
            <line key={`h${i}`} x1={50} y1={oy+i*step} x2={250} y2={oy+i*step} stroke="#f0f0f0" strokeWidth="1" />
          </>)}
          <line x1={50} y1={oy} x2={255} y2={oy} stroke="#9ca3af" strokeWidth="1.5" />
          <line x1={ox} y1={220} x2={ox} y2={38} stroke="#9ca3af" strokeWidth="1.5" />
          {/* Axis labels */}
          <text x={258} y={oy+4} fontSize="10" fill="#6b7280">X</text>
          <text x={ox+4} y={36}  fontSize="10" fill="#6b7280">Y</text>
          {/* y-intercept — clamp to avoid overflow */}
          <circle cx={ox} cy={Math.max(35, Math.min(245, oy - c*step))} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          <text x={ox+7} y={Math.max(40, Math.min(245, oy-c*step))+4} fontSize="10" fill="#f59e0b" fontWeight="bold">c={c}</text>
          {/* Line */}
          <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#6366f1" strokeWidth="2.5" />
          <text x={150} y={242} fontSize="12" fill="#6366f1" textAnchor="middle" fontWeight="bold">y = {m}x + {c}</text>
          <text x={150} y={257} fontSize="10" fill="#9ca3af" textAnchor="middle">m = {m} (ঢাল), c = {c} (Y-অন্তঃখণ্ড)</text>
        </>
      )
    },
  }

  const render = diagrams[type] || diagrams['right-trig']

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 275" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {render()}
      </svg>

      {editable && (
        <div className="mt-3 px-4 space-y-3">
          {(type === 'unit-circle' || type === 'right-trig' || type === 'trig-graph') && (
            <div>
              <label className="block text-xs font-semibold text-gray-600">কোণ θ: {angle}°</label>
              <input
                type="range"
                min={type === 'right-trig' ? 5 : 0}
                max={type === 'trig-graph' ? 360 : 90}
                value={angle}
                onChange={e => setAngle(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              {type === 'right-trig' && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-700 leading-relaxed">
                  <strong>θ ={angle}°</strong> — অতিভুজ স্থির রেখে কোণ পরিবর্তন করুন; লম্ব, ভূমি, এবং অনুপাত সব আপডেট হবে।
                </div>
              )}
              {type === 'trig-graph' && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-700 leading-relaxed">
                  বেগুনি রেখা <strong>θ={angle}°</strong> অবস্থানে; <span className="text-red-600 font-bold">sin θ = {Math.sin(toRad(angle)).toFixed(3)}</span>, <span className="text-blue-600 font-bold">cos θ = {Math.cos(toRad(angle)).toFixed(3)}</span>
                </div>
              )}
            </div>
          )}
          {(type === 'slope' || type === 'line-equation') && (
            <div>
              <label className="block text-xs font-semibold text-gray-600">ঢাল (m): {slope}</label>
              <input type="range" min="-2" max="2" step="1" value={slope} onChange={e => setSlope(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
          )}
          {type === 'line-equation' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600">Y-অন্তঃখণ্ড (c): {yInt}</label>
              <input type="range" min="-2" max="2" step="1" value={yInt} onChange={e => setYInt(+e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
          )}
          {type === 'distance' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-600">A: x₁ = {ax}</label>
                  <input type="range" min="-3" max="3" step="1" value={ax} onChange={e => setAx(+e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-600">A: y₁ = {ay}</label>
                  <input type="range" min="-3" max="3" step="1" value={ay} onChange={e => setAy(+e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-600">B: x₂ = {bx}</label>
                  <input type="range" min="-3" max="3" step="1" value={bx} onChange={e => setBx(+e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-600">B: y₂ = {by}</label>
                  <input type="range" min="-3" max="3" step="1" value={by} onChange={e => setBy(+e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                </div>
              </div>
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-xs font-bold text-red-700">
                  d = √(({bx}−({ax}))² + ({by}−({ay}))²) = √{Math.pow(bx-ax,2) + Math.pow(by-ay,2)} ≈ {Math.sqrt((bx-ax)**2 + (by-ay)**2).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
