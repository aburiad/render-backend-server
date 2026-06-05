const { supabaseAdmin } = require('../config/supabase')

const SUBJECTS_MAP = {
  bangla: 'বাংলা',
  english: 'English',
  math: 'গণিত',
  science: 'বিজ্ঞান',
  accounting: 'হিসাববিজ্ঞান',
}

let curriculumCache

async function loadCurriculum() {
  if (curriculumCache !== undefined) return curriculumCache
  try {
    curriculumCache = require('../data/bookCurriculumFallback.json')
  } catch (err) {
    console.warn('bookService: bundled curriculum missing:', err.message)
    curriculumCache = null
  }
  return curriculumCache
}

function fallbackSubjectEntries(curriculum, classNum) {
  if (!curriculum) return []
  const subjects = curriculum[String(classNum)]?.subjects
  if (!subjects) return []
  return Object.keys(subjects).map((key) => ({
    id: key,
    label: SUBJECTS_MAP[key] || subjects[key]?.label || key,
  }))
}

function fallbackChapters(curriculum, classNum, subject) {
  if (!curriculum) return []
  const subj = curriculum[String(classNum)]?.subjects?.[subject]
  if (!subj?.chapters) return []
  return subj.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    type: '',
    chapterNumber: parseInt(String(ch.id).replace(/\D/g, '')) || null,
  }))
}

function fallbackSubchapters(curriculum, classNum, subject, parentChapterId) {
  if (!curriculum) return []
  const subj = curriculum[String(classNum)]?.subjects?.[subject]
  if (!subj?.chapters) return []
  const ch = subj.chapters.find((c) => c.id === parentChapterId)
  if (!ch) return []
  return (ch.subchapters || []).map((s) => ({
    id: s.id,
    title: s.title,
    type: s.type || 'concept',
    questionCounts: { mcq: 0, cq: 0, saq: 0, total: 0 },
  }))
}

function curriculumSyntheticPoints(curriculum, classNum, subject, chapterId) {
  if (!curriculum) return null
  const subj = curriculum[String(classNum)]?.subjects?.[subject]
  if (!subj?.chapters) return null
  for (const ch of subj.chapters) {
    if (ch.id === chapterId) {
      const points = (ch.subchapters || []).map((s) =>
        `${s.id} ${s.title}${s.titleEn ? ` (${s.titleEn})` : ''}`.trim(),
      )
      if (points.length === 0) points.push(ch.title)
      return { title: ch.title, points, summary: '' }
    }
    const sub = ch.subchapters?.find((s) => s.id === chapterId)
    if (sub) {
      return {
        title: `${ch.title} › ${sub.title}`,
        points: [
          `${sub.title}${sub.titleEn ? ` (${sub.titleEn})` : ''}`,
          `অধ্যায়: ${ch.title}`,
        ],
        summary: '',
      }
    }
  }
  return null
}

const bookService = {
  async getSubjects(classNum) {
    const { data, error } = await supabaseAdmin
      .from('book_chapters')
      .select('subject')
      .eq('class_num', classNum)
    if (error) throw error
    const fromDb = [...new Set((data || []).map((r) => r.subject))].map((key) => ({
      id: key,
      label: SUBJECTS_MAP[key] || key,
    }))

    const curriculum = await loadCurriculum()
    const fromFallback = fallbackSubjectEntries(curriculum, classNum)

    const map = new Map()
    for (const s of [...fromDb, ...fromFallback]) {
      map.set(s.id, s)
    }
    return [...map.values()].sort((a, b) => a.id.localeCompare(b.id))
  },

  async getChapters(classNum, subject) {
    // Only fetch full chapters (not subchapter rows). Use is_subchapter=false flag.
    const { data, error } = await supabaseAdmin
      .from('book_chapters')
      .select('chapter_id, title, payload')
      .eq('class_num', classNum)
      .eq('subject', subject)
      .eq('is_subchapter', false)
    if (error) throw error
    const fromDb = (data || []).map((row) => {
      const p = row.payload || {}
      return {
        id: row.chapter_id,
        title: row.title || row.chapter_id,
        type: p.type || '',
        chapterNumber: p.metadata?.chapterNumber ?? null,
      }
    })
    if (fromDb.length > 0) {
      // Sort by chapter number
      return fromDb.sort((a, b) => {
        const aNum = a.chapterNumber ?? parseInt(a.id.replace(/\D/g, '')) ?? 0
        const bNum = b.chapterNumber ?? parseInt(b.id.replace(/\D/g, '')) ?? 0
        return aNum - bNum
      })
    }

    const curriculum = await loadCurriculum()
    return fallbackChapters(curriculum, classNum, subject)
  },

  async getChapterPoints(classNum, subject, chapterIds) {
    const results = []
    const curriculum = await loadCurriculum()
    for (const chapterId of chapterIds) {
      const { data, error } = await supabaseAdmin
        .from('book_chapters')
        .select('chapter_id, title, payload')
        .eq('class_num', classNum)
        .eq('subject', subject)
        .eq('chapter_id', chapterId)
        .maybeSingle()
      if (error) throw error
      if (data) {
        const p = data.payload || {}
        results.push({
          chapterId,
          title: data.title || chapterId,
          points: p.question_points || [],
          summary: p.ai_summary || '',
        })
        continue
      }
      const syn = curriculumSyntheticPoints(curriculum, classNum, subject, chapterId)
      if (syn) {
        results.push({
          chapterId,
          title: syn.title,
          points: syn.points,
          summary: syn.summary,
        })
      }
    }
    return results
  },

  async saveChapter(classNum, subject, chapterId, chapterData) {
    const payload = {
      type: chapterData.type,
      full_text: chapterData.full_text,
      metadata: chapterData.metadata,
      question_points: chapterData.question_points,
      ai_summary: chapterData.ai_summary,
    }
    const { error } = await supabaseAdmin.from('book_chapters').upsert(
      {
        class_num: classNum,
        subject,
        chapter_id: chapterId,
        title: chapterData.title || chapterId,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'class_num,subject,chapter_id' },
    )
    if (error) throw error
    return { success: true, path: `book_chapters/${classNum}/${subject}/${chapterId}` }
  },

  /**
   * Get subchapters for a given chapter (with question counts)
   */
  async getSubchapters(classNum, subject, parentChapterId) {
    const { data, error } = await supabaseAdmin
      .from('book_chapters')
      .select('chapter_id, subchapter_id, title, payload')
      .eq('class_num', classNum)
      .eq('subject', subject)
      .eq('parent_chapter_id', parentChapterId)
      .eq('is_subchapter', true)
    if (error) throw error

    // Get question counts per subchapter
    const subIds = (data || []).map((r) => r.subchapter_id).filter(Boolean)
    const counts = {}
    if (subIds.length > 0) {
      const { data: qData } = await supabaseAdmin
        .from('book_questions')
        .select('subchapter_id, question_type')
        .eq('class_num', classNum)
        .eq('subject', subject)
        .eq('chapter_id', parentChapterId)
        .in('subchapter_id', subIds)
      for (const q of qData || []) {
        if (!counts[q.subchapter_id]) {
          counts[q.subchapter_id] = { mcq: 0, cq: 0, saq: 0, total: 0 }
        }
        counts[q.subchapter_id].total++
        if (counts[q.subchapter_id][q.question_type] !== undefined) {
          counts[q.subchapter_id][q.question_type]++
        }
      }
    }

    const fromDb = (data || []).map((r) => ({
      id: r.subchapter_id,
      title: r.title,
      type: r.payload?.type || 'concept',
      questionCounts: counts[r.subchapter_id] || { mcq: 0, cq: 0, saq: 0, total: 0 },
    }))
    if (fromDb.length > 0) {
      return fromDb.sort((a, b) =>
        String(a.id).localeCompare(String(b.id), 'en', { numeric: true }),
      )
    }

    const curriculum = await loadCurriculum()
    return fallbackSubchapters(curriculum, classNum, subject, parentChapterId)
  },

  /**
   * Get existing book questions for selected chapters/subchapters.
   * selections: [{ chapterId, subchapterIds: ['1.1', 'all', ...] }, ...]
   */
  async getExistingQuestions(classNum, subject, selections, filters = {}) {
    const results = []

    for (const sel of selections || []) {
      let q = supabaseAdmin
        .from('book_questions')
        .select('*')
        .eq('class_num', classNum)
        .eq('subject', subject)
        .eq('chapter_id', sel.chapterId)

      // Filter by subchapter_ids if not "all"
      const wantsAll = !sel.subchapterIds || sel.subchapterIds.includes('all') || sel.subchapterIds.length === 0
      if (!wantsAll) {
        q = q.in('subchapter_id', sel.subchapterIds)
      }

      if (filters.types && filters.types.length > 0) {
        q = q.in('question_type', filters.types)
      }

      const limit = sel.count ? Math.min(Math.max(1, sel.count), 50) : 999

      const { data, error } = await q
        .order('ordering', { ascending: true })
        .limit(limit)
      if (error) throw error

      console.log(`[getExistingQuestions] ch=${sel.chapterId} count=${sel.count} limit=${limit} dbRows=${(data || []).length}`)

      // Double-safety: also slice in JS (in case Supabase limit is ignored)
      const rows = (data || []).slice(0, limit)

      for (const row of rows) {
        results.push({
          id: row.id,
          chapterId: row.chapter_id,
          subchapterId: row.subchapter_id,
          type: row.question_type,
          data: row.question_data,
          source: row.source_section,
        })
      }
    }

    return results
  },

  /**
   * Get content (full_text) for selected chapters/subchapters — used as AI context
   */
  async getContentForSelections(classNum, subject, selections) {
    const blocks = []

    for (const sel of selections || []) {
      const wantsAll = !sel.subchapterIds || sel.subchapterIds.includes('all') || sel.subchapterIds.length === 0

      if (wantsAll) {
        // Fetch full chapter
        const { data, error } = await supabaseAdmin
          .from('book_chapters')
          .select('chapter_id, title, payload')
          .eq('class_num', classNum)
          .eq('subject', subject)
          .eq('chapter_id', sel.chapterId)
          .maybeSingle()
        if (error) throw error
        if (data) {
          blocks.push({
            chapterId: sel.chapterId,
            subchapterId: null,
            title: data.title,
            content: data.payload?.full_text || '',
          })
        }
      } else {
        // Fetch each subchapter
        const { data, error } = await supabaseAdmin
          .from('book_chapters')
          .select('chapter_id, subchapter_id, title, payload')
          .eq('class_num', classNum)
          .eq('subject', subject)
          .eq('parent_chapter_id', sel.chapterId)
          .in('subchapter_id', sel.subchapterIds)
        if (error) throw error
        for (const row of data || []) {
          blocks.push({
            chapterId: sel.chapterId,
            subchapterId: row.subchapter_id,
            title: row.title,
            content: row.payload?.full_text || '',
          })
        }
      }
    }

    return blocks
  },
}

module.exports = bookService
