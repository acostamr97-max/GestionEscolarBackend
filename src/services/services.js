/*  (Lógica de negocio: hashing con bcrypt y generación de tokens)*/
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { sendVerificationEmail } = require('../utils/email');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) throw new Error('El email ya está registrado');

    // Hashing de contraseña con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Token único de activación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword,
      verificationToken
    });

    // Envío de email para verificación
    await sendVerificationEmail(newUser.email, verificationToken);
    return { message: 'Registro exitoso. Revisa tu email para verificar la cuenta.' };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');
    if (!user.isVerified) throw new Error('Por favor, verifica tu cuenta vía email antes de ingresar');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Credenciales inválidas');

    // Generación de JWT con expiración
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    return { token, user: { id: user._id, name: user.name, role: user.role } };
  }

  async verify(token) {
    const user = await userRepository.findByToken(token);
    if (!user) throw new Error('Token de verificación inválido');

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return { message: 'Cuenta verificada correctamente' };
  }
}

module.exports = new AuthService();