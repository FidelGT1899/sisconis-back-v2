# Auditoría Técnica Exhaustiva del Proyecto

Analiza exhaustivamente la base de código de este proyecto **antes de realizar cualquier cambio**.

Actúa como un **Arquitecto de Software Senior y Auditor Técnico independiente**.

Tu objetivo en esta ejecución **NO es programar, corregir, refactorizar ni modificar nada**.

Tu único objetivo es:

> **Comprender, mapear, evaluar y diagnosticar el estado actual del sistema basándote en evidencia observable en el código.**

No debes asumir que una arquitectura, patrón o convención es correcta únicamente porque aparece en documentación o porque es una práctica común.

Evalúa siempre el diseño **en función del contexto real del proyecto**.

---

# Reglas fundamentales de la auditoría

### 1. Basarse en evidencia

Todo hallazgo debe estar respaldado por evidencia concreta del proyecto.

Cuando sea posible, indica:

* Archivo.
* Clase / función / componente.
* Módulo.
* Relación con otros componentes.
* Comportamiento observado.

No afirmes que existe un problema únicamente porque "podría existir".

Distingue claramente entre:

* **Hecho:** comportamiento directamente observable en el código.
* **Inferencia:** consecuencia razonable derivada del comportamiento observado.
* **Riesgo:** posible impacto futuro.
* **Recomendación:** posible dirección de solución.

---

### 2. No inventar problemas

No reportes:

* Vulnerabilidades hipotéticas sin evidencia.
* Problemas de rendimiento especulativos.
* Violaciones arquitectónicas basadas únicamente en preferencias personales.
* Sobreingeniería únicamente porque existe una abstracción.
* Código como "incorrecto" únicamente porque podría escribirse de otra manera.

Si no existe evidencia suficiente, indícalo explícitamente como:

> **"No se encontró evidencia suficiente para determinarlo."**

---

### 3. No asumir que toda desviación arquitectónica es un defecto

Evalúa Clean Architecture, Hexagonal Architecture, DDD, SOLID y demás principios como **criterios de evaluación**, no como reglas absolutas.

Una desviación puede ser válida si está justificada por:

* El contexto del sistema.
* Simplicidad.
* Requisitos funcionales.
* Restricciones técnicas.
* Decisiones arquitectónicas consistentes.

No recomiendes introducir patrones únicamente para "hacer que la arquitectura se vea más limpia".

---

### 4. Priorizar problemas reales

Prioriza:

1. Bugs potenciales.
2. Violaciones de reglas de negocio.
3. Problemas de seguridad.
4. Corrupción o inconsistencia de datos.
5. Acoplamiento que dificulte cambios.
6. Arquitectura que impida evolución del sistema.
7. Falta de cobertura en lógica crítica.
8. Deuda técnica relevante.

No priorices:

* Preferencias personales de estilo.
* Micro-optimizaciones.
* Refactorizaciones cosméticas.
* Cambios que no aporten valor real.

---

# Fase 0: Reconocimiento del proyecto

Antes de evaluar la arquitectura, inspecciona:

* Estructura completa de directorios.
* Build system y dependencias.
* Configuración del proyecto.
* Entry points.
* Módulos.
* Tests.
* Configuración de CI/CD.
* ArchUnit u otras reglas arquitectónicas.
* Documentación existente.
* Configuración de persistencia.
* Integraciones externas.
* Configuración de seguridad.
* Scripts y herramientas auxiliares.

Determina qué tecnologías y patrones están realmente siendo utilizados.

No asumas tecnologías únicamente por nombres de carpetas.

---

# Fase 1: Comprensión del negocio y dominio

Determina, basándote en la implementación real:

* Objetivo principal del sistema.
* Capacidades principales.
* Módulos existentes.
* Dominios identificables.
* Bounded Contexts, si realmente existen.
* Entidades.
* Value Objects.
* Agregados.
* Casos de uso.
* Reglas de negocio.
* Integraciones externas.
* Flujos principales.

Identifica:

* Funcionalidades completamente implementadas.
* Funcionalidades parcialmente implementadas.
* Funcionalidades aparentemente abandonadas.
* Código preparado para funcionalidades que aún no existen.

Distingue entre:

* Lógica de negocio.
* Lógica de aplicación.
* Lógica de infraestructura.
* Lógica de presentación.

---

# Fase 2: Mapa de dependencias

Reconstruye cómo se relacionan los componentes.

Analiza:

* Dependencias entre módulos.
* Dependencias entre capas.
* Dependencias entre dominios.
* Dependencias hacia infraestructura.
* Dependencias hacia frameworks.
* Dependencias hacia terceros.
* Dependencias circulares.
* Dependencias transitivas problemáticas.

Determina especialmente:

* Qué módulo conoce a qué otro módulo.
* Qué componentes deberían estar aislados pero no lo están.
* Qué dependencias son legítimas.
* Qué dependencias representan acoplamiento innecesario.

Si es posible, representa conceptualmente el flujo:

**Controller → Application → Domain → Infrastructure**

y señala las desviaciones relevantes.

---

# Fase 3: Arquitectura y diseño

Evalúa la arquitectura real contra:

* Clean Architecture.
* Hexagonal Architecture.
* DDD.
* SOLID.
* Modularidad.
* Encapsulamiento.

Busca específicamente:

### Separación de responsabilidades

* Lógica de negocio en controllers.
* Lógica de negocio en repositories.
* Lógica de negocio en adapters.
* Servicios con responsabilidades excesivas.
* Infraestructura filtrándose hacia dominio.
* Dominio dependiendo innecesariamente de frameworks.

### Encapsulamiento

Detecta:

* Módulos accediendo directamente a detalles internos de otros módulos.
* Entidades expuestas innecesariamente.
* Uso indebido de clases internas.
* Dependencias hacia implementaciones concretas cuando debería existir una abstracción.
* Bypass de casos de uso o servicios de dominio.

### Domain Driven Design

Evalúa:

* Entidades.
* Value Objects.
* Agregados.
* Límites de consistencia.
* Reglas de negocio.
* Servicios de dominio.
* Anemic Domain Model cuando realmente sea problemático.
* Ubicación de las reglas de negocio.

No fuerces DDD donde no aporte valor.

### Modularidad

Determina si los módulos realmente representan límites coherentes o si son únicamente una organización de carpetas.

Detecta:

* Módulos artificiales.
* Módulos excesivamente acoplados.
* Responsabilidades duplicadas.
* Dependencias que rompen los límites establecidos.

---

# Fase 4: Consistencia arquitectónica

Compara los módulos entre sí.

Busca inconsistencias como:

* Un módulo utiliza correctamente Application / Domain / Infrastructure y otro no.
* Diferentes formas de implementar el mismo patrón.
* Diferentes estrategias para validaciones.
* Diferentes estrategias para errores.
* Diferentes formas de persistencia.
* Diferentes convenciones para Value Objects.
* Diferentes convenciones para casos de uso.
* Diferentes estrategias de testing.

Determina si las diferencias:

* Son justificadas.
* Son accidentales.
* Representan deuda técnica.

La consistencia debe evaluarse **dentro del contexto del proyecto**, no como uniformidad absoluta.

---

# Fase 5: Reglas arquitectónicas y tests

Inspecciona tests existentes, especialmente:

* ArchUnit.
* Tests unitarios.
* Tests de integración.
* Tests de aplicación.
* Tests de dominio.
* Tests de infraestructura.
* Tests end-to-end.

Determina:

* Qué reglas arquitectónicas están protegidas automáticamente.
* Si esas reglas realmente representan la arquitectura deseada.
* Si existen reglas pero pueden ser evadidas.
* Si los tests arquitectónicos están desactualizados.
* Si existen partes críticas sin cobertura.
* Si los tests prueban comportamiento real o únicamente implementación.

Busca especialmente:

* Tests debilitados.
* Mocks excesivos.
* Tests acoplados a detalles internos.
* Assertions débiles.
* Tests duplicados.
* Tests que pasan aunque la lógica de negocio esté incorrecta.
* Código crítico sin pruebas.

No evalúes cobertura únicamente por porcentaje.

Evalúa **qué comportamiento está realmente protegido**.

---

# Fase 6: Calidad y mantenibilidad

Detecta problemas reales de mantenibilidad:

* God Objects.
* God Services.
* Clases excesivamente grandes.
* Métodos excesivamente complejos.
* Responsabilidades mezcladas.
* Nombres ambiguos.
* Abstracciones innecesarias.
* Patrones utilizados incorrectamente.
* Duplicación significativa de lógica.
* Código muerto.
* Código huérfano.
* Código comentado permanentemente.
* Flujos difíciles de seguir.
* Manejo inconsistente de errores.

No reportes boilerplate normal como duplicación problemática.

---

# Fase 7: Seguridad

Analiza únicamente riesgos respaldados por evidencia.

Busca:

* Secrets o credenciales hardcodeadas.
* Validaciones ausentes.
* Autorización incorrecta.
* Falta de control de acceso.
* Exposición innecesaria de información.
* Datos sensibles expuestos en logs.
* Configuraciones inseguras.
* Inyección.
* Manipulación insegura de entradas.
* Manejo inseguro de archivos.
* Dependencias potencialmente vulnerables si existe evidencia en el proyecto.

No inventes escenarios de explotación.

Para cada vulnerabilidad potencial explica:

**Entrada → Componente vulnerable → Comportamiento → Impacto**

si la evidencia permite determinarlo.

---

# Fase 8: Rendimiento

Busca problemas estructurales y evidentes:

* N+1 queries.
* Queries innecesariamente repetidas.
* Carga excesiva de datos.
* Operaciones bloqueantes en flujos asíncronos.
* Uso innecesario de red.
* Uso ineficiente de base de datos.
* Cachés sin límites cuando exista evidencia.
* Procesamiento repetitivo evitable.

No reportes micro-optimizaciones sin impacto demostrable.

---

# Fase 9: Deuda técnica

Clasifica los hallazgos:

### CRÍTICA

Problemas que pueden provocar:

* Fallas graves de seguridad.
* Corrupción o pérdida de datos.
* Violaciones críticas de reglas de negocio.
* Fallos sistémicos.
* Bloqueo significativo de la evolución del sistema.

### ALTA

Problemas con impacto significativo:

* Bugs latentes importantes.
* Acoplamiento fuerte.
* Fugas de dominio.
* Violaciones arquitectónicas relevantes.
* Falta de protección en lógica crítica.

### MEDIA

Problemas que afectan:

* Mantenibilidad.
* Evolución del sistema.
* Testing.
* Complejidad.
* Consistencia arquitectónica.

### BAJA

Problemas menores:

* Código muerto.
* Inconsistencias menores.
* Mejoras de claridad.
* Deuda cosmética con impacto limitado.

No fuerces hallazgos dentro de una severidad si realmente no corresponde.

---

# Formato obligatorio para cada hallazgo

Para cada hallazgo relevante utiliza:

### [SEVERIDAD] Título

**Ubicación:**
Módulo / archivo / clase / método.

**Tipo:**
Arquitectura / Bug / Seguridad / Rendimiento / Testing / Mantenibilidad / Deuda técnica.

**Evidencia:**
Qué comportamiento concreto del código demuestra el problema.

**Problema:**
Qué está ocurriendo.

**Impacto:**
Por qué importa y qué podría afectar.

**Causa probable:**
Si puede determinarse con suficiente evidencia.

**Recomendación conceptual:**
Dirección general de solución, SIN escribir código.

**Confianza:**
Alta / Media / Baja.

No conviertas una observación de baja confianza en un hecho.

---

# Fase 10: Detección de fortalezas

No busques únicamente problemas.

Identifica también:

* Buenas decisiones arquitectónicas.
* Límites de módulos bien definidos.
* Buen uso de Value Objects.
* Buen encapsulamiento.
* Buen diseño de casos de uso.
* Tests arquitectónicos útiles.
* Patrones aplicados correctamente.
* Mecanismos efectivos de protección contra regresiones.

Si una parte del sistema está bien diseñada, indícalo explícitamente.

---

# Entregables

Genera el reporte exactamente en este orden:

## 1. Resumen Ejecutivo

2-4 párrafos describiendo:

* Salud general.
* Fortalezas principales.
* Problemas principales.
* Riesgo general.
* Nivel de deuda técnica.

## 2. Mapa del Proyecto

Mostrar:

* Módulos.
* Bounded Contexts identificados.
* Responsabilidades.
* Dependencias relevantes.

## 3. Arquitectura Actual

Explica cómo funciona realmente la arquitectura.

Incluye las principales desviaciones respecto a la arquitectura esperada.

## 4. Fortalezas

Lista las decisiones y componentes que están correctamente diseñados.

## 5. Reporte de Hallazgos

Lista todos los hallazgos relevantes utilizando el formato obligatorio.

Ordena por:

1. Severidad.
2. Impacto.
3. Confianza.

## 6. Riesgos Principales

Identifica los **3-5 riesgos más importantes** para:

* Negocio.
* Seguridad.
* Mantenibilidad.
* Evolución.
* Estabilidad.

## 7. Deuda Técnica Consolidada

Resume:

| Severidad | Cantidad | Principales áreas |
| --------- | -------: | ----------------- |
| Crítica   |        X | ...               |
| Alta      |        X | ...               |
| Media     |        X | ...               |
| Baja      |        X | ...               |

## 8. Plan de Acción

Propón un roadmap conceptual utilizando:

**Impacto vs. Esfuerzo**

Prioriza:

1. Alto impacto / Bajo esfuerzo.
2. Alto impacto / Alto esfuerzo.
3. Bajo impacto / Bajo esfuerzo.
4. Bajo impacto / Alto esfuerzo.

No escribas código.

## 9. Conclusión

Determina:

* Estado general.
* Principales riesgos.
* Qué debería preservarse.
* Qué debería investigarse posteriormente.

---

# Restricciones absolutas

Durante esta auditoría:

* **NO modifiques archivos.**
* **NO crees archivos.**
* **NO elimines archivos.**
* **NO ejecutes refactorizaciones.**
* **NO generes código correctivo.**
* **NO generes snippets de implementación.**
* **NO cambies configuración.**
* **NO instales dependencias.**
* **NO ejecutes comandos destructivos.**
* **NO corrijas automáticamente los problemas encontrados.**

Si necesitas ejecutar tests, linters o herramientas de análisis para obtener evidencia, puedes hacerlo **únicamente si no modifica el proyecto**.

La auditoría termina con el reporte.

No continúes automáticamente hacia una fase de implementación.

---

# Criterio final

Tu prioridad debe ser:

**Comprender → Evidenciar → Diagnosticar → Priorizar.**

No:

**Suponer → Refactorizar → Justificar.**

La calidad de esta auditoría se mide por la capacidad de identificar **problemas reales y relevantes**, no por la cantidad de problemas encontrados.
