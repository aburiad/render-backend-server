/**
 * NetDiagram.jsx
 *
 * Displays the "net" or unfolded view of 3D objects
 * Shows how 3D objects look when their surfaces are laid flat
 */

import React, { useState } from 'react';

export default function NetDiagram({
  type = 'cube', // 'cube', 'cuboid', 'cylinder', 'cone'
  showLabels = true,
  showFoldLines = true,
  editable = false,
}) {
  const cx = 150;
  const cy = 145;
  const size = 50;

  const typeInfo = {
    cube: {
      bn: 'Net of Cube',
      en: '6 squares',
      description: '৬টি বর্গ - ভাজ করলে ঘনক হয়',
    },
    cuboid: {
      bn: 'Net of Cuboid',
      en: '6 rectangles',
      description: '৬টি আয়তক্ষেত্র - ভাজ করলে আবদ্ধ ঘনবস্তু হয়',
    },
    cylinder: {
      bn: 'Net of Cylinder',
      en: '2 circles + 1 rectangle',
      description: '২টি বৃত্ত ও ১টি আয়তক্ষেত্র',
    },
    cone: {
      bn: 'Net of Cone',
      en: '1 circle + 1 sector',
      description: '১টি বৃত্ত ও ১টি চাপাকৃতি অংশ',
    },
  };

  const info = typeInfo[type];

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 280" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-net" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-net)" />

        {type === 'cube' && (
          <>
            {/* Cross pattern for cube net */}
            {/* Center square */}
            <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
            {/* Top square */}
            <rect x={cx - size / 2} y={cy - size * 1.5} width={size} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Bottom square */}
            <rect x={cx - size / 2} y={cy + size / 2} width={size} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Left square */}
            <rect x={cx - size * 1.5} y={cy - size / 2} width={size} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Right square */}
            <rect x={cx + size / 2} y={cy - size / 2} width={size} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Top flap square */}
            <rect x={cx - size / 2} y={cy - size * 2.5} width={size} height={size} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" strokeDasharray={showFoldLines ? '4,4' : 'none'} />

            {/* Fold lines */}
            {showFoldLines && (
              <>
                <line x1={cx - size / 2} y1={cy - size} x2={cx + size / 2} y2={cy - size} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1={cx - size / 2} y1={cy} x2={cx + size / 2} y2={cy} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1={cx} y1={cy - size * 1.5} x2={cx} y2={cy - size / 2} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1={cx} y1={cy + size / 2} x2={cx} y2={cy + size} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,4" />
              </>
            )}
          </>
        )}

        {type === 'cuboid' && (
          <>
            {/* T pattern for cuboid net */}
            {/* Center rectangle */}
            <rect x={cx - size * 0.8} y={cy - size * 0.5} width={size * 1.6} height={size} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
            {/* Top rectangle */}
            <rect x={cx - size * 0.8} y={cy - size * 1.5} width={size * 1.6} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Bottom rectangle */}
            <rect x={cx - size * 0.8} y={cy + size / 2} width={size * 1.6} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Left square */}
            <rect x={cx - size * 1.8} y={cy - size * 0.5} width={size} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
            {/* Right square */}
            <rect x={cx + size * 0.8} y={cy - size * 0.5} width={size} height={size} fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
          </>
        )}

        {type === 'cylinder' && (
          <>
            {/* Rectangle in middle */}
            <rect x={cx - size * 1.2} y={cy - size * 0.8} width={size * 2.4} height={size * 1.6} fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
            <text x={cx} y={cy} fontSize="12" fill="#b45309" textAnchor="middle" fontWeight="bold">
              পার্শ্ব তল
            </text>

            {/* Circle on left */}
            <circle cx={cx - size * 2} cy={cy} r={size * 0.8} fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
            <text x={cx - size * 2} y={cy + 4} fontSize="10" fill="#b45309" textAnchor="middle">ঊর্ধ্ব তল</text>

            {/* Circle on right */}
            <circle cx={cx + size * 2} cy={cy} r={size * 0.8} fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
            <text x={cx + size * 2} y={cy + 4} fontSize="10" fill="#b45309" textAnchor="middle">নিম্ন তল</text>
          </>
        )}

        {type === 'cone' && (
          <>
            {/* Sector (partial circle for cone surface) */}
            <path d={`M ${cx + 40} ${cy} L ${cx + 40} ${cy - 70} A 75 75 0 1 1 ${cx + 40} ${cy + 70} Z`}
              fill="rgba(244, 63, 94, 0.2)" stroke="#ec4899" strokeWidth="2" />
            <text x={cx + 80} y={cy} fontSize="11" fill="#be185d" fontWeight="bold">
              তল (চাপাকৃতি)
            </text>

            {/* Circle (base) */}
            <circle cx={cx - 60} cy={cy} r={35} fill="rgba(244, 63, 94, 0.2)" stroke="#ec4899" strokeWidth="2" />
            <text x={cx - 60} y={cy + 4} fontSize="11" fill="#be185d" textAnchor="middle">ভূমি</text>

            {/* Connecting arrow showing fold */}
            <path d={`M ${cx - 20} ${cy} Q ${cx + 10} ${cy - 30} ${cx + 40} ${cy - 20}`} fill="none" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrow)" />
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
              </marker>
            </defs>
          </>
        )}

        {/* Title */}
        <text x="150" y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          {info.bn}
        </text>
        <text x="150" y="265" fontSize="12" fill="#9ca3af" textAnchor="middle">
          {info.en}
        </text>
        <text x="150" y="50" fontSize="11" fill="#6b7280" textAnchor="middle">
          {info.description}
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">নেটের ধরন:</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(typeInfo).map((t) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  type === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {typeInfo[t].bn.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>নেট:</strong> ৩ডি বস্তুর সব তল একসাথে বের করলে যা পাওয়া যায় তাই নেট। এটি ভাজ করলে আবার ৩ডি আকার হয়।
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
