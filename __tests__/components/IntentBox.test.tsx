import { render, screen, fireEvent } from '@testing-library/react'
import IntentBox from '@/components/IntentBox'

const INTENT = {
  intent: 'swap' as const,
  detectedTemplate: 'cinema-hotel-base',
  detectedClient: 'Radisson',
  detectedChanges: ['logo', 'nazwa'],
}

test('renderuje tryb szybkiej edycji z wykrytymi parametrami', () => {
  render(<IntentBox intent={INTENT} onFast={jest.fn()} onFull={jest.fn()} />)
  expect(screen.getByText(/Tryb: Szybka edycja/i)).toBeInTheDocument()
  expect(screen.getByText('cinema-hotel-base')).toBeInTheDocument()
  expect(screen.getByText('Radisson')).toBeInTheDocument()
})

test('wywołuje onFast po kliknięciu Generuj instant', () => {
  const onFast = jest.fn()
  render(<IntentBox intent={INTENT} onFast={onFast} onFull={jest.fn()} />)
  fireEvent.click(screen.getByText(/Generuj instant/i))
  expect(onFast).toHaveBeenCalled()
})

test('wywołuje onFull po kliknięciu Pełna generacja', () => {
  const onFull = jest.fn()
  render(<IntentBox intent={INTENT} onFast={jest.fn()} onFull={onFull} />)
  fireEvent.click(screen.getByText(/Pełna generacja/i))
  expect(onFull).toHaveBeenCalled()
})
