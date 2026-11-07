<script setup>
import { ref, computed } from 'vue'

// Mini modelo de lenguaje de trigramas entrenado aquí con estas frases
const FRASES = [
  'el modelo predice la siguiente palabra .', 'el modelo aprende de muchos ejemplos .', 'el modelo usa herramientas para responder .',
  'el agente usa herramientas en un ciclo .', 'el agente decide la siguiente acción .', 'el agente observa el resultado y decide .',
  'la escuela enseña ciencia de datos .', 'la escuela enseña aprendizaje automático .', 'los agentes usan herramientas y memoria .',
  'los agentes pueden equivocarse .', 'los modelos de lenguaje predicen palabras .', 'los modelos de lenguaje aprenden patrones .',
  'un modelo de lenguaje asigna probabilidades .', 'el modelo asigna probabilidades a cada palabra .', 'la siguiente palabra depende del contexto .',
  'el contexto cambia la siguiente palabra .', 'el agente aprende de sus errores .', 'el resultado depende del contexto .',
  'los datos enseñan al modelo .', 'la temperatura cambia la probabilidad .', 'el modelo aprende patrones de los datos .',
  'el agente usa la memoria para decidir .', 'la siguiente acción depende del resultado .',
]
const tri = {}, bi = {}, uni = {}
const add = (o, k, w) => { o[k] = o[k] || {}; o[k][w] = (o[k][w] || 0) + 1 }
for (const f of FRASES) {
  const w = ['<s>', '<s>', ...f.split(' ')]
  for (let i = 2; i < w.length; i++) { add(tri, w[i - 2] + ' ' + w[i - 1], w[i]); add(bi, w[i - 1], w[i]); uni[w[i]] = (uni[w[i]] || 0) + 1 }
}
const INICIOS = ['el modelo', 'el agente', 'los agentes', 'la escuela', 'la siguiente']
const inicio = ref(INICIOS[0]), gen = ref([]), T = ref(1), topP = ref(1), ultimo = ref(null), logp = ref([])
let seed = 7
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

const palabras = computed(() => [...inicio.value.split(' '), ...gen.value])
const terminado = computed(() => gen.value[gen.value.length - 1] === '.' || gen.value.length >= 14)
const dist = computed(() => {
  const w = palabras.value, k = w[w.length - 2] + ' ' + w[w.length - 1]
  const c = tri[k] || bi[w[w.length - 1]] || uni
  const fuente = tri[k] ? 'trigrama' : bi[w[w.length - 1]] ? 'bigrama' : 'unigrama'
  const items = Object.entries(c).map(([p, n]) => ({ p, n, z: Math.log(n) }))
  const m = Math.max(...items.map(i => i.z / T.value))
  items.forEach(i => (i.e = Math.exp(i.z / T.value - m)))
  const Z = items.reduce((s, i) => s + i.e, 0)
  items.forEach(i => (i.prob = i.e / Z))
  items.sort((a, b) => b.prob - a.prob)
  let acc = 0
  items.forEach(i => { i.dentro = acc < topP.value - 1e-9; acc += i.prob })
  const Zp = items.filter(i => i.dentro).reduce((s, i) => s + i.prob, 0)
  items.forEach(i => (i.final = i.dentro ? i.prob / Zp : 0))
  return { items, fuente }
})
function paso(codicioso) {
  if (terminado.value) return
  const it = dist.value.items
  let pick = it[0]
  if (!codicioso) { let r = rand(), a = 0; for (const i of it) { a += i.final; if (r <= a && i.final > 0) { pick = i; break } } }
  ultimo.value = pick.p; logp.value.push(Math.log(pick.final)); gen.value.push(pick.p)
}
function reiniciar() { gen.value = []; ultimo.value = null; logp.value = [] }
const perp = computed(() => (logp.value.length ? Math.exp(-logp.value.reduce((a, b) => a + b, 0) / logp.value.length) : null))
</script>

<template>
  <div class="demo" style="gap:22px">
    <div style="display:flex;flex-direction:column;gap:8px;width:470px">
      <div style="background:#0f172a;color:#f8fafc;border-radius:10px;padding:10px 14px;font-size:20px;min-height:52px">
        <span>{{ inicio }}</span><span v-for="(g, i) in gen" :key="i" :style="{ color: i === gen.length - 1 ? '#fdba74' : '#f8fafc' }">{{ ' ' + g }}</span><span v-if="!terminado" style="opacity:.5">▌</span>
      </div>
      <div v-if="terminado" class="hint" style="font-size:14px">Fin de la oración. Pulsa ↺ para generar otra.</div>
      <template v-else>
      <div class="hint">Probabilidades de la siguiente palabra (contexto: {{ dist.fuente }} «{{ palabras.slice(-2).join(' ') }}»)</div>
      <div v-for="i in dist.items.slice(0, 7)" :key="i.p" style="display:flex;align-items:center;gap:6px;font-size:13px" :style="{ opacity: i.dentro ? 1 : 0.35 }">
        <span style="width:110px;font-family:ui-monospace,monospace;text-align:right">{{ i.p }}</span>
        <div style="flex:1;height:16px;background:#f1f5f9;border-radius:4px"><div :style="{ width: i.final * 100 + '%' }" style="height:16px;background:#ea580c;border-radius:4px;transition:width .25s" /></div>
        <span style="width:50px;font-family:ui-monospace,monospace">{{ (i.final * 100).toFixed(1) }}%</span>
      </div>
      </template>
    </div>
    <div class="panel">
      <label>Inicio
        <select v-model="inicio" @change="reiniciar"><option v-for="s in INICIOS" :key="s">{{ s }}</option></select>
      </label>
      <div class="row">
        <button @click="paso(false)" :disabled="terminado">🎲 Muestrear</button>
        <button @click="paso(true)" :disabled="terminado">Más probable</button>
        <button @click="reiniciar">↺</button>
      </div>
      <label>Temperatura T: <span class="v">{{ T.toFixed(2) }}</span><input type="range" min="0.1" max="3" step="0.05" v-model.number="T"></label>
      <label>Top-p: <span class="v">{{ topP.toFixed(2) }}</span><input type="range" min="0.1" max="1" step="0.05" v-model.number="topP"></label>
      <div class="stats">
        <span>Palabras generadas</span><b>{{ gen.length }}</b>
        <span>Perplejidad</span><b>{{ perp ? perp.toFixed(2) : '—' }}</b>
      </div>
      <div class="hint">T baja → casi siempre la más probable (repetitivo). T alta → más variado y más errores. Top-p descarta las opciones raras. Un LLM real hace lo mismo, pero con una red neuronal en vez de conteos.</div>
    </div>
  </div>
</template>
