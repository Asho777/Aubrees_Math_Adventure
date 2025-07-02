import { useRef, useEffect, useState } from 'react'

interface AudioHook {
  playAudio: (audioFile: string) => void
  stopAudio: () => void
  isPlaying: boolean
}

export const useAudio = (): AudioHook => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = (audioFile: string) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Create new audio instance
      audioRef.current = new Audio(`/audio/${audioFile}`)
      audioRef.current.volume = 0.7

      audioRef.current.onloadeddata = () => {
        audioRef.current?.play().catch(error => {
          console.log('Audio play prevented:', error)
        })
      }

      audioRef.current.onplay = () => setIsPlaying(true)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => {
        console.log('Audio error for file:', audioFile)
        setIsPlaying(false)
      }

    } catch (error) {
      console.log('Audio setup error:', error)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  return { playAudio, stopAudio, isPlaying }
}
