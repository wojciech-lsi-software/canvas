import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  const context = await kv.get('lsi:context')
  return NextResponse.json(context ?? {})
}
