import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type { Material } from '@/lib/storage'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const material = await kv.get<Material>(`mm:material:${id}`)
  if (!material?.blobUrl) {
    return new NextResponse('Not found', { status: 404 })
  }
  const res = await fetch(material.blobUrl, { cache: 'no-store' })
  if (!res.ok) return new NextResponse('Upstream error', { status: 502 })
  const html = await res.text()
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
