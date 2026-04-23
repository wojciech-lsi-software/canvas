import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const keys = await kv.keys('mm:material:*')
    if (!keys.length) return NextResponse.json([])
    const materials = await kv.mget(...keys)
    return NextResponse.json(materials.filter(Boolean))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const material = await req.json()
    if (!material?.id || typeof material.id !== 'string') {
      return NextResponse.json({ error: 'material.id required' }, { status: 400 })
    }
    await kv.set(`mm:material:${material.id}`, material)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save material' }, { status: 500 })
  }
}
