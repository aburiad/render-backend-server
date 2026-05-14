/**
 * Spinner — small inline loading indicator for buttons, chips, status rows.
 *
 *   <Spinner />                               16px, follows currentColor
 *   <Spinner size={20} />                     custom pixel size
 *   <Spinner color="#fff" />                  for dark-bg buttons
 *   <Spinner color="#fff" size={20} />        large white spinner
 *
 * Uses CSS-only animation (`animate-spin`) — no framer-motion overhead in a
 * spot that may render dozens of times (per-question save chips, etc.).
 */
export default function Spinner({
  size = 16,
  color = 'currentColor',
  thickness,
}) {
  const border = thickness ?? Math.max(2, Math.round(size / 9))

  return (
    <span
      role="status"
      aria-label="loading"
      className="inline-block rounded-full animate-spin align-middle"
      style={{
        width: size,
        height: size,
        borderWidth: border,
        borderStyle: 'solid',
        borderColor: color,
        borderTopColor: 'transparent',
      }}
    />
  )
}
