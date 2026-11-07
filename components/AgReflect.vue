<script setup>
import { ref, computed, watch } from 'vue'

const TESTS = [
  ['promedio([8, 9, 10])', '9.0'],
  ['promedio([7])', '7.0'],
  ['promedio([])', 'None'],
  ['promedio([8, "9", 10])', 'error claro'],
]
// Versiones que propone el generador (escritas a mano para ilustrar)
const V = [
  { code: 'def promedio(xs):\n    return sum(xs) / len(xs)', pasa: [1, 1, 0, 0],
    critica: 'Falla con lista vacía: ZeroDivisionError. Y con un texto "9" lanza un TypeError confuso.' },
  { code: 'def promedio(xs):\n    if len(xs) == 0:\n        return None\n    return sum(xs) / len(xs)', pasa: [1, 1, 1, 0],
    critica: 'La lista vacía ya funciona. Falta validar que todos sean números y dar un mensaje claro.' },
  { code: 'def promedio(xs):\n    if len(xs) == 0:\n        return None\n    if not all(isinstance(x, (int, float)) for x in xs):\n        raise TypeError("promedio: todos deben ser números")\n    return sum(xs) / len(xs)', pasa: [1, 1, 1, 1],
    critica: 'Todas las pruebas pasan. ✅ Se cumple el criterio de parada.' },
]
const maxIter = ref(3), it = ref(0), fase = ref('gen') // gen → eval
const fin = computed(() => (it.value === V.length - 1 && fase.value === 'eval') || (it.value === maxIter.value - 1 && fase.value === 'eval'))
const exito = computed(() => fase.value === 'eval' && V[it.value].pasa.every(Boolean))
function sig() {
  if (fin.value) return
  if (fase.value === 'gen') fase.value = 'eval'
  else { it.value++; fase.value = 'gen' }
}
function reiniciar() { it.value = 0; fase.value = 'gen' }
watch(maxIter, reiniciar)
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:8px;width:420px">
      <div style="font-size:13px"><b>Tarea:</b> escribe <code>promedio(xs)</code> en Python que pase estas pruebas.</div>
      <div style="display:flex;gap:6px;align-items:center;font-size:12px">
        <span v-for="i in V.length" :key="i" :style="{ background: i - 1 === it ? '#7c3aed' : i - 1 < it ? '#ddd6fe' : '#f1f5f9', color: i - 1 === it ? '#fff' : '#334155' }" style="padding:2px 10px;border-radius:12px;font-weight:700">v{{ i }}</span>
        <span class="hint">· iteración {{ it + 1 }} de máx. {{ maxIter }}</span>
      </div>
      <pre style="font-size:12.5px;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:10px;margin:0;min-height:150px"><span style="color:#c4b5fd"># Generador · versión {{ it + 1 }}</span>
{{ V[it].code }}</pre>
      <div v-if="fase === 'eval'" :style="{ background: exito ? '#f0fdf4' : '#fff7ed', borderLeft: '4px solid ' + (exito ? '#15803d' : '#ea580c') }" style="padding:6px 10px;border-radius:6px;font-size:13px">
        <b>Evaluador:</b> {{ V[it].critica }}
      </div>
      <div v-if="fin && !exito" style="color:#b91c1c;font-weight:700;font-size:13px">⛔ Se alcanzó el máximo de iteraciones con pruebas fallando: hay que avisar a un humano.</div>
    </div>
    <div class="panel">
      <table style="font-size:12px;border-collapse:collapse">
        <tr><th style="text-align:left">Prueba</th><th>Esperado</th><th>v{{ it + 1 }}</th></tr>
        <tr v-for="(t, j) in TESTS" :key="j">
          <td style="font-family:ui-monospace,monospace">{{ t[0] }}</td><td style="text-align:center">{{ t[1] }}</td>
          <td style="text-align:center;font-size:15px">{{ fase === 'eval' ? (V[it].pasa[j] ? '✅' : '❌') : '·' }}</td>
        </tr>
      </table>
      <div class="row">
        <button @click="sig" :disabled="fin">{{ fase === 'gen' ? 'Evaluar ›' : 'Corregir ›' }}</button>
        <button @click="reiniciar">↺</button>
      </div>
      <label>Máximo de iteraciones: <span class="v">{{ maxIter }}</span><input type="range" min="1" max="3" v-model.number="maxIter"></label>
      <div class="hint">El ciclo funciona porque hay un <b>criterio claro</b> (las pruebas). Sin criterio, el evaluador puede aprobar cualquier cosa. Pon el máximo en 2 y mira qué pasa.</div>
    </div>
  </div>
</template>
