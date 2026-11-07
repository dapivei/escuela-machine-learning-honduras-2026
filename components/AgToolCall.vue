<script setup>
import { ref, computed, watch } from 'vue'

// Herramientas con esquema claro (buena interfaz agente-computadora)
const BUENAS = [
  { name: 'calculadora', description: 'Evalúa una expresión aritmética con + - * / y paréntesis. Ej.: "340 * 0.15".',
    parameters: { type: 'object', properties: { expresion: { type: 'string', description: 'Expresión a evaluar' } }, required: ['expresion'] } },
  { name: 'consultar_alumnos', description: 'Cuenta alumnos de un grupo. Úsala para preguntas sobre cuántos alumnos cumplen algo.',
    parameters: { type: 'object', properties: { grupo: { type: 'string', enum: ['A', 'B', 'C'] }, aprobo: { type: 'boolean' } }, required: ['grupo'] } },
  { name: 'clima', description: 'Pronóstico para una ciudad de Honduras. dia: "hoy" o "mañana".',
    parameters: { type: 'object', properties: { ciudad: { type: 'string' }, dia: { type: 'string', enum: ['hoy', 'mañana'] } }, required: ['ciudad', 'dia'] } },
]
// Las mismas herramientas con nombres y descripciones pobres
const MALAS = [
  { name: 'f1', description: 'calc', parameters: { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] } },
  { name: 'f2', description: 'db', parameters: { type: 'object', properties: { g: { type: 'string' }, x: { type: 'boolean' } }, required: ['g'] } },
  { name: 'f3', description: 'w', parameters: { type: 'object', properties: { c: { type: 'string' }, d: { type: 'string' } }, required: ['c', 'd'] } },
]

const PREG = [
  { q: '¿Cuánto es el 15 % de propina sobre 340 lempiras?', buena: { name: 'calculadora', arguments: { expresion: '340 * 0.15' } }, mala: { name: 'f2', arguments: { g: '340 * 0.15' } } },
  { q: '¿Cuántos alumnos del grupo B aprobaron?', buena: { name: 'consultar_alumnos', arguments: { grupo: 'B', aprobo: true } }, mala: { name: 'f3', arguments: { c: 'B', d: 'aprobados' } } },
  { q: '¿Va a llover mañana en San Pedro Sula?', buena: { name: 'clima', arguments: { ciudad: 'San Pedro Sula', dia: 'mañana' } }, mala: { name: 'f1', arguments: { a: 'San Pedro Sula mañana' } } },
]

const iq = ref(0), malo = ref(false)
const herramientas = computed(() => (malo.value ? MALAS : BUENAS))
const texto = ref(''), resultado = ref(null)
function cargar() { texto.value = JSON.stringify(PREG[iq.value][malo.value ? 'mala' : 'buena'], null, 2); resultado.value = null }
cargar()
watch([iq, malo], cargar)

// "Tu código" ejecuta la herramienta: el modelo solo propone el JSON
function ejecutar() {
  let call
  try { call = JSON.parse(texto.value) } catch (e) { return (resultado.value = { ok: false, msg: 'JSON inválido: ' + e.message }) }
  const t = herramientas.value.find(h => h.name === call.name)
  if (!t) return (resultado.value = { ok: false, msg: `No existe la herramienta "${call.name}". Disponibles: ${herramientas.value.map(h => h.name).join(', ')}` })
  const args = call.arguments || {}, sch = t.parameters
  for (const r of sch.required) if (!(r in args)) return (resultado.value = { ok: false, msg: `Falta el parámetro obligatorio "${r}".` })
  for (const [k, v] of Object.entries(args)) {
    const p = sch.properties[k]
    if (!p) return (resultado.value = { ok: false, msg: `Parámetro desconocido "${k}". Válidos: ${Object.keys(sch.properties).join(', ')}` })
    if (p.type === 'boolean' && typeof v !== 'boolean') return (resultado.value = { ok: false, msg: `"${k}" debe ser true o false, no ${JSON.stringify(v)}.` })
    if (p.type === 'string' && typeof v !== 'string') return (resultado.value = { ok: false, msg: `"${k}" debe ser texto.` })
    if (p.enum && !p.enum.includes(v)) return (resultado.value = { ok: false, msg: `"${k}" debe ser uno de: ${p.enum.join(', ')}.` })
  }
  // Resultados simulados
  const n = call.name
  if (n === 'calculadora' || n === 'f1') {
    const e = String(args.expresion ?? args.a)
    if (!/^[\d\s+\-*/().]+$/.test(e)) return (resultado.value = { ok: false, msg: `La expresión "${e}" tiene caracteres no permitidos (solo números y + - * / ( )).` })
    let v; try { v = Function('"use strict";return (' + e + ')')() } catch { return (resultado.value = { ok: false, msg: 'Expresión mal formada.' }) }
    return (resultado.value = { ok: true, msg: String(Math.round(v * 1000) / 1000), resp: `El resultado es ${Math.round(v * 1000) / 1000}.` })
  }
  if (n === 'consultar_alumnos' || n === 'f2') {
    const g = args.grupo ?? args.g
    if (!['A', 'B', 'C'].includes(g)) return (resultado.value = { ok: false, msg: `No existe el grupo "${g}".` })
    const tot = { A: 31, B: 28, C: 25 }[g], ap = { A: 22, B: 17, C: 19 }[g]
    const a = args.aprobo ?? args.x
    const c = a === undefined ? tot : a ? ap : tot - ap
    return (resultado.value = { ok: true, msg: `{"grupo": "${g}", "conteo": ${c}}`, resp: `En el grupo ${g} hay ${c} alumnos${a === undefined ? '' : a ? ' que aprobaron' : ' que no aprobaron'}.` })
  }
  const dia = args.dia ?? args.d
  if (!['hoy', 'mañana'].includes(dia)) return (resultado.value = { ok: false, msg: `Valor de día no reconocido: "${dia}".` })
  const ciudad = args.ciudad ?? args.c
  const pl = { hoy: 0.2, mañana: 0.4 }[dia]
  return (resultado.value = { ok: true, msg: `{"ciudad": "${ciudad}", "prob_lluvia": ${pl}}`, resp: `${dia === 'hoy' ? 'Hoy' : 'Mañana'} hay ${pl * 100} % de probabilidad de lluvia en ${ciudad}.` })
}
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:6px;width:300px">
      <div class="row" style="align-items:center">
        <b style="font-size:13px">Herramientas que ve el modelo</b>
        <button :class="{ on: malo }" @click="malo = !malo" style="margin-left:auto">{{ malo ? 'Esquema pobre' : 'Esquema claro' }}</button>
      </div>
      <pre style="font-size:10.5px;line-height:1.3;height:330px;overflow:auto;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:8px;margin:0">{{ JSON.stringify(herramientas, null, 1) }}</pre>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;width:330px">
      <label style="font-size:13px;font-weight:600">1 · Pregunta del usuario
        <select v-model.number="iq"><option v-for="(p, i) in PREG" :key="i" :value="i">{{ p.q }}</option></select>
      </label>
      <div style="font-size:13px;font-weight:600">2 · El modelo genera esta llamada (puedes editarla)</div>
      <textarea v-model="texto" spellcheck="false" style="font-family:ui-monospace,monospace;font-size:12px;height:130px;border:1px solid #cbd5e1;border-radius:8px;padding:6px" />
      <button @click="ejecutar" style="align-self:flex-start">3 · Tu código valida y ejecuta ▶</button>
      <div v-if="resultado" :style="{ background: resultado.ok ? '#f0fdf4' : '#fef2f2', borderLeft: '4px solid ' + (resultado.ok ? '#15803d' : '#b91c1c') }" style="padding:6px 10px;border-radius:6px;font-size:12.5px">
        <b>{{ resultado.ok ? 'Resultado:' : 'Error devuelto al modelo:' }}</b> <span style="font-family:ui-monospace,monospace">{{ resultado.msg }}</span>
        <div v-if="resultado.ok" style="margin-top:4px"><b>4 · Respuesta final:</b> {{ resultado.resp }}</div>
      </div>
    </div>
    <div class="panel" style="max-width:200px;font-size:12.5px">
      <div class="hint" style="font-size:12.5px">El modelo <b>no ejecuta nada</b>: solo escribe JSON. Tu programa decide si lo ejecuta.</div>
      <div class="hint" style="font-size:12.5px">Cambia a «Esquema pobre»: con nombres como <code>f1</code> y descripciones vagas, el modelo elige mal la herramienta.</div>
      <div class="hint" style="font-size:12.5px">Prueba romper el JSON: quita un parámetro, pon <code>"grupo": "Z"</code> o <code>"aprobo": "sí"</code>. Un buen error le dice al modelo cómo corregirse.</div>
      <div class="hint">Resultados simulados.</div>
    </div>
  </div>
</template>
