import 'dotenv/config';
import { ENVIRONMENT } from "./environment.config.js";
import mongoose from "mongoose"

/* Conexion a MongoDB (Railway). */

function construirOpciones(uri) {
    const opciones = {}

    if (!/authSource=/.test(uri)) {
        opciones.authSource = 'admin'
    }

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
