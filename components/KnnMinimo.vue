<script setup>
import { erroresPorK, KS } from '../utils/loo.js'

const { errs, mn, tied, best } = erroresPorK()
const W = 520, H = 220, P = { l: 44, r: 16, t: 14, b: 36 }
const bw = (W - P.l - P.r) / KS.length
const yPct = e => P.t + (1 - e) * (H - P.t - P.b)
const ejes = [0, 0.2, 0.4, 0.6, 0.8, 1]
</script>

<template>
  <div class="knn-minimo" style="font-size:14px">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" role="img" aria-label="Error de validación por k">
      <g v-for="e in ejes" :key="e">
        <line :x1="P.l" :x2="W - P.r" :y1="yPct(e)" :y2="yPct(e)" stroke="#e1e0d9" stroke-width="0.5" />
        <text :x="P.l - 6" :y="yPct(e) + 4" text-anchor="end" font-size="11" fill="#898781">{{ Math.round(e * 100) }}%</text>
      </g>
      <g v-for="(k, j) in KS" :key="k">
        <rect :x="P.l + j * bw + bw * 0.2" :y="H - P.b - errs[j] * (H - P.t - P.b)"
          :width="bw * 0.6" :height="errs[j] * (H - P.t - P.b)" rx="3"
          :fill="k === best ? '#eb6834' : '#2a78d6'" />
        <text :x="P.l + j * bw + bw * 0.5" :y="H - P.b - errs[j] * (H - P.t - P.b) - 5" text-anchor="middle" font-size="11" fill="#0b0b0b">{{ Math.round(errs[j] * 100) }}%</text>
        <text :x="P.l + j * bw + bw * 0.5" :y="H - P.b + 16" text-anchor="middle" font-size="12" fill="#52514e">k={{ k }}</text>
      </g>
    </svg>
    <div style="margin-top:6px">
      Mínimo: {{ Math.round(mn * 100) }}% en k {{ tied.length > 1 ? '= ' + tied.join(' y ') + ' (empate)' : '= ' + tied[0] }}.
      Se escoge <b>k = {{ best }}</b>{{ tied.length > 1 ? ' por la regla de desempate (el más grande)' : '' }}.
    </div>
  </div>
</template>
