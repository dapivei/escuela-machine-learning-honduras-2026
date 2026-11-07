<script setup>
import { ref, computed } from 'vue'

const p = ref(0.7), k = ref(3), r = ref(0.95), n = ref(10)
const W = 300, H = 180, PAD = 30
const X = (i, m) => PAD + (i - 1) / (m - 1) * (W - PAD - 10)
const Y = v => H - 22 - v * (H - 36)
const linea = (f, m) => Array.from({ length: m }, (_, i) => `${i ? 'L' : 'M'}${X(i + 1, m).toFixed(1)},${Y(f(i + 1)).toFixed(1)}`).join('')
const atK = computed(() => 1 - (1 - p.value) ** k.value)
const hatK = computed(() => p.value ** k.value)
const cadena = computed(() => r.value ** n.value)
const pct = v => (v * 100).toFixed(1) + ' %'
</script>

<template>
  <div class="demo" style="gap:26px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <b style="font-size:14px">1 · ¿Qué tan confiable es el agente?</b>
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <line :x1="PAD" :x2="W - 10" :y1="Y(0)" :y2="Y(0)" stroke="#94a3b8" />
        <text x="4" :y="Y(1) + 4" style="font-size:10px" fill="#64748b">100%</text>
        <text x="8" :y="Y(0) + 4" style="font-size:10px" fill="#64748b">0%</text>
        <path :d="linea(i => 1 - (1 - p) ** i, 10)" fill="none" stroke="#15803d" stroke-width="2.5" />
        <path :d="linea(i => p ** i, 10)" fill="none" stroke="#b91c1c" stroke-width="2.5" />
        <line :x1="X(k, 10)" :x2="X(k, 10)" :y1="Y(1)" :y2="Y(0)" stroke="#0f172a" stroke-dasharray="4 3" />
        <circle :cx="X(k, 10)" :cy="Y(atK)" r="5" fill="#15803d" /><circle :cx="X(k, 10)" :cy="Y(hatK)" r="5" fill="#b91c1c" />
        <text :x="W - 10" :y="H - 6" text-anchor="end" style="font-size:10px" fill="#64748b">intentos k →</text>
      </svg>
      <label style="width:300px">Éxito en un intento p: <span class="v">{{ pct(p) }}</span><input type="range" min="0.05" max="0.99" step="0.01" v-model.number="p"></label>
      <label style="width:300px">Intentos k: <span class="v">{{ k }}</span><input type="range" min="1" max="10" v-model.number="k"></label>
      <div class="stats" style="width:280px">
        <span style="color:#15803d">pass@k (al menos 1 éxito)</span><b>{{ pct(atK) }}</b>
        <span style="color:#b91c1c">pass^k (éxito en todos)</span><b>{{ pct(hatK) }}</b>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <b style="font-size:14px">2 · Los errores se acumulan en tareas largas</b>
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <line :x1="PAD" :x2="W - 10" :y1="Y(0)" :y2="Y(0)" stroke="#94a3b8" />
        <text x="4" :y="Y(1) + 4" style="font-size:10px" fill="#64748b">100%</text>
        <path :d="linea(i => r ** i, 50)" fill="none" stroke="#7c3aed" stroke-width="2.5" />
        <circle :cx="X(n, 50)" :cy="Y(cadena)" r="5" fill="#7c3aed" />
        <text :x="W - 10" :y="H - 6" text-anchor="end" style="font-size:10px" fill="#64748b">número de pasos (1–50) →</text>
      </svg>
      <label style="width:300px">Confiabilidad de cada paso: <span class="v">{{ pct(r) }}</span><input type="range" min="0.8" max="0.999" step="0.001" v-model.number="r"></label>
      <label style="width:300px">Pasos de la tarea: <span class="v">{{ n }}</span><input type="range" min="1" max="50" v-model.number="n"></label>
      <div class="stats" style="width:280px"><span>Éxito de la tarea completa</span><b>{{ pct(cadena) }}</b></div>
    </div>
    <div class="panel" style="max-width:180px;font-size:12.5px">
      <div class="hint" style="font-size:12.5px"><b>pass@k</b> sirve si un humano elige la mejor de k respuestas.</div>
      <div class="hint" style="font-size:12.5px"><b>pass^k</b> mide consistencia: un agente de atención al cliente debe acertar <i>siempre</i>.</div>
      <div class="hint" style="font-size:12.5px">Con 95 % por paso, una tarea de 20 pasos sale bien solo ~36 % de las veces. Por eso se evalúan los pasos intermedios.</div>
    </div>
  </div>
</template>
