<script setup>
import { ref, computed, watch } from 'vue'
import { DF, COLS, NUM, fmt, cuantil, media, desv } from '../utils/datos_curso.js'

const OPS = {
  head: 'Ver las primeras filas', shape: 'Tamaño de la tabla', info: 'Tipos y valores faltantes', describe: 'Resumen estadístico',
  cols: 'Seleccionar columnas', filtro: 'Filtrar filas', orden: 'Ordenar', nueva: 'Crear una columna',
  conteo: 'Contar valores', grupo: 'Agrupar y resumir', faltantes: 'Rellenar faltantes',
}
const op = ref('head'), n = ref(5), cols = ref(['nombre', 'calificacion']), fcol = ref('horas'), fop = ref('>'), fval = ref(5)
watch(fcol, c => (fval.value = c === 'horas' ? 5 : c === 'asistencia' ? 80 : 6))
const ocol = ref('calificacion'), asc = ref(false), gcol = ref('calificacion'), gfun = ref('mean'), ccol = ref('grupo')

const tabla = (filas, columnas = COLS, idx = null) => ({ tipo: 'tabla', columnas, filas: filas.map((r, i) => ({ i: idx ? idx[i] : DF.indexOf(r), v: columnas.map(c => r[c]) })) })
const r = computed(() => {
  switch (op.value) {
    case 'head': return { code: `df.head(${n.value})`, ...tabla(DF.slice(0, n.value)) }
    case 'shape': return { code: 'df.shape', tipo: 'texto', texto: `(${DF.length}, ${COLS.length})` }
    case 'info': {
      const t = { nombre: 'object', grupo: 'object', horas: 'int64', asistencia: 'float64', calificacion: 'float64', aprobo: 'bool' }
      const lineas = [`<class 'pandas.core.frame.DataFrame'>`, `RangeIndex: ${DF.length} entries, 0 to ${DF.length - 1}`, 'Data columns (total 6 columns):', ' #  Column        Non-Null Count  Dtype']
      COLS.forEach((c, i) => lineas.push(` ${i}  ${c.padEnd(13)} ${String(DF.filter(r => r[c] !== null).length).padStart(2)} non-null      ${t[c]}`))
      return { code: 'df.info()', tipo: 'texto', texto: lineas.join('\n') }
    }
    case 'describe': {
      const filas = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map(e => {
        const o = {}
        NUM.forEach(c => { const xs = DF.map(r => r[c]).filter(x => x !== null); o[c] = { count: xs.length, mean: media(xs), std: desv(xs), min: Math.min(...xs), '25%': cuantil(xs, .25), '50%': cuantil(xs, .5), '75%': cuantil(xs, .75), max: Math.max(...xs) }[e] })
        return o
      })
      return { code: 'df.describe()', ...tabla(filas, NUM, ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']), redondear: true }
    }
    case 'cols': {
      const c = cols.value.length ? cols.value : ['nombre']
      return { code: c.length === 1 ? `df["${c[0]}"]   # una Series` : `df[[${c.map(x => `"${x}"`).join(', ')}]]`, ...tabla(DF, c) }
    }
    case 'filtro': {
      const f = { '>': (a, b) => a > b, '>=': (a, b) => a >= b, '<': (a, b) => a < b, '==': (a, b) => a === b }[fop.value]
      return { code: `df[df["${fcol.value}"] ${fop.value} ${fval.value}]`, ...tabla(DF.filter(r => r[fcol.value] !== null && f(r[fcol.value], fval.value))) }
    }
    case 'orden': {
      const s = [...DF].sort((a, b) => (a[ocol.value] ?? Infinity) - (b[ocol.value] ?? Infinity)); if (!asc.value) s.reverse()
      return { code: `df.sort_values("${ocol.value}", ascending=${asc.value ? 'True' : 'False'})`, ...tabla(s) }
    }
    case 'nueva': {
      const filas = DF.map(r => ({ ...r, horas_mes: r.horas * 4 }))
      return { code: 'df["horas_mes"] = df["horas"] * 4\ndf[["nombre", "horas", "horas_mes"]]', ...tabla(filas, ['nombre', 'horas', 'horas_mes']) }
    }
    case 'conteo': {
      const c = {}; DF.forEach(r => (c[r[ccol.value]] = (c[r[ccol.value]] || 0) + 1))
      const ks = Object.keys(c).sort((a, b) => c[b] - c[a])
      return { code: `df["${ccol.value}"].value_counts()`, tipo: 'tabla', columnas: ['count'], filas: ks.map(k => ({ i: k === 'true' ? 'True' : k === 'false' ? 'False' : k, v: [c[k]] })) }
    }
    case 'grupo': {
      const fn = { mean: media, sum: xs => xs.reduce((a, b) => a + b, 0), max: xs => Math.max(...xs), count: xs => xs.length }[gfun.value]
      const gs = ['A', 'B'].map(g => ({ i: g, v: [fn(DF.filter(r => r.grupo === g && r[gcol.value] !== null).map(r => r[gcol.value]))] }))
      return { code: `df.groupby("grupo")["${gcol.value}"].${gfun.value}()`, tipo: 'tabla', columnas: [gcol.value], filas: gs, redondear: true }
    }
    case 'faltantes': {
      const m = media(DF.map(r => r.asistencia).filter(x => x !== null))
      return { code: `df["asistencia"].isna().sum()   # → 1\ndf["asistencia"] = df["asistencia"].fillna(df["asistencia"].mean())`, ...tabla(DF.map(r => ({ ...r, asistencia: r.asistencia ?? m })), ['nombre', 'asistencia']), resaltar: 10 }
    }
  }
})
const celda = (v, red) => (red && typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(6) : fmt(v))
</script>

<template>
  <div class="demo" style="gap:14px">
    <div class="panel" style="min-width:210px;max-width:220px;gap:7px">
      <label>¿Qué quieres hacer?
        <select v-model="op"><option v-for="(t, k) in OPS" :key="k" :value="k">{{ t }}</option></select>
      </label>
      <label v-if="op === 'head'">n: <span class="v">{{ n }}</span><input type="range" min="1" max="14" v-model.number="n"></label>
      <div v-if="op === 'cols'" style="display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12.5px">
        <label v-for="c in COLS" :key="c" style="flex-direction:row;gap:3px;font-weight:400"><input type="checkbox" :value="c" v-model="cols">{{ c }}</label>
      </div>
      <template v-if="op === 'filtro'">
        <select v-model="fcol"><option v-for="c in NUM" :key="c">{{ c }}</option></select>
        <select v-model="fop"><option v-for="o in ['>', '>=', '<', '==']" :key="o">{{ o }}</option></select>
        <label>valor: <span class="v">{{ fval }}</span><input type="range" :min="fcol === 'horas' ? 0 : fcol === 'asistencia' ? 50 : 0" :max="fcol === 'horas' ? 10 : fcol === 'asistencia' ? 100 : 10" :step="fcol === 'asistencia' ? 5 : fcol === 'horas' ? 1 : 0.5" v-model.number="fval"></label>
      </template>
      <template v-if="op === 'orden'">
        <select v-model="ocol"><option v-for="c in NUM" :key="c">{{ c }}</option></select>
        <button :class="{ on: asc }" @click="asc = !asc">{{ asc ? 'Ascendente' : 'Descendente' }}</button>
      </template>
      <template v-if="op === 'grupo'">
        <select v-model="gcol"><option v-for="c in NUM" :key="c">{{ c }}</option></select>
        <select v-model="gfun"><option v-for="f in ['mean', 'sum', 'max', 'count']" :key="f">{{ f }}</option></select>
      </template>
      <select v-if="op === 'conteo'" v-model="ccol"><option>grupo</option><option>aprobo</option></select>
      <div class="hint">Datos inventados de 14 alumnos. Mario tiene la asistencia vacía (NaN) a propósito.</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;width:600px">
      <pre style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:8px 14px;font-size:14px;margin:0">{{ r.code }}</pre>
      <pre v-if="r.tipo === 'texto'" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:12.5px;margin:0">{{ r.texto }}</pre>
      <div v-else style="max-height:330px;overflow:auto;border:1px solid #e2e8f0;border-radius:8px">
        <div :style="{ gridTemplateColumns: `52px repeat(${r.columnas.length}, minmax(70px, 1fr))` }" style="display:grid;font-family:ui-monospace,monospace;font-size:12px">
          <span style="position:sticky;top:0;background:#f1f5f9;padding:3px 6px"></span>
          <b v-for="c in r.columnas" :key="c" style="position:sticky;top:0;background:#f1f5f9;padding:3px 6px;text-align:right">{{ c }}</b>
          <template v-for="(f, k) in r.filas" :key="k">
            <b style="padding:2px 6px;color:#64748b;border-top:1px solid #f1f5f9">{{ f.i }}</b>
            <span v-for="(x, j) in f.v" :key="j" :style="{ background: r.resaltar === f.i ? '#fef3c7' : '', color: x === null ? '#b91c1c' : '' }" style="padding:2px 6px;text-align:right;border-top:1px solid #f1f5f9">{{ celda(x, r.redondear) }}</span>
          </template>
        </div>
      </div>
      <div v-if="r.tipo === 'tabla'" class="hint">{{ r.filas.length }} filas × {{ r.columnas.length }} columnas</div>
    </div>
  </div>
</template>
