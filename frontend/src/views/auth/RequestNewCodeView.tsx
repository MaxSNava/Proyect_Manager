import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { RequestConfirmationCodeForm } from '../../types'
import { useMutation } from '@tanstack/react-query'
import ErrorMessage from '@/components/ErrorMessage'
import { requestConfirmationCode } from '@/api/AuthAPI'
import { toast } from 'react-toastify'

export default function RequestNewCodeView() {
  const initialValues: RequestConfirmationCodeForm = { email: "", }

  const { register, handleSubmit, reset, formState: { errors }, } = useForm({ defaultValues: initialValues })

  const { mutate } = useMutation({
    mutationFn: requestConfirmationCode,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (data) => {
      toast.success(data)
      reset()
    },
  })

  const handleRequestCode = (formData: RequestConfirmationCodeForm) => mutate(formData)

  return (
    <>
      <h1 className="text-5xl font-black text-white">Solicitar Código de Confirmación</h1>
      <p className="text-2xl font-light text-white mt-5">Coloca tu e-mail para recibir <span className=" text-fuchsia-500 font-bold"> un nuevo código</span></p>

      <form className="space-y-8 p-10 rounded-lg bg-white mt-10" onSubmit={handleSubmit(handleRequestCode)} noValidate >
        <div className="flex flex-col gap-5">
          <label className="font-normal text-2xl" htmlFor="email">Email</label>
          <input
            className="w-full p-3 rounded-lg border-gray-300 border"
            id="email"
            type="email"
            placeholder="Email de Registro"
            {...register("email", {
              required: "El Email de registro es obligatorio",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "E-mail no válido",
              },
            })}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </div>

        <input className="bg-fuchsia-600 hover:bg-fuchsia-700 w-full p-3 rounded-lg text-white font-black  text-xl cursor-pointer" type="submit" value="Enviar Código"/>
      </form>

      <nav className="mt-10 flex flex-col space-y-4">
        <Link className="text-center text-gray-300 font-normal" to="/auth/login">¿Ya tienes cuenta? Iniciar Sesión</Link>
        <Link className="text-center text-gray-300 font-normal" to="/auth/forgot-password">¿Olvidaste tu contraseña? Reestablecer</Link>
      </nav>
    </>
  )
}
