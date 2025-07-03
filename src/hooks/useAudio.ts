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

export const useAudio = (): AudioHook => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [lastSuccessIndex, setLastSuccessIndex] = useState(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioCache = useRef<Map<string, string>>(new Map())

  const fetchAudioViaProxy = async (url: string): Promise<string> => {
    // Check cache first
    if (audioCache.current.has(url)) {
      return audioCache.current.get(url)!
    }

    // Back to original working order
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://cors.io/?${url}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://thingproxy.freeboard.io/fetch/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ]

    for (const proxyUrl of proxies) {
      try {
        console.log(`Trying proxy: ${proxyUrl}`)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'audio/mpeg, audio/*',
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          const audioBlob = await response.blob()
          const blobUrl = URL.createObjectURL(audioBlob)
          audioCache.current.set(url, blobUrl)
          console.log(`Successfully loaded audio via proxy: ${proxyUrl}`)
          return blobUrl
        }
      } catch (error) {
        console.warn(`Proxy ${proxyUrl} failed:`, error)
        continue
      }
    }

    console.warn('All CORS proxies failed, using original URL as fallback')
    return url
  }

  const createAudioElement = async (originalUrl: string): Promise<HTMLAudioElement> => {
    try {
      const audioUrl = await fetchAudioViaProxy(originalUrl)
      const audio = new Audio()
      
      // Set up audio element
      audio.preload = 'auto'
      audio.crossOrigin = audioUrl.startsWith('blob:') ? null : 'anonymous'
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'))
        }, 15000)
        
        const cleanup = () => {
          clearTimeout(timeout)
          audio.removeEventListener('canplaythrough', onLoad)
          audio.removeEventListener('error', onError)
        }
        
        const onLoad = () => {
          cleanup()
          resolve(audio)
        }
        
        const onError = (e: Event) => {
          cleanup()
          console.error('Audio loading error:', e)
          reject(new Error('Audio loading failed'))
        }
        
        audio.addEventListener('canplaythrough', onLoad, { once: true })
        audio.addEventListener('error', onError, { once: true })
        
        audio.src = audioUrl
        audio.load()
      })
    } catch (error) {
      console.error('Error creating audio element:', error)
      // Final fallback - try original URL without CORS
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

      console.log(`Loading audio: ${url}`)
      audioRef.current = await createAudioElement(url)
      audioRef.current.loop = url.includes('splash-music.mp3')
      
      // Set up event listeners
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })

      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false)
      })

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        setIsPlaying(false)
      })

      // Try to play
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        console.log('Audio playing successfully')
      } catch (playError) {
        console.warn('Autoplay prevented or play failed:', playError)
        setIsPlaying(false)
      }

    } catch (error) {
      console.error('Error in playAudio:', error)
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

      console.log(`Playing success sound: ${soundUrl}`)
      successAudioRef.current = await createAudioElement(soundUrl)
      
      successAudioRef.current.addEventListener('error', (e) => {
        console.error('Success sound error:', e)
      })

      try {
        await successAudioRef.current.play()
        console.log('Success sound playing')
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
      // Clean up blob URLs to prevent memory leaks
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
