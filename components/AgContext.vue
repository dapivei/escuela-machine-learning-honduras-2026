<script setup>
import { ref, computed } from 'vue'

const ventana = ref(32000), turnos = ref(20), nHerr = ref(8), docs = ref(4), estrategia = ref('todo')
const TURNO = 900, SISTEMA = 1500, POR_HERR = 350, POR_DOC = 800, RESUMEN = 1200, PREGUNTA = 150
const ESTR = {
  todo: ['Guardar todo', 'Se manda la conversación completa en cada llamada.'],
  ventana: ['Ventana deslizante', 'Solo se mandan los turnos más recientes que caben; los viejos se olvidan.'],
  resumen: ['Resumir lo viejo', 'Los turnos viejos se reemplazan por un resumen corto; los recientes van completos.'],
}

const r = computed(() => {
  const fijo = SISTEMA + nHerr.value * POR_HERR + docs.value * POR_DOC + PREGUNTA
  const hist = turnos.value * TURNO
  let usados = hist, olvidados = 0, resumen = 0
  if (estrategia.value !== 'todo') {
    const libre = Math.max(0, ventana.value - fijo - (estrategia.value === 'resumen' ? RESUMEN : 0))
    const caben = Math.min(turnos.value, Math.floor(libre / TURNO))
    usados = caben * TURNO; olvidados = turnos.value - caben
    if (estrategia.value === 'resumen' && olvidados > 0) resumen = RESUMEN
  }
  const total = fijo + usados + resumen
  return {
    seg: [
      ['Sistema', SISTEMA, '#334155'], ['Herramientas', nHerr.value * POR_HERR, '#7c3aed'], ['Resumen', resumen, '#0d9488'],
      ['Historial', usados, '#2563eb'], ['Documentos (RAG)', docs.value * POR_DOC, '#ea580c'], ['Pregunta', PREGUNTA, '#15803d'],
    ], total, olvidados, desborda: total > ventana.value,
  }
})
const W = 620
const esc = computed(() => W / Math.max(ventana.value, r.value.total) )
const fmt = n => n.toLocaleString('es-HN')
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:12px">
    <div style="display:flex;gap:22px">
      <div class="panel">
        <label>Ventana de contexto
          <select v-model.number="ventana"><option :value="8000">8 000 tokens</option><option :value="32000">32 000 tokens</option><option :value="128000">128 000 tokens</option><option :value="200000">200 000 tokens</option></select>
        </label>
        <label>Turnos de conversación: <span class="v">{{ turnos }}</span><input type="range" min="0" max="200" v-model.number="turnos"></label>
        <label>Herramientas disponibles: <span class="v">{{ nHerr }}</span><input type="range" min="0" max="60" v-model.number="nHerr"></label>
        <label>Documentos recuperados: <span class="v">{{ docs }}</span><input type="range" min="0" max="20" v-model.number="docs"></label>
      </div>
      <div class="panel" style="max-width:330px">
        <div class="row"><button v-for="(v, k) in ESTR" :key="k" :class="{ on: estrategia === k }" @click="estrategia = k">{{ v[0] }}</button></div>
        <div style="font-size:13px">{{ ESTR[estrategia][1] }}</div>
        <div class="stats">
          <span>Tokens enviados</span><b :style="{ color: r.desborda ? '#b91c1c' : '' }">{{ fmt(r.total) }}</b>
          <span>Límite</span><b>{{ fmt(ventana) }}</b>
          <span>Turnos olvidados</span><b>{{ r.olvidados }}</b>
        </div>
        <div v-if="r.desborda" style="color:#b91c1c;font-weight:700;font-size:13px">⚠️ No cabe: la llamada falla o se corta información.</div>
        <div v-else-if="r.olvidados && estrategia === 'ventana'" style="color:#c2410c;font-size:13px">El agente ya no «recuerda» los primeros {{ r.olvidados }} turnos.</div>
      </div>
    </div>
    <div style="position:relative;width:640px">
      <div style="display:flex;height:42px;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1;width:620px">
        <div v-for="s in r.seg" :key="s[0]" :title="s[0] + ': ' + fmt(s[1])" :style="{ width: s[1] * esc + 'px', background: s[2], transition: 'width .25s' }" />
      </div>
      <div :style="{ left: ventana * esc + 'px' }" style="position:absolute;top:-6px;height:54px;border-left:3px dashed #b91c1c;transition:left .25s" />
      <div class="row" style="margin-top:6px;font-size:12px">
        <span v-for="s in r.seg" :key="s[0]"><span :style="{ color: s[2] }">■</span> {{ s[0] }} ({{ fmt(s[1]) }})</span>
        <span style="color:#b91c1c">┆ límite</span>
      </div>
    </div>
    <div class="hint">Valores aproximados para ilustrar. Cada token enviado cuesta dinero y tiempo, aunque quepa en la ventana.</div>
  </div>
</template>
