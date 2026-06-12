import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PaymentFail() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">পেমেন্ট ব্যর্থ হয়েছে!</h1>
        <p className="text-gray-500 text-sm mb-8">দুঃখিত, কোনো সমস্যার কারণে আপনার পেমেন্টটি সম্পন্ন করা সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।</p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            আবার চেষ্টা করুন
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 text-gray-500 font-bold hover:text-gray-900 transition-all text-sm"
          >
            ড্যাশবোর্ডে ফিরে যান
          </button>
        </div>
      </motion.div>
    </div>
  )
}
