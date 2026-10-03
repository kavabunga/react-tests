import { createElement, useState } from 'https://esm.sh/react@19.2.7'
import { createRoot } from 'https://esm.sh/react-dom@19.2.7/client'

const logEl = document.querySelector('[data-snapshot-log]')
const hostEl = document.querySelector('[data-snapshot-host]')
const clearButton = document.querySelector("[data-action='clear-snapshot-log']")
const h = createElement

function log(message) {
  const line = document.createElement('div')
  line.textContent = `${String(logEl.childElementCount + 1).padStart(2, '0')}  ${message}`
  logEl.append(line)
}

function Lab() {
  const [count, setCount] = useState(0)

  log(`render: count snapshot is ${count}`)

  return h('div', { className: 'lab-stack' }, [
    h('p', { key: 'n' }, `count = ${count}`),
    h(
      'button',
      {
        key: 'replace',
        type: 'button',
        onClick: () => {
          log(`click: snapshot is ${count}; queue count+1 three times`)
          setCount(count + 1)
          setCount(count + 1)
          setCount(count + 1)
          log('click: still in this task; no new render yet')
        },
      },
      '+1 three times (value)',
    ),
    h(
      'button',
      {
        key: 'updater',
        type: 'button',
        onClick: () => {
          log(`click: snapshot is ${count}; queue n => n+1 three times`)
          setCount((n) => n + 1)
          setCount((n) => n + 1)
          setCount((n) => n + 1)
        },
      },
      '+1 three times (updater)',
    ),
    h(
      'button',
      {
        key: 'delay',
        type: 'button',
        onClick: () => {
          log(`click: snapshot is ${count}; alert in 1s`)
          setCount(count + 1)
          setTimeout(() => {
            log(`timeout task: still sees snapshot ${count}`)
          }, 1000)
        },
      },
      'set + delayed log',
    ),
  ])
}

createRoot(hostEl).render(h(Lab))

clearButton.addEventListener('click', () => {
  logEl.replaceChildren()
})
