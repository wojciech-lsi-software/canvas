import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

test('renderuje nazwę aplikacji i logo', () => {
  render(<Sidebar onLogout={jest.fn()} />)
  expect(screen.getByText('Canvas')).toBeInTheDocument()
  expect(screen.getByAltText('LSI Software')).toBeInTheDocument()
})

test('renderuje linki nawigacji', () => {
  render(<Sidebar onLogout={jest.fn()} />)
  expect(screen.getByText('Szybki chat')).toBeInTheDocument()
  expect(screen.getByText('Nowy materiał')).toBeInTheDocument()
  expect(screen.getByText('Szablony')).toBeInTheDocument()
  expect(screen.getByText('Moje materiały')).toBeInTheDocument()
  expect(screen.getByText('Kontekst')).toBeInTheDocument()
})
