/* ============================================================================
   ServerError: error personalizado para manejar errores "esperados" de la app.

   Extiende la clase Error nativa de JavaScript y le agrega un campo "status",
   que es el codigo HTTP que queremos devolver (400, 401, 403, 404, etc.).

   Por que usarlo:
   En vez de devolver siempre un 500 generico, en los services/controllers
   lanzamos por ejemplo:  throw new ServerError("Aula no encontrada", 404)
   y en el catch detectamos "si es instancia de ServerError, uso SU status y
   mensaje". Asi el cliente recibe un error claro y con el codigo correcto.
   ============================================================================ */
class ServerError extends Error {
    constructor(message, status) {
        super(message)        /* setea el .message del Error */
        this.status = status  /* codigo HTTP asociado al error */
    }
}

export default ServerError
