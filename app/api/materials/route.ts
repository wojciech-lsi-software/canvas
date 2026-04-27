import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type { Material } from '@/lib/storage'

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (id) {
      const material = await kv.get<Material>(`mm:material:${id}`)
      return NextResponse.json(material ?? null)
    }
    const keys = await kv.keys('mm:material:*')
    if (!keys.length) return NextResponse.json([])
    const materials = await kv.mget(...keys)
    return NextResponse.json(materials.filter(Boolean))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await kv.del(`mm:material:${id}`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
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
