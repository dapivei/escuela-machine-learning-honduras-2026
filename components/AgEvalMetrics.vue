<script setup>
import { ref, computed } from 'vue'

// 10 tareas de atención a clientes (simuladas) con las herramientas esperadas
const TAREAS = [
  ['Reembolso del pedido 1042', ['buscar_pedido', 'verificar_politica', 'reembolsar']],
  ['Cambiar dirección de envío', ['buscar_pedido', 'actualizar_direccion']],
  ['¿Dónde está mi paquete?', ['buscar_pedido', 'rastrear_envio']],
  ['Cancelar suscripción', ['buscar_cliente', 'cancelar_suscripcion']],
  ['Producto llegó dañado', ['buscar_pedido', 'verificar_politica', 'crear_reclamo']],
  ['Actualizar correo', ['buscar_cliente', 'actualizar_correo']],
  ['Reembolso fuera de plazo (negar)', ['buscar_pedido', 'verificar_politica']],
  ['Consultar puntos', ['buscar_cliente', 'consultar_puntos']],
  ['Repetir pedido anterior', ['buscar_pedido', 'crear_pedido']],
  ['Quiero hablar con un humano', ['transferir_humano']],
]
// [llamadas, éxito, violó política]
const AGENTES = {
  A: { nombre: 'Agente A (rápido)', r: [
    [['buscar_pedido', 'reembolsar'], 1, 1], [['buscar_pedido', 'actualizar_direccion'], 1, 0], [['buscar_pedido', 'buscar_pedido', 'rastrear_envio'], 1, 0],
    [['buscar_cliente', 'cancelar_suscripcion'], 1, 0], [['buscar_pedido', 'crear_reclamo'], 1, 0], [['actualizar_correo'], 0, 0],
    [['buscar_pedido', 'verificar_politica', 'reembolsar'], 0, 1], [['buscar_cliente', 'consultar_puntos'], 1, 0], [['buscar_pedido', 'crear_pedido'], 1, 0], [['transferir_humano'], 1, 0]] },
  B: { nombre: 'Agente B (cuidadoso)', r: [
    [['buscar_pedido', 'verificar_politica', 'reembolsar'], 1, 0], [['buscar_cliente', 'buscar_pedido', 'actualizar_direccion'], 1, 0], [['buscar_pedido', 'rastrear_envio'], 1, 0],
    [['buscar_cliente', 'verificar_politica', 'cancelar_suscripcion'], 1, 0], [['buscar_pedido', 'verificar_politica', 'crear_reclamo'], 1, 0], [['buscar_cliente', 'actualizar_correo'], 1, 0],
    [['buscar_pedido', 'verificar_politica'], 1, 0], [['buscar_cliente', 'consultar_puntos'], 1, 0], [['buscar_pedido', 'verificar_politica', 'crear_pedido'], 0, 0], [['buscar_cliente', 'transferir_humano'], 1, 0]] },
}
const ag = ref('A')
const inter = (a, b) => { const c = [...b]; let n = 0; for (const x of a) { const i = c.indexOf(x); if (i >= 0) { n++; c.splice(i, 1) } } return n }
const m = computed(() => {
  const R = AGENTES[ag.value].r, n = R.length
  const ok = R.reduce((s, r) => s + r[1], 0), viol = R.reduce((s, r) => s + r[2], 0)
  const llamadas = R.reduce((s, r) => s + r[0].length, 0), esperadas = TAREAS.reduce((s, t) => s + t[1].length, 0)
  const aciertos = R.reduce((s, r, i) => s + inter(r[0], TAREAS[i][1]), 0)
  const exacta = R.filter((r, i) => r[0].join() === TAREAS[i][1].join()).length
  const ph = ok / n, z = 1.96
  const c = (ph + z * z / (2 * n)) / (1 + z * z / n), h = z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n)) / (1 + z * z / n)
  return { n, ok, viol, ph, lo: c - h, hi: c + h, prec: aciertos / llamadas, rec: aciertos / esperadas, exacta, pasos: llamadas / n, costo: (0.01 * n + 0.004 * llamadas) / n, lat: 1.2 + 1.5 * llamadas / n }
})

// Acuerdo juez LLM vs. humano
const HUM = [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1]
const juez = ref([1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1])
const kappa = computed(() => {
  const n = HUM.length, j = juez.value
  const po = HUM.filter((h, i) => h === j[i]).length / n
  const ph = HUM.reduce((a, b) => a + b, 0) / n, pj = j.reduce((a, b) => a + b, 0) / n
  const pe = ph * pj + (1 - ph) * (1 - pj)
  return { po, pe, k: pe === 1 ? 1 : (po - pe) / (1 - pe) }
})
const nivel = k => (k < 0.2 ? 'pobre' : k < 0.4 ? 'débil' : k < 0.6 ? 'moderado' : k < 0.8 ? 'bueno' : 'muy bueno')
const pct = v => (v * 100).toFixed(0) + ' %'
</script>

<template>
  <div class="demo" style="gap:16px">
    <div style="display:flex;flex-direction:column;gap:5px;width:590px">
      <div class="row"><button v-for="(v, k) in AGENTES" :key="k" :class="{ on: ag === k }" @click="ag = k">{{ v.nombre }}</button></div>
      <div style="display:grid;grid-template-columns:150px 1fr 34px;font-size:10px;line-height:1.2;column-gap:6px">
        <span style="color:#64748b">Tarea</span><span style="color:#64748b">Llamadas del agente</span><span style="color:#64748b">Éxito</span>
        <template v-for="(t, i) in TAREAS" :key="i">
          <span style="border-top:1px solid #e2e8f0;padding:2px 0">{{ t[0] }}</span>
          <span style="border-top:1px solid #e2e8f0;padding:2px 0;font-family:ui-monospace,monospace;font-size:9.5px">
            <span v-for="(c, j) in AGENTES[ag].r[i][0]" :key="j" :style="{ color: t[1].includes(c) ? '#0f172a' : '#b91c1c' }">{{ c }}{{ j < AGENTES[ag].r[i][0].length - 1 ? ' → ' : '' }}</span>
            <span v-if="AGENTES[ag].r[i][2]" style="color:#b91c1c"> ⚠ política</span>
          </span>
          <span style="border-top:1px solid #e2e8f0;padding:2px 0;text-align:center">{{ AGENTES[ag].r[i][1] ? '✅' : '❌' }}</span>
        </template>
      </div>
      <div class="stats" style="grid-template-columns:auto auto auto auto;font-size:11px;padding:5px 8px">
        <span>Tasa de éxito</span><b>{{ pct(m.ph) }}</b>
        <span>IC 95 %</span><b>{{ pct(m.lo) }}–{{ pct(m.hi) }}</b>
        <span>Precisión herram.</span><b>{{ pct(m.prec) }}</b>
        <span>Recall herram.</span><b>{{ pct(m.rec) }}</b>
        <span>Trayectoria exacta</span><b>{{ m.exacta }}/{{ m.n }}</b>
        <span>Violaciones</span><b :style="{ color: m.viol ? '#b91c1c' : '' }">{{ m.viol }}</b>
        <span>Pasos promedio</span><b>{{ m.pasos.toFixed(1) }}</b>
        <span>Costo / latencia</span><b>${{ m.costo.toFixed(3) }} · {{ m.lat.toFixed(1) }} s</b>
      </div>
    </div>
    <div class="panel" style="max-width:250px;min-width:240px">
      <b style="font-size:13px">¿Le creemos al juez LLM?</b>
      <div class="hint">12 respuestas calificadas por un humano y por un LLM juez (1 = buena). Haz clic en el juez para cambiar su voto.</div>
      <table style="font-size:12px;border-collapse:collapse;text-align:center">
        <tr><td style="text-align:left">Humano</td><td v-for="(h, i) in HUM" :key="i" style="width:17px">{{ h }}</td></tr>
        <tr><td style="text-align:left">Juez</td><td v-for="(j, i) in juez" :key="i" @click="juez[i] = 1 - j" :style="{ background: j === HUM[i] ? '#dcfce7' : '#fee2e2' }" style="cursor:pointer;border:1px solid #fff">{{ j }}</td></tr>
      </table>
      <div class="stats">
        <span>Acuerdo observado p<sub>o</sub></span><b>{{ kappa.po.toFixed(2) }}</b>
        <span>Acuerdo por azar p<sub>e</sub></span><b>{{ kappa.pe.toFixed(2) }}</b>
        <span>κ de Cohen</span><b>{{ kappa.k.toFixed(2) }} ({{ nivel(kappa.k) }})</b>
      </div>
      <div class="hint">κ = (p<sub>o</sub> − p<sub>e</sub>) / (1 − p<sub>e</sub>). Este juez es «generoso»: aprueba respuestas malas. Datos simulados.</div>
    </div>
  </div>
</template>
