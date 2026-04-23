import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { TEMPLATES, remixTemplate, RemixParams } from '@/lib/templates'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { templateId, params } = body as { templateId: string; params: RemixParams }

  if (!templateId || typeof templateId !== 'string') {
    return NextResponse.json({ error: 'templateId required' }, { status: 400 })
  }
  if (!params?.clientName || !params?.productName || !params?.accentColor ||
      !params?.logoUrl || !params?.clientIndustry || !params?.focus) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  const template = TEMPLATES.find(t => t.id === templateId)
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  try {
    const filePath = path.join(process.cwd(), 'public', 'templates', template.file)
    const html = await readFile(filePath, 'utf-8')
    const remixed = remixTemplate(html, params)

    const materialId = `mat_${crypto.randomUUID()}`
    const filename = `${templateId}-${materialId}.html`
    const blob = await put(filename, remixed, { access: 'public', contentType: 'text/html' })

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
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
