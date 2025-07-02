import { useState, useCallback } from 'react'
import { useAudio } from './useAudio'

const SUCCESS_SOUNDS = [
  'bluey-intro-tune.mp3',
  'bluey-scream.mp3', 
  'bluey.mp3',
  'bluey-congrats.mp3'
]

export const useSuccessAudio = () => {
  const [lastPlayedIndex, setLastPlayedIndex] = useState(-1)
  const { playAudio } = useAudio()

  const playSuccessSound = useCallback(() => {
    // Get available sounds (exclude the last played one)
    const availableSounds = SUCCESS_SOUNDS.filter((_, index) => index !== lastPlayedIndex)
    
    // Pick a random sound from available ones
    const randomIndex = Math.floor(Math.random() * availableSounds.length)
    const selectedSound = availableSounds[randomIndex]
    
    // Find the original index of the selected sound
    const originalIndex = SUCCESS_SOUNDS.indexOf(selectedSound)
    
    // Update last played index
    setLastPlayedIndex(originalIndex)
    
    // Play the sound
    playAudio(selectedSound)
  }, [lastPlayedIndex, playAudio])

  return { playSuccessSound }
}
