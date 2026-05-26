/**
 * Serialize a live paper preview DOM node into a complete, self-contained
 * HTML document the Puppeteer PDF server can render verbatim.
 *
 * Why all this work instead of just sending `node.outerHTML`?
 *
 * 1. **Stylesheets** — Tailwind classes mean nothing without the bundled
 *    CSS. We collect every <link rel=stylesheet> and <style> from the
 *    current document and bake them into the output. External
 *    stylesheets are referenced by absolute URL so the PDF server (e.g.
 *    Render) can fetch them from Vercel directly.
 * 2. **KaTeX geometry** — KaTeX uses `em`-relative inline `top`/`width`
 *    offsets that re-resolve differently in a fresh document. We mirror
 *    the html2pdf onclone trick: copy computed layout styles onto every
 *    .katex descendant, so the PDF server sees the exact same geometry.
 * 3. **`@page` size + readiness marker** — Inject the correct page size
 *    and a `data-paper-ready="true"` attribute on the wrapper so the PDF
 *    server can `waitForSelector` before printing.
 *
 * Returned shape: { html: string, filename: string }
 */

const KATEX_LAYOUT_PROPS = [
  'fontSize', 'lineHeight', 'fontFamily', 'fontStyle', 'fontWeight',
  'position', 'top', 'bottom', 'left', 'right',
  'width', 'height', 'minHeight',
  'display', 'verticalAlign',
  'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'borderTopWidth', 'borderBottomWidth',
  'borderTopStyle', 'borderBottomStyle',
  'borderTopColor', 'borderBottomColor',
  'transform', 'transformOrigin',
  'textAlign',
]

function collectStyles() {
  const out = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (sheet.href) {
        // External stylesheet — reference by absolute URL so the PDF
        // server can fetch it. Skip stylesheets from chrome-extension://
        // and other non-http schemes.
        const url = new URL(sheet.href, window.location.href)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          out.push(`<link rel="stylesheet" href="${url.toString()}">`)
        }
      } else if (sheet.ownerNode && sheet.ownerNode.tagName === 'STYLE') {
        // Inline <style> — copy its text directly
        out.push(`<style>${sheet.ownerNode.textContent || ''}</style>`)
      }
    } catch {
      // CORS-restricted stylesheets throw on cssRules access; ignore.
    }
  }
  return out.join('\n')
}

function pinKatexGeometry(originalRoot, clonedRoot) {
  if (!originalRoot || !clonedRoot) return
  const SEL = '.katex, .katex-display'
  const origRoots = originalRoot.querySelectorAll(SEL)
  const cloneRoots = clonedRoot.querySelectorAll(SEL)
  for (let i = 0; i < cloneRoots.length; i += 1) {
    const oRoot = origRoots[i]
    const cRoot = cloneRoots[i]
    if (!oRoot || !cRoot) continue
    copyComputed(oRoot, cRoot)
    const oDesc = oRoot.querySelectorAll('*')
    const cDesc = cRoot.querySelectorAll('*')
    for (let k = 0; k < cDesc.length; k += 1) copyComputed(oDesc[k], cDesc[k])
  }
}

function copyComputed(originalNode, clonedNode) {
  if (!originalNode || !clonedNode || clonedNode.nodeType !== 1) return
  const cs = window.getComputedStyle(originalNode)
  for (const prop of KATEX_LAYOUT_PROPS) {
    const val = cs[prop]
    if (val && val !== 'auto' && val !== 'normal') {
      clonedNode.style[prop] = val
    }
  }
}

function safeFilename(name, fallback = 'paper') {
  const cleaned = String(name || fallback)
    .replace(/[^\wঀ-৿\-. ]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100)
  return (cleaned || fallback) + '.pdf'
}

/**
 * Build the printable document.
 *
 * @param {object} args
 * @param {HTMLElement} args.paperNode   The DOM node wrapping the rendered paper (paperRef.current)
 * @param {object}      args.paper       The paper object (for filename + page size)
 * @param {object}      args.settings    Current editor settings (font, orientation, margin, pageFormat, …)
 * @returns {{ html: string, filename: string }}
 */
export function buildPaperHtmlForServerPdf({ paperNode, paper, settings = {} }) {
  if (!paperNode) throw new Error('paperNode is required')

  const stylesHtml = collectStyles()
  const clone = paperNode.cloneNode(true)
  pinKatexGeometry(paperNode, clone)

  // Mark as ready so the PDF server's waitForSelector resolves immediately.
  clone.setAttribute('data-paper-ready', 'true')

  // Strip vertical padding from the clone. The on-screen wrapper in
  // PDFPreview.jsx uses `padding: 12px 12mm` for visual spacing, but for
  // the server PDF path the vertical margin is handled by Puppeteer's
  // pdf() `margin` option (via mapPrintSettings on the backend).
  // Keeping the 12px shifts pre-paginated multi-column page wrappers
  // (each exactly 269mm tall) out of alignment with Puppeteer's page
  // boundaries, breaking 2-col and 3-col layouts.
  clone.style.paddingTop = '0'
  clone.style.paddingBottom = '0'

  const isLandscape = settings.orientation === 'landscape'
  const pageFormat = String(settings.pageFormat || 'A4').toUpperCase()
  const lang = document.documentElement.lang || 'bn'

  // Page margin — defaults to 14mm top/bottom, 0 left/right (horizontal
  // padding is baked into the paper template at 12mm). Users can override
  // via the settings modal. The value is stored as a single string like
  // "14mm" (applied to all 4 sides) or as an object { top, right, bottom, left }.
  const pm = settings.pageMargin
  let marginTop = '14mm'
  let marginRight = '0mm'
  let marginBottom = '14mm'
  let marginLeft = '0mm'
  if (pm) {
    if (typeof pm === 'string') {
      marginTop = pm; marginBottom = pm
    } else {
      if (pm.top) marginTop = pm.top
      if (pm.right) marginRight = pm.right
      if (pm.bottom) marginBottom = pm.bottom
      if (pm.left) marginLeft = pm.left
    }
  }

  // Page-size CSS — `preferCSSPageSize: true` on the server picks this up.
  // Both size AND margin go into @page so that EVERY page (not just the
  // first) gets consistent whitespace. If we leave margin at 0 here and
  // rely only on the Puppeteer pdf() `margin` option, the CSS
  // `@page { margin: 0 }` in DEFAULT_HEAD_INJECT takes precedence after
  // the first page break, so pages 2+ lose their top margin.
  const pageSizeCss = `@page { size: ${pageFormat} ${isLandscape ? 'landscape' : 'portrait'}; margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft}; }`

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${(paper?.exam_title || 'Paper').replace(/[<>"']/g, '')}</title>
${stylesHtml}
<style>
  ${pageSizeCss}
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { font-family: '${settings.font || 'Noto Serif Bengali'}', 'Hind Siliguri', 'Noto Sans Bengali', 'Noto Naskh Arabic', 'Amiri', system-ui, sans-serif; }
  /* Strip any animation hooks that linger from framer-motion variants */
  [data-framer-component-type] { animation: none !important; transition: none !important; }
</style>
</head>
<body>
${clone.outerHTML}
</body>
</html>`

  return {
    html,
    filename: safeFilename(paper?.exam_title || 'paper'),
  }
}
