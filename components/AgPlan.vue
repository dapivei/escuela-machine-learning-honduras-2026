<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// Meta: «Preparar un reporte sobre deserción escolar»
const BASE = [
  { id: 'datos', t: 'Descargar datos', x: 70, y: 60, dep: [] },
  { id: 'lit', t: 'Buscar estudios', x: 70, y: 200, dep: [] },
  { id: 'limpiar', t: 'Limpiar datos', x: 215, y: 60, dep: ['datos'] },
  { id: 'desc', t: 'Estadística descriptiva', x: 370, y: 25, dep: ['limpiar'] },
  { id: 'modelo', t: 'Entrenar modelo', x: 370, y: 105, dep: ['limpiar'] },
  { id: 'graf', t: 'Gráficas', x: 520, y: 60, dep: ['desc', 'modelo'] },
  { id: 'redactar', t: 'Redactar reporte', x: 520, y: 200, dep: ['graf', 'lit'] },
  { id: 'revision', t: 'Revisión humana', x: 666, y: 200, dep: ['redactar'] },
]
const falla = ref(false), nodes = ref([]), estado = ref({}), tick = ref(0), log = ref([]), playing = ref(false)
let timer = null

function reset() {
  stop(); nodes.value = BASE.map(n => ({ ...n, dep: [...n.dep] })); tick.value = 0; log.value = []
  estado.value = Object.fromEntries(BASE.map(n => [n.id, 'pendiente']))
}
function paso() {
  const ns = nodes.value, e = estado.value
  // lo que estaba en curso termina
  for (const n of ns) if (e[n.id] === 'en curso') {
    if (n.id === 'modelo' && falla.value && !ns.some(m => m.id === 'simple')) {
      e[n.id] = 'falló'
      log.value.push(`t${tick.value}: ❌ «Entrenar modelo» falló (datos insuficientes). Replanifico.`)
      ns.push({ id: 'simple', t: 'Modelo más simple', x: 370, y: 175, dep: ['limpiar'] })
      e.simple = 'pendiente'
      ns.find(m => m.id === 'graf').dep = ['desc', 'simple']
    } else e[n.id] = 'hecho'
  }
  const listos = ns.filter(n => e[n.id] === 'pendiente' && n.dep.every(d => e[d] === 'hecho'))
  listos.forEach(n => (e[n.id] = 'en curso'))
  if (listos.length) log.value.push(`t${tick.value + 1}: en paralelo → ${listos.map(n => n.t).join(', ')}`)
  tick.value++
  if (ns.every(n => ['hecho', 'falló'].includes(e[n.id]))) { log.value.push('✅ Meta cumplida.'); stop() }
}
function play() { if (playing.value) return stop(); playing.value = true; timer = setInterval(paso, 800) }
function stop() { playing.value = false; clearInterval(timer) }
const pos = computed(() => Object.fromEntries(nodes.value.map(n => [n.id, n])))
const COL = { pendiente: ['#f8fafc', '#94a3b8'], 'en curso': ['#ffedd5', '#ea580c'], hecho: ['#dcfce7', '#15803d'], 'falló': ['#fee2e2', '#b91c1c'] }
const hechos = computed(() => Object.values(estado.value).filter(s => s === 'hecho').length)
reset()
watch(falla, reset)
onUnmounted(stop)
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:8px">
    <svg width="740" height="250" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
      <defs><marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#64748b" /></marker></defs>
      <template v-for="n in nodes" :key="'e' + n.id">
        <line v-for="d in n.dep" :key="d + n.id" :x1="pos[d].x + 68" :y1="pos[d].y" :x2="n.x - 68" :y2="n.y" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#pa)" />
      </template>
      <g v-for="n in nodes" :key="n.id">
        <rect :x="n.x - 68" :y="n.y - 18" width="136" height="36" rx="8" :fill="COL[estado[n.id]][0]" :stroke="COL[estado[n.id]][1]" stroke-width="2" style="transition:all .3s" />
        <text :x="n.x" :y="n.y + 4" text-anchor="middle" style="font-size:11.5px;font-weight:600" fill="#0f172a">{{ n.t }}</text>
      </g>
    </svg>
    <div style="display:flex;gap:16px">
      <div class="panel" style="min-width:250px">
        <div class="row">
          <button @click="play">{{ playing ? '⏸' : '▶ Ejecutar plan' }}</button>
          <button @click="paso">Paso</button>
          <button @click="reset">↺</button>
        </div>
        <button :class="{ on: falla }" @click="falla = !falla">Simular falla en «Entrenar modelo»</button>
        <div class="stats"><span>Turnos de tiempo</span><b>{{ tick }}</b><span>Tareas hechas</span><b>{{ hechos }} / {{ nodes.length }}</b></div>
      </div>
      <div style="font-size:12px;font-family:ui-monospace,monospace;background:#f8fafc;border-radius:8px;padding:8px;height:110px;overflow:auto;width:440px">
        <div v-for="(l, i) in log" :key="i">{{ l }}</div>
        <div v-if="!log.length" class="hint">Un DAG dice qué depende de qué. Las tareas sin dependencias pendientes pueden correr en paralelo.</div>
      </div>
    </div>
  </div>
</template>
