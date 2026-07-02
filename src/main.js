import { ENVIRONMENT } from "./config/environment.config.js";
import dns from 'dns'
import connectMongoDB from './config/mongodb.config.js'
import express from 'express'
import cors from 'cors'
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import aulaRouter from "./routes/aula.route.js";
import alumnoRouter from "./routes/alumno.route.js";
import asistenciaRouter from "./routes/asistencia.route.js";
import entrevistaRouter from "./routes/entrevista.route.js";

if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB()

const app = express()


app.use(cors())              
app.use(express.json())      
app.get('/api/test', (request, response) => {
    console.log("Llego una consulta de test")
    response.send("Respuesta de prueba");
});


app.use('/api/auth', authRouter);            
app.use('/api/usuario', userRouter);         
app.use('/api/aula', aulaRouter);            
app.use('/api/alumno', alumnoRouter);        
app.use('/api/asistencia', asistenciaRouter);
app.use('/api/entrevista', entrevistaRouter);

app.listen(ENVIRONMENT.PORT, () => {
    console.log(`La app de Gestion Escolar (express) se ejecuta correctamente en el puerto ${ENVIRONMENT.PORT}`);
});
