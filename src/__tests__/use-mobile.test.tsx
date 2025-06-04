import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { useIsMobile } from '../hooks/use-mobile'

function renderHook() {
  let result: boolean | undefined
  function Test() {
    result = useIsMobile()
    return null
  }
  const container = document.createElement('div')
  act(() => {
    ReactDOM.render(<Test />, container)
  })
  // allow useEffect to run
  act(() => {})
  return result
}

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('returns true on mobile widths', () => {
    window.innerWidth = 500
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const value = renderHook()
    expect(value).toBe(true)
  })

  it('returns false on desktop widths', () => {
    window.innerWidth = 1024
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })

    const value = renderHook()
    expect(value).toBe(false)
  })
})
