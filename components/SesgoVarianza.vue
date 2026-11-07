<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { makeData, setupCanvas, drawPoints, fromPx, fromPy, buildTree, treePredict, DOM } from '../utils/ml.js'

const SIZE = 330, M = 12, N = 50, RES = 46
const modelo = ref('knn'), nivel = ref(4) // índice de complejidad
const NIVELES = { knn: [40, 25, 15, 9, 5, 3, 2, 1], arbol: [1, 2, 3, 4, 6, 8, 10, 14] }
const cv = ref(null), mostrarDatos = ref(true)

// 12 conjuntos de entrenamiento distintos, sacados de la misma «realidad»
const sets = Array.from({ length: M }, (_, i) => makeData('moons', N, 0.3, 100 + i))
const prueba = makeData('moons', 600, 0.3, 999)

function entrenar(pts, tipo, c) {
  if (tipo === 'arbol') { const t = buildTree(pts, { maxDepth: c }); return (x, y) => treePredict(t, x, y) >= 0.5 ? 1 : 0 }
  return (x, y) => {
    const d = pts.map(p => [(p.x - x) ** 2 + (p.y - y) ** 2, p.c]).sort((a, b) => a[0] - b[0])
    let s = 0; for (let i = 0; i < c; i++) s += d[i][1]
    return s * 2 > c ? 1 : s * 2 < c ? 0 : d[0][1]
  }
}
function medir(tipo, c) {
  const ms = sets.map(s => entrenar(s, tipo, c))
  let errEnt = 0
  ms.forEach((f, i) => { errEnt += sets[i].filter(p => f(p.x, p.y) !== p.c).length / N })
  let errPru = 0, errMay = 0, desac = 0
  for (const p of prueba) {
    const v = ms.map(f => f(p.x, p.y)), uno = v.reduce((a, b) => a + b, 0), may = uno * 2 >= M ? 1 : 0
    errPru += v.filter(x => x !== p.c).length / M
    if (may !== p.c) errMay++
    desac += v.filter(x => x !== may).length / M
  }
  const n = prueba.length
  return { ms, ent: errEnt / M, pru: errPru / n, sesgo: errMay / n, varianza: desac / n }
}
const r = ref(null), curva = ref([])
function dibujar() {
  const c = NIVELES[modelo.value][nivel.value]
  r.value = medir(modelo.value, c)
  const ctx = setupCanvas(cv.value, SIZE), cell = SIZE / RES
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, SIZE, SIZE)
  const votos = Array.from({ length: RES }, () => new Array(RES).fill(0))
  r.value.ms.forEach(f => {
    const g = []
    for (let i = 0; i < RES; i++) { g.push([]); for (let j = 0; j < RES; j++) { const v = f(fromPx((i + 0.5) * cell, SIZE), fromPy((j + 0.5) * cell, SIZE)); g[i].push(v); votos[i][j] += v } }
    ctx.fillStyle = 'rgba(124,58,237,0.35)'
    for (let i = 0; i < RES - 1; i++) for (let j = 0; j < RES - 1; j++) if (g[i][j] !== g[i + 1][j] || g[i][j] !== g[i][j + 1]) ctx.fillRect(i * cell + cell / 2 - 1, j * cell + cell / 2 - 1, 2.2, 2.2)
  })
  // la frontera del «promedio» (voto mayoritario de los 12 modelos)
  ctx.fillStyle = '#0f172a'
  const may = votos.map(col => col.map(v => (v * 2 >= M ? 1 : 0)))
  for (let i = 0; i < RES - 1; i++) for (let j = 0; j < RES - 1; j++) if (may[i][j] !== may[i + 1][j] || may[i][j] !== may[i][j + 1]) ctx.fillRect(i * cell + cell / 2 - 1.6, j * cell + cell / 2 - 1.6, 3.2, 3.2)
  if (mostrarDatos.value) drawPoints(ctx, SIZE, sets[0])
}
function calcularCurva() { curva.value = NIVELES[modelo.value].map(c => medir(modelo.value, c)) }
onMounted(() => { calcularCurva(); dibujar() })
watch(modelo, () => { calcularCurva(); dibujar() })
watch([nivel, mostrarDatos], dibujar)

const W = 300, H = 170
const X = i => 30 + i / 7 * (W - 45), Y = v => H - 24 - v / 0.5 * (H - 40)
const path = k => curva.value.map((c, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(Math.min(c[k], 0.5)).toFixed(1)}`).join('')
const pct = v => (v * 100).toFixed(1) + ' %'
</script>

<template>
  <div class="demo" style="gap:16px">
    <canvas ref="cv" />
    <div style="display:flex;flex-direction:column;gap:6px">
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <line :x1="X(0)" :x2="X(7)" :y1="Y(0)" :y2="Y(0)" stroke="#94a3b8" />
        <text x="4" :y="Y(0.5) + 4" style="font-size:10px" fill="#64748b">50%</text><text x="8" :y="Y(0) + 4" style="font-size:10px" fill="#64748b">0%</text>
        <line :x1="X(nivel)" :x2="X(nivel)" :y1="Y(0.5)" :y2="Y(0)" stroke="#0f172a" stroke-dasharray="4 3" />
        <path :d="path('ent')" fill="none" stroke="#2563eb" stroke-width="2.2" />
        <path :d="path('pru')" fill="none" stroke="#ea580c" stroke-width="2.2" />
        <path :d="path('varianza')" fill="none" stroke="#7c3aed" stroke-width="1.6" stroke-dasharray="5 3" />
        <text :x="X(0)" :y="H - 8" style="font-size:10px" fill="#64748b">simple</text>
        <text :x="X(7)" :y="H - 8" text-anchor="end" style="font-size:10px" fill="#64748b">complejo →</text>
        <text :x="X(0) + 2" y="14" style="font-size:10px" fill="#2563eb">— error entren.</text>
        <text :x="X(0) + 86" y="14" style="font-size:10px" fill="#ea580c">— error prueba</text>
        <text :x="X(0) + 170" y="14" style="font-size:10px" fill="#7c3aed">┅ varianza</text>
      </svg>
      <div v-if="r" class="stats" style="width:280px">
        <span>Error de entrenamiento</span><b>{{ pct(r.ent) }}</b>
        <span>Error de prueba</span><b>{{ pct(r.pru) }}</b>
        <span>≈ Sesgo (error del promedio)</span><b>{{ pct(r.sesgo) }}</b>
        <span>≈ Varianza (desacuerdo)</span><b>{{ pct(r.varianza) }}</b>
      </div>
    </div>
    <div class="panel" style="min-width:210px;max-width:220px">
      <div class="row">
        <button :class="{ on: modelo === 'knn' }" @click="modelo = 'knn'">kNN</button>
        <button :class="{ on: modelo === 'arbol' }" @click="modelo = 'arbol'">Árbol</button>
      </div>
      <label>Complejidad: <span class="v">{{ modelo === 'knn' ? 'k = ' : 'profundidad = ' }}{{ NIVELES[modelo][nivel] }}</span>
        <input type="range" min="0" max="7" v-model.number="nivel">
      </label>
      <button :class="{ on: mostrarDatos }" @click="mostrarDatos = !mostrarDatos">Ver datos del modelo 1</button>
      <div class="hint">Morado: las fronteras de <b>12 modelos</b> entrenados con 12 muestras distintas de la misma población. Negro: su frontera «promedio».</div>
      <div class="hint">Simple: las 12 fronteras se parecen pero no siguen la forma real (<b>sesgo</b>). Complejo: cada una sigue el ruido de su muestra y difieren mucho (<b>varianza</b>).</div>
    </div>
  </div>
</template>
