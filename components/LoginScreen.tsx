'use client'
import { useState } from 'react'
import { login } from '@/lib/auth'

const LSI_LOGO = 'https://www.lsisoftware.pl/wp-content/uploads/2020/01/LSI_Software_blue_500px.png'

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (login(password)) {
      onLogin()
    } else {
      setError(true)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '40px 36px', width: 340, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <img src={LSI_LOGO} alt="LSI Software" style={{ height: 40, marginBottom: 20 }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Canvas</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Generator materiałów marketingowych</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius: 5, fontSize: 14, marginBottom: 10, outline: 'none', background: 'var(--bg-sidebar)' }}
          />
          {error && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>Nieprawidłowe hasło</p>}
          <button type="submit" style={{ width: '100%', padding: 9, background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 500 }}>
            Zaloguj
          </button>
        </form>
      </div>
    </div>
  )
}
