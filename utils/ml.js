// Utilidades compartidas por las demos: datos sintéticos, dibujo y modelos pequeños.

export const C0 = '#2563eb' // clase 0 (azul)
export const C1 = '#ea580c' // clase 1 (naranja)
export const DOM = 1.6 // el plano va de -DOM a DOM en ambos ejes

export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(r) {
  const u = Math.max(r(), 1e-12), v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Devuelve [{x, y, c}] con x, y en aprox. [-1.4, 1.4]
export function makeData(kind, n, noise, seed) {
  const r = rng(seed)
  const pts = []
  for (let i = 0; i < n; i++) {
    const c = i % 2
    let x, y
    if (kind === 'blobs') {
      x = (c ? 0.55 : -0.55) + gauss(r) * (0.25 + noise)
      y = (c ? 0.45 : -0.45) + gauss(r) * (0.25 + noise)
    } else if (kind === 'moons') {
      const t = r() * Math.PI
      if (c === 0) { x = Math.cos(t) - 0.5; y = Math.sin(t) - 0.25 }
      else { x = 1 - Math.cos(t) - 0.5; y = 0.25 - Math.sin(t) }
      x = x * 0.85 + gauss(r) * noise; y = y * 0.85 + gauss(r) * noise
    } else if (kind === 'circles') {
      const t = r() * 2 * Math.PI, rad = c ? 0.45 : 1.1
      x = rad * Math.cos(t) + gauss(r) * noise
      y = rad * Math.sin(t) + gauss(r) * noise
    } else if (kind === 'xor') {
      x = (r() * 2 - 1) * 1.3; y = (r() * 2 - 1) * 1.3
      x += gauss(r) * noise * 0.5; y += gauss(r) * noise * 0.5
      pts.push({ x, y, c: x * y > 0 ? 1 : 0 }); continue
    } else if (kind === 'corr') { // dos clases alargadas y correlacionadas
      const a = gauss(r) * 0.9, b = gauss(r) * (0.15 + noise * 0.5)
      x = a * 0.7 - b * 0.7 + (c ? 0.25 : -0.25)
      y = a * 0.7 + b * 0.7 - (c ? 0.25 : -0.25)
    }
    pts.push({ x, y, c })
  }
  return pts
}

export function split(pts, testFrac, seed) {
  const r = rng(seed + 99)
  const idx = pts.map((_, i) => i).sort(() => r() - 0.5)
  const nt = Math.round(pts.length * testFrac)
  const test = new Set(idx.slice(0, nt))
  return { train: pts.filter((_, i) => !test.has(i)), test: pts.filter((_, i) => test.has(i)) }
}

export function accuracy(pts, predProb) {
  if (!pts.length) return 0
  let ok = 0
  for (const p of pts) if ((predProb(p.x, p.y) >= 0.5 ? 1 : 0) === p.c) ok++
  return ok / pts.length
}

// --- dibujo ---
export function setupCanvas(cv, size) {
  const dpr = window.devicePixelRatio || 1
  cv.width = size * dpr; cv.height = size * dpr
  cv.style.width = size + 'px'; cv.style.height = size + 'px'
  const ctx = cv.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}
export const toPx = (v, size) => ((v + DOM) / (2 * DOM)) * size
export const toPy = (v, size) => size - ((v + DOM) / (2 * DOM)) * size
export const fromPx = (px, size) => (px / size) * 2 * DOM - DOM
export const fromPy = (py, size) => ((size - py) / size) * 2 * DOM - DOM

function mix(p) { // p = prob. de clase 1 -> color de fondo
  const a = [219, 234, 254], b = [255, 237, 213] // azul claro, naranja claro
  const s = Math.max(0, Math.min(1, p))
  const k = Math.abs(s - 0.5) * 2 // confianza
  const base = s >= 0.5 ? b : a
  return `rgb(${Math.round(255 + (base[0] - 255) * k)},${Math.round(255 + (base[1] - 255) * k)},${Math.round(255 + (base[2] - 255) * k)})`
}

export function drawField(ctx, size, f, res = 64) {
  const cell = size / res
  const vals = []
  for (let i = 0; i < res; i++) {
    vals.push([])
    for (let j = 0; j < res; j++) {
      const x = fromPx((i + 0.5) * cell, size), y = fromPy((j + 0.5) * cell, size)
      const p = f(x, y)
      vals[i].push(p)
      ctx.fillStyle = mix(p)
      ctx.fillRect(i * cell, j * cell, cell + 0.6, cell + 0.6)
    }
  }
  // frontera: celdas donde cambia la clase predicha
  ctx.fillStyle = '#1e293b'
  for (let i = 0; i < res; i++) for (let j = 0; j < res; j++) {
    const s = vals[i][j] >= 0.5
    if ((i + 1 < res && (vals[i + 1][j] >= 0.5) !== s) || (j + 1 < res && (vals[i][j + 1] >= 0.5) !== s))
      ctx.fillRect(i * cell + cell / 2, j * cell + cell / 2, 1.6, 1.6)
  }
  return vals
}

export function drawPoints(ctx, size, pts, { hollow = false, ring = null } = {}) {
  for (const p of pts) {
    const X = toPx(p.x, size), Y = toPy(p.y, size)
    ctx.beginPath(); ctx.arc(X, Y, 4.5, 0, 2 * Math.PI)
    ctx.lineWidth = 1.6
    if (hollow) { ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = p.c ? C1 : C0; ctx.stroke() }
    else { ctx.fillStyle = p.c ? C1 : C0; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.stroke() }
    if (ring && ring(p)) { ctx.beginPath(); ctx.arc(X, Y, 8.5, 0, 2 * Math.PI); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.6; ctx.stroke() }
  }
}

// --- árboles de decisión ---
function impurity(n0, n1, crit) {
  const n = n0 + n1
  if (!n) return 0
  const p0 = n0 / n, p1 = n1 / n
  if (crit === 'entropy') return -(p0 ? p0 * Math.log2(p0) : 0) - (p1 ? p1 * Math.log2(p1) : 0)
  return 1 - p0 * p0 - p1 * p1
}

export function buildTree(pts, { maxDepth = 5, minLeaf = 1, crit = 'gini', randFeat = null } = {}, depth = 0) {
  let n1 = 0
  for (const p of pts) n1 += p.c
  const n0 = pts.length - n1
  const leaf = { leaf: true, p: pts.length ? n1 / pts.length : 0.5, n: pts.length }
  if (depth >= maxDepth || n0 === 0 || n1 === 0 || pts.length < 2 * minLeaf) return leaf
  const feats = randFeat ? [randFeat() < 0.5 ? 'x' : 'y'] : ['x', 'y']
  let best = null
  const parent = impurity(n0, n1, crit)
  for (const f of feats) {
    const s = [...pts].sort((a, b) => a[f] - b[f])
    let l0 = 0, l1 = 0
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i].c) l1++; else l0++
      if (s[i][f] === s[i + 1][f]) continue
      const nl = i + 1, nr = s.length - nl
      if (nl < minLeaf || nr < minLeaf) continue
      const g = parent - (nl / s.length) * impurity(l0, l1, crit) - (nr / s.length) * impurity(n0 - l0, n1 - l1, crit)
      if (!best || g > best.g) best = { g, f, t: (s[i][f] + s[i + 1][f]) / 2 }
    }
  }
  if (!best || best.g <= 1e-9) return leaf
  const L = pts.filter(p => p[best.f] <= best.t), R = pts.filter(p => p[best.f] > best.t)
  return {
    leaf: false, f: best.f, t: best.t,
    l: buildTree(L, { maxDepth, minLeaf, crit, randFeat }, depth + 1),
    r: buildTree(R, { maxDepth, minLeaf, crit, randFeat }, depth + 1),
  }
}

export function treePredict(node, x, y) {
  while (!node.leaf) node = (node.f === 'x' ? x : y) <= node.t ? node.l : node.r
  return node.p
}

export function treeStats(node) {
  if (node.leaf) return { leaves: 1, depth: 0 }
  const a = treeStats(node.l), b = treeStats(node.r)
  return { leaves: a.leaves + b.leaves, depth: 1 + Math.max(a.depth, b.depth) }
}

// --- normal estándar ---
export function erf(x) {
  const s = Math.sign(x); x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return s * y
}
export const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2))
export const phi = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI)
