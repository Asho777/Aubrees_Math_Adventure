import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'
import { useAudioWithFetch } from '../hooks/useAudioWithFetch'
import SoundButton from './SoundButton'

interface SplashScreenProps {
  onStart: (username: string) => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [username, setUsername] = useState('')
  const [showNameEntry, setShowNameEntry] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const { isMuted, toggleMute, playAudio } = useAudioWithFetch()

  const handleEngineStart = async () => {
    // Prevent multiple clicks
    if (isStarting || showNameEntry) return
    
    setIsStarting(true)
    
    try {
      // Show name entry immediately for better UX
      setShowNameEntry(true)
      
      // Start splash music in parallel (don't await)
      if (!isMuted) {
        playAudio('https://gahosting.website/sounds/splash-music.mp3').catch(error => {
          console.warn('Audio playback failed:', error)
        })
      }
    } finally {
      setIsStarting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onStart(username.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      <SoundButton isMuted={isMuted} onToggle={toggleMute} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-bluey-yellow rounded-full opacity-60"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="card-game max-w-md w-full text-center relative z-10"
      >
        {/* Game Author Attribution - Top Center Inside Window */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 sm:mb-6"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2 shadow-lg inline-block">
            <p className="text-xs sm:text-sm font-bold text-bluey-blue">
              Game Author:- Your Poppy
            </p>
          </div>
        </motion.div>

        {/* Bluey Character Animation */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-4 sm:mb-8"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-bluey-blue to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
            <div className="text-4xl sm:text-6xl">🐕</div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl font-fun text-bluey-blue mb-1 sm:mb-2"
        >
          Math Adventure
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl text-bluey-purple mb-6 sm:mb-8 font-bold"
        >
          with Bluey! 🎉
        </motion.p>

        {!showNameEntry ? (
          <motion.button
            onClick={handleEngineStart}
            disabled={isStarting}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: isStarting ? 1 : 1.05 }}
            whileTap={{ scale: isStarting ? 1 : 0.95 }}
            className={`btn-primary w-full flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl py-3 sm:py-4 px-6 sm:px-8 ${
              isStarting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
            {isStarting ? 'Starting Engine...' : 'Start Your Maths Engine!'}
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-base sm:text-lg font-bold text-bluey-blue mb-2 sm:mb-3">
                What's your name, mate? 🌟
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl text-center rounded-full border-4 border-bluey-blue focus:border-bluey-purple focus:outline-none font-bold"
                placeholder="Enter your name here!"
                maxLength={20}
                autoFocus
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={!username.trim()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl py-3 sm:py-4 px-6 sm:px-8"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              Let's Go Play Some Maths!
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </form>
        )}

        {showNameEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 sm:mt-6 text-xs sm:text-sm text-bluey-purple"
          >
            Get ready for an amazing adventure! 🚀
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SplashScreen
