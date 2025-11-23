/**
 * Device fingerprinting utility
 * Generates a unique identifier for the user's device using various browser properties
 * This is used for spam prevention and vote tracking without authentication
 */

export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = []

  // User agent
  components.push(navigator.userAgent)

  // Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language)

  // Platform
  components.push(navigator.platform)

  // Hardware concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 'unknown'))

  // Device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory
  if (deviceMemory) {
    components.push(String(deviceMemory))
  }

  // Canvas fingerprinting
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Hot Takes Arena', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Hot Takes Arena', 4, 17)
      const canvasData = canvas.toDataURL()
      components.push(canvasData)
    }
  } catch (e) {
    // Canvas fingerprinting might be blocked
    components.push('canvas-blocked')
  }

  // WebGL fingerprinting
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        components.push(`${vendor}~${renderer}`)
      }
    }
  } catch (e) {
    // WebGL might be disabled
    components.push('webgl-blocked')
  }

  // Combine all components and hash them
  const fingerprint = await hashString(components.join('|||'))

  return fingerprint
}

/**
 * Hash a string using SHA-256
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Get or create device fingerprint from localStorage
 * This provides persistence across page reloads
 */
export async function getDeviceFingerprint(): Promise<string> {
  const STORAGE_KEY = 'hot_takes_device_fp'

  // Try to get existing fingerprint from localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return stored
    }

    // Generate new fingerprint
    const fingerprint = await generateDeviceFingerprint()

    // Store for future use
    try {
      localStorage.setItem(STORAGE_KEY, fingerprint)
    } catch (e) {
      // Storage might be disabled
      console.warn('Could not store device fingerprint:', e)
    }

    return fingerprint
  }

  // Fallback for server-side
  return 'server-side-render'
}
