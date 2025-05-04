import React from 'react'
import './background.css'
import './login.css'
import { useNavigate } from 'react-router-dom'

function LoginPage() {

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [message, setMessage] = React.useState('')
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
                setMessage("Inicio de sesión exitoso")
                window.location.href = "/"
            } else {
                setMessage(data.error || "Error de autenticación")
            }
        } catch (err) {
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
                    <div className="container d-flex justify-content-center align-items-center min-vh-100">
                        <div className="card shadow p-4 log-card">
                            <div className="centrar">
                                <div className="imapeque flex justify-center mb-3">
                                    <img src="src/assets/logoph.png" />
                                </div>
                            </div>

                            <div className="centrar mb-3">
                                <button className='no-cuenta-a' type='button' onClick={() => goToRegister()}>¿No tienes cuenta?</button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input id="email" type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="mb-3">
                                    <input id="password" type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <div className="centrar mb-3">
                                    <a className='no-cuenta-a' href="#">Olvidé mi contraseña</a>
                                </div>

                                <button type="submit" className="btn btn-secondary w-100 mb-3">Iniciar sesión</button>
                                <h4 className="centrar mb-3">o</h4>
                                <button className="btn btn-secondary w-100 mb-2 flex justify-center" type="button"><img src="src/assets/googlelogo.png" className="logosminis" />Continuar con Google</button>
                                <button className="btn btn-secondary w-100 mb-2 flex justify-center" type="button"><img src="src/assets/githublogo.png" className="logosminis" />Continuar con GitHub</button>
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