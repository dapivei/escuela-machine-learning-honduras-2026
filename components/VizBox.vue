<script setup>
import { ref, computed } from 'vue'
import { DF, cuantil, media } from '../utils/datos_curso.js'

const base = DF.filter(r => r.grupo === 'A').map(r => ({ n: r.nombre, v: r.calificacion }))
const extra = ref(9.1) // Marta, se puede mover
const W = 640, H = 230, L = 30, R = 20
const datos = computed(() => base.map(d => (d.n === 'Marta' ? { ...d, v: extra.value } : d)))
const xs = computed(() => datos.value.map(d => d.v))
const S = computed(() => {
  const q1 = cuantil(xs.value, 0.25), q2 = cuantil(xs.value, 0.5), q3 = cuantil(xs.value, 0.75), iqr = q3 - q1
  const lf = q1 - 1.5 * iqr, uf = q3 + 1.5 * iqr
  const dentro = xs.value.filter(v => v >= lf && v <= uf)
  return { q1, q2, q3, iqr, lf, uf, lo: Math.min(...dentro), hi: Math.max(...dentro), m: media(xs.value) }
})
const sx = v => L + v / 20 * (W - L - R)
const yb = 110
const atipico = d => d.v < S.value.lf || d.v > S.value.uf
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:8px">
    <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
      <line :x1="sx(S.lo)" :x2="sx(S.q1)" :y1="yb" :y2="yb" stroke="#334155" stroke-width="1.5" />
      <line :x1="sx(S.q3)" :x2="sx(S.hi)" :y1="yb" :y2="yb" stroke="#334155" stroke-width="1.5" />
      <line :x1="sx(S.lo)" :x2="sx(S.lo)" :y1="yb - 12" :y2="yb + 12" stroke="#334155" stroke-width="1.5" />
      <line :x1="sx(S.hi)" :x2="sx(S.hi)" :y1="yb - 12" :y2="yb + 12" stroke="#334155" stroke-width="1.5" />
      <rect :x="sx(S.q1)" :y="yb - 25" :width="sx(S.q3) - sx(S.q1)" height="50" fill="#dbeafe" stroke="#1e3a8a" stroke-width="1.5" />
      <line :x1="sx(S.q2)" :x2="sx(S.q2)" :y1="yb - 25" :y2="yb + 25" stroke="#0f172a" stroke-width="3" />
      <path :d="`M${sx(S.m)},${yb + 32} l-6,10 h12 z`" fill="#ea580c" />
      <circle v-for="d in datos" :key="d.n" :cx="sx(d.v)" :cy="yb + 60 + (base.findIndex(b => b.n === d.n) % 3) * 9" r="4.5" :fill="atipico(d) ? '#dc2626' : (d.n === 'Marta' ? '#7c3aed' : '#64748b')" />
      <circle v-for="d in datos.filter(atipico)" :key="'o' + d.n" :cx="sx(d.v)" :cy="yb" r="5" fill="none" stroke="#dc2626" stroke-width="2" />
      <text :x="sx(S.q1)" :y="yb - 32" text-anchor="middle" style="font-size:11px">Q1 {{ S.q1.toFixed(1) }}</text>
      <text :x="sx(S.q2)" :y="yb - 44" text-anchor="middle" style="font-size:11px;font-weight:700">mediana {{ S.q2.toFixed(1) }}</text>
      <text :x="sx(S.q3)" :y="yb - 32" text-anchor="middle" style="font-size:11px">Q3 {{ S.q3.toFixed(1) }}</text>
      <line :x1="L" :x2="W - R" :y1="H - 26" :y2="H - 26" stroke="#94a3b8" />
      <text v-for="t in [0, 5, 10, 15, 20]" :key="t" :x="sx(t)" :y="H - 12" text-anchor="middle" style="font-size:10px" fill="#475569">{{ t }}</text>
      <text :x="W - R" :y="18" text-anchor="end" style="font-size:11px" fill="#ea580c">▲ media {{ S.m.toFixed(2) }}</text>
    </svg>
    <div class="row" style="gap:14px;align-items:center;font-size:13px">
      <span style="color:#7c3aed;font-weight:600">Mueve la nota de Marta:</span>
      <input type="range" min="0" max="20" step="0.1" v-model.number="extra" style="width:200px" />
      <span class="v">{{ extra.toFixed(1) }}</span>
      <span>IQR = Q3 − Q1 = <b>{{ S.iqr.toFixed(2) }}</b></span>
    </div>
    <div class="hint">Grupo A (7 alumnos). Lleva a Marta a 20 (¡error de captura!): la <b>media</b> se mueve mucho, la <b>mediana</b> casi nada, y Marta aparece como <b style="color:#dc2626">atípica</b> (más allá de Q3 + 1.5·IQR = {{ S.uf.toFixed(1) }}).</div>
  </div>
</template>
