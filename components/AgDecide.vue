<script setup>
import { ref, computed } from 'vue'

const PRESETS = {
  duda: ['Responder una duda del curso', 1, 0.5, 0.3],
  correo: ['Enviar un correo a un cliente', 1, 5, 0.3],
  borrar: ['Borrar registros de la base de datos', 1, 100, 0.2],
}
const p = ref(0.85), B = ref(1), Ce = ref(5), Cq = ref(0.3), preset = ref('correo')
function usar(k) { preset.value = k; [, B.value, Ce.value, Cq.value] = PRESETS[k] }

const euAct = q => q * B.value - (1 - q) * Ce.value
const euAsk = computed(() => B.value - Cq.value)
const umbral = computed(() => Math.max(0, 1 - Cq.value / (B.value + Ce.value)))
const actuar = computed(() => euAct(p.value) >= euAsk.value)

const W = 380, H = 220, P = 34
const lo = computed(() => Math.min(euAct(0), euAsk.value, -0.2)), hi = computed(() => Math.max(B.value, euAsk.value) + 0.1)
const X = q => P + q * (W - P - 10)
const Y = v => H - 24 - (v - lo.value) / (hi.value - lo.value) * (H - 36)
</script>

<template>
  <div class="demo" style="gap:22px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <rect :x="X(umbral)" y="6" :width="X(1) - X(umbral)" :height="H - 30" fill="#dcfce7" opacity="0.6" />
        <rect :x="X(0)" y="6" :width="X(umbral) - X(0)" :height="H - 30" fill="#fef3c7" opacity="0.6" />
        <line :x1="X(0)" :x2="X(1)" :y1="Y(0)" :y2="Y(0)" stroke="#cbd5e1" />
        <line :x1="X(0)" :x2="X(1)" :y1="Y(euAct(0))" :y2="Y(euAct(1))" stroke="#ea580c" stroke-width="3" />
        <line :x1="X(0)" :x2="X(1)" :y1="Y(euAsk)" :y2="Y(euAsk)" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 4" />
        <line :x1="X(p)" :x2="X(p)" y1="6" :y2="H - 24" stroke="#0f172a" stroke-width="1.5" />
        <circle :cx="X(p)" :cy="Y(euAct(p))" r="5" fill="#ea580c" />
        <text :x="X(umbral) + 3" y="18" style="font-size:11px" fill="#15803d">actuar →</text>
        <text :x="X(0) + 3" y="18" style="font-size:11px" fill="#a16207">← preguntar</text>
        <text :x="X(0)" :y="H - 8" style="font-size:10px" fill="#64748b">0</text>
        <text :x="X(1) - 4" :y="H - 8" style="font-size:10px" fill="#64748b">1</text>
        <text :x="(X(0) + X(1)) / 2" :y="H - 8" text-anchor="middle" style="font-size:11px" fill="#64748b">confianza del agente p</text>
      </svg>
      <div class="row" style="font-size:12px"><span style="color:#ea580c">━ E[U(actuar)] = p·B − (1−p)·C<sub>error</sub></span><span style="color:#2563eb">┅ E[U(preguntar)] = B − C<sub>preguntar</sub></span></div>
    </div>
    <div class="panel" style="max-width:290px">
      <div class="row"><button v-for="(v, k) in PRESETS" :key="k" :class="{ on: preset === k }" @click="usar(k)" style="font-size:11.5px">{{ v[0] }}</button></div>
      <label>Confianza del agente p: <span class="v">{{ p.toFixed(2) }}</span><input type="range" min="0" max="1" step="0.01" v-model.number="p"></label>
      <label>Costo de equivocarse: <span class="v">{{ Ce }}</span><input type="range" min="0" max="100" step="0.5" v-model.number="Ce" @input="preset = ''"></label>
      <label>Costo de preguntar: <span class="v">{{ Cq.toFixed(2) }}</span><input type="range" min="0" max="1" step="0.05" v-model.number="Cq" @input="preset = ''"></label>
      <div class="stats">
        <span>Umbral p*</span><b>{{ umbral.toFixed(3) }}</b>
        <span>Decisión</span><b :style="{ color: actuar ? '#15803d' : '#a16207' }">{{ actuar ? 'Actuar solo' : 'Pedir confirmación' }}</b>
      </div>
      <div class="hint">p* = 1 − C<sub>preguntar</sub> / (B + C<sub>error</sub>). Cuando equivocarse cuesta mucho, el agente debe estar casi seguro para actuar sin preguntar.</div>
    </div>
  </div>
</template>
