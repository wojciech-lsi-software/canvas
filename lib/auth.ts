const SESSION_KEY = 'canvas_auth'

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function login(password: string): boolean {
  if (typeof window === 'undefined') return false
  const expected = process.env.NEXT_PUBLIC_APP_PASSWORD
  if (!expected) {
    console.warn('[auth] NEXT_PUBLIC_APP_PASSWORD is not set')
    return false
  }
  if (password === expected) {
    sessionStorage.setItem(SESSION_KEY, '1')
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
