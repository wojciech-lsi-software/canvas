'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchContext, LSIContext } from '@/lib/context'
import { TEMPLATES } from '@/lib/templates'
import WizardStep from '@/components/WizardStep'
import GenerationProgress from '@/components/GenerationProgress'

const TYPES = [
  { id: 'landing', label: 'Landing Page', icon: '🌐', desc: 'Strona sprzedażowa pod konkretny produkt lub klienta' },
  { id: 'presentation', label: 'Prezentacja', icon: '📊', desc: 'Slajdy sprzedażowe / pitch deck' },
  { id: 'onepager', label: 'One-pager', icon: '📄', desc: 'Krótkie zestawienie produktu lub oferty' },
]

const PRODUCTS = ['Cinema', 'LSI Cloud', 'Nogasite', 'Inny']
const COLORS = ['#2383e2', '#0f7b6c', '#9b6700', '#c4320a', '#5b21b6', '#37352f']

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [ctx, setCtx] = useState<LSIContext>({})
  const [type, setType] = useState('')
  const [client, setClient] = useState({ name: '', industry: '' })
  const [product, setProduct] = useState('')
  const [focus, setFocus] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#2383e2')
  const [templateId, setTemplateId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => { fetchContext().then(setCtx) }, [])

  const filtered = TEMPLATES.filter(t => !type || t.type === type)

  async function generate() {
    setGenerating(true)
    setGenStep(0)
    setProgress(5)

    if (templateId) {
      const res = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, params: { clientName: client.name, clientIndustry: client.industry, productName: product, logoUrl, accentColor, focus } }),
      })
      const data = await res.json()
      router.push(`/material/${data.materialId}`)
      return
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'generate', type, client, product, focus, logoUrl, accentColor }),
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
        if (json.done) { router.push(`/material/${json.materialId}`) }
        else {
          const stepMap: Record<string, number> = { structure: 0, copy: 1, html: 2, css: 3 }
          setGenStep(stepMap[json.step] ?? 0)
          setProgress(p => Math.min(95, p + 2))
        }
      }
    }
  }

  const btn = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, background: active ? 'var(--accent-bg)' : 'white', color: active ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
      {label}
    </button>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 40 }}>
      <WizardStep current={step} />

      {step === 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Jaki typ materiału?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setStep(1) }} style={{ padding: 16, border: `2px solid ${type === t.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, background: type === t.id ? 'var(--accent-bg)' : 'white', textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Dla kogo?</h2>
          {ctx.leads?.length ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Z Growth Hub</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {ctx.leads.map(l => btn(l.name, client.name === l.name, () => setClient({ name: l.name, industry: l.industry ?? '' })))}
              </div>
            </>
          ) : null}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Lub wpisz ręcznie</div>
          <input value={client.name} onChange={e => setClient(c => ({ ...c, name: e.target.value }))} placeholder="Nazwa klienta" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, marginBottom: 8, outline: 'none' }} />
          <input value={client.industry} onChange={e => setClient(c => ({ ...c, industry: e.target.value }))} placeholder="Branża (np. Horeca, E-commerce)" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, marginBottom: 20, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', fontSize: 13 }}>← Wróć</button>
            <button onClick={() => setStep(2)} disabled={!client.name} style={{ flex: 1, padding: '8px 20px', background: client.name ? 'var(--text-primary)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 5, cursor: client.name ? 'pointer' : 'default', fontSize: 13, fontWeight: 600 }}>Dalej →</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Parametry</h2>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Produkt</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{PRODUCTS.map(p => btn(p, product === p, () => setProduct(p)))}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Fokus / Kąt sprzedaży</div>
            <input value={focus} onChange={e => setFocus(e.target.value)} placeholder="np. rezerwacje SPA, e-commerce B2B" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Logo URL</div>
            <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Kolor akcentu</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => <button key={c} onClick={() => setAccentColor(c)} style={{ width: 28, height: 28, borderRadius: 4, background: c, border: `2px solid ${accentColor === c ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer' }} />)}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Szablon bazowy (opcjonalnie)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {btn('Brak — generuj od zera', !templateId, () => setTemplateId(''))}
              {filtered.map(t => btn(t.name, templateId === t.id, () => setTemplateId(t.id)))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', fontSize: 13 }}>← Wróć</button>
            <button onClick={() => setStep(3)} disabled={!product} style={{ flex: 1, padding: '8px 20px', background: product ? 'var(--text-primary)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 5, cursor: product ? 'pointer' : 'default', fontSize: 13, fontWeight: 600 }}>Dalej →</button>
          </div>
        </>
      )}

      {step === 3 && !generating && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Podsumowanie</h2>
          {[{ l: 'Typ', v: type }, { l: 'Klient', v: client.name }, { l: 'Produkt', v: product }, { l: 'Fokus', v: focus || '—' }, { l: 'Tryb', v: templateId ? 'Szybka edycja szablonu' : 'Pełna generacja AI' }].map(f => (
            <div key={f.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{f.l}</span>
              <span style={{ fontWeight: 500 }}>{f.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={() => setStep(2)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', fontSize: 13 }}>← Wróć</button>
            <button onClick={generate} style={{ flex: 1, padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>✨ Generuj</button>
          </div>
        </>
      )}

      {generating && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Generuję materiał...</h2>
          <GenerationProgress activeStep={genStep} progress={progress} />
        </>
      )}
    </div>
  )
}
