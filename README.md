# Escuela de Machine Learning Honduras 2026

**ICTP - PWF Honduras: Machine Learning & Data Science**
📅 23 de noviembre al 4 de diciembre de 2026 · 📍 Tegucigalpa, Honduras · 🌐 [machine-learning-honduras.org](https://machine-learning-honduras.org/)

La escuela busca fortalecer los conocimientos básicos de aprendizaje automático e inteligencia artificial de estudiantes e investigadores en etapas iniciales de su carrera. Combina clases magistrales, sesiones prácticas y charlas en línea con investigadores internacionales.

Este repositorio reúne los materiales de las sesiones: **diapositivas interactivas** hechas con [Slidev](https://sli.dev) y **notebooks de práctica** para Google Colab.

📺 **Diapositivas en línea:** https://dapivei.github.io/escuela-machine-learning-honduras-2026/

## Contenido

| # | Tema | Diapositivas | Notebook de práctica |
|---|---|---|---|
| 1 | Introducción a Python y pandas | Módulo 1 | [![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dapivei/escuela-machine-learning-honduras-2026/blob/main/notebooks/01_python_pandas.ipynb) |
| 2 | Introducción a la visualización de datos | Módulo 2 | [![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dapivei/escuela-machine-learning-honduras-2026/blob/main/notebooks/02_visualizacion.ipynb) |
| 3 | Algoritmos de clasificación | Módulo 3 | [![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dapivei/escuela-machine-learning-honduras-2026/blob/main/notebooks/03_clasificacion.ipynb) |
| 4 | Agentes de IA | Módulo 4 | [![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dapivei/escuela-machine-learning-honduras-2026/blob/main/notebooks/04_agentes.ipynb) |

### Qué se ve en cada tema

- **Python y pandas:** variables y tipos, listas y rebanadas, diccionarios, `if`, `for`, funciones; `read_csv`, `head`, `info`, `describe`, filtros, `sort_values`, valores faltantes y `groupby`.
- **Visualización:** el cuarteto de Anscombe, cómo elegir la gráfica según la pregunta, anatomía de una gráfica en matplotlib, histogramas y diagramas de caja, seaborn, plotly y gráficas engañosas.
- **Clasificación:** regresión logística, k vecinos, árboles de decisión, sesgo y varianza, Random Forest, SVM, Naive Bayes y evaluación (matriz de confusión, precisión, sensibilidad, ROC).
- **Agentes:** qué es un LLM (tokens, embeddings, atención, temperatura), herramientas y *function calling*, el ciclo ReAct, las matemáticas de un agente, memoria y RAG, planificación, sistemas multiagente, evaluación y seguridad.

Todos los temas usan como hilo conductor la misma tabla de **14 alumnos** (datos inventados) y la pregunta: *¿Ana aprobará?*

## Notebooks para estudiantes

1. Haz clic en el botón **Abrir en Colab** del tema.
2. En Colab, ve a **Archivo → Guardar una copia en Drive** para guardar tus cambios.
3. Corre las celdas en orden con `Shift + Enter`.
4. En cada **✏️ Ejercicio**, escribe tu código donde dice `# TU CÓDIGO AQUÍ`. La celda siguiente revisa tu respuesta y responde ✅ o ❌. Si te atoras, abre la **💡 Pista**.

No necesitas instalar nada ni crear claves de API. El notebook de agentes usa un modelo simulado; conectar un LLM real es una sección opcional.

## Estructura del repositorio

```
├── slides.md          # todas las diapositivas (separadas por ---)
├── components/        # demos interactivas en Vue
│   ├── Py*, Pd*       #   Python y pandas (paso a paso, slicing, quiz, explorador, groupby)
│   ├── Viz*           #   visualización (Anscombe, elegir gráfica, constructor, histograma, caja, gráficas engañosas)
│   ├── Knn*, Arbol*, Bosque*, Forest*, Svm*, Nb*, LogReg*, Eval*, SesgoVarianza, PlanoAlumnos
│   │                  #   clasificación
│   └── Ag*            #   agentes (ReAct, herramientas, RAG, atención, evaluación, seguridad…)
├── utils/
│   ├── ml.js          # datos sintéticos, dibujo y modelos para las demos
│   ├── alumnos.js     # los 14 alumnos y Ana (clasificación)
│   └── datos_curso.js # tabla del curso para Python, pandas y visualización
├── style.css          # estilos compartidos de las demos
├── notebooks/         # notebooks de práctica para estudiantes
├── soluciones/        # notebooks resueltos (para docentes)
└── .github/workflows/deploy.yml   # publica las diapositivas en GitHub Pages
```

## Correr las diapositivas en tu computadora

Necesitas [Node.js](https://nodejs.org) (versión LTS).

```bash
npm install
npm run dev       # presentar y editar en http://localhost:3030
npm run build     # página estática en dist/
npm run export    # PDF (requiere playwright-chromium)
```

Atajos útiles al presentar: `→` / `←` para avanzar, `o` para ver todas las diapositivas, `p` para el modo presentador con notas.

Cada vez que haces `git push` a `main`, GitHub Actions vuelve a construir y publicar las diapositivas.

## Notas para editar

- Tema: [slidev-theme-neversink](https://gureckislab.org/slidev-theme-neversink/). Diapositivas de contenido con `color: white`; separadores de sección con colores (`sky`, `emerald`, `amber`, `violet`…).
- Los componentes de `components/` se registran solos: basta escribir `<KnnDemo />` en `slides.md`.
- Dentro de un SVG, escribe el tamaño de letra como `style="font-size:12px"`, porque el tema ignora el atributo `font-size`.
- **No escribas `[1:3]` tal cual** en `slides.md` ni en los componentes: UnoCSS lo toma como CSS y la compilación falla (`lightningcss … Unexpected token Semicolon`). Usa `&#58;` en Markdown o `\x3A` en JavaScript en lugar de los dos puntos.
- Todas las demos corren en el navegador, sin internet ni servidor. Los datos son inventados.

## Créditos

**Materiales:** Daniela Pinto Veizaga (New York University)

**Organizan la escuela:**
- Edith Villegas, International Centre for Theoretical Physics (ICTP), coordinadora
- Carlos Soto, National Institute of Oceanography and Applied Geophysics
- Lucio Villanueva, Universidad Nacional Autónoma de Honduras (UNAH)
- Melissa Cruz, Universidad Nacional Autónoma de Honduras (UNAH)

Programa completo, ponentes y más información en [machine-learning-honduras.org](https://machine-learning-honduras.org/).
