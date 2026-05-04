import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Mock framer-motion to avoid animation timing issues
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, ...props }) => <div {...filterDomProps(props)}>{children}</div>,
  },
}))

function filterDomProps(props) {
  const { initial, animate, exit, variants, transition, whileHover, whileTap, ...rest } = props
  return rest
}

// Mock api
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import api from '@/services/api'
import toast from 'react-hot-toast'
import ExamPortal from './ExamPortal'

const mockExam = {
  id: 'exam-1',
  title: 'গণিত পরীক্ষা',
  institution: 'টেস্ট স্কুল',
  duration: 30,
  revealResults: true,
  questions: [
    { id: 'q1', type: 'MCQ', question: 'প্রশ্ন ১?', option_a: 'ক', option_b: 'খ', option_c: 'গ', option_d: 'ঘ' },
    { id: 'q2', type: 'short', question: 'প্রশ্ন ২?' },
  ],
}

function renderExamPortal(examId = 'exam-1') {
  return render(
    <MemoryRouter initialEntries={[`/exam/${examId}`]}>
      <Routes>
        <Route path="/exam/:examId" element={<ExamPortal />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ExamPortal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('should show loading spinner initially', () => {
      api.get.mockReturnValue(new Promise(() => {}))
      renderExamPortal()
      expect(document.querySelector('.animate-spin')).toBeTruthy()
    })
  })

  describe('error state', () => {
    it('should show error on failed fetch', async () => {
      api.get.mockRejectedValue({ response: { data: { message: 'Not found' } } })
      renderExamPortal()

      await waitFor(() => {
        expect(screen.getByText('পরীক্ষা পাওয়া যায়নি')).toBeInTheDocument()
      })
    })
  })

  describe('entry step', () => {
    it('should show exam title and name input after load', async () => {
      api.get.mockResolvedValue({ data: { exam: mockExam } })
      renderExamPortal()

      await waitFor(() => {
        expect(screen.getByText('গণিত পরীক্ষা')).toBeInTheDocument()
      })
      expect(screen.getByPlaceholderText('পুরো নাম লিখুন')).toBeInTheDocument()
    })

    it('should show error toast when starting without name', async () => {
      api.get.mockResolvedValue({ data: { exam: mockExam } })
      const user = userEvent.setup()
      renderExamPortal()

      await waitFor(() => {
        expect(screen.getByText('পরীক্ষা শুরু করুন')).toBeInTheDocument()
      })

      await user.click(screen.getByText('পরীক্ষা শুরু করুন'))
      expect(toast.error).toHaveBeenCalledWith('আপনার নাম লিখুন')
    })
  })

  describe('exam step', () => {
    it('should show timer and questions after starting', async () => {
      api.get.mockResolvedValue({ data: { exam: mockExam } })
      const user = userEvent.setup()
      renderExamPortal()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('পুরো নাম লিখুন')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('পুরো নাম লিখুন'), 'টেস্ট')
      await user.click(screen.getByText('পরীক্ষা শুরু করুন'))

      await waitFor(() => {
        expect(screen.getByText('30:00')).toBeInTheDocument()
        expect(screen.getByText('পরীক্ষা জমা দিন')).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('should send startedAt with submission', async () => {
      api.get.mockResolvedValue({ data: { exam: mockExam } })
      api.post.mockResolvedValue({ data: { result: { score: 1, totalPossible: 2 } } })
      const user = userEvent.setup()
      renderExamPortal()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('পুরো নাম লিখুন')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('পুরো নাম লিখুন'), 'টেস্ট')
      await user.click(screen.getByText('পরীক্ষা শুরু করুন'))

      await waitFor(() => {
        expect(screen.getByText('পরীক্ষা জমা দিন')).toBeInTheDocument()
      })

      await user.click(screen.getByText('পরীক্ষা জমা দিন'))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1)
      })

      const callArgs = api.post.mock.calls[0]
      expect(callArgs[0]).toBe('/exam/exam-1/submit')
      expect(callArgs[1].startedAt).toBeTruthy()
      expect(callArgs[1].studentName).toBe('টেস্ট')
    })

    it('should show success screen after submission', async () => {
      api.get.mockResolvedValue({ data: { exam: mockExam } })
      api.post.mockResolvedValue({ data: { result: { score: 1, totalPossible: 2 } } })
      const user = userEvent.setup()
      renderExamPortal()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('পুরো নাম লিখুন')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('পুরো নাম লিখুন'), 'টেস্ট')
      await user.click(screen.getByText('পরীক্ষা শুরু করুন'))

      await waitFor(() => {
        expect(screen.getByText('পরীক্ষা জমা দিন')).toBeInTheDocument()
      })

      await user.click(screen.getByText('পরীক্ষা জমা দিন'))

      await waitFor(() => {
        expect(screen.getByText('সাফল্যের সাথে সম্পন্ন!')).toBeInTheDocument()
      })
    })
  })
})
