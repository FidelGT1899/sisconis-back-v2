Revisa exclusivamente los cambios que acabas de realizar en esta tarea. Actúa como un code reviewer senior e independiente.

No realices nuevos cambios todavía. Primero analiza y reporta los hallazgos.

Objetivo:  
Determinar si los cambios implementados cumplen correctamente con la solicitud original, mantienen la intención del código existente y siguen siendo simples, mantenibles y suficientemente testeados.

Revisa específicamente:

### 1. Cumplimiento de la tarea

- Verifica que todos los requisitos solicitados hayan sido implementados.
    
- Comprueba que no haya requisitos parcialmente implementados.
    
- Identifica cualquier comportamiento solicitado que no haya sido cubierto.
    
- No inventes requisitos que no formaban parte de la tarea.
    

### 2. Correctitud

- Busca errores lógicos.
    
- Revisa edge cases relevantes.
    
- Verifica manejo de errores.
    
- Comprueba que el comportamiento nuevo sea consistente con el comportamiento existente.
    
- Identifica posibles regresiones introducidas por los cambios.
    

### 3. Arquitectura y diseño

Busca específicamente:

- sobreingeniería;
    
- abstracciones innecesarias;
    
- clases, funciones o interfaces que podrían eliminarse;
    
- capas introducidas sin una necesidad real;
    
- duplicación innecesaria;
    
- responsabilidades mal ubicadas;
    
- dependencias innecesarias;
    
- patrones utilizados únicamente por "seguir una arquitectura".
    

Prioriza la solución más simple que cumpla correctamente con el requisito.

### 4. Tests

Revisa los tests afectados y los nuevos tests.

Verifica que:

- cubran realmente el comportamiento importante;
    
- las assertions sean suficientemente fuertes;
    
- no se hayan debilitado para hacer pasar los tests;
    
- no se hayan eliminado casos relevantes;
    
- no se hayan convertido tests útiles en tests triviales;
    
- los mocks estén justificados;
    
- no exista mock excesivo;
    
- no se esté mockeando aquello que debería probarse realmente;
    
- los tests mantengan la intención original.
    

Si falta un test necesario para cubrir el cambio, indícalo.

Si un test existente debería actualizarse debido al cambio, indícalo.

No consideres suficiente que "los tests pasan". Evalúa si realmente prueban el comportamiento esperado.

### 5. Cobertura

Comprueba si los cambios:

- redujeron la cobertura;
    
- dejaron ramas nuevas sin cubrir;
    
- introdujeron lógica sin tests;
    
- eliminaron accidentalmente cobertura existente.
    

Si el proyecto tiene una cobertura objetivo o una configuración existente, respétala.

### 6. Calidad del código

Busca:

- nombres poco claros;
    
- funciones demasiado complejas;
    
- código duplicado;
    
- condiciones innecesariamente complejas;
    
- manejo de errores inconsistente;
    
- código muerto;
    
- imports innecesarios;
    
- comentarios que expliquen lo obvio;
    
- configuraciones innecesarias;
    
- archivos que deberían eliminarse después del cambio.
    

### 7. Alcance del cambio

Este punto es especialmente importante.

Revisa si realizaste cambios que NO eran necesarios para cumplir la tarea.

Identifica:

- archivos modificados sin relación con la tarea;
    
- refactorizaciones oportunistas;
    
- cambios de estilo no relacionados;
    
- cambios de configuración innecesarios;
    
- mejoras "aprovechando que ya estabas ahí";
    
- modificaciones de comportamiento no solicitadas.
    

El objetivo es mantener el diff pequeño y enfocado.

### 8. Compatibilidad

Comprueba si los cambios afectan:

- API pública;
    
- contratos;
    
- imports;
    
- configuración;
    
- scripts;
    
- CI/CD;
    
- variables de entorno;
    
- dependencias;
    
- consumidores existentes;
    
- comandos de build/test/lint.
    

### 9. Seguridad

Si aplica al cambio, revisa:

- validación de inputs;
    
- exposición accidental de información;
    
- manejo de credenciales/secrets;
    
- permisos;
    
- datos sensibles;
    
- vulnerabilidades obvias introducidas por el cambio.
    

No inventes problemas de seguridad hipotéticos sin relación con el código modificado.

### 10. Verificación

Si todavía no lo hiciste, ejecuta las verificaciones relevantes disponibles en el proyecto:

- tests;
    
- coverage;
    
- lint;
    
- typecheck;
    
- build;
    
- otras verificaciones existentes directamente relacionadas con los cambios.
    

No modifiques código para ocultar un fallo durante esta revisión.

---

### Formato del resultado

Clasifica cada hallazgo:

CRÍTICO  
Problema que puede causar incorrectitud, regresión, pérdida de datos, vulnerabilidad o incumplimiento importante del requisito.

IMPORTANTE  
Problema que debería corregirse antes de considerar terminada la tarea.

MEJORA  
Problema real pero no bloqueante.

OBSERVACIÓN  
Comentario menor o sugerencia que no requiere necesariamente cambios.

Para cada hallazgo indica:

- Severidad
    
- Archivo
    
- Línea o sección afectada
    
- Problema
    
- Por qué es un problema
    
- Corrección recomendada
    

No reportes preferencias personales como problemas.

No propongas cambios únicamente porque exista otra forma de escribir el código.

Prioriza problemas reales sobre opiniones de estilo.

Al final proporciona:

1. Resumen de hallazgos.
    
2. Problemas que deben corregirse.
    
3. Mejoras opcionales.
    
4. Resultado de tests/coverage/lint/typecheck/build.
    
5. Evaluación general del cambio:
    
    - APROBADO
        
    - APROBADO CON OBSERVACIONES
        
    - REQUIERE CAMBIOS
        

Importante:

- NO modifiques archivos durante esta revisión.
    
- NO hagas commits.
    
- NO amplíes el alcance de la tarea.
    
- Revisa exclusivamente los cambios realizados en esta tarea y su impacto directo.
    
- Si no encuentras problemas, dilo explícitamente.


Cuando termines, ejecuta inmediatamente este code review:
"Corrige únicamente los hallazgos CRÍTICO y IMPORTANTE que identificaste. No realices ningún otro cambio."