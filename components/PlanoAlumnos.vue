<script setup>
import { computed } from 'vue'
import { ALUMNOS, plano, planoEsc, zh, za, MU_H, SD_H, MU_A, SD_A, AZUL, NARANJA } from '../utils/alumnos.js'

const props = defineProps({
  W: { type: Number, default: 400 }, H: { type: Number, default: 300 },
  puntos: { type: Array, default: () => ALUMNOS },
  ana: { type: Object, default: null },
  anillo: { type: Function, default: () => false },
  nombres: { type: Boolean, default: true },
  atenuar: { type: Function, default: () => false },
  escalado: { type: Boolean, default: false },
})
const emit = defineEmits(['clic'])
const g = computed(() => props.escalado ? planoEsc(props.W, props.H) : plano(props.W, props.H))
// Marcas de los ejes: en unidades originales, o en z (desviaciones estándar) si está escalado.
const ticks = computed(() => {
  if (!props.escalado) return {
    h: [0, 2, 4, 6, 8, 10].map(v => ({ v, t: String(v) })),
    a: [50, 60, 70, 80, 90, 100].map(v => ({ v, t: String(v) })),
  }
  const enteros = (lo, hi) => { const out = []; for (let z = Math.ceil(lo); z <= Math.floor(hi); z++) out.push(z); return out }
  return {
    h: enteros(zh(0), zh(10)).map(z => ({ v: MU_H + z * SD_H, t: String(z) })),
    a: enteros(za(50), za(100)).map(z => ({ v: MU_A + z * SD_A, t: String(z) })),
  }
})
function clic(e) {
  const r = e.currentTarget.getBoundingClientRect(), s = props.W / r.width
  const h = g.value.ih((e.clientX - r.left) * s), a = g.value.ia((e.clientY - r.top) * s)
  if (h >= 0 && h <= 10 && a >= 50 && a <= 100) emit('clic', { h: Math.round(h * 2) / 2, a: Math.round(a) })
}
</script>

<template>
  <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;flex-shrink:0" @click="clic">
    <g style="font-size:10px" fill="#94a3b8">
      <template v-for="h in ticks.h" :key="'h' + h.t">
        <line :x1="g.px(h.v)" :x2="g.px(h.v)" :y1="g.py(50)" :y2="g.py(100)" stroke="#f1f5f9" />
        <text :x="g.px(h.v)" :y="H - 14" text-anchor="middle">{{ h.t }}</text>
      </template>
      <template v-for="a in ticks.a" :key="'a' + a.t">
        <line :x1="g.px(0)" :x2="g.px(10)" :y1="g.py(a.v)" :y2="g.py(a.v)" stroke="#f1f5f9" />
        <text :x="g.P - 6" :y="g.py(a.v) + 3" text-anchor="end">{{ a.t }}</text>
      </template>
      <text :x="(g.px(0) + g.px(10)) / 2" :y="H - 2" text-anchor="middle" fill="#64748b">{{ escalado ? 'horas (z)' : 'horas de estudio por semana' }}</text>
      <text x="9" :y="H / 2 - 10" text-anchor="middle" fill="#64748b" :transform="`rotate(-90 9 ${H / 2 - 10})`">{{ escalado ? 'asistencia (z)' : 'asistencia (%)' }}</text>
    </g>
    <slot name="fondo" :g="g" />
    <g v-for="p in puntos" :key="p.n" :opacity="atenuar(p) ? 0.3 : 1">
      <circle v-if="anillo(p)" :cx="g.px(p.h)" :cy="g.py(p.a)" r="12" fill="none" stroke="#0f172a" stroke-width="2" />
      <circle :cx="g.px(p.h)" :cy="g.py(p.a)" r="6.5" :fill="p.y ? NARANJA : AZUL" stroke="#fff" stroke-width="1.5" />
      <text v-if="nombres" :x="g.px(p.h) + 8" :y="g.py(p.a) - 6" style="font-size:9.5px" fill="#334155">{{ p.n }}</text>
    </g>
    <g v-if="ana">
      <circle :cx="g.px(ana.h)" :cy="g.py(ana.a)" r="8" fill="#fff" stroke="#0f172a" stroke-width="2.5" />
      <text :x="g.px(ana.h) - 3.5" :y="g.py(ana.a) + 4" style="font-size:11px;font-weight:700">?</text>
      <text :x="g.px(ana.h) + 10" :y="g.py(ana.a) + 4" style="font-size:11px;font-weight:700">{{ ana.n || 'Ana' }}</text>
    </g>
    <slot :g="g" />
  </svg>
</template>
