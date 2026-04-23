import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const keys = await kv.keys('mm:material:*')
  if (!keys.length) return NextResponse.json([])
  const materials = await kv.mget(...keys)
  return NextResponse.json(materials.filter(Boolean))
}

export async function POST(req: NextRequest) {
  const material = await req.json()
  await kv.set(`mm:material:${material.id}`, material)
  return NextResponse.json({ ok: true })
}
