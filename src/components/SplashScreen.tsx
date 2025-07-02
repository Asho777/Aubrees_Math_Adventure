import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'

interface SplashScreenProps {
  onStart: (username: string) => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [username, setUsername] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const { playAudio, stopAudio } = useAudio()

  useEffect(() => {
    // Start playing splash music when component mounts
    if (!isMuted) {
      playAudio('splash-music.mp3')
    }

    // Cleanup: stop music when component unmounts
    return () => {
      stopAudio()
    }
  }, [])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      stopAudio()
    } else {
      playAudio('splash-music.mp3')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      // Stop splash music before starting game
      stopAudio()
      onStart(username.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Mute/Unmute Button */}
      <motion.button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-bluey-blue" />
        ) : (
          <Volume2 className="w-6 h-6 text-bluey-blue" />
        )}
      </motion.button>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
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
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={!username.trim()}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            Let's Go Play Some Maths!
            <Sparkles className="w-6 h-6" />
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-6 text-sm text-bluey-purple"
        >
          Get ready for an amazing adventure! 🚀
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SplashScreen
