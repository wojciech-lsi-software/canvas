import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { anthropic, CLASSIFY_SYSTEM, GENERATE_SYSTEM } from '@/lib/claude'

export const runtime = 'edge'
export const maxDuration = 300

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
  const { type, client, product, focus, logoUrl = '', accentColor = '', clientContext = '', clientWebsite = '', materialId: existingId } = body as {
    type: string
    client?: { name?: string; industry?: string; description?: string; tagline?: string }
    product: string
    focus: string
    logoUrl?: string
    accentColor?: string
    clientContext?: string
    clientWebsite?: string
    materialId?: string
  }

  const typeLabel: Record<string, string> = {
    landing: 'landing page',
    presentation: 'prezentację sprzedażową',
    onepager: 'one-pager',
    script: 'skrypt rozmowy handlowej',
    email: 'sekwencję 3 emaili sprzedażowych',
  }

  const contextLines = [
    `Klient: ${client?.name ?? 'klient'}`,
    `Branża: ${client?.industry ?? ''}`,
    client?.description ? `Opis klienta: ${client.description}` : '',
    client?.tagline ? `Hasło klienta: ${client.tagline}` : '',
    clientWebsite ? `Strona klienta: ${clientWebsite}` : '',
    `Produkt LSI: ${product}`,
    `Główny przekaz: ${focus}`,
    logoUrl ? `Logo klienta (URL): ${logoUrl}` : 'Logo klienta: brak — pomiń element img z logo',
    `Kolor marki: ${accentColor || '#2383e2'} — użyj jako --accent w CSS`,
    clientContext ? `Dodatkowy kontekst: ${clientContext}` : '',
  ].filter(Boolean)

  const userPrompt = `Wygeneruj ${typeLabel[type] ?? type} dla:
${contextLines.join('\n')}
Język: Polski

WAŻNE: Użyj koloru ${accentColor || '#2383e2'} jako głównego koloru akcentowego (--accent). ${logoUrl ? `Wstaw logo klienta z URL: ${logoUrl}` : ''} Stwórz materiał NAJWYŻSZEJ jakości — profesjonalny design, konkretne treści, pełna implementacja HTML+CSS.`

  const maxTokensMap: Record<string, number> = {
    landing: 16000,
    presentation: 16000,
    onepager: 10000,
    script: 8000,
    email: 8000,
  }

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokensMap[type] ?? 12000,
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

        const materialId = existingId ?? `mat_${crypto.randomUUID()}`
        const blob = await put(`${materialId}-${Date.now()}.html`, fullHtml, { access: 'public', contentType: 'text/html' })
        const existing = existingId ? await kv.get<any>(`mm:material:${materialId}`) : null
        await kv.set(`mm:material:${materialId}`, {
          id: materialId,
          name: existing?.name ?? `${client?.name ?? 'Materiał'} — ${type}`,
          type,
          client: client?.name ?? existing?.client ?? '',
          product,
          blobUrl: blob.url,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
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
