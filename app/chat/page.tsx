'use client'
import { useEffect, useRef, useState } from 'react'
import { fetchContext, LSIContext } from '@/lib/context'
import ChatInput from '@/components/ChatInput'
import IntentBox from '@/components/IntentBox'
import GenerationProgress from '@/components/GenerationProgress'
import Link from 'next/link'

interface Message {
  role: 'ai' | 'user'
  content: string
}

interface IntentResult {
  intent: 'swap' | 'generate'
  detectedTemplate: string | null
  detectedClient: string | null
  detectedChanges: string[]
}

export default function ChatPage() {
  const [context, setContext] = useState<LSIContext>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [intent, setIntent] = useState<IntentResult | null>(null)
  const [lastUserMsg, setLastUserMsg] = useState('')
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [resultId, setResultId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchContext().then(ctx => {
      setContext(ctx)
      const leads = ctx.leads?.map(l => l.name).join(', ') ?? ''
      setMessages([{ role: 'ai', content: `Cześć! Co chcesz wygenerować? Mam załadowany kontekst z Growth Hub${leads ? ` — widzę: ${leads}` : ''}.` }])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, intent, generating])

  async function handleSend(msg: string) {
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLastUserMsg(msg)
    setIntent(null)

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'classify', message: msg }),
    })
    const data: IntentResult = await res.json()

    if (data.intent === 'swap') {
      setIntent(data)
    } else {
      setMessages(prev => [...prev, { role: 'ai', content: 'Rozumiem. Generuję materiał od zera...' }])
      await generate(lastUserMsg)
    }
  }

  async function generate(prompt: string) {
    setGenerating(true)
    setStep(0)
    setProgress(5)

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'generate', type: 'landing', client: { name: intent?.detectedClient ?? '' }, product: '', focus: prompt, logoUrl: '', accentColor: '#2383e2' }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const json = JSON.parse(line.slice(6))
        if (json.done) {
          setResultId(json.materialId)
          setGenerating(false)
          setProgress(100)
          setMessages(prev => [...prev, { role: 'ai', content: `Gotowe! Materiał wygenerowany.` }])
        } else {
          const stepMap: Record<string, number> = { structure: 0, copy: 1, html: 2, css: 3 }
          setStep(stepMap[json.step] ?? 0)
          setProgress(p => Math.min(95, p + 2))
        }
      }
    }
  }

  async function handleFast() {
    const savedIntent = intent
    setIntent(null)
    setGenerating(true)
    const res = await fetch('/api/remix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: savedIntent?.detectedTemplate ?? 'cinema-hotel-base', params: { clientName: savedIntent?.detectedClient ?? '', productName: 'Cinema', accentColor: '#2383e2', logoUrl: '', clientIndustry: '', focus: lastUserMsg } }),
    })
    const data = await res.json()
    setResultId(data.materialId)
    setGenerating(false)
    setMessages(prev => [...prev, { role: 'ai', content: 'Gotowe! Szablon spersonalizowany w ~3 sek.' }])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600 }}>⚡ Szybki chat</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: 10, background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-sidebar)', color: m.role === 'user' ? 'white' : 'var(--text-primary)', fontSize: 13, lineHeight: 1.5 }}>
              {m.content}
            </div>
          </div>
        ))}
        {intent && <IntentBox intent={intent} onFast={handleFast} onFull={() => { setIntent(null); generate(lastUserMsg) }} />}
        {generating && <GenerationProgress activeStep={step} progress={progress} />}
        {resultId && !generating && (
          <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, flex: 1 }}>Materiał gotowy</span>
            <Link href={`/material/${resultId}`} style={{ padding: '5px 12px', background: 'var(--text-primary)', color: 'white', borderRadius: 5, fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>✏️ Otwórz edytor</Link>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={generating} />
    </div>
  )
}
