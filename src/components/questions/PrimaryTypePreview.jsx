import { memo } from 'react'

/**
 * Shared mini SVG preview for all 17 primary question types.
 * viewBox is always "0 0 80 48"; pass width/height to scale.
 */
export const PrimaryTypePreview = memo(function PrimaryTypePreview({ id, width = 80, height = 48 }) {
  const VW = 80, VH = 48
  const vb = `0 0 ${VW} ${VH}`

  const line = (x1, y1, x2, y2, stroke = '#cbd5e1', sw = 1) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={sw} />
  )
  const box = (x, y, w, h, fill, stroke, rx = 1.5) => (
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={0.8} />
  )
  const t = (x, y, txt, size, fill, fw = '500') => (
    <text x={x} y={y} fontSize={size} fill={fill} fontWeight={fw} fontFamily="sans-serif">{txt}</text>
  )

  const map = {

    primary_passage: (
      <svg viewBox={vb} width={width} height={height}>
        {box(3, 2, 74, 18, '#f0fdf4', '#86efac', 2)}
        {[7,12,17].map(y => <rect key={y} x={7} y={y} width={[58,44,52][Math.floor((y-7)/5)]} height={1.5} rx={1} fill="#4ade80"/>)}
        {[25,32,39].map((y, i) => (
          <g key={y}>
            {t(3, y+2, `${i+1}.`, 5.5, '#15803d', '700')}
            <rect x={13} y={y} width={58} height={2} rx={1} fill="#bbf7d0"/>
          </g>
        ))}
      </svg>
    ),

    primary_cq: (
      <svg viewBox={vb} width={width} height={height}>
        {box(3, 1, 74, 14, '#f0fdf4', '#86efac', 2)}
        {[5,9,13].map(y => <rect key={y} x={7} y={y} width={[56,42,50][Math.floor((y-5)/4)]} height={1.5} rx={1} fill="#4ade80"/>)}
        {['ক','খ','গ','ঘ'].map((l, i) => (
          <g key={l}>
            {t(3, 19+i*8, `${l}.`, 6, '#15803d', '700')}
            <rect x={13} y={17+i*8} width={58} height={2} rx={1} fill="#bbf7d0"/>
          </g>
        ))}
      </svg>
    ),

    primary_science_cq: (
      <svg viewBox={vb} width={width} height={height}>
        {box(3, 1, 74, 16, '#ecfdf5', '#6ee7b7', 2)}
        {t(7, 8, 'দৃশ্যপট', 5.5, '#059669', '600')}
        {[5,10,14].map(y => <rect key={y} x={7} y={y} width={[52,40,48][Math.floor((y-5)/5)]} height={1.5} rx={1} fill="#6ee7b7"/>)}
        {[22,31,40].map((y, i) => (
          <g key={y}>
            {t(3, y+3, `${i+1}.`, 5.5, '#047857', '700')}
            <rect x={13} y={y} width={58} height={2} rx={1} fill="#a7f3d0"/>
            <rect x={13} y={y+4} width={42} height={2} rx={1} fill="#a7f3d0"/>
          </g>
        ))}
      </svg>
    ),

    primary_sentence_matching: (
      <svg viewBox={vb} width={width} height={height}>
        {box(2, 2, 30, 5, '#fce7f3', '#fbcfe8')}
        {box(48, 2, 30, 5, '#fce7f3', '#fbcfe8')}
        {t(5, 7, 'কলাম A', 4.5, '#be185d', '700')}
        {t(51, 7, 'কলাম B', 4.5, '#be185d', '700')}
        {[10,18,27,36].map(y => (
          <g key={y}>
            {box(2, y, 30, 6, '#fff', '#fbcfe8')}
            <line x1={32} y1={y+3} x2={48} y2={y+3} stroke="#f9a8d4" strokeWidth={0.8} strokeDasharray="2,1.5"/>
            {box(48, y, 30, 6, '#fff', '#fbcfe8')}
          </g>
        ))}
      </svg>
    ),

    primary_3col_matching: (
      <svg viewBox={vb} width={width} height={height}>
        {['A','B','C'].map((lbl, ci) => (
          <g key={lbl}>
            {box(2+ci*26, 2, 22, 5, '#fce7f3', '#fbcfe8')}
            {t(9+ci*26, 7, lbl, 5, '#be185d', '700')}
          </g>
        ))}
        {[10,18,27,36].map(y => [0,1,2].map(ci => (
          <rect key={`${y}-${ci}`} x={2+ci*26} y={y} width={22} height={6} rx={1} fill="#fff" stroke="#fbcfe8" strokeWidth={0.7}/>
        )))}
      </svg>
    ),

    primary_image_matching: (
      <svg viewBox={vb} width={width} height={height}>
        {[3,14,25,36].map((y, i) => (
          <g key={y}>
            {box(2, y, 16, 10, '#fce7f3', '#fbcfe8', 2)}
            {t(5, y+9, ['🍎','📖','✏️','🎒'][i], 9, '#000')}
            <line x1={18} y1={y+5} x2={28} y2={y+5} stroke="#f9a8d4" strokeWidth={0.8} strokeDasharray="2,1.5"/>
            {box(28, y+1, 46, 7, '#fff', '#fbcfe8')}
          </g>
        ))}
      </svg>
    ),

    primary_comparison: (
      <svg viewBox={vb} width={width} height={height}>
        {[[5,3],[7,7],[4,9]].map(([l, r], i) => {
          const y = 4+i*14
          return (
            <g key={i}>
              {box(4, y, 16, 11, '#fffbeb', '#fde68a', 2)}
              {t(8, y+9, String(l), 10, '#92400e', '700')}
              <circle cx={40} cy={y+5.5} r={7} fill="white" stroke="#fde68a" strokeWidth={1.2}/>
              {t(37, y+9, '○', 9, '#d97706')}
              {box(60, y, 16, 11, '#fffbeb', '#fde68a', 2)}
              {t(64, y+9, String(r), 10, '#92400e', '700')}
            </g>
          )
        })}
      </svg>
    ),

    primary_picture_grid: (
      <svg viewBox={vb} width={width} height={height}>
        {[1,23].map((y, row) => [1,27,53].map((x, col) => (
          <g key={`${row}-${col}`}>
            {box(x, y, 22, 18, '#fffbeb', '#fde68a', 2)}
            {t(x+4, y+15, ['🍎','🍌','🍊','📖','✏️','🎒'][row*3+col], 13, '#000')}
          </g>
        )))}
      </svg>
    ),

    primary_geometry: (
      <svg viewBox={vb} width={width} height={height}>
        <polygon points="40,3 8,44 72,44" fill="#fffbeb" stroke="#f59e0b" strokeWidth={1.5}/>
        {t(34, 24, '∠', 9, '#92400e')}
        {t(22, 41, 'ভূমি', 5.5, '#b45309', '600')}
        {t(6, 26, 'বাহু', 5, '#b45309', '600')}
        {t(59, 26, 'বাহু', 5, '#b45309', '600')}
        <circle cx={40} cy={3} r={2} fill="#f59e0b"/>
        <circle cx={8} cy={44} r={2} fill="#f59e0b"/>
        <circle cx={72} cy={44} r={2} fill="#f59e0b"/>
      </svg>
    ),

    primary_graph: (
      <svg viewBox={vb} width={width} height={height}>
        {line(8, 4, 8, 42, '#f59e0b', 1.5)}
        {line(8, 42, 74, 42, '#f59e0b', 1.5)}
        {[14,24,34].map(y => line(8, y, 74, y, '#fde68a', 0.6))}
        {[20,32,44,56,68].map(x => line(x, 4, x, 42, '#fde68a', 0.6))}
        {[[14,8,28],[20,26,8],[32,34,8],[44,38,8]].map(([y,x,h]) => (
          <rect key={x} x={x} y={y} width={10} height={h} rx={1} fill="#fbbf24" opacity={0.75}/>
        ))}
        {t(6, 8, 'y', 5.5, '#b45309', '600')}
        {t(70, 46, 'x', 5.5, '#b45309', '600')}
      </svg>
    ),

    primary_inline_box: (
      <svg viewBox={vb} width={width} height={height}>
        {t(3, 13, 'অ', 11, '#1d4ed8', '600')}
        {box(18, 3, 12, 12, 'white', '#93c5fd')}
        {t(34, 13, 'ই', 11, '#1d4ed8', '600')}
        {box(48, 3, 12, 12, 'white', '#93c5fd')}
        {t(63, 13, 'উ', 11, '#1d4ed8', '600')}
        {box(3, 22, 14, 12, 'white', '#93c5fd')}
        {t(20, 31, '+', 11, '#1d4ed8')}
        {box(34, 22, 14, 12, 'white', '#93c5fd')}
        {t(51, 31, '=', 11, '#1d4ed8')}
        {t(64, 32, '১০', 10, '#1d4ed8', '700')}
        {t(3, 46, 'ক ___ খ ___ গ ___', 5.5, '#60a5fa', '500')}
      </svg>
    ),

    primary_math_vertical: (
      <svg viewBox={vb} width={width} height={height}>
        {t(38, 14, '৫৩', 14, '#1d4ed8', '700')}
        {t(18, 30, '+', 14, '#1d4ed8', '500')}
        {t(38, 30, '২৮', 14, '#1d4ed8', '700')}
        {line(14, 34, 68, 34, '#93c5fd', 2)}
        {box(36, 37, 28, 10, '#eff6ff', '#93c5fd')}
      </svg>
    ),

    primary_wh_question: (
      <svg viewBox={vb} width={width} height={height}>
        {t(3, 13, 'রাহেলা', 8, '#2563eb', '600')}
        {line(3, 15, 38, 15, '#3b82f6', 1.5)}
        {t(40, 13, 'স্কুলে যায়।', 7, '#374151')}
        {line(20, 19, 20, 29, '#93c5fd', 1)}
        <polygon points="16,29 24,29 20,35" fill="#bfdbfe"/>
        {box(3, 36, 36, 10, '#eff6ff', '#93c5fd')}
        {t(7, 44, 'কে / কী / কখন?', 5.5, '#2563eb', '500')}
      </svg>
    ),

    primary_dotted_lines: (
      <svg viewBox={vb} width={width} height={height}>
        {t(3, 10, 'তোমার নাম কী?', 7, '#374151', '500')}
        {[16,24,32,40].map(y => (
          <line key={y} x1={3} y1={y} x2={74} y2={y} stroke="#93c5fd" strokeWidth={1} strokeDasharray="2,2"/>
        ))}
      </svg>
    ),

    primary_notebook_ruled: (
      <svg viewBox={vb} width={width} height={height}>
        {t(14, 10, 'সুন্দর করে লেখো:', 6.5, '#374151', '500')}
        {[15,23,31,39].map(y => (
          <line key={y} x1={2} y1={y} x2={76} y2={y} stroke="#93c5fd" strokeWidth={0.9}/>
        ))}
        {line(12, 15, 12, 43, '#fca5a5', 1)}
      </svg>
    ),

    primary_mcq_grid: (
      <svg viewBox={vb} width={width} height={height}>
        {t(3, 9, 'কোনটি ফল?', 6.5, '#374151', '500')}
        {[
          { x:2,  y:12, lbl:'ক', txt:'আম' },
          { x:42, y:12, lbl:'খ', txt:'গাছ' },
          { x:2,  y:28, lbl:'গ', txt:'নদী' },
          { x:42, y:28, lbl:'ঘ', txt:'পাথর' },
        ].map(({ x, y, lbl, txt }) => (
          <g key={lbl}>
            {box(x, y, 36, 13, '#eff6ff', '#bfdbfe', 2)}
            {t(x+3, y+10, `${lbl}.`, 6.5, '#1d4ed8', '700')}
            {t(x+14, y+10, txt, 6.5, '#374151')}
          </g>
        ))}
      </svg>
    ),

    primary_plain_text: (
      <svg viewBox={vb} width={width} height={height}>
        {t(3, 11, 'তোমার নাম কী?', 7, '#374151', '500')}
        {line(3, 16, 74, 16, '#93c5fd', 1)}
        {t(3, 30, 'যায় সে স্কুলে...', 7, '#374151', '500')}
        {line(3, 35, 74, 35, '#93c5fd', 1)}
      </svg>
    ),

    // ─── ৩টি নতুন ফিচার (Nursery – Class 3) ───────────────────────────
    primary_tracing: (
      <svg viewBox={vb} width={width} height={height}>
        {/* Dotted letter tracing preview */}
        {t(8, 22, 'অ', 22, '#fecaca', '700')}
        {/* dotted outline of the letter */}
        {[...Array(8)].map((_, i) => (
          <circle key={`d1-${i}`} cx={12 + i * 7} cy={8 + (i % 2) * 4} r={1.2} fill="#ef4444" opacity={0.5}/>
        ))}
        {[...Array(6)].map((_, i) => (
          <circle key={`d2-${i}`} cx={10 + i * 7} cy={32 + (i % 2) * 3} r={1.2} fill="#ef4444" opacity={0.5}/>
        ))}
        {t(44, 22, 'আ', 22, '#fecaca', '700')}
        {[...Array(8)].map((_, i) => (
          <circle key={`d3-${i}`} cx={48 + i * 3.5} cy={6 + (i % 3) * 3} r={1} fill="#ef4444" opacity={0.5}/>
        ))}
        {line(3, 44, 76, 44, '#fca5a5', 0.8)}
      </svg>
    ),

    primary_number_line: (
      <svg viewBox={vb} width={width} height={height}>
        {/* Number line */}
        {line(6, 24, 74, 24, '#16a34a', 2)}
        {/* Ticks */}
        {[6, 18, 30, 42, 54, 66, 74].map((x, i) => (
          <line key={`tick-${i}`} x1={x} y1={20} x2={x} y2={28} stroke="#16a34a" strokeWidth={1.2}/>
        ))}
        {/* Numbers below */}
        {[6, 18, 30, 54, 66, 74].map((x, i) => (
          <text key={`num-${i}`} x={x} y={36} fontSize={5.5} fill="#15803d" fontWeight="600" fontFamily="sans-serif" textAnchor="middle">{['0','2','4','6','8','10'][i]}</text>
        ))}
        {/* Empty jump circles */}
        {[36, 48].map((x, i) => (
          <g key={`jump-${i}`}>
            <circle cx={x} cy={24} r={4} fill="#dcfce7" stroke="#16a34a" strokeWidth={0.8}/>
            <text x={x} y={26.5} fontSize={4.5} fill="#16a34a" fontWeight="700" fontFamily="sans-serif" textAnchor="middle">{['3','5'][i]}</text>
          </g>
        ))}
        {t(3, 10, 'সংখ্যা রেখা', 5.5, '#15803d', '600')}
      </svg>
    ),

    primary_visual_math: (
      <svg viewBox={vb} width={width} height={height}>
        {/* Visual math: 🍎🍎🍎 + 🍎🍎 = ? */}
        {[8, 20, 32].map((x, i) => (
          <text key={`l${i}`} x={x} y={20} fontSize={12} fontFamily="sans-serif">🍎</text>
        ))}
        {t(43, 18, '+', 12, '#ea580c', '700')}
        {[52, 62].map((x, i) => (
          <text key={`r${i}`} x={x} y={20} fontSize={12} fontFamily="sans-serif">🍎</text>
        ))}
        {t(3, 32, '=', 10, '#374151', '700')}
        {box(16, 24, 20, 10, '#fff7ed', '#fdba74', 2)}
        {t(22, 33, '?', 10, '#ea580c', '700')}
        {t(44, 33, 'মোট = ___', 6, '#9a3412', '500')}
      </svg>
    ),
  }

  const svg = map[id]
  if (!svg) return null
  return <div style={{ width, height, flexShrink: 0 }}>{svg}</div>
})
