<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { makeData, split, accuracy, setupCanvas, drawField, drawPoints, buildTree, treePredict, treeStats, rng } from '../utils/ml.js'

const props = defineProps({ mode: { type: String, default: 'forest' } }) // 'tree' | 'forest'
const SIZE = 340
const cv = ref(null)
const kind = ref(props.mode === 'tree' ? 'moons' : 'circles'), noise = ref(0.25), seed = ref(5)
const depth = ref(props.mode === 'tree' ? 3 : 6), crit = ref('gini'), randFeat = ref(true)
const nTrees = ref(0), playing = ref(false), speed = ref(1)
const accTr = ref(0), accTe = ref(0), oob = ref(null), info = ref({ leaves: 1, depth: 0 })
const curve = ref([]) // tree: [{d, tr, te}] ; forest: [{n, te, oob}]
let train = [], test = [], trees = [], oobSum = [], oobCnt = [], timer = null, r = rng(1)

function regen() {
  const s = split(makeData(kind.value, 200, noise.value, seed.value), 0.3, seed.value)
  train = s.train; test = s.test
  if (props.mode === 'tree') { depthCurve(); draw() } else reset()
}

const singleTree = () => buildTree(train, { maxDepth: depth.value, crit: crit.value })

function depthCurve() {
  const c = []
  for (let d = 1; d <= 14; d++) {
    const t = buildTree(train, { maxDepth: d, crit: crit.value })
    const f = (x, y) => treePredict(t, x, y)
    c.push({ d, tr: accuracy(train, f), te: accuracy(test, f) })
  }
  curve.value = c
}

function forestPredict(x, y) {
  if (!trees.length) return 0.5
  let s = 0
  for (const t of trees) s += treePredict(t, x, y)
  return s / trees.length
}

function addTree() {
  const idx = train.map(() => Math.floor(r() * train.length))
  const inBag = new Set(idx)
  const t = buildTree(idx.map(i => train[i]), { maxDepth: depth.value, crit: crit.value, randFeat: randFeat.value ? r : null })
  trees.push(t)
  train.forEach((p, i) => { if (!inBag.has(i)) { oobSum[i] += treePredict(t, p.x, p.y); oobCnt[i]++ } })
  nTrees.value = trees.length
  let err = 0, m = 0
  train.forEach((p, i) => { if (oobCnt[i]) { m++; if ((oobSum[i] / oobCnt[i] >= 0.5 ? 1 : 0) !== p.c) err++ } })
  oob.value = m ? err / m : null
}

function reset() {
  stop(); trees = []; r = rng(seed.value * 7 + 1)
  oobSum = train.map(() => 0); oobCnt = train.map(() => 0)
  nTrees.value = 0; oob.value = null; curve.value = []
  draw()
}

function step(n = 1) {
  for (let i = 0; i < n && trees.length < 300; i++) addTree()
  const te = accuracy(test, forestPredict)
  curve.value = [...curve.value, { n: trees.length, te, oob: oob.value }]
  draw()
}
function play() {
  if (playing.value) return stop()
  playing.value = true
  timer = setInterval(() => { if (trees.length >= 300) return stop(); step(speed.value) }, 260)
}
function stop() { playing.value = false; clearInterval(timer) }

function draw() {
  const ctx = setupCanvas(cv.value, SIZE)
  let f
  if (props.mode === 'tree') {
    const t = singleTree(); info.value = treeStats(t)
    f = (x, y) => treePredict(t, x, y)
  } else f = forestPredict
  drawField(ctx, SIZE, f, 64)
  drawPoints(ctx, SIZE, train)
  drawPoints(ctx, SIZE, test, { hollow: true })
  accTr.value = accuracy(train, f); accTe.value = accuracy(test, f)
}

// mini gráfica
const W = 240, H = 110
const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const chart = computed(() => {
  const c = curve.value
  if (props.mode === 'tree') {
    const X = d => 24 + (d - 1) / 13 * (W - 32), Y = a => H - 16 - (a - 0.5) / 0.5 * (H - 26)
    return { a: path(c.map(p => [X(p.d), Y(p.tr)])), b: path(c.map(p => [X(p.d), Y(p.te)])), mark: X(depth.value), xl: 'profundidad', la: 'entren.', lb: 'prueba' }
  }
  const nMax = Math.max(20, c.length ? c[c.length - 1].n : 20)
  const X = n => 24 + (n / nMax) * (W - 32), Y = a => H - 16 - (a - 0.5) / 0.5 * (H - 26)
  return { a: path(c.filter(p => p.oob != null).map(p => [X(p.n), Y(1 - p.oob)])), b: path(c.map(p => [X(p.n), Y(p.te)])), mark: null, xl: 'número de árboles', la: '1 − error OOB', lb: 'prueba' }
})

onMounted(regen)
onUnmounted(stop)
watch([kind, noise, seed], regen)
watch([depth, crit, randFeat], () => { if (props.mode === 'tree') { depthCurve(); draw() } else reset() })
</script>

<template>
  <div class="demo">
    <canvas ref="cv" />
    <div class="panel">
      <label>Datos
        <select v-model="kind"><option value="moons">Lunas</option><option value="circles">Círculos</option><option value="xor">XOR</option><option value="blobs">Grupos</option></select>
      </label>
      <label>Profundidad máx.: <span class="v">{{ depth }}</span><input type="range" min="1" max="14" v-model.number="depth"></label>
      <label>Ruido: <span class="v">{{ noise.toFixed(2) }}</span><input type="range" min="0" max="0.6" step="0.02" v-model.number="noise"></label>
      <div class="row">
        <button :class="{ on: crit === 'gini' }" @click="crit = 'gini'">Gini</button>
        <button :class="{ on: crit === 'entropy' }" @click="crit = 'entropy'">Entropía</button>
        <button @click="seed++">🎲</button>
      </div>
      <template v-if="mode === 'forest'">
        <div class="row">
          <button @click="play">{{ playing ? '⏸ Pausa' : '▶ Play' }}</button>
          <button @click="step(1)">+1 árbol</button>
          <button @click="reset">↺</button>
          <select v-model.number="speed"><option :value="1">1×</option><option :value="5">5×</option><option :value="20">20×</option></select>
        </div>
        <button :class="{ on: randFeat }" @click="randFeat = !randFeat">Variable al azar en cada corte</button>
      </template>
    </div>
    <div class="panel">
      <div class="stats">
        <template v-if="mode === 'tree'"><span>Hojas</span><b>{{ info.leaves }}</b></template>
        <template v-else><span>Árboles</span><b>{{ nTrees }}</b><span>Error OOB</span><b>{{ oob == null ? '—' : (oob * 100).toFixed(1) + '%' }}</b></template>
        <span>Exact. entren.</span><b>{{ (accTr * 100).toFixed(1) }}%</b>
        <span>Exact. prueba</span><b>{{ (accTe * 100).toFixed(1) }}%</b>
      </div>
      <svg :width="W" :height="H" style="background:#f8fafc;border-radius:8px">
        <line x1="24" :x2="W - 8" :y1="H - 16" :y2="H - 16" stroke="#94a3b8" />
        <text x="2" y="14" style="font-size:10px" fill="#64748b">100%</text>
        <text x="2" :y="H - 13" style="font-size:10px" fill="#64748b">50%</text>
        <line v-if="chart.mark" :x1="chart.mark" :x2="chart.mark" y1="4" :y2="H - 16" stroke="#cbd5e1" stroke-dasharray="3 3" />
        <path :d="chart.a" fill="none" stroke="#2563eb" stroke-width="2" />
        <path :d="chart.b" fill="none" stroke="#ea580c" stroke-width="2" />
        <text :x="W - 8" :y="H - 3" style="font-size:10px" fill="#64748b" text-anchor="end">{{ chart.xl }}</text>
        <text x="44" y="12" style="font-size:10px" fill="#2563eb">— {{ chart.la }}</text>
        <text x="150" y="12" style="font-size:10px" fill="#ea580c">— {{ chart.lb }}</text>
      </svg>
      <div class="hint">{{ mode === 'tree' ? 'Sube la profundidad: la exactitud de entrenamiento llega a 100 % pero la de prueba no.' : 'El error OOB usa los datos que cada árbol no vio: estima el error de prueba gratis.' }}</div>
    </div>
  </div>
</template>
