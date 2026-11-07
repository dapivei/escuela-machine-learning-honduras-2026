<script setup>
import { ref, computed } from 'vue'

// Vectores de juguete hechos a mano (d = 4). Dimensiones: [sujeto, comida, acción, función]
const T = ['El', 'gato', 'se', 'comió', 'el', 'pescado', 'porque', 'tenía', 'hambre']
const K = [[0, 0, 0, 1], [2, 0, 0.5, 0], [0, 0, 0.5, 1], [0.5, 1, 2, 0], [0, 0, 0, 1], [0, 2, 0.3, 0], [0, 0, 0.5, 1], [0.5, 0, 1.5, 0], [1, 1, 0, 0]]
const Q = [[1, 0, 0, 0.5], [0, 0, 2, 0], [0, 0, 2, 0], [2, 2, 0, 0], [0, 2, 0, 0], [0, 0, 2, 0], [0, 0, 2, 0], [2, 0, 0, 0], [0, 0, 1.5, 0]]
const d = 4
const sel = ref(7), escalar = ref(true)

const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)
const fila = i => {
  const sc = K.map(k => dot(Q[i], k) / (escalar.value ? Math.sqrt(d) : 1))
  const m = Math.max(...sc), e = sc.map(s => Math.exp(s - m)), z = e.reduce((a, b) => a + b, 0)
  return { sc, w: e.map(x => x / z) }
}
const M = computed(() => T.map((_, i) => fila(i).w))
const det = computed(() => fila(sel.value))
const f = v => (Math.abs(v) < 1e-9 ? '0' : Number.isInteger(v) ? String(v) : v.toFixed(2))
</script>

<template>
  <div class="demo" style="gap:22px">
    <div style="display:flex;flex-direction:column;gap:8px">
      
      <div class="row">
        <button v-for="(t, i) in T" :key="i" :class="{ on: sel === i }" @click="sel = i" style="font-size:12.5px;padding:1px 7px">{{ t }}</button>
      </div>
      <div style="display:flex;gap:3px;align-items:flex-end;height:86px;padding:2px 0">
        <div v-for="(w, j) in M[sel]" :key="j" style="width:46px;display:flex;flex-direction:column;align-items:center;gap:2px">
          <span style="font-size:11px;font-family:ui-monospace,monospace">{{ (w * 100).toFixed(0) }}%</span>
          <div :style="{ height: w * 55 + 'px', background: '#ea580c' }" style="width:30px;border-radius:4px 4px 0 0;transition:height .3s" />
          <span style="font-size:11px">{{ T[j] }}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:58px repeat(9, 42px);font-size:10px;line-height:15px;gap:1px">
        <span></span><span v-for="t in T" :key="t" style="text-align:center;color:#64748b">{{ t }}</span>
        <template v-for="(r, i) in M" :key="i">
          <span @click="sel = i" style="text-align:right;padding-right:4px;cursor:pointer" :style="{ fontWeight: i === sel ? 700 : 400 }">{{ T[i] }}</span>
          <span v-for="(w, j) in r" :key="j" @click="sel = i" :style="{ background: `rgba(234,88,12,${w})`, outline: i === sel ? '1px solid #0f172a' : '' }" style="text-align:center;cursor:pointer;height:15px">{{ w >= 0.15 ? (w * 100).toFixed(0) : '' }}</span>
        </template>
      </div>
    </div>
    <div class="panel" style="min-width:260px;max-width:280px">
      <div style="font-size:13px"><b>Cálculo para «{{ T[sel] }}»</b></div>
      <div style="font-family:ui-monospace,monospace;font-size:12px">q = [{{ Q[sel].map(f).join(', ') }}]</div>
      <div style="display:grid;grid-template-columns:auto auto auto;font-size:11px;font-family:ui-monospace,monospace;line-height:16px;column-gap:10px">
        <span style="color:#64748b">palabra</span><span style="color:#64748b">q·k{{ escalar ? '/√d' : '' }}</span><span style="color:#64748b">peso</span>
        <template v-for="(t, j) in T" :key="j">
          <span :style="{ fontWeight: det.w[j] === Math.max(...det.w) ? 700 : 400 }">{{ t }}</span>
          <span style="text-align:right">{{ det.sc[j].toFixed(2) }}</span>
          <span :style="{ fontWeight: det.w[j] === Math.max(...det.w) ? 700 : 400 }">{{ det.w[j].toFixed(3) }}</span>
        </template>
      </div>
      <button :class="{ on: escalar }" @click="escalar = !escalar">Dividir entre √d</button>
      <div class="hint">Sin dividir entre √d los productos crecen y la softmax se vuelve casi un 0/1: el modelo mira una sola palabra y aprende peor. Vectores de juguete (d = 4) hechos a mano; en un modelo real tienen miles de dimensiones y se aprenden.</div>
    </div>
  </div>
</template>
