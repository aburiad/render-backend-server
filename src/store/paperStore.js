import { create } from 'zustand'

const usePaperStore = create((set, get) => ({
  currentPaper: null,
  questions: [],
  isDirty: false,

  setPaper: (paper) =>
    set({
      currentPaper: paper,
      questions: paper?.questions || [],
      isDirty: false,
    }),

  updatePaper: (fields) =>
    set((state) => ({
      currentPaper: { ...state.currentPaper, ...fields },
      isDirty: true,
    })),

  setQuestions: (questions) => set({ questions, isDirty: true }),

  addQuestion: (question) =>
    set((state) => ({
      questions: [
        ...state.questions,
        { ...question, id: question.id || crypto.randomUUID(), order: state.questions.length },
      ],
      isDirty: true,
    })),

  updateQuestion: (id, fields) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...fields } : q
      ),
      isDirty: true,
    })),

  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, order: i })),
      isDirty: true,
    })),

  duplicateQuestion: (id) =>
    set((state) => {
      const index = state.questions.findIndex((q) => q.id === id)
      if (index === -1) return state

      const original = state.questions[index]
      const duplicate = {
        ...original,
        id: crypto.randomUUID(),
      }

      const newQuestions = [...state.questions]
      newQuestions.splice(index + 1, 0, duplicate)

      return {
        questions: newQuestions.map((q, i) => ({ ...q, order: i })),
        isDirty: true,
      }
    }),

  reorderQuestions: (questions) =>
    set({
      questions: questions.map((q, i) => ({ ...q, order: i })),
      isDirty: true,
    }),

  clearPaper: () =>
    set({ currentPaper: null, questions: [], isDirty: false }),

  markClean: () => set({ isDirty: false }),

  getTotalMarks: () => {
    const { questions } = get()
    return questions.reduce((sum, q) => {
      if (q.type === 'CQ') {
        const subMarks = (q.sub_questions || []).reduce(
          (s, sq) => s + (Number(sq.marks) || 0),
          0
        )
        return sum + subMarks
      }
      return sum + (Number(q.marks) || 0)
    }, 0)
  },
}))

export default usePaperStore
