const inspectEl = document.querySelector('[data-inspect]')
const hostEl = document.querySelector('[data-react-host]')
const afterEl = document.querySelector('[data-after-commit]')
const createButton = document.querySelector("[data-action='inspect-element']")
const commitButton = document.querySelector("[data-action='commit-root']")

let reactElement = null
let root = null
let createElement
let createRoot
let flushSync

function show(target, text) {
  target.textContent = text
}

createButton.addEventListener('click', async () => {
  if (!createElement) {
    const react = await import('https://esm.sh/react@19.2.7')
    createElement = react.createElement
  }

  reactElement = createElement('button', { type: 'button', className: 'counter' }, 'Save')

  show(
    inspectEl,
    [
      `typeof element: ${typeof reactElement}`,
      `element instanceof HTMLButtonElement: ${reactElement instanceof HTMLButtonElement}`,
      `type: ${JSON.stringify(reactElement.type)}`,
      `props: ${JSON.stringify(reactElement.props)}`,
    ].join('\n'),
  )

  commitButton.disabled = false
})

commitButton.addEventListener('click', async () => {
  if (!reactElement) {
    return
  }

  if (!createRoot) {
    const reactDom = await import('https://esm.sh/react-dom@19.2.7')
    const reactDomClient = await import('https://esm.sh/react-dom@19.2.7/client')
    createRoot = reactDomClient.createRoot
    flushSync = reactDom.flushSync
  }

  if (!root) {
    root = createRoot(hostEl)
  }

  flushSync(() => {
    root.render(reactElement)
  })

  const domButton = hostEl.querySelector('button')

  show(
    afterEl,
    [
      `host child: ${domButton ? domButton.tagName.toLowerCase() : 'none'}`,
      `domButton instanceof HTMLButtonElement: ${domButton instanceof HTMLButtonElement}`,
      `domButton === reactElement: ${domButton === reactElement}`,
      `domButton.textContent: ${JSON.stringify(domButton?.textContent)}`,
    ].join('\n'),
  )
})
