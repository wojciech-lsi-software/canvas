import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { LSIContext } from '@/lib/context'

export async function GET() {
  const context = await kv.get<LSIContext>('lsi:context')
  return NextResponse.json(context ?? {})
}
