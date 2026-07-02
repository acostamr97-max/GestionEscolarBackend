import userRepository from '../repositories/user.repository.js'
import { USER_ROLES } from '../const/roles.const.js'

class UserService {

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
