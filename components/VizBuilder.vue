<script setup>
import { reactive, computed } from 'vue'
import { SEMANAS, PROM_A, PROM_B } from '../utils/datos_curso.js'

const W = 400, H = 280
const AZ = '#2563eb', NA = '#ea580c'
const op = reactive({ b: false, title: false, xlabel: false, ylabel: false, legend: false, marker: false, grid: false, ylim: false, spines: false })
const PASOS = [
  ['b', 'Agregar grupo B', 'plt.plot(semanas, prom_B, label="Grupo B")'],
  ['marker', 'Marcadores', '# marker="o" en cada plt.plot'],
  ['title', 'Título', 'plt.title("Promedio semanal por grupo")'],
  ['xlabel', 'Etiqueta eje x', 'plt.xlabel("Semana")'],
  ['ylabel', 'Etiqueta eje y', 'plt.ylabel("Calificación promedio")'],
  ['legend', 'Leyenda', 'plt.legend()'],
  ['grid', 'Cuadrícula', 'plt.grid(alpha=0.3)'],
  ['ylim', 'Eje y desde 0', 'plt.ylim(0, 10)'],
  ['spines', 'Quitar bordes', 'ax.spines[["top", "right"]].set_visible(False)'],
]
const L = computed(() => (op.ylabel ? 62 : 46)), R = 14
const T = computed(() => (op.title ? 34 : 14)), B = computed(() => (op.xlabel ? 44 : 28))
const y0 = computed(() => (op.ylim ? 0 : 5.6)), y1 = computed(() => (op.ylim ? 10 : 8.0))
const ticks = computed(() => (op.ylim ? [0, 2, 4, 6, 8, 10] : [5.75, 6.25, 6.75, 7.25, 7.75]))
const sx = s => L.value + (s - 0.6) / (8.4 - 0.6) * (W - L.value - R)
const sy = v => H - B.value - (v - y0.value) / (y1.value - y0.value) * (H - T.value - B.value)
const path = ys => ys.map((y, i) => `${i ? 'L' : 'M'}${sx(i + 1)},${sy(y)}`).join('')
const code = computed(() => {
  const m = op.marker ? ', marker="o"' : ''
  const out = ['import matplotlib.pyplot as plt', '', 'fig, ax = plt.subplots()', `plt.plot(semanas, prom_A${m}${op.b || op.legend ? ', label="Grupo A"' : ''})`]
  if (op.b) out.push(`plt.plot(semanas, prom_B${m}, label="Grupo B")`)
  for (const [k, , c] of PASOS.slice(2)) if (op[k]) out.push(c)
  out.push('plt.show()')
  return out.join('\n')
})
const n = computed(() => Object.values(op).filter(Boolean).length)
</script>

<template>
  <div class="demo" style="gap:14px">
    <div class="panel" style="width:230px">
      <b style="font-size:13px">Agrega una línea de código:</b>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <button v-for="[k, lab] in PASOS" :key="k" :class="{ on: op[k] }" @click="op[k] = !op[k]" style="font-size:11.5px;text-align:left;padding:3px 6px">{{ op[k] ? '✓ ' : '+ ' }}{{ lab }}</button>
      </div>
      <div class="row" style="margin-top:4px">
        <button @click="Object.keys(op).forEach(k => op[k] = true)">Todo</button>
        <button @click="Object.keys(op).forEach(k => op[k] = false)">Nada</button>
      </div>
      <div class="hint">{{ n }}/9 mejoras</div>
    </div>
    <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
      <text v-if="op.title" :x="(L + W - R) / 2" y="22" text-anchor="middle" style="font-size:14px;font-weight:600">Promedio semanal por grupo</text>
      <template v-if="op.grid"><line v-for="v in ticks" :key="'g' + v" :x1="L" :x2="W - R" :y1="sy(v)" :y2="sy(v)" stroke="#e2e8f0" /></template>
      <line :x1="L" :x2="L" :y1="T" :y2="H - B" stroke="#334155" />
      <line :x1="L" :x2="W - R" :y1="H - B" :y2="H - B" stroke="#334155" />
      <template v-if="!op.spines">
        <line :x1="W - R" :x2="W - R" :y1="T" :y2="H - B" stroke="#334155" />
        <line :x1="L" :x2="W - R" :y1="T" :y2="T" stroke="#334155" />
      </template>
      <text v-for="v in ticks" :key="'t' + v" :x="L - 5" :y="sy(v) + 4" text-anchor="end" style="font-size:10px" fill="#475569">{{ v }}</text>
      <text v-for="s in SEMANAS" :key="'s' + s" :x="sx(s)" :y="H - B + 14" text-anchor="middle" style="font-size:10px" fill="#475569">{{ s }}</text>
      <text v-if="op.xlabel" :x="(L + W - R) / 2" :y="H - 8" text-anchor="middle" style="font-size:12px">Semana</text>
      <text v-if="op.ylabel" :x="14" :y="(T + H - B) / 2" text-anchor="middle" :transform="`rotate(-90 14 ${(T + H - B) / 2})`" style="font-size:12px">Calificación promedio</text>
      <path :d="path(PROM_A)" fill="none" :stroke="AZ" stroke-width="2.2" />
      <path v-if="op.b" :d="path(PROM_B)" fill="none" :stroke="NA" stroke-width="2.2" />
      <template v-if="op.marker">
        <circle v-for="(y, i) in PROM_A" :key="'a' + i" :cx="sx(i + 1)" :cy="sy(y)" r="3.5" :fill="AZ" />
        <template v-if="op.b"><circle v-for="(y, i) in PROM_B" :key="'b' + i" :cx="sx(i + 1)" :cy="sy(y)" r="3.5" :fill="NA" /></template>
      </template>
      <g v-if="op.legend" :transform="`translate(${L + 10},${T + 6})`">
        <rect width="92" :height="op.b ? 38 : 22" fill="#fff" stroke="#cbd5e1" rx="3" />
        <line x1="6" x2="22" y1="11" y2="11" :stroke="AZ" stroke-width="2.5" /><text x="27" y="15" style="font-size:11px">Grupo A</text>
        <template v-if="op.b"><line x1="6" x2="22" y1="27" y2="27" :stroke="NA" stroke-width="2.5" /><text x="27" y="31" style="font-size:11px">Grupo B</text></template>
      </g>
    </svg>
    <pre style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:8px 10px;font-size:11px;margin:0;width:260px;white-space:pre-wrap">{{ code }}</pre>
  </div>
</template>
