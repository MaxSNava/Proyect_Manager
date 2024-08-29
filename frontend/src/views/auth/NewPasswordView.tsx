import NewPasswordToken from '@/components/auth/NewPasswordToken'
import NewPasswordForm from '@/components/auth/NewPasswordForm'
import { useState } from 'react'
import { ConfirmToken } from '@/types/index'

export default function NewPasswordView() {
  const [token, setToken] = useState<ConfirmToken['token']>('')
  const [isValidateToken, setIsValidateToken] = useState(false)

  return (
    <>
      <h1 className="text-5xl font-black text-white">Restablecer Contraseña</h1>
      <p className="text-2xl font-light text-white mt-5">Ingresa el codigo que recibiste<span className=" text-fuchsia-500 font-bold"> en tu correo</span></p>


      {!isValidateToken ? <NewPasswordToken token={token} setToken={setToken} setIsValidateToken={setIsValidateToken} / > : <NewPasswordForm token={token} />}
    </>
  )
}
