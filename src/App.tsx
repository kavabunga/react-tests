import { useState } from 'react'
import './App.css'
import { Movies } from './Movies'

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
      {isMounted && <Movies />}
    </section>
  )
}

export default App
