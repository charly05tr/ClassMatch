import React from 'react'
import './background.css'
import {
    Field, Fieldset, Input, Label, Legend,
} from '@headlessui/react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

const RegisterPage = () => {
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
            const res = await fetch('https://api.devconnect.network/users/register', {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    first_name: firstName
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage('Successfully registered')
                window.location.href = '/'
            } else {
                setMessage(data.error || 'Error at registration')
            }
        } catch (err) {
            setMessage('Internal server or connection error')
        }
    }

    return (
        <>
        <div className='background'>
            <ul>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
                <li className='animated-div bg-gradient-to-br from-purple-600 to-blue-500'></li>
            </ul>
        </div>
            <main className="grid justify-center px-4 items-center h-full register-container">
                <form onSubmit={handleSubmit} className="w-full max-w-5xl">
                <div className="text-2xl text-center mb-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-500">DevConnect</div>
                    <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
                        <Legend className="text-xl font-semibold text-white mb-4">Create an account</Legend>
                        <p className='mb-3 text-gray-500 dark:text-gray-400'>Join our community of developers to get access of hunderds of projects and share your portfolio to the world.</p>

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

                            <Field className='md:col-span-2'>
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
                        <div className="grid mt-4 md:grid-cols-[auto_auto] grid-cols-1 items-center justify-between w-full">
                            {message ? <p className="text-sm justify-self-start text-red-500">{message}</p> : <p> </p>}
                            <div className='justify-self-end w-full'>
                                <button
                                    type="button"
                                    className=" mb-3 text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg mr-2 py-2"
                                    onClick={() => goToLogin()}
                                >
                                    Already have an account?
                                </button>
                                <button
                                    disabled={password !== confirmation}
                                    type="submit"
                                    className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                >
                                    Create account
                                </button>

                            </div>
                        </div>
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

export default RegisterPage