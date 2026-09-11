Quiero analizar la estructura actual de tests de este proyecto Node.js + TypeScript vanilla.

Por ahora, NO realices ningún cambio.

Objetivo:  
Evaluar si conviene separar los tests del código productivo y adoptar una estructura de testing más organizada, tomando como referencia buenas prácticas del ecosistema Node.js/TypeScript, pero sin copiar ciegamente convenciones de frameworks como NestJS o Angular.

Contexto:

- El proyecto utiliza TypeScript vanilla, no NestJS.
    
- Actualmente los tests pueden estar ubicados junto al código productivo.
    
- Quiero evaluar una estructura donde `src/` contenga exclusivamente código productivo y `tests/` contenga los tests.
    
- Quiero mantener una separación clara entre unit, integration y e2e cuando corresponda.
    
- Las factories y mocks reutilizables deberían tener una ubicación común y explícita.
    
- No quiero introducir carpetas o abstracciones que actualmente no aporten valor.
    

Analiza:

1. La estructura actual de `src/`.
    
2. Dónde están ubicados actualmente los tests.
    
3. Qué tipos de tests existen actualmente:
    
    - unit
        
    - integration
        
    - e2e
        
    - otros
        
4. Cómo están organizados los mocks, fixtures, factories, helpers y utilidades de testing.
    
5. La configuración actual de Jest/Vitest/u otro test runner.
    
6. `package.json`, `tsconfig` y cualquier configuración relacionada con tests.
    
7. Imports relativos que podrían verse afectados al mover los tests.
    
8. Scripts de testing y CI/CD que dependan de las rutas actuales.
    
9. Cobertura actual y configuración de coverage.
    
10. Si existen tests que estén mezclando responsabilidades o cuya ubicación actual dificulte su mantenimiento.
    

Después del análisis, propón una estructura objetivo.

La propuesta debe:

- Mantener `src/` exclusivamente para código productivo.
    
- Usar `tests/` para código de testing.
    
- Separar unit, integration y e2e únicamente si realmente existen o aportan valor en este proyecto.
    
- Centralizar factories/mocks/helpers reutilizables cuando corresponda.
    
- Mantener una estructura coherente con Node.js + TypeScript vanilla.
    
- Evitar sobreingeniería.
    
- Evitar crear abstracciones, carpetas o capas únicamente por seguir una convención.
    
- Preservar la intención actual de los tests.
    
- No reducir cobertura.
    
- No debilitar assertions.
    
- No reemplazar tests reales por mocks innecesarios.
    

Entrega:

1. Diagnóstico de la estructura actual.
    
2. Problemas encontrados.
    
3. Estructura objetivo propuesta.
    
4. Tabla de movimientos: archivo actual → ubicación propuesta → motivo.
    
5. Cambios necesarios en Jest/Vitest, TypeScript, package.json y CI/CD.
    
6. Riesgos o posibles problemas de la migración.
    
7. Tests que deberían agregarse, actualizarse o modificarse como consecuencia de la reorganización.
    
8. Orden recomendado para ejecutar la migración.
    

Importante:  
No modifiques archivos todavía.  
Primero quiero revisar y aprobar el plan.