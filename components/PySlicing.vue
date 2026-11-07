<script setup>
import { ref, computed } from 'vue'

const ELEM = ['H', 'O', 'N', 'D', 'U', 'R', 'A', 'S']
const n = ELEM.length
const usarIni = ref(true), usarFin = ref(true), usarPaso = ref(false)
const ini = ref(1), fin = ref(4), paso = ref(1), modo = ref('slice'), idx = ref(-1)

// Misma lógica que CPython (PySlice_AdjustIndices)
function indices(start, stop, step) {
  const ajusta = (v, neg, pos) => { if (v === null) return null; if (v < 0) { v += n; if (v < 0) v = neg } else if (v >= n) v = pos; return v }
  if (step > 0) {
    start = start === null ? 0 : ajusta(start, 0, n); stop = stop === null ? n : ajusta(stop, 0, n)
  } else {
    start = start === null ? n - 1 : ajusta(start, -1, n - 1); stop = stop === null ? -1 : ajusta(stop, -1, n - 1)
  }
  const out = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) out.push(i)
  return out
}
const sel = computed(() => (modo.value === 'indice' ? [((idx.value % n) + n) % n] : indices(usarIni.value ? ini.value : null, usarFin.value ? fin.value : null, usarPaso.value ? paso.value : 1)))
const expr = computed(() => {
  if (modo.value === 'indice') return `palabra[${idx.value}]`
  const a = usarIni.value ? ini.value : '', b = usarFin.value ? fin.value : ''
  return `palabra[${a}:${b}${usarPaso.value ? ':' + paso.value : ''}]`
})
const res = computed(() => (modo.value === 'indice' ? `'${ELEM[sel.value[0]]}'` : `'${sel.value.map(i => ELEM[i]).join('')}'`))
const orden = i => sel.value.indexOf(i)
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:14px">
    <div style="font-family:ui-monospace,monospace;font-size:15px">palabra = "HONDURAS"</div>
    <div style="display:flex;gap:6px">
      <div v-for="(c, i) in ELEM" :key="i" style="display:flex;flex-direction:column;align-items:center;gap:3px">
        <span style="font-size:12px;color:#2563eb;font-family:ui-monospace,monospace">{{ i }}</span>
        <div :style="{ background: orden(i) >= 0 ? '#ea580c' : '#f8fafc', color: orden(i) >= 0 ? '#fff' : '#0f172a', borderColor: orden(i) >= 0 ? '#ea580c' : '#cbd5e1' }" style="width:58px;height:58px;border:2px solid;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;position:relative;transition:all .2s">
          {{ c }}<span v-if="orden(i) >= 0 && modo === 'slice'" style="position:absolute;top:2px;right:5px;font-size:10px">{{ orden(i) + 1 }}</span>
        </div>
        <span style="font-size:12px;color:#7c3aed;font-family:ui-monospace,monospace">{{ i - n }}</span>
      </div>
    </div>
    <div class="row" style="font-size:12px"><span style="color:#2563eb">índices positivos (desde 0)</span> · <span style="color:#7c3aed">índices negativos (desde el final)</span></div>
    <div style="display:flex;gap:24px;align-items:flex-start">
      <div class="panel" style="min-width:300px">
        <div class="row"><button :class="{ on: modo === 'indice' }" @click="modo = 'indice'">Un índice</button><button :class="{ on: modo === 'slice' }" @click="modo = 'slice'">Rebanada [inicio:fin:paso]</button></div>
        <label v-if="modo === 'indice'">Índice: <span class="v">{{ idx }}</span><input type="range" :min="-n" :max="n - 1" v-model.number="idx"></label>
        <template v-else>
          <label><span><input type="checkbox" v-model="usarIni"> inicio: <span class="v">{{ usarIni ? ini : '(vacío)' }}</span></span><input type="range" :min="-n" :max="n" v-model.number="ini" :disabled="!usarIni"></label>
          <label><span><input type="checkbox" v-model="usarFin"> fin (no se incluye): <span class="v">{{ usarFin ? fin : '(vacío)' }}</span></span><input type="range" :min="-n" :max="n" v-model.number="fin" :disabled="!usarFin"></label>
          <label><span><input type="checkbox" v-model="usarPaso"> paso: <span class="v">{{ usarPaso ? paso : '(1)' }}</span></span>
            <select v-model.number="paso" :disabled="!usarPaso"><option v-for="s in [-3, -2, -1, 1, 2, 3]" :key="s" :value="s">{{ s }}</option></select></label>
        </template>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:10px 16px;font-family:ui-monospace,monospace;font-size:18px">&gt;&gt;&gt; {{ expr }}<br><span style="color:#fdba74">{{ res }}</span></div>
        <div class="hint" style="max-width:360px">El <b>fin no se incluye</b>: <code>palabra[1:4]</code> toma los índices 1, 2 y 3. Prueba <code>[::-1]</code> (paso −1, sin inicio ni fin) para invertir. Lo mismo funciona con listas.</div>
      </div>
    </div>
  </div>
</template>
