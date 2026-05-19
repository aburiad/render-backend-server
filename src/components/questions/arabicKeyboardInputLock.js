/**
 * Reference-counted lock for inputs while the Arabic/Farsi custom keyboard is open.
 * Value commits only when all keyboard sessions close (deferredValues).
 */

const lockState = new WeakMap()
const deferredValues = new WeakMap()
const originalStates = new WeakMap()

export function isInputLocked(el) {
  if (!el) return false
  const state = lockState.get(el)
  return Boolean(state && state.count > 0)
}

export function setDeferredValue(el, value) {
  if (el) deferredValues.set(el, value)
}

export function clearDeferredValue(el) {
  if (el) deferredValues.delete(el)
}

export function commitDeferredValue(el, onInsert) {
  if (!el || !onInsert) return
  if (!deferredValues.has(el)) return
  onInsert(deferredValues.get(el))
  deferredValues.delete(el)
}

export function saveOriginalInputState(el) {
  if (!el || originalStates.has(el)) return
  originalStates.set(el, {
    readOnly: el.readOnly,
    inputMode: el.getAttribute('inputmode') || '',
  })
}

export function lockInputEl(el, { onLastUnlock } = {}) {
  if (!el) return
  let state = lockState.get(el)
  if (!state) {
    const cached = originalStates.get(el)
    state = {
      count: 0,
      onLastUnlock: null,
      saved: {
        readOnly: cached ? cached.readOnly : el.readOnly,
        inputMode: cached ? cached.inputMode : (el.getAttribute('inputmode') || ''),
        tabIndex: el.tabIndex,
        pointerEvents: el.style.pointerEvents,
        ariaHidden: el.getAttribute('aria-hidden'),
      },
    }
    lockState.set(el, state)
  }
  if (onLastUnlock) state.onLastUnlock = onLastUnlock
  state.count += 1
  if (state.count === 1) {
    el.setAttribute('inputmode', 'none')
    el.readOnly = true
    el.tabIndex = -1
    el.style.pointerEvents = 'none'
    el.setAttribute('aria-hidden', 'true')
    el.blur()
  }
}

export function unlockInputEl(el) {
  if (!el) return
  const state = lockState.get(el)
  if (!state || state.count <= 0) return

  state.count -= 1
  if (state.count > 0) return

  const { saved, onLastUnlock } = state
  onLastUnlock?.()

  el.readOnly = saved.readOnly
  el.tabIndex = saved.tabIndex
  el.style.pointerEvents = saved.pointerEvents
  if (saved.ariaHidden == null) el.removeAttribute('aria-hidden')
  else el.setAttribute('aria-hidden', saved.ariaHidden)
  if (saved.inputMode) el.setAttribute('inputmode', saved.inputMode)
  else el.removeAttribute('inputmode')

  lockState.delete(el)
  originalStates.delete(el)
}

/** Re-apply lock after React re-render — blur only, never focus anything */
export function reapplyInputLock(el) {
  if (!isInputLocked(el)) return
  el.setAttribute('inputmode', 'none')
  el.readOnly = true
  el.tabIndex = -1
  el.style.pointerEvents = 'none'
  el.setAttribute('aria-hidden', 'true')
  if (document.activeElement === el) el.blur()
}
