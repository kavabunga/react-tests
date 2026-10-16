import { useState } from 'react'

import { Accounts } from './components/Accounts'

import './App.css'

function App() {
  const [isMounted, setIsMounted] = useState(false)

  return (
    <section id="center" className="app">
      <button
        type="button"
        className="list-toggle-button"
        onClick={() => setIsMounted((isMounted) => !isMounted)}
      >
        List is {isMounted ? 'Mounted' : 'Unmounted'}
      </button>
      {isMounted && <Accounts />}
    </section>
  )
}

export default App
