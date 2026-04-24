import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { randomUUID } from 'crypto'
import { anthropic, CLASSIFY_SYSTEM, GENERATE_SYSTEM } from '@/lib/claude'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.mode === 'classify') {
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: CLASSIFY_SYSTEM,
        messages: [{ role: 'user', content: body.message as string }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
      const parsed = JSON.parse(text)
      if (!parsed.intent) throw new Error('invalid shape')
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ intent: 'generate', detectedTemplate: null, detectedClient: null, detectedChanges: [] })
    }
  }

  // mode === 'generate' — streaming SSE
  const { type, client, product, focus, logoUrl = '', accentColor = '' } = body as {
    type: string
    client?: { name?: string; industry?: string }
    product: string
    focus: string
    logoUrl?: string
    accentColor?: string
  }

  const userPrompt = `Wygeneruj ${type === 'landing' ? 'landing page' : type === 'presentation' ? 'prezentację' : 'one-pager'} dla:
Klient: ${client?.name ?? 'klient'}
Branża: ${client?.industry ?? ''}
Produkt: ${product}
Fokus: ${focus}
Logo URL: ${logoUrl}
Kolor akcentu: ${accentColor}
Język: Polski`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: GENERATE_SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let fullHtml = ''
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const steps = ['structure', 'copy', 'html', 'css']
        let stepIdx = 0
        let chunkCount = 0

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullHtml += chunk.delta.text
            chunkCount++

            const step = steps[Math.min(stepIdx, 3)]
            if (chunkCount % 20 === 0 && stepIdx < 3) stepIdx++

            const event = `data: ${JSON.stringify({ step, chunk: chunk.delta.text })}\n\n`
            controller.enqueue(encoder.encode(event))
          }
        }

        const materialId = `mat_${randomUUID()}`
        const blob = await put(`${materialId}.html`, fullHtml, { access: 'public', contentType: 'text/html' })
        await kv.set(`mm:material:${materialId}`, {
          id: materialId,
          name: `${client?.name ?? 'Materiał'} — ${type}`,
          type,
          client: client?.name ?? '',
          product,
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
