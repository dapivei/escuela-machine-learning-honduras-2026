<script setup>
import { ref, computed } from 'vue'

const CAP = {
  privados: ['Lee datos privados', 'correos, base de clientes, archivos internos', 2],
  externo: ['Lee contenido no confiable', 'páginas web, correos entrantes, documentos subidos', 2],
  comunica: ['Se comunica hacia afuera', 'envía correos, hace peticiones web, publica', 2],
  escribe: ['Modifica o borra datos', 'actualiza registros, borra archivos', 2],
  codigo: ['Ejecuta código', 'Python, terminal', 2],
  dinero: ['Puede gastar dinero', 'pagos, compras, APIs de pago', 3],
  terceros: ['Usa herramientas de terceros', 'servidores MCP, plugins, otros agentes', 1],
  memoria: ['Memoria persistente', 'recuerda entre sesiones', 1],
  autonomo: ['Corre sin supervisión', 'nadie revisa en tiempo real', 2],
}
const on = ref({ privados: true, externo: true, comunica: false, escribe: false, codigo: false, dinero: false, terceros: false, memoria: false, autonomo: false })

const RIESGOS = [
  [c => c.externo, 'LLM01 Inyección de prompts · ASI01 Secuestro del objetivo', 'Trata todo contenido externo como dato, nunca como instrucción; limita lo que el agente puede hacer después de leerlo.'],
  [c => c.privados, 'LLM02 Divulgación de información sensible', 'Da acceso solo a los datos necesarios; filtra datos personales en las salidas.'],
  [c => c.terceros, 'LLM03 Cadena de suministro', 'Usa servidores y plugins de fuentes confiables, con versiones fijas y revisadas.'],
  [c => c.codigo, 'LLM05 Manejo inseguro de la salida', 'Ejecuta código solo en un ambiente aislado (sandbox), sin red ni credenciales.'],
  [c => c.escribe || c.dinero, 'LLM06 Agencia excesiva · ASI02 Mal uso de herramientas', 'Mínimo privilegio y confirmación humana para acciones irreversibles.'],
  [c => c.escribe || c.dinero || c.comunica, 'ASI03 Abuso de identidad y privilegios', 'Credenciales propias del agente, de corta duración y con permisos acotados.'],
  [c => c.memoria, 'Memoria envenenada', 'Revisa qué se guarda en memoria y de dónde viene; permite borrarla.'],
  [c => c.dinero || c.autonomo, 'LLM10 Consumo sin límites', 'Límites de pasos, tiempo y presupuesto por tarea; alertas de costo.'],
  [c => c.autonomo, 'ASI10 Agentes fuera de control', 'Monitoreo continuo, trazas y un botón para detener al agente.'],
]
const r = computed(() => {
  const c = on.value
  const puntos = Object.entries(c).reduce((s, [k, v]) => s + (v ? CAP[k][2] : 0), 0)
  const trifecta = c.privados && c.externo && c.comunica
  const nivel = trifecta || puntos >= 11 ? ['Crítico', '#b91c1c'] : puntos >= 7 ? ['Alto', '#ea580c'] : puntos >= 4 ? ['Medio', '#ca8a04'] : ['Bajo', '#15803d']
  return { puntos, trifecta, nivel, lista: RIESGOS.filter(x => x[0](c)) }
})
</script>

<template>
  <div class="demo" style="gap:18px">
    <div class="panel" style="min-width:270px;max-width:280px;gap:5px">
      <b style="font-size:13px">¿Qué puede hacer tu agente?</b>
      <label v-for="(v, k) in CAP" :key="k" style="flex-direction:row;gap:6px;align-items:flex-start;font-weight:400;font-size:12.5px">
        <input type="checkbox" v-model="on[k]" style="margin-top:3px"><span><b>{{ v[0] }}</b> <span class="hint">· {{ v[1] }}</span></span>
      </label>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;width:540px">
      <div style="display:flex;gap:12px;align-items:center">
        <div :style="{ background: r.nivel[1] }" style="color:#fff;font-weight:800;border-radius:10px;padding:6px 16px;font-size:18px">Riesgo {{ r.nivel[0] }}</div>
        <div class="hint">Puntaje de exposición: {{ r.puntos }}</div>
      </div>
      <div v-if="r.trifecta" style="background:#fef2f2;border-left:4px solid #b91c1c;padding:6px 10px;border-radius:6px;font-size:13px">
        <b>Combinación peligrosa activa:</b> datos privados + contenido no confiable + comunicación externa. Un atacante puede hacer que el agente filtre datos. Quita al menos una de las tres.
      </div>
      <div style="max-height:270px;overflow:auto;display:flex;flex-direction:column;gap:5px">
        <div v-for="x in r.lista" :key="x[1]" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:5px 10px;font-size:12.5px">
          <b>{{ x[1] }}</b><br><span style="color:#475569">🛡️ {{ x[2] }}</span>
        </div>
        <div v-if="!r.lista.length" class="hint">Sin capacidades marcadas, el agente casi no tiene superficie de ataque… pero tampoco puede hacer mucho.</div>
      </div>
      <div class="hint">Códigos LLM0x: OWASP Top 10 para aplicaciones LLM (2025). ASI0x: OWASP Top 10 para aplicaciones agénticas (2026). El puntaje es una guía didáctica, no una auditoría.</div>
    </div>
  </div>
</template>
