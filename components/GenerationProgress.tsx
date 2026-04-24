const STEPS = ['Struktura', 'Copy', 'HTML', 'CSS']

export default function GenerationProgress({ activeStep, progress }: { activeStep: number; progress: number }) {
  return (
    <div style={{ background: 'var(--bg-sidebar)', borderRadius: 6, padding: '10px 12px', margin: '8px 0' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{ fontSize: 11, color: i < activeStep ? 'var(--green)' : i === activeStep ? 'var(--accent)' : 'var(--text-muted)', fontWeight: i === activeStep ? 700 : 400 }}>
            {i < activeStep ? '✓ ' : i === activeStep ? '⟳ ' : ''}{s}
          </span>
        ))}
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 10, height: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 10, background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}
