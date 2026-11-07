<script setup>
import { ref, computed } from 'vue'
import { calificaciones, media, cuantil } from '../utils/datos_curso.js'

const CAL = calificaciones()
const W = 460, H = 250, L = 40, R = 12, T = 14, B = 34
const bins = ref(20), kde = ref(false)
const counts = computed(() => { const b = new Array(bins.value).fill(0); CAL.forEach(v => b[Math.min(bins.value - 1, Math.floor(v / 10 * bins.value))]++); return b })
const kdeVals = computed(() => {
  const h = 0.45, n = CAL.length, out = []
  for (let x = 0; x <= 10.001; x += 0.1) {
    let d = 0; for (const v of CAL) d += Math.exp(-0.5 * ((x - v) / h) ** 2)
    out.push([x, d / (n * h * Math.sqrt(2 * Math.PI)) * n * (10 / bins.value)])
  }
  return out
})
const maxc = computed(() => Math.max(...counts.value, ...(kde.value ? kdeVals.value.map(p => p[1]) : [0])))
const sx = v => L + v / 10 * (W - L - R)
const sy = c => H - B - c / (maxc.value * 1.1) * (H - T - B)
const bw = computed(() => 10 / bins.value)
const kdePath = computed(() => kdeVals.value.map(([x, d], i) => `${i ? 'L' : 'M'}${sx(x)},${sy(d)}`).join(''))
const m = media(CAL), med = cuantil(CAL, 0.5)
const msg = computed(() => bins.value <= 4 ? 'Muy pocos bins: los dos grupos se mezclan en uno.' : bins.value >= 60 ? 'Demasiados bins: puro ruido, barras con 0 o 1 alumno.' : 'Buen equilibrio: se ven dos grupos (≈5 y ≈8).')
</script>

<template>
  <div class="demo" style="gap:14px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <rect v-for="(c, i) in counts" :key="i" :x="sx(i * bw)" :y="sy(c)" :width="Math.max(0.5, sx(bw) - L - 1)" :height="H - B - sy(c)" fill="#2563eb" opacity="0.85" />
        <path v-if="kde" :d="kdePath" fill="none" stroke="#ea580c" stroke-width="2.5" />
        <line :x1="sx(m)" :x2="sx(m)" :y1="T" :y2="H - B" stroke="#0f172a" stroke-dasharray="4 3" />
        <text :x="sx(m) + 4" :y="T + 10" style="font-size:10px">media {{ m.toFixed(2) }}</text>
        <line :x1="L" :x2="W - R" :y1="H - B" :y2="H - B" stroke="#334155" />
        <text v-for="t in [0, 2, 4, 6, 8, 10]" :key="t" :x="sx(t)" :y="H - B + 14" text-anchor="middle" style="font-size:10px" fill="#475569">{{ t }}</text>
        <text :x="(L + W) / 2" :y="H - 4" text-anchor="middle" style="font-size:11px">calificación (200 alumnos, datos simulados)</text>
      </svg>
      <div style="font-size:13px;font-weight:600" :style="{ color: bins <= 4 || bins >= 60 ? '#b91c1c' : '#15803d' }">{{ msg }}</div>
    </div>
    <div class="panel" style="width:250px">
      <label style="font-size:13px">bins = <span class="v">{{ bins }}</span></label>
      <input type="range" min="2" max="100" v-model.number="bins" />
      <button :class="{ on: kde }" @click="kde = !kde">{{ kde ? '✓' : '+' }} curva de densidad (kde)</button>
      <div class="stats">media = {{ m.toFixed(2) }} · mediana = {{ med.toFixed(2) }}</div>
      <pre style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:8px 10px;font-size:11px;margin:0;white-space:pre-wrap">plt.hist(df["calificacion"], bins={{ bins }})
# o con seaborn:
sns.histplot(df["calificacion"], bins={{ bins }}{{ kde ? ', kde=True' : '' }})</pre>
      <div class="hint">La media (≈7) cae donde casi no hay alumnos: ¡un solo número no describe esta distribución!</div>
    </div>
  </div>
</template>
