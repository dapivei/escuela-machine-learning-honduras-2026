<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ set: { type: String, default: 'python' } })
const SETS = {
  python: [
    ['print(7 / 2)', ['3', '3.5', '4'], 1, 'La división / siempre da un float. Para la división entera se usa //: 7 // 2 → 3.'],
    ['print("7" + "2")', ['9', '72', 'Error'], 1, 'Con textos (str), + los pega. Para sumar números, primero conviértelos: int("7") + int("2").'],
    ['x = [10, 20, 30]\nprint(x[-1])', ['10', '30', 'Error'], 1, 'Los índices negativos cuentan desde el final: -1 es el último elemento.'],
    ['print(len("Honduras"))', ['7', '8', '9'], 1, 'len cuenta los caracteres: H-o-n-d-u-r-a-s son 8.'],
    ['nums = [1, 2, 3]\nnums.append(4)\nprint(nums[1\x3A3])', ['[1, 2, 3]', '[2, 3]', '[2, 3, 4]'], 1, 'append agrega al final → [1, 2, 3, 4]. La rebanada [1\x3A3] toma los índices 1 y 2 (el 3 no se incluye).'],
    ['edad = 17\nif edad >= 18:\n    print("adulto")\nelse:\n    print("menor")', ['adulto', 'menor', 'Nada'], 1, '17 >= 18 es False, así que se ejecuta el bloque del else.'],
    ['total = 0\nfor i in range(4):\n    total = total + i\nprint(total)', ['4', '6', '10'], 1, 'range(4) produce 0, 1, 2, 3 (el 4 no se incluye): 0 + 1 + 2 + 3 = 6.'],
    ['d = {"a": 1, "b": 2}\nprint(d["b"] * 10)', ['20', '2', 'Error'], 0, 'd["b"] busca el valor de la clave "b", que es 2; 2 * 10 = 20.'],
  ],
  pandas: [
    ['df.shape  # 14 filas, 6 columnas', ['(6, 14)', '(14, 6)', '84'], 1, 'shape es (filas, columnas).'],
    ['df["horas"]', ['Un DataFrame', 'Una Series', 'Una lista'], 1, 'Un solo par de corchetes con un nombre da una Series (una columna). Con doble corchete, df[["horas"]], da un DataFrame.'],
    ['df[df["horas"] > 5]', ['Las columnas mayores que 5', 'Las filas donde horas > 5', 'True o False'], 1, 'df["horas"] > 5 crea una Series de True/False; al ponerla dentro de df[...] se quedan solo las filas True.'],
    ['df.groupby("grupo")["calificacion"].mean()', ['La media de todo', 'Una media por grupo', 'La media por alumno'], 1, 'groupby divide las filas por grupo, aplica mean a cada parte y combina los resultados.'],
  ],
}
const Q = computed(() => SETS[props.set])
const i = ref(0), elegida = ref(null), puntos = ref(0), respondidas = ref(new Set())
function elegir(k) {
  if (elegida.value !== null) return
  elegida.value = k
  if (!respondidas.value.has(i.value) && k === Q.value[i.value][2]) puntos.value++
  respondidas.value.add(i.value)
}
function ir(d) { i.value = Math.min(Q.value.length - 1, Math.max(0, i.value + d)); elegida.value = null }
</script>

<template>
  <div class="demo" style="gap:22px">
    <div style="display:flex;flex-direction:column;gap:10px;width:520px">
      <div style="font-size:13px;color:#64748b;font-weight:600">Pregunta {{ i + 1 }} de {{ Q.length }} · ¿Qué resultado da?</div>
      <pre style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px 18px;font-size:17px;margin:0;min-height:80px">{{ Q[i][0] }}</pre>
      <div class="row">
        <button v-for="(o, k) in Q[i][1]" :key="k" @click="elegir(k)" style="font-size:16px;padding:6px 16px;font-family:ui-monospace,monospace"
          :style="{ background: elegida === null ? '' : k === Q[i][2] ? '#dcfce7' : k === elegida ? '#fee2e2' : '', borderColor: elegida !== null && k === Q[i][2] ? '#15803d' : '' }">{{ o }}</button>
      </div>
      <div v-if="elegida !== null" :style="{ borderColor: elegida === Q[i][2] ? '#15803d' : '#b91c1c' }" style="border-left:4px solid;background:#f8fafc;padding:8px 12px;border-radius:6px;font-size:14px">
        <b>{{ elegida === Q[i][2] ? '✅ ¡Correcto!' : '❌ Casi.' }}</b> {{ Q[i][3] }}
      </div>
    </div>
    <div class="panel" style="min-width:170px">
      <div class="row"><button @click="ir(-1)" :disabled="i === 0">‹</button><button @click="ir(1)" :disabled="i === Q.length - 1">Siguiente ›</button></div>
      <div class="stats"><span>Aciertos</span><b>{{ puntos }} / {{ respondidas.size }}</b></div>
      <div class="hint">Pide a la clase que vote antes de revelar la respuesta.</div>
    </div>
  </div>
</template>
