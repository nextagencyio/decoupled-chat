import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/pinecone'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    )
  }

  try {
    const results = await searchArticles(query, limit)

    return NextResponse.json({
      query,
      results,
      totalResults: results.length,
    })
  } catch (error: any) {
    console.error('Search error:', error)

    // Check for missing API keys
    if (error.message?.includes('PINECONE_API_KEY')) {
      return NextResponse.json(
        { error: 'Pinecone is not configured. Please run npm run setup.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
