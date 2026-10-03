const source = document.querySelector('[data-dom-source]')
const preview = document.querySelector('[data-dom-preview]')
const tree = document.querySelector('[data-dom-tree]')
const parseButton = document.querySelector("[data-action='parse']")
const mutateButton = document.querySelector("[data-action='mutate']")

function describe(node, depth = 0) {
  const indent = '  '.repeat(depth)

  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.textContent.trim()
    return value ? [`${indent}#text "${value}"`] : []
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return []
  }

  const attributes = [...node.attributes].map(({ name, value }) => ` ${name}="${value}"`).join('')
  const line = `${indent}<${node.tagName.toLowerCase()}${attributes}>`
  return [line, ...[...node.childNodes].flatMap((child) => describe(child, depth + 1))]
}

function parse() {
  const parsed = new DOMParser().parseFromString(source.value, 'text/html')
  preview.replaceChildren(...parsed.body.childNodes)
  tree.textContent = [...preview.childNodes].flatMap((node) => describe(node)).join('\n')
}

parseButton.addEventListener('click', parse)

mutateButton.addEventListener('click', () => {
  const target = preview.querySelector('strong')

  if (!target) {
    return
  }

  target.textContent = 'changed DOM'
  target.style.color = '#b54a2a'
  tree.textContent = [...preview.childNodes].flatMap((node) => describe(node)).join('\n')
})

parse()
