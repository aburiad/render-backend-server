import { describe, it, expect, beforeEach } from 'vitest'
import useExamStore from './examStore'

describe('examStore', () => {
  beforeEach(() => {
    useExamStore.setState({
      exam: null,
      answers: {},
      timeRemaining: null,
      isSubmitted: false,
    })
  })

  describe('setExam', () => {
    it('should set exam and reset answers/submitted', () => {
      useExamStore.setState({ answers: { q1: 'a' }, isSubmitted: true })

      useExamStore.getState().setExam({ id: 'e1', title: 'Test Exam' })

      const state = useExamStore.getState()
      expect(state.exam).toEqual({ id: 'e1', title: 'Test Exam' })
      expect(state.answers).toEqual({})
      expect(state.isSubmitted).toBe(false)
    })
  })

  describe('setAnswer', () => {
    it('should set answer for a question', () => {
      useExamStore.getState().setAnswer('q1', 'a')
      expect(useExamStore.getState().answers).toEqual({ q1: 'a' })
    })

    it('should preserve other answers', () => {
      useExamStore.setState({ answers: { q1: 'a' } })
      useExamStore.getState().setAnswer('q2', 'b')

      expect(useExamStore.getState().answers).toEqual({ q1: 'a', q2: 'b' })
    })

    it('should overwrite existing answer', () => {
      useExamStore.setState({ answers: { q1: 'a' } })
      useExamStore.getState().setAnswer('q1', 'c')

      expect(useExamStore.getState().answers).toEqual({ q1: 'c' })
    })
  })

  describe('setTimeRemaining', () => {
    it('should set time remaining', () => {
      useExamStore.getState().setTimeRemaining(300)
      expect(useExamStore.getState().timeRemaining).toBe(300)
    })
  })

  describe('markSubmitted', () => {
    it('should set isSubmitted to true', () => {
      useExamStore.getState().markSubmitted()
      expect(useExamStore.getState().isSubmitted).toBe(true)
    })
  })

  describe('resetExam', () => {
    it('should reset all exam state', () => {
      useExamStore.setState({
        exam: { id: 'e1' },
        answers: { q1: 'a' },
        timeRemaining: 100,
        isSubmitted: true,
      })

      useExamStore.getState().resetExam()

      const state = useExamStore.getState()
      expect(state.exam).toBeNull()
      expect(state.answers).toEqual({})
      expect(state.timeRemaining).toBeNull()
      expect(state.isSubmitted).toBe(false)
    })
  })
})
