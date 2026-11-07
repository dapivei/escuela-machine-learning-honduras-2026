<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps({ start: { type: String, default: 'clima' } })
const esc = ref(props.start)
const maxPasos = ref(8), detector = ref(true)

// Datos simulados: ningún modelo real se está ejecutando.
const ESC = {
  clima: {
    nombre: 'Clima y conversión',
    tarea: '¿Necesito paraguas mañana en Tegucigalpa? Dame también la máxima en °F.',
    pasos: () => [
      ['t', 'Necesito el pronóstico de mañana. Uso la herramienta del clima.'],
      ['a', 'clima({"ciudad": "Tegucigalpa", "dia": "mañana"})'],
      ['o', '{"max_c": 27, "prob_lluvia": 0.7}'],
      ['t', 'Hay 70 % de probabilidad de lluvia: conviene paraguas. Ahora convierto 27 °C a °F.'],
      ['a', 'calculadora({"expresion": "27 * 9 / 5 + 32"})'],
      ['o', '80.6'],
      ['t', 'Ya tengo todo lo necesario. Respondo.'],
      ['r', 'Sí, lleva paraguas: hay 70 % de probabilidad de lluvia. La máxima será de 27 °C (80.6 °F).'],
    ],
  },
  error: {
    nombre: 'Error de herramienta',
    tarea: '¿Cuál es el promedio de Ana Martínez en el curso?',
    pasos: () => [
      ['t', 'Busco a la alumna en la base de datos.'],
      ['a', 'buscar_alumno({"nombre": "Ana"})'],
      ['o', 'ERROR: el campo "nombre" no existe. Usa "nombre_completo" (ej. "Ana Martínez").'],
      ['t', 'El mensaje de error me dice exactamente qué corregir. Reintento con el campo correcto.'],
      ['a', 'buscar_alumno({"nombre_completo": "Ana Martínez"})'],
      ['o', '{"id": 214, "calificaciones": [8.5, 9.0, 7.5]}'],
      ['t', 'Promedio = (8.5 + 9.0 + 7.5) / 3 = 8.33'],
      ['r', 'El promedio de Ana Martínez es 8.33.'],
    ],
  },
  bucle: {
    nombre: 'Atascado en un bucle',
    tarea: 'Encuentra el horario de la clase del sábado.',
    pasos: () => {
      const s = []
      let rep = 0
      while (true) {
        s.push(['t', rep === 0 ? 'Busco el horario en la web.' : 'No encontré nada útil. Lo intento otra vez con la misma búsqueda.'])
        s.push(['a', 'buscar_web({"consulta": "horario clase sábado"})'])
        s.push(['o', '[] (sin resultados)'])
        rep++
        if (detector.value && rep >= 3) {
          s.push(['g', '🛑 Detector: la misma acción se repitió 3 veces con el mismo resultado. El agente se detiene.'])
          s.push(['r', 'No encontré el horario en la web. ¿Me compartes el documento del curso o el correo del coordinador?'])
          break
        }
        if (Math.ceil(s.length / 3) >= maxPasos.value) {
          s.push(['g', `⛔ Se alcanzó el límite de ${maxPasos.value} pasos sin resolver la tarea. Se gastaron tokens sin avanzar.`])
          break
        }
      }
      return s
    },
  },
}

const visibles = ref(0)
const pasos = computed(() => ESC[esc.value].pasos())
const tokens = computed(() => 120 + pasos.value.slice(0, visibles.value).reduce((s, p) => s + Math.ceil(p[1].length / 4) + 8, 0))
const nAcciones = computed(() => pasos.value.slice(0, visibles.value).filter(p => p[0] === 'a').length)
const fin = computed(() => visibles.value >= pasos.value.length)
const lista = ref(null)
let timer = null

function sig() { if (!fin.value) visibles.value++; nextTick(() => { if (lista.value) lista.value.scrollTop = 1e6 }) }
function auto() { if (timer) return parar(); timer = setInterval(() => { if (fin.value) return parar(); sig() }, 900) }
function parar() { clearInterval(timer); timer = null }
function reiniciar() { parar(); visibles.value = 0 }
watch([esc, detector, maxPasos], reiniciar)
onUnmounted(parar)

const ETQ = { t: ['Pensamiento', '#7c3aed', '#f5f3ff'], a: ['Acción', '#ea580c', '#fff7ed'], o: ['Observación', '#2563eb', '#eff6ff'], r: ['Respuesta', '#15803d', '#f0fdf4'], g: ['Control', '#b91c1c', '#fef2f2'] }
</script>

<template>
  <div class="demo">
    <div style="display:flex;flex-direction:column;gap:8px;width:600px">
      <div style="background:#0f172a;color:#f8fafc;border-radius:10px;padding:8px 12px;font-size:14px"><b>Tarea:</b> {{ ESC[esc].tarea }}</div>
      <div ref="lista" style="height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px">
        <div v-for="(p, i) in pasos.slice(0, visibles)" :key="esc + i" :style="{ background: ETQ[p[0]][2], borderLeft: '4px solid ' + ETQ[p[0]][1] }" style="padding:5px 10px;border-radius:6px;font-size:13px">
          <b :style="{ color: ETQ[p[0]][1] }">{{ ETQ[p[0]][0] }}</b>
          <span :style="{ fontFamily: p[0] === 'a' || p[0] === 'o' ? 'ui-monospace, monospace' : 'inherit' }"> {{ p[1] }}</span>
        </div>
        <div v-if="!visibles" class="hint" style="padding:20px">Pulsa «Siguiente» para ver el primer paso del ciclo Pensar → Actuar → Observar.</div>
      </div>
    </div>
    <div class="panel">
      <label>Escenario
        <select v-model="esc"><option v-for="(v, k) in ESC" :key="k" :value="k">{{ v.nombre }}</option></select>
      </label>
      <div class="row">
        <button @click="sig" :disabled="fin">Siguiente ›</button>
        <button @click="auto">{{ timer ? '⏸' : '▶ Auto' }}</button>
        <button @click="reiniciar">↺</button>
      </div>
      <template v-if="esc === 'bucle'">
        <button :class="{ on: detector }" @click="detector = !detector">Detector de repeticiones</button>
        <label>Límite de pasos: <span class="v">{{ maxPasos }}</span><input type="range" min="3" max="15" v-model.number="maxPasos"></label>
      </template>
      <div class="stats">
        <span>Llamadas a herramientas</span><b>{{ nAcciones }}</b>
        <span>Contexto aprox.</span><b>{{ tokens }} tokens</b>
        <span>Estado</span><b>{{ fin ? 'terminado' : visibles ? 'en curso' : 'listo' }}</b>
      </div>
      <div class="hint">Cada observación se agrega al contexto: el agente «recuerda» lo que pasó leyendo su propia historia. Datos simulados, sin un modelo real.</div>
    </div>
  </div>
</template>
