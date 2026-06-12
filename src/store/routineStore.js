import { create } from 'zustand'

const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const SUBJECT_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#7c3aed',
  '#db2777', '#ea580c', '#0891b2', '#ca8a04',
  '#0d9488', '#9333ea', '#475569',
]

export function buildEmptyRoutine() {
  return {
    header_logo_url: null,
    header_top_line: '',
    school_name: '',
    school_subtitle: '',
    school_address: '',
    title: 'ক্লাস রুটিন',
    class_name: '',
    section: '',
    year: '',
    effective_from: '',
    days: ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ'],
    periods: [
      { id: uid(), label: '১ম', start: '09:00', end: '09:45', is_break: false, break_label: '' },
      { id: uid(), label: '২য়', start: '09:45', end: '10:30', is_break: false, break_label: '' },
      { id: uid(), label: '৩য়', start: '10:30', end: '11:15', is_break: false, break_label: '' },
      { id: uid(), label: 'টিফিন', start: '11:15', end: '11:45', is_break: true, break_label: 'টিফিন ব্রেক' },
      { id: uid(), label: '৪র্থ', start: '11:45', end: '12:30', is_break: false, break_label: '' },
      { id: uid(), label: '৫ম', start: '12:30', end: '13:15', is_break: false, break_label: '' },
    ],
    subjects: [],
    cells: [],
    orientation: 'landscape',
    show_period_time: true,
    show_teacher_name: true,
    cell_height: 50,
    footer_note: '',
    signature_name: '',
    signature_title: 'প্রধান শিক্ষক',
  }
}

export function buildDemoPrimary() {
  // Class 5 — 5 days, 5 periods + 1 break
  const subjects = [
    { id: uid(), name: 'বাংলা', teacher: 'রহমান স্যার', color: '#2563eb' },
    { id: uid(), name: 'English', teacher: 'Ms. Sultana', color: '#7c3aed' },
    { id: uid(), name: 'গণিত', teacher: 'করিম স্যার', color: '#dc2626' },
    { id: uid(), name: 'বিজ্ঞান', teacher: 'সালমা ম্যাডাম', color: '#16a34a' },
    { id: uid(), name: 'ধর্ম শিক্ষা', teacher: 'আবুল হাশেম স্যার', color: '#ca8a04' },
    { id: uid(), name: 'পরিবেশ', teacher: 'নাজনীন ম্যাডাম', color: '#0d9488' },
    { id: uid(), name: 'ছবি আঁকা', teacher: 'রিয়াজ স্যার', color: '#db2777' },
  ]
  const [bn, en, mt, sc, rl, ev, ar] = subjects

  const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ']
  const p1 = { id: uid(), label: '১ম', start: '08:00', end: '08:40', is_break: false, break_label: '' }
  const p2 = { id: uid(), label: '২য়', start: '08:40', end: '09:20', is_break: false, break_label: '' }
  const p3 = { id: uid(), label: '৩য়', start: '09:20', end: '10:00', is_break: false, break_label: '' }
  const tiffin = { id: uid(), label: 'টিফিন', start: '10:00', end: '10:20', is_break: true, break_label: 'টিফিন ব্রেক' }
  const p4 = { id: uid(), label: '৪র্থ', start: '10:20', end: '11:00', is_break: false, break_label: '' }
  const p5 = { id: uid(), label: '৫ম', start: '11:00', end: '11:40', is_break: false, break_label: '' }

  // Schedule
  const grid = {
    [p1.id]: [bn, en, mt, sc, bn],
    [p2.id]: [mt, bn, en, ev, mt],
    [p3.id]: [en, mt, bn, en, sc],
    [p4.id]: [sc, ev, rl, mt, en],
    [p5.id]: [ar, sc, ev, ar, ev],
  }
  const cells = []
  Object.entries(grid).forEach(([periodId, list]) => {
    list.forEach((subj, dayIdx) => {
      cells.push({ day_index: dayIdx, period_id: periodId, subject_id: subj.id })
    })
  })

  return {
    ...buildEmptyRoutine(),
    title: 'ক্লাস রুটিন',
    class_name: '৫ম শ্রেণি',
    year: '২০২৫',
    effective_from: '১ জানুয়ারি ২০২৫',
    school_name: 'উদাহরণ প্রাথমিক বিদ্যালয়',
    school_subtitle: 'ঢাকা',
    days,
    periods: [p1, p2, p3, tiffin, p4, p5],
    subjects,
    cells,
    signature_name: '',
    signature_title: 'প্রধান শিক্ষক',
  }
}

export function buildDemoSecondary() {
  // Class 9 — 6 days, 7 periods + 2 breaks
  const subjects = [
    { id: uid(), name: 'বাংলা', teacher: 'রহমান স্যার', color: '#2563eb' },
    { id: uid(), name: 'English', teacher: 'Ms. Akter', color: '#7c3aed' },
    { id: uid(), name: 'গণিত', teacher: 'করিম স্যার', color: '#dc2626' },
    { id: uid(), name: 'পদার্থ', teacher: 'হোসেন স্যার', color: '#0891b2' },
    { id: uid(), name: 'রসায়ন', teacher: 'নাসরিন ম্যাডাম', color: '#9333ea' },
    { id: uid(), name: 'জীববিজ্ঞান', teacher: 'মাহবুব স্যার', color: '#16a34a' },
    { id: uid(), name: 'ICT', teacher: 'ফারুক স্যার', color: '#ea580c' },
    { id: uid(), name: 'ইসলাম শিক্ষা', teacher: 'আবু বকর স্যার', color: '#ca8a04' },
    { id: uid(), name: 'সমাজ', teacher: 'রিনা ম্যাডাম', color: '#0d9488' },
  ]
  const [bn, en, mt, ph, ch, bi, ic, rl, sc] = subjects

  const days = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ']
  const p1 = { id: uid(), label: '১ম', start: '09:00', end: '09:45', is_break: false, break_label: '' }
  const p2 = { id: uid(), label: '২য়', start: '09:45', end: '10:30', is_break: false, break_label: '' }
  const p3 = { id: uid(), label: '৩য়', start: '10:30', end: '11:15', is_break: false, break_label: '' }
  const sb = { id: uid(), label: 'ছোট ব্রেক', start: '11:15', end: '11:25', is_break: true, break_label: 'ছোট ব্রেক' }
  const p4 = { id: uid(), label: '৪র্থ', start: '11:25', end: '12:10', is_break: false, break_label: '' }
  const p5 = { id: uid(), label: '৫ম', start: '12:10', end: '12:55', is_break: false, break_label: '' }
  const tf = { id: uid(), label: 'টিফিন', start: '12:55', end: '13:30', is_break: true, break_label: 'টিফিন ব্রেক' }
  const p6 = { id: uid(), label: '৬ষ্ঠ', start: '13:30', end: '14:15', is_break: false, break_label: '' }
  const p7 = { id: uid(), label: '৭ম', start: '14:15', end: '15:00', is_break: false, break_label: '' }

  const grid = {
    [p1.id]: [bn, ph, en, ch, mt, bi],
    [p2.id]: [mt, bn, ph, en, ch, bn],
    [p3.id]: [en, mt, bi, bn, en, ph],
    [p4.id]: [ph, ic, mt, ph, bn, mt],
    [p5.id]: [ch, bi, ch, mt, bi, ic],
    [p6.id]: [bi, en, ic, bi, ph, en],
    [p7.id]: [rl, sc, bn, rl, sc, ch],
  }
  const cells = []
  Object.entries(grid).forEach(([periodId, list]) => {
    list.forEach((subj, dayIdx) => {
      cells.push({ day_index: dayIdx, period_id: periodId, subject_id: subj.id })
    })
  })

  return {
    ...buildEmptyRoutine(),
    title: 'ক্লাস রুটিন',
    class_name: '৯ম শ্রেণি',
    section: 'বিজ্ঞান বিভাগ',
    year: '২০২৫',
    effective_from: '১ জানুয়ারি ২০২৫',
    school_name: 'উদাহরণ মাধ্যমিক বিদ্যালয়',
    school_subtitle: 'ঢাকা',
    days,
    periods: [p1, p2, p3, sb, p4, p5, tf, p6, p7],
    subjects,
    cells,
    signature_title: 'প্রধান শিক্ষক',
  }
}

export const SUBJECT_COLOR_PALETTE = SUBJECT_COLORS

const useRoutineStore = create((set) => ({
  currentRoutine: null,
  isDirty: false,

  setRoutine: (r) => set({ currentRoutine: r, isDirty: false }),
  updateRoutine: (fields) =>
    set((s) => ({ currentRoutine: { ...s.currentRoutine, ...fields }, isDirty: true })),

  // Period helpers
  addPeriod: () =>
    set((s) => ({
      currentRoutine: {
        ...s.currentRoutine,
        periods: [
          ...(s.currentRoutine?.periods || []),
          { id: uid(), label: `${(s.currentRoutine?.periods?.length || 0) + 1}`, start: '', end: '', is_break: false, break_label: '' },
        ],
      },
      isDirty: true,
    })),
  updatePeriod: (id, fields) =>
    set((s) => ({
      currentRoutine: {
        ...s.currentRoutine,
        periods: (s.currentRoutine?.periods || []).map((p) => (p.id === id ? { ...p, ...fields } : p)),
      },
      isDirty: true,
    })),
  removePeriod: (id) =>
    set((s) => ({
      currentRoutine: {
        ...s.currentRoutine,
        periods: (s.currentRoutine?.periods || []).filter((p) => p.id !== id),
        cells: (s.currentRoutine?.cells || []).filter((c) => c.period_id !== id),
      },
      isDirty: true,
    })),

  // Day helpers
  setDays: (days) =>
    set((s) => {
      const oldLen = s.currentRoutine?.days?.length || 0
      const newLen = days.length
      // If days shrunk, drop cells with day_index >= newLen
      const cells =
        newLen < oldLen
          ? (s.currentRoutine?.cells || []).filter((c) => c.day_index < newLen)
          : s.currentRoutine?.cells || []
      return {
        currentRoutine: { ...s.currentRoutine, days, cells },
        isDirty: true,
      }
    }),

  // Subject palette
  addSubject: (name = '', teacher = '') =>
    set((s) => {
      const usedColors = new Set((s.currentRoutine?.subjects || []).map((x) => x.color))
      const available = SUBJECT_COLORS.find((c) => !usedColors.has(c)) || SUBJECT_COLORS[0]
      return {
        currentRoutine: {
          ...s.currentRoutine,
          subjects: [
            ...(s.currentRoutine?.subjects || []),
            { id: uid(), name, teacher, color: available },
          ],
        },
        isDirty: true,
      }
    }),
  updateSubject: (id, fields) =>
    set((s) => ({
      currentRoutine: {
        ...s.currentRoutine,
        subjects: (s.currentRoutine?.subjects || []).map((sub) =>
          sub.id === id ? { ...sub, ...fields } : sub,
        ),
      },
      isDirty: true,
    })),
  removeSubject: (id) =>
    set((s) => ({
      currentRoutine: {
        ...s.currentRoutine,
        subjects: (s.currentRoutine?.subjects || []).filter((sub) => sub.id !== id),
        // also clear any cells that reference this subject
        cells: (s.currentRoutine?.cells || []).filter((c) => c.subject_id !== id),
      },
      isDirty: true,
    })),

  // Cell helpers
  setCell: (dayIndex, periodId, subjectId) =>
    set((s) => {
      const others = (s.currentRoutine?.cells || []).filter(
        (c) => !(c.day_index === dayIndex && c.period_id === periodId),
      )
      const next = subjectId
        ? [...others, { day_index: dayIndex, period_id: periodId, subject_id: subjectId }]
        : others
      return { currentRoutine: { ...s.currentRoutine, cells: next }, isDirty: true }
    }),

  copyDayColumn: (fromIdx, toIdx) =>
    set((s) => {
      const cells = s.currentRoutine?.cells || []
      const targetWiped = cells.filter((c) => c.day_index !== toIdx)
      const fromCells = cells
        .filter((c) => c.day_index === fromIdx)
        .map((c) => ({ ...c, day_index: toIdx }))
      return {
        currentRoutine: {
          ...s.currentRoutine,
          cells: [...targetWiped, ...fromCells],
        },
        isDirty: true,
      }
    }),

  clearRoutine: () => set({ currentRoutine: null, isDirty: false }),
  markClean: () => set({ isDirty: false }),
}))

export default useRoutineStore
