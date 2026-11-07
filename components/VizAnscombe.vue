<script setup>
import { ref, computed } from 'vue'

// Cuarteto de Anscombe (1973)
const X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
const D = [
  { x: X, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68] },
  { x: X, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74] },
  { x: X, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73] },
  { x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89] },
]
const m = a => a.reduce((s, v) => s + v, 0) / a.length
const vr = a => { const k = m(a); return a.reduce((s, v) => s + (v - k) ** 2, 0) / (a.length - 1) }
const stats = D.map(d => {
  const mx = m(d.x), my = m(d.y), sxy = d.x.reduce((s, x, i) => s + (x - mx) * (d.y[i] - my), 0) / (d.x.length - 1)
  const b1 = sxy / vr(d.x)
  return { mx, my, vx: vr(d.x), vy: vr(d.y), r: sxy / Math.sqrt(vr(d.x) * vr(d.y)), b0: my - b1 * mx, b1 }
})
const ver = ref(false)
const W = 200, H = 150, sx = x => 22 + (x - 2) / 18 * (W - 30), sy = y => H - 18 - (y - 2) / 12 * (H - 28)
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:10px">
    <div style="display:grid;grid-template-columns:150px repeat(4, 110px);font-size:13px;font-family:ui-monospace,monospace;background:#f8fafc;border-radius:8px;padding:6px 10px;gap:2px">
      <span></span><b v-for="k in 4" :key="k" style="text-align:right">Datos {{ ['I', 'II', 'III', 'IV'][k - 1] }}</b>
      <span>media de x</span><span v-for="(s, k) in stats" :key="'a' + k" style="text-align:right">{{ s.mx.toFixed(2) }}</span>
      <span>media de y</span><span v-for="(s, k) in stats" :key="'b' + k" style="text-align:right">{{ s.my.toFixed(2) }}</span>
      <span>varianza de y</span><span v-for="(s, k) in stats" :key="'c' + k" style="text-align:right">{{ s.vy.toFixed(2) }}</span>
      <span>correlación</span><span v-for="(s, k) in stats" :key="'d' + k" style="text-align:right">{{ s.r.toFixed(3) }}</span>
      <span>recta</span><span v-for="(s, k) in stats" :key="'e' + k" style="text-align:right">y = {{ s.b0.toFixed(2) }} + {{ s.b1.toFixed(2) }}x</span>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      <button @click="ver = !ver" :class="{ on: ver }">{{ ver ? 'Ocultar gráficas' : '👀 Graficar los cuatro conjuntos' }}</button>
      <span class="hint">Las cuatro columnas tienen casi exactamente las mismas estadísticas. ¿Se verán iguales?</span>
    </div>
    <div style="display:flex;gap:8px;min-height:150px">
      <svg v-for="(d, k) in D" :key="k" :width="W" :height="H" :style="{ opacity: ver ? 1 : 0.06 }" style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;transition:opacity .6s">
        <line :x1="sx(2)" :x2="sx(20)" :y1="sy(stats[k].b0 + stats[k].b1 * 2)" :y2="sy(stats[k].b0 + stats[k].b1 * 20)" stroke="#94a3b8" stroke-width="1.5" />
        <circle v-for="(x, i) in d.x" :key="i" :cx="sx(x)" :cy="sy(d.y[i])" r="4" fill="#ea580c" />
        <text x="8" y="14" style="font-size:11px;font-weight:700" fill="#334155">{{ ['I', 'II', 'III', 'IV'][k] }}</text>
      </svg>
    </div>
  </div>
</template>
