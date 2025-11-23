import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      // Fire emoji for Apple touch icon
      <div
        style={{
          fontSize: 120,
          background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20px',
        }}
      >
        🔥
      </div>
    ),
    {
      ...size,
    }
  )
}
