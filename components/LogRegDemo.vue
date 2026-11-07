<script setup>
import { ref, computed, onUnmounted } from 'vue'
import PlanoAlumnos from './PlanoAlumnos.vue'
import { ALUMNOS, ANA, zh, za, MU_A, SD_A, MU_H, SD_H } from '../utils/alumnos.js'

const w1 = ref(0), w2 = ref(0), b = ref(0), eta = ref(0.5), pasos = ref(0), corriendo = ref(false)
const sig = z => 1 / (1 + Math.exp(-z))
const z = p => w1.value * zh(p.h) + w2.value * za(p.a) + b.value
const m = computed(() => {
  let loss = 0, ok = 0
  for (const p of ALUMNOS) { const q = Math.min(Math.max(sig(z(p)), 1e-9), 1 - 1e-9); loss -= p.y * Math.log(q) + (1 - p.y) * Math.log(1 - q); if ((q >= 0.5) === (p.y === 1)) ok++ }
  return { loss: loss / ALUMNOS.length, acc: ok / ALUMNOS.length, ana: sig(z(ANA)), zAna: z(ANA) }
})
function paso() {
  let g1 = 0, g2 = 0, gb = 0
  for (const p of ALUMNOS) { const e = sig(z(p)) - p.y; g1 += e * zh(p.h); g2 += e * za(p.a); gb += e }
  const n = ALUMNOS.length
  w1.value -= eta.value * g1 / n; w2.value -= eta.value * g2 / n; b.value -= eta.value * gb / n; pasos.value++
}
let timer = null
function entrenar() { if (corriendo.value) return parar(); corriendo.value = true; timer = setInterval(() => { paso(); if (pasos.value >= 400) parar() }, 40) }
function parar() { corriendo.value = false; clearInterval(timer) }
function reiniciar() { parar(); w1.value = 0; w2.value = 0; b.value = 0; pasos.value = 0 }
onUnmounted(parar)

// fondo de probabilidad y frontera p = 0.5
const celdas = computed(() => {
  const out = []
  for (let i = 0; i < 25; i++) for (let j = 0; j < 20; j++) {
    const h = (i + 0.5) * 10 / 25, a = 50 + (j + 0.5) * 50 / 20
    out.push({ h0: i * 10 / 25, a0: 50 + j * 50 / 20, p: sig(w1.value * zh(h) + w2.value * za(a) + b.value) })
  }
  return out
})
const color = p => p >= 0.5 ? `rgba(234,88,12,${(p - 0.5) * 0.7})` : `rgba(37,99,235,${(0.5 - p) * 0.7})`
const linea = computed(() => {
  // w1·zh + w2·za + b = 0 → a = MU_A + SD_A·(−(w1·zh(h) + b)/w2)
  if (Math.abs(w2.value) < 1e-6 && Math.abs(w1.value) < 1e-6) return null
  if (Math.abs(w2.value) < 1e-6) { const h = MU_H + SD_H * (-b.value / w1.value); return [[h, 50], [h, 100]] }
  const A = h => MU_A + SD_A * (-(w1.value * zh(h) + b.value) / w2.value)
  return [[0, A(0)], [10, A(10)]]
})
// curva sigmoide
const SW = 280, SH = 165
const sx = v => 20 + (v + 6) / 12 * (SW - 30), sy = v => SH - 22 - v * (SH - 36)
const curva = Array.from({ length: 61 }, (_, i) => -6 + i * 0.2).map((v, i) => `${i ? 'L' : 'M'}${sx(v).toFixed(1)},${sy(sig(v)).toFixed(1)}`).join('')
const clamp = v => Math.max(-6, Math.min(6, v))
</script>

<template>
  <div class="demo" style="gap:16px">
    <PlanoAlumnos :W="360" :H="280" :ana="ANA" :nombres="false">
      <template #fondo="{ g }">
        <rect v-for="(c, k) in celdas" :key="k" :x="g.px(c.h0)" :y="g.py(c.a0 + 2.5)" :width="g.px(0.4) - g.px(0) + 0.5" :height="g.py(50) - g.py(52.5) + 0.5" :fill="color(c.p)" />
        <svg v-if="linea" :x="g.px(0)" :y="g.py(100)" :width="g.px(10) - g.px(0)" :height="g.py(50) - g.py(100)" overflow="hidden">
          <line :x1="g.px(linea[0][0]) - g.px(0)" :y1="g.py(linea[0][1]) - g.py(100)" :x2="g.px(linea[1][0]) - g.px(0)" :y2="g.py(linea[1][1]) - g.py(100)" stroke="#0f172a" stroke-width="2.5" />
        </svg>
      </template>
    </PlanoAlumnos>
    <div style="display:flex;flex-direction:column;gap:6px">
      <svg :width="SW" :height="SH" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <line :x1="sx(-6)" :x2="sx(6)" :y1="sy(0)" :y2="sy(0)" stroke="#cbd5e1" /><line :x1="sx(0)" :x2="sx(0)" :y1="sy(1)" :y2="sy(0)" stroke="#e2e8f0" />
        <line :x1="sx(-6)" :x2="sx(6)" :y1="sy(0.5)" :y2="sy(0.5)" stroke="#e2e8f0" stroke-dasharray="4 3" />
        <path :d="curva" fill="none" stroke="#7c3aed" stroke-width="2.5" />
        <circle v-for="p in ALUMNOS" :key="p.n" :cx="sx(clamp(z(p)))" :cy="sy(p.y) + (p.y ? 6 : -6)" r="4.5" :fill="p.y ? '#ea580c' : '#2563eb'" opacity="0.85" />
        <circle :cx="sx(clamp(m.zAna))" :cy="sy(m.ana)" r="6" fill="#fff" stroke="#0f172a" stroke-width="2.5" />
        <text x="4" :y="sy(1) + 4" style="font-size:10px" fill="#64748b">1</text><text x="4" :y="sy(0) + 4" style="font-size:10px" fill="#64748b">0</text>
        <text :x="sx(6)" :y="SH - 6" text-anchor="end" style="font-size:10px" fill="#64748b">z = w₁·horas + w₂·asistencia + b →</text>
        <text :x="sx(-6) + 4" y="14" style="font-size:10px" fill="#7c3aed">σ(z) = 1 / (1 + e⁻ᶻ)</text>
      </svg>
      <div class="stats" style="width:260px">
        <span>P(Ana aprueba)</span><b>{{ (m.ana * 100).toFixed(1) }} %</b>
        <span>Pérdida (log-loss)</span><b>{{ m.loss.toFixed(3) }}</b>
        <span>Exactitud</span><b>{{ (m.acc * 100).toFixed(0) }} %</b>
        <span>Pasos de gradiente</span><b>{{ pasos }}</b>
      </div>
    </div>
    <div class="panel" style="min-width:190px;max-width:200px">
      <label>w₁ (horas): <span class="v">{{ w1.toFixed(2) }}</span><input type="range" min="-5" max="5" step="0.05" v-model.number="w1"></label>
      <label>w₂ (asistencia): <span class="v">{{ w2.toFixed(2) }}</span><input type="range" min="-5" max="5" step="0.05" v-model.number="w2"></label>
      <label>b (sesgo): <span class="v">{{ b.toFixed(2) }}</span><input type="range" min="-5" max="5" step="0.05" v-model.number="b"></label>
      <div class="row">
        <button @click="paso">1 paso</button>
        <button @click="entrenar">{{ corriendo ? '⏸' : '▶ Entrenar' }}</button>
        <button @click="reiniciar">↺</button>
      </div>
      <label>Tasa de aprendizaje η: <span class="v">{{ eta }}</span><input type="range" min="0.05" max="3" step="0.05" v-model.number="eta"></label>
      <div class="hint">Mueve los pesos a mano o deja que el descenso por gradiente los encuentre. Las variables están estandarizadas. Datos inventados.</div>
    </div>
  </div>
</template>
