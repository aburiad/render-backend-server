import { motion } from 'framer-motion'

export default function Loader({ full = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <motion.div
           className="absolute inset-0 border-4 border-blue-100 rounded-full"
           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner Spinning Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Center Bullet */}
        <div className="absolute inset-4 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">Q</span>
        </div>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm font-bold text-gray-400 tracking-widest uppercase"
      >
        লোড হচ্ছে...
      </motion.p>
    </div>
  )

  if (full) {
    return (
      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="w-full py-20 flex items-center justify-center">
      {content}
    </div>
  )
}
