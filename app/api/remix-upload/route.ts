import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { anthropic, REMIX_SYSTEM } from '@/lib/claude'

export const runtime = 'edge'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  let body: { html: string; clientName: string; clientIndustry?: string; logoUrl?: string; accentColor?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.html || !body.clientName) {
    return NextResponse.json({ error: 'Missing html or clientName' }, { status: 400 })
  }

  const userPrompt = `Oto oryginalny materiał HTML:

${body.html.slice(0, 40000)}

Przeróbka dla nowego klienta:
Nazwa firmy: ${body.clientName}
Branża: ${body.clientIndustry ?? ''}
Logo (URL): ${body.logoUrl ?? ''}
Kolor marki: ${body.accentColor ?? ''}

Zachowaj cały design i strukturę. Zamień tylko dane specyficzne dla poprzedniego klienta.`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: REMIX_SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let fullHtml = ''
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        let chunkCount = 0

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullHtml += chunk.delta.text
            chunkCount++
            if (chunkCount % 30 === 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: chunkCount })}\n\n`))
            }
          }
        }

        const materialId = `mat_${crypto.randomUUID()}`
        const blob = await put(`${materialId}.html`, fullHtml, { access: 'public', contentType: 'text/html' })
        await kv.set(`mm:material:${materialId}`, {
          id: materialId,
          name: `${body.clientName} — przeróbka`,
          type: 'landing',
          client: body.clientName,
          product: '',
          blobUrl: blob.url,
          createdAt: new Date().toISOString(),
        })

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, materialId, url: blob.url })}\n\n`))
        controller.close()
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'internal' })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
