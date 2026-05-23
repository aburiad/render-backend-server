const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')

function rowToNotice(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    header_top_line: row.header_top_line || '',
    header_logo_url: row.header_logo_url || null,
    header_org_name: row.header_org_name || '',
    header_subtitle: row.header_subtitle || '',
    header_address: row.header_address || '',
    header_extra: row.header_extra || '',
    header_contact: row.header_contact || '',
    header_alignment: row.header_alignment || 'center',
    header_band_color: row.header_band_color || '',
    reference_no: row.reference_no || '',
    notice_date: row.notice_date || '',
    date_label: row.date_label || 'তারিখ',
    title: row.title || '',
    show_title: row.show_title !== false,
    subject: row.subject || '',
    body_blocks: row.body_blocks || [],
    signature_image_url: row.signature_image_url || null,
    signature_name: row.signature_name || '',
    signature_title: row.signature_title || '',
    signature_org: row.signature_org || '',
    signature_align: row.signature_align || 'right',
    copy_to: row.copy_to || [],
    footer_text: row.footer_text || '',
    footer_color: row.footer_color || '',
    style_preset: row.style_preset || 'classic',
    deleted: row.deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const COLUMN_MAP = [
  'header_top_line', 'header_logo_url', 'header_org_name', 'header_subtitle',
  'header_address', 'header_extra', 'header_contact', 'header_alignment',
  'header_band_color', 'reference_no', 'notice_date', 'date_label',
  'title', 'show_title', 'subject', 'body_blocks',
  'signature_image_url', 'signature_name', 'signature_title', 'signature_org',
  'signature_align', 'copy_to', 'footer_text', 'footer_color', 'style_preset',
]

const noticeService = {
  async create(userId, data) {
    const insert = { user_id: userId, deleted: false }
    for (const col of COLUMN_MAP) {
      if (data[col] !== undefined) insert[col] = data[col]
    }
    const { data: row, error } = await supabaseAdmin
      .from('notices')
      .insert(insert)
      .select()
      .single()
    if (error) throw error
    return rowToNotice(row)
  },

  async listByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data || []).map(rowToNotice)
  },

  async getById(noticeId, userId) {
    const { data, error } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', noticeId)
      .maybeSingle()
    if (error) throw error
    const notice = rowToNotice(data)
    if (!notice || notice.userId !== userId || notice.deleted) return null
    return notice
  },

  async update(noticeId, userId, updates) {
    const existing = await this.getById(noticeId, userId)
    if (!existing) return null

    const patch = {}
    for (const col of COLUMN_MAP) {
      if (updates[col] !== undefined) patch[col] = updates[col]
    }
    patch.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('notices')
      .update(patch)
      .eq('id', noticeId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return rowToNotice(data)
  },

  async softDelete(noticeId, userId) {
    const existing = await this.getById(noticeId, userId)
    if (!existing) throw new AppError('Notice not found', 404)
    const { error } = await supabaseAdmin
      .from('notices')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', noticeId)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },
}

module.exports = noticeService
