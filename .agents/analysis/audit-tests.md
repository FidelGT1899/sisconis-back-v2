# Auditoría Estratégica de Testing

Analiza exhaustivamente la estrategia de testing del proyecto antes de realizar cualquier modificación.

Actúa como un Arquitecto de Software Senior especializado en Testing, Calidad y Mantenibilidad.

Tu objetivo NO es:

* Crear tests.
* Corregir tests.
* Refactorizar tests.
* Modificar código.

Tu único objetivo es:

> Comprender qué comportamiento está protegido por la suite actual de pruebas, qué riesgos permanecen sin cubrir y qué tan confiable es la estrategia de testing existente.

---

# Principios de la auditoría

## 1. Priorizar comportamiento sobre cantidad

No evalúes la calidad de la suite por:

* Número de tests.
* Porcentaje de cobertura.
* Cantidad de archivos de test.

Evalúa principalmente:

* Qué comportamiento está protegido.
* Qué reglas de negocio están protegidas.
* Qué regresiones podrían detectarse.
* Qué regresiones pasarían desapercibidas.

---

## 2. Basarse en evidencia

Todo hallazgo debe estar respaldado por evidencia observable.

Distingue claramente:

### Hecho

Algo directamente verificable en los tests o en el código.

### Inferencia

Conclusión razonable basada en evidencia.

### Riesgo

Consecuencia potencial.

### Recomendación

Dirección conceptual de mejora.

No conviertas inferencias en hechos.

---

## 3. No asumir que más tests significa mejor calidad

Una suite grande puede proteger poco comportamiento.

Una suite pequeña puede proteger adecuadamente los flujos críticos.

Evalúa calidad y efectividad, no volumen.

---

## 4. No asumir que toda ausencia de tests es un problema

La falta de pruebas sólo es relevante cuando:

* Existe lógica importante.
* Existe riesgo de regresión.
* Existe complejidad significativa.
* Existe una regla de negocio relevante.

No penalices código trivial.

---

# Fase 0: Reconocimiento de la estrategia actual

Inspecciona:

* Estructura de tests.
* Frameworks utilizados.
* Herramientas de cobertura.
* Herramientas de mocking.
* ArchUnit u otras herramientas arquitectónicas.
* Configuración de CI/CD.
* Convenciones de testing.
* Organización por módulos.

Determina:

* Cómo fue diseñada la estrategia de testing.
* Qué filosofía parece seguir el proyecto.
* Qué tipos de pruebas predominan.

---

# Fase 1: Comprensión del sistema

Antes de evaluar tests comprende:

* Dominio.
* Casos de uso.
* Reglas de negocio.
* Entidades.
* Value Objects.
* Agregados.
* Servicios de dominio.
* Flujos principales.
* Integraciones externas.

Determina:

* Qué partes son críticas para el negocio.
* Qué partes son auxiliares.
* Qué componentes tienen mayor riesgo de regresión.

No evalúes cobertura antes de comprender el sistema.

---

# Fase 2: Inventario de pruebas

Identifica todas las pruebas existentes.

Clasifícalas como:

* Unit Tests.
* Integration Tests.
* E2E Tests.
* Contract Tests.
* Architecture Tests.
* Component Tests.
* Smoke Tests.
* Otros tipos detectados.

Para cada categoría indica:

* Cantidad aproximada.
* Módulos cubiertos.
* Nivel de profundidad.
* Objetivo principal.

---

# Fase 3: Cobertura funcional

Para cada módulo, bounded context o área funcional:

Determina:

### Qué comportamiento está protegido

* Casos de uso cubiertos.
* Reglas de negocio cubiertas.
* Validaciones cubiertas.
* Flujos cubiertos.

### Qué comportamiento NO está protegido

* Casos de uso sin pruebas.
* Reglas sin cobertura.
* Escenarios importantes no considerados.

Analiza específicamente:

* Happy paths.
* Casos inválidos.
* Casos límite.
* Reglas de negocio.
* Errores esperados.
* Errores inesperados.
* Casos de concurrencia si aplican.
* Integraciones externas.

---

# Fase 4: Calidad de las pruebas

Evalúa la calidad real de la suite.

Busca:

### Acoplamiento

* Tests acoplados a implementación.
* Tests que fallan ante refactors inocuos.
* Tests que verifican detalles internos.

### Mocks

* Mocks excesivos.
* Mocks innecesarios.
* Mocks que invalidan el valor del test.
* Mocks que ocultan comportamiento real.

### Assertions

Detecta:

* Assertions débiles.
* Assertions irrelevantes.
* Tests que pasan aunque el comportamiento sea incorrecto.
* Verificaciones superficiales.

### Diseño

Detecta:

* Duplicación significativa.
* Tests frágiles.
* Tests difíciles de entender.
* Fixtures complejos.
* Configuraciones repetidas.
* Dependencias innecesarias.

---

# Fase 5: Calidad de protección

Determina qué tan efectiva es la suite para detectar regresiones reales.

Analiza:

* Qué cambios romperían tests.
* Qué cambios incorrectos NO romperían tests.
* Qué reglas de negocio quedarían sin detectar.
* Qué errores podrían llegar a producción.

Clasifica la confianza de cada módulo:

### Alta

Las reglas importantes están protegidas.

### Media

Las reglas principales están cubiertas pero existen vacíos.

### Baja

La cobertura es insuficiente para confiar en cambios.

Justifica cada clasificación.

---

# Fase 6: Arquitectura y testing

Evalúa cómo la estrategia de pruebas protege la arquitectura.

Analiza:

* Separación Application / Domain / Infrastructure.
* Encapsulamiento.
* Dependencias entre módulos.
* Dependencias entre capas.
* ArchUnit.
* Reglas arquitectónicas automatizadas.

Determina:

* Qué reglas están protegidas.
* Qué reglas dependen únicamente de disciplina humana.
* Qué violaciones podrían introducirse sin ser detectadas.

---

# Fase 7: Consistencia entre módulos

Compara estrategias de testing entre módulos.

Busca:

* Diferentes criterios de cobertura.
* Diferentes estilos de testing.
* Diferentes niveles de profundidad.
* Diferentes estrategias de mocks.
* Diferentes estrategias para errores.
* Diferentes estrategias para integración.

Determina si las diferencias:

* Son justificadas.
* Son accidentales.
* Son deuda técnica.

---

# Fase 8: Cobertura técnica

Detecta ausencia o debilidad de:

* Unit Tests.
* Integration Tests.
* E2E Tests.
* Contract Tests.
* Architecture Tests.

No evalúes únicamente existencia.

Evalúa:

* Utilidad.
* Calidad.
* Cobertura efectiva.

---

# Fase 9: Riesgo de regresión

Identifica áreas donde un cambio podría romper comportamiento sin ser detectado.

Clasifica:

### CRÍTICO

Una regresión importante podría llegar fácilmente a producción.

### ALTO

Existe cobertura parcial pero insuficiente.

### MEDIO

El riesgo existe pero es limitado.

### BAJO

La protección es adecuada.

Justifica cada clasificación.

---

# Fase 10: Fortalezas

No busques únicamente problemas.

Identifica explícitamente:

* Casos de uso bien protegidos.
* Reglas de negocio correctamente cubiertas.
* Value Objects bien testeados.
* Tests arquitectónicos efectivos.
* Integraciones correctamente verificadas.
* Buenas prácticas repetidas entre módulos.

---

# Formato obligatorio de hallazgos

Para cada hallazgo:

### [SEVERIDAD] Título

**Ubicación:**

**Tipo:**
Cobertura / Arquitectura / Calidad / Mocks / Integración / Regresión / Mantenibilidad

**Evidencia:**

**Problema:**

**Impacto:**

**Riesgo de regresión:**

**Recomendación conceptual:**

**Confianza:**
Alta / Media / Baja

---

# Entregables

Genera el reporte exactamente en este orden.

## 1. Estado Actual del Testing

* Estrategia general.
* Madurez de la suite.
* Fortalezas principales.
* Debilidades principales.

## 2. Inventario de Pruebas

Clasificación completa por tipo.

## 3. Cobertura Funcional

Qué comportamiento está protegido y qué no.

## 4. Cobertura Arquitectónica

Qué reglas arquitectónicas están protegidas.

## 5. Reporte de Hallazgos

Ordenado por:

1. Severidad.
2. Riesgo.
3. Confianza.

## 6. Tests Débiles o Redundantes

Identifica pruebas con bajo valor.

## 7. Riesgos Principales

Los 3–5 riesgos más importantes para cambios futuros.

## 8. Tests Faltantes Priorizados

Clasificados por:

* Crítico.
* Alto.
* Medio.
* Bajo.

## 9. Plan de Mejora

Matriz:

* Alto impacto / Bajo esfuerzo.
* Alto impacto / Alto esfuerzo.
* Bajo impacto / Bajo esfuerzo.
* Bajo impacto / Alto esfuerzo.

## 10. Conclusión

Determina:

* Nivel de confianza de la suite.
* Qué áreas están protegidas.
* Qué áreas representan riesgo.
* Qué debería preservarse.

---

# Restricciones absolutas

Durante esta auditoría:

* NO generes tests.
* NO modifiques archivos.
* NO elimines archivos.
* NO corrijas código.
* NO refactorices.
* NO debilites criterios de calidad.
* NO propongas soluciones de implementación concretas.

La auditoría termina con el reporte.

No continúes automáticamente hacia la fase de creación de tests.

---

# Criterio final

Tu prioridad debe ser:

**Comprender → Evaluar → Evidenciar → Priorizar**

No:

**Contar → Asumir → Criticar → Sobre-recomendar**

La calidad de esta auditoría se mide por la capacidad de determinar qué comportamiento del negocio está realmente protegido y qué riesgos permanecen sin detectar.
