<script setup>
import { ref, computed } from 'vue'

// Corpus pequeño para entrenar un tokenizador BPE de juguete
const CORPUS = `los modelos de lenguaje predicen la siguiente palabra. los agentes usan herramientas.
la escuela de machine learning enseña aprendizaje automático y ciencia de datos.
los estudiantes aprenden a programar modelos de clasificación y agentes de inteligencia artificial.
un modelo de lenguaje aprende patrones de millones de textos. las palabras se dividen en tokens.
el agente observa, piensa y actúa. el aprendizaje automático necesita datos. los datos enseñan al modelo.
honduras tegucigalpa san pedro sula estudiantes clases sábados entrenamiento entrenar entrenado`

const words = CORPUS.toLowerCase().split(/\s+/).filter(Boolean)
const freq = {}
words.forEach(w => (freq[w] = (freq[w] || 0) + 1))
const base = [...new Set(('▁' + words.join('▁')).split(''))].sort()

// Entrena hasta MAXM fusiones (BPE)
const MAXM = 250
const merges = []
{
  let seqs = Object.entries(freq).map(([w, f]) => [['▁', ...w.split('')], f])
  for (let m = 0; m < MAXM; m++) {
    const pc = {}
    for (const [s, f] of seqs) for (let i = 0; i < s.length - 1; i++) { const k = s[i] + '\u0001' + s[i + 1]; pc[k] = (pc[k] || 0) + f }
    let best = null, bc = 1
    for (const k in pc) if (pc[k] > bc) { bc = pc[k]; best = k }
    if (!best) break
    const [a, b] = best.split('\u0001')
    merges.push([a, b])
    seqs = seqs.map(([s, f]) => { const o = []; for (let i = 0; i < s.length; i++) { if (i < s.length - 1 && s[i] === a && s[i + 1] === b) { o.push(a + b); i++ } else o.push(s[i]) } return [o, f] })
  }
}
const vocab = [...base, ...merges.map(([a, b]) => a + b)]
const idOf = Object.fromEntries(vocab.map((t, i) => [t, i]))

const texto = ref('Los estudiantes de Honduras entrenan agentes inteligentes.')
const nMerges = ref(120)

function tokenizar(t, M) {
  const rank = new Map(merges.slice(0, M).map(([a, b], i) => [a + '\u0001' + b, i]))
  const out = []
  for (const w of t.toLowerCase().split(/\s+/).filter(Boolean)) {
    let s = ['▁', ...w.split('')]
    while (true) {
      let bi = -1, br = Infinity
      for (let i = 0; i < s.length - 1; i++) { const r = rank.get(s[i] + '\u0001' + s[i + 1]); if (r !== undefined && r < br) { br = r; bi = i } }
      if (bi < 0) break
      s = [...s.slice(0, bi), s[bi] + s[bi + 1], ...s.slice(bi + 2)]
    }
    out.push(...s)
  }
  return out
}
const toks = computed(() => tokenizar(texto.value, nMerges.value))
const nChars = computed(() => texto.value.replace(/\s+/g, '').length)
const COLORS = ['#dbeafe', '#ffedd5', '#dcfce7', '#f3e8ff', '#fee2e2', '#fef9c3', '#e0f2fe', '#fce7f3']
</script>

<template>
  <div class="demo" style="flex-direction:column;gap:10px">
    <label style="width:800px">Escribe un texto
      <input v-model="texto" style="border:1px solid #cbd5e1;border-radius:6px;padding:5px 8px;font-weight:400;font-size:15px">
    </label>
    <div style="display:flex;flex-wrap:wrap;gap:4px;width:820px;min-height:70px;align-content:flex-start">
      <div v-for="(t, i) in toks" :key="i" :style="{ background: COLORS[i % COLORS.length] }" style="border-radius:6px;padding:2px 6px;display:flex;flex-direction:column;align-items:center;border:1px solid #cbd5e1">
        <span style="font-family:ui-monospace,monospace;font-size:15px;white-space:pre">{{ t.replace('▁', '␣') }}</span>
        <span style="font-size:10px;color:#64748b">{{ idOf[t] ?? '?' }}</span>
      </div>
    </div>
    <div style="display:flex;gap:24px;align-items:flex-start">
      <label style="width:330px">Fusiones aprendidas (BPE): <span class="v">{{ nMerges }}</span>
        <input type="range" min="0" :max="merges.length" v-model.number="nMerges">
      </label>
      <div class="stats" style="width:300px">
        <span>Tamaño del vocabulario</span><b>{{ base.length + nMerges }}</b>
        <span>Caracteres</span><b>{{ nChars }}</b>
        <span>Tokens</span><b>{{ toks.length }}</b>
        <span>Caracteres por token</span><b>{{ (nChars / toks.length).toFixed(2) }}</b>
      </div>
      <div class="hint" style="max-width:260px">␣ marca el inicio de una palabra. El número es el <b>ID</b> del token: lo único que ve el modelo. Este tokenizador se entrenó aquí mismo con unas pocas frases; los reales usan vocabularios de ~100 000 tokens.</div>
    </div>
    <div v-if="nMerges > 0" class="hint">Primeras fusiones aprendidas: <code>{{ merges.slice(0, 12).map(m => (m[0] + '+' + m[1]).replaceAll('▁', '␣')).join('  ·  ') }}</code></div>
  </div>
</template>
