/**
 * geogebraRenderer.js
 *
 * Background GeoGebra renderer — runs commands in an off-screen applet,
 * exports a PNG, then cleans up. No user interaction needed.
 *
 * Usage:
 *   import { renderGeoGebraToImage } from '@/utils/geogebraRenderer'
 *   const dataUrl = await renderGeoGebraToImage('A=(0,0);B=(3,0);C=(0,4);Polygon[A,B,C]')
 */

const GGB_SCRIPT_URL = 'https://www.geogebra.org/apps/deployggb.js'

/**
 * Crop whitespace from a PNG dataUrl.
 * Finds bounding box of non-white pixels, adds 5% padding, returns cropped PNG.
 */
function cropWhitespace(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const sw = img.naturalWidth, sh = img.naturalHeight
      const src = document.createElement('canvas')
      src.width = sw; src.height = sh
      const sctx = src.getContext('2d')
      sctx.fillStyle = '#ffffff'
      sctx.fillRect(0, 0, sw, sh)
      sctx.drawImage(img, 0, 0)

      let minX = sw, maxX = 0, minY = sh, maxY = 0, found = false
      try {
        const d = sctx.getImageData(0, 0, sw, sh).data
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4
            if (!(d[i] > 240 && d[i+1] > 240 && d[i+2] > 240) && d[i+3] > 30) {
              if (x < minX) minX = x; if (x > maxX) maxX = x
              if (y < minY) minY = y; if (y > maxY) maxY = y
              found = true
            }
          }
        }
      } catch { /* noop */ }

      if (!found) { resolve(dataUrl); return }

      const padX = Math.max(Math.round((maxX - minX) * 0.08), 16)
      const padY = Math.max(Math.round((maxY - minY) * 0.08), 16)
      const cx = Math.max(0, minX - padX)
      const cy = Math.max(0, minY - padY)
      const cw = Math.min(sw, maxX + padX + 1) - cx
      const ch = Math.min(sh, maxY + padY + 1) - cy

      const out = document.createElement('canvas')
      out.width = cw; out.height = ch
      const octx = out.getContext('2d')
      octx.fillStyle = '#ffffff'
      octx.fillRect(0, 0, cw, ch)
      octx.drawImage(src, cx, cy, cw, ch, 0, 0, cw, ch)
      resolve(out.toDataURL('image/png'))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function loadGgbScript() {
  return new Promise((resolve, reject) => {
    if (window.GGBApplet) { resolve(); return }
    const existing = document.querySelector(`script[src="${GGB_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', () => reject(new Error('GeoGebra script failed')))
      return
    }
    const s = document.createElement('script')
    s.src = GGB_SCRIPT_URL
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('GeoGebra CDN unreachable'))
    document.head.appendChild(s)
  })
}

/**
 * Render GeoGebra commands to a PNG data URL.
 *
 * @param {string} cmdString  Semicolon-separated GeoGebra commands
 * @param {object} opts
 * @param {number} opts.width   Canvas width in px (default 640)
 * @param {number} opts.height  Canvas height in px (default 480)
 * @param {number} opts.timeout Max ms to wait (default 18000)
 * @returns {Promise<string|null>}  PNG data URL, or null on failure
 */
export async function renderGeoGebraToImage(
  cmdString,
  { width = 640, height = 480, timeout = 18000 } = {}
) {
  if (!cmdString?.trim()) return null

  await loadGgbScript()

  return new Promise((resolve) => {
    // ── Off-screen container ─────────────────────────────────────────────────
    const container = document.createElement('div')
    Object.assign(container.style, {
      position: 'fixed',
      left: '-9999px',
      top: '-9999px',
      width: `${width}px`,
      height: `${height}px`,
      visibility: 'hidden',
      pointerEvents: 'none',
      zIndex: '-1',
    })
    document.body.appendChild(container)

    let settled = false
    const timer = setTimeout(() => done(null), timeout)

    function cleanup() {
      try { document.body.removeChild(container) } catch { /* noop */ }
    }

    function done(result) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      cleanup()
      resolve(result)
    }

    // ── GeoGebra params ──────────────────────────────────────────────────────
    const params = {
      appName: 'classic',
      width,
      height,
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      enableRightClick: false,
      enableLabelDrags: false,
      showResetIcon: false,
      perspective: 'G',
      language: 'en',

      appletOnLoad(api) {
        // Initialise visual settings
        try { api.setGridVisible(false) }        catch { /* noop */ }
        try { api.setAxesVisible(false, false) } catch { /* noop */ }
        try { api.setAxesRatio(1, 1) }           catch { /* noop */ }
        try { api.setErrorDialogsActive(false) } catch { /* noop */ }

        // ── Normalise commands ───────────────────────────────────────────────
        const normalised = cmdString
          .replace(/\r\n|\r|\n/g, ';')
          .replace(/;+/g, ';')
          .replace(/^;|;$/g, '')
          .trim()

        const cmds = normalised
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('//'))

        // ── Run commands ─────────────────────────────────────────────────────
        cmds.forEach(cmd => {
          try {
            let ok = api.evalCommand(cmd)
            if (ok === false && cmd.includes('[')) {
              api.evalCommand(cmd.replace(/\[/g, '(').replace(/\]/g, ')'))
            }
          } catch { /* noop */ }
        })

        // ── Render delay: GeoGebra needs one tick to paint ───────────────────
        setTimeout(() => {
          // Auto-fit: compute bounding box of all objects
          try {
            const names = api.getAllObjectNames ? api.getAllObjectNames() : []
            let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
            names.forEach(n => {
              try {
                const x = api.getXcoord(n), y = api.getYcoord(n)
                if (isFinite(x) && isFinite(y)) {
                  x0 = Math.min(x0, x); x1 = Math.max(x1, x)
                  y0 = Math.min(y0, y); y1 = Math.max(y1, y)
                }
              } catch { /* noop */ }
            })

            if (isFinite(x0)) {
              const pad = 1.5
              const dataW = Math.max(x1 - x0, 0.1) + pad * 2
              const dataH = Math.max(y1 - y0, 0.1) + pad * 2
              const cx = (x0 + x1) / 2
              const cy = (y0 + y1) / 2
              const ratio = width / height

              let rangeY = dataH
              let rangeX = rangeY * ratio
              if (dataW > rangeX) { rangeX = dataW; rangeY = rangeX / ratio }

              api.setCoordSystem(
                cx - rangeX / 2, cx + rangeX / 2,
                cy - rangeY / 2, cy + rangeY / 2,
              )
            }
          } catch { /* noop */ }

          // ── Hide labels on non-point objects ─────────────────────────────
          try {
            const names = api.getAllObjectNames ? api.getAllObjectNames() : []
            names.forEach(name => {
              try {
                const t = api.getObjectType(name)
                api.setVisible(name, true)
                if (t === 'point') {
                  // Hide helper points: T1,T2…(text anchors), RA1,RA2…(right-angle marks), L1,L2…(line extenders)
                  if (/^T\d+$/.test(name) || /^RA\d+$/.test(name) || /^L\d+$/.test(name)) {
                    api.setVisible(name, false); return
                  }
                  api.setLabelVisible(name, true)
                  api.setPointSize(name, 4)
                } else if (t === 'angle' || t === 'numeric') {
                  api.setLabelVisible(name, false)
                  api.setVisible(name, false)
                } else {
                  api.setLabelVisible(name, false)
                }
              } catch { /* noop */ }
            })
          } catch { /* noop */ }

          // ── Export PNG then crop whitespace ──────────────────────────────
          setTimeout(() => {
            try { api.setSize(width, height) } catch { /* noop */ }

            setTimeout(async () => {
              try {
                let dataUrl = null
                for (const scale of [1.5, 1, 2]) {
                  const b64 = api.getPNGBase64(scale, false, 72)
                  if (b64 && b64.length > 500 && b64.startsWith('iVBOR')) {
                    dataUrl = `data:image/png;base64,${b64}`
                    break
                  }
                }
                if (dataUrl) {
                  const cropped = await cropWhitespace(dataUrl)
                  done(cropped)
                } else {
                  done(null)
                }
              } catch { done(null) }
            }, 600)
          }, 800)
        }, 1200)
      },
    }

    try {
      const applet = new window.GGBApplet(params, true)
      applet.inject(container)
    } catch (err) {
      console.error('[ggbRenderer] inject failed:', err)
      done(null)
    }
  })
}
