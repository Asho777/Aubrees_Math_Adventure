// CORS Proxy utility for handling external audio files
export class CORSProxyManager {
  private static instance: CORSProxyManager
  private workingProxy: string | null = null
  private proxyQueue: string[] = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ]

  private constructor() {}

  static getInstance(): CORSProxyManager {
    if (!CORSProxyManager.instance) {
      CORSProxyManager.instance = new CORSProxyManager()
    }
    return CORSProxyManager.instance
  }

  async getProxiedUrl(originalUrl: string): Promise<string> {
    // If we have a working proxy, use it
    if (this.workingProxy) {
      return this.workingProxy + encodeURIComponent(originalUrl)
    }

    // Test proxies to find a working one
    for (const proxy of this.proxyQueue) {
      try {
        const testUrl = proxy + encodeURIComponent(originalUrl)
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'cors'
        })
        
        if (response.ok || response.status === 206) {
          this.workingProxy = proxy
          return testUrl
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed test:`, error)
        continue
      }
    }

    // If no proxy works, return original URL as fallback
    console.warn('No working CORS proxy found, using original URL')
    return originalUrl
  }

  resetProxy(): void {
    this.workingProxy = null
  }
}

export const corsProxy = CORSProxyManager.getInstance()
