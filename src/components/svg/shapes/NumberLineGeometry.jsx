/**
 * NumberLineGeometry.jsx
 *
 * Displays an interactive number line for marking points and distances
 * Used for teaching geometric distance, integers, and coordinate concepts
 */

import React, { useState } from 'react';

export default function NumberLineGeometry({
  min: minProp = -10,
  max: maxProp = 10,
  marks = [0, 3, -4], // Points to mark on the line
  showDistance = true,
  showCoordinates = true,
  editable = false,
}) {
  const [minVal, setMinVal] = useState(minProp);
  const [maxVal, setMaxVal] = useState(maxProp);
  const [pointPositions, setPointPositions] = useState(marks);
  const [newPoint, setNewPoint] = useState('');
  const [hoverPoint, setHoverPoint] = useState(null);

  const min = minVal;
  const max = maxVal;

  const width = 260;
  const height = 100;
  const padding = 20;
  const lineY = 50;
  const range = max - min;
  const unitWidth = (width - padding * 2) / range;

  // Convert number to x position
  const numToX = (num) => {
    return padding + (num - min) * unitWidth;
  };

  // Generate tick marks
  const ticks = [];
  for (let i = min; i <= max; i++) {
    ticks.push(i);
  }

  // Calculate distance between two points
  const getDistanceLabel = (p1, p2) => {
    const dist = Math.abs(p2 - p1);
    return `${dist} একক`;
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 180" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background */}
        <rect width="100%" height="100%" fill="#fafafa" />

        {/* Title */}
        <text x="150" y="25" fontSize="16" fill="#374151" fontWeight="bold" textAnchor="middle">
          সংখ্যা রেখা (Number Line)
        </text>

        {/* Main horizontal line */}
        <line x1={padding} y1={lineY} x2={width - padding} y2={lineY} stroke="#374151" strokeWidth="3" />

        {/* Arrows at both ends */}
        <polygon points={`${width - padding + 8},${lineY} ${width - padding},${lineY - 5} ${width - padding},${lineY + 5}`} fill="#374151" />
        <polygon points={`${padding - 8},${lineY} ${padding},${lineY - 5} ${padding},${lineY + 5}`} fill="#374151" />

        {/* Tick marks and labels */}
        {ticks.map((tick) => {
          const x = numToX(tick);
          const isMajor = tick === 0 || tick % 5 === 0;
          return (
            <g key={tick}>
              <line x1={x} y1={lineY} x2={x} y2={lineY + (isMajor ? 12 : 6)} stroke={tick === 0 ? '#dc2626' : '#9ca3af'} strokeWidth={isMajor ? 2 : 1.5} />
              {isMajor && (
                <text x={x} y={lineY + 28} fontSize="11" fill={tick === 0 ? '#dc2626' : '#6b7280'} textAnchor="middle" fontWeight={tick === 0 ? 'bold' : 'normal'}>
                  {tick}
                </text>
              )}
            </g>
          );
        })}

        {/* Marked points */}
        {pointPositions.map((pos, idx) => {
          const x = numToX(pos);
          const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
          const color = colors[idx % colors.length];
          return (
            <g key={idx}>
              {/* Point circle */}
              <circle cx={x} cy={lineY} r="6" fill={color} stroke="#fff" strokeWidth="2" />
              {/* Point label above */}
              {showCoordinates && (
                <text x={x} y={lineY - 15} fontSize="13" fill={color} textAnchor="middle" fontWeight="bold">
                  {pos}
                </text>
              )}
            </g>
          );
        })}

        {/* Distance indicators */}
        {showDistance && pointPositions.length >= 2 && (
          <>
            {pointPositions.slice(0, -1).map((_, idx) => {
              const p1 = pointPositions[idx];
              const p2 = pointPositions[idx + 1];
              if (p1 === undefined || p2 === undefined) return null;

              const x1 = numToX(p1);
              const x2 = numToX(p2);
              const midX = (x1 + x2) / 2;
              const dist = Math.abs(p2 - p1);

              return (
                <g key={`dist-${idx}`}>
                  {/* Distance bracket */}
                  <path d={`M ${x1} ${lineY + 35} L ${x1} ${lineY + 40} L ${x2} ${lineY + 40} L ${x2} ${lineY + 35}`} fill="none" stroke="#10b981" strokeWidth="1.5" />
                  {/* Distance label */}
                  <text x={midX} y={lineY + 52} fontSize="11" fill="#10b981" textAnchor="middle" fontWeight="bold">
                    {dist}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Zero label emphasis */}
        <text x={numToX(0)} y={lineY - 28} fontSize="11" fill="#dc2626" textAnchor="middle" fontWeight="bold">
          0
        </text>

        {/* Direction labels */}
        <text x={width - padding - 15} y={lineY - 10} fontSize="10" fill="#9ca3af" textAnchor="middle">
          ধনাত্মক (+)
        </text>
        <text x={padding + 15} y={lineY - 10} fontSize="10" fill="#9ca3af" textAnchor="middle">
          ঋণাত্মক (-)
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ন্যূনতম:</label>
              <input
                type="number"
                value={min}
                onChange={(e) => { const v = Number(e.target.value); if (v < max) setMinVal(v); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">সর্বোচ্চ:</label>
              <input
                type="number"
                value={max}
                onChange={(e) => { const v = Number(e.target.value); if (v > min) setMaxVal(v); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ব্যবধান:</label>
              <input
                type="number"
                value={max - min}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500"
              />
            </div>
          </div>

          {/* Add point */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              বিন্দু চিহ্নিত করুন:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="সংখ্যা লিখুন..."
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Number(newPoint);
                    if (val >= min && val <= max && !isNaN(val)) {
                      setPointPositions([...pointPositions, val].sort((a, b) => a - b));
                      setNewPoint('');
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const val = Number(newPoint);
                  if (val >= min && val <= max && !isNaN(val)) {
                    setPointPositions([...pointPositions, val].sort((a, b) => a - b));
                    setNewPoint('');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                যোগ করুন
              </button>
            </div>
          </div>

          {/* Current points */}
          <div className="flex flex-wrap gap-2">
            {pointPositions.map((p, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {p}
                <button
                  onClick={() => setPointPositions(pointPositions.filter((_, i) => i !== idx))}
                  className="ml-2 text-indigo-400 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Info */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              <strong>ব্যবহার:</strong> দুটি বিন্দুর মধ্যবর্তী দূরত্ব = |x₂ - x₁| | সংখ্যা রেখা জ্যামিতিক দূরত্ব মাপতে ব্যবহৃত হয়
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
