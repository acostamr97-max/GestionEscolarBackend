import userRepository from '../repositories/user.repository.js'
import { USER_ROLES } from '../const/roles.const.js'

/* ============================================================================
   UserService: logica de negocio relacionada a los usuarios (mas alla del auth).
   Por ahora se usa para listar usuarios por rol, principalmente para poder
   asignar un docente a un aula desde el frontend (el director necesita ver la
   lista de docentes y sus ids).
   ============================================================================ */
class UserService {

    /* Devuelve todos los usuarios con rol 'docente'.
       El repository ya filtra por activos. Lo usa el director al crear/editar
       un aula, para elegir a quien asignarle el aula. */
    async getDocentes() {
        return await userRepository.getByRole(USER_ROLES.DOCENTE)
    }

    async getDocentesDisponibles() {
        return await userRepository.getDocentesDisponibles()
    }

    async getByEmail(email) {
        return await userRepository.getByEmail(email)
    }

    async create(nombre, email, hashed_password, role, verification_token) {
        return await userRepository.create(nombre, email, hashed_password, role, verification_token);
    }

    async updateById(userId, updateData) {
        return await userRepository.updateById(userId, updateData);
    }

    async getById(userId) {
        return await userRepository.getById(userId);
    }
}

const userService = new UserService()
export default userService
