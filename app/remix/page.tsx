'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import GenerationProgress from '@/components/GenerationProgress'

const COLORS = ['#2383e2', '#0f7b6c', '#9b6700', '#c4320a', '#5b21b6', '#37352f']

export default function RemixPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientIndustry, setClientIndustry] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#2383e2')
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [resultId, setResultId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const file = fileRef.current?.files?.[0]
    if (!file || !clientName) return

    const html = await file.text()
    setGenerating(true)
    setStep(0)
    setProgress(5)

    const res = await fetch('/api/remix-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, clientName, clientIndustry, logoUrl, accentColor }),
    })

    if (!res.ok || !res.body) {
      setError('Coś poszło nie tak. Spróbuj ponownie.')
      setGenerating(false)
      return
    }

    const reader = res.body.getReader()
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
        } else if (json.error) {
          setError('Wystąpił błąd podczas przeróbki.')
          setGenerating(false)
        } else {
          setStep(s => Math.min(s + 1, 3))
          setProgress(p => Math.min(95, p + 3))
        }
      }
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 40 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Przeróbka gotowego materiału</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
        Masz materiał dla klienta A, chcesz go dostosować do klienta B? Wgraj plik HTML, podaj dane nowego klienta — AI podmieni wszystkie treści specyficzne dla klienta, zachowując design i układ.
      </p>

      {!generating && !resultId && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Plik HTML z materiałem</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', background: fileName ? 'var(--accent-bg)' : 'white', transition: 'background 0.1s' }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: fileName ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: 4 }}>{fileName || 'Kliknij, żeby wybrać plik'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Obsługiwany format: .html</div>
              <input ref={fileRef} type="file" accept=".html" onChange={handleFile} style={{ display: 'none' }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nazwa nowego klienta *</label>
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="np. Hotel Radisson Zakopane" style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Branża</label>
            <input value={clientIndustry} onChange={e => setClientIndustry(e.target.value)} placeholder="np. Horeca, E-commerce" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Logo klienta (URL)</label>
            <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://klient.pl/logo.png" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Kolor marki</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setAccentColor(c)} style={{ width: 28, height: 28, borderRadius: 4, background: c, border: `2px solid ${accentColor === c ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer' }} />
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize: 12, color: '#c4320a', background: '#fef3f2', padding: '8px 12px', borderRadius: 5 }}>{error}</div>}

          <button type="submit" disabled={!fileName || !clientName} style={{ padding: '10px 0', background: fileName && clientName ? 'var(--accent)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 700, cursor: fileName && clientName ? 'pointer' : 'default' }}>
            Przeróbka z AI
          </button>
        </form>
      )}

      {generating && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>AI analizuje materiał i podmienia dane klienta...</p>
          <GenerationProgress activeStep={step} progress={progress} />
        </>
      )}

      {resultId && !generating && (
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Gotowe</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Materiał przerobiony i zapisany.</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Link href={`/material/${resultId}`} style={{ padding: '7px 20px', background: 'var(--accent)', color: 'white', borderRadius: 5, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Otwórz w edytorze</Link>
            <button onClick={() => { setResultId(null); setFileName(''); if (fileRef.current) fileRef.current.value = '' }} style={{ padding: '7px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, cursor: 'pointer' }}>Przeróbka kolejnego</button>
          </div>
        </div>
      )}
    </div>
  )
}
