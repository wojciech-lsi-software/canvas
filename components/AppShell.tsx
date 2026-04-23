'use client'
import { useState, useEffect } from 'react'
import { isLoggedIn } from '@/lib/auth'
import LoginScreen from './LoginScreen'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAuthed(isLoggedIn())
  }, [])

  if (!mounted) return null
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onLogout={() => setAuthed(false)} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
