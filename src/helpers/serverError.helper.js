
class ServerError extends Error {
    constructor(message, status) {
        super(message)        /* setea el .message del Error */
        this.status = status  /* codigo HTTP asociado al error */
    }
}

export default ServerError
