import { RemixParams } from '@/lib/templates'

const PRODUCTS = ['Cinema', 'LSI Cloud', 'Nogasite', 'Inny']
const COLORS = ['#2383e2', '#0f7b6c', '#9b6700', '#c4320a', '#5b21b6', '#37352f']

interface Props {
  params: RemixParams
  onChange: (p: RemixParams) => void
  onRegenerate: () => void
  loading: boolean
}

const label = (text: string) => (
  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{text}</div>
)

const field = (value: string, placeholder: string, onChange: (v: string) => void) => (
  <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, marginBottom: 10, outline: 'none', fontFamily: 'var(--font)' }} />
)

export default function ParamsPanel({ params, onChange, onRegenerate, loading }: Props) {
  const set = (key: keyof RemixParams) => (val: string) => onChange({ ...params, [key]: val })

  return (
    <div style={{ width: 180, minWidth: 180, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label('Klient')}
      {field(params.clientName, 'Nazwa klienta', set('clientName'))}
      {field(params.clientIndustry, 'Branża', set('clientIndustry'))}
      {label('Produkt')}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
        {PRODUCTS.map(p => (
          <button key={p} onClick={() => set('productName')(p)} style={{ padding: '2px 8px', borderRadius: 10, border: `1px solid ${params.productName === p ? 'var(--accent)' : 'var(--border)'}`, background: params.productName === p ? 'var(--accent-bg)' : 'white', color: params.productName === p ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 10, cursor: 'pointer' }}>{p}</button>
        ))}
      </div>
      {label('Logo URL')}
      {field(params.logoUrl, 'https://...', set('logoUrl'))}
      {label('Fokus')}
      {field(params.focus, 'np. rezerwacje SPA', set('focus'))}
      {label('Kolor akcentu')}
      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
        {COLORS.map(c => <button key={c} onClick={() => set('accentColor')(c)} style={{ width: 20, height: 20, borderRadius: 3, background: c, border: `2px solid ${params.accentColor === c ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer' }} />)}
      </div>
      <button onClick={onRegenerate} disabled={loading} style={{ width: '100%', padding: '7px 0', background: loading ? 'var(--border)' : 'var(--accent)', color: 'white', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
        {loading ? '⟳ Regeneruję...' : '↺ Regeneruj'}
      </button>
    </div>
  )
}
