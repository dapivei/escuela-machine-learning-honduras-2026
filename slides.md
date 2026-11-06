---
theme: neversink
title: 'Módulo 4 · Clasificación'
layout: cover
routerMode: hash
transition: slide-left
mdc: true
---

# Algoritmos de Clasificación

**Escuela de Teoría y Aplicaciones de Machine Learning - Honduras**

Daniela Pinto Veizaga

<div class="text-sm opacity-80 mt-6">Tipos de problemas · kNN · árboles · Random Forest · SVM · Naive Bayes · evaluación</div>

<!--
Inicio del módulo 04. Las diapositivas con controles son interactivas: muévanlos en clase.
-->

---
layout: top-title
color: white
---

:: title ::

# Tenemos los datos de alumnos de semestres pasados. Llega **Ana**: estudia **6 h** y asiste al **95 %**. ¿Aprobará?

:: content ::


| Alumno | Horas de estudio / semana | Asistencia | ¿Aprobó? |
|---|---|---|---|
| Luis | 2 | 60 % | <span class="text-blue-600 font-bold">No</span> |
| Pedro | 3 | 95 % | <span class="text-blue-600 font-bold">No</span> |
| Diego | 5 | 70 % | <span class="text-blue-600 font-bold">No</span> |
| Carla | 6 | 90 % | <span class="text-orange-600 font-bold">Sí</span> |
| Sofía | 7 | 75 % | <span class="text-orange-600 font-bold">Sí</span> |
| Marta | 8 | 90 % | <span class="text-orange-600 font-bold">Sí</span> |

<div v-click class="mt-6 text-xl">

</div>

<div v-click class="mt-2 text-xl text-orange-600 font-bold">

Si respondiste «probablemente sí», acabas de clasificar.

</div>

<!--
Dejar que el grupo responda antes de revelar. Preguntar: ¿en qué te fijaste para decidir? Casi todos comparan a Ana con Carla, que tiene datos parecidos.
-->

---
layout: two-cols-title
columns: is-7
color: white
---

:: title ::

# ¿Qué hiciste en tu cabeza?

:: left ::

<svg viewBox="0 0 420 300" width="420" height="300">
  <rect x="40" y="10" width="370" height="255" fill="#f8fafc" stroke="#cbd5e1"/>
  <g v-click="3">
    <polygon points="184,10 410,10 410,265 274,265" fill="#ffedd5"/>
    <polygon points="40,10 184,10 274,265 40,265" fill="#dbeafe"/>
    <line x1="184" y1="10" x2="274" y2="265" stroke="#0f172a" stroke-width="3"/>
  </g>
  <circle cx="112" cy="212" r="8" fill="#2563eb"/><text x="122" y="208" style="font-size:12px" fill="#334155">Luis</text>
  <circle cx="148" cy="44" r="8" fill="#2563eb"/><text x="158" y="40" style="font-size:12px" fill="#334155">Pedro</text>
  <circle cx="220" cy="164" r="8" fill="#2563eb"/><text x="230" y="160" style="font-size:12px" fill="#334155">Diego</text>
  <circle cx="256" cy="68" r="8" fill="#ea580c"/><text x="266" y="64" style="font-size:12px" fill="#334155">Carla</text>
  <circle cx="292" cy="140" r="8" fill="#ea580c"/><text x="302" y="136" style="font-size:12px" fill="#334155">Sofía</text>
  <circle cx="328" cy="68" r="8" fill="#ea580c"/><text x="338" y="64" style="font-size:12px" fill="#334155">Marta</text>
  <g v-click="1">
    <circle cx="256" cy="44" r="9" fill="#fff" stroke="#0f172a" stroke-width="2.5"/>
    <text x="252" y="48" style="font-size:13px;font-weight:700" fill="#0f172a">?</text>
    <text x="268" y="43" style="font-size:12px;font-weight:700" fill="#0f172a">Ana</text>
  </g>
  <text x="225" y="292" style="font-size:12px" fill="#64748b" text-anchor="middle">horas de estudio por semana →</text>
  <text x="14" y="140" style="font-size:12px" fill="#64748b" text-anchor="middle" transform="rotate(-90 14 140)">asistencia →</text>
</svg>

:: right ::

<v-clicks>

- Pusiste a cada alumno como un **punto**: sus datos son sus coordenadas.
- Ubicaste a Ana entre los alumnos que **se le parecen**.
- Sin darte cuenta, trazaste una **frontera**: de un lado aprueban, del otro no.

</v-clicks>

<div v-click="4" class="mt-6 p-3 rounded-lg border-2 border-orange-500 bg-white">

Un **clasificador** es justo eso: una regla que parte el espacio en regiones, una por clase.

</div>

<!--
Los clics van así: 1) aparece Ana; 2) y 3) las primeras viñetas; con el tercero se dibuja la frontera; 4) la definición. Pregunta extra: ¿y Jorge, con 5 h y 90 %? Queda muy cerca de la frontera; ahí la intuición ya no alcanza y conviene un método.
-->

---
layout: top-title
color: white
---

:: title ::

# Formalizando el problema anterior

:: content ::

| En el ejemplo | Nombre técnico | Notación |
|---|---|---|
| Cada alumno | observación | $x_i$ |
| Horas y asistencia | variables (*features*) | $x_i \in \mathbb{R}^d$, aquí $d = 2$ |
| ¿Aprobó? | etiqueta o clase | $y_i \in \{\text{No}, \text{Sí}\}$ |
| Los alumnos de semestres pasados | datos de entrenamiento | $\{(x_i, y_i)\}_{i=1}^{n}$ |
| Tu regla mental | clasificador | $f : \mathbb{R}^d \to \{1, \dots, K\}$ |

<div v-click class="mt-6 text-lg">

**Clasificar** = aprender $f$ a partir de ejemplos $(x_i, y_i)$ para predecir la clase de una observación **nueva**.

</div>

<!--
Insistir en que la tabla de la primera diapositiva ES el conjunto de datos: filas = observaciones, columnas = variables, última columna = etiqueta. Así se ve un DataFrame de pandas (módulo 2).
-->

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Algoritmos de clasificación

:: left ::

### Con supervisión

Cada ejemplo trae la **respuesta correcta**, como un examen ya calificado.

El modelo compara lo que predice con la etiqueta y **se corrige**.

<div class="text-sm text-slate-500 mt-2">Clasificación y regresión.</div>

:: right ::

<v-click>

### Sin supervisión

Solo tenemos horas y asistencia, **sin saber quién aprobó**.

Lo único posible es buscar estructura: ¿hay grupos de alumnos parecidos?

<div class="text-sm text-slate-500 mt-2">Clustering, reducción de dimensión.</div>

</v-click>

<!--
La palabra «supervisado» viene de que alguien (un humano, un registro histórico) ya etiquetó los datos. Etiquetar suele ser lo más caro de un proyecto real.
-->

---
layout: top-title
color: white
---

:: title ::

# Mismos datos, dos preguntas distintas

:: content ::

<div class="grid grid-cols-2 gap-6 mt-2">
<div class="p-5 rounded-lg border-2 border-orange-500 bg-white">

### Clasificación
**¿Ana aprobará?**

La respuesta es una **categoría**: Sí / No.

Se evalúa contando **aciertos y errores**.

</div>
<div v-click class="p-5 rounded-lg border-2 border-slate-200 bg-white">

### Regresión
**¿Qué calificación sacará Ana?**

La respuesta es un **número**: 7.8, 8.3…

Se evalúa midiendo **qué tan lejos** quedó la predicción.

</div>
</div>

<div v-click class="mt-8 text-lg">

Lo que decide si un problema es de clasificación no son los datos: es **el tipo de respuesta** que buscamos.

</div>

<!--
Pregunta al grupo: «¿El tumor es maligno?», «¿cuántos clientes llegarán mañana?», «¿qué dígito es esta imagen?». ¿Cuál es clasificación? Puente a la siguiente diapositiva: no todas las clasificaciones son iguales.
-->
<!--
Pregunta al grupo: ¿predecir la calificación final (0 a 10) es clasificación o regresión? ¿Y predecir si aprueba?
-->

---
layout: top-title
color: amber-light
---

:: title ::

# Tipos de problemas de clasificación

:: content ::

<div class="grid grid-cols-2 gap-4">
<div class="p-4 rounded-lg bg-white border border-slate-200">

### Binaria
Dos clases que se excluyen. <span class="text-orange-600 font-mono text-sm">aprueba / reprueba</span>
</div>
<div class="p-4 rounded-lg bg-white border border-slate-200">

### Multiclase
Tres o más clases excluyentes. <span class="text-orange-600 font-mono text-sm">dígitos 0–9, especies de Iris</span>
</div>
<div class="p-4 rounded-lg bg-white border border-slate-200">

### Multietiqueta
Varias etiquetas a la vez. <span class="text-orange-600 font-mono text-sm">película de acción y comedia</span>
</div>
<div class="p-4 rounded-lg bg-orange-50 border-2 border-orange-500">

### Desbalanceada
Una clase domina a otra. <span class="text-orange-600 font-mono text-sm">fraude con tarjeta</span>
</div>
</div>

<div v-click class="mt-4 text-sm text-orange-700">El caso desbalanceado obliga a mirar más allá de la exactitud. Lo vemos al final del módulo.</div>

---
layout: top-title
color: amber-light
---

:: title ::

# Aprender una función a partir de ejemplos

:: content ::

Datos: pares $(x_i, y_i)$ con $x_i \in \mathbb{R}^d$ y $y_i \in \{1,\dots,K\}$. Objetivo: $f:\mathbb{R}^d \to \{1,\dots,K\}$ que acierte en **datos que no ha visto**.

<div class="grid grid-cols-3 gap-4 mt-6">
<div class="p-4 rounded-lg bg-white border border-slate-200">

### Entrenamiento
70 % de los datos. El modelo aprende de aquí.
</div>
<div class="p-4 rounded-lg bg-white border border-slate-200">

### Prueba
30 %, apartado desde el inicio. Solo se usa al final.
</div>
<div class="p-4 rounded-lg bg-white border border-slate-200">

### Validación cruzada
Dentro del entrenamiento, para elegir hiperparámetros.
</div>
</div>

<div class="mt-6 text-sm opacity-80">En las demos: puntos <b>rellenos</b> = entrenamiento, puntos <b>huecos</b> = prueba.</div>

<!--
Si eliges k mirando el conjunto de prueba, tu estimación del error ya está sesgada.
-->

---
layout: top-title
color: amber-light
---

:: title ::

# Seis algoritmos clásicos

:: content ::

| Algoritmo | Idea central | Frontera |
|---|---|---|
| Regresión logística | sigmoide sobre una combinación lineal | lineal |
| **kNN** | clase mayoritaria de los $k$ vecinos | flexible, local |
| **Árbol de decisión** | cortes que reducen Gini o entropía | en escalones |
| **Random Forest** | muchos árboles con *bagging* que votan | escalones suaves |
| **SVM** | hiperplano de margen máximo; kernels | lineal o con kernel |
| **Naive Bayes** | Bayes + independencia dada la clase | lineal o cuadrática |

<div class="mt-4 text-sm opacity-80">En negritas: los que tienen demo interactiva en este módulo.</div>

---
layout: section
color: sky
---

# k-vecinos más cercanos

Dime con quién andas…

---
layout: two-cols-title
columns: is-5
color: sky-light
---

:: title ::

# kNN: el modelo es el conjunto de datos

:: left ::

Para un punto nuevo $x$:

<v-clicks>

1. Calcula la distancia $\lVert x - x_i \rVert$ a todos los puntos de entrenamiento.
2. Toma los $k$ más cercanos.
3. Predice la clase mayoritaria.

</v-clicks>

<div v-click class="mt-4 text-orange-700 font-semibold">No hay entrenamiento: todo el costo está en predecir.</div>

:: right ::

```python {all|2-4|5|6-7}
def predict(self, X_new):
    D = np.linalg.norm(
        X_new[:, None, :] - self.X[None, :, :],
        axis=2)                    # (m, n)
    vec = np.argsort(D, axis=1)[:, :self.k]
    return np.array([np.bincount(f).argmax()
                     for f in self.y[vec]])
```

<!--
Explicar el broadcasting (m,1,d) − (1,n,d). Nuestra implementación da 97.8 % en Iris, igual que scikit-learn.
-->

---
layout: top-title
color: sky-light
---

:: title ::

# Pruébalo: ¿qué k elegirías?

:: content ::

<KnnDemo />

<!--
1) k = 1: exactitud de entrenamiento 100 %, frontera llena de islas. 2) k = 45: frontera casi recta. 3) Haz clic para agregar un punto naranja en zona azul y mira cómo cambia la frontera con k pequeño.
-->

---
layout: section
color: emerald
---

# Árboles y bosques

Preguntas binarias que purifican los grupos

---
layout: two-cols-title
columns: is-6
color: emerald-light
---

:: title ::

# ¿Cómo elige un árbol dónde cortar?

:: left ::

Cada nodo prueba todos los cortes $x_j \le t$ y elige el que **más reduce la impureza**.

**Gini**
$$G = 1 - \sum_k p_k^2$$

**Entropía**
$$H = -\sum_k p_k \log_2 p_k$$

Ganancia = impureza(padre) − promedio ponderado de impureza(hijos).

:: right ::

<v-clicks>

- Es un algoritmo **voraz**: decide el mejor corte ahora, sin mirar adelante.
- Se detiene si el nodo es puro o llega a un límite.
- Sin límites, **memoriza**: hojas con un solo ejemplo.
- Controles: `max_depth`, `min_samples_leaf`, `ccp_alpha` (poda).
- ➕ interpretable, no necesita escalar · ➖ inestable, alta varianza.

</v-clicks>

<!--
Ejercicio: nodo con 40 setosas y 10 versicolor. Gini = 1 − 0.64 − 0.04 = 0.32; entropía ≈ 0.72 bits.
-->

---
layout: top-title
color: emerald-light
---

:: title ::

# Pruébalo: profundidad y sobreajuste

:: content ::

<ForestDemo mode="tree" />

<!--
Sube la profundidad poco a poco: la exactitud de entrenamiento llega a 100 % mientras la de prueba se estanca o baja. Esa brecha es el sobreajuste.
-->

---
layout: two-cols-title
columns: is-7
color: emerald-light
---

:: title ::

# Random Forest: muchos árboles distintos votan

:: left ::

<v-clicks>

1. **Bagging**: cada árbol se entrena con una muestra *bootstrap* (n filas con reemplazo).
2. **Subespacios**: en cada corte solo se consideran `max_features` variables al azar.
3. **Votación**: se promedia lo que dicen los $B$ árboles.

</v-clicks>

<div v-click class="mt-4">

Las filas que un árbol **no vio** (≈ 37 %) sirven para medir el error **OOB** (*out-of-bag*) sin apartar datos.

</div>

:: right ::

Varianza del promedio de $B$ árboles con varianza $\sigma^2$ y correlación $\rho$:

$$\rho\,\sigma^2 + \frac{1-\rho}{B}\,\sigma^2$$

Más árboles eliminan el segundo término; los pasos 1 y 2 reducen $\rho$, que es lo que realmente importa.

<!--
Ejercicio para perfil matemático: derivar la varianza del promedio de variables equicorrelacionadas. El 37 % sale de (1 − 1/n)^n → 1/e.
-->

---
layout: top-title
color: emerald-light
---

:: title ::

# Pruébalo: haz crecer el bosque

:: content ::

<ForestDemo mode="forest" />

<!--
Dale Play en «Círculos» con profundidad 6: el primer árbol hace una frontera en escalones; con decenas de árboles se suaviza. Compara el error OOB con la exactitud de prueba: casi coinciden.
-->

---
layout: section
color: violet
---

# Máquinas de vectores de soporte

La frontera con el mayor margen

---
layout: two-cols-title
columns: is-6
color: violet-light
---

:: title ::

# SVM: maximizar el margen

:: left ::

**Margen duro**
$$\min_{w,b}\ \tfrac12\lVert w\rVert^2 \quad\text{s.a.}\quad y_i(w^\top x_i + b) \ge 1$$

La distancia entre las líneas $w^\top x + b = \pm 1$ es $2/\lVert w\rVert$: minimizar $\lVert w\rVert$ = maximizar el margen.

<div v-click>

Solo los **vectores de soporte** (los puntos sobre el margen o dentro) definen la frontera.

</div>

:: right ::

<v-clicks>

**Margen suave**: el parámetro $C$
- $C$ grande → castiga errores, margen angosto.
- $C$ chico → tolera errores, margen ancho.

**Truco del kernel**
$$K(x,x') = e^{-\gamma\lVert x-x'\rVert^2}$$
Separa en un espacio de mayor dimensión sin calcularlo. $\gamma$ grande = fronteras muy locales.

</v-clicks>

<!--
En scikit-learn: SVC(kernel="rbf", C=1.0, gamma="scale"). Escalar siempre antes, igual que en kNN.
-->

---
layout: top-title
color: violet-light
---

:: title ::

# Pruébalo: C, kernel y vectores de soporte

:: content ::

<SvmDemo />

<!--
1) Grupos + lineal: baja C y mira cómo el margen se ensancha y aumentan los vectores de soporte. 2) Círculos + lineal: no hay recta que sirva. Cambia a RBF. 3) Sube γ al máximo: la frontera rodea punto por punto (sobreajuste).
-->

---
layout: section
color: pink
---

# Naive Bayes

Probabilidades con un supuesto ingenuo

---
layout: two-cols-title
columns: is-6
color: pink-light
---

:: title ::

# Naive Bayes paso a paso

:: left ::

<v-clicks>

**1 · Teorema de Bayes**
$$P(y\mid x) = \frac{P(x\mid y)\,P(y)}{P(x)}$$

**2 · Supuesto ingenuo**: variables independientes dada la clase
$$P(x\mid y) = \prod_j P(x_j\mid y)$$

**3 · Predicción** (con logaritmos para evitar *underflow*)
$$\hat y = \arg\max_y\ \log P(y) + \sum_j \log P(x_j\mid y)$$

</v-clicks>

:: right ::

<div class="grid grid-cols-1 gap-3 mt-2">
<div class="p-3 rounded-lg bg-white border border-slate-200"><b>Gaussiano</b> · variables continuas</div>
<div class="p-3 rounded-lg bg-white border border-slate-200"><b>Multinomial</b> · conteos de palabras</div>
<div class="p-3 rounded-lg bg-white border border-slate-200"><b>Bernoulli</b> · presencia / ausencia</div>
</div>

<div class="mt-4 text-sm">El supuesto casi nunca se cumple, pero la clase con mayor puntaje suele ser la correcta. Es muy rápido y una base fuerte para texto.</div>

---
layout: top-title
color: pink-light
---

:: title ::

# Pruébalo: ¿es spam?

:: content ::

<NbSpam />

<!--
Los conteos son inventados, solo para ilustrar. Con gratis + reunión y P(spam) = 0.4 sale 69 %, como en el ejemplo del pizarrón. Luego: marcar «criptomoneda» con α = 0 → P(normal) = 0 aunque el resto del correo parezca normal. Subir α a 1 (suavizado de Laplace) lo corrige.
-->

---
layout: top-title
color: pink-light
---

:: title ::

# Pruébalo: Naive Bayes gaussiano

:: content ::

<NbGauss />

<!--
Con «Grupos» funciona muy bien. Con «Correlacionados» las elipses no pueden inclinarse: el modelo ignora la correlación y la frontera queda torcida. Con «Lunas» la frontera cuadrática no basta.
-->

---
layout: section
color: red
---

# Evaluación

La exactitud no cuenta toda la historia

---
layout: two-cols-title
columns: is-6
color: red-light
---

:: title ::

# Métricas a partir de la matriz de confusión

:: left ::

|  | predice + | predice − |
|---|---|---|
| **real +** | VP | FN |
| **real −** | FP | VN |

<v-clicks>

- **Exactitud** $= \dfrac{VP+VN}{n}$
- **Precisión** $= \dfrac{VP}{VP+FP}$: de los que marqué positivos, ¿cuántos lo eran?
- **Recall** $= \dfrac{VP}{VP+FN}$: de los positivos reales, ¿cuántos encontré?

</v-clicks>

:: right ::

<v-clicks>

- **F1** $= \dfrac{2PR}{P+R}$: media armónica, solo es alta si ambas lo son.
- **ROC**: tasa de verdaderos positivos contra tasa de falsos positivos al mover el umbral.
- **AUC**: área bajo la ROC. 0.5 = azar, 1 = perfecto. Es la probabilidad de que un positivo al azar reciba mayor puntaje que un negativo al azar.

</v-clicks>

<!--
En cáncer de mama, nuestro Random Forest confundió 4 malignos con benignos: recall de la clase maligna 0.92. En medicina un FN cuesta más que un FP.
-->

---
layout: top-title
color: red-light
---

:: title ::

# Pruébalo: umbral, desbalance y ROC

:: content ::

<EvalDemo />

<!--
1) Baja el % de positivos a 2 %: la exactitud sube aunque el modelo sea igual, y «siempre −» ya da 98 %. 2) Mueve el umbral: precisión y recall se intercambian; el punto recorre la ROC. 3) Cambia la separación: solo eso mueve la AUC.
-->

---
layout: top-title
color: amber-light
---

:: title ::

# Cáncer de mama: tres modelos, mismo split

:: content ::

| Modelo | CV media | CV desv. | Prueba |
|---|---|---|---|
| kNN escalado ($k=7$) | 0.965 | 0.017 | 0.979 |
| Árbol sin límite de profundidad | 0.930 | 0.028 | 0.923 |
| Random Forest (300 árboles) | 0.962 | 0.020 | 0.958 |

<div class="grid grid-cols-2 gap-4 mt-6">
<div class="p-4 rounded-lg bg-white border border-slate-200"><div class="text-3xl font-bold text-slate-500">0.925 ± 0.027</div>árbol solo, exactitud en 30 particiones distintas</div>
<div class="p-4 rounded-lg bg-white border border-slate-200"><div class="text-3xl font-bold text-blue-600">0.961 ± 0.015</div>Random Forest en las mismas 30 particiones</div>
</div>

<!--
El bosque no siempre gana en exactitud puntual (aquí kNN escalado empata o gana), pero es mucho más estable que un árbol solo. Ejercicio 3 del notebook.
-->

---
layout: top-title
color: amber-light
---

:: title ::

# Resumen: ¿cuál uso?

:: content ::

| | Escalar | Interpretable | Fuerte en |
|---|---|---|---|
| Regresión logística | sí | alta | líneas base, riesgo |
| kNN | **indispensable** | ejemplos parecidos | datos pequeños |
| Árbol | no | **alta** | reglas explicables |
| Random Forest | no | importancia de variables | datos tabulares |
| SVM | **indispensable** | baja | alta dimensión, texto |
| Naive Bayes | no | media | texto, muy rápido |

<!--
Reto del notebook: predecir si un alumno aprueba con horas, asistencia y semestre. Ambos modelos rondan 70 %; las horas de estudio son la variable más importante.
-->

---
layout: cover
color: navy
---

# Siguiente: agentes

Notebook de práctica · `04_clasificacion_knn_rf`
