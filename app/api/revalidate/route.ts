import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.DRUPAL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const path = body.path || '/'

    revalidatePath(path)

    return NextResponse.json({ revalidated: true, path })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
