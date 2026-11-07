// Datos inventados para los módulos de Python, pandas y visualización.
export const COLS = ['nombre', 'grupo', 'horas', 'asistencia', 'calificacion', 'aprobo']
export const DF = [
  ['Luis', 'A', 2, 60, 4.5, false], ['Pedro', 'A', 3, 95, 5.8, false], ['Diego', 'A', 5, 70, 5.5, false],
  ['Carla', 'A', 6, 90, 7.8, true], ['Sofía', 'A', 7, 75, 7.2, true], ['Marta', 'A', 8, 90, 9.1, true],
  ['Jorge', 'A', 5, 90, 7.0, true], ['Rosa', 'B', 4, 80, 5.9, false], ['Kevin', 'B', 9, 65, 8.0, true],
  ['Lucía', 'B', 7, 85, 5.7, false], ['Mario', 'B', 3, null, 5.1, false], ['Elena', 'B', 7, 95, 9.4, true],
  ['Andrés', 'B', 1, 90, 4.2, false], ['Valeria', 'B', 8, 70, 8.3, true],
].map(r => Object.fromEntries(COLS.map((c, i) => [c, r[i]])))

export const SEMANAS = [1, 2, 3, 4, 5, 6, 7, 8]
export const PROM_A = [6.1, 6.4, 6.3, 6.9, 7.2, 7.0, 7.5, 7.8]
export const PROM_B = [5.8, 6.0, 6.6, 6.5, 6.8, 7.3, 7.4, 7.6]

// Calificaciones simuladas de 200 alumnos (mezcla de dos grupos)
export function calificaciones(seed = 7) {
  let s = seed
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r())
  return Array.from({ length: 200 }, (_, i) => Math.min(10, Math.max(0, i % 3 === 0 ? 5 + 1.0 * g() : 8 + 0.9 * g()))).map(v => Math.round(v * 10) / 10)
}

// Formato estilo pandas
export function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return 'NaN'
  if (typeof v === 'boolean') return v ? 'True' : 'False'
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(Math.abs(v) < 100 ? 6 : 2).replace(/0+$/, '').replace(/\.$/, '.0')
  return String(v)
}
export const NUM = ['horas', 'asistencia', 'calificacion']
export function cuantil(xs, q) {
  const s = [...xs].sort((a, b) => a - b), pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos)
  return s[lo] + (s[hi] - s[lo]) * (pos - lo)
}
export const media = xs => xs.reduce((a, b) => a + b, 0) / xs.length
export const desv = xs => { const m = media(xs); return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1)) }
