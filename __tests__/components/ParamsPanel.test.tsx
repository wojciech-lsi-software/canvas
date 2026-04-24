import { render, screen, fireEvent } from '@testing-library/react'
import ParamsPanel from '@/components/ParamsPanel'

const PARAMS = { clientName: 'Hotel Test', clientIndustry: 'Horeca', productName: 'Cinema', logoUrl: '', accentColor: '#2383e2', focus: '' }

test('renderuje pola parametrów', () => {
  render(<ParamsPanel params={PARAMS} onChange={jest.fn()} onRegenerate={jest.fn()} loading={false} />)
  expect(screen.getByDisplayValue('Hotel Test')).toBeInTheDocument()
  expect(screen.getByDisplayValue('Horeca')).toBeInTheDocument()
})

test('wywołuje onChange po edycji pola', () => {
  const onChange = jest.fn()
  render(<ParamsPanel params={PARAMS} onChange={onChange} onRegenerate={jest.fn()} loading={false} />)
  fireEvent.change(screen.getByDisplayValue('Hotel Test'), { target: { value: 'Nowy Hotel' } })
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ clientName: 'Nowy Hotel' }))
})

test('wywołuje onRegenerate po kliknięciu przycisku', () => {
  const onRegenerate = jest.fn()
  render(<ParamsPanel params={PARAMS} onChange={jest.fn()} onRegenerate={onRegenerate} loading={false} />)
  fireEvent.click(screen.getByRole('button', { name: /regeneruj/i }))
  expect(onRegenerate).toHaveBeenCalled()
})
