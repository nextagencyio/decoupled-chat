import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo-mode'

// Lightweight endpoint to check if the app is configured
export async function GET() {
  // Demo mode is always "configured" (remove this check for production-only builds)
  if (isDemoMode()) {
    return NextResponse.json({ configured: true, demoMode: true })
  }

  const isConfigured = !!(
    process.env.GROQ_API_KEY &&
    process.env.PINECONE_API_KEY &&
    process.env.DRUPAL_BASE_URL
  )

  if (!isConfigured) {
    return NextResponse.json(
      { configured: false },
      { status: 503 }
    )
  }

  return NextResponse.json({ configured: true })
}
