import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import GameScreen from './components/GameScreen'
import { supabase, User } from './lib/supabase'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const handleStart = async (username: string) => {
    setLoading(true)
    
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (existingUser) {
        setCurrentUser(existingUser)
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            username,
            current_level: 1,
            current_operation: 'addition',
            total_score: 0
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating user:', error)
          alert('Sorry, there was an error starting your adventure. Please try again!')
          return
        }

        setCurrentUser(newUser)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Sorry, there was an error starting your adventure. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  const handleHome = () => {
    setCurrentUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-bluey-blue border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!currentUser ? (
        <SplashScreen onStart={handleStart} />
      ) : (
        <GameScreen user={currentUser} onHome={handleHome} />
      )}
    </div>
  )
}

export default App
