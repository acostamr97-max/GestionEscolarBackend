import User from "../models/user.model.js"
import Aula from "../models/aula.model.js"
import { USER_ROLES } from "../const/roles.const.js"

class UserRepository {

    async getById(user_id) {
        return await User.findById(user_id)
    }

    async create(nombre, email, password, role, verificationToken) {
        return await User.create({ nombre, email, password, role, verificationToken })
    }

    async getByEmail(email) {
        const user_found = await User.findOne({ email: email, activo: true })
        return user_found
    }

    async getByVerificationToken(token) {
        return await User.findOne({ verificationToken: token })
    }

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

    async deleteById(user_id) {
        await User.findByIdAndDelete(user_id)
    }

    async updateById(user_id, update_data) {
        await User.findByIdAndUpdate(user_id, update_data)
    }
}

const userRepository = new UserRepository()

export default userRepository
