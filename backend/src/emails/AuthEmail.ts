import { transporter } from '../config/nodemailer'

interface IEmail {
  email: string
  name: string
  token: string
}

export class AuthEmail {

  static sendConfirmationEmail = async (user : IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Confirma tu cuenta',
      text: 'Confirma tu cuenta de UpTask',
      html: `<h1>Hola: ${user.name}, has creado tu cuenta en UpTask</h1>
        <p>Tu token de confirmación es: <strong>${user.token}</strong></p>
        <p>Para confirmar tu cuenta haz click en el siguiente enlace</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
        <p>Ese token expira en 10 minutos</p>
      `
    })
  }

  static sendPasswordResetToken = async (user : IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Restablece tu contraseña',
      text: 'Restablece tu contraseña de UpTask',
      html: `<h1>Hola: ${user.name}, has solicitado restablecer tu contraseña</h1>
        <p>Tu token de confirmación es: <strong>${user.token}</strong></p>
        <p>Para restablecer tu contraseña haz click en el siguiente enlace</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer contraseña</a>
        <p>Ese token expira en 10 minutos</p>
      `
    })
  }

}