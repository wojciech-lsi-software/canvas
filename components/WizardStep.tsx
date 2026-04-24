const STEPS = ['Typ', 'Klient', 'Parametry', 'Generuj']

export default function WizardStep({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
          {i < STEPS.length - 1 && <div style={{ position: 'absolute', top: 12, left: '50%', width: '100%', height: 1, background: i < current ? 'var(--accent)' : 'var(--border)', zIndex: 0 }} />}
          <div style={{ width: 24, height: 24, borderRadius: '50%', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, position: 'relative', zIndex: 1, background: i < current ? 'var(--accent)' : i === current ? 'var(--text-primary)' : 'var(--border)', color: i <= current ? 'white' : 'var(--text-muted)' }}>
            {i < current ? '✓' : i + 1}
          </div>
          <div style={{ fontSize: 10, color: i === current ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === current ? 600 : 400 }}>{s}</div>
        </div>
      ))}
    </div>
  )
}
