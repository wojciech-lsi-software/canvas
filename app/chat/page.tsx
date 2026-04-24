'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchContext, LSIContext } from '@/lib/context'

interface IntentResult {
  intent: 'swap' | 'generate'
  detectedTemplate: string | null
  detectedClient: string | null
  detectedChanges: string[]
}

type Phase = 'idle' | 'classifying' | 'intent' | 'generating' | 'done'

const STEPS = ['Struktura', 'Treść', 'HTML', 'CSS']

export default function ChatPage() {
  const router = useRouter()
  const [context, setContext] = useState<LSIContext>({})
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [intent, setIntent] = useState<IntentResult | null>(null)
  const [userMsg, setUserMsg] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchContext().then(setContext)
    textareaRef.current?.focus()
  }, [])

  const leads = context.leads?.map(l => l.name) ?? []

  async function handleSend() {
    const msg = input.trim()
    if (!msg || phase !== 'idle') return
    setUserMsg(msg)
    setInput('')
    setPhase('classifying')

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'classify', message: msg }),
    })
    const data: IntentResult = await res.json()

    if (data.intent === 'swap') {
      setIntent(data)
      setPhase('intent')
    } else {
      setPhase('generating')
      await generate(msg, null)
    }
  }

  async function generate(prompt: string, detectedIntent: IntentResult | null) {
    setActiveStep(0)
    setProgress(5)

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'generate',
        type: 'landing',
        client: { name: detectedIntent?.detectedClient ?? '' },
        product: '',
        focus: prompt,
        logoUrl: '',
        accentColor: '#2383e2',
      }),
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
          router.push(`/material/${json.materialId}`)
        } else {
          const stepMap: Record<string, number> = { structure: 0, copy: 1, html: 2, css: 3 }
          setActiveStep(stepMap[json.step] ?? 0)
          setProgress(p => Math.min(95, p + 2))
        }
      }
    }
  }

  async function handleFast() {
    setPhase('generating')
    const res = await fetch('/api/remix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: intent?.detectedTemplate ?? 'cinema-hotel-base',
        params: { clientName: intent?.detectedClient ?? '', productName: 'Cinema', accentColor: '#2383e2', logoUrl: '', clientIndustry: '', focus: userMsg },
      }),
    })
    const data = await res.json()
    router.push(`/material/${data.materialId}`)
  }

  async function handleFull() {
    setPhase('generating')
    await generate(userMsg, intent)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // --- IDLE: full-screen input ---
  if (phase === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 24px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, textAlign: 'center' }}>Co chcesz wygenerować?</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32 }}>Opisz dla kogo i jaki materiał — AI dobierze typ i wygeneruje od razu</div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="np. Landing page dla Hotel Radisson w Zakopanem, produkt Cinema, skup się na rezerwacjach online"
              rows={4}
              style={{ width: '100%', padding: '16px', border: 'none', outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', fontFamily: 'var(--font)', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enter — wyślij · Shift+Enter — nowa linia</div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{ padding: '6px 18px', background: input.trim() ? 'var(--text-primary)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'default' }}
              >
                Generuj
              </button>
            </div>
          </div>

          {leads.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, textAlign: 'center' }}>Leady z Growth Hub</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {leads.map(l => (
                  <button key={l} onClick={() => setInput(v => v ? `${v} dla ${l}` : `Materiał dla ${l}`)} style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'white', fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- CLASSIFYING ---
  if (phase === 'classifying') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Analizuję zapytanie...</div>
        <div style={{ background: 'var(--bg-sidebar)', borderRadius: 8, padding: '12px 20px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 480, textAlign: 'center' }}>{userMsg}</div>
      </div>
    )
  }

  // --- INTENT: swap detected ---
  if (phase === 'intent' && intent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Wykryto podmianę szablonu</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Szablon', val: intent.detectedTemplate ?? '—' },
              { label: 'Klient', val: intent.detectedClient ?? '—' },
              { label: 'Zmiany', val: intent.detectedChanges.join(', ') || '—' },
              { label: 'Czas', val: '~3 sek' },
            ].map(f => (
              <div key={f.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleFast} style={{ flex: 1, padding: '10px 0', background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Podmień w 3 sekundy</button>
            <button onClick={handleFull} style={{ flex: 1, padding: '10px 0', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Generuj od zera z AI</button>
          </div>
        </div>
      </div>
    )
  }

  // --- GENERATING ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, padding: '0 24px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Generuję materiał...</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Za chwilę zostaniesz przeniesiony do edytora</div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < activeStep ? 'var(--green)' : i === activeStep ? 'var(--accent)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, margin: '0 auto 6px' }}>
                {i < activeStep ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ width: 12, height: 12 }}><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              <div style={{ fontSize: 10, color: i <= activeStep ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === activeStep ? 600 : 400 }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--border)', borderRadius: 10, height: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: 10 }} />
        </div>
      </div>
    </div>
  )
}
