/**
 * CylinderCone.jsx
 *
 * Displays 3D cylinder (বেলন) and cone (কোণক) with labeled dimensions
 * Toggle between cylinder and cone views
 */

import React, { useState } from 'react';

export default function CylinderCone({
  type = 'cylinder', // 'cylinder' or 'cone'
  radius = 50,
  height = 100,
  showLabels = true,
  editable = false,
}) {
  const cx = 150;
  const cy = 150;
  const r = radius;
  const h = height;

  // Cylinder components
  const cylinderTopCy = cy - h / 2;
  const cylinderBottomCy = cy + h / 2;

  // Cone components
  const coneApex = { x: cx, y: cy - h / 2 };
  const coneBaseCy = cy + h / 2;

  const typeInfo = {
    cylinder: {
      bn: 'Cylinder',
      en: 'Cylinder',
      formula: 'আয়তন = πr²h | পার্শ্ব তল = 2πrh',
    },
    cone: {
      bn: 'Cone',
      en: 'Cone',
      formula: 'আয়তন = ⅓πr²h | তল = πr(r + l), l = অতিপাত',
    },
  };

  const info = typeInfo[type];

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 290" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-cyl" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-cyl)" />

        {type === 'cylinder' ? (
          <>
            {/* Cylinder Top Ellipse */}
            <ellipse cx={cx} cy={cylinderTopCy} rx={r} ry={r * 0.3} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" />

            {/* Cylinder Body */}
            <rect x={cx - r} y={cylinderTopCy} width={r * 2} height={h} fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="2" />

            {/* Cylinder Bottom Ellipse (front half only, for 3D effect) */}
            <path d={`M ${cx - r} ${cylinderBottomCy} A ${r} ${r * 0.3} 0 0 0 ${cx + r} ${cylinderBottomCy}`} fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" strokeWidth="2" />

            {/* Top diameter line */}
            <line x1={cx - r} y1={cylinderTopCy} x2={cx + r} y2={cylinderTopCy} stroke="#3b82f6" strokeWidth="2" />
            <text x={cx} y={cylinderTopCy - 10} fontSize="12" fill="#3b82f6" textAnchor="middle">r</text>

            {/* Height indicator */}
            <line x1={cx + r + 15} y1={cylinderTopCy} x2={cx + r + 15} y2={cylinderBottomCy} stroke="#10b981" strokeWidth="2" />
            <line x1={cx + r + 10} y1={cylinderTopCy} x2={cx + r + 20} y2={cylinderTopCy} stroke="#10b981" strokeWidth="2" />
            <line x1={cx + r + 10} y1={cylinderBottomCy} x2={cx + r + 20} y2={cylinderBottomCy} stroke="#10b981" strokeWidth="2" />
            <text x={cx + r + 25} y={cy} fontSize="12" fill="#10b981">h</text>
          </>
        ) : (
          <>
            {/* Cone Apex */}
            <circle cx={coneApex.x} cy={coneApex.y} r="5" fill="#dc2626" />

            {/* Cone Body */}
            <path d={`M ${coneApex.x} ${coneApex.y} L ${cx - r} ${coneBaseCy} A ${r} ${r * 0.3} 0 0 1 ${cx + r} ${coneBaseCy} Z`}
              fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" />

            {/* Cone Base Ellipse */}
            <ellipse cx={cx} cy={coneBaseCy} rx={r} ry={r * 0.3} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />

            {/* Base diameter line */}
            <line x1={cx - r} y1={coneBaseCy} x2={cx + r} y2={coneBaseCy} stroke="#3b82f6" strokeWidth="2" />
            <text x={cx} y={coneBaseCy + 20} fontSize="12" fill="#3b82f6" textAnchor="middle">2r</text>

            {/* Height indicator */}
            <line x1={cx + r + 15} y1={coneApex.y} x2={cx + r + 15} y2={coneBaseCy} stroke="#10b981" strokeWidth="2" />
            <line x1={cx + r + 10} y1={coneApex.y} x2={cx + r + 20} y2={coneApex.y} stroke="#10b981" strokeWidth="2" />
            <line x1={cx + r + 10} y1={coneBaseCy} x2={cx + r + 20} y2={coneBaseCy} stroke="#10b981" strokeWidth="2" />
            <text x={cx + r + 25} y={cy} fontSize="12" fill="#10b981">h</text>

            {/* Slant height (l) */}
            <line x1={coneApex.x} y1={coneApex.y} x2={cx - r} y2={coneBaseCy} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
            <text x={coneApex.x - r + 10} y={cy - 10} fontSize="12" fill="#f59e0b">l</text>
          </>
        )}

        {/* Title */}
        <text x="150" y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          {info.bn}
        </text>
        <text x="150" y="275" fontSize="11" fill="#9ca3af" textAnchor="middle">
          {info.formula}
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === 'cylinder'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              বেলন (Cylinder)
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === 'cone'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              কোণক (Cone)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ব্যাসার্ধ (r):
              </label>
              <input
                type="range"
                min="30"
                max="70"
                value={radius}
                onChange={() => {}}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{radius} units</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                উচ্চতা (h):
              </label>
              <input
                type="range"
                min="60"
                max="130"
                value={height}
                onChange={() => {}}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{height} units</div>
            </div>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{info.formula}</p>
          </div>
        </div>
      )}
    </div>
  );
}
