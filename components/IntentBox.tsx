interface Intent {
  intent: 'swap' | 'generate'
  detectedTemplate: string | null
  detectedClient: string | null
  detectedChanges: string[]
}

export default function IntentBox({ intent, onFast, onFull }: { intent: Intent; onFast: () => void; onFull: () => void }) {
  return (
    <div style={{ border: '1.5px solid var(--accent)', borderRadius: 8, padding: '12px 14px', background: '#f0f7ff', margin: '8px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>⚡ Tryb: Szybka edycja — wykryłem podmianę szablonu</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        {[
          { label: 'Szablon', val: intent.detectedTemplate ?? '—' },
          { label: 'Klient', val: intent.detectedClient ?? '—' },
          { label: 'Zmiany', val: intent.detectedChanges.join(', ') || '—' },
          { label: 'Czas', val: '~3 sek' },
        ].map(f => (
          <div key={f.label} style={{ background: 'white', border: '1px solid #c5d9f5', borderRadius: 4, padding: '4px 8px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{f.label}</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{f.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onFast} style={{ flex: 1, padding: '6px 0', background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>⚡ Generuj instant (~3 sek)</button>
        <button onClick={onFull} style={{ padding: '6px 14px', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>🧠 Pełna generacja AI</button>
      </div>
    </div>
  )
}
