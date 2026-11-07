<script setup>
import { ref, computed } from 'vue'
import PlanoAlumnos from './PlanoAlumnos.vue'
import { ALUMNOS, ANA } from '../utils/alumnos.js'
import { buildTree } from '../utils/ml.js'

const varSel = ref('h'), corte = ref(6.5), completo = ref(false)
const R = { h: [0.5, 9.5, 0.5, 'horas'], a: [52.5, 97.5, 2.5, 'asistencia'] }
const gini = (s, n) => { const t = s + n; return t ? 1 - (s / t) ** 2 - (n / t) ** 2 : 0 }
function evaluar(v, t) {
  const L = ALUMNOS.filter(p => p[v] <= t), D = ALUMNOS.filter(p => p[v] > t)
  const c = g => ({ si: g.filter(p => p.y).length, no: g.filter(p => !p.y).length, n: g.length })
  const l = c(L), d = c(D), n = ALUMNOS.length
  const gl = gini(l.si, l.no), gd = gini(d.si, d.no), gp = (l.n / n) * gl + (d.n / n) * gd
  return { l, d, gl, gd, gp, gan: gini(7, 7) - gp }
}
const r = computed(() => evaluar(varSel.value, corte.value))
function mejor() {
  let best = null
  for (const v of ['h', 'a']) { const [lo, hi, st] = R[v]; for (let t = lo; t <= hi + 1e-9; t += st) { const e = evaluar(v, t); if (!best || e.gan > best.gan + 1e-9) best = { v, t, gan: e.gan } } }
  varSel.value = best.v; corte.value = best.t
}
function cambiarVar(v) { varSel.value = v; corte.value = v === 'h' ? 6.5 : 77.5 }

// árbol completo de profundidad 2
const arbol = computed(() => buildTree(ALUMNOS.map(p => ({ x: p.h, y: p.a, c: p.y })), { maxDepth: 2 }))
function rects(node, b = { h0: 0, h1: 10, a0: 50, a1: 100 }, out = []) {
  if (node.leaf) { out.push({ ...b, p: node.p }); return out }
  if (node.f === 'x') { rects(node.l, { ...b, h1: node.t }, out); rects(node.r, { ...b, h0: node.t }, out) }
  else { rects(node.l, { ...b, a1: node.t }, out); rects(node.r, { ...b, a0: node.t }, out) }
  return out
}
function reglas(node, cond = [], out = []) {
  if (node.leaf) { out.push({ cond: cond.join(' y ') || 'siempre', p: node.p }); return out }
  const nom = node.f === 'x' ? 'horas' : 'asistencia', t = node.t
  reglas(node.l, [...cond, `${nom} ≤ ${t}`], out); reglas(node.r, [...cond, `${nom} > ${t}`], out)
  return out
}
const caja = computed(() => rects(arbol.value))
const listaReglas = computed(() => reglas(arbol.value))
const f2 = v => v.toFixed(3)
</script>

<template>
  <div class="demo" style="gap:16px">
    <PlanoAlumnos :W="390" :H="300" :ana="ANA">
      <template #fondo="{ g }">
        <template v-if="!completo">
          <rect v-if="varSel === 'h'" :x="g.px(0)" :y="g.py(100)" :width="g.px(corte) - g.px(0)" :height="g.py(50) - g.py(100)" :fill="r.l.si > r.l.no ? '#ffedd5' : '#dbeafe'" />
          <rect v-if="varSel === 'h'" :x="g.px(corte)" :y="g.py(100)" :width="g.px(10) - g.px(corte)" :height="g.py(50) - g.py(100)" :fill="r.d.si > r.d.no ? '#ffedd5' : '#dbeafe'" />
          <rect v-if="varSel === 'a'" :x="g.px(0)" :y="g.py(corte)" :width="g.px(10) - g.px(0)" :height="g.py(50) - g.py(corte)" :fill="r.l.si > r.l.no ? '#ffedd5' : '#dbeafe'" />
          <rect v-if="varSel === 'a'" :x="g.px(0)" :y="g.py(100)" :width="g.px(10) - g.px(0)" :height="g.py(corte) - g.py(100)" :fill="r.d.si > r.d.no ? '#ffedd5' : '#dbeafe'" />
          <line v-if="varSel === 'h'" :x1="g.px(corte)" :x2="g.px(corte)" :y1="g.py(50)" :y2="g.py(100)" stroke="#0f172a" stroke-width="2.5" />
          <line v-else :x1="g.px(0)" :x2="g.px(10)" :y1="g.py(corte)" :y2="g.py(corte)" stroke="#0f172a" stroke-width="2.5" />
        </template>
        <template v-else>
          <rect v-for="(c, i) in caja" :key="i" :x="g.px(c.h0)" :y="g.py(c.a1)" :width="g.px(c.h1) - g.px(c.h0)" :height="g.py(c.a0) - g.py(c.a1)" :fill="c.p >= 0.5 ? '#ffedd5' : '#dbeafe'" stroke="#0f172a" stroke-width="2" />
        </template>
      </template>
    </PlanoAlumnos>
    <div class="panel" style="min-width:250px;max-width:260px">
      <div class="row">
        <button :class="{ on: !completo }" @click="completo = false">Un corte</button>
        <button :class="{ on: completo }" @click="completo = true">Árbol de 2 niveles</button>
      </div>
      <template v-if="!completo">
        <div class="row">Pregunta sobre:
          <button :class="{ on: varSel === 'h' }" @click="cambiarVar('h')">horas</button>
          <button :class="{ on: varSel === 'a' }" @click="cambiarVar('a')">asistencia</button>
        </div>
        <label>¿{{ R[varSel][3] }} ≤ <span class="v">{{ corte }}</span>?<input type="range" :min="R[varSel][0]" :max="R[varSel][1]" :step="R[varSel][2]" v-model.number="corte"></label>
        <div class="stats" style="grid-template-columns:auto auto auto">
          <span></span><b>Sí (≤)</b><b>No (&gt;)</b>
          <span>aprobaron</span><b class="dot1">{{ r.l.si }}</b><b class="dot1">{{ r.d.si }}</b>
          <span>no aprobaron</span><b class="dot0">{{ r.l.no }}</b><b class="dot0">{{ r.d.no }}</b>
          <span>Gini</span><b>{{ f2(r.gl) }}</b><b>{{ f2(r.gd) }}</b>
        </div>
        <div class="stats">
          <span>Gini ponderado</span><b>{{ f2(r.gp) }}</b>
          <span>Ganancia (0.5 − ponderado)</span><b>{{ f2(r.gan) }}</b>
        </div>
        <button @click="mejor">🔍 Buscar el mejor corte</button>
      </template>
      <template v-else>
        <div style="font-size:12.5px;display:flex;flex-direction:column;gap:4px">
          <div v-for="(x, i) in listaReglas" :key="i" style="background:#f8fafc;border-radius:6px;padding:3px 8px">Si <b>{{ x.cond }}</b> → <b :style="{ color: x.p >= 0.5 ? '#ea580c' : '#2563eb' }">{{ x.p >= 0.5 ? 'aprueba' : 'no aprueba' }}</b> <span class="hint">({{ (x.p * 100).toFixed(0) }} % aprobó)</span></div>
        </div>
        <div class="hint">El árbol repitió la búsqueda del mejor corte dentro de cada grupo.</div>
      </template>
      <div class="hint">Gini = 1 − p²(sí) − p²(no). Con 7 y 7 alumnos, el Gini inicial es 0.5. Datos inventados.</div>
    </div>
  </div>
</template>
