import { describe, it, expect, beforeEach } from 'vitest'
import usePaperStore from './paperStore'

describe('paperStore', () => {
  beforeEach(() => {
    usePaperStore.setState({
      currentPaper: null,
      questions: [],
      isDirty: false,
    })
  })

  describe('setPaper', () => {
    it('should set paper and extract questions', () => {
      const paper = { id: '1', title: 'Test', questions: [{ id: 'q1', text: 'Q?' }] }
      usePaperStore.getState().setPaper(paper)

      expect(usePaperStore.getState().currentPaper).toEqual(paper)
      expect(usePaperStore.getState().questions).toEqual(paper.questions)
      expect(usePaperStore.getState().isDirty).toBe(false)
    })

    it('should handle paper without questions', () => {
      usePaperStore.getState().setPaper({ id: '1' })
      expect(usePaperStore.getState().questions).toEqual([])
    })
  })

  describe('updatePaper', () => {
    it('should merge fields and mark dirty', () => {
      usePaperStore.setState({ currentPaper: { id: '1', title: 'Old' } })
      usePaperStore.getState().updatePaper({ title: 'New' })

      expect(usePaperStore.getState().currentPaper.title).toBe('New')
      expect(usePaperStore.getState().currentPaper.id).toBe('1')
      expect(usePaperStore.getState().isDirty).toBe(true)
    })
  })

  describe('addQuestion', () => {
    it('should add question with order', () => {
      usePaperStore.getState().addQuestion({ text: 'Q1', type: 'MCQ' })

      const questions = usePaperStore.getState().questions
      expect(questions).toHaveLength(1)
      expect(questions[0].text).toBe('Q1')
      expect(questions[0].order).toBe(0)
      expect(questions[0].id).toBeTruthy()
      expect(usePaperStore.getState().isDirty).toBe(true)
    })

    it('should assign correct order for multiple questions', () => {
      usePaperStore.getState().addQuestion({ text: 'Q1' })
      usePaperStore.getState().addQuestion({ text: 'Q2' })

      const questions = usePaperStore.getState().questions
      expect(questions[0].order).toBe(0)
      expect(questions[1].order).toBe(1)
    })
  })

  describe('updateQuestion', () => {
    it('should update specific question by id', () => {
      usePaperStore.setState({ questions: [{ id: 'q1', text: 'Old', marks: 5 }] })
      usePaperStore.getState().updateQuestion('q1', { text: 'New' })

      expect(usePaperStore.getState().questions[0].text).toBe('New')
      expect(usePaperStore.getState().questions[0].marks).toBe(5)
    })

    it('should not affect other questions', () => {
      usePaperStore.setState({ questions: [{ id: 'q1', text: 'A' }, { id: 'q2', text: 'B' }] })
      usePaperStore.getState().updateQuestion('q1', { text: 'Updated' })

      expect(usePaperStore.getState().questions[1].text).toBe('B')
    })
  })

  describe('removeQuestion', () => {
    it('should remove question and reorder', () => {
      usePaperStore.setState({
        questions: [
          { id: 'q1', text: 'A', order: 0 },
          { id: 'q2', text: 'B', order: 1 },
          { id: 'q3', text: 'C', order: 2 },
        ],
      })

      usePaperStore.getState().removeQuestion('q2')

      const questions = usePaperStore.getState().questions
      expect(questions).toHaveLength(2)
      expect(questions[0].id).toBe('q1')
      expect(questions[0].order).toBe(0)
      expect(questions[1].id).toBe('q3')
      expect(questions[1].order).toBe(1)
    })
  })

  describe('duplicateQuestion', () => {
    it('should duplicate question after original', () => {
      usePaperStore.setState({
        questions: [
          { id: 'q1', text: 'A', order: 0 },
          { id: 'q2', text: 'B', order: 1 },
        ],
      })

      usePaperStore.getState().duplicateQuestion('q1')

      const questions = usePaperStore.getState().questions
      expect(questions).toHaveLength(3)
      expect(questions[0].id).toBe('q1')
      expect(questions[1].text).toBe('A') // duplicate has same text
      expect(questions[1].id).not.toBe('q1') // but different id
      expect(questions[2].id).toBe('q2')
      // orders should be sequential
      expect(questions.map((q) => q.order)).toEqual([0, 1, 2])
    })

    it('should do nothing for non-existent id', () => {
      usePaperStore.setState({ questions: [{ id: 'q1', text: 'A' }] })
      usePaperStore.getState().duplicateQuestion('nonexistent')
      expect(usePaperStore.getState().questions).toHaveLength(1)
    })
  })

  describe('reorderQuestions', () => {
    it('should reorder and reassign order indices', () => {
      const reordered = [
        { id: 'q3', text: 'C' },
        { id: 'q1', text: 'A' },
        { id: 'q2', text: 'B' },
      ]
      usePaperStore.getState().reorderQuestions(reordered)

      const questions = usePaperStore.getState().questions
      expect(questions[0].id).toBe('q3')
      expect(questions[0].order).toBe(0)
      expect(questions[2].order).toBe(2)
    })
  })

  describe('getTotalMarks', () => {
    it('should sum marks of all questions', () => {
      usePaperStore.setState({
        questions: [
          { id: 'q1', type: 'MCQ', marks: 5 },
          { id: 'q2', type: 'short', marks: 10 },
        ],
      })

      expect(usePaperStore.getState().getTotalMarks()).toBe(15)
    })

    it('should sum sub_questions marks for CQ type', () => {
      usePaperStore.setState({
        questions: [
          {
            id: 'q1',
            type: 'CQ',
            sub_questions: [
              { label: 'a', marks: 2 },
              { label: 'b', marks: 4 },
              { label: 'c', marks: 6 },
            ],
          },
          { id: 'q2', type: 'MCQ', marks: 1 },
        ],
      })

      expect(usePaperStore.getState().getTotalMarks()).toBe(13) // 2+4+6 + 1
    })

    it('should handle missing marks gracefully', () => {
      usePaperStore.setState({
        questions: [{ id: 'q1', type: 'MCQ' }],
      })
      expect(usePaperStore.getState().getTotalMarks()).toBe(0)
    })
  })

  describe('clearPaper', () => {
    it('should reset all state', () => {
      usePaperStore.setState({
        currentPaper: { id: '1' },
        questions: [{ id: 'q1' }],
        isDirty: true,
      })

      usePaperStore.getState().clearPaper()

      expect(usePaperStore.getState().currentPaper).toBeNull()
      expect(usePaperStore.getState().questions).toEqual([])
      expect(usePaperStore.getState().isDirty).toBe(false)
    })
  })

  describe('markClean', () => {
    it('should set isDirty to false', () => {
      usePaperStore.setState({ isDirty: true })
      usePaperStore.getState().markClean()
      expect(usePaperStore.getState().isDirty).toBe(false)
    })
  })
})
