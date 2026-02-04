import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo-mode'

// Lightweight endpoint to check if the app is configured
export async function GET() {
  // Demo mode is always "configured" (remove this check for production-only builds)
  if (isDemoMode()) {
    return NextResponse.json({ configured: true, demoMode: true })
  }

  const hasDrupal = !!(
    process.env.DRUPAL_BASE_URL &&
    process.env.DRUPAL_CLIENT_ID &&
    process.env.DRUPAL_CLIENT_SECRET
  )
  const hasGroq = !!process.env.GROQ_API_KEY
  const hasPinecone = !!process.env.PINECONE_API_KEY

  const isFullyConfigured = hasDrupal && hasGroq && hasPinecone

  if (!isFullyConfigured) {
    return NextResponse.json(
      {
        configured: false,
        services: {
          drupal: hasDrupal,
          groq: hasGroq,
          pinecone: hasPinecone,
        },
      },
      { status: 503 }
    )
  }

  return NextResponse.json({ configured: true })
}
