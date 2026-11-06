<script setup>
import { ref, computed } from 'vue'

// Conteos de ejemplo (inventados): 40 correos spam y 60 normales
const NS = 40, NN = 60
const words = ref([
  { w: 'gratis', s: 20, n: 3, on: true },
  { w: 'reunión', s: 4, n: 18, on: true },
  { w: 'oferta', s: 16, n: 6, on: false },
  { w: 'proyecto', s: 2, n: 21, on: false },
  { w: 'criptomoneda', s: 6, n: 0, on: false },
])
const prior = ref(0.4), alpha = ref(0)

const pw = (c, N) => (c + alpha.value) / (N + 2 * alpha.value)
const rows = computed(() => words.value.map(o => ({ ...o, ps: pw(o.s, NS), pn: pw(o.n, NN) })))
const res = computed(() => {
  let s = prior.value, n = 1 - prior.value
  for (const r of rows.value) if (r.on) { s *= r.ps; n *= r.pn }
  const z = s + n
  return { s, n, post: z > 0 ? s / z : 0.5 }
})
const fmt = v => (v === 0 ? '0' : v < 0.001 ? v.toExponential(1) : v.toFixed(3))
</script>

<template>
  <div class="demo" style="gap:28px">
    <div class="panel" style="min-width:300px;max-width:320px">
      <div style="font-weight:700">¿Qué palabras trae el correo?</div>
      <table style="font-size:13px;border-collapse:collapse">
        <tr style="color:#64748b"><th></th><th style="text-align:left">palabra</th><th>P(w | spam)</th><th>P(w | normal)</th></tr>
        <tr v-for="o in words" :key="o.w" :style="{ opacity: o.on ? 1 : 0.45 }">
          <td><input type="checkbox" v-model="o.on"></td>
          <td style="font-weight:600">{{ o.w }}</td>
          <td style="text-align:center;font-family:monospace">{{ pw(o.s, NS).toFixed(3) }}</td>
          <td style="text-align:center;font-family:monospace" :style="{ color: pw(o.n, NN) === 0 ? '#dc2626' : '' }">{{ pw(o.n, NN).toFixed(3) }}</td>
        </tr>
      </table>
      <label>A priori P(spam): <span class="v">{{ prior.toFixed(2) }}</span><input type="range" min="0.01" max="0.99" step="0.01" v-model.number="prior"></label>
      <label>Suavizado de Laplace α: <span class="v">{{ alpha }}</span><input type="range" min="0" max="3" step="1" v-model.number="alpha"></label>
      <div class="hint">Conteos inventados: 40 correos spam y 60 normales. Marca «criptomoneda» con α = 0 y observa qué pasa.</div>
    </div>
    <div class="panel" style="min-width:330px;max-width:360px">
      <div class="stats" style="grid-template-columns:auto 1fr">
        <span class="dot1">spam</span><b>{{ prior.toFixed(2) }}<template v-for="r in rows" :key="r.w"><template v-if="r.on"> · {{ r.ps.toFixed(2) }}</template></template> = {{ fmt(res.s) }}</b>
        <span class="dot0">normal</span><b>{{ (1 - prior).toFixed(2) }}<template v-for="r in rows" :key="r.w"><template v-if="r.on"> · {{ r.pn.toFixed(2) }}</template></template> = {{ fmt(res.n) }}</b>
      </div>
      <div style="font-weight:700;margin-top:6px">P(spam | correo) = {{ (res.post * 100).toFixed(1) }}%</div>
      <div style="display:flex;height:34px;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1">
        <div :style="{ width: res.post * 100 + '%', background: '#ea580c', transition: 'width .3s' }" />
        <div :style="{ flex: 1, background: '#2563eb' }" />
      </div>
      <div style="font-size:22px;font-weight:800" :style="{ color: res.post >= 0.5 ? '#ea580c' : '#2563eb' }">→ {{ res.post >= 0.5 ? 'SPAM' : 'NORMAL' }}</div>
      <div v-if="res.n === 0 && alpha === 0" class="hint" style="color:#dc2626">Una sola probabilidad 0 anula todo el producto: el modelo queda «seguro» de que es spam sin importar lo demás. Sube α.</div>
    </div>
  </div>
</template>
