// Validación dejando uno fuera (LOOCV) para kNN, con escalado dentro de cada prueba.
import { ALUMNOS } from './alumnos.js'

const mean = v => v.reduce((s, x) => s + x, 0) / v.length
const sd = v => { const m = mean(v); return Math.sqrt(mean(v.map(x => (x - m) ** 2))) }

// Resultado de excluir al alumno i y predecirlo con k vecinos.
export function looResult(i, k) {
  const q = ALUMNOS[i]
  const tr = ALUMNOS.filter((_, j) => j !== i)
  const mh = mean(tr.map(p => p.h)), sh = sd(tr.map(p => p.h))
  const ma = mean(tr.map(p => p.a)), sa = sd(tr.map(p => p.a))
  const z = p => [(p.h - mh) / sh, (p.a - ma) / sa]
  const zq = z(q)
  const pts = tr.map(p => {
    const zp = z(p)
    return { p, z: zp, d: Math.hypot(zp[0] - zq[0], zp[1] - zq[1]) }
  }).sort((u, v) => u.d - v.d)
  const vec = pts.slice(0, k)
  const pred = vec.filter(v => v.p.y).length > vec.length / 2 ? 1 : 0
  return { q, zq, tr: pts, vec, pred, mh, sh, ma, sa, ok: pred === q.y }
}

export const KS = [1, 3, 5, 7, 9, 11, 13]

// Error de validación para cada k y el mínimo (desempate: el k más grande).
export function erroresPorK() {
  const errs = KS.map(k => ALUMNOS.filter((_, i) => !looResult(i, k).ok).length / ALUMNOS.length)
  const mn = Math.min(...errs)
  const tied = KS.filter((_, j) => Math.abs(errs[j] - mn) < 1e-9)
  return { errs, mn, tied, best: Math.max(...tied) }
}
