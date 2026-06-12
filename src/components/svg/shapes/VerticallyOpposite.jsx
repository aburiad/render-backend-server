/**
 * VerticallyOpposite.jsx
 *
 * Displays two intersecting lines forming vertically opposite angles
 * Shows that vertically opposite angles are equal
 */

import React, { useState } from 'react';
import { getPointByAngle, createArcPath } from '@/utils/mathEngine';

export default function VerticallyOpposite({
  initialAngle = 35,
  showLabels = true,
  showProof = true,
  editable = false,
}) {
  const [angle, setAngle] = useState(initialAngle);

  // SVG center (intersection point)
  const cx = 150;
  const cy = 125;
  const lineLength = 100;

  // Calculate four endpoints for the two intersecting lines
  // Line 1: horizontal
  const p1 = { x: cx - lineLength, y: cy };
  const p2 = { x: cx + lineLength, y: cy };

  // Line 2: at the given angle
  const p3 = getPointByAngle(cx, cy, angle, lineLength);
  const p4 = getPointByAngle(cx, cy, angle + 180, lineLength);

  // Calculate the four angles (they're all equal in vertically opposite)
  // Angle 1: top-right
  const angle1 = angle;
  // Angle 2: top-left = 180 - angle1
  const angle2 = 180 - angle;
  // Angle 3: bottom-left = angle1 (vertically opposite)
  // Angle 4: bottom-right = angle2 (vertically opposite)

  // Arc paths for each angle
  const arcRadius = 28;
  const arc1Path = createArcPath(cx, cy, arcRadius, 0, angle);
  const arc2Path = createArcPath(cx, cy, arcRadius, angle, 180);
  const arc3Path = createArcPath(cx, cy, arcRadius, 180, 180 + angle);
  const arc4Path = createArcPath(cx, cy, arcRadius, 180 + angle, 360);

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 250" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-vertical" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-vertical)" />

        {/* Two intersecting lines */}
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#374151" strokeWidth="3" />
        <line x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#7c3aed" strokeWidth="3" />

        {/* Intersection point */}
        <circle cx={cx} cy={cy} r="5" fill="#dc2626" />
        <text x={cx - 15} y={cy + 20} fontSize="14" fill="#dc2626" fontWeight="bold">O</text>

        {/* Angle arcs with same colors for equal angles */}
        {/* Angle 1 (α) and Angle 3 are equal - vertically opposite */}
        <path d={arc1Path} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="2" fillOpacity="0.3" />
        <path d={arc3Path} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="2" fillOpacity="0.3" />

        {/* Angle 2 (β) and Angle 4 are equal - vertically opposite */}
        <path d={arc2Path} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" fillOpacity="0.3" />
        <path d={arc4Path} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" fillOpacity="0.3" />

        {/* Angle labels */}
        <text x={cx + 45} y={cy - 15} fontSize="14" fill="#ef4444" fontWeight="bold">α</text>
        <text x={cx - 55} y={cy - 15} fontSize="14" fill="#10b981" fontWeight="bold">β</text>
        <text x={cx - 55} y={cy + 25} fontSize="14" fill="#ef4444" fontWeight="bold">α</text>
        <text x={cx + 45} y={cy + 25} fontSize="14" fill="#10b981" fontWeight="bold">β</text>

        {/* Point labels */}
        {showLabels && (
          <>
            <text x={p2.x - 10} y={p2.y - 10} fontSize="14" fill="#374151" fontWeight="bold">A</text>
            <text x={p1.x + 10} y={p1.y - 10} fontSize="14" fill="#374151" fontWeight="bold">B</text>
            <text x={p3.x + 10} y={p3.y - 5} fontSize="14" fill="#7c3aed" fontWeight="bold">C</text>
            <text x={p4.x + 10} y={p4.y - 5} fontSize="14" fill="#7c3aed" fontWeight="bold">D</text>
          </>
        )}

        {/* Title */}
        <text x={150} y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          বিপ্রতীপ কোণ
        </text>
        <text x={150} y="230" fontSize="12" fill="#9ca3af" textAnchor="middle">
          Vertically Opposite Angles
        </text>

        {/* Proof statement */}
        {showProof && (
          <g transform="translate(150, 210)">
            <text fontSize="13" fill="#6b7280" textAnchor="middle">
              α = α (বিপ্রতীপ কোণ সমান)
            </text>
          </g>
        )}
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            কোণের মান নির্ধারণ করুন:
          </label>
          <input
            type="range"
            min="10"
            max="80"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10°</span>
            <div className="flex gap-4">
              <span className="font-bold text-red-500">α = {angle}°</span>
              <span className="font-bold text-emerald-500">β = {180 - angle}°</span>
            </div>
            <span>80°</span>
          </div>

          {/* Explanation box */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>বিপ্রতীপ কোণের ধর্ম:</strong> দুটি রেখা পরস্পরকে ছেদ করলে, যে কোণগুলোর মুখোমুখি থাকে সেগুলো পরস্পর সমান হয়।
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
