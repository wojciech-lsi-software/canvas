'use client'
import { useState } from 'react'

export default function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 5, cursor: 'default', verticalAlign: 'middle' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1 }}>i</span>
      {show && (
        <span style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: 'var(--text-primary)', color: 'white', fontSize: 11, lineHeight: 1.5, padding: '6px 10px', borderRadius: 5, whiteSpace: 'normal', width: 200, zIndex: 100, pointerEvents: 'none' }}>
          {text}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: 'var(--text-primary)' }} />
        </span>
      )}
    </span>
  )
}
