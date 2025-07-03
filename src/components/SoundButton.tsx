import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

interface SoundButtonProps {
  isMuted: boolean
  onToggle: () => void
}

const SoundButton: React.FC<SoundButtonProps> = ({ isMuted, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed top-4 right-4 z-50 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-bluey-blue hover:bg-bluey-blue hover:text-white transition-all"
      title={isMuted ? "Turn sound on" : "Turn sound off"}
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6 text-bluey-blue hover:text-white" />
      ) : (
        <Volume2 className="w-6 h-6 text-bluey-blue hover:text-white" />
      )}
    </motion.button>
  )
}

export default SoundButton
