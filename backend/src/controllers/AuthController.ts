import type { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {

  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body
      //**Prevenir duplicados */
      const userExists = await User.findOne({ email })
      if (userExists) {
        const error = new Error('El email ya está en uso')
        return res.status(409).json({error: error.message})
      }
      //** Crea un usuario */
      const user = new User(req.body)
      //** Hash Password */
      user.password = await hashPassword(password)
      //** Generar el token */
      const token = new Token()
      token.token = generateToken()
      token.user = user.id
      //** Enviar el E-mail */
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })
      //// Guarda el usuario y el token */
      await Promise.allSettled([user.save(), token.save()])
      res.send('Cuenta creada, revisa tu email para confirmarla')
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror al crear la cuenta'})
    }
  }

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body
      //** Confirmar que el token exista*/
      const tokenExists = await Token.findOne({ token })
      if (!tokenExists) {
        const error = new Error('El token no es válido')
        return res.status(404).json({error: error.message})
      }
      //** Confirmar la cuenta */
      const user = await User.findById(tokenExists.user)
      user.confirmed = true
      //** Eliminar el token y actualizar usuario */
      await Promise.allSettled([user.save(), tokenExists.deleteOne()])
      res.send('Cuenta confirmada correctamente')
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror al crear la cuenta'})
    }
  }

  static loging = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      //** Buscar si el usuario existe */
      const user = await User.findOne({ email })
      if (!user) {
        const error = new Error('El Usuario no existe')
        return res.status(404).json({error: error.message})
      }
      //** Comparar si esta confirmado */
      if (!user.confirmed) {
        const token = new Token()
        token.user = user.id
        token.token = generateToken()
        await token.save()
        // Enviar el email de confirmación
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token
        })
        // Enviar un mensaje de error
        const error = new Error('La cuenta no ha sido confirmada, hemos enviado un correo revisa tu email')
        return res.status(401).json({error: error.message})
      }
      //** Comparar la contraseña */
      const isPasswordCorrect = await checkPassword(password, user.password)
      if (!isPasswordCorrect) {
        const error = new Error('La contraseña es incorrecta')
        return res.status(401).json({error: error.message})
      }
      const token = generateJWT({id: user.id})
      
      res.send(token)
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror al crear la cuenta'})
    }
  }

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        const error = new Error('El usuario no esta registrado')
        return res.status(404).json({error: error.message})
      }
      if (user.confirmed) {
        const error = new Error('El usuario ya esta confirmado')
        return res.status(403).json({error: error.message})
      }
      const token = new Token()
      token.token = generateToken()
      token.user = user.id
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })
      await Promise.allSettled([user.save(), token.save()])
      res.send('Se ha enviado un nuevo código de confirmación a tu email')
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror'})
    }
  }

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        const error = new Error('El usuario no esta registrado')
        return res.status(404).json({error: error.message})
      }

      const token = new Token()
      token.token = generateToken()
      token.user = user.id
      await token.save()
      // Enviar el email de confirmación
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token
      })
      res.send('Se ha enviado un email con instrucciones para restablecer tu contraseña')
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror'})
    }
  }

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body
      //
      const tokenExists = await Token.findOne({ token })
      if (!tokenExists) {
        const error = new Error('El token no es válido')
        return res.status(404).json({error: error.message})
      }
      res.send('Token válido, Define tu nueva contraseña')
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror al crear la cuenta'})
    }
  }

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params
      //
      const tokenExists = await Token.findOne({ token })
      if (!tokenExists) {
        const error = new Error('El token no es válido')
        return res.status(404).json({error: error.message})
      }
      // Consultar el usuario
      const user = await User.findById(tokenExists.user)
      user.password = await hashPassword(req.body.password)
      // Eliminar el token y actualizar usuario
      await Promise.allSettled([user.save(), tokenExists.deleteOne()])
      res.send('El password ha sido actualizado correctamente')
    } catch (error) {
      res.status(500).json({error: 'Hubo un errror al crear la cuenta'})
    }
  }

  static getUser = async (req: Request, res: Response) => {
    return res.send(req.user)
  }

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body
    const userExists = await User.findOne({email})
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error('El email ya está en uso')
      return res.status(409).json({error: error.message})
    }
    req.user.name = name
    req.user.email = email
    try {
      await req.user.save()
      res.send('Perfil actualizado correctamente') 
    } catch (error) {
      res.status(500).send('Hubo un error al actualizar el perfil')
    }
  }

  static updatePassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body
    const user = await User.findById(req.user.id)
    const isPasswordCorrect = await checkPassword(current_password, user.password)
    if (!isPasswordCorrect) {
      const error = new Error('La contraseña actual es incorrecta')
      return res.status(401).json({error: error.message})
    }
    try {
      user.password = await hashPassword(password)
      await user.save()
      res.send('Contraseña actualizada correctamente')
    } catch (error) {
      res.status(500).send('Hubo un error')
    }
  }

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body
    const user = await User.findById(req.user.id)
    const isPasswordCorrect = await checkPassword(password, user.password)
    if (!isPasswordCorrect) {
      const error = new Error('La contraseña es incorrecta')
      return res.status(401).json({error: error.message})
    }
    res.send('La contraseña es correcta')
  }

}