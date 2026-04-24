'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchContext, LSIContext } from '@/lib/context'
import { TEMPLATES } from '@/lib/templates'
import WizardStep from '@/components/WizardStep'
import GenerationProgress from '@/components/GenerationProgress'
import InfoTip from '@/components/InfoTip'

const TYPES = [
  { id: 'landing', label: 'Landing Page', desc: 'Dedykowana strona internetowa dla klienta — można wysłać linkiem przed spotkaniem lub po nim' },
  { id: 'presentation', label: 'Prezentacja sprzedażowa', desc: 'Slajdy w HTML — do pokazania na ekranie podczas rozmowy z klientem' },
  { id: 'onepager', label: 'One-pager', desc: 'Jedna strona z ofertą — do wysłania mailowo lub wydruku' },
  { id: 'script', label: 'Skrypt rozmowy handlowej', desc: 'Gotowy scenariusz rozmowy z klientem — otwarcie, pytania, odpowiedzi na obiekcje, zamknięcie' },
  { id: 'email', label: 'Sekwencja emaili', desc: '3 gotowe emaile do wysyłki: pierwsze nawiązanie, follow-up z wartością, ostatnie podejście' },
]

const PRODUCTS = [
  'Cinema',
  'LSI Cloud',
  'Positive Restaurant',
  'Nogasite',
  'Pozytyw Hotel',
  'Pozytyw Cinema',
  'PUDU T300 · transport 300 kg',
  'PUDU T600 · transport 600 kg',
  'PUDU CC1 Pro · sprzątanie',
  'PUDU MT1 · sprzątanie zewnętrzne',
  'PUDU KettyBot · recepcja',
  'PUDU BellaBot · gastronomia',
  'PUDU HolaBot · transport w gastronomii',
  'Inny',
]
const COLORS = ['#2383e2', '#0f7b6c', '#9b6700', '#c4320a', '#5b21b6', '#37352f']

interface ClientData {
  name: string
  industry: string
  description: string
  tagline: string
  logoUrl: string
  primaryColor: string | null
}

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [ctx, setCtx] = useState<LSIContext>({})
  const [type, setType] = useState('')
  const [client, setClient] = useState<ClientData>({ name: '', industry: '', description: '', tagline: '', logoUrl: '', primaryColor: null })
  const [clientWebsite, setClientWebsite] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [product, setProduct] = useState('')
  const [focus, setFocus] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#2383e2')
  const [templateId, setTemplateId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchContext().then(setCtx) }, [])

  const filtered = TEMPLATES.filter(t => !type || t.type === type)

  async function analyzeWebsite() {
    const url = clientWebsite.trim()
    if (!url) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await fetch('/api/analyze-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) { setAnalyzeError('Nie udało się pobrać strony. Sprawdź adres URL.'); return }
      setClient(c => ({
        ...c,
        name: data.name || c.name,
        industry: data.industry || c.industry,
        description: data.description || c.description,
        tagline: data.tagline || c.tagline,
        logoUrl: data.logoUrl || c.logoUrl,
        primaryColor: data.primaryColor || c.primaryColor,
      }))
      if (data.logoUrl) setLogoUrl(data.logoUrl)
      if (data.primaryColor) setAccentColor(data.primaryColor)
    } catch {
      setAnalyzeError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload-asset', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setLogoUrl(data.url)
    } catch {
      // Silently skip
    }
  }

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
      body: JSON.stringify({
        mode: 'generate', type,
        client: { name: client.name, industry: client.industry, description: client.description, tagline: client.tagline },
        product, focus, logoUrl: logoUrl || client.logoUrl, accentColor,
        clientWebsite: clientWebsite || undefined,
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

          {/* Website analysis */}
          <div style={{ marginBottom: 20, background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              Strona klienta — automatyczna analiza
              <InfoTip text="Podaj adres strony klienta, a AI wyciągnie nazwę firmy, branżę, logo i kolory marki automatycznie." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={clientWebsite}
                onChange={e => setClientWebsite(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') analyzeWebsite() }}
                placeholder="https://klient.pl"
                style={{ flex: 1, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none', background: 'white' }}
              />
              <button
                onClick={analyzeWebsite}
                disabled={!clientWebsite.trim() || analyzing}
                style={{ padding: '7px 16px', background: clientWebsite.trim() && !analyzing ? 'var(--accent)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: clientWebsite.trim() && !analyzing ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
              >
                {analyzing ? 'Analizuję...' : 'Analizuj'}
              </button>
            </div>
            {analyzeError && <div style={{ fontSize: 11, color: '#c4320a', marginTop: 6 }}>{analyzeError}</div>}
            {client.description && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', background: 'white', borderRadius: 5, padding: '8px 10px', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</span>
                {client.industry && <span style={{ color: 'var(--text-muted)' }}> · {client.industry}</span>}
                <br />{client.description}
              </div>
            )}
          </div>

          {ctx.leads?.length ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Z Growth Hub</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {ctx.leads.map(l => btn(l.name, client.name === l.name, () => setClient(c => ({ ...c, name: l.name, industry: l.industry ?? '' }))))}
              </div>
            </>
          ) : null}

          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Dane klienta</div>
          <input value={client.name} onChange={e => setClient(c => ({ ...c, name: e.target.value }))} placeholder="Nazwa klienta" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
          <input value={client.industry} onChange={e => setClient(c => ({ ...c, industry: e.target.value }))} placeholder="Branża (np. Horeca, E-commerce)" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, marginBottom: 20, outline: 'none', boxSizing: 'border-box' }} />

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
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'flex', alignItems: 'center' }}>
              Główny temat / przekaz
              <InfoTip text="O czym ma być materiał — co chcesz, żeby klient zapamiętał. Np. 'automatyzacja rezerwacji w hotelu' albo 'migracja sklepu do LSI Cloud'." />
            </div>
            <input value={focus} onChange={e => setFocus(e.target.value)} placeholder="np. automatyzacja rezerwacji w hotelu" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'flex', alignItems: 'center' }}>
              Logo klienta
              <InfoTip text="URL do logo lub wgraj plik PNG/SVG/WebP. Logo zostanie wstawione do materiału." />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://klient.pl/logo.png" style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none' }} />
              <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                Wgraj plik
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg,application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>
            {logoUrl && <img src={logoUrl} alt="Logo klienta" style={{ height: 32, objectFit: 'contain', marginTop: 4 }} onError={e => (e.currentTarget.style.display = 'none')} />}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'flex', alignItems: 'center' }}>
              Kolor marki klienta
              <InfoTip text="Wybierz kolor zbliżony do barw klienta. Zostanie użyty jako kolor przewodni materiału." />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {COLORS.map(c => <button key={c} onClick={() => setAccentColor(c)} style={{ width: 28, height: 28, borderRadius: 4, background: c, border: `2px solid ${accentColor === c ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer' }} />)}
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }}
                title="Własny kolor"
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              Szablon bazowy
              <InfoTip text="Wybierz gotowy szablon jako punkt wyjścia — szybsza generacja bez AI. Lub zostaw 'Brak' żeby AI stworzył od zera." />
            </div>
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
          {[
            { l: 'Typ', v: type },
            { l: 'Klient', v: client.name },
            { l: 'Branża', v: client.industry || '—' },
            { l: 'Strona', v: clientWebsite || '—' },
            { l: 'Produkt', v: product },
            { l: 'Przekaz', v: focus || '—' },
            { l: 'Tryb', v: templateId ? 'Szablon bazowy' : 'Pełna generacja AI' },
          ].map(f => (
            <div key={f.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{f.l}</span>
              <span style={{ fontWeight: 500 }}>{f.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={() => setStep(2)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', fontSize: 13 }}>← Wróć</button>
            <button onClick={generate} style={{ flex: 1, padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Generuj</button>
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
