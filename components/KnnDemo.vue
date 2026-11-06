<script setup>
import { ref, onMounted, watch } from 'vue'
import { makeData, split, accuracy, setupCanvas, drawField, drawPoints, fromPx, fromPy } from '../utils/ml.js'

const SIZE = 340
const cv = ref(null)
const kind = ref('moons'), k = ref(5), noise = ref(0.2), seed = ref(3), weighted = ref(false)
const addClass = ref(1)
const accTr = ref(0), accTe = ref(0)
let train = [], test = []

function regen() {
  const s = split(makeData(kind.value, 160, noise.value, seed.value), 0.3, seed.value)
  train = s.train; test = s.test
  draw()
}

function predict(x, y) {
  const d = train.map(p => [(p.x - x) ** 2 + (p.y - y) ** 2, p.c])
  d.sort((a, b) => a[0] - b[0])
  const kk = Math.min(k.value, d.length)
  let s = 0, w = 0
  for (let i = 0; i < kk; i++) {
    const wi = weighted.value ? 1 / (Math.sqrt(d[i][0]) + 1e-3) : 1
    s += wi * d[i][1]; w += wi
  }
  return w ? s / w : 0.5
}

function draw() {
  const ctx = setupCanvas(cv.value, SIZE)
  drawField(ctx, SIZE, predict, 56)
  drawPoints(ctx, SIZE, train)
  drawPoints(ctx, SIZE, test, { hollow: true })
  accTr.value = accuracy(train, predict); accTe.value = accuracy(test, predict)
}

function click(e) {
  const r = cv.value.getBoundingClientRect()
  const sx = SIZE / r.width
  train.push({ x: fromPx((e.clientX - r.left) * sx, SIZE), y: fromPy((e.clientY - r.top) * sx, SIZE), c: addClass.value })
  draw()
}

onMounted(regen)
watch([kind, noise, seed], regen)
watch([k, weighted], draw)
</script>

<template>
  <div class="demo">
    <canvas ref="cv" @click="click" />
    <div class="panel">
      <label>Datos
        <select v-model="kind"><option value="moons">Lunas</option><option value="blobs">Grupos</option><option value="circles">Círculos</option><option value="xor">XOR</option></select>
      </label>
      <label>k vecinos: <span class="v">{{ k }}</span><input type="range" min="1" max="45" step="1" v-model.number="k"></label>
      <label>Ruido: <span class="v">{{ noise.toFixed(2) }}</span><input type="range" min="0" max="0.6" step="0.02" v-model.number="noise"></label>
      <div class="row">
        <button @click="seed++">Nuevos datos 🎲</button>
        <button :class="{ on: weighted }" @click="weighted = !weighted">Ponderar por distancia</button>
      </div>
      <div class="row">Clic agrega punto:
        <button :class="{ on: addClass === 0 }" @click="addClass = 0"><span class="dot0">●</span> azul</button>
        <button :class="{ on: addClass === 1 }" @click="addClass = 1"><span class="dot1">●</span> naranja</button>
      </div>
      <div class="stats">
        <span>Exactitud entren.</span><b>{{ (accTr * 100).toFixed(1) }}%</b>
        <span>Exactitud prueba</span><b>{{ (accTe * 100).toFixed(1) }}%</b>
      </div>
      <div class="hint">Rellenos = entrenamiento · huecos = prueba. Con k = 1 el modelo memoriza; con k grande se vuelve demasiado simple.</div>
    </div>
  </div>
</template>
