// Aggregate a teacher's weekly schedule from multiple class routines.
//
// Approach: each class routine has a `subjects[]` palette where each subject
// has a `teacher` field. For a given teacher name, we walk every routine,
// every cell, and collect the (day, period, class, subject, time) tuples
// that mention that teacher. Then we build a unified time-slot grid because
// different classes may have different period structures.

function buildSubjectMap(subjects) {
  const m = {}
  for (const s of subjects || []) m[s.id] = s
  return m
}

function buildPeriodMap(periods) {
  const m = {}
  for (const p of periods || []) m[p.id] = p
  return m
}

const norm = (s) => String(s || '').trim().toLowerCase()

/**
 * Get unique list of teachers across all class routines.
 * Returns: [{ name, count, classNames: [...] }] sorted by teaching load (count desc).
 */
export function listAllTeachers(routines) {
  const teacherMap = new Map() // normalized -> { display, count, classes: Set }
  for (const routine of routines || []) {
    const subjectMap = buildSubjectMap(routine.subjects)
    const cells = routine.cells || []
    const seenInThisRoutine = new Set()
    for (const cell of cells) {
      const subject = subjectMap[cell.subject_id]
      const teacher = (cell.override_teacher || subject?.teacher || '').trim()
      if (!teacher) continue
      const key = norm(teacher)
      if (!teacherMap.has(key)) {
        teacherMap.set(key, { display: teacher, count: 0, classes: new Set() })
      }
      const entry = teacherMap.get(key)
      entry.count += 1
      const className = routine.class_name || routine.title || 'রুটিন'
      entry.classes.add(className)
      // overwrite display with most recent canonical spelling (good enough)
      entry.display = teacher
      seenInThisRoutine.add(key)
    }
  }
  return [...teacherMap.values()]
    .map((e) => ({
      name: e.display,
      count: e.count,
      classNames: [...e.classes],
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Build a teacher's complete weekly schedule from class routines.
 * Returns:
 * {
 *   teacher,
 *   days: [...],                    // union of all days where teacher teaches
 *   timeSlots: [{ start, end, label }],   // unified, deduplicated, time-sorted
 *   cells: [{ day_index, time_slot_index, class_name, subject_name, color, period_label }],
 *   classCount, totalSlots, conflicts
 * }
 */
export function buildTeacherSchedule(routines, teacherName) {
  const target = norm(teacherName)
  const dayUnion = []
  const dayIndex = new Map() // day name -> index in unified days array
  const timeKey = (s, e) => `${s}__${e}`
  const timeMap = new Map()
  const entries = []

  for (const routine of routines || []) {
    const subjectMap = buildSubjectMap(routine.subjects)
    const periodMap = buildPeriodMap(routine.periods)
    const days = routine.days || []
    for (const cell of routine.cells || []) {
      const subject = subjectMap[cell.subject_id]
      if (!subject) continue
      const teacher = (cell.override_teacher || subject.teacher || '').trim()
      if (norm(teacher) !== target) continue
      const period = periodMap[cell.period_id]
      if (!period || period.is_break) continue
      const dayName = days[cell.day_index]
      if (!dayName) continue

      // Register day in union
      if (!dayIndex.has(dayName)) {
        dayIndex.set(dayName, dayUnion.length)
        dayUnion.push(dayName)
      }
      // Register time slot in union
      const start = period.start || ''
      const end = period.end || ''
      const tk = timeKey(start, end)
      if (!timeMap.has(tk)) {
        timeMap.set(tk, { start, end, label: period.label || '' })
      }
      entries.push({
        dayName,
        start,
        end,
        period_label: period.label || '',
        class_name: routine.class_name || routine.title || 'ক্লাস',
        subject_name: subject.name || '(নামহীন)',
        color: subject.color || '#475569',
      })
    }
  }

  // Sort time slots by start time (HH:MM lex sort works for 24h format)
  const timeSlots = [...timeMap.values()].sort((a, b) =>
    (a.start || '99').localeCompare(b.start || '99'),
  )
  const tIndex = new Map()
  timeSlots.forEach((t, i) => tIndex.set(timeKey(t.start, t.end), i))

  // Sort days according to standard Bangladeshi week (Sat-Fri); fall back
  // to insertion order for unknown day labels.
  const WEEK_ORDER = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'বৃহস্পতি']
  const orderedDays = [...dayUnion].sort((a, b) => {
    const ai = WEEK_ORDER.indexOf(a)
    const bi = WEEK_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return dayUnion.indexOf(a) - dayUnion.indexOf(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
  const orderedDayIndex = new Map()
  orderedDays.forEach((d, i) => orderedDayIndex.set(d, i))

  // Map entries to (day_index, time_slot_index) pairs.
  // Detect conflicts: same teacher in 2 cells at same (day, time slot).
  const cellMap = {} // `${di}_${ti}` → array of {class_name, subject_name, color}
  for (const e of entries) {
    const di = orderedDayIndex.get(e.dayName)
    const ti = tIndex.get(timeKey(e.start, e.end))
    if (di == null || ti == null) continue
    const key = `${di}_${ti}`
    if (!cellMap[key]) cellMap[key] = []
    cellMap[key].push({
      class_name: e.class_name,
      subject_name: e.subject_name,
      color: e.color,
    })
  }

  const cells = []
  let conflicts = 0
  const uniqueClasses = new Set()
  for (const [key, list] of Object.entries(cellMap)) {
    const [diStr, tiStr] = key.split('_')
    if (list.length > 1) conflicts += 1
    list.forEach((it) => uniqueClasses.add(it.class_name))
    cells.push({
      day_index: Number(diStr),
      time_slot_index: Number(tiStr),
      items: list,
    })
  }

  return {
    teacher: teacherName,
    days: orderedDays,
    timeSlots,
    cells,
    classCount: uniqueClasses.size,
    totalSlots: entries.length,
    conflicts,
  }
}
