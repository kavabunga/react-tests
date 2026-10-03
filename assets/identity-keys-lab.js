import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'https://esm.sh/react@19.2.7?dev'
import { createRoot } from 'https://esm.sh/react-dom@19.2.7/client?dev'

const hostEl = document.querySelector('[data-identity-host]')
const logEl = document.querySelector('[data-identity-log]')
const clearButton = document.querySelector("[data-action='clear-identity-log']")
const h = createElement
let nodeId = 1

function log(message) {
  const line = document.createElement('div')
  line.textContent = `${String(logEl.childElementCount + 1).padStart(2, '0')}  ${message}`
  logEl.append(line)
}

function IdentityProbe({ label, keyed }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!ref.current.dataset.nodeId) {
      ref.current.dataset.nodeId = String(nodeId++)
    }

    log(`${label}: setup node=${ref.current.dataset.nodeId} count=${count} keyed=${keyed}`)

    return () => {
      log(`${label}: cleanup node=${ref.current.dataset.nodeId} count=${count} keyed=${keyed}`)
    }
  }, [label, count, keyed])

  return h('div', { className: 'panel' }, [
    h('p', { key: 'who' }, `${label} count = ${count}`),
    h('p', { key: 'node', ref }, 'node id pending'),
    h(
      'button',
      {
        key: 'inc',
        type: 'button',
        onClick: () => setCount((value) => value + 1),
      },
      'Increment local state',
    ),
  ])
}

function ContactRow({ contact }) {
  const [draft, setDraft] = useState(contact.name)

  return h('li', null, [
    h('strong', { key: 'id' }, `${contact.id}. `),
    h('span', { key: 'label' }, `${contact.label}: `),
    h('input', {
      key: 'input',
      value: draft,
      onChange: (event) => setDraft(event.target.value),
    }),
  ])
}

function ListDemo({ useStableKeys }) {
  const [reverse, setReverse] = useState(false)
  const contacts = [
    { id: 'a', label: 'Alpha', name: 'Alice' },
    { id: 'b', label: 'Beta', name: 'Bob' },
    { id: 'c', label: 'Gamma', name: 'Cara' },
  ]
  const shown = reverse ? [...contacts].reverse() : contacts

  return h('div', { className: 'panel' }, [
    h('p', { key: 'mode' }, `Keys: ${useStableKeys ? 'stable id' : 'array index'}`),
    h(
      'button',
      {
        key: 'reverse',
        type: 'button',
        onClick: () => setReverse((value) => !value),
      },
      reverse ? 'Original order' : 'Reverse order',
    ),
    h(
      'ul',
      { key: 'list' },
      shown.map((contact, index) =>
        h(ContactRow, {
          key: useStableKeys ? contact.id : index,
          contact,
        }),
      ),
    ),
  ])
}

function ResetDemo() {
  const [version, setVersion] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      if (!inputRef.current.dataset.nodeId) {
        inputRef.current.dataset.nodeId = String(nodeId++)
      }
      log(`reset demo: current input node=${inputRef.current.dataset.nodeId}`)
    }
  }, [version])

  return h('div', { className: 'panel' }, [
    h(
      'button',
      {
        key: 'reset',
        type: 'button',
        onClick: () => setVersion((value) => value + 1),
      },
      'Change key and reset',
    ),
    h('input', {
      key: version,
      ref: inputRef,
      defaultValue: 'Type here, then reset',
    }),
  ])
}

function App() {
  const [isTaylor, setIsTaylor] = useState(true)
  const [useKey, setUseKey] = useState(false)
  const label = isTaylor ? 'Taylor' : 'Sarah'

  const probe = h(IdentityProbe, {
    key: useKey ? label : 'shared',
    label,
    keyed: useKey,
  })

  return h('div', { className: 'lab-stack' }, [
    h('div', { key: 'switcher', className: 'split' }, [
      h('div', { key: 'player', className: 'panel' }, [
        h('h3', { key: 'title' }, 'Same position, optional key'),
        h(
          'button',
          {
            key: 'toggle-player',
            type: 'button',
            onClick: () => setIsTaylor((value) => !value),
          },
          `Switch player (${label})`,
        ),
        h(
          'button',
          {
            key: 'toggle-key',
            type: 'button',
            onClick: () => setUseKey((value) => !value),
          },
          useKey ? 'Using explicit key' : 'No explicit key',
        ),
        probe,
      ]),
      h('div', { key: 'reset', className: 'panel' }, [
        h('h3', { key: 'title' }, 'Key forces replacement'),
        h(ResetDemo, { key: 'demo' }),
      ]),
    ]),
    h('div', { key: 'lists', className: 'split' }, [
      h('div', { key: 'stable' }, h(ListDemo, { useStableKeys: true })),
      h('div', { key: 'index' }, h(ListDemo, { useStableKeys: false })),
    ]),
  ])
}

createRoot(hostEl).render(h(App))

clearButton.addEventListener('click', () => {
  logEl.replaceChildren()
})
