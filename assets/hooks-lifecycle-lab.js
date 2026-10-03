import {
  StrictMode,
  createElement,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
} from 'https://esm.sh/react@19.2.7?dev'
import { createRoot } from 'https://esm.sh/react-dom@19.2.7/client?dev'

const logEl = document.querySelector('[data-hooks-log]')
const hostEl = document.querySelector('[data-hooks-host]')
const clearButton = document.querySelector("[data-action='clear-hooks-log']")
const dependencyButton = document.querySelector("[data-action='change-hooks-dependency']")
const visibilityButton = document.querySelector("[data-action='toggle-hooks-probe']")
const strictButton = document.querySelector("[data-action='toggle-hooks-strict']")
const modeEl = document.querySelector('[data-hooks-mode]')
const h = createElement
let root = createRoot(hostEl)
let version = 1
let visible = true
let strict = false

function log(message) {
  const line = document.createElement('div')
  line.textContent = `${String(logEl.childElementCount + 1).padStart(2, '0')}  ${message}`
  logEl.append(line)
}

function Probe({ version }) {
  const nodeRef = useRef(null)

  log(`render: version=${version}; ref=${nodeRef.current ? 'DOM node' : 'null'}`)

  useInsertionEffect(() => {
    log(`insertion setup: version=${version}`)

    return () => {
      log(`insertion cleanup: version=${version}`)
    }
  }, [version])

  useLayoutEffect(() => {
    log(`layout setup: version=${version}; text=${JSON.stringify(nodeRef.current.textContent)}`)

    const frame = requestAnimationFrame(() => {
      log(`rAF callback: version=${version}; before a browser paint`)
    })

    return () => {
      cancelAnimationFrame(frame)
      log(`layout cleanup: version=${version}`)
    }
  }, [version])

  useEffect(() => {
    log(`effect setup: version=${version}`)

    return () => {
      log(`effect cleanup: version=${version}`)
    }
  }, [version])

  return h('div', { ref: nodeRef }, `DOM version ${version}`)
}

function renderProbe() {
  modeEl.textContent = `Mode: ${strict ? 'Strict' : 'normal'}`
  visibilityButton.textContent = visible ? 'Unmount probe' : 'Mount probe'
  strictButton.textContent = strict ? 'Use normal mode' : 'Use Strict Mode'

  if (!visible) {
    root.render(null)
    return
  }

  const probe = h(Probe, { version })
  root.render(strict ? h(StrictMode, null, probe) : probe)
}

dependencyButton.addEventListener('click', () => {
  version += 1
  log('event: change dependency')
  renderProbe()
})

visibilityButton.addEventListener('click', () => {
  visible = !visible
  log(visible ? 'event: mount probe' : 'event: unmount probe')
  renderProbe()
})

strictButton.addEventListener('click', () => {
  strict = !strict
  log(`event: switch to ${strict ? 'Strict' : 'normal'} mode`)
  root.unmount()
  root = createRoot(hostEl)
  visible = true
  renderProbe()
})

clearButton.addEventListener('click', () => {
  logEl.replaceChildren()
})

renderProbe()
