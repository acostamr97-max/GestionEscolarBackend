import 'dotenv/config';
import { ENVIRONMENT } from "./environment.config.js";
import mongoose from "mongoose"

/* Conexion a MongoDB (Railway).
   La idea es que funcione pegando la MONGO_PUBLIC_URL de Railway tal cual,
   sin tener que editar la URL a mano.

   - Si la URL ya trae el nombre de la base y/o authSource, no los pisamos.
   - Si NO trae authSource, agregamos authSource=admin, que es donde Railway
     da de alta al usuario root de Mongo (sin esto suele dar
     "Authentication failed", code 18).
   - El nombre de la base lo pasamos por la opcion dbName solo si la URL no
     trae uno propio. */

function construirOpciones(uri) {
    const opciones = {}

    /* Detecta si la URL ya define authSource. Si no, lo agregamos. */
    if (!/authSource=/.test(uri)) {
        opciones.authSource = 'admin'
    }

    /* Detecta si la URL ya trae un nombre de base despues del host
       (algo como .../gestion_escolar). El patron busca una barra seguida
       de texto despues del puerto. Si no hay, usamos MONGO_DB_NAME. */
    const tieneBaseEnUri = /\/[^/?]+(\?|$)/.test(uri.replace(/^mongodb(\+srv)?:\/\//, ''))
    if (!tieneBaseEnUri && ENVIRONMENT.MONGO_DB_NAME) {
        opciones.dbName = ENVIRONMENT.MONGO_DB_NAME
    }

    return opciones
}

const connectMongoDB = async () => {
    const uri = ENVIRONMENT.MONGO_DB_CONNECTION_STRING

    if (!uri) {
        console.error("Falta MONGO_DB_CONNECTION_STRING en el .env")
        process.exit(1)
    }

    try {
        const opciones = construirOpciones(uri)
        await mongoose.connect(uri, opciones)
        console.log("Conexion a MongoDB exitosa. Base:", mongoose.connection.name)
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error.message)
        process.exit(1)
    }
}

export default connectMongoDB
