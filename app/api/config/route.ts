import { NextResponse } from 'next/server'

// Lightweight endpoint to check if the app is configured
export async function GET() {
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
