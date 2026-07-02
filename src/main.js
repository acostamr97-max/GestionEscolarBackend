import { ENVIRONMENT } from "./config/environment.config.js";
import dns from 'dns'
import connectMongoDB from './config/mongodb.config.js'
import express from 'express'
import cors from 'cors'

/* Routers de cada entidad. Cada uno agrupa los endpoints de su dominio. */
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import aulaRouter from "./routes/aula.route.js";
import alumnoRouter from "./routes/alumno.route.js";
import asistenciaRouter from "./routes/asistencia.route.js";
import entrevistaRouter from "./routes/entrevista.route.js";

/* ============================================================================
   main.js: punto de entrada del backend.
   Se encarga de: conectar a la base, configurar los middlewares globales,
   montar las rutas y levantar el servidor Express.
   ============================================================================ */

/* En desarrollo, forzar los DNS de Google (8.8.8.8) ayuda a resolver el host
   de Mongo en algunas redes/proveedores donde el DNS local falla. */
if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

/* Conecto a MongoDB. Si falla, el propio connectMongoDB corta el proceso. */
connectMongoDB()

const app = express()

/* --- Middlewares globales (se ejecutan ANTES de llegar a las rutas) --- */
app.use(cors())              /* permite que el frontend (otro origen/puerto) consuma la API */
app.use(express.json())      /* parsea el body JSON de los requests a request.body */

/* Ruta de prueba para verificar rapido que el server responde */
app.get('/api/test', (request, response) => {
    console.log("Llego una consulta de test")
    response.send("Respuesta de prueba");
});

/* --- Montaje de rutas ---
   Cada router se monta bajo un prefijo. Ej: aulaRouter maneja todo lo que
   empiece con /api/aula. Asi las URLs quedan ordenadas por entidad. */
app.use('/api/auth', authRouter);            /* registro, login, verificacion */
app.use('/api/usuario', userRouter);         /* consultas de usuarios (ej: listar docentes) */
app.use('/api/aula', aulaRouter);            /* CRUD de aulas (entidad principal) */
app.use('/api/alumno', alumnoRouter);        /* alta/baja de alumnos en aulas */
app.use('/api/asistencia', asistenciaRouter);/* registro de asistencia */
app.use('/api/entrevista', entrevistaRouter);/* solicitudes de entrevista de familias */

/* Levanto el servidor en el puerto definido en el .env */
app.listen(ENVIRONMENT.PORT, () => {
    console.log(`La app de Gestion Escolar (express) se ejecuta correctamente en el puerto ${ENVIRONMENT.PORT}`);
});
