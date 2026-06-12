/**
 * Skeleton loaders — animated shimmer blocks
 * Variants: SkeletonText, SkeletonCard, SkeletonListItem, SkeletonStat, SkeletonQuickAction
 *
 * DashboardSkeleton matches the actual Dashboard.jsx layout:
 * 1. Welcome area (hub title + name)
 * 2. Stats row (3 compact gradient-like pills)
 * 3. Quick Actions (2x3 grid, 6 items)
 * 4. Credit Balance card
 * 5. Recent Papers list (5 rows)
 */

export function SkeletonText({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton skeleton-text ${className}`}
      style={{ width, height, borderRadius: 'var(--radius-full)' }}
    />
  )
}

/** Compact stat pill — matches Dashboard StatCard (grid-cols-3) */
export function SkeletonStat({ className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        height: 56,
        borderRadius: 16,
        background: 'var(--bg-skeleton, #e2e8f0)',
      }}
    />
  )
}

/** List item row — matches PaperRow / notices / routines */
export function SkeletonListItem({ className = '' }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-light, #f1f5f9)',
      }}
    >
      {/* Left avatar */}
      <div
        className="skeleton"
        style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}
      />
      {/* Text block */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonText width="65%" height={13} />
        <SkeletonText width="40%" height={10} />
      </div>
      {/* Chevron */}
      <div className="skeleton" style={{ width: 14, height: 14, borderRadius: 4 }} />
    </div>
  )
}

/** Full-width card skeleton */
export function SkeletonCard({ height = 100, className = '' }) {
  return (
    <div className={`skeleton-card ${className}`} style={{ height }}>
      <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}

/** Quick action card — matches QuickActionCard layout (icon left + text right) */
export function SkeletonQuickAction({ className = '' }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        padding: '12px 14px',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        minHeight: 64,
      }}
    >
      {/* Icon circle */}
      <div
        className="skeleton"
        style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }}
      />
      {/* Text */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <SkeletonText width="70%" height={13} />
        <SkeletonText width="50%" height={10} />
      </div>
    </div>
  )
}

/** Credit balance skeleton — compact card */
function SkeletonCreditBalance() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 16,
        background: '#fff',
        border: '1px solid #f1f5f9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <SkeletonText width={80} height={12} />
          <SkeletonText width={50} height={10} />
        </div>
      </div>
      <div className="skeleton" style={{ width: 64, height: 28, borderRadius: 8 }} />
    </div>
  )
}

/** A dashboard-level skeleton matching actual Dashboard.jsx layout */
export default function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 24px)' }}>
      {/* 1. Welcome area skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SkeletonText width="30%" height={12} />
        <SkeletonText width="50%" height={22} />
      </div>

      {/* 2. Stats row — 3 compact pills matching grid-cols-3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[1, 2, 3].map(i => <SkeletonStat key={i} />)}
      </div>

      {/* 3. Quick Actions — 2x3 grid matching actual layout */}
      <div>
        <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 7, marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonQuickAction key={i} />)}
        </div>
      </div>

      {/* 4. Credit Balance skeleton */}
      <SkeletonCreditBalance />

      {/* 5. Recent Papers list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 7 }} />
          <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 5 }} />
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid #f1f5f9',
        }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonListItem key={i} />)}
        </div>
      </div>
    </div>
  )
}