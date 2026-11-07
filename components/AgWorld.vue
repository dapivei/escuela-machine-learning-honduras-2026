<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { rng } from '../utils/ml.js'

const N = 8, CELL = 38, BAT = 30
const tipo = ref('reflejo'), seed = ref(1)
const TIPOS = {
  reflejo: ['Reflejo simple', 'Regla «si veo suciedad, limpio; si no, me muevo al azar». Solo ve su celda y no recuerda nada.'],
  modelo: ['Basado en modelo', 'Guarda un mapa interno de dónde ya estuvo y prefiere celdas que no ha visitado.'],
  metas: ['Basado en metas', 'Tiene una meta («no queda suciedad»), ve todo el mapa y planea la ruta más corta a la suciedad más cercana.'],
  utilidad: ['Basado en utilidad', 'Como el de metas, pero compara opciones: vale la pena ir solo si llega con batería, y regresa a cargar a tiempo.'],
}

const st = ref(null), playing = ref(false)
let timer = null, R = rng(1)

function init() {
  stop(); R = rng(seed.value * 31 + 7)
  const dirt = new Set()
  while (dirt.size < 14) { const x = Math.floor(R() * N), y = Math.floor(R() * N); if (x + y > 0) dirt.add(x + ',' + y) }
  st.value = { x: 0, y: 0, bat: BAT, dirt, limpias: 0, pasos: 0, visit: new Set(['0,0']), estado: 'trabajando' }
}
const MOV = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const dentro = (x, y) => x >= 0 && y >= 0 && x < N && y < N
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])

function haciaObjetivo(s, tx, ty) {
  if (s.x !== tx) return [Math.sign(tx - s.x), 0]
  return [0, Math.sign(ty - s.y)]
}

function decidir(s) {
  const aqui = s.x + ',' + s.y
  if (tipo.value !== 'utilidad' && s.dirt.has(aqui)) return 'limpiar'
  if (tipo.value === 'reflejo') {
    const op = MOV.filter(([dx, dy]) => dentro(s.x + dx, s.y + dy)); return op[Math.floor(R() * op.length)]
  }
  if (tipo.value === 'modelo') {
    const op = MOV.filter(([dx, dy]) => dentro(s.x + dx, s.y + dy))
    const nuevas = op.filter(([dx, dy]) => !s.visit.has((s.x + dx) + ',' + (s.y + dy)))
    const l = nuevas.length ? nuevas : op; return l[Math.floor(R() * l.length)]
  }
  const sucias = [...s.dirt].map(k => k.split(',').map(Number))
  if (tipo.value === 'metas') {
    if (!sucias.length) return 'fin'
    sucias.sort((a, b) => dist(a, [s.x, s.y]) - dist(b, [s.x, s.y])); return haciaObjetivo(s, ...sucias[0])
  }
  // utilidad: limpiar vale +15, cada paso cuesta 1; nunca quedarse sin batería
  const dCarga = s.x + s.y
  if (s.dirt.has(aqui) && s.bat - 1 >= dCarga) return 'limpiar'
  let mejor = null, mejorU = 0
  for (const d of sucias) {
    const ida = dist(d, [s.x, s.y]), vuelta = d[0] + d[1]
    if (ida + 1 + vuelta > s.bat) continue // no alcanzaría a regresar a cargar
    const u = 15 - ida
    if (u > mejorU) { mejorU = u; mejor = d }
  }
  if (mejor) return haciaObjetivo(s, ...mejor)
  if (!sucias.length) return dCarga === 0 ? 'fin' : haciaObjetivo(s, 0, 0)
  if (dCarga === 0) return s.bat < BAT ? 'cargar' : 'fin'
  return haciaObjetivo(s, 0, 0)
}

function paso() {
  const s = st.value
  if (s.estado !== 'trabajando') return stop()
  if (s.bat <= 0) { s.estado = 'sin batería 🪫'; return stop() }
  const d = decidir(s)
  if (d === 'fin') { s.estado = s.dirt.size ? 'se detuvo' : '¡todo limpio! ✅'; return stop() }
  if (d === 'cargar') { s.bat = BAT; s.pasos++; return }
  if (d === 'limpiar') { s.dirt.delete(s.x + ',' + s.y); s.limpias++ }
  else { s.x += d[0]; s.y += d[1]; s.visit.add(s.x + ',' + s.y) }
  s.bat--; s.pasos++
  if (s.x === 0 && s.y === 0) s.bat = BAT // la base recarga
  if (!s.dirt.size && tipo.value !== 'utilidad') { s.estado = '¡todo limpio! ✅'; stop() }
  if (s.pasos >= 300) { s.estado = 'límite de 300 pasos'; stop() }
}
function play() { if (playing.value) return stop(); playing.value = true; timer = setInterval(paso, 110) }
function stop() { playing.value = false; clearInterval(timer) }
const utilidad = computed(() => st.value ? st.value.limpias * 15 - st.value.pasos : 0)
init()
watch([tipo, seed], init)
onUnmounted(stop)
</script>

<template>
  <div class="demo">
    <svg :width="N * CELL" :height="N * CELL" style="border:1px solid #cbd5e1;border-radius:10px;background:#fff">
      <template v-for="y in N" :key="'r' + y">
        <rect v-for="x in N" :key="x + '-' + y" :x="(x - 1) * CELL" :y="(y - 1) * CELL" :width="CELL" :height="CELL"
          :fill="st.dirt.has((x - 1) + ',' + (y - 1)) ? '#a16207' : (tipo === 'modelo' && st.visit.has((x - 1) + ',' + (y - 1))) ? '#eef2ff' : '#ffffff'"
          :fill-opacity="st.dirt.has((x - 1) + ',' + (y - 1)) ? 0.55 : 1" stroke="#e2e8f0" />
      </template>
      <rect x="2" y="2" :width="CELL - 4" :height="CELL - 4" fill="none" stroke="#15803d" stroke-width="2.5" rx="6" />
      <text x="5" y="14" style="font-size:9px" fill="#15803d">base</text>
      <circle :cx="st.x * CELL + CELL / 2" :cy="st.y * CELL + CELL / 2" r="13" fill="#ea580c" stroke="#fff" stroke-width="2" style="transition:all .1s" />
      <text :x="st.x * CELL + CELL / 2" :y="st.y * CELL + CELL / 2 + 5" text-anchor="middle" style="font-size:14px">🤖</text>
    </svg>
    <div class="panel" style="max-width:300px">
      <div class="row">
        <button v-for="(v, k) in TIPOS" :key="k" :class="{ on: tipo === k }" @click="tipo = k">{{ v[0] }}</button>
      </div>
      <div style="font-size:13px">{{ TIPOS[tipo][1] }}</div>
      <div class="row">
        <button @click="play">{{ playing ? '⏸ Pausa' : '▶ Play' }}</button>
        <button @click="paso">Paso</button>
        <button @click="init">↺</button>
        <button @click="seed++">🎲 Nuevo mapa</button>
      </div>
      <div class="stats">
        <span>Pasos</span><b>{{ st.pasos }}</b>
        <span>Limpiadas</span><b>{{ st.limpias }} / 14</b>
        <span>Batería</span><b>{{ st.bat }} / {{ BAT }}</b>
        <span>Utilidad (15·limpias − pasos)</span><b>{{ utilidad }}</b>
        <span>Estado</span><b>{{ st.estado }}</b>
      </div>
      <div class="hint">La base (verde) recarga la batería. Compara pasos y utilidad entre los cuatro tipos con el mismo mapa.</div>
    </div>
  </div>
</template>
