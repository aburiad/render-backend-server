/**
 * LineSegment.jsx
 *
 * Displays line segment, ray, and line with labeled endpoints
 * Interactive controls for length and type
 */

import React, { useState } from 'react';
import { getPointByAngle } from '@/utils/mathEngine';

export default function LineSegment({
  type = 'segment', // 'segment', 'ray', 'line'
  initialLength = 120,
  showLength = true,
  showLabels = true,
  editable = false,
}) {
  const [length, setLength] = useState(initialLength);
  const [rayAngle, setRayAngle] = useState(0); // angle in degrees for ray/line

  // SVG coordinates
  const startX = 50;
  const startY = 125;

  // Calculate endpoint based on type
  const isAngle = type === 'ray' || type === 'line';
  const angle = isAngle ? rayAngle : 0;
  const angleRad = (angle * Math.PI) / 180;
  const endX = isAngle ? startX + length * Math.cos(angleRad) : startX + length;
  const endY = isAngle ? startY - length * Math.sin(angleRad) : startY;

  // Different representations based on type
  const renderLine = () => {
    switch (type) {
      case 'segment':
        return (
          <>
            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
            {/* Endpoint circles */}
            <circle cx={startX} cy={startY} r="6" fill="#dc2626" />
            <circle cx={endX} cy={endY} r="6" fill="#dc2626" />
          </>
        );

      case 'ray': {
        const dx = endX - startX, dy = endY - startY;
        const aLen = Math.sqrt(dx*dx + dy*dy) || 1;
        const ux = dx/aLen, uy = dy/aLen;
        const nx = -uy, ny = ux;
        return (
          <>
            {/* Ray: solid circle at start, arrow at end */}
            <circle cx={startX} cy={startY} r="6" fill="#dc2626" />
            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#1e40af" strokeWidth="4" />
            {/* Arrow head rotated to match direction */}
            <polygon
              points={`${endX},${endY} ${endX - ux*14 + nx*7},${endY - uy*14 + ny*7} ${endX - ux*14 - nx*7},${endY - uy*14 - ny*7}`}
              fill="#1e40af"
            />
          </>
        );
      }

      case 'line': {
        const dx = endX - startX, dy = endY - startY;
        const aLen = Math.sqrt(dx*dx + dy*dy) || 1;
        const ux = dx/aLen, uy = dy/aLen;
        const nx = -uy, ny = ux;
        const ext = 25; // extension beyond endpoints
        const lsx = startX - ux*ext, lsy = startY - uy*ext;
        const lex = endX + ux*ext, ley = endY + uy*ext;
        return (
          <>
            {/* Line: arrows at both ends, extending beyond */}
            <line x1={lsx} y1={lsy} x2={lex} y2={ley} stroke="#1e40af" strokeWidth="4" />
            {/* Arrow at start (pointing backward) */}
            <polygon
              points={`${lsx},${lsy} ${lsx + ux*14 + nx*7},${lsy + uy*14 + ny*7} ${lsx + ux*14 - nx*7},${lsy + uy*14 - ny*7}`}
              fill="#1e40af"
            />
            {/* Arrow at end (pointing forward) */}
            <polygon
              points={`${lex},${ley} ${lex - ux*14 + nx*7},${ley - uy*14 + ny*7} ${lex - ux*14 - nx*7},${ley - uy*14 - ny*7}`}
              fill="#1e40af"
            />
          </>
        );
      }

      default:
        return null;
    }
  };

  // Type labels in Bengali
  const typeLabels = {
    segment: { bn: 'রেখাংশ (Line Segment)', en: 'Line Segment' },
    ray: { bn: 'রশ্মি (Ray)', en: 'Ray — একটি প্রান্তবিন্দু ও একটি দিক', description: 'একটি বিন্দু থেকে একটি দিকে অনির্দিষ্টকাল বিস্তৃত' },
    line: { bn: 'সরলরেখা (Straight Line)', en: 'Straight Line — দুই দিকে অসীম', description: 'কোনো প্রান্তবিন্দু নেই, দুই দিকে অনির্দিষ্টকাল বিস্তৃত' },
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 200" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-linesegment" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-linesegment)" />

        {/* The line/ray/segment */}
        {renderLine()}

        {/* Point labels - positioned away from shapes */}
        {showLabels && type === 'segment' && (
          <>
            <text x={startX - 2} y={startY - 14} fontSize="11" fill="#dc2626" fontWeight="bold">A</text>
            <text x={endX - 2} y={endY - 14} fontSize="11" fill="#dc2626" fontWeight="bold">B</text>
          </>
        )}
        {showLabels && type === 'ray' && (
          <>
            <text x={startX - 2} y={startY - 14} fontSize="11" fill="#dc2626" fontWeight="bold">A</text>
            <text x={endX + 6} y={endY - 8} fontSize="11" fill="#dc2626" fontWeight="bold">B</text>
          </>
        )}

        {/* Line reference points */}
        {type === 'line' && (
          <>
            <circle cx={startX} cy={startY} r="3" fill="#dc2626" opacity="0.4" />
            <circle cx={endX} cy={endY} r="3" fill="#dc2626" opacity="0.4" />
            <text x={startX - 12} y={startY - 10} fontSize="10" fill="#dc2626" opacity="0.6">A</text>
            <text x={endX + 6} y={endY - 8} fontSize="10" fill="#dc2626" opacity="0.6">B</text>
          </>
        )}

        {/* Length label */}
        {showLength && (type === 'segment') && (
          <>
            <text x={(startX + endX) / 2} y={startY + 35} fontSize="11" fill="#4b5563" textAnchor="middle">
              AB = {length}
            </text>
            <line x1={startX} y1={startY + 10} x2={startX} y2={startY + 20} stroke="#9ca3af" strokeWidth="1.5" />
            <line x1={endX} y1={endY + 10} x2={endX} y2={endY + 20} stroke="#9ca3af" strokeWidth="1.5" />
          </>
        )}

        {/* Ray info */}
        {type === 'ray' && (
          <text x={(startX + endX) / 2} y={Math.max(startY, endY) + 35} fontSize="10" fill="#4b5563" textAnchor="middle">
            → {rayAngle}°
          </text>
        )}

        {/* Line info */}
        {type === 'line' && (
          <text x={(startX + endX) / 2} y={Math.max(startY, endY) + 35} fontSize="10" fill="#4b5563" textAnchor="middle">
            ↔ {rayAngle}°
          </text>
        )}

        {/* Type label */}
        <text x={150} y={20} fontSize="12" fill="#374151" fontWeight="bold" textAnchor="middle">
          {typeLabels[type].bn}
        </text>
        <text x={150} y={190} fontSize="9" fill="#9ca3af" textAnchor="middle">
          {typeLabels[type].en}
        </text>
      </svg>

      {/* Controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ধরন:</label>
            <div className="flex gap-2">
              {['segment', 'ray', 'line'].map((t) => (
                <button
                  key={t}
                  onClick={() => {}}
                  disabled
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    type === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {typeLabels[t].bn}
                </button>
              ))}
            </div>
          </div>

          {/* Length slider (for segment, ray, and line) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'ray' ? 'রশ্মির দৈর্ঘ্য:' : type === 'line' ? 'রেখার দৈর্ঘ্য:' : 'দৈর্ঘ্য:'}
            </label>
            <input
              type="range"
              min="40"
              max="200"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>40</span>
              <span className="font-bold text-indigo-600">{length} units</span>
              <span>200</span>
            </div>
          </div>

          {/* Angle slider (for ray and line) */}
          {(type === 'ray' || type === 'line') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                কোণ: {rayAngle}°
              </label>
              <input
                type="range"
                min="-60"
                max="60"
                value={rayAngle}
                onChange={(e) => setRayAngle(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-60°</span>
                <span className="font-bold text-blue-600">{rayAngle}°</span>
                <span>60°</span>
              </div>
            </div>
          )}

          {/* Info boxes */}
          {type === 'ray' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
              <p className="text-sm text-blue-800">
                <strong>রশ্মি (Ray):</strong> একটি বিন্দু থেকে শুরু হয়ে একটি দিকে অনির্দিষ্টকাল বিস্তৃত থাকে।
                এর একটি প্রান্তবিন্দু আছে কিন্তু শেষ নেই।
              </p>
            </div>
          )}
          {type === 'line' && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg mt-2">
              <p className="text-sm text-purple-800">
                <strong>সরলরেখা (Straight Line):</strong> দুই দিকে অসীমভাবে বিস্তৃত।
                এর কোনো প্রান্তবিন্দু নেই। দৈর্ঘ্য পরিমাপ করা যায় না।
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
