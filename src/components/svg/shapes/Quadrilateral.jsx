/**
 * Quadrilateral.jsx
 *
 * Displays different types of quadrilaterals with adjustable parameters
 * Types: Rectangle, Square, Parallelogram, Rhombus, Trapezium
 */

import React, { useState } from 'react';
import { getDistance } from '@/utils/mathEngine';

export default function Quadrilateral({
  type: initialType = 'rectangle', // 'rectangle', 'square', 'parallelogram', 'rhombus', 'trapezium', 'kite', plus class-8 variants
  initialWidth = 120,
  initialHeight = 80,
  showLabels = true,
  showDiagonals: initialShowDiagonals = false,
  editable = false,
}) {
  // type + showDiagonals are seeded from props but live in local state so the
  // user can switch between quadrilateral types and toggle diagonals from
  // inside the editor (teacher-side exploration).
  const [type, setType] = useState(initialType);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [skew, setSkew] = useState(30); // for parallelogram/rhombus
  const [showDiagonals, setShowDiagonals] = useState(initialShowDiagonals);

  // Calculate quadrilateral vertices
  const getVertices = () => {
    const cx = 150; // center X
    const cy = 130; // center Y
    const w = width / 2;
    const h = height / 2;

    switch (type) {
      case 'rectangle':
        return [
          { x: cx - w, y: cy + h, label: 'A' },
          { x: cx + w, y: cy + h, label: 'B' },
          { x: cx + w, y: cy - h, label: 'C' },
          { x: cx - w, y: cy - h, label: 'D' },
        ];

      case 'square':
        const size = width;
        const s = size / 2;
        return [
          { x: cx - s, y: cy + s, label: 'A' },
          { x: cx + s, y: cy + s, label: 'B' },
          { x: cx + s, y: cy - s, label: 'C' },
          { x: cx - s, y: cy - s, label: 'D' },
        ];

      case 'parallelogram':
        const pSkew = skew;
        return [
          { x: cx - w + pSkew, y: cy + h, label: 'A' },
          { x: cx + w + pSkew, y: cy + h, label: 'B' },
          { x: cx + w - pSkew, y: cy - h, label: 'C' },
          { x: cx - w - pSkew, y: cy - h, label: 'D' },
        ];

      case 'rhombus':
        // All sides equal, opposite angles equal
        const rSkew = skew;
        return [
          { x: cx, y: cy + h, label: 'A' },
          { x: cx + width / 2 + rSkew / 2, y: cy, label: 'B' },
          { x: cx, y: cy - h, label: 'C' },
          { x: cx - width / 2 - rSkew / 2, y: cy, label: 'D' },
        ];

      case 'trapezium':
        // One pair of parallel sides
        const topWidth = width * 0.6;
        const t = topWidth / 2;
        return [
          { x: cx - w, y: cy + h, label: 'A' },
          { x: cx + w, y: cy + h, label: 'B' },
          { x: cx + t, y: cy - h, label: 'C' },
          { x: cx - t, y: cy - h, label: 'D' },
        ];

      case 'kite':
        // Kite: two pairs of adjacent equal sides
        return [
          { x: cx, y: cy + h * 1.4, label: 'A' },
          { x: cx + w, y: cy + h * 0.1, label: 'B' },
          { x: cx, y: cy - h, label: 'C' },
          { x: cx - w, y: cy + h * 0.1, label: 'D' },
        ];

      case 'parallelogram-diagonals':
        return [
          { x: cx - w + skew, y: cy + h, label: 'A' },
          { x: cx + w + skew, y: cy + h, label: 'B' },
          { x: cx + w - skew, y: cy - h, label: 'C' },
          { x: cx - w - skew, y: cy - h, label: 'D' },
        ];

      case 'rhombus-diagonals':
        return [
          { x: cx, y: cy + h, label: 'A' },
          { x: cx + width / 2 + skew / 2, y: cy, label: 'B' },
          { x: cx, y: cy - h, label: 'C' },
          { x: cx - width / 2 - skew / 2, y: cy, label: 'D' },
        ];

      case 'quad-angles':
        return [
          { x: cx - w + 20, y: cy + h, label: 'A' },
          { x: cx + w + 20, y: cy + h, label: 'B' },
          { x: cx + w - 10, y: cy - h, label: 'C' },
          { x: cx - w - 10, y: cy - h, label: 'D' },
        ];

      case 'construction':
        // Same vertex layout as parallelogram — the construction-arc
        // overlay is rendered separately in the JSX below.
        return [
          { x: cx - w + skew, y: cy + h, label: 'A' },
          { x: cx + w + skew, y: cy + h, label: 'B' },
          { x: cx + w - skew, y: cy - h, label: 'C' },
          { x: cx - w - skew, y: cy - h, label: 'D' },
        ];

      default:
        return [
          { x: cx - w, y: cy + h, label: 'A' },
          { x: cx + w, y: cy + h, label: 'B' },
          { x: cx + w, y: cy - h, label: 'C' },
          { x: cx - w, y: cy - h, label: 'D' },
        ];
    }
  };

  const vertices = getVertices();
  const pointsStr = vertices.map((v) => `${v.x},${v.y}`).join(' ');

  // Get quadrilateral type info
  const typeInfo = {
    rectangle: {
      bn: 'Rectangle',
      en: 'Rectangle',
      description: 'বিপরীত বাহু সমান ও সমান্তরাল, সব কোণ 90°',
    },
    square: {
      bn: 'Square',
      en: 'Square',
      description: 'সব বাহু সমান, সব কোণ 90°',
    },
    parallelogram: {
      bn: 'Parallelogram',
      en: 'Parallelogram',
      description: 'বিপরীত বাহু সমান ও সমান্তরাল',
    },
    rhombus: {
      bn: 'Rhombus',
      en: 'Rhombus',
      description: 'সব বাহু সমান, বিপরীত কোণ সমান',
    },
    trapezium: {
      bn: 'Trapezium',
      en: 'Trapezium',
      description: 'এক জোড়া বাহু সমান্তরাল',
    },
    kite: {
      bn: 'Kite / ঘুড়ি',
      en: 'Kite',
      description: 'দুই জোড়া সন্নিহিত বাহু সমান',
    },
    'parallelogram-diagonals': {
      bn: 'সমান্তরিক কর্ণ',
      en: 'Parallelogram Diagonals',
      description: 'কর্ণদ্বয় পরস্পরকে সমদ্বিখণ্ড করে',
    },
    'rhombus-diagonals': {
      bn: 'রম্বস কর্ণ',
      en: 'Rhombus Diagonals',
      description: 'কর্ণদ্বয় পরস্পর লম্ব সমদ্বিখণ্ডক',
    },
    'quad-angles': {
      bn: 'চতুর্ভুজ কোণ',
      en: 'Quadrilateral Angles',
      description: 'চতুর্ভুজের কোণসমূহের যোগফল = 360°',
    },
    construction: {
      bn: 'চতুর্ভুজ অঙ্কন',
      en: 'Quadrilateral Construction',
      description: 'AB + AD + ∠DAB থেকে সমান্তরিক অঙ্কন',
    },
  };

  const info = typeInfo[type];

  // Right angle markers for rectangle/square
  const renderRightAngles = () => {
    if (type !== 'rectangle' && type !== 'square') return null;
    const markerSize = 12;
    const [A, B, C, D] = vertices;

    return (
      <>
        <path d={`M ${D.x + markerSize} ${D.y} L ${D.x + markerSize} ${D.y + markerSize} L ${D.x} ${D.y + markerSize}`} fill="none" stroke="#6366f1" strokeWidth="1.5" />
        <path d={`M ${A.x + markerSize} ${A.y} L ${A.x + markerSize} ${A.y - markerSize} L ${A.x} ${A.y - markerSize}`} fill="none" stroke="#6366f1" strokeWidth="1.5" />
        <path d={`M ${B.x - markerSize} ${B.y} L ${B.x - markerSize} ${B.y - markerSize} L ${B.x} ${B.y - markerSize}`} fill="none" stroke="#6366f1" strokeWidth="1.5" />
        <path d={`M ${C.x - markerSize} ${C.y} L ${C.x - markerSize} ${C.y + markerSize} L ${C.x} ${C.y + markerSize}`} fill="none" stroke="#6366f1" strokeWidth="1.5" />
      </>
    );
  };

  // Parallel markers
  const renderParallelMarkers = () => {
    if (type === 'trapezium') {
      // Mark the parallel sides (top and bottom)
      const [A, B, , D] = vertices;
      return (
        <>
          <text x={A.x} y={A.y + 18} fontSize="12" fill="#10b981">»</text>
          <text x={B.x - 8} y={B.y + 18} fontSize="12" fill="#10b981">»</text>
          <text x={D.x} y={D.y - 12} fontSize="12" fill="#10b981">»</text>
        </>
      );
    }
    if (type === 'parallelogram' || type === 'rhombus') {
      const [A, B, C, D] = vertices;
      return (
        <>
          <text x={A.x} y={A.y + 18} fontSize="12" fill="#10b981">»</text>
          <text x={B.x - 8} y={B.y + 18} fontSize="12" fill="#10b981">»</text>
          <text x={C.x} y={C.y - 12} fontSize="12" fill="#10b981">»</text>
          <text x={D.x} y={D.y - 12} fontSize="12" fill="#10b981">»</text>
        </>
      );
    }
    return null;
  };

  // Diagonals
  const renderDiagonals = () => {
    const showD = showDiagonals || type === 'parallelogram-diagonals' || type === 'rhombus-diagonals' || type === 'kite';
    if (!showD) return null;
    const [A, B, C, D] = vertices;
    const mx = (A.x + C.x) / 2, my = (A.y + C.y) / 2;
    const isPerp = type === 'rhombus-diagonals' || type === 'kite';
    return (
      <>
        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
        <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
        <circle cx={mx} cy={my} r="4" fill="#ef4444" />
        {isPerp && (
          <path d={`M ${mx - 8} ${my} L ${mx - 8} ${my - 8} L ${mx} ${my - 8}`} fill="none" stroke="#374151" strokeWidth="1.5" />
        )}
      </>
    );
  };

  // Construction overlay: angle arc at A, dashed arcs from D and B
  // showing how C is found (parallelogram completion).
  const renderConstruction = () => {
    if (type !== 'construction') return null;
    const [A, B, C, D] = vertices;
    // Side lengths
    const ab = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    const ad = Math.sqrt((D.x - A.x) ** 2 + (D.y - A.y) ** 2);
    // Angle at A between AB and AD
    const v1 = { x: B.x - A.x, y: B.y - A.y };
    const v2 = { x: D.x - A.x, y: D.y - A.y };
    const dotAB_AD = v1.x * v2.x + v1.y * v2.y;
    const angleAtA = Math.round(Math.acos(Math.max(-1, Math.min(1, dotAB_AD / (ab * ad)))) * 180 / Math.PI);
    const arcR = 22;
    const dir1 = Math.atan2(v1.y, v1.x);
    const dir2 = Math.atan2(v2.y, v2.x);
    const arcStart = { x: A.x + arcR * Math.cos(dir1), y: A.y + arcR * Math.sin(dir1) };
    const arcEnd   = { x: A.x + arcR * Math.cos(dir2), y: A.y + arcR * Math.sin(dir2) };
    // Sweep flag: choose the smaller-angle arc
    const cross = v1.x * v2.y - v1.y * v2.x;
    const sweep = cross > 0 ? 1 : 0;
    // Construction arcs from D and B (dashed) suggesting compass swing to find C
    const arcSwing = 0.5;
    const dirDC = Math.atan2(C.y - D.y, C.x - D.x);
    const dirBC = Math.atan2(C.y - B.y, C.x - B.x);
    const distDC = Math.sqrt((C.x - D.x) ** 2 + (C.y - D.y) ** 2);
    const distBC = Math.sqrt((C.x - B.x) ** 2 + (C.y - B.y) ** 2);
    const arc3Start = { x: D.x + distDC * Math.cos(dirDC - arcSwing), y: D.y + distDC * Math.sin(dirDC - arcSwing) };
    const arc3End   = { x: D.x + distDC * Math.cos(dirDC + arcSwing), y: D.y + distDC * Math.sin(dirDC + arcSwing) };
    const arc4Start = { x: B.x + distBC * Math.cos(dirBC - arcSwing), y: B.y + distBC * Math.sin(dirBC - arcSwing) };
    const arc4End   = { x: B.x + distBC * Math.cos(dirBC + arcSwing), y: B.y + distBC * Math.sin(dirBC + arcSwing) };
    return (
      <>
        {/* Construction arcs from D and B converging at C */}
        <path d={`M ${arc3Start.x} ${arc3Start.y} A ${distDC} ${distDC} 0 0 1 ${arc3End.x} ${arc3End.y}`}
          fill="none" stroke="#ef4444" strokeWidth="1.3" strokeDasharray="4,3" />
        <path d={`M ${arc4Start.x} ${arc4Start.y} A ${distBC} ${distBC} 0 0 1 ${arc4End.x} ${arc4End.y}`}
          fill="none" stroke="#10b981" strokeWidth="1.3" strokeDasharray="4,3" />
        {/* Angle arc at A */}
        <path d={`M ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y}`}
          fill="rgba(124,58,237,0.18)" stroke="#7c3aed" strokeWidth="1.5" />
        <text x={A.x + 12} y={A.y - 4} fontSize="10" fill="#7c3aed" fontWeight="bold">∠A={angleAtA}°</text>
        {/* Side measurement labels */}
        <text x={(A.x + B.x) / 2} y={A.y + 16} fontSize="10" fill="#3b82f6" fontWeight="bold" textAnchor="middle">AB={ab.toFixed(0)}</text>
        <text x={(A.x + D.x) / 2 - 32} y={(A.y + D.y) / 2 + 4} fontSize="10" fill="#ef4444" fontWeight="bold">AD={ad.toFixed(0)}</text>
        {/* Mark C as the constructed vertex */}
        <circle cx={C.x} cy={C.y} r="5" fill="#7c3aed" stroke="#fff" strokeWidth="1.5" />
      </>
    );
  };

  // Angle sum labels for quad-angles
  const renderAngleSum = () => {
    if (type !== 'quad-angles') return null;
    const [A, B, C, D] = vertices;
    const angleBetween = (p1, vertex, p2) => {
      const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y }
      const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y }
      const dot = v1.x * v2.x + v1.y * v2.y
      const m1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
      const m2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
      if (m1 === 0 || m2 === 0) return 0
      return Math.round(Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180 / Math.PI)
    }
    const angA = angleBetween(D, A, B)
    const angB = angleBetween(A, B, C)
    const angC = angleBetween(B, C, D)
    const angD = angleBetween(C, D, A)
    return (
      <>
        {[['A', A, D, B, angA, '#ef4444'], ['B', B, A, C, angB, '#3b82f6'], ['C', C, B, D, angC, '#10b981'], ['D', D, C, A, angD, '#f59e0b']].map(([label, vertex, p1, p2, angle, color]) => {
          const dir1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x)
          const dir2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x)
          const arcR = 18
          const sx = vertex.x + arcR * Math.cos(dir1)
          const sy = vertex.y + arcR * Math.sin(dir1)
          const ex = vertex.x + arcR * Math.cos(dir2)
          const ey = vertex.y + arcR * Math.sin(dir2)
          return <path key={label} d={`M ${sx} ${sy} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey}`} fill={`${color}20`} stroke={color} strokeWidth="1.5" />
        })}
        <text x={A.x + 16} y={A.y - 6} fontSize="10" fill="#ef4444" fontWeight="bold">{'∠A=' + angA + '°'}</text>
        <text x={B.x - 50} y={B.y - 6} fontSize="10" fill="#3b82f6" fontWeight="bold">{'∠B=' + angB + '°'}</text>
        <text x={C.x - 50} y={C.y + 14} fontSize="10" fill="#10b981" fontWeight="bold">{'∠C=' + angC + '°'}</text>
        <text x={D.x + 6} y={D.y + 14} fontSize="10" fill="#f59e0b" fontWeight="bold">{'∠D=' + angD + '°'}</text>
        <text x="150" y="230" fontSize="12" fill="#6366f1" fontWeight="bold" textAnchor="middle">{angA + '° + ' + angB + '° + ' + angC + '° + ' + angD + '° = ' + (angA + angB + angC + angD) + '°'}</text>
      </>
    );
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 260" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-quad" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-quad)" />

        {/* Quadrilateral */}
        <polygon points={pointsStr} fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" strokeWidth="3" />

        {/* Right angle markers */}
        {renderRightAngles()}

        {/* Parallel markers */}
        {renderParallelMarkers()}

        {/* Diagonals */}
        {renderDiagonals()}
        {renderAngleSum()}
        {renderConstruction()}

        {/* Vertex points */}
        {vertices.map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r="4" fill="#dc2626" />
        ))}

        {/* Vertex labels */}
        {showLabels &&
          vertices.map((v, i) => (
            <text
              key={`label-${i}`}
              x={v.x + (i % 2 === 0 ? -15 : 10)}
              y={v.y + (i < 2 ? 20 : -5)}
              fontSize="14"
              fill="#dc2626"
              fontWeight="bold"
            >
              {v.label}
            </text>
          ))}

        {/* Title */}
        <text x="150" y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          {info.bn}
        </text>
        <text x="150" y="50" fontSize="12" fill="#9ca3af" textAnchor="middle">
          {info.en}
        </text>
        <text x="150" y="245" fontSize="11" fill="#6b7280" textAnchor="middle">
          {info.description}
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">চতুর্ভুজের ধরন:</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(typeInfo).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    type === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {typeInfo[t].bn}
                </button>
              ))}
            </div>
          </div>

          {/* Width slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              প্রস্থ:
            </label>
            <input
              type="range"
              min="60"
              max="160"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {width} units
            </div>
          </div>

          {/* Height slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              উচ্চতা:
            </label>
            <input
              type="range"
              min="40"
              max="120"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {height} units
            </div>
          </div>

          {/* Skew slider for parallelogram/rhombus and diagonal variants */}
          {['parallelogram', 'rhombus', 'parallelogram-diagonals', 'rhombus-diagonals'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                বাঁক:
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={skew}
                onChange={(e) => setSkew(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {skew}°
              </div>
            </div>
          )}

          {/* Toggle diagonals — disabled when the chosen type always shows
              its own diagonals (kite, parallelogram-diagonals, rhombus-diagonals)
              because renderDiagonals forces them on for those types. */}
          {(() => {
            const forced = type === 'kite' || type === 'parallelogram-diagonals' || type === 'rhombus-diagonals'
            return (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-diagonals"
                  checked={forced || showDiagonals}
                  disabled={forced}
                  onChange={(e) => setShowDiagonals(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="show-diagonals" className={`text-sm ${forced ? 'text-gray-400' : 'text-gray-700'}`}>
                  কর্ণ দেখান{forced ? ' (সর্বদা প্রদর্শিত)' : ''}
                </label>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  );
}
