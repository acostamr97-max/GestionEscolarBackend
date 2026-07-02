import mongoose from "mongoose"
import { USER_ROLES_LIST } from "../const/roles.const.js"

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: USER_ROLES_LIST,   
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    email_verificado: {
        type: Boolean,
        default: false,
        required: true
    },
    verificationToken: {
        type: String
    }
}, { timestamps: true });

export const USER_COLLECTION_NAME = 'User'
const User = mongoose.model(USER_COLLECTION_NAME, userSchema)

export default User
