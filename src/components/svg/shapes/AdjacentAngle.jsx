/**
 * AdjacentAngle.jsx
 *
 * Displays two adjacent angles that sum to 90° (complementary) or 180° (supplementary)
 * Shows angle types and calculations
 */

import React, { useState } from 'react';
import { getPointByAngle, createArcPath } from '@/utils/mathEngine';

export default function AdjacentAngle({
  mode: initialMode = 'complementary', // 'complementary' (90°), 'supplementary' (180°), or 'bisector'
  initialAngle1 = 30,
  showLabels = true,
  showCalculation = true,
  editable = false,
}) {
  // mode is seeded from prop but lives in local state so the toggle buttons
  // can switch between পূরক / সম্পূরক in-editor.
  const [mode, setMode] = useState(initialMode);
  const [angle1, setAngle1] = useState(initialAngle1);

  // Switching modes can leave angle1 outside the new range
  // (e.g. 150° valid for supplementary but invalid for complementary).
  // Clamp it on every mode change.
  const switchMode = (next) => {
    setMode(next);
    if (next === 'complementary' && angle1 > 90) setAngle1(60);
  };

  // Calculate angle2 based on mode
  const angle2 = mode === 'complementary' ? 90 - angle1 : 180 - angle1;

  // SVG center
  const cx = 150;
  const cy = 140;
  const armLength = 100;

  // Calculate endpoints
  const arm1End = getPointByAngle(cx, cy, 0, armLength);
  const arm2End = getPointByAngle(cx, cy, angle1, armLength);
  const arm3End = getPointByAngle(cx, cy, 180, armLength);

  // Arc paths for both angles
  const arc1Path = createArcPath(cx, cy, 35, 0, angle1);
  const arc2Path = createArcPath(cx, cy, 35, angle1, 180);

  // Angle type for angle1
  const getAngleType = (deg) => {
    if (deg === 90) return 'সমকোণ';
    if (deg < 90) return 'সূক্ষ্মকোণ';
    return 'স্থূলকোণ';
  };

  const modeLabels = {
    complementary: {
      bn: 'পূরক কোণ',
      en: 'Complementary Angles',
      formula: '∠A + ∠B = 90°',
      color1: '#10b981',
      color2: '#3b82f6',
    },
    supplementary: {
      bn: 'সম্পূরক কোণ',
      en: 'Supplementary Angles',
      formula: '∠A + ∠B = 180°',
      color1: '#f59e0b',
      color2: '#ef4444',
    },
    bisector: {
      bn: 'কোণ দ্বিখণ্ডক',
      en: 'Angle Bisector',
      formula: '∠AOB = ∠BOC (OB দ্বিখণ্ডক)',
      color1: '#8b5cf6',
      color2: '#8b5cf6',
    },
    adjacent: {
      // Adjacent angles on a straight line (linear pair) — same math as
      // supplementary but with the সন্নিহিত title preserved.
      bn: 'সন্নিহিত কোণ',
      en: 'Adjacent Angles',
      formula: '∠AOB + ∠BOC = 180° (linear pair)',
      color1: '#3b82f6',
      color2: '#ef4444',
    },
  };

  const labels = modeLabels[mode] || modeLabels.supplementary;

  // Bisector mode: show angle split into two equal halves
  // angle1 state (20–160) is used as the full angle; bisector is at half
  if (mode === 'bisector') {
    const totalAngle = Math.max(20, Math.min(160, angle1))
    const bisAngle = totalAngle / 2
    const arm1End = getPointByAngle(cx, cy, 0, armLength)
    const bisEnd  = getPointByAngle(cx, cy, bisAngle, armLength)
    const arm3End = getPointByAngle(cx, cy, totalAngle, armLength)
    return (
      <div className="w-full">
        <svg viewBox="0 0 300 250" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
          <text x="150" y="25" fontSize="14" fill="#374151" fontWeight="bold" textAnchor="middle">কোণ দ্বিখণ্ডক</text>
          <text x="150" y="40" fontSize="11" fill="#9ca3af" textAnchor="middle">Angle Bisector Construction</text>
          {/* Two equal angles */}
          <line x1={cx} y1={cy} x2={arm1End.x} y2={arm1End.y} stroke="#374151" strokeWidth="2.5" />
          <line x1={cx} y1={cy} x2={arm3End.x} y2={arm3End.y} stroke="#374151" strokeWidth="2.5" />
          {/* Bisector in dashed purple */}
          <line x1={cx} y1={cy} x2={bisEnd.x} y2={bisEnd.y} stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="6,3" />
          {/* Equal arc markers */}
          <path d={createArcPath(cx, cy, 32, 0, bisAngle)} fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.5" />
          <path d={createArcPath(cx, cy, 32, bisAngle, totalAngle)} fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.5" />
          {/* Tick marks on bisector */}
          <text x={getPointByAngle(cx, cy, bisAngle / 2, 48).x - 4} y={getPointByAngle(cx, cy, bisAngle / 2, 48).y + 4} fontSize="11" fill="#8b5cf6" fontWeight="bold">α</text>
          <text x={getPointByAngle(cx, cy, bisAngle + bisAngle / 2, 48).x - 4} y={getPointByAngle(cx, cy, bisAngle + bisAngle / 2, 48).y + 4} fontSize="11" fill="#8b5cf6" fontWeight="bold">α</text>
          {/* Labels */}
          <text x={arm1End.x + 8} y={arm1End.y + 5} fontSize="12" fill="#374151" fontWeight="bold">A</text>
          <text x={bisEnd.x + 6} y={bisEnd.y - 8} fontSize="12" fill="#8b5cf6" fontWeight="bold">B</text>
          <text x={arm3End.x - 6} y={arm3End.y - 12} fontSize="12" fill="#374151" fontWeight="bold">C</text>
          <text x={cx - 12} y={cy + 14} fontSize="12" fill="#374151" fontWeight="bold">O</text>
          <circle cx={cx} cy={cy} r="4" fill="#374151" />
          <text x="150" y="220" fontSize="11" fill="#8b5cf6" fontWeight="bold" textAnchor="middle">OB কোণ AOC-এর দ্বিখণ্ডক</text>
          <text x="150" y="235" fontSize="11" fill="#374151" textAnchor="middle">∠AOB = ∠BOC = α</text>
        </svg>
        {editable && (
          <div className="mt-3 px-4">
            <label className="block text-xs font-semibold text-gray-600">পূর্ণ কোণ: {angle1}° (দ্বিখণ্ডক: {Math.round(angle1/2)}°)</label>
            <input type="range" min="20" max="160" value={angle1} onChange={e => setAngle1(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 250" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-adjacent" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-adjacent)" />

        {/* Horizontal base line */}
        <line x1={cx - armLength} y1={cy} x2={cx + armLength} y2={cy} stroke="#374151" strokeWidth="3" />

        {/* Middle ray */}
        <line x1={cx} y1={cy} x2={arm2End.x} y2={arm2End.y} stroke="#7c3aed" strokeWidth="3" />

        {/* Vertex point */}
        <circle cx={cx} cy={cy} r="5" fill="#dc2626" />

        {/* Angle arcs with different colors */}
        <path d={arc1Path} fill={labels.color1} fillOpacity="0.3" stroke={labels.color1} strokeWidth="2" />
        <path d={arc2Path} fill={labels.color2} fillOpacity="0.3" stroke={labels.color2} strokeWidth="2" />

        {/* Angle values */}
        <text x={cx + 50} y={cy - 15} fontSize="14" fill={labels.color1} fontWeight="bold">
          {angle1}°
        </text>
        <text x={cx - 60} y={cy - 15} fontSize="14" fill={labels.color2} fontWeight="bold">
          {angle2}°
        </text>

        {/* Point labels */}
        {showLabels && (
          <>
            <text x={cx + armLength - 10} y={cy + 25} fontSize="14" fill="#374151" fontWeight="bold">A</text>
            <text x={arm2End.x + 10} y={arm2End.y} fontSize="14" fill="#7c3aed" fontWeight="bold">B</text>
            <text x={cx - armLength + 10} y={cy + 25} fontSize="14" fill="#374151" fontWeight="bold">C</text>
            <text x={cx - 15} y={cy + 20} fontSize="14" fill="#dc2626" fontWeight="bold">O</text>
          </>
        )}

        {/* Title */}
        <text x={150} y={30} fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          {labels.bn}
        </text>
        <text x={150} y={230} fontSize="12" fill="#9ca3af" textAnchor="middle">
          {labels.en}
        </text>

        {/* Calculation */}
        {showCalculation && (
          <text x={150} y={210} fontSize="13" fill="#6b7280" textAnchor="middle">
            {labels.formula}
          </text>
        )}
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ∠A এর মান নির্ধারণ করুন:
          </label>
          <input
            type="range"
            min={mode === 'complementary' ? 0 : 0}
            max={mode === 'complementary' ? 90 : 180}
            value={angle1}
            onChange={(e) => setAngle1(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0°</span>
            <div className="flex gap-4">
              <span className="font-bold" style={{ color: labels.color1 }}>
                ∠A = {angle1}°
              </span>
              <span className="font-bold" style={{ color: labels.color2 }}>
                ∠B = {angle2}°
              </span>
              <span className="font-bold text-gray-700">
                যোগফল = {mode === 'complementary' ? 90 : 180}°
              </span>
            </div>
            <span>{mode === 'complementary' ? '90°' : '180°'}</span>
          </div>

          {/* Mode toggle */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => switchMode('complementary')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'complementary'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              পূরক কোণ (90°)
            </button>
            <button
              type="button"
              onClick={() => switchMode('supplementary')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'supplementary'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              সম্পূরক কোণ (180°)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
