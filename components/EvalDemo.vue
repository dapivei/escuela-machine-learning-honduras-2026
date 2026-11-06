<script setup>
import { ref, computed } from 'vue'
import { Phi, phi } from '../utils/ml.js'

const N = 1000
const d = ref(2), prev = ref(0.3), t = ref(1), scaled = ref(true)

const m = computed(() => {
  const P = N * prev.value, Nn = N - P
  const TP = P * (1 - Phi(t.value - d.value)), FN = P - TP
  const FP = Nn * (1 - Phi(t.value)), TN = Nn - FP
  const prec = TP + FP > 0 ? TP / (TP + FP) : 0, rec = P > 0 ? TP / P : 0
  return {
    TP, FN, FP, TN, prec, rec,
    acc: (TP + TN) / N, f1: prec + rec > 0 ? 2 * prec * rec / (prec + rec) : 0,
    fpr: FP / Nn, base: Math.max(prev.value, 1 - prev.value), auc: Phi(d.value / Math.SQRT2),
  }
})

// densidades
const W = 400, H = 170, X0 = -4, X1 = 7
const sx = x => 10 + (x - X0) / (X1 - X0) * (W - 20)
const curves = computed(() => {
  const wn = scaled.value ? 1 - prev.value : 1, wp = scaled.value ? prev.value : 1
  const top = Math.max(wn, wp) * phi(0)
  const sy = y => H - 22 - y / top * (H - 34)
  const xs = []; for (let x = X0; x <= X1 + 1e-9; x += 0.05) xs.push(x)
  const line = g => xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(g(x)).toFixed(1)}`).join('')
  const area = g => { const r = xs.filter(x => x >= t.value); if (!r.length) return ''; return `M${sx(r[0])},${sy(0)}` + r.map(x => `L${sx(x).toFixed(1)},${sy(g(x)).toFixed(1)}`).join('') + `L${sx(r[r.length - 1])},${sy(0)}Z` }
  const gn = x => wn * phi(x), gp = x => wp * phi(x - d.value)
  return { n: line(gn), p: line(gp), an: area(gn), ap: area(gp), base: sy(0) }
})

// ROC
const R = 190
const roc = computed(() => {
  const pts = []
  for (let th = 8; th >= -5; th -= 0.1) pts.push([1 - Phi(th), 1 - Phi(th - d.value)])
  return pts.map((p, i) => `${i ? 'L' : 'M'}${(20 + p[0] * (R - 30)).toFixed(1)},${(R - 20 - p[1] * (R - 30)).toFixed(1)}`).join('')
})
const pct = v => (v * 100).toFixed(1) + '%'
</script>

<template>
  <div class="demo" style="gap:22px">
    <div style="display:flex;flex-direction:column;gap:8px">
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <path :d="curves.an" fill="#2563eb" opacity="0.25" />
        <path :d="curves.ap" fill="#ea580c" opacity="0.3" />
        <path :d="curves.n" fill="none" stroke="#2563eb" stroke-width="2.2" />
        <path :d="curves.p" fill="none" stroke="#ea580c" stroke-width="2.2" />
        <line :x1="10" :x2="W - 10" :y1="curves.base" :y2="curves.base" stroke="#94a3b8" />
        <line :x1="sx(t)" :x2="sx(t)" y1="8" :y2="curves.base" stroke="#0f172a" stroke-width="2" stroke-dasharray="5 3" />
        <text :x="sx(t) + 4" y="18" style="font-size:11px" fill="#0f172a">umbral → positivo</text>
        <text x="12" :y="H - 6" style="font-size:11px" fill="#2563eb">negativos (sanos)</text>
        <text :x="W - 12" :y="H - 6" style="font-size:11px" fill="#ea580c" text-anchor="end">positivos (enfermos) · puntaje del modelo →</text>
      </svg>
      <table style="font-size:13px;border-collapse:collapse;text-align:center;width:400px">
        <tr><td></td><th style="color:#64748b">predice +</th><th style="color:#64748b">predice −</th></tr>
        <tr><th style="color:#ea580c;text-align:right">real +</th><td style="background:#fed7aa;font-weight:700">VP {{ Math.round(m.TP) }}</td><td style="background:#fee2e2">FN {{ Math.round(m.FN) }}</td></tr>
        <tr><th style="color:#2563eb;text-align:right">real −</th><td style="background:#fee2e2">FP {{ Math.round(m.FP) }}</td><td style="background:#dbeafe;font-weight:700">VN {{ Math.round(m.TN) }}</td></tr>
      </table>
      <div class="hint">Matriz de confusión para {{ N }} casos.</div>
    </div>
    <div class="panel" style="min-width:200px;max-width:210px">
      <label>Umbral: <span class="v">{{ t.toFixed(2) }}</span><input type="range" min="-3" max="6" step="0.05" v-model.number="t"></label>
      <label>Separación de clases: <span class="v">{{ d.toFixed(1) }}</span><input type="range" min="0" max="4" step="0.1" v-model.number="d"></label>
      <label>% de positivos: <span class="v">{{ (prev * 100).toFixed(0) }}%</span><input type="range" min="0.01" max="0.5" step="0.01" v-model.number="prev"></label>
      <button :class="{ on: scaled }" @click="scaled = !scaled">Alturas según proporción</button>
      <div class="stats">
        <span>Exactitud</span><b>{{ pct(m.acc) }}</b>
        <span>Precisión</span><b>{{ pct(m.prec) }}</b>
        <span>Recall</span><b>{{ pct(m.rec) }}</b>
        <span>F1</span><b>{{ pct(m.f1) }}</b>
        <span style="color:#64748b">«Siempre −»</span><b style="color:#64748b">{{ pct(1 - prev) }}</b>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;align-items:center">
      <svg :width="R" :height="R" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <line x1="20" :y1="R - 20" :x2="R - 10" y2="10" stroke="#cbd5e1" stroke-dasharray="4 3" />
        <path :d="roc" fill="none" stroke="#0f172a" stroke-width="2.2" />
        <circle :cx="20 + m.fpr * (R - 30)" :cy="R - 20 - m.rec * (R - 30)" r="6" fill="#ea580c" stroke="#fff" stroke-width="2" />
        <line x1="20" :x2="R - 10" :y1="R - 20" :y2="R - 20" stroke="#94a3b8" /><line x1="20" x2="20" y1="10" :y2="R - 20" stroke="#94a3b8" />
        <text :x="R - 10" :y="R - 6" style="font-size:10px" text-anchor="end" fill="#64748b">FPR</text>
        <text x="4" y="14" style="font-size:10px" fill="#64748b">TPR</text>
      </svg>
      <div style="font-weight:700">Curva ROC · AUC = {{ m.auc.toFixed(3) }}</div>
      <div class="hint" style="max-width:190px;text-align:center">Mover el umbral recorre la curva; la AUC solo cambia con la separación.</div>
    </div>
  </div>
</template>
