import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'bin'
  const blob = await put(`assets/${randomUUID()}.${ext}`, file, {
    access: 'public',
    contentType: file.type,
  })

  return NextResponse.json({ url: blob.url })
}
