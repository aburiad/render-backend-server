import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export default function ProGate({ feature, children }) {
  const subscription = useAuthStore((s) => s.user?.subscription)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  if (subscription === 'pro') {
    return children
  }

  return (
    <>
      <div onClick={() => setShowModal(true)} className="cursor-pointer relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
            Pro ফিচার
          </span>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pro তে আপগ্রেড করুন</h3>
            <p className="text-gray-500 text-sm mb-4">
              এই ফিচারটি ব্যবহার করতে Pro প্ল্যানে আপগ্রেড করুন। মাত্র ২৯৯ টাকা/মাস।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
              >
                পরে
              </button>
              <button 
                onClick={() => {
                  setShowModal(false)
                  navigate('/pricing')
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
              >
                আপগ্রেড
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
