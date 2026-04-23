import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder and Request for API route tests in jsdom
import { TextEncoder, TextDecoder } from 'util'
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

if (typeof global.Request === 'undefined') {
  class MockRequest {
    private _body: string
    public method: string
    public url: string
    constructor(url: string, init?: RequestInit) {
      this.url = url
      this.method = init?.method ?? 'GET'
      this._body = typeof init?.body === 'string' ? init.body : ''
    }
    async json() {
      return JSON.parse(this._body)
    }
  }
  global.Request = MockRequest as unknown as typeof Request
}
