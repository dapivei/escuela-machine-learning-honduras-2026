<script setup>
import { ref, computed, watch } from 'vue'
import { DF, NUM, media } from '../utils/datos_curso.js'

const fase = ref(0), col = ref('calificacion'), fn = ref('mean')
const FN = { mean: media, sum: xs => xs.reduce((a, b) => a + b, 0), max: xs => Math.max(...xs), count: xs => xs.length }
const NOMBRE = { mean: 'promedio', sum: 'suma', max: 'máximo', count: 'cuántos' }
const grupos = computed(() => ['A', 'B'].map(g => { const filas = DF.filter(r => r.grupo === g); const xs = filas.map(r => r[col.value]).filter(x => x !== null); return { g, filas, res: FN[fn.value](xs) } }))
watch([col, fn], () => { if (fase.value > 1) fase.value = 1 })
const COL = { A: ['#dbeafe', '#2563eb'], B: ['#ffedd5', '#ea580c'] }
const f = v => (Number.isInteger(v) ? v : v.toFixed(2))
const FASES = ['Tabla original', '1 · Dividir', '2 · Aplicar', '3 · Combinar']
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:10px">
    <div style="display:flex;gap:10px;align-items:center">
      <code style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:6px 12px;font-size:15px">df.groupby("grupo")["{{ col }}"].{{ fn }}()</code>
      <select v-model="col"><option v-for="c in NUM" :key="c">{{ c }}</option></select>
      <select v-model="fn"><option v-for="(t, k) in NOMBRE" :key="k" :value="k">{{ k }}</option></select>
      <button @click="fase = Math.min(3, fase + 1)" :disabled="fase === 3">{{ fase < 3 ? FASES[fase + 1] + ' ›' : '✓' }}</button>
      <button @click="fase = 0">↺</button>
    </div>
    <div style="display:flex;gap:18px;align-items:flex-start;min-height:330px">
      <div v-if="fase === 0" style="display:grid;grid-template-columns:70px 50px 70px;font-family:ui-monospace,monospace;font-size:12px">
        <b>nombre</b><b>grupo</b><b style="text-align:right">{{ col }}</b>
        <template v-for="r in DF" :key="r.nombre">
          <span :style="{ background: COL[r.grupo][0] }">{{ r.nombre }}</span><span :style="{ background: COL[r.grupo][0] }">{{ r.grupo }}</span><span :style="{ background: COL[r.grupo][0] }" style="text-align:right">{{ r[col] ?? 'NaN' }}</span>
        </template>
      </div>
      <template v-else>
        <div v-for="G in grupos" :key="G.g" style="display:flex;flex-direction:column;gap:6px;align-items:center">
          <div :style="{ borderColor: COL[G.g][1] }" style="border:2px solid;border-radius:10px;padding:6px 10px;display:grid;grid-template-columns:70px 70px;font-family:ui-monospace,monospace;font-size:12px">
            <b style="grid-column:span 2;text-align:center" :style="{ color: COL[G.g][1] }">grupo {{ G.g }}</b>
            <template v-for="r in G.filas" :key="r.nombre"><span>{{ r.nombre }}</span><span style="text-align:right">{{ r[col] ?? 'NaN' }}</span></template>
          </div>
          <div v-if="fase >= 2" :style="{ background: COL[G.g][0], borderColor: COL[G.g][1] }" style="border:2px solid;border-radius:8px;padding:4px 12px;font-size:14px">{{ NOMBRE[fn] }} = <b>{{ f(G.res) }}</b></div>
        </div>
        <div v-if="fase === 3" style="align-self:center;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:26px;color:#64748b">→</div>
          <div style="display:grid;grid-template-columns:60px 90px;font-family:ui-monospace,monospace;font-size:14px;border:2px solid #0f172a;border-radius:8px;padding:6px 10px">
            <b>grupo</b><b style="text-align:right">{{ col }}</b>
            <template v-for="G in grupos" :key="G.g"><span>{{ G.g }}</span><span style="text-align:right">{{ f(G.res) }}</span></template>
          </div>
        </div>
      </template>
      <div class="hint" style="max-width:220px;align-self:center">
        <b>Dividir</b>: separar las filas según el valor de «grupo».<br><b>Aplicar</b>: calcular algo en cada parte.<br><b>Combinar</b>: juntar los resultados en una tabla nueva.<br><br>pandas ignora los NaN al calcular (mira a Mario).
      </div>
    </div>
  </div>
</template>
