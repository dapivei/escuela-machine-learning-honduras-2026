<script setup>
import { erroresPorK, KS } from '../utils/loo.js'

const { errs, mn, tied, best } = erroresPorK()
const W = 500, H = 240, P = { l: 66, r: 16, t: 14, b: 56 }
const bw = (W - P.l - P.r) / KS.length
const yPct = e => P.t + (1 - e) * (H - P.t - P.b)
const ejes = [0, 0.2, 0.4, 0.6, 0.8, 1]
const altoBarra = e => e * (H - P.t - P.b)
</script>

<template>
  <div class="knn-minimo" style="font-size:13px">
    <div style="font-weight:500;font-size:15px;margin-bottom:6px">Error de validación por k (LOO)</div>

    <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
      <div style="flex:0 0 auto">
        <svg :viewBox="`0 0 ${W} ${H}`" :style="`width:${W}px;height:${H}px;max-width:none`" role="img" aria-label="Gráfica de barras con el error de validación por cada valor de k">
          <g v-for="e in ejes" :key="e">
            <line :x1="P.l" :x2="W - P.r" :y1="yPct(e)" :y2="yPct(e)" stroke="#e1e0d9" stroke-width="0.5" />
            <text :x="P.l - 6" :y="yPct(e) + 4" text-anchor="end" style="font-size:10px" fill="#898781">{{ Math.round(e * 100) }}%</text>
          </g>
          <g v-for="(k, j) in KS" :key="k">
            <rect :x="P.l + j * bw + bw * 0.2" :y="H - P.b - altoBarra(errs[j])"
              :width="bw * 0.6" :height="altoBarra(errs[j])" rx="3"
              :fill="k === best ? '#eb6834' : '#2a78d6'" />
            <text :x="P.l + j * bw + bw * 0.5" :y="H - P.b - altoBarra(errs[j]) - 5" text-anchor="middle" style="font-size:10px" fill="#0b0b0b">{{ Math.round(errs[j] * 100) }}%</text>
            <text :x="P.l + j * bw + bw * 0.5" :y="H - P.b + 15" text-anchor="middle" style="font-size:11px" fill="#52514e">{{ k }}</text>
          </g>
          <text :x="(P.l + W - P.r) / 2" :y="H - 10" text-anchor="middle" style="font-size:12px" fill="#52514e">k (número de vecinos)</text>
          <text :transform="`translate(16 ${(P.t + H - P.b) / 2}) rotate(-90)`" text-anchor="middle" style="font-size:12px" fill="#52514e">Error de validación (%)</text>
        </svg>
        <div style="margin-top:6px;line-height:1.5">
          Mínimo: <b>{{ Math.round(mn * 100) }}%</b> en k = {{ tied.join(' y ') }}.
          <span v-if="tied.length > 1">Empate: se escoge el más grande, <b>k = {{ best }}</b>.</span>
          <span v-else>Se escoge <b>k = {{ best }}</b>.</span>
        </div>
      </div>

      <div style="flex:1;min-width:260px;line-height:1.5;border:0.5px solid #e1e0d9;border-radius:8px;padding:10px 14px">
        <div style="font-weight:500;margin-bottom:6px">Cómo se calcula cada barra</div>
        <div style="margin-bottom:6px"><b>1. Validación:</b> un alumno, por ejemplo Luis.</div>
        <div style="margin-bottom:6px"><b>2. Entrenamiento:</b> los otros 13. Con ellos calculamos medias y desviaciones, escalamos y buscamos los k vecinos de Luis.</div>
        <div style="margin-bottom:6px"><b>3. Predicción:</b> votan los vecinos. Si la mayoría coincide con la etiqueta real de Luis, ✓; si no, ✗.</div>
        <div style="margin-bottom:6px"><b>4. Repetir:</b> ahora Pedro es la validación y Luis vuelve a entrenar. Así hasta los 14 alumnos.</div>
        <div style="margin-bottom:10px"><b>5. Barra:</b> la cantidad de ✗ entre 14.</div>
        <div style="border-top:0.5px solid #e1e0d9;padding-top:8px"><b>k es un hiperparámetro:</b> lo fijamos antes de entrenar. Probamos varios valores y escogemos el de menor error.</div>
      </div>
    </div>
  </div>
</template>
