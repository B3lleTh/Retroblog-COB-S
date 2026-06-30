# 🌐 Retroblog COB-S (Ecosistema de Microservicios)

[![Architecture](https://img.shields.io/badge/Architecture-Microservices%20%2F%20API%20Gateway-indigo)](#)
[![Backend Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Prisma%20%7C%20Express-cyan)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](#)

Ecosistema modular y escalable para **COB-S**. La plataforma está dividida en microservicios independientes e interconectados a través de una puerta de enlace (*API Gateway*), aislando la lógica de autenticación y sirviendo una interfaz interactiva de alto rendimiento.

---

## 📂 Estructura del Ecosistema

```text
Retroblog-COB-S/
├── auth-service/         # Microservicio de Autenticación y Criptografía
│   ├── prisma/           # Modelado y migraciones de PostgreSQL con Prisma ORM
│   │   ├── migrations/   # Historial de migraciones del sistema
│   │   └── schema.prisma # Archivo de configuración y esquemas de entidades
│   ├── src/
│   │   ├── controllers/  # Controladores HTTP (Manejo de Login, Registro, Verificación)
│   │   ├── middleware/   # Validadores de esquemas y payloads entrantes
│   │   ├── routes/       # Endpoints expuestos por el servicio de Auth
│   │   ├── services/     # Lógica central del negocio (auth y envíos de correo)
│   │   ├── utils/        # Funciones auxiliares criptográficas (Firmas JWT)
│   │   └── index.js      # Punto de entrada del microservicio
│   └── package.json
│
├── gateway/              # API Gateway (Punto de entrada único para el cliente)
│   ├── src/
│   │   ├── middleware/   # Interceptores globales (Verificación perimetral de JWT)
│   │   └── index.js      # Enrutador/Proxy hacia los microservicios internos
│   └── package.json
│
├── frontend/             # Interfaz de Usuario (Dashboard dinámico y estético)
│   ├── index.html        # Página principal / Landing de acceso
│   ├── login.html        # Vista de autenticación segura
│   ├── verify.html       # Interfaz para verificación de doble factor / enlaces
│   ├── dashboard.html    # Panel analítico de monitoreo del sistema (NexusOS)
│   └── auth.js           # Manejador de estado de sesión, cookies y llamadas al Gateway
│
└── .gitignore            # Exclusión global de dependencias locales y entornos (.env)
