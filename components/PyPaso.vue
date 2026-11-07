<script setup>
import { ref, computed, watch } from 'vue'

// Programas con su ejecución paso a paso (estilo Python Tutor), escritos a mano.
// Cada paso: [línea que se acaba de ejecutar (1-based), variables globales, marco de función o null, salida]
const v = (valor, tipo) => ({ valor, tipo })
function programaIf(nota) {
  const code = [`nota = ${nota}`, 'if nota >= 9:', '    nivel = "excelente"', 'elif nota >= 6:', '    nivel = "aprobado"', 'else:', '    nivel = "reprobado"', 'print(nivel)']
  const g = { nota: v(String(nota), 'float') }
  const nivel = nota >= 9 ? 'excelente' : nota >= 6 ? 'aprobado' : 'reprobado'
  const pasos = [[1, { ...g }, null, []], [2, { ...g }, null, [], `¿${nota} >= 9? → ${nota >= 9 ? 'True' : 'False'}`]]
  if (nota >= 9) pasos.push([3, { ...g, nivel: v('"excelente"', 'str') }, null, []])
  else {
    pasos.push([4, { ...g }, null, [], `¿${nota} >= 6? → ${nota >= 6 ? 'True' : 'False'}`])
    if (nota >= 6) pasos.push([5, { ...g, nivel: v('"aprobado"', 'str') }, null, []])
    else pasos.push([7, { ...g, nivel: v('"reprobado"', 'str') }, null, []])
  }
  pasos.push([8, { ...g, nivel: v(`"${nivel}"`, 'str') }, null, [nivel]])
  return { code, pasos }
}
const PROG = {
  variables: {
    nombre: 'Variables y tipos',
    gen: () => {
      const code = ['nombre = "Ana"', 'horas = 6', 'asistencia = 0.95', 'aprobo = horas >= 5 and asistencia > 0.8', 'print(f"{nombre} aprobó: {aprobo}")']
      const a = { nombre: v('"Ana"', 'str') }, b = { ...a, horas: v('6', 'int') }, c = { ...b, asistencia: v('0.95', 'float') }, d = { ...c, aprobo: v('True', 'bool') }
      return { code, pasos: [[1, a, null, []], [2, b, null, []], [3, c, null, []], [4, d, null, [], '6 >= 5 → True; 0.95 > 0.8 → True; True and True → True'], [5, d, null, ['Ana aprobó: True']]] }
    },
  },
  ciclo: {
    nombre: 'Listas y ciclo for',
    gen: () => {
      const code = ['notas = [8.5, 9.0, 7.5]', 'total = 0', 'for nota in notas:', '    total = total + nota', 'promedio = total / len(notas)', 'print("Promedio:", promedio)']
      const L = v('[8.5, 9.0, 7.5]', 'list'), p = []
      p.push([1, { notas: L }, null, []]); p.push([2, { notas: L, total: v('0', 'int') }, null, []])
      let t = 0
      for (const n of [8.5, 9.0, 7.5]) {
        p.push([3, { notas: L, total: v(String(t), t ? 'float' : 'int'), nota: v(n.toFixed(1), 'float') }, null, [], `nota toma el siguiente valor: ${n.toFixed(1)}`])
        t += n
        p.push([4, { notas: L, total: v(t.toFixed(1), 'float'), nota: v(n.toFixed(1), 'float') }, null, []])
      }
      p.push([3, { notas: L, total: v('25.0', 'float'), nota: v('7.5', 'float') }, null, [], 'Ya no quedan elementos: el ciclo termina'])
      const fin = { notas: L, total: v('25.0', 'float'), nota: v('7.5', 'float'), promedio: v('8.333333333333334', 'float') }
      p.push([5, fin, null, [], 'len(notas) → 3; 25.0 / 3 → 8.333…'])
      p.push([6, fin, null, ['Promedio: 8.333333333333334']])
      return { code, pasos: p }
    },
  },
  condicion: { nombre: 'if / elif / else', gen: () => programaIf(nota.value) },
  funcion: {
    nombre: 'Funciones',
    gen: () => {
      const code = ['def promedio(lista):', '    total = sum(lista)', '    return total / len(lista)', '', 'notas_ana = [8, 9, 10]', 'p = promedio(notas_ana)', 'print(p)']
      const f = { promedio: v('función', 'function') }, g = { ...f, notas_ana: v('[8, 9, 10]', 'list') }
      return {
        code, pasos: [
          [1, f, null, [], 'Se define la función, pero todavía no se ejecuta'],
          [5, g, null, []],
          [6, g, { lista: v('[8, 9, 10]', 'list') }, [], 'Se llama a promedio(notas_ana): se crea un marco nuevo'],
          [2, g, { lista: v('[8, 9, 10]', 'list'), total: v('27', 'int') }, []],
          [3, g, { lista: v('[8, 9, 10]', 'list'), total: v('27', 'int') }, [], 'return 27 / 3 → 9.0; el marco de la función desaparece'],
          [6, { ...g, p: v('9.0', 'float') }, null, []],
          [7, { ...g, p: v('9.0', 'float') }, null, ['9.0']],
        ],
      }
    },
  },
  dict: {
    nombre: 'Diccionarios',
    gen: () => {
      const code = ['alumno = {"nombre": "Ana", "horas": 6}', 'alumno["asistencia"] = 95', 'alumno["horas"] = alumno["horas"] + 1', 'print(alumno["nombre"], alumno["horas"])', 'print(alumno)']
      const s1 = v('{"nombre": "Ana", "horas": 6}', 'dict'), s2 = v('{"nombre": "Ana", "horas": 6, "asistencia": 95}', 'dict'), s3 = v('{"nombre": "Ana", "horas": 7, "asistencia": 95}', 'dict')
      return { code, pasos: [[1, { alumno: s1 }, null, []], [2, { alumno: s2 }, null, [], 'Clave nueva → se agrega'], [3, { alumno: s3 }, null, [], 'Clave existente → se reemplaza el valor'], [4, { alumno: s3 }, null, ['Ana 7']], [5, { alumno: s3 }, null, ['Ana 7', "{'nombre': 'Ana', 'horas': 7, 'asistencia': 95}"]]] }
    },
  },
}
const props = defineProps({ start: { type: String, default: 'variables' } })
const prog = ref(props.start), nota = ref(7.8), i = ref(-1)
const P = computed(() => PROG[prog.value].gen())
const paso = computed(() => (i.value >= 0 ? P.value.pasos[i.value] : null))
const salida = computed(() => (paso.value ? paso.value[3] : []))
watch([prog, nota], () => (i.value = -1))
const COL = { int: '#2563eb', float: '#7c3aed', str: '#15803d', bool: '#ea580c', list: '#0f172a', dict: '#a16207', function: '#64748b' }
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:6px;width:430px">
      <div style="background:#0f172a;border-radius:10px;padding:10px 0;font-family:ui-monospace,monospace;font-size:14px">
        <div v-for="(l, k) in P.code" :key="prog + k" :style="{ background: paso && paso[0] === k + 1 ? '#7c2d12' : 'transparent' }" style="display:flex;gap:10px;padding:1px 10px;color:#e2e8f0;white-space:pre">
          <span style="color:#64748b;width:16px;text-align:right">{{ k + 1 }}</span><span>{{ l }}</span>
          <span v-if="paso && paso[0] === k + 1" style="margin-left:auto;color:#fdba74">◀</span>
        </div>
      </div>
      <div v-if="paso && paso[4]" style="font-size:12.5px;background:#fff7ed;border-left:4px solid #ea580c;padding:4px 10px;border-radius:6px">{{ paso[4] }}</div>
      <div style="font-size:12px;color:#64748b;font-weight:600">Salida (print)</div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;min-height:44px;padding:6px 10px;font-family:ui-monospace,monospace;font-size:13px">
        <div v-for="(o, k) in salida" :key="k">{{ o }}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;width:250px">
      <div style="font-size:12px;color:#64748b;font-weight:600">Variables en memoria</div>
      <div style="border:1px solid #cbd5e1;border-radius:8px;padding:6px 8px;min-height:80px">
        <div class="hint" style="margin-bottom:3px">Global</div>
        <div v-for="(val, k) in (paso ? paso[1] : {})" :key="k" style="display:flex;justify-content:space-between;gap:6px;font-family:ui-monospace,monospace;font-size:12.5px;border-top:1px solid #f1f5f9;padding:2px 0">
          <b>{{ k }}</b><span style="text-align:right;word-break:break-all">{{ val.valor }} <span :style="{ color: COL[val.tipo] }" style="font-size:10.5px">{{ val.tipo }}</span></span>
        </div>
      </div>
      <div v-if="paso && paso[2]" style="border:2px solid #7c3aed;border-radius:8px;padding:6px 8px">
        <div class="hint" style="margin-bottom:3px;color:#7c3aed">Marco de promedio()</div>
        <div v-for="(val, k) in paso[2]" :key="k" style="display:flex;justify-content:space-between;font-family:ui-monospace,monospace;font-size:12.5px;border-top:1px solid #f1f5f9;padding:2px 0">
          <b>{{ k }}</b><span>{{ val.valor }} <span :style="{ color: COL[val.tipo] }" style="font-size:10.5px">{{ val.tipo }}</span></span>
        </div>
      </div>
    </div>
    <div class="panel" style="min-width:190px;max-width:200px">
      <label>Programa
        <select v-model="prog"><option v-for="(p, k) in PROG" :key="k" :value="k">{{ p.nombre }}</option></select>
      </label>
      <label v-if="prog === 'condicion'">Valor de nota
        <select v-model.number="nota"><option :value="9.5">9.5</option><option :value="7.8">7.8</option><option :value="4.0">4.0</option></select>
      </label>
      <div class="row">
        <button @click="i = Math.max(-1, i - 1)" :disabled="i < 0">‹ Atrás</button>
        <button @click="i = Math.min(P.pasos.length - 1, i + 1)" :disabled="i >= P.pasos.length - 1">Siguiente ›</button>
      </div>
      <button @click="i = -1">↺ Reiniciar</button>
      <div class="stats"><span>Paso</span><b>{{ i + 1 }} / {{ P.pasos.length }}</b></div>
      <div class="hint">La línea marcada es la que se acaba de ejecutar. Mira cómo cambian las variables y su <b>tipo</b>.</div>
    </div>
  </div>
</template>
