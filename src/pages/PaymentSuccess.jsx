import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import api from '@/services/api'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const tranId = searchParams.get('tran_id')
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Refresh user data to get the new subscription status
    const refreshUser = async () => {
      try {
        const { data } = await api.get('/auth/me') // Assuming we have or will have /me
        if (data.user) {
          setUser(data.user)
        }
      } catch (err) {
        console.error('Failed to refresh user', err)
      } finally {
        setLoading(false)
      }
    }
    
    refreshUser()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">পেমেন্ট সফল হয়েছে!</h1>
        <p className="text-gray-500 text-sm mb-8">অভিনন্দন! আপনার অ্যাকাউন্ট এখন **Pro** ভার্সনে আপগ্রেড হয়েছে। এখন থেকে আপনি সব প্রিমিয়াম ফিচার ব্যবহার করতে পারবেন।</p>
        
        <div className="bg-gray-50 p-4 rounded-2xl mb-8 text-left text-[11px] font-mono text-gray-400">
          <p>Transaction ID: {tranId}</p>
          <p>Status: Completed</p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          ড্যাশবোর্ডে ফিরে যান
        </button>
      </motion.div>
    </div>
  )
}
