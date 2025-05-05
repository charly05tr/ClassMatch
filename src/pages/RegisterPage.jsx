import React from 'react'
import {
    Field, Fieldset, Input, Label, Legend,
} from '@headlessui/react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

const RegisterPage = () => {
    const [userName, setUserName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmation, setConfirmation] = React.useState('')
    const [message, setMessage] = React.useState('')
    const [name, setName] = React.useState('')
    const [firstName, setFirstName] = React.useState('')
    const navigate = useNavigate()

    const goToLogin = () => {
        navigate('/login')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:5000/register', {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_name: userName,
                    email,
                    password,
                    name,
                    first_name: firstName
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage('Successfully registered')
                window.location.href = "/"
            } else {
                setMessage(data.error || 'Error at registration')
            }
        } catch (err) {
            setMessage('Internal server or connection error')
        }
    }

    return (
        <main className="flex justify-center pt-10 px-4 align-cente mt-20">
            <form onSubmit={handleSubmit} className="w-full max-w-5xl mt-10">
                <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
                    <Legend className="text-xl font-semibold text-white mb-4">Register</Legend>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                            <Label className="text-sm font-medium text-white">First Name</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </Field>

                        <Field>
                            <Label className="text-sm font-medium text-white">Last Name</Label>
                            <Input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </Field>

                        <Field>
                            <Label className="text-sm font-medium text-white">Username</Label>
                            <Input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </Field>

                        <Field>
                            <Label className="text-sm font-medium text-white">Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </Field>

                        <Field>
                            <Label className="text-sm font-medium text-white">Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </Field>

                        <Field>
                            <Label className="text-sm font-medium text-white">Confirm Password</Label>
                            <Input
                                type="password"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                className={inputStyle}
                                required
                            />
                        </Field>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg px-4 py-2 mr-2"
                            onClick={() => goToLogin()}
                        >
                            Already have an account?
                        </button>
                        <button
                            disabled={password !== confirmation}
                            type="submit"
                            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                        >
                            Register
                        </button>
                    </div>
                    {message && <p className="text-sm mt-3 text-red-500">{message}</p>}
                </Fieldset>
            </form>
        </main>
    )
}

const inputStyle = clsx(
    'mt-2 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm text-white',
    'focus:outline-none focus:ring-2 focus:ring-white/25'
)

export default RegisterPage