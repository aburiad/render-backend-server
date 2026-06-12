/**
 * CoordinateAxes.jsx
 * Basic Cartesian coordinate system — class 7+
 */
import { useState } from 'react'

export default function CoordinateAxes({ editable = false }) {
  const [gridSize, setGridSize] = useState(5)

  const ox = 150, oy = 145
  const step = 22
  const ticks = gridSize

  const gridLines = []
  for (let i = -ticks; i <= ticks; i++) {
    if (i === 0) continue
    gridLines.push(
      <line key={`v${i}`} x1={ox + i * step} y1={oy - ticks * step} x2={ox + i * step} y2={oy + ticks * step} stroke="#f0f0f0" strokeWidth="1" />,
      <line key={`h${i}`} x1={ox - ticks * step} y1={oy + i * step} x2={ox + ticks * step} y2={oy + i * step} stroke="#f0f0f0" strokeWidth="1" />
    )
  }

  const tickLabels = []
  for (let i = -ticks; i <= ticks; i++) {
    if (i === 0) continue
    tickLabels.push(
      <text key={`xl${i}`} x={ox + i * step} y={oy + 14} fontSize="9" fill="#9ca3af" textAnchor="middle">{i}</text>,
      <text key={`yl${i}`} x={ox - 12} y={oy - i * step + 3} fontSize="9" fill="#9ca3af" textAnchor="middle">{i}</text>
    )
  }

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 295" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        <text x={ox} y={20} fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">স্থানাঙ্ক জ্যামিতি</text>
        <text x={ox} y={34} fontSize="10" fill="#9ca3af" textAnchor="middle">Coordinate Geometry</text>

        {/* Grid */}
        {gridLines}

        {/* Axes */}
        <line x1={ox - ticks * step - 10} y1={oy} x2={ox + ticks * step + 14} y2={oy} stroke="#374151" strokeWidth="2" />
        <line x1={ox} y1={oy + ticks * step + 10} x2={ox} y2={oy - ticks * step - 14} stroke="#374151" strokeWidth="2" />

        {/* Arrowheads */}
        <polygon points={`${ox + ticks * step + 14},${oy} ${ox + ticks * step + 6},${oy - 5} ${ox + ticks * step + 6},${oy + 5}`} fill="#374151" />
        <polygon points={`${ox},${oy - ticks * step - 14} ${ox - 5},${oy - ticks * step - 6} ${ox + 5},${oy - ticks * step - 6}`} fill="#374151" />

        {/* Tick labels */}
        {tickLabels}

        {/* Axis labels */}
        <text x={ox + ticks * step + 18} y={oy + 4} fontSize="12" fill="#374151" fontWeight="bold">X</text>
        <text x={ox + 8} y={oy - ticks * step - 16} fontSize="12" fill="#374151" fontWeight="bold">Y</text>
        <text x={ox - 14} y={oy + 14} fontSize="11" fill="#dc2626" fontWeight="bold">O</text>

        {/* Origin dot */}
        <circle cx={ox} cy={oy} r="4" fill="#dc2626" />

        {/* Sample point */}
        <circle cx={ox + 2 * step} cy={oy - 3 * step} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
        <text x={ox + 2 * step + 8} y={oy - 3 * step - 6} fontSize="10" fill="#3b82f6" fontWeight="bold">(2, 3)</text>

        <text x={ox} y={280} fontSize="11" fill="#9ca3af" textAnchor="middle">X — ভুজ (Abscissa), Y — কোটি (Ordinate)</text>
      </svg>

      {editable && (
        <div className="mt-3 px-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-600">গ্রিড পরিসীমা: -{gridSize} থেকে +{gridSize}</label>
          <input type="range" min="3" max="6" value={gridSize} onChange={e => setGridSize(+e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
      )}
    </div>
  )
}
