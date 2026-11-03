import fs from 'node:fs'

const p =
  'C:/Users/popoo/.cursor/browser-logs/cdp-response-Runtime.evaluate-2026-11-03T17-22-12-681Z.json'
const raw = JSON.parse(fs.readFileSync(p, 'utf8'))
const val = raw.result?.value ?? raw.result?.result?.value ?? raw
const data = typeof val === 'string' ? JSON.parse(val) : val
const cards = (data.cards || []).filter((c) => c.name && c.price)

fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/products.json', JSON.stringify(cards, null, 2))
console.log('count', cards.length)
console.log(cards.slice(0, 5).map((c) => `${c.price} — ${c.name}`).join('\n'))
