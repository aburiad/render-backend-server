import { forwardRef } from 'react'

/**
 * Renders a notice as A4-sized HTML, print/PDF-ready.
 * No question-paper logic here — purely header / body blocks / signature.
 */
const NoticeTemplate = forwardRef(function NoticeTemplate(
  { notice, font = 'Noto Serif Bengali', size = '13pt', spacing = '1.7' },
  ref,
) {
  if (!notice) return null

  const fontStack = `"${font}", "Hind Siliguri", "Noto Sans Bengali", serif`

  const pageStyle = {
    fontFamily: fontStack,
    fontSize: size,
    lineHeight: spacing,
    color: '#000',
    background: '#fff',
    width: '186mm',
    minHeight: '269mm',
    margin: '0 auto',
    boxSizing: 'border-box',
    position: 'relative',
    paddingBottom: notice.footer_text ? 60 : 0,
  }

  return (
    <div ref={ref} className="notice-print" style={pageStyle}>
      <NoticeHeader notice={notice} />
      <DateRow notice={notice} />
      <NoticeTitle notice={notice} />
      <SubjectLine notice={notice} />
      <BodyBlocks blocks={notice.body_blocks} />
      <Signature notice={notice} />
      <CopyTo notice={notice} />
      <FooterBanner notice={notice} />
    </div>
  )
})

function NoticeHeader({ notice }) {
  if (
    !notice.header_top_line &&
    !notice.header_logo_url &&
    !notice.header_org_name &&
    !notice.header_subtitle &&
    !notice.header_address &&
    !notice.header_extra &&
    !notice.header_contact
  ) {
    return null
  }

  const align = notice.header_alignment || 'center'
  const bandColor = notice.header_band_color || ''

  return (
    <header
      style={{
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: '1.5px solid #000',
      }}
    >
      {notice.header_top_line && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.92em',
            fontWeight: 600,
            margin: '0 0 4px',
          }}
        >
          {notice.header_top_line}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: bandColor ? '8px 12px' : 0,
          background: bandColor || 'transparent',
          borderRadius: bandColor ? 6 : 0,
        }}
      >
        {notice.header_logo_url && (
          <img
            src={notice.header_logo_url}
            alt=""
            style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }}
            crossOrigin="anonymous"
          />
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: align }}>
          {notice.header_subtitle && (
            <div style={{ fontSize: '0.95em', fontWeight: 600 }}>
              {notice.header_subtitle}
            </div>
          )}
          {notice.header_org_name && (
            <div
              style={{
                fontSize: '1.45em',
                fontWeight: 800,
                margin: '2px 0',
                lineHeight: 1.2,
              }}
            >
              {notice.header_org_name}
            </div>
          )}
          {notice.header_address && (
            <div style={{ fontSize: '0.85em', whiteSpace: 'pre-line' }}>
              {notice.header_address}
            </div>
          )}
          {notice.header_extra && (
            <div style={{ fontSize: '0.85em', whiteSpace: 'pre-line' }}>
              {notice.header_extra}
            </div>
          )}
          {notice.header_contact && (
            <div style={{ fontSize: '0.82em', whiteSpace: 'pre-line', marginTop: 2 }}>
              {notice.header_contact}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function DateRow({ notice }) {
  if (!notice.reference_no && !notice.notice_date) return null
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        margin: '6px 0 12px',
        fontSize: '0.95em',
      }}
    >
      <span style={{ fontWeight: 600 }}>
        {notice.reference_no ? `Ref: ${notice.reference_no}` : ''}
      </span>
      <span style={{ fontWeight: 600 }}>
        {notice.notice_date
          ? `${notice.date_label || 'তারিখ'}: ${notice.notice_date}`
          : ''}
      </span>
    </div>
  )
}

function NoticeTitle({ notice }) {
  if (!notice.show_title || !notice.title) return null
  return (
    <h2
      style={{
        textAlign: 'center',
        margin: '14px 0 12px',
        fontSize: '1.5em',
        fontWeight: 800,
        textDecoration: 'underline',
        textUnderlineOffset: 4,
      }}
    >
      {notice.title}
    </h2>
  )
}

function SubjectLine({ notice }) {
  if (!notice.subject) return null
  return (
    <div
      style={{
        margin: '8px 0 14px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '1.05em',
      }}
    >
      <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
        {notice.subject}
      </span>
    </div>
  )
}

function BodyBlocks({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  return (
    <div style={{ margin: '10px 0' }}>
      {blocks.map((b, i) => {
        if (!b) return null
        if (b.type === 'paragraph') {
          if (!b.text) return null
          return (
            <p
              key={b.id || i}
              style={{
                margin: '0 0 10px',
                textAlign: b.align || 'justify',
                whiteSpace: 'pre-wrap',
                textIndent: i === 0 ? '2em' : 0,
              }}
            >
              {b.text}
            </p>
          )
        }
        if (b.type === 'list') {
          const items = (b.items || []).filter(Boolean)
          if (items.length === 0) return null
          if (b.style === 'numbered') {
            return (
              <ol
                key={b.id || i}
                style={{
                  margin: '0 0 12px',
                  paddingLeft: '2em',
                  listStyle: 'decimal',
                }}
              >
                {items.map((it, ii) => (
                  <li key={ii} style={{ marginBottom: 3 }}>{it}</li>
                ))}
              </ol>
            )
          }
          return (
            <ul
              key={b.id || i}
              style={{
                margin: '0 0 12px',
                paddingLeft: '2em',
                listStyle: 'disc',
              }}
            >
              {items.map((it, ii) => (
                <li key={ii} style={{ marginBottom: 3 }}>{it}</li>
              ))}
            </ul>
          )
        }
        if (b.type === 'spacer') {
          return <div key={b.id || i} style={{ height: b.height || 16 }} />
        }
        return null
      })}
    </div>
  )
}

function Signature({ notice }) {
  if (
    !notice.signature_image_url &&
    !notice.signature_name &&
    !notice.signature_title &&
    !notice.signature_org
  ) {
    return null
  }

  const align = notice.signature_align === 'left' ? 'flex-start' : 'flex-end'
  const textAlign = notice.signature_align === 'left' ? 'left' : 'right'

  return (
    <div
      style={{
        marginTop: 36,
        display: 'flex',
        justifyContent: align,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div style={{ textAlign, minWidth: '40%' }}>
        {notice.signature_image_url && (
          <img
            src={notice.signature_image_url}
            alt=""
            style={{
              maxHeight: 60,
              maxWidth: 180,
              objectFit: 'contain',
              marginBottom: 4,
            }}
            crossOrigin="anonymous"
          />
        )}
        {notice.signature_name && (
          <div style={{ fontWeight: 700 }}>{notice.signature_name}</div>
        )}
        {notice.signature_title && (
          <div style={{ fontWeight: 600, fontSize: '0.92em' }}>
            {notice.signature_title}
          </div>
        )}
        {notice.signature_org && (
          <div style={{ fontSize: '0.86em', whiteSpace: 'pre-line' }}>
            {notice.signature_org}
          </div>
        )}
      </div>
    </div>
  )
}

function CopyTo({ notice }) {
  const items = (notice.copy_to || []).filter(Boolean)
  if (items.length === 0) return null
  return (
    <div style={{ marginTop: 32, fontSize: '0.95em' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Copy to:</div>
      <ol style={{ margin: 0, paddingLeft: '2em', listStyle: 'decimal' }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ol>
    </div>
  )
}

function FooterBanner({ notice }) {
  if (!notice.footer_text) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '10px 14px',
        textAlign: 'center',
        fontWeight: 700,
        color: '#fff',
        background: notice.footer_color || '#dc2626',
        fontSize: '0.92em',
      }}
    >
      {notice.footer_text}
    </div>
  )
}

export default NoticeTemplate
