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
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())
  const preloadingRef = useRef<Set<string>>(new Set())

  // Optimized proxy order - fastest first
  const proxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-anywhere.herokuapp.com/'
  ]

  const createAudioElement = async (originalUrl: string): Promise<HTMLAudioElement> => {
    // Check cache first
    if (audioCache.current.has(originalUrl)) {
      const cachedAudio = audioCache.current.get(originalUrl)!
      // Reset cached audio
      cachedAudio.currentTime = 0
      return cachedAudio
    }

    // Check if already preloading
    if (preloadingRef.current.has(originalUrl)) {
      // Wait for preloading to complete
      return new Promise((resolve) => {
        const checkCache = () => {
          if (audioCache.current.has(originalUrl)) {
            const cachedAudio = audioCache.current.get(originalUrl)!
            cachedAudio.currentTime = 0
            resolve(cachedAudio)
          } else {
            setTimeout(checkCache, 100)
          }
        }
        checkCache()
      })
    }

    preloadingRef.current.add(originalUrl)

    try {
      // Try proxies in parallel for faster response
      const proxyPromises = proxies.map(async (proxy) => {
        try {
          const proxyUrl = proxy + encodeURIComponent(originalUrl)
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'audio/*,*/*;q=0.9',
            },
            signal: AbortSignal.timeout(3000) // 3 second timeout per proxy
          })
          
          if (response.ok) {
            const audioBlob = await response.blob()
            const blobUrl = URL.createObjectURL(audioBlob)
            return blobUrl
          }
          throw new Error(`HTTP ${response.status}`)
        } catch (error) {
          throw new Error(`Proxy ${proxy} failed: ${error}`)
        }
      })

      // Race the proxies - use the first successful one
      let audioUrl: string
      try {
        audioUrl = await Promise.any(proxyPromises)
      } catch {
        // All proxies failed, try original URL
        console.warn('All proxies failed, using original URL')
        audioUrl = originalUrl
      }

      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'))
        }, 5000) // Reduced timeout
        
        const handleCanPlay = () => {
          clearTimeout(timeout)
          audio.removeEventListener('canplaythrough', handleCanPlay)
          audio.removeEventListener('error', handleError)
          
          // Cache the audio element
          audioCache.current.set(originalUrl, audio)
          preloadingRef.current.delete(originalUrl)
          resolve(audio)
        }
        
        const handleError = (e: Event) => {
          clearTimeout(timeout)
          audio.removeEventListener('canplaythrough', handleCanPlay)
          audio.removeEventListener('error', handleError)
          preloadingRef.current.delete(originalUrl)
          reject(new Error(`Audio loading failed: ${e}`))
        }
        
        audio.addEventListener('canplaythrough', handleCanPlay, { once: true })
        audio.addEventListener('error', handleError, { once: true })
        
        audio.load()
      })
    } catch (error) {
      preloadingRef.current.delete(originalUrl)
      console.error('Error creating audio element:', error)
      // Final fallback
      const fallbackAudio = new Audio(originalUrl)
      fallbackAudio.preload = 'auto'
      return fallbackAudio
    }
  }

  // Preload splash music on hook initialization
  useEffect(() => {
    const preloadSplashMusic = async () => {
      try {
        await createAudioElement('https://gahosting.website/sounds/splash-music.mp3')
      } catch (error) {
        console.warn('Failed to preload splash music:', error)
      }
    }
    
    preloadSplashMusic()
  }, [])

  const playAudio = async (url: string): Promise<void> => {
    if (isMuted) return

    try {
      // Stop and cleanup current audio if playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.onended = null
        audioRef.current.onpause = null
      }

      audioRef.current = await createAudioElement(url)
      audioRef.current.loop = url.includes('splash-music.mp3')
      
      // Add event listeners with proper cleanup
      audioRef.current.onended = () => {
        setIsPlaying(false)
      }

      audioRef.current.onpause = () => {
        setIsPlaying(false)
      }
      
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (playError) {
        console.warn('Autoplay prevented:', playError)
        setIsPlaying(false)
      }

    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
    }
  }

  const playSuccessSound = async (): Promise<void> => {
    if (isMuted) return

    try {
      // Stop any existing success sound first
      if (successAudioRef.current) {
        successAudioRef.current.pause()
        successAudioRef.current.currentTime = 0
        successAudioRef.current.onended = null
      }

      // Get next sound in sequence (avoid repeating the same sound)
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * successSounds.length)
      } while (nextIndex === lastSuccessIndex && successSounds.length > 1)
      
      setLastSuccessIndex(nextIndex)
      const soundUrl = successSounds[nextIndex]

      successAudioRef.current = await createAudioElement(soundUrl)
      
      // Clean up when sound ends
      successAudioRef.current.onended = () => {
        if (successAudioRef.current) {
          successAudioRef.current.onended = null
        }
      }
      
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
      audioRef.current.onended = null
      audioRef.current.onpause = null
    }
    if (successAudioRef.current) {
      successAudioRef.current.pause()
      successAudioRef.current.currentTime = 0
      successAudioRef.current.onended = null
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
      // Clean up cached audio elements and blob URLs
      audioCache.current.forEach((audio, url) => {
        if (audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src)
        }
      })
      audioCache.current.clear()
      preloadingRef.current.clear()
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
