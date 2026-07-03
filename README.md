# 🚀 Proyecto Final -GESTION ESCOLAR EN EL NIVEL INICIAL- Backend

Este repositorio contiene el backend para el proyecto final. Es una API REST desarrollada con **Node.js**, **Express (v5)** y **MongoDB**, enfocada en ofrecer un sistema robusto y seguro de autenticación de usuarios, manejo de sesiones y notificaciones por correo electrónico.

---

## 🛠️ Tecnologías Utilizadas

El proyecto aprovecha las últimas características del ecosistema de JavaScript, requiriendo **Node.js >= 22.0.0** y utilizando módulos nativos de ES6 (`import/export`).

* **Entorno de ejecución:** [Node.js](https://nodejs.org/) (v22+)
* **Framework Web:** [Express v5](https://expressjs.com/) (Nueva versión con manejo de errores mejorado)
* **Base de Datos:** [Mongoose / MongoDB](https://mongoosejs.com/)
* **Seguridad y Autenticación:** * `jsonwebtoken` (JWT) para manejo de sesiones asíncronas.
    * `bcrypt` para el hashing seguro de contraseñas.
    * `cors` para la configuración de intercambio de recursos de origen cruzado.
* **Envío de Correos:** `nodemailer` y `resend` para flujos de verificación y recuperación.
* **Variables de Entorno:** `dotenv`

---

## 📦 Instalación y Configuración

Sigue estos pasos para clonar e instalar el proyecto localmente de manera correcta:

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd borrador_proy_final_backend
   pnpm install
# o usando npm / yarn
npm install



🛣️
Endpoint:
POST, /register, Registra un nuevo usuario en el sistema.
GET, /verify-email, Verifica la dirección de correo electrónico del usuario.
POST, /login, Autentica al usuario y devuelve el token de sesión (JWT).
POST, /forgot-password, Solicita un enlace/token de recuperación por contraseña olvidada.
POST, /reset-password, Procesa el cambio de contraseña utilizando el token válido.
POST, /login-recovery, Permite el inicio de sesión alternativo mediante un token de recuperación de cuenta.




📂 
Estructura del Proyecto (Puntos clave)
./src/main.js: Punto de entrada principal de la aplicación donde se inicializa el servidor Express y las conexiones.

./src/routes/auth.route.js: Definición de las rutas del módulo de autenticación presentadas arriba.

./src/controllers/auth.controllers.js: Contiene la lógica de negocio asociada a cada endpoint de autenticación.