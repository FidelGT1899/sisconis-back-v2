# SISCONIS Back

**SISCONIS** es el acrónimo de **Sistema de Control de Ingresos y Salidas**. Este proyecto corresponde al backend del sistema encargado de gestionar papeletas de permisos de salida o ingreso a una institución. Está desarrollado con **Node.js + TypeScript**, aplicando **arquitectura limpia (Clean Architecture)** y principios de **DDD**.

Este proyecto fue iniciado previamente, pero ha sido retomado y modernizado con nuevas tecnologías para consolidarlo como parte del portafolio técnico y aprendizaje continuo.

---

## 🚀 Características principales

- Gestión completa de permisos de ingreso y salida.
- Registro y autenticación de usuarios.
- Roles y permisos con diferentes niveles de acceso.
- API RESTful documentada y modular.
- Arquitectura limpia con alta cohesión y bajo acoplamiento.
- Pruebas unitarias y de integración con Jest + Supertest.
- Dockerización lista para despliegue.

---

## 🧩 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución.
- **Express.js**: Framework HTTP principal.
- **TypeScript**: Tipado estático y mejor mantenimiento.
- **Arquitectura Limpia + DDD**: Separación por capas `presentation`, `domain`, `application` e `infrastructure`.
- **PostgreSQL**: Base de datos SQL.
- **Docker**: Contenedorización para entornos consistentes.
- **Jest / Supertest**: Frameworks de testing.
- **pnpm**: Gestor de paquetes rápido y eficiente.

---

## 🏗️ Estructura del Proyecto

```
src/
├── presentation/     # Controladores, rutas y middlewares
│   # Interacción HTTP y validación de requests
│
├── domain/           # Entidades y reglas de negocio
│   # Modelos, lógica de dominio, invariantes y validaciones
│
├── application/      # Casos de uso y lógica de aplicación
│   # Orquestación entre dominio y presentación
│
└── infrastructure/   # Persistencia y servicios externos
    # Adaptadores de base de datos, integraciones y providers
```

---

## ⚙️ Instalación y configuración

1. **Clonar el repositorio:**

```bash
git clone https://github.com/FidelGT1899/sisconis-back-v2
cd sisconis-back
```

2. **Configurar variables de entorno:**

```bash
cp .env.template .env
```

Ajusta las variables según tu entorno local.

3. **Instalar dependencias:**

```bash
pnpm install
```

4. **Configurar servicios externos (opcional):**

```bash
docker-compose up -d
```

5. **Inicializar la base de datos:**

```bash
pnpm run seed
```

6. **Ejecutar el servidor en modo desarrollo:**

```bash
pnpm run dev
```

---

## 🧪 Testing

1. **Instalar dependencias de test:**

```bash
pnpm add -D jest @types/jest ts-jest supertest
```

2. **Ejecutar pruebas:**

```bash
pnpm test
```

3. **Otras opciones:**

```bash
pnpm test:watch   # Modo observador
pnpm test:coverage # Reporte de cobertura
```

---

## 🐙 Estructura de ramas (Trunk-Based Development)

| Rama        | Tipo       | Descripción                          | Ejemplo                             |
| ----------- | ---------- | ------------------------------------ | ----------------------------------- |
| `main`      | permanente | Rama estable, siempre deployable     | —                                   |
| `feature/*` | temporal   | Nuevas features, mejoras o refactors | `feature/create-permission-request` |
| `fix/*`     | temporal   | Correcciones de bugs                 | `fix/permission-validation`         |
| `release/*` | temporal   | Preparación de versión               | `release/v1.0.0`                    |
| `hotfix/*`  | temporal   | Parches urgentes sobre producción    | `hotfix/token-expiration`           |

**Reglas:**

- Merge solo mediante Pull Request.
- `main` siempre debe pasar CI.
- Las ramas `feature` y `fix` deben tener vida corta.

---

## 🖊️ Convención de commits

Usa [Conventional Commits](https://www.conventionalcommits.org/) para mantener consistencia semántica en los mensajes.

Ejemplos:

```
feat: add permission request endpoint
fix: handle invalid date input
refactor: extract validation logic to domain layer
test: add unit test for permission use case
chore: update eslint rules
docs: update contributing guide
```

---

## 📜 Estado del Proyecto

Actualmente, el proyecto se encuentra en desarrollo activo. Próximos pasos:

- Completar implementación de módulos de permisos y usuarios.
- Integrar documentación con Swagger/Postman.
- Preparar entorno de despliegue en producción.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

---

### 🧠 Filosofía

> “Automatiza y organiza como si fueras un equipo de cinco, pero actúa con la velocidad de uno solo.”
