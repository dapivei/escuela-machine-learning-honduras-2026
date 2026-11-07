<script setup>
import { ref, computed } from 'vue'

const A = 7.5, B = 7.8 // promedio grupo A y B (inventado)
const y0 = ref(0), ancho = ref(1), tresd = ref(false)
const W = 420, H = 260, L = 46, T = 16, Bm = 30
const pw = computed(() => 140 + ancho.value * 140)
const sy = v => H - Bm - (v - y0.value) / (10 - y0.value) * (H - T - Bm)
const hA = computed(() => H - Bm - sy(A)), hB = computed(() => H - Bm - sy(B))
const real = (B - A) / A
const visto = computed(() => (hB.value - hA.value) / hA.value)
const lie = computed(() => visto.value / real)
const ticks = computed(() => { const out = []; const step = (10 - y0.value) / 4; for (let i = 0; i <= 4; i++) out.push(+(y0.value + i * step).toFixed(2)); return out })
const bx = i => L + 30 + i * (pw.value - L - 40) / 2
const bw = computed(() => (pw.value - L - 60) / 2.6)
</script>

<template>
  <div class="demo" style="gap:16px">
    <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
      <line :x1="L" :x2="L" :y1="T" :y2="H - Bm" stroke="#334155" />
      <line :x1="L" :x2="pw" :y1="H - Bm" :y2="H - Bm" stroke="#334155" />
      <text v-for="t in ticks" :key="t" :x="L - 5" :y="sy(t) + 4" text-anchor="end" style="font-size:10px" fill="#475569">{{ t }}</text>
      <g v-for="(v, i) in [A, B]" :key="i">
        <template v-if="tresd">
          <path :d="`M${bx(i)},${sy(v)} l12,-10 h${bw} l-12,10 z`" :fill="i ? '#fdba74' : '#93c5fd'" />
          <path :d="`M${bx(i) + bw},${sy(v)} l12,-10 V${H - Bm - 10} l-12,10 z`" :fill="i ? '#c2410c' : '#1e40af'" />
        </template>
        <rect :x="bx(i)" :y="sy(v)" :width="bw" :height="H - Bm - sy(v)" :fill="i ? '#ea580c' : '#2563eb'" />
        <text :x="bx(i) + bw / 2" :y="sy(v) - (tresd ? 14 : 4)" text-anchor="middle" style="font-size:12px;font-weight:600">{{ v }}</text>
        <text :x="bx(i) + bw / 2" :y="H - 12" text-anchor="middle" style="font-size:11px">Grupo {{ i ? 'B' : 'A' }}</text>
      </g>
      <text v-if="y0 > 0" :x="pw" :y="T + 4" text-anchor="end" style="font-size:11px" fill="#dc2626">⚠ el eje empieza en {{ y0 }}</text>
    </svg>
    <div class="panel" style="width:260px">
      <label style="font-size:13px">El eje y empieza en <span class="v">{{ y0 }}</span></label>
      <input type="range" min="0" max="7.4" step="0.1" v-model.number="y0" />
      <label style="font-size:13px">Ancho de la gráfica</label>
      <input type="range" min="0" max="1" step="0.05" v-model.number="ancho" />
      <button :class="{ on: tresd }" @click="tresd = !tresd">{{ tresd ? '✓' : '+' }} efecto 3D</button>
      <div style="font-size:13px;line-height:1.6;background:#f8fafc;border-radius:8px;padding:8px 10px">
        Diferencia real: <b>{{ (real * 100).toFixed(1) }}%</b><br />
        Diferencia que se ve: <b>{{ (visto * 100).toFixed(0) }}%</b><br />
        <span :style="{ color: lie > 1.5 ? '#dc2626' : '#15803d' }">Factor de mentira (Tufte) = <b>{{ lie.toFixed(1) }}</b></span>
      </div>
      <div class="hint">En barras, el eje debe empezar en 0. Factor ≈ 1 es honesto; Tufte considera engañoso &gt; 1.05.</div>
    </div>
  </div>
</template>
