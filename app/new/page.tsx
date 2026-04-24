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

const PRODUCT_GROUPS: { label: string; items: string[] }[] = [
  { label: 'LSI Software', items: [
    'POSitive Restaurant',
    'POSitive Cinema',
    'POSitive Hotel',
    'POSitive Retail',
    'POSitive Beauty',
    'POSitive ESOK',
    'LSI Cloud',
    'Gastro.pl',
    'Roomio',
    'be in touch',
  ] },
  { label: 'Positive Machines — dostawcze / gastro', items: [
    'PUDU BellaBot Pro · kelner 18,5"',
    'PUDU BellaBot · kelner',
    'PUDU KettyBot · recepcja / marketing',
    'PUDU HolaBot · cargo',
    'PUDU Pudubot2 · uniwersalny',
  ] },
  { label: 'Positive Machines — sprzątanie', items: [
    'PUDU CC1 Pro · sprzątanie AI',
    'PUDU CC1 · sprzątanie',
    'PUDU SH1 · szorowarka',
    'MAXHUB C3 · sprzątanie komercyjne',
  ] },
  { label: 'Positive Machines — zamiatanie', items: [
    'PUDU MT1 · zamiatarka AI',
    'PUDU MT1 Vac · zamiatarka z odkurzaczem',
    'PUDU MT1 Max · parkingi 3D',
  ] },
  { label: 'Positive Machines — transport / logistyka', items: [
    'PUDU T300 · transport 300 kg',
    'PUDU T600 · transport 600 kg',
    'PUDU T600 AGV',
  ] },
  { label: 'Positive Machines — inne', items: [
    'PUDU D9 · humanoid',
    'TRON 1 · robot kroczący',
  ] },
  { label: 'Inne', items: ['Inny'] },
]
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Dla kogo?</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Wklej adres strony klienta, a AI wyciągnie nazwę, branżę, logo i kolor marki.</p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={clientWebsite}
              onChange={e => setClientWebsite(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') analyzeWebsite() }}
              placeholder="klient.pl"
              autoFocus
              style={{ flex: 1, padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 6, fontSize: 15, outline: 'none', background: 'white' }}
            />
            <button
              onClick={analyzeWebsite}
              disabled={!clientWebsite.trim() || analyzing}
              style={{ padding: '12px 22px', background: clientWebsite.trim() && !analyzing ? 'var(--accent)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: clientWebsite.trim() && !analyzing ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
            >
              {analyzing ? 'Analizuję...' : 'Analizuj'}
            </button>
          </div>
          {analyzeError && <div style={{ fontSize: 12, color: '#c4320a', marginBottom: 10 }}>{analyzeError}</div>}

          {ctx.leads?.length ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Lub z Growth Hub</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ctx.leads.map(l => btn(l.name, client.name === l.name, () => setClient(c => ({ ...c, name: l.name, industry: l.industry ?? '' }))))}
              </div>
            </div>
          ) : null}

          {(client.name || client.description) && (
            <div style={{ marginTop: 20, background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Dane klienta {client.description && '(zaciągnięte przez AI — możesz edytować)'}</span>
                {client.primaryColor && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: client.primaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{client.primaryColor}</span>
                  </span>
                )}
              </div>
              <input value={client.name} onChange={e => setClient(c => ({ ...c, name: e.target.value }))} placeholder="Nazwa klienta" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box', background: 'white' }} />
              <input value={client.industry} onChange={e => setClient(c => ({ ...c, industry: e.target.value }))} placeholder="Branża" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box', background: 'white' }} />
              <textarea value={client.description} onChange={e => setClient(c => ({ ...c, description: e.target.value }))} placeholder="Czym zajmuje się firma" rows={2} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white', resize: 'vertical', fontFamily: 'inherit' }} />
              {client.logoUrl && <img src={client.logoUrl} alt="" style={{ height: 28, objectFit: 'contain', marginTop: 10 }} onError={e => (e.currentTarget.style.display = 'none')} />}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setStep(0)} style={{ padding: '8px 20px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', cursor: 'pointer', fontSize: 13 }}>← Wróć</button>
            <button onClick={() => { if (client.primaryColor) setAccentColor(client.primaryColor); if (client.logoUrl) setLogoUrl(client.logoUrl); setStep(2) }} disabled={!client.name} style={{ flex: 1, padding: '8px 20px', background: client.name ? 'var(--text-primary)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 5, cursor: client.name ? 'pointer' : 'default', fontSize: 13, fontWeight: 600 }}>Dalej →</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Parametry</h2>

          {/* kontekst klienta — przypomnienie kto i jakiego koloru */}
          {client.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 20 }}>
              {logoUrl && <img src={logoUrl} alt="" style={{ height: 22, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />}
              <div style={{ flex: 1, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{client.name}</span>
                {client.industry && <span style={{ color: 'var(--text-muted)' }}> · {client.industry}</span>}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: accentColor, border: '1px solid rgba(0,0,0,0.08)' }} />
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{accentColor}</span>
              </span>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Produkt</div>
            {PRODUCT_GROUPS.map(g => (
              <div key={g.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{g.label}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{g.items.map(p => btn(p, product === p, () => setProduct(p)))}</div>
              </div>
            ))}
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
              <InfoTip text="Kolor wyciągnięty ze strony klienta przez AI. Możesz go podmienić, jeśli chcesz zaakcentować coś innego." />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                style={{ width: 44, height: 36, borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'white' }}
              />
              <input
                type="text"
                value={accentColor}
                onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAccentColor(v) }}
                style={{ width: 100, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
              />
              {client.primaryColor && client.primaryColor !== accentColor && (
                <button onClick={() => setAccentColor(client.primaryColor!)} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 5, background: 'white', fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Przywróć kolor AI
                </button>
              )}
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
