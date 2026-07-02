import User from "../models/user.model.js"
import Aula from "../models/aula.model.js"
import { USER_ROLES } from "../const/roles.const.js"

/* ============================================================================
   UserRepository: capa de ACCESO A DATOS de los usuarios.

   Es la unica capa que habla directamente con la base (a traves del modelo
   User de Mongoose). Aca van solo las queries: buscar, crear, actualizar,
   borrar. NADA de logica de negocio ni validaciones (eso va en services o
   controllers). La idea es que si el dia de maniana se cambia de base de datos,
   solo haya que tocar esta capa.
   ============================================================================ */
class UserRepository {

    /* Busca un usuario por su id de Mongo */
    async getById(user_id) {
        return await User.findById(user_id)
    }

    /* Crea un usuario. Recibe el rol y el token de verificacion ademas de los
       datos basicos. El usuario se crea con email_verificado=false (default). */
    async create(nombre, email, password, role, verificationToken) {
        return await User.create({ nombre, email, password, role, verificationToken })
    }

    /* Busca por email, solo entre usuarios activos.
       Se usa en login (para encontrar la cuenta) y en register (para evitar
       emails duplicados). */
    async getByEmail(email) {
        const user_found = await User.findOne({ email: email, activo: true })
        return user_found
    }

    /* Busca un usuario por su token de verificacion de email */
    async getByVerificationToken(token) {
        return await User.findOne({ verificationToken: token })
    }

    /* Devuelve todos los usuarios de un rol dado (ej: todos los directores).
       Se usa al crear una entrevista para encontrar a quien asignarsela. */
    async getByRole(role) {
        return await User.find({ role: role, activo: true })
    }

    async getDocentesDisponibles() {
    
    const idsConAula = await Aula.distinct('docente', { activo: true })

    return await User.find({
        role: USER_ROLES.DOCENTE,
        activo: true,
        _id: { $nin: idsConAula }
    })      
}

    /* Elimina un usuario de forma definitiva (borrado fisico) */
    async deleteById(user_id) {
        await User.findByIdAndDelete(user_id)
    }

    /* Actualiza campos de un usuario. update_data es un objeto con los campos
       a modificar (ej: { email_verificado: true }). */
    async updateById(user_id, update_data) {
        await User.findByIdAndUpdate(user_id, update_data)
    }
}

const userRepository = new UserRepository()

export default userRepository
