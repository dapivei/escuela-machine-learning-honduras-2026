<script setup>
import { ref, computed } from 'vue'
import PlanoAlumnos from './PlanoAlumnos.vue'
import { ALUMNOS, ANA, zh, za, MU_H, SD_H, MU_A, SD_A } from '../utils/alumnos.js'

// Geometría en variables estandarizadas: w = (cos θ, sin θ), recta w·x + b = 0
const theta = ref(20), b = ref(0), conLucia = ref(false)
const datos = computed(() => ALUMNOS.filter(p => conLucia.value || p.n !== 'Lucía'))
const yv = p => (p.y ? 1 : -1)
const proj = (p, th) => Math.cos(th * Math.PI / 180) * zh(p.h) + Math.sin(th * Math.PI / 180) * za(p.a)
const res = computed(() => {
  const d = datos.value.map(p => ({ p, d: yv(p) * (proj(p, theta.value) + b.value) }))
  const m = Math.min(...d.map(x => x.d))
  return { margen: m, errores: d.filter(x => x.d < 0).length, soporte: d.filter(x => x.d <= m + 0.02).map(x => x.p.n), ana: proj(ANA, theta.value) + b.value }
})
function mejor() {
  let best = null
  for (let th = 0; th < 360; th += 0.5) {
    const pos = datos.value.filter(p => p.y).map(p => proj(p, th)), neg = datos.value.filter(p => !p.y).map(p => proj(p, th))
    const m = (Math.min(...pos) - Math.max(...neg)) / 2
    if (!best || m > best.m) best = { th, m, b: -(Math.min(...pos) + Math.max(...neg)) / 2 }
  }
  theta.value = best.th; b.value = Math.round(best.b * 1000) / 1000
}
// Recta w·z + b = c en coordenadas reales, recortada al plano
function recta(c, g) {
  const t = theta.value * Math.PI / 180, w1 = Math.cos(t), w2 = Math.sin(t)
  const pts = []
  if (Math.abs(w2) > 1e-6) for (const h of [0, 10]) pts.push([h, MU_A + SD_A * ((c - b.value - w1 * zh(h)) / w2)])
  else { const h = MU_H + SD_H * ((c - b.value) / w1); pts.push([h, 50], [h, 100]) }
  return { x1: g.px(pts[0][0]) - g.px(0), y1: g.py(pts[0][1]) - g.py(100), x2: g.px(pts[1][0]) - g.px(0), y2: g.py(pts[1][1]) - g.py(100) }
}
</script>

<template>
  <div class="demo" style="gap:18px">
    <PlanoAlumnos :W="400" :H="300" :puntos="datos" :ana="ANA" :anillo="p => res.margen > 0 && res.soporte.includes(p.n)">
      <template #fondo="{ g }">
        <svg :x="g.px(0)" :y="g.py(100)" :width="g.px(10) - g.px(0)" :height="g.py(50) - g.py(100)" overflow="hidden">
          <template v-if="res.margen > 0">
            <line v-bind="recta(res.margen, g)" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="6 4" />
            <line v-bind="recta(-res.margen, g)" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="6 4" />
          </template>
          <line v-bind="recta(0, g)" stroke="#0f172a" stroke-width="3" />
        </svg>
      </template>
    </PlanoAlumnos>
    <div class="panel" style="min-width:260px;max-width:270px">
      <label>Inclinación de la recta: <span class="v">{{ theta }}°</span><input type="range" min="0" max="359.5" step="0.5" v-model.number="theta"></label>
      <label>Posición: <span class="v">{{ b.toFixed(2) }}</span><input type="range" min="-2.5" max="2.5" step="0.01" v-model.number="b"></label>
      <button @click="mejor">🔍 Buscar la calle más ancha (SVM)</button>
      <button :class="{ on: conLucia }" @click="conLucia = !conLucia">{{ conLucia ? 'Con Lucía (excepción) ✓' : 'Agregar a Lucía (excepción)' }}</button>
      <div class="stats">
        <span>Mal clasificados</span><b :style="{ color: res.errores ? '#b91c1c' : '' }">{{ res.errores }}</b>
        <span>Ancho de la calle</span><b>{{ res.margen > 0 ? (2 * res.margen).toFixed(3) : '—' }}</b>
        <span>Ana</span><b :style="{ color: res.ana >= 0 ? '#ea580c' : '#2563eb' }">{{ res.ana >= 0 ? 'aprueba' : 'no aprueba' }}</b>
      </div>
      <div v-if="res.margen > 0" class="hint">Vectores de soporte (con anillo): <b>{{ res.soporte.join(', ') }}</b>. Solo ellos definen la calle.</div>
      <div v-else-if="conLucia" class="hint" style="color:#b91c1c">Con Lucía no existe una recta sin errores. La SVM de <b>margen suave</b> acepta algunos errores; el parámetro C decide cuántos.</div>
      <div v-else class="hint">Mueve la recta hasta que no haya errores y la calle sea lo más ancha posible.</div>
      <div class="hint">Distancias medidas con variables escaladas. Datos inventados.</div>
    </div>
  </div>
</template>
