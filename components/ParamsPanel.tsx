import { RemixParams } from '@/lib/templates'
import InfoTip from '@/components/InfoTip'

const PRODUCT_GROUPS: { label: string; items: string[] }[] = [
  { label: 'LSI Software', items: ['POSitive Restaurant', 'POSitive Cinema', 'Cinema1', 'POSitive Hotel', 'POSitive Retail', 'POSitive Beauty', 'POSitive ESOK', 'LSI Cloud', 'Gastro.pl', 'Roomio', 'be in touch'] },
  { label: 'PM — gastro', items: ['PUDU BellaBot Pro', 'PUDU BellaBot', 'PUDU KettyBot', 'PUDU HolaBot', 'PUDU Pudubot2'] },
  { label: 'PM — sprzątanie', items: ['PUDU CC1 Pro', 'PUDU CC1', 'PUDU SH1', 'MAXHUB C3'] },
  { label: 'PM — zamiatanie', items: ['PUDU MT1', 'PUDU MT1 Vac', 'PUDU MT1 Max'] },
  { label: 'PM — transport', items: ['PUDU T300', 'PUDU T600', 'PUDU T600 AGV'] },
  { label: 'PM — inne', items: ['PUDU D9', 'TRON 1'] },
]

interface Props {
  params: RemixParams
  onChange: (p: RemixParams) => void
  onRegenerate: () => void
  loading: boolean
  disabledReason?: string
}

const label = (text: string) => (
  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{text}</div>
)

const field = (value: string, placeholder: string, onChange: (v: string) => void) => (
  <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, marginBottom: 10, outline: 'none', fontFamily: 'var(--font)' }} />
)

export default function ParamsPanel({ params, onChange, onRegenerate, loading, disabledReason }: Props) {
  const set = (key: keyof RemixParams) => (val: string) => onChange({ ...params, [key]: val })
  const disabled = !!disabledReason

  return (
    <div style={{ width: 220, minWidth: 220, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label('Klient')}
      {field(params.clientName, 'Nazwa firmy', set('clientName'))}
      {field(params.clientIndustry, 'Branża', set('clientIndustry'))}

      {label('Produkt')}
      {PRODUCT_GROUPS.map(g => (
        <div key={g.label} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>{g.label}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {g.items.map(p => (
              <button key={p} onClick={() => set('productName')(p)} style={{ padding: '2px 7px', borderRadius: 10, border: `1px solid ${params.productName === p ? 'var(--accent)' : 'var(--border)'}`, background: params.productName === p ? 'var(--accent-bg)' : 'white', color: params.productName === p ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 10, cursor: 'pointer' }}>{p}</button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginBottom: 10 }} />

      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
        Logo klienta (URL)
        <InfoTip text="Adres URL do pliku z logo klienta." />
      </div>
      {field(params.logoUrl, 'https://klient.pl/logo.png', set('logoUrl'))}

      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
        Główny przekaz
        <InfoTip text="Co materiał ma wyróżnić." />
      </div>
      {field(params.focus, 'np. migracja do LSI Cloud', set('focus'))}

      {label('Kolor marki')}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
        <input type="color" value={params.accentColor} onChange={e => set('accentColor')(e.target.value)} style={{ width: 34, height: 28, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', padding: 1, background: 'white' }} />
        <input type="text" value={params.accentColor} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set('accentColor')(v) }} style={{ flex: 1, padding: '5px 7px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
      </div>

      {disabled ? (
        <div style={{ padding: '8px 10px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 5, fontSize: 11, color: '#9a3412', lineHeight: 1.4 }}>{disabledReason}</div>
      ) : (
        <button onClick={onRegenerate} disabled={loading} style={{ width: '100%', padding: '8px 0', background: loading ? 'var(--border)' : 'var(--accent)', color: 'white', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Regeneruję...' : 'Regeneruj'}
        </button>
      )}
    </div>
  )
}
