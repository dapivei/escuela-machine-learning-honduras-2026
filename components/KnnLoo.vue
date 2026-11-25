<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ALUMNOS } from '../utils/alumnos.js'
import { looResult } from '../utils/loo.js'

const paso = ref(0), k = ref(3)
const reproduciendo = ref(false)
let timer = null
function alternar() {
  if (timer) { clearInterval(timer); timer = null; reproduciendo.value = false; return }
  if (paso.value >= 13) paso.value = 0
  reproduciendo.value = true
  timer = setInterval(() => {
    if (paso.value >= 13) { clearInterval(timer); timer = null; reproduciendo.value = false; return }
    paso.value++
  }, 1500)
}
onUnmounted(() => { if (timer) clearInterval(timer) })
const r = computed(() => looResult(paso.value, k.value))
const tira = computed(() => ALUMNOS.map((_, j) => (j > paso.value ? null : looResult(j, k.value).ok)))

const S = 340, P = 36, LIM = 3
const clamp = z => Math.max(-LIM, Math.min(LIM, z))
const X = z => P + (clamp(z) + LIM) / (2 * LIM) * (S - 2 * P)
const Y = z => S - P - (clamp(z) + LIM) / (2 * LIM) * (S - 2 * P)
const ejes = [-3, -2, -1, 0, 1, 2, 3]
const color = y => (y ? '#eb6834' : '#2a78d6')
</script>

<template>
  <div class="knn-loo" style="font-size:13px">
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:10px">
      <label>Paso <b>{{ paso + 1 }}</b> de 14
        <input v-model.number="paso" type="range" min="0" max="13" step="1" style="width:170px">
      </label>
      <label>k <b>{{ k }}</b>
        <input v-model.number="k" type="range" min="1" max="13" step="2" style="width:110px">
      </label>
      <button type="button" @click="alternar">{{ reproduciendo ? 'Pausar' : 'Reproducir' }}</button>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
      <svg :width="S" :height="S" :viewBox="`0 0 ${S} ${S}`" role="img" aria-label="Plano escalado con el alumno excluido y sus vecinos">
        <g v-for="v in ejes" :key="'e' + v">
          <line :x1="X(v)" :x2="X(v)" :y1="P" :y2="S - P" stroke="#e1e0d9" stroke-width="0.5" />
          <line :x1="P" :x2="S - P" :y1="Y(v)" :y2="Y(v)" stroke="#e1e0d9" stroke-width="0.5" />
          <text v-if="v !== -3" :x="X(v)" :y="S - P + 14" text-anchor="middle" font-size="10" fill="#898781">{{ v }}</text>
          <text v-if="v !== -3" :x="P - 6" :y="Y(v) + 3" text-anchor="end" font-size="10" fill="#898781">{{ v }}</text>
        </g>
        <text :x="S / 2" :y="S - 6" text-anchor="middle" font-size="11" fill="#52514e">horas (z)</text>
        <text transform="translate(12 170) rotate(-90)" text-anchor="middle" font-size="11" fill="#52514e">asistencia (z)</text>

        <line v-for="v in r.vec" :key="'l' + v.p.n"
          :x1="X(r.zq[0])" :y1="Y(r.zq[1])" :x2="X(v.z[0])" :y2="Y(v.z[1])"
          stroke="#0b0b0b" stroke-width="1.2" stroke-dasharray="4 3" />

        <g v-for="v in r.tr" :key="v.p.n">
          <circle v-if="r.vec.some(w => w.p.n === v.p.n)" :cx="X(v.z[0])" :cy="Y(v.z[1])" r="10" fill="none" stroke="#0b0b0b" stroke-width="1.5" />
          <circle :cx="X(v.z[0])" :cy="Y(v.z[1])" r="5" :fill="color(v.p.y)" />
          <text :x="X(v.z[0]) + 7" :y="Y(v.z[1]) - 6" font-size="9.5" fill="#52514e">{{ v.p.n }}</text>
        </g>

        <circle :cx="X(r.zq[0])" :cy="Y(r.zq[1])" r="8" fill="#ffffff" stroke="#0b0b0b" stroke-width="2" />
        <text :x="X(r.zq[0])" :y="Y(r.zq[1]) + 4" text-anchor="middle" font-size="11" font-weight="500" fill="#0b0b0b">?</text>
        <text :x="X(r.zq[0]) + 10" :y="Y(r.zq[1]) + 4" font-size="10" fill="#0b0b0b">{{ r.q.n }}</text>
      </svg>

      <div style="flex:1;min-width:220px;line-height:1.5">
        <div><b>1.</b> Excluimos a {{ r.q.n }} ({{ r.q.y ? 'aprueba' : 'no aprueba' }}).</div>
        <div><b>2.</b> Escalamos con los otros {{ r.tr.length }}.</div>
        <div><b>3.</b> Vecinos ({{ k }}): {{ r.vec.map(v => v.p.n).join(', ') }}. Votan: <b>{{ r.pred ? 'aprueba' : 'no aprueba' }}</b>.</div>
        <div><b>4.</b> <b>{{ r.ok ? 'Acierta ✓' : 'Falla ✗' }}</b>. Registramos y seguimos.</div>
      </div>
    </div>

    <div style="display:flex;gap:4px;margin-top:10px;flex-wrap:wrap">
      <span v-for="(ok, j) in tira" :key="j" :title="ALUMNOS[j].n"
        style="width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px"
        :style="ok === null ? 'background:#f1efe8;color:#898781' : ok ? 'background:#eaf3de;color:#27500a;font-weight:500' : 'background:#fcebeb;color:#791f1f;font-weight:500'">
        {{ ok === null ? j + 1 : ok ? '✓' : '✗' }}
      </span>
    </div>
  </div>
</template>
