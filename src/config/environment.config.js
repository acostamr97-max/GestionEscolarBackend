import dotenv from 'dotenv';

/* dotenv.config() lee el archivo .env y carga sus valores en process.env.
   Tiene que llamarse antes de usar cualquier variable de entorno. */
dotenv.config()

/* ============================================================================
   ENVIRONMENT: centraliza todas las variables de entorno en un solo objeto.

   En vez de andar usando process.env.X por todo el codigo, las leemos una vez
   aca y despues importamos ENVIRONMENT donde haga falta. Ventajas:
     - Un solo lugar para ver que variables necesita el proyecto.
     - Si una cambia de nombre, se toca un solo archivo.

   Estas variables se definen en el archivo .env (que NO se sube al repo).
   ============================================================================ */
export const ENVIRONMENT = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING, /* URL de conexion a Mongo (Railway) */
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,                           /* nombre de la base de datos */
    MODE: process.env.MODE,                                            /* 'development' o 'production' */
    PORT: process.env.PORT,                                            /* puerto donde corre la API */
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,                        /* (ya no se usa: migramos a Resend) cuenta de Gmail */
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,                        /* (ya no se usa: migramos a Resend) App Password */
    RESEND_API_KEY: process.env.RESEND_API_KEY,                        /* clave de la API de Resend (envio de mails) */
    URL_BACKEND: process.env.URL_BACKEND,                             /* URL publica del backend (links de mail) */
    URL_FRONTEND: process.env.URL_FRONTEND,                           /* URL del frontend (redireccion post-verificacion) */
    JWT_SECRET: process.env.JWT_SECRET                                /* secreto para firmar/verificar los JWT */
}
