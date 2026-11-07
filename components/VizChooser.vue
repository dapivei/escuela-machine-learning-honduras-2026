<script setup>
import { ref, computed, watch } from 'vue'
import { DF, SEMANAS, PROM_A, PROM_B, calificaciones, cuantil, media } from '../utils/datos_curso.js'

const W = 390, H = 260, L = 70, R = 15, T = 20, B = 34
const CAL = calificaciones()
const AZ = '#2563eb', NA = '#ea580c'

const PREG = {
  comparar: {
    q: 'Comparar categorías: ¿qué calificación tuvo cada alumno?', bien: 'barh', mal: 'pie',
    porque: 'Barras ordenadas: la longitud es fácil de comparar.', porqueMal: 'Con 14 porciones nadie puede comparar ángulos.',
    code: 'df = df.sort_values("calificacion")\nplt.barh(df["nombre"], df["calificacion"])\nplt.xlabel("Calificación")',
    sns: 'sns.barplot(data=df, y="nombre", x="calificacion",\n            order=df.sort_values("calificacion")["nombre"])',
  },
  tendencia: {
    q: 'Tendencia en el tiempo: ¿cómo cambió el promedio por semana?', bien: 'line', mal: 'pieTiempo',
    porque: 'Líneas: el eje x es el tiempo y se ve la dirección del cambio.', porqueMal: 'Un pastel pierde el orden del tiempo.',
    code: 'plt.plot(semanas, prom_A, marker="o", label="Grupo A")\nplt.plot(semanas, prom_B, marker="o", label="Grupo B")\nplt.xlabel("Semana"); plt.legend()',
    sns: 'sns.lineplot(data=df_semanas, x="semana", y="promedio",\n             hue="grupo", marker="o")',
  },
  distribucion: {
    q: 'Distribución: ¿cómo se reparten las calificaciones de 200 alumnos?', bien: 'hist', mal: 'indice',
    porque: 'Histograma: muestra dónde se concentran los valores (aquí, dos grupos).', porqueMal: 'Graficar los valores en el orden de la tabla no dice nada.',
    code: 'plt.hist(calificaciones, bins=20)\nplt.xlabel("Calificación"); plt.ylabel("Número de alumnos")',
    sns: 'sns.histplot(calificaciones, bins=20)',
  },
  relacion: {
    q: 'Relación: ¿más horas de estudio, mejor calificación?', bien: 'scatter', mal: 'lineaMal',
    porque: 'Dispersión: cada punto es un alumno; se ve la tendencia.', porqueMal: 'Unir los puntos en el orden de la tabla inventa un patrón que no existe.',
    code: 'plt.scatter(df["horas"], df["calificacion"])\nplt.xlabel("Horas de estudio"); plt.ylabel("Calificación")',
    sns: 'sns.scatterplot(data=df, x="horas", y="calificacion", hue="grupo")',
  },
  grupos: {
    q: 'Comparar distribuciones: ¿el grupo A y el B se reparten distinto?', bien: 'box', mal: 'barMedia',
    porque: 'Diagramas de caja: mediana, dispersión y valores extremos de cada grupo.', porqueMal: 'Solo el promedio esconde cuánto varían las calificaciones.',
    code: 'df.boxplot(column="calificacion", by="grupo")',
    sns: 'sns.boxplot(data=df, x="grupo", y="calificacion")\nsns.stripplot(data=df, x="grupo", y="calificacion", color="k")',
  },
}
const k = ref('comparar'), malo = ref(false), lib = ref('mpl')
watch(k, () => (malo.value = false))
const P = computed(() => PREG[k.value])
const tipo = computed(() => (malo.value ? P.value.mal : P.value.bien))

const sorted = [...DF].sort((a, b) => a.calificacion - b.calificacion)
const sx = (v, a, b) => L + (v - a) / (b - a) * (W - L - R)
const sy = (v, a, b) => H - B - (v - a) / (b - a) * (H - T - B)
function pie(vals, cols) {
  const tot = vals.reduce((a, b) => a + b, 0); let a0 = -Math.PI / 2; const cx = W / 2, cy = (H - 10) / 2, r = 105
  return vals.map((v, i) => { const a1 = a0 + v / tot * 2 * Math.PI, d = `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`; a0 = a1; return { d, c: cols[i % cols.length] } })
}
const PAL = ['#2563eb', '#ea580c', '#15803d', '#7c3aed', '#ca8a04', '#0891b2', '#db2777', '#64748b']
const hist = computed(() => { const b = new Array(20).fill(0); CAL.forEach(v => b[Math.min(19, Math.floor(v / 0.5))]++); return b })
const box = g => { const xs = DF.filter(r => r.grupo === g).map(r => r.calificacion); return { xs, q1: cuantil(xs, .25), q2: cuantil(xs, .5), q3: cuantil(xs, .75), lo: Math.min(...xs), hi: Math.max(...xs), m: media(xs) } }
const BX = { A: box('A'), B: box('B') }
const path = ys => ys.map((y, i) => `${i ? 'L' : 'M'}${sx(i + 1, 0.5, 8.5)},${sy(y, 5, 8.5)}`).join('')
</script>

<template>
  <div class="demo" style="gap:16px">
    <div class="panel" style="width:200px">
      <b style="font-size:13px">¿Qué pregunta quieres responder?</b>
      <button v-for="(p, key) in PREG" :key="key" :class="{ on: k === key }" @click="k = key" style="text-align:left;font-size:12px">{{ p.q.split(':')[0] }}</button>
      <button @click="malo = !malo" :style="{ background: malo ? '#fee2e2' : '' }" style="margin-top:6px">{{ malo ? '✅ Ver la gráfica adecuada' : '❌ Ver una mala elección' }}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="font-size:13.5px;font-weight:600">{{ P.q }}</div>
      <svg :width="W" :height="H" style="background:#fff;border:1px solid #cbd5e1;border-radius:10px">
        <template v-if="tipo === 'barh'">
          <template v-for="(r, i) in sorted" :key="r.nombre">
            <rect :x="L" :y="T + i * 15.5" :width="sx(r.calificacion, 0, 10) - L" height="12" :fill="AZ" />
            <text :x="L - 4" :y="T + i * 15.5 + 10" text-anchor="end" style="font-size:10px">{{ r.nombre }}</text>
          </template>
          <text v-for="t in [0, 5, 10]" :key="t" :x="sx(t, 0, 10)" :y="H - 12" text-anchor="middle" style="font-size:10px" fill="#64748b">{{ t }}</text>
        </template>
        <template v-if="tipo === 'pie'">
          <path v-for="(s, i) in pie(DF.map(r => r.calificacion), PAL)" :key="i" :d="s.d" :fill="s.c" stroke="#fff" />
        </template>
        <template v-if="tipo === 'line'">
          <line v-for="v in [5, 6, 7, 8]" :key="v" :x1="L" :x2="W - R" :y1="sy(v, 5, 8.5)" :y2="sy(v, 5, 8.5)" stroke="#f1f5f9" />
          <text v-for="v in [5, 6, 7, 8]" :key="'t' + v" :x="L - 6" :y="sy(v, 5, 8.5) + 4" text-anchor="end" style="font-size:10px" fill="#64748b">{{ v }}</text>
          <path :d="path(PROM_A)" fill="none" :stroke="AZ" stroke-width="2.5" /><path :d="path(PROM_B)" fill="none" :stroke="NA" stroke-width="2.5" />
          <circle v-for="(y, i) in PROM_A" :key="'a' + i" :cx="sx(i + 1, 0.5, 8.5)" :cy="sy(y, 5, 8.5)" r="3.5" :fill="AZ" />
          <circle v-for="(y, i) in PROM_B" :key="'b' + i" :cx="sx(i + 1, 0.5, 8.5)" :cy="sy(y, 5, 8.5)" r="3.5" :fill="NA" />
          <text v-for="s in SEMANAS" :key="'s' + s" :x="sx(s, 0.5, 8.5)" :y="H - 16" text-anchor="middle" style="font-size:10px" fill="#64748b">{{ s }}</text>
          <text :x="(L + W) / 2" :y="H - 3" text-anchor="middle" style="font-size:10px" fill="#64748b">semana</text>
          <text :x="W - 70" :y="T + 6" style="font-size:11px" :fill="AZ">— Grupo A</text><text :x="W - 70" :y="T + 20" style="font-size:11px" :fill="NA">— Grupo B</text>
        </template>
        <template v-if="tipo === 'pieTiempo'">
          <path v-for="(s, i) in pie(PROM_A, PAL)" :key="i" :d="s.d" :fill="s.c" stroke="#fff" />
        </template>
        <template v-if="tipo === 'hist'">
          <rect v-for="(c, i) in hist" :key="i" :x="sx(i * 0.5, 0, 10)" :y="sy(c, 0, 30)" :width="sx(0.5, 0, 10) - L - 1" :height="sy(0, 0, 30) - sy(c, 0, 30)" :fill="AZ" />
          <text v-for="t in [0, 2, 4, 6, 8, 10]" :key="t" :x="sx(t, 0, 10)" :y="H - 16" text-anchor="middle" style="font-size:10px" fill="#64748b">{{ t }}</text>
          <text :x="(L + W) / 2" :y="H - 3" text-anchor="middle" style="font-size:10px" fill="#64748b">calificación</text>
        </template>
        <template v-if="tipo === 'indice'">
          <path :d="CAL.map((v, i) => `${i ? 'L' : 'M'}${sx(i, 0, 199)},${sy(v, 0, 10)}`).join('')" fill="none" :stroke="AZ" stroke-width="1" />
          <text :x="(L + W) / 2" :y="H - 3" text-anchor="middle" style="font-size:10px" fill="#64748b">número de fila</text>
        </template>
        <template v-if="tipo === 'scatter' || tipo === 'lineaMal'">
          <path v-if="tipo === 'lineaMal'" :d="DF.map((r, i) => `${i ? 'L' : 'M'}${sx(r.horas, 0, 10)},${sy(r.calificacion, 3, 10)}`).join('')" fill="none" :stroke="AZ" stroke-width="1.5" />
          <circle v-for="r in DF" :key="r.nombre" :cx="sx(r.horas, 0, 10)" :cy="sy(r.calificacion, 3, 10)" r="5" :fill="tipo === 'scatter' ? (r.grupo === 'A' ? AZ : NA) : AZ" />
          <text v-for="t in [0, 2, 4, 6, 8, 10]" :key="t" :x="sx(t, 0, 10)" :y="H - 16" text-anchor="middle" style="font-size:10px" fill="#64748b">{{ t }}</text>
          <text v-for="v in [4, 6, 8, 10]" :key="'v' + v" :x="L - 6" :y="sy(v, 3, 10) + 4" text-anchor="end" style="font-size:10px" fill="#64748b">{{ v }}</text>
          <text :x="(L + W) / 2" :y="H - 3" text-anchor="middle" style="font-size:10px" fill="#64748b">horas de estudio</text>
        </template>
        <template v-if="tipo === 'box'">
          <g v-for="(g, i) in ['A', 'B']" :key="g">
            <line :x1="140 + i * 160" :x2="140 + i * 160" :y1="sy(BX[g].lo, 3, 10)" :y2="sy(BX[g].hi, 3, 10)" stroke="#334155" />
            <rect :x="110 + i * 160" :y="sy(BX[g].q3, 3, 10)" width="60" :height="sy(BX[g].q1, 3, 10) - sy(BX[g].q3, 3, 10)" :fill="i ? '#ffedd5' : '#dbeafe'" stroke="#334155" />
            <line :x1="110 + i * 160" :x2="170 + i * 160" :y1="sy(BX[g].q2, 3, 10)" :y2="sy(BX[g].q2, 3, 10)" stroke="#0f172a" stroke-width="2.5" />
            <circle v-for="(x, j) in BX[g].xs" :key="j" :cx="128 + i * 160 + (j % 4) * 8" :cy="sy(x, 3, 10)" r="3" fill="#0f172a" opacity="0.6" />
            <text :x="140 + i * 160" :y="H - 12" text-anchor="middle" style="font-size:12px">Grupo {{ g }}</text>
          </g>
          <text v-for="v in [4, 6, 8, 10]" :key="'v' + v" :x="L - 6" :y="sy(v, 3, 10) + 4" text-anchor="end" style="font-size:10px" fill="#64748b">{{ v }}</text>
        </template>
        <template v-if="tipo === 'barMedia'">
          <g v-for="(g, i) in ['A', 'B']" :key="g">
            <rect :x="110 + i * 160" :y="sy(BX[g].m, 0, 10)" width="60" :height="sy(0, 0, 10) - sy(BX[g].m, 0, 10)" :fill="i ? NA : AZ" />
            <text :x="140 + i * 160" :y="sy(BX[g].m, 0, 10) - 5" text-anchor="middle" style="font-size:12px">{{ BX[g].m.toFixed(2) }}</text>
            <text :x="140 + i * 160" :y="H - 12" text-anchor="middle" style="font-size:12px">Grupo {{ g }}</text>
          </g>
        </template>
      </svg>
      <div :style="{ color: malo ? '#b91c1c' : '#15803d' }" style="font-size:13px;font-weight:600">{{ malo ? '❌ ' + P.porqueMal : '✅ ' + P.porque }}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;width:290px">
      <div class="row"><button :class="{ on: lib === 'mpl' }" @click="lib = 'mpl'">matplotlib</button><button :class="{ on: lib === 'sns' }" @click="lib = 'sns'">seaborn</button></div>
      <pre style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:8px 10px;font-size:10.5px;margin:0;white-space:pre-wrap">{{ lib === 'mpl' ? 'import matplotlib.pyplot as plt\n\n' + P.code + '\nplt.show()' : 'import seaborn as sns\n\n' + P.sns }}</pre>
      <div class="hint">Datos inventados.</div>
    </div>
  </div>
</template>
