'use client'
import { useState, KeyboardEvent } from 'react'

export default function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')

  function send() {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        placeholder="Opisz co chcesz wygenerować..."
        rows={2}
        style={{ flex: 1, background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font)', resize: 'none', outline: 'none', color: 'var(--text-primary)' }}
      />
      <button
        onClick={send}
        disabled={disabled || !value.trim()}
        style={{ width: 36, height: 36, background: value.trim() && !disabled ? 'var(--accent)' : 'var(--border)', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2 12L22 2 12 22 9 13z"/></svg>
      </button>
    </div>
  )
}
