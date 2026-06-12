/**
 * Triangle.jsx
 *
 * Displays different types of triangles with adjustable parameters
 * Types: Right-angled, Equilateral, Isosceles, Scalene, Acute, Obtuse
 */

import React, { useState } from 'react';
import { getPolygonPoints, getDistance } from '@/utils/mathEngine';

export default function Triangle({
  type: initialType = 'right', // 'right', 'equilateral', 'isosceles', 'scalene', 'acute', 'obtuse'
  initialBase = 120,
  initialHeight = 80,
  showLabels = true,
  showAngles = true,
  showSides = true,
  editable = false,
}) {
  const [type, setType] = useState(initialType);
  const [base, setBase] = useState(initialBase);
  const [height, setHeight] = useState(initialHeight);

  // Calculate triangle vertices based on type
  const getTriangleVertices = () => {
    const cx = 150; // center X
    const cy = 140; // base Y position

    switch (type) {
      case 'right':
        // Right-angled triangle: A(0,0), B(base,0), C(0,height)
        return [
          { x: cx - base / 2, y: cy, label: 'A' },
          { x: cx + base / 2, y: cy, label: 'B' },
          { x: cx - base / 2, y: cy - height, label: 'C' },
        ];

      case 'equilateral':
        // Equilateral triangle
        const eqSize = base;
        const eqHeight = (eqSize * Math.sqrt(3)) / 2;
        return [
          { x: cx - eqSize / 2, y: cy, label: 'A' },
          { x: cx + eqSize / 2, y: cy, label: 'B' },
          { x: cx, y: cy - eqHeight, label: 'C' },
        ];

      case 'isosceles':
        // Isosceles triangle (two equal sides)
        const isoHeight = height;
        return [
          { x: cx - base / 2, y: cy, label: 'A' },
          { x: cx + base / 2, y: cy, label: 'B' },
          { x: cx, y: cy - isoHeight, label: 'C' },
        ];

      case 'scalene':
        // Scalene triangle (all sides different)
        const skew = 30; // skew the top vertex
        return [
          { x: cx - base / 2, y: cy, label: 'A' },
          { x: cx + base / 2, y: cy, label: 'B' },
          { x: cx + skew, y: cy - height, label: 'C' },
        ];

      case 'acute':
        // Acute triangle (all angles < 90°)
        const acuteSkew = 20;
        return [
          { x: cx - base / 2, y: cy, label: 'A' },
          { x: cx + base / 2, y: cy, label: 'B' },
          { x: cx + acuteSkew, y: cy - height, label: 'C' },
        ];

      case 'obtuse':
        // Obtuse triangle (one angle > 90°)
        const obtuseSkew = -50;
        return [
          { x: cx - base / 2, y: cy, label: 'A' },
          { x: cx + base / 2, y: cy, label: 'B' },
          { x: cx + obtuseSkew, y: cy - height * 0.8, label: 'C' },
        ];

      default:
        return [
          { x: cx - base / 2, y: cy, label: 'A' },
          { x: cx + base / 2, y: cy, label: 'B' },
          { x: cx, y: cy - height, label: 'C' },
        ];
    }
  };

  const vertices = getTriangleVertices();
  const pointsStr = vertices.map((v) => `${v.x},${v.y}`).join(' ');

  // Calculate side lengths for display
  const sideAB = Math.round(getDistance(vertices[0].x, vertices[0].y, vertices[1].x, vertices[1].y));
  const sideBC = Math.round(getDistance(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y));
  const sideCA = Math.round(getDistance(vertices[2].x, vertices[2].y, vertices[0].x, vertices[0].y));

  // Get triangle type info
  const typeInfo = {
    right: { bn: 'Right Triangle', en: 'Right-Angled Triangle', description: 'One angle 90°' },
    equilateral: { bn: 'Equilateral Triangle', en: 'Equilateral Triangle', description: 'All sides equal, each angle 60°' },
    isosceles: { bn: 'Isosceles Triangle', en: 'Isosceles Triangle', description: 'Two sides equal' },
    scalene: { bn: 'Scalene Triangle', en: 'Scalene Triangle', description: 'All sides different' },
    acute: { bn: 'Acute Triangle', en: 'Acute Triangle', description: 'All angles < 90°' },
    obtuse: { bn: 'Obtuse Triangle', en: 'Obtuse Triangle', description: 'One angle > 90°' },
  };

  const info = typeInfo[type];

  // Right angle marker for right triangle
  const renderRightAngle = () => {
    if (type !== 'right') return null;
    const [A, B, C] = vertices;
    const markerSize = 15;
    return (
      <path
        d={`M ${A.x} ${A.y - markerSize} L ${A.x + markerSize} ${A.y - markerSize} L ${A.x + markerSize} ${A.y}`}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
      />
    );
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 260" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-triangle" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-triangle)" />

        {/* Triangle */}
        <polygon points={pointsStr} fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" strokeWidth="3" />

        {/* Right angle marker */}
        {renderRightAngle()}

        {/* Vertex points */}
        {vertices.map((v, i) => (
          <circle key={i} cx={v.x} cy={v.y} r="4" fill="#dc2626" />
        ))}

        {/* Vertex labels */}
        {showLabels &&
          vertices.map((v, i) => (
            <text
              key={`label-${i}`}
              x={v.x + (i === 1 ? 10 : i === 2 ? 5 : -15)}
              y={v.y + (i < 2 ? 20 : -5)}
              fontSize="14"
              fill="#dc2626"
              fontWeight="bold"
            >
              {v.label}
            </text>
          ))}

        {/* Side length labels */}
        {showSides && type !== 'right' && (
          <>
            <text
              x={(vertices[0].x + vertices[1].x) / 2}
              y={vertices[0].y + 18}
              fontSize="12"
              fill="#4b5563"
              textAnchor="middle"
            >
              c = {sideAB}
            </text>
            <text
              x={(vertices[1].x + vertices[2].x) / 2 + 10}
              y={(vertices[1].y + vertices[2].y) / 2}
              fontSize="12"
              fill="#4b5563"
            >
              a = {sideBC}
            </text>
            <text
              x={(vertices[2].x + vertices[0].x) / 2 - 15}
              y={(vertices[2].y + vertices[0].y) / 2}
              fontSize="12"
              fill="#4b5563"
            >
              b = {sideCA}
            </text>
          </>
        )}

        {/* Title */}
        <text x="150" y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          {info.bn}
        </text>
        <text x="150" y="50" fontSize="12" fill="#9ca3af" textAnchor="middle">
          {info.en}
        </text>
        <text x="150" y="240" fontSize="11" fill="#6b7280" textAnchor="middle">
          {info.description}
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ত্রিভুজের ধরন:</label>
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

          {/* Base slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ভূমির দৈর্ঘ্য:
            </label>
            <input
              type="range"
              min="60"
              max="160"
              value={base}
              onChange={(e) => setBase(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {base} units
            </div>
          </div>

          {/* Height slider (not for equilateral) */}
          {type !== 'equilateral' && (
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
          )}

          {/* Side info */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>বাহু:</strong> a={sideBC}, b={sideCA}, c={sideAB} units
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
