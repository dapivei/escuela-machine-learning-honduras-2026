# Módulo 4 · Clasificación (Slidev)

Diapositivas en Markdown con demos interactivas (Vue).

```bash
npm install
npx slidev            # presentar/editar en http://localhost:3030
npx slidev build      # página estática en dist/
npx slidev export     # PDF (requiere playwright-chromium)
```

- `slides.md` — todas las diapositivas (separadas por `---`).
- `components/` — demos: KnnDemo, ForestDemo (mode="tree" | "forest"), SvmDemo, NbSpam, NbGauss, EvalDemo.
- `utils/ml.js` — datos sintéticos, dibujo y modelos (árbol, normal estándar).
- Tema: slidev-theme-neversink.
