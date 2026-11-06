<script setup>
import { ref, onMounted, watch } from 'vue'
import { makeData, setupCanvas, drawPoints, toPx, toPy, fromPx, fromPy, rng } from '../utils/ml.js'

const SIZE = 340
const cv = ref(null)
const kind = ref('blobs'), noise = ref(0.15), seed = ref(2)
const kernel = ref('linear'), logC = ref(0), logG = ref(0.3)
const nSV = ref(0), acc = ref(0), margin = ref(null)
let data = [], alpha = [], b = 0, Y = []

const Cval = () => 10 ** logC.value
const Gval = () => 10 ** logG.value
function K(a, c) {
  if (kernel.value === 'linear') return a.x * c.x + a.y * c.y
  return Math.exp(-Gval() * ((a.x - c.x) ** 2 + (a.y - c.y) ** 2))
}

// SMO simplificado (Platt), suficiente para ~80 puntos
function train() {
  const n = data.length, C = Cval(), tol = 1e-3, r = rng(seed.value)
  Y = data.map(p => (p.c ? 1 : -1))
  const Km = data.map(a => data.map(c => K(a, c)))
  alpha = new Array(n).fill(0); b = 0
  const f = i => { let s = b; for (let j = 0; j < n; j++) if (alpha[j]) s += alpha[j] * Y[j] * Km[i][j]; return s }
  let passes = 0, iters = 0
  while (passes < 8 && iters < 400) {
    let changed = 0; iters++
    for (let i = 0; i < n; i++) {
      const Ei = f(i) - Y[i]
      if ((Y[i] * Ei < -tol && alpha[i] < C) || (Y[i] * Ei > tol && alpha[i] > 0)) {
        let j = Math.floor(r() * (n - 1)); if (j >= i) j++
        const Ej = f(j) - Y[j]
        const ai = alpha[i], aj = alpha[j]
        let L, H
        if (Y[i] !== Y[j]) { L = Math.max(0, aj - ai); H = Math.min(C, C + aj - ai) }
        else { L = Math.max(0, ai + aj - C); H = Math.min(C, ai + aj) }
        if (L >= H) continue
        const eta = 2 * Km[i][j] - Km[i][i] - Km[j][j]
        if (eta >= 0) continue
        let nj = aj - Y[j] * (Ei - Ej) / eta
        nj = Math.min(H, Math.max(L, nj))
        if (Math.abs(nj - aj) < 1e-5) continue
        const ni = ai + Y[i] * Y[j] * (aj - nj)
        const b1 = b - Ei - Y[i] * (ni - ai) * Km[i][i] - Y[j] * (nj - aj) * Km[i][j]
        const b2 = b - Ej - Y[i] * (ni - ai) * Km[i][j] - Y[j] * (nj - aj) * Km[j][j]
        alpha[i] = ni; alpha[j] = nj
        b = ni > 0 && ni < C ? b1 : nj > 0 && nj < C ? b2 : (b1 + b2) / 2
        changed++
      }
    }
    passes = changed ? 0 : passes + 1
  }
}

function dec(x, y) {
  const q = { x, y }
  let s = b
  for (let i = 0; i < data.length; i++) if (alpha[i] > 1e-6) s += alpha[i] * Y[i] * K(data[i], q)
  return s
}

function draw() {
  train()
  const ctx = setupCanvas(cv.value, SIZE)
  const res = 85, cell = SIZE / res, v = []
  for (let i = 0; i < res; i++) { v.push([]); for (let j = 0; j < res; j++) v[i].push(dec(fromPx((i + .5) * cell, SIZE), fromPy((j + .5) * cell, SIZE))) }
  for (let i = 0; i < res; i++) for (let j = 0; j < res; j++) {
    const d = v[i][j], inM = Math.abs(d) < 1
    ctx.fillStyle = d >= 0 ? (inM ? '#ffedd5' : '#fed7aa') : (inM ? '#dbeafe' : '#bfdbfe')
    ctx.fillRect(i * cell, j * cell, cell + .6, cell + .6)
  }
  const edge = (lvl, color, sz) => {
    ctx.fillStyle = color
    for (let i = 0; i < res - 1; i++) for (let j = 0; j < res - 1; j++) {
      const s = v[i][j] >= lvl
      if ((v[i + 1][j] >= lvl) !== s || (v[i][j + 1] >= lvl) !== s) ctx.fillRect(i * cell + cell / 2 - sz / 2, j * cell + cell / 2 - sz / 2, sz, sz)
    }
  }
  edge(1, '#64748b', 1.4); edge(-1, '#64748b', 1.4); edge(0, '#0f172a', 2.4)
  drawPoints(ctx, SIZE, data, { ring: p => alpha[data.indexOf(p)] > 1e-6 })
  nSV.value = alpha.filter(a => a > 1e-6).length
  let ok = 0; data.forEach((p, i) => { if ((dec(p.x, p.y) >= 0 ? 1 : -1) === Y[i]) ok++ }); acc.value = ok / data.length
  if (kernel.value === 'linear') {
    let wx = 0, wy = 0; data.forEach((p, i) => { wx += alpha[i] * Y[i] * p.x; wy += alpha[i] * Y[i] * p.y })
    margin.value = 2 / Math.hypot(wx, wy)
  } else margin.value = null
}

function regen() { data = makeData(kind.value, 80, noise.value, seed.value); draw() }
onMounted(regen)
watch([kind, noise, seed], regen)
watch([kernel, logC, logG], draw)
</script>

<template>
  <div class="demo">
    <canvas ref="cv" />
    <div class="panel">
      <label>Datos
        <select v-model="kind"><option value="blobs">Grupos</option><option value="moons">Lunas</option><option value="circles">Círculos</option><option value="xor">XOR</option></select>
      </label>
      <div class="row">Kernel:
        <button :class="{ on: kernel === 'linear' }" @click="kernel = 'linear'">Lineal</button>
        <button :class="{ on: kernel === 'rbf' }" @click="kernel = 'rbf'">RBF</button>
      </div>
      <label>C = <span class="v">{{ (10 ** logC).toPrecision(2) }}</span><input type="range" min="-2" max="2.5" step="0.1" v-model.number="logC"></label>
      <label v-if="kernel === 'rbf'">γ = <span class="v">{{ (10 ** logG).toPrecision(2) }}</span><input type="range" min="-1" max="1.7" step="0.1" v-model.number="logG"></label>
      <label>Ruido: <span class="v">{{ noise.toFixed(2) }}</span><input type="range" min="0" max="0.5" step="0.02" v-model.number="noise"></label>
      <button @click="seed++">Nuevos datos 🎲</button>
      <div class="stats">
        <span>Vectores de soporte</span><b>{{ nSV }}</b>
        <span>Exactitud</span><b>{{ (acc * 100).toFixed(1) }}%</b>
        <template v-if="margin != null"><span>Margen 2/‖w‖</span><b>{{ margin.toFixed(2) }}</b></template>
      </div>
      <div class="hint">Línea negra: f(x) = 0. Grises: f(x) = ±1 (el margen). Puntos con anillo: vectores de soporte. Baja C y mira cómo se ensancha el margen.</div>
    </div>
  </div>
</template>
