/**
 * CircleGeometry.jsx
 *
 * Displays circle with labeled parts: center, radius, diameter, chord, sector
 * Interactive controls for highlighting different parts
 */

import React, { useState } from 'react';

export default function CircleGeometry({
  radius: initialRadius = 70,
  showParts: initialShowParts = {
    center: true,
    radius: true,
    diameter: false,
    chord: false,
    sector: false,
    tangent: false,
  },
  editable = false,
}) {
  const [radius, setRadius] = useState(initialRadius);
  const [showParts, setShowParts] = useState(initialShowParts);

  const cx = 150;
  const cy = 140;
  const r = radius;

  const togglePart = (key) => {
    setShowParts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Diameter endpoints
  const dX1 = cx - r;
  const dX2 = cx + r;

  // Chord endpoints (offset from center)
  const chordOffset = r * 0.6;
  const chordHalfLen = Math.sqrt(Math.max(0, r * r - chordOffset * chordOffset));
  const chordY1 = cy - chordHalfLen;
  const chordY2 = cy + chordHalfLen;

  // Sector angle (60 degrees)
  const sectorAngle = 60;
  const sectorEndX = cx + r * Math.cos((60 * Math.PI) / 180);
  const sectorEndY = cy - r * Math.sin((60 * Math.PI) / 180);

  // Tangent line (at right side of circle)
  const tangentX = cx + r;
  const tangentY = cy;
  const tY1 = tangentY - 50;
  const tY2 = tangentY + 50;

  // Part labels in Bengali
  const partLabels = {
    center: { bn: 'কেন্দ্র', color: '#dc2626' },
    radius: { bn: 'ব্যাসার্ধ', color: '#3b82f6' },
    diameter: { bn: 'ব্যাস', color: '#10b981' },
    chord: { bn: 'জ্যা', color: '#f59e0b' },
    sector: { bn: 'চাপ/খণ্ড', color: '#8b5cf6' },
    tangent: { bn: 'স্পর্শক', color: '#ec4899' },
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 280" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-circle" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-circle)" />

        {/* Circle */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" strokeWidth="3" />

        {/* Center */}
        {showParts.center && (
          <>
            <circle cx={cx} cy={cy} r="5" fill="#dc2626" />
            <text x={cx - 15} y={cy + 20} fontSize="14" fill="#dc2626" fontWeight="bold">O</text>
          </>
        )}

        {/* Radius */}
        {showParts.radius && (
          <>
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#3b82f6" strokeWidth="3" />
            <circle cx={cx + r} cy={cy} r="4" fill="#3b82f6" />
            <text x={cx + r / 2} y={cy - 10} fontSize="13" fill="#3b82f6" fontWeight="bold" textAnchor="middle">
              r = {r}
            </text>
          </>
        )}

        {/* Diameter */}
        {showParts.diameter && (
          <>
            <line x1={dX1} y1={cy} x2={dX2} y2={cy} stroke="#10b981" strokeWidth="3" />
            <circle cx={dX1} cy={cy} r="4" fill="#10b981" />
            <circle cx={dX2} cy={cy} r="4" fill="#10b981" />
            <text x={cx} y={cy - 15} fontSize="13" fill="#10b981" fontWeight="bold" textAnchor="middle">
              d = {2 * r}
            </text>
          </>
        )}

        {/* Chord */}
        {showParts.chord && (
          <>
            <line x1={cx - chordOffset} y1={chordY1} x2={cx - chordOffset} y2={chordY2} stroke="#f59e0b" strokeWidth="3" />
            <circle cx={cx - chordOffset} cy={chordY1} r="4" fill="#f59e0b" />
            <circle cx={cx - chordOffset} cy={chordY2} r="4" fill="#f59e0b" />
            <text x={cx - chordOffset - 15} y={cy} fontSize="12" fill="#f59e0b" fontWeight="bold" textAnchor="end">
              জ্যা
            </text>
            {/* Perpendicular from center to chord */}
            <line x1={cx} y1={cy} x2={cx - chordOffset} y2={cy} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,4" />
          </>
        )}

        {/* Sector */}
        {showParts.sector && (
          <>
            <path
              d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${sectorEndX} ${sectorEndY} Z`}
              fill="rgba(139, 92, 246, 0.3)"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
            <text x={cx + 30} y={cy - 30} fontSize="12" fill="#8b5cf6" fontWeight="bold">
              চাপ
            </text>
          </>
        )}

        {/* Tangent */}
        {showParts.tangent && (
          <>
            <line x1={tangentX} y1={tY1} x2={tangentX} y2={tY2} stroke="#ec4899" strokeWidth="3" />
            <line x1={cx} y1={cy} x2={tangentX} y2={cy} stroke="#3b82f6" strokeWidth="2" />
            {/* Right angle marker */}
            <path
              d={`M ${tangentX - 12} ${tangentY} L ${tangentX - 12} ${tangentY - 12} L ${tangentX} ${tangentY - 12}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
            />
            <text x={tangentX + 15} y={cy} fontSize="12" fill="#ec4899" fontWeight="bold">
              স্পর্শক
            </text>
          </>
        )}

        {/* Title */}
        <text x="150" y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          বৃত্তের বিভিন্ন অংশ
        </text>
        <text x="150" y="265" fontSize="12" fill="#9ca3af" textAnchor="middle">
          ব্যাসার্ধ = {r} | ব্যাস = {2 * r} | পরিধি = {Math.round(2 * Math.PI * r * 10) / 10}
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          {/* Radius slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ব্যাসার্ধ: {radius}
            </label>
            <input
              type="range"
              min="40"
              max="90"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>40</span>
              <span className="font-bold text-indigo-600">{radius}</span>
              <span>90</span>
            </div>
          </div>

          {/* Part toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              কোন অংশগুলো দেখাবেন:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(partLabels).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={showParts[key]}
                    onChange={() => togglePart(key)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: label.color }}
                  />
                  <span className="text-xs font-medium" style={{ color: label.color }}>
                    {label.bn}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>সূত্র:</strong> ব্যাস = 2 × ব্যাসার্ধ | পরিধি = 2πr = {Math.round(2 * Math.PI * radius)} | ক্ষেত্রফল = πr² = {Math.round(Math.PI * radius * radius)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}