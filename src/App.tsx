import { useState } from 'react'
import { DerivativePage } from './components/DerivativePage'
import { FftPage } from './components/FftPage'
import { IntegralPage } from './components/IntegralPage'

type Tab = 'derivative' | 'integral' | 'fft'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'derivative', label: 'Derivative' },
  { id: 'integral', label: 'Integral' },
  { id: 'fft', label: 'Fourier Transform' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('derivative')

  return (
    <main className="page">
      <header className="header">
        <h1>MathVis</h1>
        <p className="subtitle">Interactive lessons that make the math visible.</p>
        <nav className="tabs" aria-label="Topics">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'derivative' && <DerivativePage />}
      {tab === 'integral' && <IntegralPage />}
      {tab === 'fft' && <FftPage />}
    </main>
  )
}
