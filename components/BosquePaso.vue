<script setup>
import { ref, computed } from 'vue'
import PlanoAlumnos from './PlanoAlumnos.vue'
import { ALUMNOS } from '../utils/alumnos.js'
import { buildTree, treePredict, rng } from '../utils/ml.js'

const CONSULTAS = [{ n: 'Ana', h: 6, a: 95 }, { n: 'Bruno', h: 5, a: 80 }, { n: 'Iris', h: 6.5, a: 68 }]
const q = ref(0), arboles = ref([]), seed = ref(1)
let R = rng(11)

function regla(node) {
  if (node.leaf) return node.p >= 0.5 ? 'todos aprueban' : 'nadie aprueba'
  return `¿${node.f === 'x' ? 'horas' : 'asistencia'} ≤ ${node.t}?`
}
function plantar(n = 1) {
  for (let k = 0; k < n; k++) {
    const idx = ALUMNOS.map(() => Math.floor(R() * ALUMNOS.length))
    const cuenta = ALUMNOS.map((_, i) => idx.filter(j => j === i).length)
    const t = buildTree(idx.map(i => ({ x: ALUMNOS[i].h, y: ALUMNOS[i].a, c: ALUMNOS[i].y })), { maxDepth: 2, randFeat: R })
    arboles.value.push({ id: arboles.value.length + 1, cuenta, t, raiz: regla(t) })
  }
}
function reiniciar() { R = rng(11 + seed.value * 97); arboles.value = [] }
const votos = computed(() => {
  const c = CONSULTAS[q.value]
  const v = arboles.value.map(a => treePredict(a.t, c.h, c.a))
  return { lista: v, si: v.filter(x => x >= 0.5).length, no: v.filter(x => x < 0.5).length }
})
const ultimo = computed(() => arboles.value[arboles.value.length - 1])
const fueraDeBolsa = computed(() => ultimo.value ? ultimo.value.cuenta.filter(c => c === 0).length : 0)
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <PlanoAlumnos :W="340" :H="260" :ana="CONSULTAS[q]" :atenuar="p => ultimo && ultimo.cuenta[ALUMNOS.indexOf(p)] === 0" :nombres="false" />
      <div v-if="ultimo" style="display:flex;flex-wrap:wrap;gap:3px;width:340px">
        <span v-for="(p, i) in ALUMNOS" :key="p.n" :style="{ background: ultimo.cuenta[i] ? (p.y ? '#ffedd5' : '#dbeafe') : '#f1f5f9', opacity: ultimo.cuenta[i] ? 1 : 0.5 }" style="font-size:10.5px;border-radius:5px;padding:1px 5px">{{ p.n }}<b v-if="ultimo.cuenta[i] > 1"> ×{{ ultimo.cuenta[i] }}</b></span>
      </div>
      <div v-if="ultimo" class="hint">Muestra bootstrap del árbol {{ ultimo.id }}: {{ fueraDeBolsa }} alumnos quedaron fuera (atenuados).</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;width:250px">
      <b style="font-size:13px">Árboles y su voto para {{ CONSULTAS[q].n }}</b>
      <div style="max-height:250px;overflow:auto;display:flex;flex-direction:column;gap:3px">
        <div v-for="(a, i) in arboles.slice().reverse()" :key="a.id" style="display:flex;justify-content:space-between;font-size:12px;background:#f8fafc;border-radius:6px;padding:2px 8px">
          <span>🌳 {{ a.id }} · <span class="hint">{{ a.raiz }}</span></span>
          <b :style="{ color: votos.lista[arboles.length - 1 - i] >= 0.5 ? '#ea580c' : '#2563eb' }">{{ votos.lista[arboles.length - 1 - i] >= 0.5 ? 'sí' : 'no' }}</b>
        </div>
        <div v-if="!arboles.length" class="hint">Todavía no hay árboles. Planta el primero.</div>
      </div>
    </div>
    <div class="panel" style="min-width:210px;max-width:220px">
      <label>¿A quién predecimos?
        <select v-model.number="q"><option v-for="(c, i) in CONSULTAS" :key="i" :value="i">{{ c.n }} ({{ c.h }} h, {{ c.a }} %)</option></select>
      </label>
      <div class="row">
        <button @click="plantar(1)">🌱 Plantar 1 árbol</button>
        <button @click="plantar(10)">+10</button>
        <button @click="seed++; reiniciar()">↺</button>
      </div>
      <div class="stats">
        <span class="dot1">Votos «aprueba»</span><b>{{ votos.si }}</b>
        <span class="dot0">Votos «no aprueba»</span><b>{{ votos.no }}</b>
      </div>
      <div v-if="arboles.length" style="display:flex;height:22px;border-radius:6px;overflow:hidden;border:1px solid #cbd5e1">
        <div :style="{ width: votos.si / arboles.length * 100 + '%' }" style="background:#ea580c" /><div style="flex:1;background:#2563eb" />
      </div>
      <div v-if="arboles.length" style="font-size:16px;font-weight:800" :style="{ color: votos.si > votos.no ? '#ea580c' : '#2563eb' }">El bosque dice: {{ votos.si > votos.no ? 'aprueba' : votos.si === votos.no ? 'empate' : 'no aprueba' }}</div>
      <div class="hint">Cada árbol ve una muestra distinta de alumnos y, en cada corte, una variable al azar. Por eso se equivocan en cosas distintas. Bruno e Iris son casos difíciles. Datos inventados.</div>
    </div>
  </div>
</template>
