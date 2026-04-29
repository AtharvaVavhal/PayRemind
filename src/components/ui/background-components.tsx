'use client'

import type { ReactNode } from 'react'

type BackgroundGlowProps = {
  children: ReactNode
}

export default function BackgroundGlow({ children }: BackgroundGlowProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at center, #FFF991 0%, transparent 70%)
      `,
          opacity: 0.6,
          mixBlendMode: 'multiply',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
