const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')

function rowToRoutine(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    header_logo_url: row.header_logo_url || null,
    header_top_line: row.header_top_line || '',
    school_name: row.school_name || '',
    school_subtitle: row.school_subtitle || '',
    school_address: row.school_address || '',
    title: row.title || '',
    class_name: row.class_name || '',
    section: row.section || '',
    year: row.year || '',
    effective_from: row.effective_from || '',
    days: row.days || [],
    periods: row.periods || [],
    subjects: row.subjects || [],
    cells: row.cells || [],
    orientation: row.orientation || 'landscape',
    show_period_time: row.show_period_time !== false,
    show_teacher_name: row.show_teacher_name !== false,
    cell_height: row.cell_height ?? 50,
    footer_note: row.footer_note || '',
    signature_name: row.signature_name || '',
    signature_title: row.signature_title || '',
    deleted: row.deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const COLUMN_MAP = [
  'header_logo_url', 'header_top_line', 'school_name', 'school_subtitle', 'school_address',
  'title', 'class_name', 'section', 'year', 'effective_from',
  'days', 'periods', 'subjects', 'cells',
  'orientation', 'show_period_time', 'show_teacher_name', 'cell_height',
  'footer_note', 'signature_name', 'signature_title',
]

const routineService = {
  async create(userId, data) {
    const insert = { user_id: userId, deleted: false }
    for (const col of COLUMN_MAP) {
      if (data[col] !== undefined) insert[col] = data[col]
    }
    const { data: row, error } = await supabaseAdmin
      .from('class_routines')
      .insert(insert)
      .select()
      .single()
    if (error) throw error
    return rowToRoutine(row)
  },

  async listByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('class_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data || []).map(rowToRoutine)
  },

  async getById(routineId, userId) {
    const { data, error } = await supabaseAdmin
      .from('class_routines')
      .select('*')
      .eq('id', routineId)
      .maybeSingle()
    if (error) throw error
    const routine = rowToRoutine(data)
    if (!routine || routine.userId !== userId || routine.deleted) return null
    return routine
  },

  async update(routineId, userId, updates) {
    const existing = await this.getById(routineId, userId)
    if (!existing) return null

    const patch = {}
    for (const col of COLUMN_MAP) {
      if (updates[col] !== undefined) patch[col] = updates[col]
    }
    patch.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('class_routines')
      .update(patch)
      .eq('id', routineId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return rowToRoutine(data)
  },

  async softDelete(routineId, userId) {
    const existing = await this.getById(routineId, userId)
    if (!existing) throw new AppError('Routine not found', 404)
    const { error } = await supabaseAdmin
      .from('class_routines')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', routineId)
      .eq('user_id', userId)
    if (error) throw error
    return true
  },
}

module.exports = routineService
