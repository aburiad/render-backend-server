import { create } from 'zustand'

const useExamStore = create((set) => ({
  exam: null,
  answers: {},
  timeRemaining: null,
  isSubmitted: false,

  setExam: (exam) => set({ exam, answers: {}, isSubmitted: false }),

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  markSubmitted: () => set({ isSubmitted: true }),

  resetExam: () =>
    set({ exam: null, answers: {}, timeRemaining: null, isSubmitted: false }),
}))

export default useExamStore
