import { NextRequest, NextResponse } from 'next/server'

async function getAccessToken() {
  const clientId = process.env.DRUPAL_CLIENT_ID
  const clientSecret = process.env.DRUPAL_CLIENT_SECRET
  const baseUrl = process.env.DRUPAL_BASE_URL || process.env.NEXT_PUBLIC_DRUPAL_BASE_URL

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error('Drupal credentials not configured')
  }

  const tokenUrl = `${baseUrl}/oauth/token`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.DRUPAL_BASE_URL || process.env.NEXT_PUBLIC_DRUPAL_BASE_URL

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Drupal is not configured' },
        { status: 503 }
      )
    }

    const accessToken = await getAccessToken()
    const body = await request.json()

    const response = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('GraphQL proxy error:', error)
    return NextResponse.json(
      { error: error.message || 'GraphQL request failed' },
      { status: 500 }
    )
  }
}
