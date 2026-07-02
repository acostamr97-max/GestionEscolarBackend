import ServerError from '../helpers/serverError.helper.js'
import entrevistaRepository from '../repositories/entrevista.repository.js'
import userRepository from '../repositories/user.repository.js'
import mailer_transport from '../config/mailer.config.js'
import { ENVIRONMENT } from '../config/environment.config.js'
import { USER_ROLES, ENTREVISTA_ESTADOS, ENTREVISTA_ESTADOS_LIST } from '../const/roles.const.js'

/* Logica de negocio de Entrevista.
   La familia solicita una entrevista; le llega al director (y se le avisa por mail). */
class EntrevistaService {

    /* Intenta avisar por mail al director. No corta el flujo si el mail falla. */
    async #avisarDirectorPorMail(director, familia, fecha, motivo) {
        if (!director || !director.email) return
        try {
            await mailer_transport.sendMail({
                to: director.email,
                subject: "Nueva solicitud de entrevista",
                html: `
                    <h1>Nueva solicitud de entrevista</h1>
                    <p>La familia <strong>${familia.nombre}</strong> (${familia.email}) solicito una entrevista.</p>
                    <p><strong>Fecha propuesta:</strong> ${new Date(fecha).toLocaleString()}</p>
                    <p><strong>Motivo:</strong> ${motivo || 'Sin especificar'}</p>
                `
            })
        } catch (error) {
            console.error('No se pudo enviar el mail al director:', error.message)
        }
    }

    /* Crear una solicitud de entrevista. La hace un usuario con rol familia. */
    async create({ fecha, motivo }, user) {
        if (user.role !== USER_ROLES.FAMILIA) {
            throw new ServerError("Solo una familia puede solicitar una entrevista", 403)
        }
        if (!fecha) {
            throw new ServerError("Debe indicarse una fecha para la entrevista", 400)
        }

        /* Busco un director para asignarle la solicitud (tomo el primero disponible) */
        const directores = await userRepository.getByRole(USER_ROLES.DIRECTOR)
        const director = directores.length > 0 ? directores[0] : null

        const nueva = await entrevistaRepository.create({
            familia: user.id,
            director: director ? director._id : null,
            fecha: new Date(fecha),
            motivo: motivo || '',
            estado: ENTREVISTA_ESTADOS.PENDIENTE
        })

        /* Aviso por mail al director (no bloqueante) */
        const familia = await userRepository.getById(user.id)
        await this.#avisarDirectorPorMail(director, familia, fecha, motivo)

        return nueva
    }

    /* Listar todas las entrevistas (solo director) */
    async getAll() {
        return await entrevistaRepository.getAll()
    }

    /* Listar las entrevistas de la familia logueada */
    async getMine(user) {
        return await entrevistaRepository.getByFamilia(user.id)
    }

    /* El director cambia el estado (programada / cancelada) y/o la fecha */
    async updateEstado(entrevista_id, { estado, fecha }, user) {
        if (user.role !== USER_ROLES.DIRECTOR) {
            throw new ServerError("Solo el director puede gestionar entrevistas", 403)
        }

        const entrevista = await entrevistaRepository.getById(entrevista_id)
        if (!entrevista) {
            throw new ServerError("Entrevista no encontrada", 404)
        }

        const update_data = {}
        if (estado !== undefined) {
            if (!ENTREVISTA_ESTADOS_LIST.includes(estado)) {
                throw new ServerError("Estado invalido. Debe ser: " + ENTREVISTA_ESTADOS_LIST.join(', '), 400)
            }
            update_data.estado = estado
        }
        if (fecha !== undefined) {
            update_data.fecha = new Date(fecha)
        }

        if (Object.keys(update_data).length === 0) {
            throw new ServerError("Enviar al menos un campo para actualizar", 400)
        }

        return await entrevistaRepository.updateById(entrevista_id, update_data)
    }
}

const entrevistaService = new EntrevistaService()
export default entrevistaService
