import { useState, useEffect, useRef } from 'react'

interface AudioHook {
  isPlaying: boolean
  isMuted: boolean
  toggleMute: () => void
  playAudio: (url: string) => Promise<void>
  stopAudio: () => void
  playSuccessSound: () => Promise<void>
}

const successSounds = [
  'https://gahosting.website/sounds/bluey-intro-tune.mp3',
  'https://gahosting.website/sounds/bluey-scream.mp3',
  'https://gahosting.website/sounds/bluey.mp3',
  'https://gahosting.website/sounds/bluey-congrats.mp3'
]

export const useAudioWithFetch = (): AudioHook => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [lastSuccessIndex, setLastSuccessIndex] = useState(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioCache = useRef<Map<string, string>>(new Map())

  const fetchAudioAsBlob = async (url: string): Promise<string> => {
    // Check cache first
    if (audioCache.current.has(url)) {
      return audioCache.current.get(url)!
    }

    try {
      // Try multiple CORS proxy services
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://thingproxy.freeboard.io/fetch/${url}`
      ]

      let audioBlob: Blob | null = null
      
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'audio/*,*/*;q=0.9',
            }
          })
          
          if (response.ok) {
            audioBlob = await response.blob()
            break
          }
        } catch (proxyError) {
          console.warn(`Proxy failed: ${proxyUrl}`, proxyError)
          continue
        }
      }

      if (!audioBlob) {
        throw new Error('All CORS proxies failed')
      }

      const blobUrl = URL.createObjectURL(audioBlob)
      audioCache.current.set(url, blobUrl)
      return blobUrl
      
    } catch (error) {
      console.error('Failed to fetch audio via proxy:', error)
      // Fallback to original URL
      return url
    }
  }

  const createAudioElement = async (originalUrl: string): Promise<HTMLAudioElement> => {
    try {
      const audioUrl = await fetchAudioAsBlob(originalUrl)
      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'))
        }, 10000)
        
        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout)
          resolve(audio)
        }, { once: true })
        
        audio.addEventListener('error', (e) => {
          clearTimeout(timeout)
          reject(new Error(`Audio loading failed: ${e}`))
        }, { once: true })
        
        audio.load()
      })
    } catch (error) {
      console.error('Error creating audio element:', error)
      // Final fallback
      const fallbackAudio = new Audio(originalUrl)
      fallbackAudio.preload = 'auto'
      return fallbackAudio
    }
  }

  const playAudio = async (url: string): Promise<void> => {
    if (isMuted) return

    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      audioRef.current = await createAudioElement(url)
      audioRef.current.loop = url.includes('splash-music.mp3')
      
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (playError) {
        console.warn('Autoplay prevented:', playError)
        setIsPlaying(false)
      }

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })

      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false)
      })

    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
    }
  }

  const playSuccessSound = async (): Promise<void> => {
    if (isMuted) return

    try {
      // Get next sound in sequence (avoid repeating the same sound)
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * successSounds.length)
      } while (nextIndex === lastSuccessIndex && successSounds.length > 1)
      
      setLastSuccessIndex(nextIndex)
      const soundUrl = successSounds[nextIndex]

      successAudioRef.current = await createAudioElement(soundUrl)
      
      try {
        await successAudioRef.current.play()
      } catch (playError) {
        console.warn('Success sound autoplay prevented:', playError)
      }

    } catch (error) {
      console.error('Error playing success sound:', error)
    }
  }

  const stopAudio = (): void => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (successAudioRef.current) {
      successAudioRef.current.pause()
      successAudioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const toggleMute = (): void => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (newMutedState) {
      stopAudio()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
      // Clean up blob URLs
      audioCache.current.forEach((blobUrl) => {
        if (blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl)
        }
      })
      audioCache.current.clear()
    }
  }, [])

  return {
    isPlaying,
    isMuted,
    toggleMute,
    playAudio,
    stopAudio,
    playSuccessSound
  }
}
