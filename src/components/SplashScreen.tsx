import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'
import SoundButton from './SoundButton'

interface SplashScreenProps {
  onStart: (username: string) => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [username, setUsername] = useState('')
  const [showNameEntry, setShowNameEntry] = useState(false)
  const { isMuted, toggleMute, playAudio } = useAudio()

  const handleEngineStart = async () => {
    // Start splash music when user interacts (autoplay compliance)
    if (!isMuted) {
      await playAudio('https://gahosting.website/sounds/splash-music.mp3')
    }
    setShowNameEntry(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onStart(username.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-bluey-blue to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
            <div className="text-6xl">🐕</div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-fun text-bluey-blue mb-2"
        >
          Math Adventure
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-bluey-purple mb-8 font-bold"
        >
          with Bluey! 🎉
        </motion.p>

        {!showNameEntry ? (
          <motion.button
            onClick={handleEngineStart}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary w-full flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            Start Your Maths Engine!
            <Sparkles className="w-6 h-6" />
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-lg font-bold text-bluey-blue mb-3">
                What's your name, mate? 🌟
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 text-xl text-center rounded-full border-4 border-bluey-blue focus:border-bluey-purple focus:outline-none font-bold"
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
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              Let's Go Play Some Maths!
              <Sparkles className="w-6 h-6" />
            </motion.button>
          </form>
        )}

        {showNameEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-bluey-purple"
          >
            Get ready for an amazing adventure! 🚀
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SplashScreen
