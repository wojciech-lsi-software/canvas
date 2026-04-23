import { render, screen, fireEvent } from '@testing-library/react'
import LoginScreen from '@/components/LoginScreen'

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_PASSWORD = 'test123'
})

test('renderuje formularz logowania z logo LSI', () => {
  render(<LoginScreen onLogin={jest.fn()} />)
  expect(screen.getByAltText('LSI Software')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Hasło')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /zaloguj/i })).toBeInTheDocument()
})

test('wywołuje onLogin po poprawnym haśle', () => {
  const onLogin = jest.fn()
  render(<LoginScreen onLogin={onLogin} />)
  fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: 'test123' } })
  fireEvent.click(screen.getByRole('button', { name: /zaloguj/i }))
  expect(onLogin).toHaveBeenCalled()
})

test('pokazuje błąd przy złym haśle', () => {
  render(<LoginScreen onLogin={jest.fn()} />)
  fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: 'zle' } })
  fireEvent.click(screen.getByRole('button', { name: /zaloguj/i }))
  expect(screen.getByText(/nieprawidłowe hasło/i)).toBeInTheDocument()
})
