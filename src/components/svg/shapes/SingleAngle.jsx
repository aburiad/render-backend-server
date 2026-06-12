/**
 * SingleAngle.jsx
 *
 * Displays a single angle with adjustable degree (0-180°)
 * Shows angle type name automatically (acute, right, obtuse, straight)
 */

import React, { useState } from 'react';
import { getPointByAngle, createArcPath } from '@/utils/mathEngine';

export default function SingleAngle({
  initialAngle = 45,
  showLabel = true,
  showValue = true,
  editable = false,
  armLength = 100,
}) {
  const [angle, setAngle] = useState(initialAngle);

  // SVG center point
  const cx = 150;
  const cy = 150;

  // Calculate endpoint of first arm (always horizontal to the right)
  const arm1End = { x: cx + armLength, y: cy };

  // Calculate endpoint of second arm based on angle
  const arm2End = getPointByAngle(cx, cy, angle, armLength);

  // Determine angle type
  const getAngleType = (deg) => {
    if (deg === 90) return { name: 'সমকোণ', en: 'Right Angle' };
    if (deg === 180) return { name: 'সরলকোণ', en: 'Straight Angle' };
    if (deg < 90) return { name: 'সূক্ষ্মকোণ', en: 'Acute Angle' };
    if (deg > 90 && deg < 180) return { name: 'স্থূলকোণ', en: 'Obtuse Angle' };
    if (deg > 180) return { name: 'প্রবৃদ্ধ কোণ', en: 'Reflex Angle' };
    return { name: 'কোণ', en: 'Angle' };
  };

  const angleType = getAngleType(angle);

  // Calculate arc path (smaller arc for angle visualization)
  const arcRadius = 30;
  const arcPath = createArcPath(cx, cy, arcRadius, 0, Math.min(angle, 180));

  // Right angle marker for 90°
  const rightAngleMarker = angle === 90 ? (
    <rect
      x={cx}
      y={cy - 20}
      width={20}
      height={20}
      fill="none"
      stroke="#6366f1"
      strokeWidth="2"
    />
  ) : null;

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 250" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Grid (optional, for reference) */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Angle arms */}
        <line x1={cx} y1={cy} x2={arm1End.x} y2={arm1End.y} stroke="#1e40af" strokeWidth="3" markerEnd="url(#arrow)" />
        <line x1={cx} y1={cy} x2={arm2End.x} y2={arm2End.y} stroke="#7c3aed" strokeWidth="3" markerEnd="url(#arrow2)" />

        {/* Arrow markers */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#1e40af" />
          </marker>
          <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#7c3aed" />
          </marker>
        </defs>

        {/* Arc showing the angle */}
        <path d={arcPath} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" fillOpacity="0.3" />

        {/* Right angle marker */}
        {rightAngleMarker}

        {/* Vertex point */}
        <circle cx={cx} cy={cy} r="5" fill="#dc2626" />
        <text x={cx - 15} y={cy + 20} fontSize="14" fill="#dc2626" fontWeight="bold">O</text>

        {/* Labels */}
        {showLabel && (
          <>
            <text x={arm1End.x - 10} y={arm1End.y + 20} fontSize="14" fill="#1e40af" fontWeight="bold">A</text>
            <text x={arm2End.x + 10} y={arm2End.y} fontSize="14" fill="#7c3aed" fontWeight="bold">B</text>
          </>
        )}

        {/* Angle value */}
        {showValue && (
          <text x={cx + 40} y={cy - 40} fontSize="16" fill="#4b5563" fontWeight="bold">
            {angle}°
          </text>
        )}

        {/* Angle type label */}
        <text x={150} y={30} fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          {angleType.name}
        </text>
        <text x={150} y={230} fontSize="12" fill="#9ca3af" textAnchor="middle">
          {angleType.en}
        </text>
      </svg>

      {/* Interactive slider */}
      {editable && (
        <div className="mt-4 px-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            কোণের মান নির্ধারণ করুন:
          </label>
          <input
            type="range"
            min="0"
            max="180"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0°</span>
            <span className="font-bold text-indigo-600">{angle}°</span>
            <span>180°</span>
          </div>
        </div>
      )}
    </div>
  );
}
