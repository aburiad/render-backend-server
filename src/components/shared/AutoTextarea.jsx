import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Textarea that auto-grows with its content.
 * The `rows` attribute still acts as the minimum visible lines (initial floor).
 * Forwards ref so callers (e.g. MathLiveEditor) can read cursor position.
 */
const AutoTextarea = forwardRef(function AutoTextarea({ value, onInput, ...props }, externalRef) {
  const internalRef = useRef(null)

  const setRefs = useCallback(
    (el) => {
      internalRef.current = el
      if (typeof externalRef === 'function') externalRef(el)
      else if (externalRef) externalRef.current = el
    },
    [externalRef],
  )

  const resize = useCallback(() => {
    const el = internalRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(() => {
    resize()
  }, [value, resize])

  useEffect(() => {
    const onWindowResize = () => resize()
    window.addEventListener('resize', onWindowResize)
    return () => window.removeEventListener('resize', onWindowResize)
  }, [resize])

  return (
    <textarea
      ref={setRefs}
      value={value}
      onInput={(e) => {
        resize()
        if (onInput) onInput(e)
      }}
      {...props}
    />
  )
})

export default AutoTextarea
