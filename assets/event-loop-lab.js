const logEl = document.querySelector('[data-event-log]')
const runButton = document.querySelector("[data-action='run-order']")
const clickButton = document.querySelector("[data-action='click-order']")
const clearButton = document.querySelector("[data-action='clear-log']")

function log(message) {
  const line = document.createElement('div')
  line.textContent = `${String(logEl.childElementCount + 1).padStart(2, '0')}  ${message}`
  logEl.append(line)
}

function clearLog() {
  logEl.replaceChildren()
}

function scheduleOrder(label) {
  log(`${label}: sync`)

  queueMicrotask(() => log(`${label}: microtask`))

  Promise.resolve().then(() => log(`${label}: promise then`))

  setTimeout(() => log(`${label}: timeout 0`), 0)

  requestAnimationFrame(() => log(`${label}: animation frame (near paint)`))
}

runButton.addEventListener('click', () => {
  clearLog()
  scheduleOrder('script')
})

clickButton.addEventListener('click', () => {
  clearLog()
  scheduleOrder('click task')
})

clearButton.addEventListener('click', clearLog)
