import { React, useState } from 'react'
import './background.css'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Field, Fieldset, Input, Label, Legend,
} from '@headlessui/react'
import clsx from 'clsx'

function LoginPage({ onLoginSuccess }) {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    
    const goToRegister = () => {
        navigate('/register')
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch("http://192.168.0.4:5000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    'email': email,
                    'password': password
                })
            })
            const data = await res.json()
            if (res.ok) {
                setIsLoading(false)
                // console.log("Backend /login response data:", data)
                // console.log("UserId from backend login:", data.user_id)
                const fromPath = location.state?.from?.pathname || '/'
                onLoginSuccess(data.user_id, fromPath)
                setMessage("Inicio de sesión exitoso")
            } else {
                setIsLoading(false)
                setMessage(data.error || "Error de autenticación")
            }
        } catch (err) {
            setIsLoading(false)
            setMessage("Error interno del servidor o de conexión")
        }
    }

    return (
        <>
        <div className="background">
            <ul>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500 '></li >
            </ul>
        </div>
            <main className="grid justify-center px-4 items-center h-full register-container">
                <form onSubmit={handleSubmit} className="w-full  max-w-2xl">
                <div className="text-2xl text-center mb-2  font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">DevConnect</div>
                    <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
                        <Legend className="text-xl font-semibold text-white mb-4 ">Sign in to your account</Legend>
                        <p className='mb-3 text-gray-500 dark:text-gray-400'>Join our community of developers to get access of hunderds of projects and share your portfolio to the world.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <Field className='md:col-span-2'>
                                <Label className="text-sm font-medium text-white">Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputStyle}
                                    required
                                />
                            </Field>

                            <Field className='md:col-span-2'>
                                <Label className="text-sm font-medium text-white">Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputStyle}
                                    required
                                />
                            </Field>
                        </div>
                            <div className='justify-self-end grid md:grid-cols-[auto_auto] grid-cols-1 items-center w-full justify-end'>
                                <button
                                    type="button"
                                    className="mb-3 text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg mr-2 py-2"
                                    onClick={() => goToRegister()}
                                    >
                                    Don't have an account?
                                </button>
                                <button
                                    type="submit"
                                    className=" text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                    >
                                    Sing in 
                                </button>

                            </div>
                            {message ? <p className="text-sm justify-self-start text-red-500">{message}</p> : <p> </p>}
                    </Fieldset>
                </form>
            </main>
        </>
    )
}

const inputStyle = clsx(
    'mt-2 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm text-white',
    'focus:outline-none focus:ring-2 focus:ring-white/25'
)

export default LoginPage