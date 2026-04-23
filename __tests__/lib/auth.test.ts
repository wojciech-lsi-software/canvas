import { isLoggedIn, login, logout } from '@/lib/auth'

const PASS = 'test123'

beforeEach(() => {
  sessionStorage.clear()
  process.env.NEXT_PUBLIC_APP_PASSWORD = PASS
})

test('isLoggedIn zwraca false gdy brak sesji', () => {
  expect(isLoggedIn()).toBe(false)
})

test('login z dobrym hasłem ustawia sesję i zwraca true', () => {
  expect(login(PASS)).toBe(true)
  expect(isLoggedIn()).toBe(true)
})

test('login z złym hasłem zwraca false', () => {
  expect(login('zle')).toBe(false)
  expect(isLoggedIn()).toBe(false)
})

test('logout czyści sesję', () => {
  login(PASS)
  logout()
  expect(isLoggedIn()).toBe(false)
})
