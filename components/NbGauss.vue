<script setup>
import { ref, onMounted, watch } from 'vue'
import { makeData, split, accuracy, setupCanvas, drawField, drawPoints, toPx, toPy, C0, C1 } from '../utils/ml.js'

const SIZE = 340
const cv = ref(null)
const kind = ref('blobs'), noise = ref(0.2), seed = ref(4), showEll = ref(true)
const accTe = ref(0), params = ref(null)
let train = [], test = []

function fit() {
  const st = [0, 1].map(c => {
    const P = train.filter(p => p.c === c), n = P.length
    const mx = P.reduce((s, p) => s + p.x, 0) / n, my = P.reduce((s, p) => s + p.y, 0) / n
    const vx = P.reduce((s, p) => s + (p.x - mx) ** 2, 0) / n + 1e-4, vy = P.reduce((s, p) => s + (p.y - my) ** 2, 0) / n + 1e-4
    return { prior: n / train.length, mx, my, vx, vy }
  })
  params.value = st
  return st
}

const lg = (v, m, s2) => -0.5 * Math.log(2 * Math.PI * s2) - (v - m) ** 2 / (2 * s2)

function draw() {
  const st = fit()
  const f = (x, y) => {
    const l = st.map(s => Math.log(s.prior) + lg(x, s.mx, s.vx) + lg(y, s.my, s.vy))
    return 1 / (1 + Math.exp(l[0] - l[1]))
  }
  const ctx = setupCanvas(cv.value, SIZE)
  drawField(ctx, SIZE, f, 64)
  if (showEll.value) st.forEach((s, c) => {
    for (const k of [1, 2]) {
      ctx.beginPath()
      ctx.ellipse(toPx(s.mx, SIZE), toPy(s.my, SIZE), k * Math.sqrt(s.vx) / 3.2 * SIZE, k * Math.sqrt(s.vy) / 3.2 * SIZE, 0, 0, 2 * Math.PI)
      ctx.strokeStyle = c ? C1 : C0; ctx.lineWidth = k === 1 ? 2.2 : 1.2; ctx.setLineDash(k === 1 ? [] : [5, 4]); ctx.stroke(); ctx.setLineDash([])
    }
  })
  drawPoints(ctx, SIZE, train)
  drawPoints(ctx, SIZE, test, { hollow: true })
  accTe.value = accuracy(test, f)
}

function regen() { const s = split(makeData(kind.value, 200, noise.value, seed.value), 0.3, seed.value); train = s.train; test = s.test; draw() }
onMounted(regen)
watch([kind, noise, seed], regen)
watch(showEll, draw)
</script>

<template>
  <div class="demo">
    <canvas ref="cv" />
    <div class="panel">
      <label>Datos
        <select v-model="kind"><option value="blobs">Grupos</option><option value="corr">Correlacionados</option><option value="moons">Lunas</option><option value="circles">Círculos</option></select>
      </label>
      <label>Ruido: <span class="v">{{ noise.toFixed(2) }}</span><input type="range" min="0" max="0.6" step="0.02" v-model.number="noise"></label>
      <div class="row">
        <button :class="{ on: showEll }" @click="showEll = !showEll">Gaussianas</button>
        <button @click="seed++">🎲</button>
      </div>
      <div class="stats" v-if="params">
        <span class="dot0">μ azul</span><b>({{ params[0].mx.toFixed(2) }}, {{ params[0].my.toFixed(2) }})</b>
        <span class="dot1">μ naranja</span><b>({{ params[1].mx.toFixed(2) }}, {{ params[1].my.toFixed(2) }})</b>
        <span>Exact. prueba</span><b>{{ (accTe * 100).toFixed(1) }}%</b>
      </div>
      <div class="hint">Cada clase se modela con una gaussiana por variable, <b>sin correlación</b>: las elipses siempre quedan alineadas con los ejes. Prueba «Correlacionados» para ver dónde falla el supuesto ingenuo.</div>
    </div>
  </div>
</template>
