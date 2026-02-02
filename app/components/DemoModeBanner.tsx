'use client'

/**
 * Demo Mode Banner Component
 *
 * DELETE THIS FILE when removing demo mode from a real project.
 * Also remove the <DemoModeBanner /> from app/layout.tsx
 */

import { AlertTriangle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function DemoModeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Only show in demo mode
    setIsVisible(process.env.NEXT_PUBLIC_DEMO_MODE === 'true')
  }, [])

  if (!isVisible || isDismissed) return null

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>
            <strong>Demo Mode:</strong> Chat responses are simulated. Connect Drupal, Pinecone & Groq for real AI chat.
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="hover:bg-amber-600/20 p-1 rounded"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
