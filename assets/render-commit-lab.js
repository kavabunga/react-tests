import { createElement, useLayoutEffect, useRef, useState } from 'https://esm.sh/react@19.2.7'
import { createRoot } from 'https://esm.sh/react-dom@19.2.7/client'

const logEl = document.querySelector('[data-phase-log]')
const hostEl = document.querySelector('[data-phase-host]')
const clearButton = document.querySelector("[data-action='clear-phase-log']")
const h = createElement

function log(message) {
  const line = document.createElement('div')
  line.textContent = `${String(logEl.childElementCount + 1).padStart(2, '0')}  ${message}`
  logEl.append(line)
}

function Counter() {
  const [count, setCount] = useState(0)
  const buttonRef = useRef(null)
  const textDuringRender = buttonRef.current?.textContent ?? '(no DOM node yet)'

  log(`render: count=${count}; DOM text still ${JSON.stringify(textDuringRender)}`)

  useLayoutEffect(() => {
    log(`commit: DOM text now ${JSON.stringify(buttonRef.current.textContent)}`)
    requestAnimationFrame(() => log('paint: animation frame'))
  })

  return h(
    'button',
    {
      ref: buttonRef,
      type: 'button',
      onClick: () => {
        log('trigger: click → setState')
        setCount((value) => value + 1)
      },
    },
    `Count is ${count}`,
  )
}

log('trigger: root.render(<Counter />)')
createRoot(hostEl).render(h(Counter))

clearButton.addEventListener('click', () => {
  logEl.replaceChildren()
})
