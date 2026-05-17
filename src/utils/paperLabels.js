export const PAPER_LABEL_LANGUAGE_OPTIONS = [
  { value: 'bn', label: 'বাংলা' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'fa', label: 'فارسی' },
]

const PAPER_LABELS = {
  bn: {
    className: 'শ্রেণি',
    subject: 'বিষয়',
    time: 'সময়',
    minutes: 'মিনিট',
    totalMarks: 'পূর্ণমান',
    instructions: 'নির্দেশনা',
    set: 'সেট',
  },
  en: {
    className: 'Class',
    subject: 'Subject',
    time: 'Time',
    minutes: 'minutes',
    totalMarks: 'Full Marks',
    instructions: 'Instructions',
    set: 'Set',
  },
  ar: {
    className: 'الصف',
    subject: 'المادة',
    time: 'الوقت',
    minutes: 'دقيقة',
    totalMarks: 'الدرجة الكاملة',
    instructions: 'التعليمات',
    set: 'المجموعة',
  },
  fa: {
    className: 'کلاس',
    subject: 'مضمون',
    time: 'زمان',
    minutes: 'دقیقه',
    totalMarks: 'نمره کامل',
    instructions: 'دستورالعمل',
    set: 'گروه',
  },
}

export function getPaperLabels(language = 'bn') {
  return PAPER_LABELS[language] || PAPER_LABELS.bn
}
