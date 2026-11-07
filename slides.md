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


# Agentes

**Escuela de Machine Learning Honduras 2026**

Daniela Pinto Veizaga

<div class="text-sm opacity-80 mt-6">Fundamentos · herramientas · memoria · planificación · multiagente · producción</div>

<!--
Las diapositivas con controles son interactivas. Todas las demos son simulaciones: no hay un modelo de lenguaje corriendo detrás, así funcionan sin internet y siempre igual en clase.
-->

---
layout: top-title
color: white
---

:: title ::

# Contenido

:: content ::

<div class="grid grid-cols-3 gap-4">
<div class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### 1 · Fundamentos
Flujos vs. agentes, el ciclo ReAct y los tipos clásicos de agentes.
</div>
<div class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### 2 · Herramientas
Function calling, buenas interfaces y protocolos (MCP, A2A).
</div>
<div class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### 3 · Memoria
Ventana de contexto, memoria de largo plazo y RAG.
</div>
<div class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### 4 · Planificación
Reflexión, descomposición en tareas y saber cuándo parar.
</div>
<div class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### 5 · Multiagente
Orquestar o colaborar, roles y frameworks.
</div>
<div class="p-4 rounded-lg border-2 border-orange-500 bg-white">

### 6 · Producción
Evaluar, observar y proteger un agente real.
</div>
</div>

---
layout: top-title
color: white
---

:: title ::

# Del chatbot al agente

:: content ::

<div class="grid grid-cols-3 gap-4 mt-2">
<div v-click class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### Chatbot
Recibe un mensaje y **responde texto**. No actúa en el mundo.

<div class="text-sm text-slate-500 mt-2">«¿Qué es Random Forest?»</div>
</div>
<div v-click class="p-4 rounded-lg border-2 border-slate-200 bg-white">

### LLM con herramientas
Puede **llamar una función** (calculadora, base de datos) y usar el resultado.

<div class="text-sm text-slate-500 mt-2">«¿Cuántos alumnos aprobaron?»</div>
</div>
<div v-click class="p-4 rounded-lg border-2 border-orange-500 bg-white">

### Agente
Decide **qué hacer, en qué orden y cuándo parar**, en un ciclo, hasta cumplir una meta.

<div class="text-sm text-slate-500 mt-2">«Analiza estos datos y prepárame un reporte»</div>
</div>
</div>

<div v-click class="mt-8 text-lg">

Un **agente** es un modelo de lenguaje que **usa herramientas en un ciclo** y **dirige su propio proceso** para lograr una meta.

</div>

---
layout: section
color: sky
---

# 1 · Fundamentos

Flujos de trabajo, agentes y el ciclo ReAct

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# El bloque básico: el LLM aumentado

:: left ::

<svg viewBox="0 0 380 260" width="380" height="260">
  <rect x="130" y="100" width="120" height="60" rx="12" fill="#ffedd5" stroke="#ea580c" stroke-width="2"/>
  <text x="190" y="136" text-anchor="middle" style="font-size:18px;font-weight:700" fill="#0f172a">LLM</text>
  <g v-click="1"><rect x="10" y="20" width="110" height="44" rx="10" fill="#f8fafc" stroke="#475569"/><text x="65" y="47" text-anchor="middle" style="font-size:14px">🔧 Herramientas</text><line x1="120" y1="55" x2="150" y2="100" stroke="#64748b" stroke-width="2"/></g>
  <g v-click="2"><rect x="260" y="20" width="110" height="44" rx="10" fill="#f8fafc" stroke="#475569"/><text x="315" y="47" text-anchor="middle" style="font-size:14px">📚 Recuperación</text><line x1="260" y1="55" x2="230" y2="100" stroke="#64748b" stroke-width="2"/></g>
  <g v-click="3"><rect x="135" y="200" width="110" height="44" rx="10" fill="#f8fafc" stroke="#475569"/><text x="190" y="227" text-anchor="middle" style="font-size:14px">🧠 Memoria</text><line x1="190" y1="160" x2="190" y2="200" stroke="#64748b" stroke-width="2"/></g>
  <text x="10" y="140" style="font-size:13px" fill="#64748b">entrada →</text>
  <text x="262" y="140" style="font-size:13px" fill="#64748b">→ salida</text>
</svg>

:: right ::

Todo sistema con agentes empieza aquí: un LLM al que le damos

<v-clicks>

- **herramientas** para actuar (APIs, código, buscadores);
- **recuperación** para consultar información que no memorizó;
- **memoria** para recordar lo que pasó antes.

</v-clicks>

<div v-click="4" class="mt-4 p-3 rounded-lg border-2 border-orange-500 bg-white">

Con estas piezas se arman **flujos de trabajo** o **agentes**. La diferencia está en **quién decide el camino**.

</div>

---
layout: top-title
color: white
---

:: title ::

# Flujos de trabajo vs. agentes

:: content ::

| | Flujo de trabajo | Agente |
|---|---|---|
| ¿Quién decide los pasos? | **Tu código**: caminos predefinidos | **El LLM**, en cada momento |
| Predecible | Sí | Menos |
| Costo y tiempo | Bajos y estables | Más altos y variables |
| Ideal para | Tareas bien definidas | Problemas abiertos |
| Ejemplos | encadenamiento, enrutamiento, paralelización | agente de código, asistente de investigación |

<div v-click class="mt-6 p-3 rounded-lg bg-orange-50 border-l-4 border-orange-500">

**Regla de oro:** empieza con la solución **más simple** que funcione. Agrega autonomía solo cuando mejore los resultados de forma medible.

</div>

<!--
Esta distinción viene del artículo «Building effective agents» de Anthropic (diciembre de 2024): los flujos coordinan LLMs y herramientas por caminos de código predefinidos; los agentes dirigen dinámicamente su propio proceso.
-->

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: seis patrones, del más fijo al más autónomo

:: content ::

<AgPatterns />

<!--
Recorrer en orden. Preguntar en cada uno: ¿quién decide el camino, el código o el modelo? En orquestador–trabajadores el número de trabajadores cambia en cada simulación: eso ya lo decide el LLM.
-->

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Anatomía de un agente: el ciclo ReAct

:: left ::

**ReAct** = *Reason + Act* (Yao et al., 2022). El agente alterna:

<v-clicks>

1. **Pensar**: razona qué le falta para cumplir la meta.
2. **Actuar**: llama una herramienta.
3. **Observar**: lee el resultado y lo agrega a su historia.

</v-clicks>

<div v-click class="mt-3">

…y repite hasta poder **responder** o decidir **parar**.

Es el ciclo clásico **percibir → razonar → actuar**.

</div>

:: right ::

```python {all|4|5-6|7-8|9-11}
historia = [sistema, tarea]
for paso in range(MAX_PASOS):
    salida = llm(historia, herramientas)
    if salida.es_respuesta_final:
        return salida.texto
    accion = salida.llamada_herramienta
    resultado = ejecutar(accion)          # tu código
    historia += [accion, resultado]       # observar
return "No pude terminar: pido ayuda"
```

<div class="text-sm text-slate-500 mt-2">Casi todos los frameworks de agentes son, por dentro, este ciclo.</div>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: el ciclo Pensar → Actuar → Observar

:: content ::

<AgReact start="clima" />

<!--
1) Escenario «Clima»: dos herramientas encadenadas. 2) «Error de herramienta»: el mensaje de error bien escrito le permite al agente corregirse solo (esto conecta con interfaces agente-computadora). Observar cómo crece el contexto en cada paso.
-->

---
layout: top-title
color: white
---

:: title ::

# Tipos clásicos de agentes

:: content ::

De la inteligencia artificial clásica (Russell y Norvig). Cada tipo agrega una capacidad:

| Tipo | Qué agrega | Pregunta que se hace |
|---|---|---|
| Reflejo simple | reglas condición → acción | «¿Qué veo ahora?» |
| Basado en modelo | un estado interno del mundo | «¿Cómo está el mundo, aunque no lo vea?» |
| Basado en metas | una meta y planificación | «¿Qué me acerca a la meta?» |
| Basado en utilidad | una medida de qué tan bueno es cada resultado | «¿Cuál opción es **mejor**?» |
| Que aprende | mejora con la experiencia | «¿Cómo lo hago mejor la próxima vez?» |

<div class="mt-4 text-sm">Un agente con LLM mezcla varios: usa un **modelo** del mundo (su contexto), persigue **metas** y puede **aprender** de la retroalimentación.</div>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: cuatro robots de limpieza, un mismo mapa

:: content ::

<AgWorld />

<!--
Comparar con el mismo mapa: el reflejo simple vaga al azar; el basado en modelo explora mejor; el de metas va directo a la suciedad pero se queda sin batería; el de utilidad sacrifica pasos para recargar y termina. Pregunta: ¿cuál tiene mejor utilidad y por qué?
-->

---
layout: section
color: violet
---

# 2 · Herramientas

Cómo un modelo de lenguaje actúa en el mundo

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Function calling: el modelo escribe JSON

:: left ::

<v-clicks>

1. Le das al modelo la **lista de herramientas** con un esquema JSON.
2. El modelo decide si usar una y **genera** el nombre y los argumentos.
3. **Tu código** valida y ejecuta la función.
4. El resultado vuelve al modelo como una **observación**.

</v-clicks>

<div v-click class="mt-4 p-3 rounded-lg border-2 border-orange-500 bg-white">

El modelo **nunca ejecuta nada**. Tú decides qué se ejecuta y con qué permisos.

</div>

:: right ::

```json
{
  "name": "clima",
  "description": "Pronóstico para una ciudad de Honduras.",
  "parameters": {
    "type": "object",
    "properties": {
      "ciudad": { "type": "string" },
      "dia": { "type": "string", "enum": ["hoy", "mañana"] }
    },
    "required": ["ciudad", "dia"]
  }
}
```

<div class="text-sm mt-2">El modelo responde: <code>{"name": "clima", "arguments": {"ciudad": "Tegucigalpa", "dia": "mañana"}}</code></div>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: de la pregunta a la llamada

:: content ::

<AgToolCall />

<!--
1) Con esquema claro, ejecutar las tres preguntas. 2) Cambiar a esquema pobre: el modelo elige mal porque los nombres no dicen nada. 3) Editar el JSON para provocar errores: el mensaje de error es parte de la interfaz.
-->

---
layout: top-title
color: white
---

:: title ::

# Interfaces agente-computadora (ACI)

:: content ::

Diseña tus herramientas pensando en quien las va a usar: **un modelo**. Dedícale tanto cuidado como al prompt.

<div class="grid grid-cols-2 gap-x-8 mt-2">
<div>
<v-clicks>

- **Nombres y descripciones claros**, con ejemplos de uso.
- **Parámetros difíciles de usar mal**: `enum`, tipos, valores obligatorios.
- **Errores que enseñan**: «usa `nombre_completo`», no solo «error 400».
- **Respuestas cortas** y relevantes: cada token cuesta.

</v-clicks>
</div>
<div>
<v-clicks>

- **Ambiente aislado** (*sandbox*) para ejecutar código.
- **Mínimo privilegio**: solo las herramientas que la tarea necesita.
- **Pruébalas** con el modelo y revisa sus errores.
- **Pocas herramientas bien hechas** mejor que muchas confusas.

</v-clicks>
</div>
</div>

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Protocolos: MCP y A2A

:: left ::

### MCP · Model Context Protocol

Estándar abierto para **conectar una aplicación de IA con herramientas y datos**: se escribe un servidor una vez y lo usa cualquier cliente compatible.

- Un servidor MCP ofrece **herramientas**, **recursos** y **prompts**.
- Lo presentó Anthropic en noviembre de 2024; en diciembre de 2025 lo donó a la Agentic AI Foundation, de la Linux Foundation.

:: right ::

### A2A · Agent-to-Agent

Estándar abierto para que **agentes de distintos proveedores se comuniquen** y se deleguen tareas.

- Cada agente publica una **Agent Card**: qué sabe hacer y cómo contactarlo.
- Lo lanzó Google en abril de 2025 y desde junio de 2025 lo aloja la Linux Foundation.

<div v-click class="mt-4 p-3 rounded-lg border-2 border-orange-500 bg-white">

Se **complementan**: MCP conecta un agente con sus **herramientas**; A2A conecta **agentes entre sí**.

</div>

<!--
Fuentes: anuncio de Anthropic del 9 de diciembre de 2025 sobre la donación de MCP a la Agentic AI Foundation; comunicado de la Linux Foundation del 9 de abril de 2026 sobre A2A (más de 150 organizaciones). Estos estándares evolucionan rápido: revisar modelcontextprotocol.io y a2a-protocol.org antes de cada edición del curso.
-->

---
layout: section
color: emerald
---

# 3 · Memoria y contexto

Qué recuerda un agente y cómo

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Memoria de corto plazo: la ventana de contexto

:: left ::

Un LLM **no recuerda nada** entre llamadas. Su «memoria» es lo que le enviamos en cada llamada:

<v-clicks>

- instrucciones del sistema,
- descripciones de herramientas,
- historial de la conversación y de acciones,
- documentos recuperados,
- la pregunta actual.

</v-clicks>

:: right ::

<v-clicks>

Todo eso debe caber en la **ventana de contexto** (medida en *tokens*).

**Ingeniería de contexto**: elegir qué entra en cada llamada.

- **Ventana deslizante**: solo lo reciente.
- **Resumen**: comprimir lo viejo.
- **Podar**: quitar resultados de herramientas que ya no sirven.

Más contexto no siempre es mejor: cuesta más, es más lento y la información importante se puede perder entre tanto texto.

</v-clicks>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: ¿cabe todo en la ventana?

:: content ::

<AgContext />

<!--
1) Con «Guardar todo», subir los turnos hasta desbordar 32 000 tokens. 2) Cambiar a ventana deslizante: ya cabe, pero se olvidan turnos. 3) Resumen: se conserva la idea de lo viejo. 4) Subir herramientas a 60: las herramientas también ocupan contexto.
-->

---
layout: top-title
color: white
---

:: title ::

# Memoria de largo plazo

:: content ::

Lo que debe sobrevivir entre conversaciones se guarda **fuera** del modelo y se recupera cuando hace falta.

| Tipo | Qué guarda | Ejemplo |
|---|---|---|
| **Episódica** | experiencias pasadas | «La semana pasada el usuario pidió gráficas en azul» |
| **Semántica** | hechos y conocimiento | «El curso dura 6 semanas», documentos, manuales |
| **Procedimental** | cómo hacer las cosas | instrucciones, reglas aprendidas, habilidades |

<div v-click class="mt-4">

**¿Dónde se guarda?** Muchas veces en una **base de datos vectorial**: cada texto se convierte en un **embedding** (un vector que representa su significado) y se busca por **similitud**, no por palabras exactas.

</div>

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# RAG: generación aumentada por recuperación

:: left ::

### Indexar (una vez)

<v-clicks>

1. Partir los documentos en **trozos**.
2. Calcular el **embedding** de cada trozo.
3. Guardarlos en una base vectorial.

</v-clicks>

:: right ::

### Consultar (en cada pregunta)

<v-clicks>

1. Calcular el embedding de la **pregunta**.
2. Buscar los **k trozos más parecidos**.
3. Ponerlos en el prompt como **contexto**.
4. El modelo responde **citando** ese contexto.

</v-clicks>

<div v-click class="mt-4 p-3 rounded-lg border-2 border-orange-500 bg-white">

RAG reduce las respuestas inventadas y permite usar información **privada o reciente** sin reentrenar el modelo.

</div>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: un buscador RAG en miniatura

:: content ::

<AgRag />

<!--
1) Probar las preguntas sugeridas y ver qué documentos suben. 2) Escribir una pregunta que no está en la base («¿Cuánto cuesta el curso?»): el prompt dice «no se encontró nada» y el modelo debe admitir que no sabe. 3) Probar sinónimos que TF-IDF no entiende: motiva el uso de embeddings.
-->

---
layout: section
color: amber
---

# 4 · Planificación y razonamiento

Reflexionar, descomponer y saber cuándo parar

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Reflexión y autocorrección

:: left ::

El patrón **evaluador–optimizador**:

<v-clicks>

1. Un **generador** propone una solución.
2. Un **evaluador** la critica: pruebas, rúbrica u otro LLM.
3. La crítica vuelve al generador, que **corrige**.
4. Se repite hasta pasar el criterio **o** llegar al máximo de intentos.

</v-clicks>

:: right ::

<v-clicks>

**Funciona bien cuando** hay un criterio claro y verificable:

- pruebas unitarias para código,
- un compilador o un validador,
- una rúbrica explícita.

**Cuidado:** un modelo que se evalúa a sí mismo sin un criterio externo puede aprobar sus propios errores.

</v-clicks>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: generar, evaluar, corregir

:: content ::

<AgReflect />

<!--
Avanzar con «Evaluar» y «Corregir». Luego poner el máximo en 2: el ciclo se detiene con una prueba fallando y debe escalar a un humano. Pregunta: ¿qué pasaría si el evaluador fuera el mismo modelo sin pruebas?
-->

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Descomposición y planificación

:: left ::

Una meta abierta se parte en **subtareas**:

<v-clicks>

- **Lista de pasos**: plan lineal, fácil de seguir.
- **Árbol de pensamientos** (*Tree of Thoughts*): explorar varias ramas, evaluarlas y quedarse con la mejor.
- **DAG** (grafo dirigido acíclico): qué tarea **depende** de cuál. Lo independiente corre **en paralelo**.

</v-clicks>

:: right ::

<v-clicks>

**Planificar y luego ejecutar**:

1. El agente escribe un plan.
2. Lo ejecuta paso a paso.
3. Si algo falla, **replanifica** en vez de insistir.

Un plan explícito también ayuda a los **humanos**: se puede revisar antes de ejecutar.

</v-clicks>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: un plan como grafo de tareas

:: content ::

<AgPlan />

<!--
1) Ejecutar el plan: «Descargar datos» y «Buscar estudios» corren en paralelo. 2) Activar la falla: el agente agrega «Modelo más simple» y reconecta el grafo. Comparar los turnos de tiempo con hacer las 8 tareas una por una.
-->

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Metacognición: saber cuándo parar

:: left ::

Un buen agente sabe:

<v-clicks>

- **Cuándo terminó**: hay criterio de éxito.
- **Cuándo está atascado**: repite la misma acción con el mismo resultado.
- **Cuándo pedir ayuda**: falta información, hay ambigüedad o la acción es riesgosa.
- **Cuándo no le alcanza el presupuesto**: pasos, tiempo o dinero.

</v-clicks>

:: right ::

<v-clicks>

**Se implementa con dos cosas:**

1. **Reglas en tu código**: máximo de pasos, presupuesto de tokens, detector de acciones repetidas.
2. **Instrucciones al modelo**: «si no estás seguro, pregunta», «si una herramienta falla dos veces, cambia de estrategia».

Pedir ayuda a tiempo **no es un fracaso**: es mejor que inventar una respuesta o gastar sin avanzar.

</v-clicks>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: un agente atascado

:: content ::

<AgReact start="bucle" />

<!--
Apagar el detector de repeticiones y subir el límite de pasos a 15: el agente desperdicia llamadas. Encender el detector: se detiene al tercer intento y le pide al usuario la información que falta.
-->

---
layout: section
color: pink
---

# 5 · Sistemas multiagente

Varios agentes especializados trabajando juntos

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Orquestar o colaborar

:: left ::

### Orquestación (centralizada)
Un **orquestador** reparte el trabajo a **trabajadores** y junta los resultados.

### Colaboración (descentralizada)
Los agentes **conversan entre pares** y se reparten el trabajo solos («enjambre»).

:: right ::

### Especialización de roles

Cada subagente puede tener:

<v-clicks>

- su **rol** y sus instrucciones (investigador, analista, revisor…);
- sus propias **herramientas** (solo el analista ejecuta código);
- su propia **memoria** y su propio contexto, más pequeño y enfocado.

</v-clicks>

<div v-click class="mt-3 p-3 rounded-lg bg-orange-50 border-l-4 border-orange-500 text-sm">

Más agentes **no siempre es mejor**: multiplican el costo y los puntos de falla. Úsalos cuando la tarea se divide de forma natural.

</div>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: tres formas de organizar un equipo de agentes

:: content ::

<AgMulti />

<!--
Correr las tres topologías y comparar mensajes. El enjambre suele usar muchos más mensajes y cambia en cada corrida. Pregunta: ¿cuál depurarías más fácil si el informe sale mal?
-->

---
layout: top-title
color: white
---

:: title ::

# Frameworks para construir agentes

:: content ::

| Framework | Idea central | Bueno para |
|---|---|---|
| **LangGraph** | el agente como un **grafo de estados** con ciclos | control fino, flujos con bucles |
| **LlamaIndex** | conectar LLMs con **tus datos** | RAG y agentes sobre documentos |
| **CrewAI** | equipos de agentes con **roles** | multiagente por roles |
| **AutoGen** | agentes que **conversan** entre sí | colaboración entre pares |
| **smolagents** | agentes mínimos que **escriben código** como acciones | aprender, prototipos |

<div v-click class="mt-4">

Los frameworks cambian muy rápido; **los patrones no**. Aprende primero el ciclo con llamadas directas a la API y usa un framework cuando te ahorre trabajo real.

</div>

<!--
Para práctica guiada: el curso gratuito de agentes de Hugging Face usa smolagents, LlamaIndex y LangGraph; el curso «AI Agents for Beginners» de Microsoft usa AutoGen y Semantic Kernel. Verificar versiones antes de clase.
-->

---
layout: section
color: red
---

# 6 · Producción, evaluación y seguridad

De la demo al sistema confiable

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# ¿Cómo se evalúa un agente?

:: left ::

<v-clicks>

- **Tasa de éxito** en un conjunto de tareas de prueba con respuesta conocida.
- **Calificar pasos intermedios**: ¿eligió la herramienta correcta?, ¿con buenos argumentos?
- **LLM como juez** con rúbrica, cuando no hay respuesta exacta (y revisar al juez).
- **Costo y tiempo** por tarea.

</v-clicks>

:: right ::

<v-clicks>

**Pruebas de regresión**: los agentes **no son deterministas**. Corre cada tarea **varias veces** y compara distribuciones, no un solo resultado.

Dos métricas útiles con $k$ intentos y éxito $p$ por intento:

$$\text{pass@}k = 1-(1-p)^k \qquad \text{pass}^k = p^k$$

</v-clicks>

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: confiabilidad y errores que se acumulan

:: content ::

<AgPassK />

<!--
1) Con p = 70 %, pass@3 ≈ 97 % pero pass^3 ≈ 34 %: depende de qué necesitas. 2) Panel derecho: con 95 % por paso y 20 pasos, el éxito cae a ~36 %. Por eso se evalúan los pasos intermedios y se prefieren tareas cortas.
-->

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Observabilidad: ver lo que hizo el agente

:: left ::

Una **traza** registra cada paso: prompts, llamadas a herramientas, resultados, tokens, tiempo y costo.

<div class="mt-3 font-mono text-sm p-3 rounded-lg bg-slate-50 border border-slate-200">
▾ tarea: «reporte de deserción» · 41 s · 0.18 USD<br>
&nbsp;&nbsp;▸ llm: plan · 2.1 s · 1 830 tokens<br>
&nbsp;&nbsp;▸ herramienta: descargar_datos · 3.4 s<br>
&nbsp;&nbsp;▸ herramienta: entrenar_modelo · <span class="text-red-600">❌ error</span><br>
&nbsp;&nbsp;▸ llm: replanificar · 1.7 s<br>
&nbsp;&nbsp;▸ …
</div>

<div class="text-xs text-slate-500 mt-1">Ejemplo ilustrativo.</div>

:: right ::

<v-clicks>

**¿Para qué?**

- **Depurar**: ¿en qué paso se equivocó?
- **Medir** costo y latencia reales.
- **Construir evaluaciones** con casos reales que fallaron.

**Herramientas**: LangSmith, Langfuse, Arize Phoenix. Muchas usan el estándar **OpenTelemetry**.

</v-clicks>

---
layout: two-cols-title
columns: is-6
color: white
---

:: title ::

# Seguridad: qué puede salir mal

:: left ::

<v-clicks>

- **Inyección de prompts**: texto malicioso dentro de un correo, una página o un documento le da órdenes al agente.
- **Ejecución no autorizada**: el agente borra, paga o envía algo que nadie aprobó.
- **Bucles de costo**: un agente atascado gasta tokens sin parar.
- **Fuga de datos**: información privada sale hacia afuera.

</v-clicks>

:: right ::

<div v-click class="p-4 rounded-lg border-2 border-red-500 bg-white">

### La combinación peligrosa

Un agente que a la vez:
1. tiene acceso a **datos privados**,
2. lee **contenido no confiable**, y
3. puede **comunicarse hacia afuera**,

puede ser engañado para filtrar tus datos. Si es posible, **quita al menos una** de las tres.

</div>

<!--
Simon Willison llama a esta combinación «la trifecta letal» (2025). No existe hoy una defensa perfecta contra la inyección de prompts: la seguridad viene de limitar lo que el agente puede hacer.
-->

---
layout: top-title
color: white
---

:: title ::

# Pruébalo: un correo con instrucciones escondidas

:: content ::

<AgGuard />

<!--
1) Sin defensas: fuga. 2) Solo «marcar como no confiable» y ejecutar varias veces: a veces falla. 3) Mínimo privilegio: la acción se bloquea aunque el modelo sea engañado. 4) El límite de pasos no ayuda contra este ataque: cada defensa cubre un riesgo distinto.
-->

---
layout: top-title
color: white
---

:: title ::

# Lista de revisión antes de producción

:: content ::

<div class="grid grid-cols-2 gap-x-10">
<div>

**Diseño**
- ¿Un flujo de trabajo simple resolvería esto?
- ¿Herramientas claras, con mínimo privilegio?
- ¿Criterio de éxito y criterio de parada?

**Evaluación**
- ¿Conjunto de tareas de prueba con respuesta conocida?
- ¿Varias corridas por tarea?
- ¿Pruebas de regresión antes de cada cambio?

</div>
<div>

**Operación**
- ¿Trazas de cada paso?
- ¿Límites de pasos, tiempo y costo?
- ¿Alertas cuando algo falla?

**Seguridad**
- ¿Contenido externo tratado como no confiable?
- ¿Confirmación humana para acciones sensibles?
- ¿Ambiente aislado para ejecutar código?

</div>
</div>

---
layout: top-title
color: white
---

:: title ::

# Para seguir aprendiendo

:: content ::

- **Hugging Face · AI Agents Course** (gratuito): [huggingface.co/learn/agents-course](https://huggingface.co/learn/agents-course/unit0/introduction)
- **Microsoft · AI Agents for Beginners** (gratuito): [github.com/microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)
- **Anthropic · Building effective agents** (2024): los patrones de este módulo.
- **Yao et al. · ReAct: Synergizing Reasoning and Acting in Language Models** (2022).
- **Model Context Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io) · **A2A**: [a2a-protocol.org](https://a2a-protocol.org)

<div class="mt-8 p-4 rounded-lg border-2 border-orange-500 bg-white text-lg">

**Idea para llevarse:** un agente es un LLM en un ciclo con herramientas. Lo difícil no es el ciclo: es darle **buenas herramientas**, el **contexto correcto**, **límites claros** y **evaluarlo** en serio.

</div>
