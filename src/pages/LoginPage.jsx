import {React, useState} from 'react'
import './background.css'
import './login.css'
import { useLocation, useNavigate } from 'react-router-dom'

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
            const res = await fetch("http://localhost:5000/login", {
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
                onLoginSuccess(data.user_id)
                const fromPath = location.state?.from?.pathname || '/'
                navigate(fromPath, { replace: true })
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
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>

                <div>
                    <div className="flex justify-content-center align-items-center min-vh-100 w-full">
                        <div className="card shadow py-4 px-20 log-card">
                            <div className="centrar">
                                <div className="imapeque flex justify-center mb-3">
                                    <img src="src/assets/logoph.png" />
                                </div>
                            </div>

                            <div className="centrar mb-3 w-ful">
                                <button className='no-cuenta-a' type='button' onClick={() => goToRegister()}>¿No tienes cuenta?</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input id="email" type="email" className="form-control w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="mb-3">
                                    <input id="password" type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <div className="centrar mb-3">
                                    <a className='no-cuenta-a' href="#">Olvidé mi contraseña</a>
                                </div>

                                <button type="submit" className="btn btn-secondary w-100 mb-3" disabled={isLoading}>Iniciar sesión</button>
                                <h4 className="centrar mb-3">o</h4>
                                <button className="btn btn-secondary w-100 mb-2 flex justify-center" disabled={isLoading} type="button"><img src="src/assets/googlelogo.png" className="logosminis" />Continuar con Google</button>
                                <button className="btn btn-secondary w-100 mb-2 flex justify-center" disabled={isLoading} type="button"><img src="src/assets/githublogo.png" className="logosminis" />Continuar con GitHub</button>
                            </form>
                            {message && <p className="text-center mt-3">{message}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage