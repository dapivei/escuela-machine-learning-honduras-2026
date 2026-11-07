<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'

const TOPO = {
  orquestador: {
    nombre: 'Orquestador–trabajadores',
    nodes: { O: [300, 112, 'Orquestador', '🧭'], I: [110, 40, 'Investigador', '🔎'], A: [110, 185, 'Analista', '📊'], E: [490, 40, 'Escritor', '✍️'], R: [490, 185, 'Revisor', '✅'] },
    plan: () => [['O', 'I'], ['O', 'A'], ['I', 'O'], ['A', 'O'], ['O', 'E'], ['E', 'O'], ['O', 'R'], ['R', 'O']],
    pros: 'Control central, fácil de depurar y de limitar el costo.', contras: 'El orquestador es un cuello de botella y un punto único de falla.',
  },
  secuencial: {
    nombre: 'Secuencial (cadena)',
    nodes: { I: [70, 125, 'Investigador', '🔎'], A: [230, 125, 'Analista', '📊'], E: [390, 125, 'Escritor', '✍️'], R: [540, 125, 'Revisor', '✅'] },
    plan: () => [['I', 'A'], ['A', 'E'], ['E', 'R'], ['R', 'E'], ['E', 'R']],
    pros: 'Simple y predecible: cada agente entrega al siguiente.', contras: 'Lento; un error al inicio se arrastra hasta el final.',
  },
  enjambre: {
    nombre: 'Enjambre (entre pares)',
    nodes: { I: [110, 40, 'Investigador', '🔎'], A: [110, 185, 'Analista', '📊'], E: [490, 40, 'Escritor', '✍️'], R: [490, 185, 'Revisor', '✅'], C: [300, 112, 'Crítico', '🧐'] },
    plan: () => {
      const k = Object.keys(TOPO.enjambre.nodes), s = [], n = 10 + Math.floor(Math.random() * 8)
      for (let i = 0; i < n; i++) { const a = k[Math.floor(Math.random() * k.length)]; let b; do b = k[Math.floor(Math.random() * k.length)]; while (b === a); s.push([a, b]) }
      return s
    },
    pros: 'Flexible y robusto: no depende de un solo agente.', contras: 'Más mensajes y más costo; difícil de predecir y de depurar.',
  },
}
const t = ref('orquestador'), msgs = ref(0), vuelo = ref(null), playing = ref(false), activo = ref(null)
let cola = [], raf = null
const T = computed(() => TOPO[t.value])

function correr() {
  if (playing.value) return
  cola = T.value.plan(); msgs.value = 0; playing.value = true; siguiente()
}
function siguiente() {
  if (!cola.length) { playing.value = false; vuelo.value = null; activo.value = null; return }
  const [a, b] = cola.shift(), A = T.value.nodes[a], B = T.value.nodes[b], t0 = performance.now(), dur = 520
  activo.value = a
  const anim = now => {
    const f = Math.min(1, (now - t0) / dur)
    vuelo.value = { x: A[0] + (B[0] - A[0]) * f, y: A[1] + (B[1] - A[1]) * f }
    if (f < 1) raf = requestAnimationFrame(anim)
    else { msgs.value++; activo.value = b; setTimeout(siguiente, 120) }
  }
  raf = requestAnimationFrame(anim)
}
function reset() { cancelAnimationFrame(raf); cola = []; playing.value = false; vuelo.value = null; msgs.value = 0; activo.value = null }
watch(t, reset)
onUnmounted(reset)
const aristas = computed(() => {
  const k = Object.keys(T.value.nodes), s = new Set()
  T.value.plan === TOPO.enjambre.plan ? k.forEach((a, i) => k.slice(i + 1).forEach(b => s.add(a + b))) : TOPO[t.value].plan().forEach(([a, b]) => s.add([a, b].sort().join('')))
  return [...s].map(x => [x[0], x[1]])
})
</script>

<template>
  <div class="demo">
    <svg width="600" height="250" style="flex-shrink:0;background:#fff;border:1px solid #cbd5e1;border-radius:10px">
      <line v-for="e in aristas" :key="t + e.join('')" :x1="T.nodes[e[0]][0]" :y1="T.nodes[e[0]][1]" :x2="T.nodes[e[1]][0]" :y2="T.nodes[e[1]][1]" stroke="#cbd5e1" stroke-width="2" />
      <g v-for="(n, id) in T.nodes" :key="t + id">
        <circle :cx="n[0]" :cy="n[1]" r="30" :fill="activo === id ? '#ffedd5' : '#f8fafc'" :stroke="activo === id ? '#ea580c' : '#475569'" stroke-width="2" />
        <text :x="n[0]" :y="n[1] + 7" text-anchor="middle" style="font-size:20px">{{ n[3] }}</text>
        <text :x="n[0]" :y="n[1] + 46" text-anchor="middle" style="font-size:12px;font-weight:600" fill="#0f172a">{{ n[2] }}</text>
      </g>
      <circle v-if="vuelo" :cx="vuelo.x" :cy="vuelo.y" r="7" fill="#ea580c" />
    </svg>
    <div class="panel" style="max-width:270px">
      <label>Topología
        <select v-model="t"><option v-for="(v, k) in TOPO" :key="k" :value="k">{{ v.nombre }}</option></select>
      </label>
      <div class="row"><button @click="correr" :disabled="playing">▶ Resolver tarea</button><button @click="reset">↺</button></div>
      <div class="stats">
        <span>Mensajes</span><b>{{ msgs }}</b>
        <span>Tokens aprox.</span><b>{{ (msgs * 1500).toLocaleString('es-HN') }}</b>
      </div>
      <div style="font-size:13px"><b>➕</b> {{ T.pros }}</div>
      <div style="font-size:13px"><b>➖</b> {{ T.contras }}</div>
      <div class="hint">Tarea: «escribir un informe con datos». Cada agente tiene un rol, sus propias herramientas y su propia memoria. En el enjambre, corre la simulación varias veces: el número de mensajes cambia.</div>
    </div>
  </div>
</template>
