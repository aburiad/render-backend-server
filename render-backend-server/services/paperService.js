const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')

function rowToPaper(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    institution_name: row.institution_name,
    exam_title: row.exam_title,
    class_name: row.class_name,
    subject: row.subject,
    instructions: row.instructions,
    session_year: row.session_year,
    time_minutes: row.time_minutes,
    total_marks: row.total_marks,
    header_alignment: row.header_alignment,
    layout: row.layout,
    watermark: row.watermark,
    set_variant: row.set_variant,
    logo_url: row.logo_url,
    section_mode: row.section_mode ?? false,
    questions: row.questions || [],
    print_settings: row.print_settings || null,
    deleted: row.deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const paperService = {
  async create(userId, paperData) {
    const insert = {
      user_id: userId,
      institution_name: paperData.institution_name || '',
      exam_title: paperData.exam_title,
      class_name: paperData.class_name || '',
      subject: paperData.subject || '',
      instructions: paperData.instructions || '',
      session_year: paperData.session_year || '',
      time_minutes: paperData.time_minutes ?? 60,
      total_marks: paperData.total_marks ?? 0,
      header_alignment: paperData.header_alignment || 'center',
      layout: paperData.layout || '1-column',
      watermark: paperData.watermark ?? null,
      set_variant: paperData.set_variant ?? null,
      logo_url: paperData.logo_url ?? null,
      section_mode: paperData.section_mode ?? false,
      questions: paperData.questions || [],
      print_settings: paperData.print_settings ?? null,
      deleted: false,
    }
    const { data, error } = await supabaseAdmin.from('papers').insert(insert).select().single()
    if (error) throw error
    return rowToPaper(data)
  },

  async listByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('papers')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data || []).map(rowToPaper)
  },

  async getById(paperId, userId) {
    const { data, error } = await supabaseAdmin.from('papers').select('*').eq('id', paperId).maybeSingle()
    if (error) throw error
    const paper = rowToPaper(data)
    if (!paper || paper.userId !== userId || paper.deleted) return null
    return paper
  },

  async update(paperId, userId, updates) {
    const row = await this.getById(paperId, userId)
    if (!row) return null

    const patch = {}
    const map = {
      institution_name: 'institution_name',
      exam_title: 'exam_title',
      class_name: 'class_name',
      subject: 'subject',
      instructions: 'instructions',
      session_year: 'session_year',
      time_minutes: 'time_minutes',
      total_marks: 'total_marks',
      header_alignment: 'header_alignment',
      layout: 'layout',
      watermark: 'watermark',
      set_variant: 'set_variant',
      logo_url: 'logo_url',
      section_mode: 'section_mode',
      questions: 'questions',
      print_settings: 'print_settings',
    }
    for (const [k, col] of Object.entries(map)) {
      if (updates[k] !== undefined) patch[col] = updates[k]
    }
    patch.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('papers')
      .update(patch)
      .eq('id', paperId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return rowToPaper(data)
  },

  async softDelete(paperId, userId) {
    const row = await this.getById(paperId, userId)
    if (!row) throw new AppError('Paper not found', 404)
    const { error } = await supabaseAdmin
      .from('papers')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', paperId)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },
}

module.exports = paperService
