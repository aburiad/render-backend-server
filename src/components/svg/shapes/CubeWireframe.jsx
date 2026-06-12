/**
 * CubeWireframe.jsx
 *
 * Displays a 3D cube/cuboid wireframe with labeled vertices, edges, and faces
 * Shows perspective projection
 */

import React, { useState } from 'react';

export default function CubeWireframe({
  width = 100,
  height = 80,
  depth = 60,
  showLabels = true,
  showAll = true, // Show all labels (vertices, edges, faces)
  editable = false,
}) {
  // 3D to 2D projection
  const cx = 150;
  const cy = 140;

  // Front face vertices
  const front = {
    A: { x: cx - width / 2, y: cy + height / 2 },
    B: { x: cx + width / 2, y: cy + height / 2 },
    C: { x: cx + width / 2, y: cy - height / 2 },
    D: { x: cx - width / 2, y: cy - height / 2 },
  };

  // Back face vertices (with depth offset)
  const depthOffset = depth;
  const back = {
    E: { x: front.A.x - depthOffset * 0.3, y: front.A.y - depthOffset * 0.3 },
    F: { x: front.B.x - depthOffset * 0.3, y: front.B.y - depthOffset * 0.3 },
    G: { x: front.C.x - depthOffset * 0.3, y: front.C.y - depthOffset * 0.3 },
    H: { x: front.D.x - depthOffset * 0.3, y: front.D.y - depthOffset * 0.3 },
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 270" className="w-full h-auto border border-gray-200 rounded-lg bg-white">
        {/* Background grid */}
        <defs>
          <pattern id="grid-cube" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-cube)" />

        {/* Back face (dotted) */}
        <polygon
          points={`${back.E.x},${back.E.y} ${back.F.x},${back.F.y} ${back.G.x},${back.G.y} ${back.H.x},${back.H.y}`}
          fill="rgba(99, 102, 241, 0.05)"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Connecting edges (dotted) */}
        <line x1={front.A.x} y1={front.A.y} x2={back.E.x} y2={back.E.y} stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
        <line x1={front.B.x} y1={front.B.y} x2={back.F.x} y2={back.F.y} stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
        <line x1={front.C.x} y1={front.C.y} x2={back.G.x} y2={back.G.y} stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
        <line x1={front.D.x} y1={front.D.y} x2={back.H.x} y2={back.H.y} stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />

        {/* Front face */}
        <polygon
          points={`${front.A.x},${front.A.y} ${front.B.x},${front.B.y} ${front.C.x},${front.C.y} ${front.D.x},${front.D.y}`}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="#6366f1"
          strokeWidth="3"
        />

        {/* Vertex points */}
        {showLabels && (
          <>
            {/* Front vertices */}
            {[{ v: front.A, l: 'A', ox: -10, oy: 15 }, { v: front.B, l: 'B', ox: 10, oy: 15 },
              { v: front.C, l: 'C', ox: 10, oy: -10 }, { v: front.D, l: 'D', ox: -10, oy: -10 }].map((p) => (
              <circle key={p.l} cx={p.v.x} cy={p.v.y} r="4" fill="#dc2626" />
            ))}
            {[{ v: front.A, l: 'A', ox: -10, oy: 15 }, { v: front.B, l: 'B', ox: 10, oy: 15 },
              { v: front.C, l: 'C', ox: 10, oy: -10 }, { v: front.D, l: 'D', ox: -10, oy: -10 }].map((p) => (
              <text key={`t-${p.l}`} x={p.v.x + p.ox} y={p.v.y + p.oy} fontSize="12" fill="#dc2626" fontWeight="bold">
                {p.l}
              </text>
            ))}

            {/* Back vertices */}
            {[{ v: back.E, l: 'E', ox: -10, oy: 15 }, { v: back.F, l: 'F', ox: 10, oy: 15 },
              { v: back.G, l: 'G', ox: 10, oy: -10 }, { v: back.H, l: 'H', ox: -10, oy: -10 }].map((p) => (
              <circle key={p.l} cx={p.v.x} cy={p.v.y} r="4" fill="#9ca3af" />
            ))}
            {[{ v: back.E, l: 'E', ox: -10, oy: 15 }, { v: back.F, l: 'F', ox: 10, oy: 15 },
              { v: back.G, l: 'G', ox: 10, oy: -10 }, { v: back.H, l: 'H', ox: -10, oy: -10 }].map((p) => (
              <text key={`t-${p.l}`} x={p.v.x + p.ox} y={p.v.y + p.oy} fontSize="11" fill="#9ca3af" fontWeight="bold">
                {p.l}
              </text>
            ))}
          </>
        )}

        {/* Face labels */}
        {showAll && (
          <>
            <text x={cx} y={cy + 5} fontSize="11" fill="#6366f1" textAnchor="middle" fontWeight="bold">
              ABCD (সম্মুখের তল)
            </text>
            <text x={cx - depthOffset * 0.15} y={cy - height / 2 - 15} fontSize="10" fill="#9ca3af" textAnchor="middle">
              EFGH (পশ্চাতের তল)
            </text>
          </>
        )}

        {/* Title */}
        <text x="150" y="30" fontSize="18" fill="#374151" fontWeight="bold" textAnchor="middle">
          ঘনক / আবদ্ধ ঘনবস্তু
        </text>
        <text x="150" y="255" fontSize="12" fill="#9ca3af" textAnchor="middle">
          Cube / Cuboid Wireframe
        </text>
      </svg>

      {/* Interactive controls */}
      {editable && (
        <div className="mt-4 px-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">দৈর্ঘ্য (l)</label>
              <input
                type="range"
                min="60"
                max="130"
                value={width}
                onChange={() => {}}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{width}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">প্রস্থ (w)</label>
              <input
                type="range"
                min="50"
                max="100"
                value={height}
                onChange={() => {}}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{height}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">উচ্চতা (h)</label>
              <input
                type="range"
                min="30"
                max="80"
                value={depth}
                onChange={() => {}}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-xs text-gray-500 text-center mt-1">{depth}</div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>ঘনক:</strong> ৬টি তল, ১২টি ধার, ৮টি শীর্ষবিন্দু | আয়তন = l × w × h
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
