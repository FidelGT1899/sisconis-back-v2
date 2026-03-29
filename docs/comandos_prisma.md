# Prisma – Guía de Comandos

Documentación práctica para inicializar, mantener y depurar Prisma en el proyecto.

## Inicio del Proyecto

### 1. Instalar dependencias

```
pnpm install prisma --save-dev
pnpm install @prisma/client
```

### 2. Inicializar Prisma

Crea la carpeta `prisma/` y el archivo `.env`.

```
npx prisma init
```

Especificar proveedor de base de datos

```
npx prisma init --datasource-provider sqlite
```

(O usa `postgresql`, `mysql`, etc.)

## Ciclo de Desarrollo (Cambios en el Schema)

### 1. Crear y aplicar una migración

(Sincroniza **Schema → Base de Datos**)

```
npx prisma migrate dev --name nombre_descriptivo
```

Ejemplos:

- `init`
- `add_dni_to_user`
- `add_user_status`

En caso solo necesites, crear la migración sin aplicarla:

```
npx prisma migrate dev --create-only --name nombre_descriptivo
```

Y para ejecutar la migración:

```
npx prisma migrate deploy
```

### 2. Regenerar el cliente de Prisma

(Sincroniza **Schema → Node_modules**)

Imprescindible cuando:

- Agregas campos
- Cambias relaciones
- Los repositorios no reconocen nuevos atributos

```
npx prisma generate
```

### 3. Validar visualmente los datos (opcional)

Interfaz web para inspección y edición manual.

```
npx prisma studio
```

## Mantenimiento y Emergencias

### 1. Resetear la base de datos (BORRA TODA LA DATA)

Útil cuando:

- Hay errores de columnas `NOT NULL`
- El schema cambió demasiado
- La DB local quedó inconsistente

```
npx prisma migrate reset
```

### 2. Contenedor de BD eliminado accidentalmente

Si se borra el contenedor o volumen:

```
npx prisma migrate dev
npx prisma generate
```

## 🔍 Inspección y Diagnóstico

### 1. Validar el schema.prisma

```
npx prisma validate
```

### 2. Ver estado de las migraciones

```
npx prisma migrate status
```

### 3. Importar estructura desde una BD existente

Genera el schema a partir de tablas ya creadas.

```
npx prisma db pull
```

No crea migraciones automáticamente.

## 📝 Notas Importantes

- `migrate dev` = desarrollo local
- `db pull` = solo inspección / reverse engineering
- `generate` = **siempre** después de cambios en el schema
- Nunca editar la BD manualmente sin saber el impacto en migraciones

---

**Observación**: Si Prisma “no reconoce un campo”, casi siempre falta un `prisma generate`.
