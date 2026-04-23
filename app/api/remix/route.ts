import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { TEMPLATES, remixTemplate, RemixParams } from '@/lib/templates'

export async function POST(req: NextRequest) {
  const { templateId, params }: { templateId: string; params: RemixParams } = await req.json()

  const template = TEMPLATES.find(t => t.id === templateId)
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const filePath = path.join(process.cwd(), 'public', 'templates', template.file)
  const html = await readFile(filePath, 'utf-8')
  const remixed = remixTemplate(html, params)

  const filename = `${templateId}-${Date.now()}.html`
  const blob = await put(filename, remixed, { access: 'public', contentType: 'text/html' })

  const materialId = `mat_${Date.now()}`
  await kv.set(`mm:material:${materialId}`, {
    id: materialId,
    name: `${params.clientName} — ${template.name}`,
    type: template.type,
    client: params.clientName,
    product: params.productName,
    blobUrl: blob.url,
    templateId,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ materialId, url: blob.url })
}
