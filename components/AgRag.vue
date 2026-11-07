<script setup>
import { ref, computed } from 'vue'

// Base de conocimiento de ejemplo (inventada) sobre la escuela
const DOCS = [
  ['Horario', 'Las clases son de lunes a viernes de 8:00 a 12:00. Los sábados hay asesorías opcionales de 9:00 a 11:00.'],
  ['Certificado', 'Para obtener el certificado debes asistir al 80 % de las clases y entregar el proyecto final.'],
  ['Proyecto final', 'El proyecto final se hace en equipos de tres personas y se presenta el último día del curso.'],
  ['Notebooks', 'Los notebooks de práctica se abren en Google Colab; no necesitas instalar Python ni nada en tu computadora.'],
  ['Evaluación', 'La nota final vale 40 % ejercicios semanales, 20 % participación y 40 % proyecto final.'],
  ['kNN', 'En kNN (k vecinos más cercanos) siempre debes escalar las variables, porque el modelo usa distancias.'],
  ['Random Forest', 'Random Forest combina muchos árboles de decisión entrenados con muestras bootstrap y vota.'],
  ['Agentes', 'Un agente es un modelo de lenguaje que usa herramientas en un ciclo hasta cumplir una meta.'],
  ['Contacto', 'Para dudas administrativas escribe a la coordinación; responde en un máximo de dos días hábiles.'],
  ['Computadora', 'Si no tienes computadora, la escuela presta equipos durante el horario de clases.'],
]
const STOP0 = 'cuanto cuánto a al de del el en la las los lo un una y o que se es para por con no si mi tu su sus como hay me te le les ya este esta esto son del más muy qué cual cuál cuáles cómo cuándo dónde puedo debo tengo'
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const STOP = new Set(norm(STOP0).split(' '))
const tok = s => norm(s).replace(/[^a-z0-9ñ ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)).map(w => w.replace(/(es|s)$/, ''))

const docTok = DOCS.map(d => tok(d[0] + ' ' + d[1]))
const df = {}
docTok.forEach(t => new Set(t).forEach(w => (df[w] = (df[w] || 0) + 1)))
const idf = w => Math.log((DOCS.length + 1) / ((df[w] || 0) + 1)) + 1
function vec(t) { const v = {}; t.forEach(w => (v[w] = (v[w] || 0) + 1)); for (const w in v) v[w] *= idf(w); return v }
const docVec = docTok.map(vec)
function cos(a, b) {
  let d = 0, na = 0, nb = 0
  for (const w in a) { na += a[w] ** 2; if (b[w]) d += a[w] * b[w] }
  for (const w in b) nb += b[w] ** 2
  return na && nb ? d / Math.sqrt(na * nb) : 0
}

const consulta = ref('¿Qué necesito para el certificado?'), k = ref(2), umbral = ref(0.2)
const EJ = ['¿Qué necesito para el certificado?', '¿Cuánto vale el proyecto en la nota?', '¿Tengo que instalar Python?', '¿Hay clases los sábados?', '¿Por qué escalar en kNN?']
const ranking = computed(() => {
  const q = vec(tok(consulta.value))
  return DOCS.map((d, i) => ({ i, t: d[0], txt: d[1], s: cos(q, docVec[i]) })).sort((a, b) => b.s - a.s)
})
const top = computed(() => ranking.value.slice(0, k.value).filter(r => r.s >= umbral.value))
const palabras = computed(() => tok(consulta.value))
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:6px;width:380px">
      <label style="font-size:13px;font-weight:600">Pregunta
        <input v-model="consulta" style="border:1px solid #cbd5e1;border-radius:6px;padding:4px 8px;font-weight:400">
      </label>
      <div class="row"><button v-for="e in EJ" :key="e" style="font-size:11px;padding:1px 6px" @click="consulta = e">{{ e }}</button></div>
      <div class="hint">Palabras clave: <code>{{ palabras.join(' · ') || '—' }}</code></div>
      <div style="display:flex;flex-direction:column;gap:3px;margin-top:4px">
        <div v-for="(r, j) in ranking" :key="r.i" style="display:flex;align-items:center;gap:6px;font-size:12px" :style="{ opacity: j < k && r.s >= umbral ? 1 : 0.45 }">
          <span style="width:92px;font-weight:600">{{ r.t }}</span>
          <div style="flex:1;height:12px;background:#f1f5f9;border-radius:4px"><div :style="{ width: r.s * 100 + '%', background: j < k && r.s >= umbral ? '#ea580c' : '#94a3b8' }" style="height:12px;border-radius:4px;transition:width .3s" /></div>
          <span style="width:38px;font-family:ui-monospace,monospace">{{ r.s.toFixed(2) }}</span>
        </div>
      </div>
      <div style="display:flex;gap:12px">
        <label style="flex:1">Top-k: <span class="v">{{ k }}</span><input type="range" min="1" max="5" v-model.number="k"></label>
        <label style="flex:1">Similitud mínima: <span class="v">{{ umbral.toFixed(2) }}</span><input type="range" min="0" max="0.6" step="0.05" v-model.number="umbral"></label>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;width:420px">
      <b style="font-size:13px">Prompt que recibe el modelo</b>
      <pre style="font-size:11.5px;line-height:1.4;white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:10px;margin:0;height:300px;overflow:auto"><span style="color:#94a3b8">Responde usando SOLO el contexto. Si la respuesta no está, di que no lo sabes.</span>

<span style="color:#fdba74">### Contexto</span>
<template v-for="r in top" :key="r.i">[{{ r.t }}] {{ r.txt }}
</template><span v-if="!top.length" style="color:#fca5a5">(no se encontró nada relevante)</span>
<span style="color:#86efac">### Pregunta</span>
{{ consulta }}</pre>
      <div class="hint">Aquí la búsqueda usa TF-IDF (palabras en común). Los sistemas reales usan <b>embeddings</b>: vectores que capturan el significado, así «laptop» también encontraría el documento que habla de «computadora». Base de conocimiento inventada.</div>
    </div>
  </div>
</template>
