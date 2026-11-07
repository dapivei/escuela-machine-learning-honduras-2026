<script setup>
import { ref, computed } from 'vue'
import PlanoAlumnos from './PlanoAlumnos.vue'
import { ALUMNOS, ANA, SD_H, SD_A } from '../utils/alumnos.js'

const ana = ref({ ...ANA }), k = ref(3), escalar = ref(false)
const filas = computed(() => ALUMNOS.map(p => {
  const dh = p.h - ana.value.h, da = p.a - ana.value.a
  const d = escalar.value ? Math.hypot(dh / SD_H, da / SD_A) : Math.hypot(dh, da)
  return { ...p, dh, da, d }
}).sort((a, b) => a.d - b.d))
const vecinos = computed(() => filas.value.slice(0, k.value))
const votos = computed(() => ({ si: vecinos.value.filter(v => v.y).length, no: vecinos.value.filter(v => !v.y).length }))
const esVecino = p => vecinos.value.some(v => v.n === p.n)
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:4px">
      <PlanoAlumnos :W="390" :H="300" :ana="ana" :anillo="esVecino" @clic="ana = { n: 'Ana', ...$event }">
        <template #fondo="{ g }">
          <line v-for="v in vecinos" :key="v.n" :x1="g.px(ana.h)" :y1="g.py(ana.a)" :x2="g.px(v.h)" :y2="g.py(v.a)" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="4 3" />
        </template>
      </PlanoAlumnos>
      <div class="hint">Haz clic en el plano para mover a Ana ({{ ana.h }} h, {{ ana.a }} %).</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:2px;width:250px;font-size:11.5px">
      <div style="display:grid;grid-template-columns:62px 42px 46px 54px 22px;color:#64748b;font-weight:600">
        <span>alumno</span><span>Δ horas</span><span>Δ asist.</span><span>distancia</span><span></span>
      </div>
      <div v-for="(f, i) in filas" :key="f.n" :style="{ background: i < k ? '#fff7ed' : 'transparent', fontWeight: i < k ? 700 : 400 }" style="display:grid;grid-template-columns:62px 42px 46px 54px 22px;font-family:ui-monospace,monospace;border-radius:4px">
        <span style="font-family:inherit">{{ f.n }}</span><span>{{ f.dh }}</span><span>{{ f.da }}</span><span>{{ f.d.toFixed(2) }}</span>
        <span :style="{ color: f.y ? '#ea580c' : '#2563eb' }">●</span>
      </div>
    </div>
    <div class="panel" style="min-width:210px;max-width:220px">
      <label>k vecinos: <span class="v">{{ k }}</span><input type="range" min="1" max="9" step="2" v-model.number="k"></label>
      <button :class="{ on: escalar }" @click="escalar = !escalar">{{ escalar ? 'Variables escaladas ✓' : 'Sin escalar' }}</button>
      <div class="stats">
        <span class="dot1">Votos «aprueba»</span><b>{{ votos.si }}</b>
        <span class="dot0">Votos «no aprueba»</span><b>{{ votos.no }}</b>
      </div>
      <div style="font-size:18px;font-weight:800" :style="{ color: votos.si > votos.no ? '#ea580c' : '#2563eb' }">→ Ana {{ votos.si > votos.no ? 'aprueba' : 'no aprueba' }}</div>
      <div class="hint">Sin escalar, 1 punto de asistencia «pesa» lo mismo que 1 hora de estudio, así que la asistencia domina la distancia. Mira si Pedro (3 h) le gana a Carla. Escala y compara. Datos inventados.</div>
    </div>
  </div>
</template>
