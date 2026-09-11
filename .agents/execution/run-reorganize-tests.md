Confirmado. Aplica el plan de reorganización de tests que acabas de proponer.

Antes de modificar archivos:

- Verifica nuevamente el estado actual del repositorio.
    
- No sobrescribas cambios existentes que no formen parte de esta tarea.
    
- Mantén intacta la lógica productiva.
    
- No cambies comportamiento funcional salvo que sea estrictamente necesario para adaptar los tests.
    

Ejecuta la migración completa:

1. Mueve los tests a la estructura `tests/` aprobada.
    
2. Separa unit, integration y e2e según la clasificación que determinaste durante el análisis.
    
3. Mueve factories, mocks, fixtures y helpers reutilizables a sus ubicaciones correspondientes.
    
4. Actualiza imports y referencias afectadas.
    
5. Actualiza Jest/Vitest y cualquier configuración relacionada.
    
6. Actualiza `tsconfig` y `package.json` si es necesario.
    
7. Actualiza scripts de testing y coverage.
    
8. Actualiza cualquier configuración de CI/CD afectada.
    
9. No crees carpetas o abstracciones que no sean necesarias.
    
10. Mantén o mejora la cobertura existente.
    

Durante la ejecución:

- No elimines tests simplemente porque sean incómodos de migrar.
    
- No debilites assertions.
    
- No aumentes el uso de mocks sin justificación.
    
- No conviertas tests de integración en unit tests para hacerlos pasar.
    
- No cambies la intención original de los tests.
    
- Si encuentras un test defectuoso, primero corrige el problema manteniendo su intención.
    
- Si falta un test como consecuencia de la reorganización o detectas una cobertura razonablemente necesaria, créalo.
    
- Si una decisión del análisis ya no es válida al ejecutar la migración, detente y explícame el cambio antes de tomar una decisión arquitectónica diferente.
    

Al finalizar:

1. Ejecuta todos los tests.
    
2. Ejecuta coverage.
    
3. Ejecuta lint/typecheck/build si existen esos scripts.
    
4. Verifica que no haya tests fuera de la estructura acordada, salvo excepciones justificadas.
    
5. Revisa los cambios realizados.
    
6. Comprueba que no haya archivos, imports o configuraciones obsoletas.
    

Finalmente, dame un resumen:

- archivos/directorios movidos
    
- configuraciones modificadas
    
- tests agregados o modificados
    
- cobertura antes/después
    
- comandos ejecutados y resultado
    
- cualquier decisión que haya requerido criterio durante la implementación
    

No hagas commits.