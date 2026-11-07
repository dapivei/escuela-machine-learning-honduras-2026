<script setup>
import { ref, computed, onUnmounted } from 'vue'

// Patrones de "Building effective agents" (Anthropic, 2024)
const P = {
  cadena: {
    nombre: 'Encadenamiento', tipo: 'flujo',
    nodes: [['in', 40, 130, 'Entrada'], ['a', 170, 130, 'LLM 1'], ['g', 300, 130, 'Revisión'], ['b', 430, 130, 'LLM 2'], ['out', 555, 130, 'Salida']],
    edges: [['in', 'a'], ['a', 'g'], ['g', 'b'], ['b', 'out']],
    run: () => [[0], [1], [2], [3]],
    desc: 'Una secuencia fija: cada llamada procesa la salida de la anterior. Entre pasos puedes poner revisiones con código.',
    cuando: 'La tarea se divide en pasos que conoces de antemano.',
    ej: 'Escribir un resumen y luego traducirlo al inglés.',
  },
  ruta: {
    nombre: 'Enrutamiento', tipo: 'flujo',
    nodes: [['in', 40, 130, 'Entrada'], ['r', 170, 130, 'Clasificador'], ['a', 340, 50, 'Dudas técnicas'], ['b', 340, 130, 'Pagos'], ['c', 340, 210, 'Otros'], ['out', 540, 130, 'Salida']],
    edges: [['in', 'r'], ['r', 'a'], ['r', 'b'], ['r', 'c'], ['a', 'out'], ['b', 'out'], ['c', 'out']],
    run: () => { const k = Math.floor(Math.random() * 3); return [[0], [1 + k], [4 + k]] },
    desc: 'Un primer paso clasifica la entrada y la manda al manejador especializado.',
    cuando: 'Hay categorías claras que conviene tratar por separado.',
    ej: 'Soporte al cliente: dudas técnicas, pagos u otros.',
  },
  paralelo: {
    nombre: 'Paralelización', tipo: 'flujo',
    nodes: [['in', 40, 130, 'Entrada'], ['a', 220, 50, 'LLM A'], ['b', 220, 130, 'LLM B'], ['c', 220, 210, 'LLM C'], ['ag', 400, 130, 'Agregador'], ['out', 550, 130, 'Salida']],
    edges: [['in', 'a'], ['in', 'b'], ['in', 'c'], ['a', 'ag'], ['b', 'ag'], ['c', 'ag'], ['ag', 'out']],
    run: () => [[0, 1, 2], [3, 4, 5], [6]],
    desc: 'Varias llamadas al mismo tiempo: secciones independientes de la tarea, o varios intentos que luego votan.',
    cuando: 'Las partes son independientes, o quieres más confianza con varios votos.',
    ej: 'Tres revisores buscan vulnerabilidades en el mismo código.',
  },
  orquestador: {
    nombre: 'Orquestador–trabajadores', tipo: 'híbrido',
    nodes: [['in', 40, 130, 'Entrada'], ['o', 170, 130, 'Orquestador'], ['a', 330, 40, 'Trabajador 1'], ['b', 330, 100, 'Trabajador 2'], ['c', 330, 160, 'Trabajador 3'], ['d', 330, 220, 'Trabajador 4'], ['s', 470, 130, 'Síntesis'], ['out', 565, 130, 'Salida']],
    edges: [['in', 'o'], ['o', 'a'], ['o', 'b'], ['o', 'c'], ['o', 'd'], ['a', 's'], ['b', 's'], ['c', 's'], ['d', 's'], ['s', 'out']],
    run: () => { const n = 2 + Math.floor(Math.random() * 3), w = [1, 2, 3, 4].slice(0, n); return [[0], w, w.map(i => i + 4), [9]] },
    desc: 'Un LLM central decide en el momento cuántas subtareas hay, las reparte y junta los resultados.',
    cuando: 'No sabes de antemano cuántas subtareas habrá.',
    ej: 'Cambiar código en varios archivos que dependen de la petición.',
  },
  evaluador: {
    nombre: 'Evaluador–optimizador', tipo: 'híbrido',
    nodes: [['in', 40, 130, 'Entrada'], ['g', 210, 130, 'Generador'], ['e', 400, 130, 'Evaluador'], ['out', 555, 130, 'Salida']],
    edges: [['in', 'g'], ['g', 'e'], ['e', 'g', 'retroalimentación'], ['e', 'out', 'aprobado']],
    run: () => { const k = 1 + Math.floor(Math.random() * 3), s = [[0]]; for (let i = 0; i < k; i++) s.push([1], [2]); s.push([1], [3]); return s },
    desc: 'Un LLM propone y otro critica. Se repite hasta que la respuesta pasa el criterio.',
    cuando: 'Hay un criterio claro para evaluar y las correcciones ayudan.',
    ej: 'Traducción literaria con un revisor de estilo.',
  },
  agente: {
    nombre: 'Agente', tipo: 'agente',
    nodes: [['h', 60, 130, 'Humano'], ['l', 270, 130, 'LLM'], ['env', 480, 130, 'Entorno'], ['stop', 270, 225, 'Parar']],
    edges: [['h', 'l', 'tarea'], ['l', 'env', 'acción'], ['env', 'l', 'observación'], ['l', 'stop'], ['l', 'h', 'pregunta / resultado']],
    run: () => { const k = 2 + Math.floor(Math.random() * 3), s = [[0]]; for (let i = 0; i < k; i++) s.push([1], [2]); s.push([3], [4]); return s },
    desc: 'El LLM decide sus propios pasos: elige herramientas, observa resultados y sigue hasta cumplir la meta o pararse.',
    cuando: 'Problemas abiertos donde no puedes predecir los pasos.',
    ej: 'Un agente de código que arregla un error en un repositorio.',
  },
}
const key = ref('cadena')
const p = computed(() => P[key.value])
const pos = computed(() => Object.fromEntries(p.value.nodes.map(n => [n[0], n])))
const active = ref(new Set()), visited = ref(new Set()), stepN = ref(0)
let timer = null

function play() {
  stop(); const seq = p.value.run(); let i = 0; visited.value = new Set(); stepN.value = 0
  timer = setInterval(() => {
    if (i >= seq.length) { active.value = new Set(); return stop() }
    active.value = new Set(seq[i]); seq[i].forEach(e => visited.value.add(p.value.edges[e][1])); stepN.value = ++i
  }, 650)
}
function stop() { clearInterval(timer); timer = null }
function pick(k) { stop(); key.value = k; active.value = new Set(); visited.value = new Set(); stepN.value = 0 }
onUnmounted(stop)

function path(e) {
  const a = pos.value[e[0]], b = pos.value[e[1]]
  const back = p.value.edges.some(f => f[0] === e[1] && f[1] === e[0])
  if (!back) return `M${a[1]},${a[2]} L${b[1]},${b[2]}`
  const dir = e[0] < e[1] ? -1 : 1, mx = (a[1] + b[1]) / 2, my = (a[2] + b[2]) / 2 + dir * 38
  return `M${a[1]},${a[2]} Q${mx},${my} ${b[1]},${b[2]}`
}
function labelPos(e) {
  const a = pos.value[e[0]], b = pos.value[e[1]]
  const back = p.value.edges.some(f => f[0] === e[1] && f[1] === e[0])
  const dir = e[0] < e[1] ? -1 : 1
  return [(a[1] + b[1]) / 2, (a[2] + b[2]) / 2 + (back ? dir * 22 : -6)]
}
const tipoColor = { flujo: '#2563eb', 'híbrido': '#7c3aed', agente: '#ea580c' }
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:10px">
    <div class="row">
      <button v-for="(v, k) in P" :key="k" :class="{ on: key === k }" @click="pick(k)">{{ v.nombre }}</button>
      <button @click="play" style="margin-left:12px">▶ Simular</button>
    </div>
    <div style="display:flex;gap:18px">
      <svg viewBox="-10 0 630 260" width="570" height="235" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px;flex-shrink:0">
        <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#64748b" /></marker>
          <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#ea580c" /></marker></defs>
        <g v-for="(e, i) in p.edges" :key="key + i">
          <path :d="path(e)" fill="none" :stroke="active.has(i) ? '#ea580c' : '#94a3b8'" :stroke-width="active.has(i) ? 4 : 2" :marker-end="active.has(i) ? 'url(#ar2)' : 'url(#ar)'" style="transition:all .2s" />
          <text v-if="e[2]" :x="labelPos(e)[0]" :y="labelPos(e)[1]" text-anchor="middle" style="font-size:11px" fill="#475569">{{ e[2] }}</text>
        </g>
        <g v-for="n in p.nodes" :key="key + n[0]">
          <rect :x="n[1] - 52" :y="n[2] - 17" width="104" height="34" rx="9" :fill="visited.has(n[0]) ? '#ffedd5' : '#f8fafc'" :stroke="visited.has(n[0]) ? '#ea580c' : '#475569'" stroke-width="1.6" />
          <text :x="n[1]" :y="n[2] + 5" text-anchor="middle" style="font-size:12.5px;font-weight:600" fill="#0f172a">{{ n[3] }}</text>
        </g>
        <text x="10" y="250" style="font-size:11px" fill="#64748b">paso {{ stepN }}</text>
      </svg>
      <div class="panel" style="max-width:300px;font-size:14px;gap:8px">
        <div><span class="v" :style="{ color: tipoColor[p.tipo] }">● {{ p.tipo === 'flujo' ? 'Flujo fijo (lo decide tu código)' : p.tipo === 'agente' ? 'Agente (lo decide el LLM)' : 'Híbrido (el LLM decide parte)' }}</span></div>
        <div>{{ p.desc }}</div>
        <div><b>Cuándo usarlo:</b> {{ p.cuando }}</div>
        <div><b>Ejemplo:</b> {{ p.ej }}</div>
        <div class="hint">Pulsa «Simular» varias veces: en enrutamiento, orquestador y agente el camino cambia cada vez.</div>
      </div>
    </div>
  </div>
</template>
