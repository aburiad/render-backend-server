import { motion } from 'framer-motion'

/**
 * Loader — page-level loading indicator. Three usage modes:
 *
 *   <Loader full />                              full-screen overlay (blur backdrop)
 *   <Loader />                                   inline, centered in available space
 *   <Loader size="sm" message="তৈরি হচ্ছে..." />  custom size + label
 *
 * Sizes: 'sm' (40px, no badge, single message line, suitable for cards/modals)
 *        'md' (64px, default, page-level)
 *        'lg' (88px, splash-style)
 *
 * Mobile-friendly: smaller default ring on narrow viewports, lighter backdrop
 * blur (mobile GPUs handle the heavy blur poorly), text scales with size.
 */
export default function Loader({
  full = false,
  size = 'md',
  message = 'লোড হচ্ছে...',
  subtitle,
}) {
  const dims =
    size === 'sm'
      ? { ring: 40, border: 3, gap: 12, msg: 'text-[11px]', sub: 'text-[10px]', showBadge: false }
      : size === 'lg'
        ? { ring: 88, border: 5, gap: 18, msg: 'text-base', sub: 'text-xs', showBadge: true, badgeSize: 'text-base' }
        : { ring: 64, border: 4, gap: 14, msg: 'text-sm', sub: 'text-[11px]', showBadge: true, badgeSize: 'text-xs' }

  const content = (
    <div
      role="status"
      aria-label="loading"
      className="flex flex-col items-center justify-center"
      style={{ gap: dims.gap }}
    >
      <div className="relative" style={{ width: dims.ring, height: dims.ring }}>
        {/* Outer pulsing ring — soft halo */}
        <motion.div
          className="absolute inset-0 rounded-full border-blue-100"
          style={{ borderWidth: dims.border, borderStyle: 'solid' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Inner spinning ring — primary motion */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            borderWidth: dims.border,
            borderStyle: 'solid',
            borderColor: '#2563eb',
            borderTopColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center brand badge (md/lg only) */}
        {dims.showBadge && (
          <div className="absolute inset-[18%] bg-blue-600 rounded-lg shadow-md flex items-center justify-center">
            <span className={`text-white font-black ${dims.badgeSize}`}>Q</span>
          </div>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <p className={`${dims.msg} font-bold text-gray-500 tracking-wide`}>
            {message}
          </p>
          {subtitle && (
            <p className={`${dims.sub} text-gray-400 mt-1`}>{subtitle}</p>
          )}
        </motion.div>
      )}
    </div>
  )

  if (full) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/85 sm:backdrop-blur-md flex items-center justify-center px-6">
        {content}
      </div>
    )
  }

  return (
    <div className="w-full py-12 sm:py-16 flex items-center justify-center">
      {content}
    </div>
  )
}
