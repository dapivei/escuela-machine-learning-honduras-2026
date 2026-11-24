// Datos inventados de alumnos para los ejemplos paso a paso del módulo 4.
// y = 1 aprobó, y = 0 no aprobó. Lucía es una excepción a propósito (ruido).
export const ALUMNOS = [
  { n: 'Luis', h: 2, a: 60, y: 0 }, { n: 'Pedro', h: 3, a: 95, y: 0 }, { n: 'Diego', h: 5, a: 70, y: 0 },
  { n: 'Carla', h: 6, a: 90, y: 1 }, { n: 'Sofía', h: 7, a: 75, y: 1 }, { n: 'Marta', h: 8, a: 90, y: 1 },
  { n: 'Jorge', h: 5, a: 90, y: 1 }, { n: 'Rosa', h: 4, a: 80, y: 0 }, { n: 'Kevin', h: 9, a: 65, y: 1 },
  { n: 'Lucía', h: 7, a: 85, y: 0 }, { n: 'Mario', h: 3, a: 85, y: 0 }, { n: 'Elena', h: 7, a: 95, y: 1 },
  { n: 'Andrés', h: 1, a: 90, y: 0 }, { n: 'Valeria', h: 8, a: 70, y: 1 },
]
export const ANA = { n: 'Ana', h: 6, a: 95 }

const mean = v => v.reduce((s, x) => s + x, 0) / v.length
const std = v => { const m = mean(v); return Math.sqrt(mean(v.map(x => (x - m) ** 2))) }
export const MU_H = mean(ALUMNOS.map(p => p.h)), SD_H = std(ALUMNOS.map(p => p.h))
export const MU_A = mean(ALUMNOS.map(p => p.a)), SD_A = std(ALUMNOS.map(p => p.a))
export const zh = h => (h - MU_H) / SD_H
export const za = a => (a - MU_A) / SD_A

// Plano: horas 0–10 (x), asistencia 50–100 (y)
export function plano(W = 400, H = 300, P = 36) {
  const px = h => P + (h / 10) * (W - P - 10)
  const py = a => H - 28 - ((a - 50) / 50) * (H - 38)
  const ih = x => ((x - P) / (W - P - 10)) * 10
  const ia = y => 50 + ((H - 28 - y) / (H - 38)) * 50
  return { W, H, P, px, py, ih, ia }
}
// Plano escalado: x = z(horas), y = z(asistencia), la misma escala que usa la distancia.
// Las etiquetas de los ejes siguen en unidades originales; sólo cambian las posiciones.
export function planoEsc(W = 400, H = 300, P = 36) {
  const x0 = zh(0), x1 = zh(10), y0 = za(50), y1 = za(100)
  const px = h => P + ((zh(h) - x0) / (x1 - x0)) * (W - P - 10)
  const py = a => H - 28 - ((za(a) - y0) / (y1 - y0)) * (H - 38)
  const ih = x => MU_H + (x0 + ((x - P) / (W - P - 10)) * (x1 - x0)) * SD_H
  const ia = y => MU_A + (y0 + ((H - 28 - y) / (H - 38)) * (y1 - y0)) * SD_A
  return { W, H, P, px, py, ih, ia }
}
export const AZUL = '#2563eb', NARANJA = '#ea580c'
