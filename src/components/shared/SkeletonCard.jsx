/**
 * Skeleton loaders — animated shimmer blocks
 * Variants: SkeletonText, SkeletonCard, SkeletonListItem, SkeletonStat
 */

export function SkeletonText({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton skeleton-text ${className}`}
      style={{ width, height, borderRadius: 'var(--radius-full)' }}
    />
  )
}

export function SkeletonStat({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`} style={{ minHeight: 80 }}>
      <div className="skeleton skeleton-avatar" style={{ width: 32, height: 32, marginBottom: 12 }} />
      <SkeletonText width="60%" height={20} />
      <div style={{ marginTop: 6 }}>
        <SkeletonText width="80%" height={12} />
      </div>
    </div>
  )
}

export function SkeletonListItem({ className = '' }) {
  return (
    <div
      className={`list-item ${className}`}
      style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}
    >
      {/* Left icon */}
      <div
        className="skeleton skeleton-avatar"
        style={{ width: 40, height: 40, flexShrink: 0 }}
      />
      {/* Text block */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonText width="70%" height={14} />
        <SkeletonText width="45%" height={11} />
      </div>
      {/* Chevron placeholder */}
      <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 'var(--radius-sm)' }} />
    </div>
  )
}

export function SkeletonCard({ height = 100, className = '' }) {
  return (
    <div className={`skeleton-card ${className}`} style={{ height }}>
      <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}

export function SkeletonQuickAction({ className = '' }) {
  return (
    <div
      className={`skeleton-card ${className}`}
      style={{ minWidth: 140, flex: '0 0 140px', height: 100 }}
    >
      <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40, marginBottom: 10 }} />
      <SkeletonText width="70%" height={13} />
      <div style={{ marginTop: 6 }}>
        <SkeletonText width="55%" height={11} />
      </div>
    </div>
  )
}

/** A dashboard-level skeleton showing all sections */
export default function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome banner skeleton */}
      <div>
        <SkeletonText width="50%" height={22} />
        <div style={{ marginTop: 8 }}>
          <SkeletonText width="70%" height={14} />
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'hidden' }}>
        {[1, 2, 3].map(i => <SkeletonQuickAction key={i} />)}
      </div>

      {/* Stats skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[1, 2, 3].map(i => <SkeletonStat key={i} />)}
      </div>

      {/* List skeleton */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[1, 2, 3, 4].map(i => <SkeletonListItem key={i} />)}
      </div>
    </div>
  )
}
